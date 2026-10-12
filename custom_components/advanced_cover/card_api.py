"""WebSocket API for the Lovelace card.

Deliberately separate from ``websocket`` (the panel API): the panel is an admin
configuration surface, the card is a dashboard control every household member
sees. The snapshot here carries today's plan and the live state of covers and
scenarios, but none of the configuration behind them (conditions, low-mode
wiring, safety settings), and it is open to non-admin users — exactly like the
switches, sensors and services this integration already exposes.

Everything user-visible is sent as raw data (ISO timestamps, positions, result
codes) and formatted in the frontend, so times and labels follow each user's
own locale instead of the server's.
"""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util

from .capabilities import get_cover_capabilities
from .const import CARD_API_REGISTERED_KEY, CARD_LOG_SIZE, DOMAIN, WEEKDAYS
from .coordinator import AdvancedCoverCoordinator
from .executor import current_cover_position
from .models import CoverItem, EntryData, Scenario
from .scheduler import AdvancedCoverScheduler
from .websocket import (
    _domain_entries,
    _enrich_occurrence,
    _resolved_contact,
    _safety_blocked_now,
    _sun_times,
    async_drive_cover,
)

_LOGGER = logging.getLogger(__name__)

WS_ENTRIES = f"{DOMAIN}/card/entries"
WS_SUBSCRIBE = f"{DOMAIN}/card/subscribe"
WS_ACTION = f"{DOMAIN}/card/action"

ACTION_RUN_SCENARIO = "run_scenario"
ACTION_SET_ENABLED = "set_enabled"
ACTION_COVER = "cover"
CARD_ACTIONS = (ACTION_RUN_SCENARIO, ACTION_SET_ENABLED, ACTION_COVER)
# No "position" here: the card offers open/stop/close, the slider lives in
# the cover entity's own more-info dialog.
COVER_COMMANDS = ("open", "close", "stop")

ERR_AMBIGUOUS = "ambiguous_entry"

Runtime = tuple[AdvancedCoverCoordinator, AdvancedCoverScheduler]


# --------------------------------------------------------------------------
# lookups
# --------------------------------------------------------------------------


def _resolve(hass: HomeAssistant, entry_id: str | None) -> Runtime | None:
    """Resolve the requested entry, or auto-pick when there is exactly one.

    Auto-picking is what makes a bare ``type: custom:advanced-cover-card``
    work; with several entries the card must name one.
    """
    entries = _domain_entries(hass)
    data: dict[str, Any] | None = None
    if entry_id:
        data = entries.get(entry_id)
    elif len(entries) == 1:
        data = next(iter(entries.values()))
    if data is None:
        return None
    return data["coordinator"], data["scheduler"]


def _not_found(hass: HomeAssistant, connection: Any, msg: dict[str, Any]) -> None:
    """Explain *why* nothing resolved — none configured, or too many to guess."""
    if _domain_entries(hass) and not msg.get("entry_id"):
        connection.send_error(msg["id"], ERR_AMBIGUOUS, "Several entries; pick one")
        return
    connection.send_error(
        msg["id"], websocket_api.ERR_NOT_FOUND, "No Advanced Cover entry"
    )


def _entity_id(
    hass: HomeAssistant, entry_id: str, platform: str, suffix: str
) -> str | None:
    """Entity id of one of this entry's own entities (for more-info)."""
    return er.async_get(hass).async_get_entity_id(
        platform, DOMAIN, f"{entry_id}_{suffix}"
    )


# --------------------------------------------------------------------------
# snapshot
# --------------------------------------------------------------------------


def _cover_row(
    hass: HomeAssistant, scheduler: AdvancedCoverScheduler, cover: CoverItem
) -> dict[str, Any]:
    """Live state of one cover — what the card's control list shows."""
    caps = get_cover_capabilities(hass, cover.cover_entity_id)
    state = hass.states.get(cover.cover_entity_id)
    return {
        "id": cover.id,
        "name": cover.name,
        "kind": cover.kind,
        "area_id": cover.area_id,
        "entity_id": cover.cover_entity_id,
        "enabled": cover.enabled,
        "available": caps.available,
        "position": current_cover_position(state),
        "contact_state": _resolved_contact(hass, cover),
        "safety_blocked": _safety_blocked_now(hass, cover),
        "next_action": scheduler.next_action_for_cover(cover.id),
    }


def _scenario_row(data: EntryData, scenario: Scenario, weekday: str) -> dict[str, Any]:
    """One scenario as the card's run list shows it."""
    today = dt_util.now().date()
    assignments = [a for a in scenario.assignments if a.cover_item_id in data.covers]
    return {
        "id": scenario.id,
        "name": scenario.name,
        "enabled": scenario.enabled,
        "trigger": scenario.trigger.to_dict(),
        # Whether today's plan can hold it at all (weekday + time of year).
        "scheduled_today": (
            scenario.enabled
            and weekday in scenario.weekdays
            and scenario.active_on(today)
        ),
        "cover_ids": [a.cover_item_id for a in assignments],
        # Distinct targets: assignments may override the scenario's position.
        "positions": sorted(
            {a.resolved_action(scenario.action).position for a in assignments}
        ),
        "has_conditions": bool(
            scenario.conditions or any(a.extra_conditions for a in assignments)
        ),
    }


def _snapshot(
    hass: HomeAssistant,
    coordinator: AdvancedCoverCoordinator,
    scheduler: AdvancedCoverScheduler,
) -> dict[str, Any]:
    """Card state for one entry."""
    data = coordinator.data_model
    entry_id = coordinator.config_entry.entry_id
    now = dt_util.now()
    now_iso = now.isoformat()
    weekday = WEEKDAYS[now.weekday()]
    return {
        "entry_id": entry_id,
        "name": data.config.name,
        "enabled": data.config.enabled,
        "now": now_iso,
        "sun": _sun_times(hass),
        "master_entity_id": _entity_id(hass, entry_id, "switch", "master"),
        "next_run_entity_id": _entity_id(hass, entry_id, "sensor", "next_run"),
        "covers": [_cover_row(hass, scheduler, c) for c in data.covers.values()],
        "scenarios": [_scenario_row(data, s, weekday) for s in data.scenarios],
        "plan": [
            _enrich_occurrence(hass, data, occ.to_dict(), now_iso)
            for occ in coordinator.day_plan
        ],
        "log": list(coordinator.action_log)[:CARD_LOG_SIZE],
    }


# --------------------------------------------------------------------------
# websocket commands
# --------------------------------------------------------------------------


@websocket_api.websocket_command({vol.Required("type"): WS_ENTRIES})
@callback
def ws_entries(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List entries so the card editor can offer a picker."""
    connection.send_result(
        msg["id"],
        [
            {
                "entry_id": entry_id,
                "name": data["coordinator"].data_model.config.name,
            }
            for entry_id, data in _domain_entries(hass).items()
        ],
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_SUBSCRIBE,
        vol.Optional("entry_id"): cv.string,
    }
)
@callback
def ws_subscribe(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Push a fresh snapshot whenever the plan or a referenced entity changes."""
    runtime = _resolve(hass, msg.get("entry_id"))
    if runtime is None:
        _not_found(hass, connection, msg)
        return
    coordinator, scheduler = runtime

    @callback
    def _push() -> None:
        connection.send_message(
            websocket_api.event_message(
                msg["id"], _snapshot(hass, coordinator, scheduler)
            )
        )

    connection.subscriptions[msg["id"]] = coordinator.async_add_listener(_push)
    connection.send_result(msg["id"])
    _push()


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_ACTION,
        vol.Optional("entry_id"): cv.string,
        vol.Required("action"): vol.In(CARD_ACTIONS),
        vol.Optional("scenario_id"): cv.string,
        vol.Optional("ignore_conditions", default=False): cv.boolean,
        vol.Optional("enabled"): cv.boolean,
        vol.Optional("cover_item_id"): cv.string,
        vol.Optional("command"): vol.In(COVER_COMMANDS),
    }
)
@websocket_api.async_response
async def ws_action(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Run the card's controls.

    Open to non-admin users on purpose: every action here has an equivalent
    switch, cover entity or service that a regular Home Assistant user may
    already call, so gating the card would only push people to the uglier
    route.
    """
    runtime = _resolve(hass, msg.get("entry_id"))
    if runtime is None:
        _not_found(hass, connection, msg)
        return
    coordinator, scheduler = runtime
    action = msg["action"]

    def _invalid(text: str) -> None:
        connection.send_error(msg["id"], websocket_api.ERR_INVALID_FORMAT, text)

    try:
        if action == ACTION_RUN_SCENARIO:
            scenario_id = msg.get("scenario_id")
            if not scenario_id:
                _invalid("scenario_id is required")
                return
            await scheduler.async_run_scenario(
                scenario_id, ignore_conditions=msg["ignore_conditions"]
            )
        elif action == ACTION_SET_ENABLED:
            if "enabled" not in msg:
                _invalid("enabled is required")
                return
            coordinator.data_model.config.enabled = msg["enabled"]
            await coordinator.async_save_and_notify()
        else:
            cover = coordinator.cover_by_id(msg.get("cover_item_id", ""))
            if cover is None:
                connection.send_error(
                    msg["id"], websocket_api.ERR_NOT_FOUND, "Unknown cover item"
                )
                return
            if "command" not in msg:
                _invalid("command is required")
                return
            await async_drive_cover(hass, cover, msg["command"])
    except ValueError as err:
        connection.send_error(msg["id"], websocket_api.ERR_NOT_FOUND, str(err))
        return
    except HomeAssistantError as err:
        connection.send_error(msg["id"], websocket_api.ERR_UNKNOWN_ERROR, str(err))
        return

    connection.send_result(msg["id"], {"success": True})
    _LOGGER.debug("Card action %s on %s", action, coordinator.config_entry.entry_id)


@callback
def async_register_card_api(hass: HomeAssistant) -> None:
    """Register the card's websocket commands once per HA lifetime."""
    if hass.data.get(CARD_API_REGISTERED_KEY):
        return
    websocket_api.async_register_command(hass, ws_entries)
    websocket_api.async_register_command(hass, ws_subscribe)
    websocket_api.async_register_command(hass, ws_action)
    hass.data[CARD_API_REGISTERED_KEY] = True
    _LOGGER.debug("Registered Advanced Cover card API")
