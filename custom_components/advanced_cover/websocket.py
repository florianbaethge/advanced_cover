"""WebSocket API for the custom panel (admin only)."""

from __future__ import annotations

import logging
from collections.abc import Callable
from datetime import timedelta
from typing import Any

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.components.cover import (
    ATTR_POSITION,
    SERVICE_CLOSE_COVER,
    SERVICE_OPEN_COVER,
    SERVICE_SET_COVER_POSITION,
    SERVICE_STOP_COVER,
)
from homeassistant.components.cover import (
    DOMAIN as COVER_DOMAIN,
)
from homeassistant.const import ATTR_ENTITY_ID
from homeassistant.core import Context, HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.sun import get_astral_event_date
from homeassistant.util import dt as dt_util

from .capabilities import (
    default_contact_map,
    default_kind_for_state,
    get_cover_capabilities,
    resolve_contact_state,
)
from .const import (
    CONTACT_OPEN,
    CONTACT_TILTED,
    DOMAIN,
    SAFETY_MODE_CLAMP,
    SAFETY_MODE_IGNORE,
    SCRIPT_DOMAIN,
    SUN_ENTITY_ID,
)
from .coordinator import AdvancedCoverCoordinator
from .engine import (
    SCOPE_ASSIGNMENT,
    SCOPE_SCENARIO,
    VERDICT_WOULD_RUN,
    CoverContext,
    SunContext,
    disabled_condition_eval,
    evaluate_conditions_detailed,
    rollup_preflight,
    safety_clamp_eval,
    safety_condition_eval,
    safety_ignore_eval,
    safety_would_block,
    split_cover_scoped,
)
from .executor import current_cover_position
from .models import (
    Condition,
    CoverItem,
    EntryConfig,
    EntryData,
    Scenario,
    Trigger,
    new_id,
)
from .scheduler import AdvancedCoverScheduler

_LOGGER = logging.getLogger(__name__)

ERR_NOT_FOUND = "not_found"


def _domain_entries(hass: HomeAssistant) -> dict[str, dict[str, Any]]:
    """All loaded entry runtime dicts."""
    return {
        k: v
        for k, v in hass.data.get(DOMAIN, {}).items()
        if isinstance(v, dict) and "coordinator" in v
    }


def _get_runtime(
    hass: HomeAssistant, entry_id: str | None
) -> tuple[AdvancedCoverCoordinator, AdvancedCoverScheduler] | None:
    """Resolve coordinator + scheduler for an entry id (or the only entry)."""
    entries = _domain_entries(hass)
    data: dict[str, Any] | None = None
    if entry_id:
        data = entries.get(entry_id)
    elif len(entries) == 1:
        data = next(iter(entries.values()))
    if data is None:
        return None
    return data["coordinator"], data["scheduler"]


def _entity_missing(hass: HomeAssistant, entity_id: str | None) -> bool:
    """Return True when a referenced entity id has no state object."""
    return bool(entity_id) and hass.states.get(entity_id) is None


def _resolved_contact(hass: HomeAssistant, cover: CoverItem) -> str | None:
    """Resolve the cover's contact abstraction, or ``None`` without a sensor."""
    if not cover.contact_entity_id:
        return None
    raw = hass.states.get(cover.contact_entity_id)
    return resolve_contact_state(raw.state if raw else None, cover.contact_state_map)


def _safety_blocked_now(hass: HomeAssistant, cover: CoverItem) -> bool:
    """Mirror the safety binary_sensor: contact currently blocks closing."""
    contact = _resolved_contact(hass, cover)
    if contact == CONTACT_OPEN:
        return True
    return bool(contact == CONTACT_TILTED and cover.safety.block_when_tilted)


def _cover_context(hass: HomeAssistant, cover: CoverItem) -> CoverContext:
    """Build the engine's cover snapshot (same shape as the scheduler's)."""
    position = current_cover_position(hass.states.get(cover.cover_entity_id))
    return CoverContext(
        position=position,
        contact=_resolved_contact(hass, cover) or "unknown",
        contact_entity_id=cover.contact_entity_id,
        azimuth=cover.azimuth,
    )


def _sun_context(hass: HomeAssistant) -> SunContext:
    """Live sun snapshot for the engine (same shape as the scheduler's)."""
    state = hass.states.get(SUN_ENTITY_ID)
    if state is None:
        return SunContext()

    def _num(value: Any) -> float | None:
        try:
            return float(value)
        except (TypeError, ValueError):
            return None

    return SunContext(
        azimuth=_num(state.attributes.get("azimuth")),
        elevation=_num(state.attributes.get("elevation")),
    )


def _cover_runtime_info(
    hass: HomeAssistant,
    scheduler: AdvancedCoverScheduler,
    cover: CoverItem,
) -> dict[str, Any]:
    """Live info for one cover: capabilities, position, contact, warnings."""
    caps = get_cover_capabilities(hass, cover.cover_entity_id)
    state = hass.states.get(cover.cover_entity_id)
    warnings = [
        entity_id
        for entity_id in (
            cover.cover_entity_id,
            cover.low_mode_entity_id,
            cover.low_mode_script_id,
            cover.contact_entity_id,
        )
        if entity_id and _entity_missing(hass, entity_id)
    ]
    return {
        **cover.to_dict(),
        "capabilities": caps.to_dict(),
        "current_position": current_cover_position(state),
        "contact_state": _resolved_contact(hass, cover),
        "safety_blocked": _safety_blocked_now(hass, cover),
        "next_action": scheduler.next_action_for_cover(cover.id),
        "missing_entities": warnings,
    }


def _get_state(hass: HomeAssistant) -> Callable[[str], str | None]:
    """State accessor for the pure engine."""

    def _lookup(entity_id: str) -> str | None:
        st = hass.states.get(entity_id)
        return st.state if st else None

    return _lookup


def _assignment_preflight(
    hass: HomeAssistant,
    data: EntryData,
    scenario: Scenario,
    cover: CoverItem | None,
    run: dict[str, Any],
    *,
    scenario_cover_conditions: list[Condition],
    now_iso: str,
) -> dict[str, Any]:
    """Preflight for one cover run: extra conditions + safety + availability.

    ``scenario_cover_conditions`` are the scenario's own cover-scoped
    conditions (position/contact/relative sun). The trigger path AND-s them
    onto every cover, so they are evaluated here — with this cover's context —
    rather than once for the whole block, where no cover is in scope.
    """
    assignment = next(
        (a for a in scenario.assignments if a.cover_item_id == run["cover_item_id"]),
        None,
    )
    if cover is None or assignment is None:
        return rollup_preflight([disabled_condition_eval(SCOPE_ASSIGNMENT)], now_iso)
    if not data.config.enabled or not cover.enabled:
        return rollup_preflight([disabled_condition_eval(SCOPE_ASSIGNMENT)], now_iso)
    ctx = _cover_context(hass, cover)
    evals = evaluate_conditions_detailed(
        scenario_cover_conditions,
        _get_state(hass),
        ctx,
        SCOPE_SCENARIO,
        _sun_context(hass),
    )
    evals += evaluate_conditions_detailed(
        assignment.extra_conditions,
        _get_state(hass),
        ctx,
        SCOPE_ASSIGNMENT,
        _sun_context(hass),
    )
    if cover.contact_entity_id:
        blocked = safety_would_block(
            contact=ctx.contact,
            block_when_tilted=cover.safety.block_when_tilted,
            ventilation_position=cover.safety.ventilation_position,
            target_position=int(run["target_position"]),
            current_position=ctx.position,
        )
        if blocked:
            resolved = assignment.resolved_action(scenario.action)
            mode = resolved.safety_override or cover.safety.mode
            if mode == SAFETY_MODE_IGNORE:
                # Override runs to the full target — informational only.
                evals.append(safety_ignore_eval())
            elif mode == SAFETY_MODE_CLAMP:
                # Clamp mode still runs — show what will happen, not a blocker.
                evals.append(
                    safety_clamp_eval(
                        ventilation_position=cover.safety.ventilation_position
                    )
                )
            else:
                evals.append(
                    safety_condition_eval(
                        blocked=True,
                        ventilation_position=cover.safety.ventilation_position,
                    )
                )
    return rollup_preflight(evals, now_iso)


def _enrich_occurrence(
    hass: HomeAssistant, data: EntryData, occ_dict: dict[str, Any], now_iso: str
) -> dict[str, Any]:
    """Attach preflight, covers_would_run and per-run preflight to a plan block."""
    scenario = data.scenario_by_id(occ_dict["scenario_id"])
    if occ_dict.get("fired") or scenario is None:
        occ_dict["preflight"] = None
        occ_dict["covers_would_run"] = 0
        return occ_dict

    # Block-level preflight: the scenario conditions that hold for every cover.
    # Cover-scoped ones move into the per-cover preflight below.
    wide_conditions, cover_conditions = split_cover_scoped(scenario.conditions)
    if not data.config.enabled:
        block_evals = [disabled_condition_eval(SCOPE_SCENARIO)]
        cover_conditions = []
    else:
        block_evals = evaluate_conditions_detailed(
            wide_conditions,
            _get_state(hass),
            CoverContext(),
            SCOPE_SCENARIO,
            _sun_context(hass),
        )
    block_pf = rollup_preflight(block_evals, now_iso)
    occ_dict["preflight"] = block_pf

    would_run = 0
    for run in occ_dict.get("assignments", []):
        cover = data.covers.get(run["cover_item_id"])
        pf = _assignment_preflight(
            hass,
            data,
            scenario,
            cover,
            run,
            scenario_cover_conditions=cover_conditions,
            now_iso=now_iso,
        )
        run["preflight"] = pf
        if (
            block_pf["verdict"] == VERDICT_WOULD_RUN
            and pf["verdict"] == VERDICT_WOULD_RUN
        ):
            would_run += 1
    occ_dict["covers_would_run"] = would_run
    return occ_dict


def _scenario_warnings(
    hass: HomeAssistant, data: EntryData, scenario: Scenario
) -> list[str]:
    """Return validation warnings for a scenario (plan §6 UX guard rails)."""
    warnings: list[str] = []
    for cond in [
        *scenario.conditions,
        *(c for a in scenario.assignments for c in a.extra_conditions),
    ]:
        if cond.entity_id and _entity_missing(hass, cond.entity_id):
            warnings.append(f"Entity {cond.entity_id} not found")
    for assignment in scenario.assignments:
        cover = data.covers.get(assignment.cover_item_id)
        if cover is None:
            warnings.append(f"Assigned cover {assignment.cover_item_id} was removed")
            continue
        action = assignment.resolved_action(scenario.action)
        caps = get_cover_capabilities(hass, cover.cover_entity_id)
        if (
            caps.available
            and not caps.supports_position
            and action.position not in (0, 100)
        ):
            warnings.append(
                f"{cover.name} only supports open/close; "
                f"{action.position}% will map to "
                f"{'open' if action.position >= 50 else 'closed'}"
            )
        if (
            action.tilt_position is not None
            and caps.available
            and not caps.supports_tilt
        ):
            warnings.append(f"{cover.name} does not support tilt")
    return warnings


def _sun_times(hass: HomeAssistant) -> dict[str, str | None]:
    """Today's sunrise, sunset and solar noon as local ISO timestamps."""
    today = dt_util.now().date()
    sun: dict[str, str | None] = {}
    for event, astral in (
        ("sunrise", "sunrise"),
        ("sunset", "sunset"),
        ("solar_noon", "noon"),
    ):
        when = get_astral_event_date(hass, astral, today)
        sun[event] = dt_util.as_local(when).isoformat() if when else None
    return sun


def _snapshot(
    hass: HomeAssistant,
    coordinator: AdvancedCoverCoordinator,
    scheduler: AdvancedCoverScheduler,
) -> dict[str, Any]:
    """Full panel state for one entry."""
    data = coordinator.data_model
    now_iso = dt_util.now().isoformat()
    sun = _sun_times(hass)
    return {
        "entry_id": coordinator.config_entry.entry_id,
        "config": data.config.to_dict(),
        "covers": [
            _cover_runtime_info(hass, scheduler, c) for c in data.covers.values()
        ],
        "scenarios": [
            {**s.to_dict(), "warnings": _scenario_warnings(hass, data, s)}
            for s in data.scenarios
        ],
        "plan": [
            _enrich_occurrence(hass, data, occ.to_dict(), now_iso)
            for occ in coordinator.day_plan
        ],
        "log": list(coordinator.action_log),
        "sun": sun,
        "now": now_iso,
    }


@callback
def async_register_websocket_api(hass: HomeAssistant) -> None:
    """Register all WebSocket commands."""
    websocket_api.async_register_command(hass, ws_entries_list)
    websocket_api.async_register_command(hass, ws_state)
    websocket_api.async_register_command(hass, ws_subscribe)
    websocket_api.async_register_command(hass, ws_config_save)
    websocket_api.async_register_command(hass, ws_cover_save)
    websocket_api.async_register_command(hass, ws_cover_delete)
    websocket_api.async_register_command(hass, ws_cover_probe)
    websocket_api.async_register_command(hass, ws_cover_test)
    websocket_api.async_register_command(hass, ws_scenario_save)
    websocket_api.async_register_command(hass, ws_scenario_delete)
    websocket_api.async_register_command(hass, ws_scenario_reorder)
    websocket_api.async_register_command(hass, ws_scenario_run)
    websocket_api.async_register_command(hass, ws_recalculate)
    websocket_api.async_register_command(hass, ws_trigger_preview)


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/entries/list"})
@websocket_api.require_admin
@callback
def ws_entries_list(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """List loaded config entries for the entry picker."""
    result = []
    for entry_id, data in _domain_entries(hass).items():
        coordinator: AdvancedCoverCoordinator = data["coordinator"]
        result.append(
            {"entry_id": entry_id, "name": coordinator.data_model.config.name}
        )
    connection.send_result(msg["id"], result)


def _resolve_or_error(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> tuple[AdvancedCoverCoordinator, AdvancedCoverScheduler] | None:
    """Resolve runtime or send a not-found error."""
    runtime = _get_runtime(hass, msg.get("entry_id"))
    if runtime is None:
        connection.send_error(msg["id"], ERR_NOT_FOUND, "Config entry not loaded")
    return runtime


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/state",
        vol.Optional("entry_id"): str,
    }
)
@websocket_api.require_admin
@callback
def ws_state(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Return the full panel state."""
    if (runtime := _resolve_or_error(hass, connection, msg)) is None:
        return
    connection.send_result(msg["id"], _snapshot(hass, *runtime))


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/subscribe",
        vol.Optional("entry_id"): str,
    }
)
@websocket_api.require_admin
@callback
def ws_subscribe(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Push the panel state on every coordinator update."""
    if (runtime := _resolve_or_error(hass, connection, msg)) is None:
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
        vol.Required("type"): f"{DOMAIN}/trigger/preview",
        vol.Optional("entry_id"): str,
        vol.Required("trigger"): dict,
        vol.Optional("cover_item_ids"): [str],
    }
)
@websocket_api.require_admin
@callback
def ws_trigger_preview(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Resolve a (draft) trigger to today's base time for the editor preview.

    Uses the scheduler's own resolver, so the preview can never disagree
    with what the plan will compute. ``time`` is ``None`` when the trigger
    has no occurrence today (e.g. sun never reaches the configured angle).

    For a facade-relative azimuth trigger, ``cover_item_ids`` (the draft's
    assignments) yields per-cover times plus the names of covers without a
    facade azimuth, which the trigger would skip.
    """
    if (runtime := _resolve_or_error(hass, connection, msg)) is None:
        return
    coordinator, scheduler = runtime
    trigger = Trigger.from_dict(msg["trigger"])
    today = dt_util.now().date()
    if trigger.type == "sun_azimuth" and trigger.az_relative:
        data = coordinator.data_model
        times: list[dict[str, Any]] = []
        missing: list[str] = []
        for cover_id in msg.get("cover_item_ids") or []:
            cover = data.covers.get(cover_id)
            if cover is None:
                continue
            if cover.azimuth is None:
                missing.append(cover.name)
                continue
            target = (cover.azimuth + trigger.azimuth_offset_deg) % 360
            when = scheduler.azimuth_crossing_local(float(target), today)
            times.append(
                {
                    "cover_item_id": cover_id,
                    "name": cover.name,
                    "time": (
                        (when + timedelta(minutes=trigger.offset_min)).isoformat()
                        if when
                        else None
                    ),
                }
            )
        resolved = sorted(t["time"] for t in times if t["time"])
        connection.send_result(
            msg["id"],
            {
                "time": resolved[0] if resolved else None,
                "time_last": resolved[-1] if resolved else None,
                "times": times,
                "missing": missing,
            },
        )
        return
    base = scheduler.resolve_trigger_base(trigger, today)
    connection.send_result(msg["id"], {"time": base.isoformat() if base else None})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/config/save",
        vol.Optional("entry_id"): str,
        vol.Required("config"): dict,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_config_save(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Save global entry settings."""
    if (runtime := _resolve_or_error(hass, connection, msg)) is None:
        return
    coordinator, _ = runtime
    current = coordinator.data_model.config.to_dict()
    current.update(msg["config"])
    coordinator.data_model.config = EntryConfig.from_dict(current)
    executor = hass.data[DOMAIN][coordinator.config_entry.entry_id]["executor"]
    executor.set_default_delta(coordinator.data_model.config.default_min_position_delta)
    await coordinator.async_save_and_notify()
    connection.send_result(msg["id"], {"success": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/covers/save",
        vol.Optional("entry_id"): str,
        vol.Required("cover"): dict,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_cover_save(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Create or update a cover item."""
    if (runtime := _resolve_or_error(hass, connection, msg)) is None:
        return
    coordinator, _ = runtime
    payload = dict(msg["cover"])
    if not str(payload.get("cover_entity_id") or "").strip():
        connection.send_error(msg["id"], "invalid_format", "cover_entity_id required")
        return
    if not payload.get("id"):
        payload["id"] = new_id()
    cover = CoverItem.from_dict(payload)
    coordinator.data_model.covers[cover.id] = cover
    await coordinator.async_save_and_notify()
    connection.send_result(msg["id"], {"success": True, "id": cover.id})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/covers/delete",
        vol.Optional("entry_id"): str,
        vol.Required("cover_item_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_cover_delete(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Delete a cover item, its assignments and its HA entities."""
    if (runtime := _resolve_or_error(hass, connection, msg)) is None:
        return
    coordinator, _ = runtime
    cover_id = msg["cover_item_id"]
    data = coordinator.data_model
    if cover_id not in data.covers:
        connection.send_error(msg["id"], ERR_NOT_FOUND, "Unknown cover item")
        return
    data.covers.pop(cover_id)
    for scenario in data.scenarios:
        scenario.assignments = [
            a for a in scenario.assignments if a.cover_item_id != cover_id
        ]

    registry = er.async_get(hass)
    entry_id = coordinator.config_entry.entry_id
    for platform, suffix in (
        ("switch", f"cover_{cover_id}_automation"),
        ("sensor", f"cover_{cover_id}_next_action"),
        ("binary_sensor", f"cover_{cover_id}_safety_blocked"),
    ):
        entity_id = registry.async_get_entity_id(
            platform, DOMAIN, f"{entry_id}_{suffix}"
        )
        if entity_id:
            registry.async_remove(entity_id)

    await coordinator.async_save_and_notify()
    connection.send_result(msg["id"], {"success": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/covers/probe",
        vol.Required("entity_id"): str,
        vol.Optional("contact_entity_id"): str,
    }
)
@websocket_api.require_admin
@callback
def ws_cover_probe(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Probe a cover entity: capabilities, suggested kind, contact mapping."""
    state = hass.states.get(msg["entity_id"])
    result: dict[str, Any] = {
        "capabilities": get_cover_capabilities(hass, msg["entity_id"]).to_dict(),
        "suggested_kind": default_kind_for_state(state),
    }
    if contact_id := msg.get("contact_entity_id"):
        contact_state = hass.states.get(contact_id)
        result["suggested_contact_map"] = default_contact_map(contact_state)
        result["contact_current_state"] = contact_state.state if contact_state else None
    connection.send_result(msg["id"], result)


async def async_drive_cover(
    hass: HomeAssistant,
    cover: CoverItem,
    command: str,
    position: int | None = None,
    *,
    context: Context | None = None,
) -> None:
    """Drive a cover directly (panel test buttons, dashboard card controls).

    Manual low mode: the controls drive the low-speed entity instead of the
    normal cover entity — stop included. With a low-mode *script* there is no
    entity to stop, so stop goes to the normal cover entity.

    ``context`` carries the calling user, so Home Assistant applies that
    user's entity permissions and the logbook names who moved the cover.
    """
    service_map = {
        "open": SERVICE_OPEN_COVER,
        "close": SERVICE_CLOSE_COVER,
        "stop": SERVICE_STOP_COVER,
    }
    entity_id = cover.cover_entity_id
    if cover.manual_low_mode and cover.low_mode_entity_id:
        entity_id = cover.low_mode_entity_id
    elif cover.manual_low_mode and cover.low_mode_script_id and command != "stop":
        target = {"open": 100, "close": 0}.get(
            command, 50 if position is None else position
        )
        await hass.services.async_call(
            SCRIPT_DOMAIN,
            cover.low_mode_script_id.split(".", 1)[-1],
            {"position": target},
            blocking=True,
            context=context,
        )
        return
    if command == "position":
        await hass.services.async_call(
            COVER_DOMAIN,
            SERVICE_SET_COVER_POSITION,
            {
                ATTR_ENTITY_ID: entity_id,
                ATTR_POSITION: 50 if position is None else position,
            },
            blocking=True,
            context=context,
        )
        return
    await hass.services.async_call(
        COVER_DOMAIN,
        service_map[command],
        {ATTR_ENTITY_ID: entity_id},
        blocking=True,
        context=context,
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/covers/test",
        vol.Optional("entry_id"): str,
        vol.Required("cover_item_id"): str,
        vol.Required("command"): vol.In(["open", "close", "stop", "position"]),
        vol.Optional("position"): vol.All(int, vol.Range(min=0, max=100)),
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_cover_test(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Directly drive a cover from the panel's test buttons."""
    if (runtime := _resolve_or_error(hass, connection, msg)) is None:
        return
    coordinator, _ = runtime
    cover = coordinator.cover_by_id(msg["cover_item_id"])
    if cover is None:
        connection.send_error(msg["id"], ERR_NOT_FOUND, "Unknown cover item")
        return
    await async_drive_cover(
        hass,
        cover,
        msg["command"],
        msg.get("position"),
        context=connection.context(msg),
    )
    connection.send_result(msg["id"], {"success": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/scenarios/save",
        vol.Optional("entry_id"): str,
        vol.Required("scenario"): dict,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_scenario_save(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Create or update a scenario; returns validation warnings."""
    if (runtime := _resolve_or_error(hass, connection, msg)) is None:
        return
    coordinator, _ = runtime
    payload = dict(msg["scenario"])
    if not payload.get("id"):
        payload["id"] = new_id()
    scenario = Scenario.from_dict(payload)
    data = coordinator.data_model
    existing = data.scenario_by_id(scenario.id)
    if existing is None:
        data.scenarios.append(scenario)
    else:
        data.scenarios[data.scenarios.index(existing)] = scenario
    await coordinator.async_save_and_notify()
    connection.send_result(
        msg["id"],
        {
            "success": True,
            "id": scenario.id,
            "warnings": _scenario_warnings(hass, data, scenario),
        },
    )


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/scenarios/delete",
        vol.Optional("entry_id"): str,
        vol.Required("scenario_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_scenario_delete(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Delete a scenario."""
    if (runtime := _resolve_or_error(hass, connection, msg)) is None:
        return
    coordinator, _ = runtime
    data = coordinator.data_model
    scenario = data.scenario_by_id(msg["scenario_id"])
    if scenario is None:
        connection.send_error(msg["id"], ERR_NOT_FOUND, "Unknown scenario")
        return
    data.scenarios.remove(scenario)
    await coordinator.async_save_and_notify()
    connection.send_result(msg["id"], {"success": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/scenarios/reorder",
        vol.Optional("entry_id"): str,
        vol.Required("scenario_ids"): [str],
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_scenario_reorder(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Reorder scenarios (drag order = collision priority)."""
    if (runtime := _resolve_or_error(hass, connection, msg)) is None:
        return
    coordinator, _ = runtime
    data = coordinator.data_model
    by_id = {s.id: s for s in data.scenarios}
    reordered = [by_id.pop(sid) for sid in msg["scenario_ids"] if sid in by_id]
    reordered.extend(by_id.values())  # keep any ids missing from the request
    data.scenarios = reordered
    await coordinator.async_save_and_notify()
    connection.send_result(msg["id"], {"success": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/scenarios/run",
        vol.Optional("entry_id"): str,
        vol.Required("scenario_id"): str,
        vol.Optional("cover_item_id"): str,
        vol.Optional("ignore_conditions", default=False): bool,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_scenario_run(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Run a scenario now (panel test button)."""
    if (runtime := _resolve_or_error(hass, connection, msg)) is None:
        return
    _, scheduler = runtime
    try:
        await scheduler.async_run_scenario(
            msg["scenario_id"],
            cover_item_id=msg.get("cover_item_id"),
            ignore_conditions=msg["ignore_conditions"],
        )
    except ValueError as err:
        connection.send_error(msg["id"], ERR_NOT_FOUND, str(err))
        return
    connection.send_result(msg["id"], {"success": True})


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/recalculate",
        vol.Optional("entry_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_recalculate(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict[str, Any],
) -> None:
    """Rebuild today's plan."""
    if (runtime := _resolve_or_error(hass, connection, msg)) is None:
        return
    _, scheduler = runtime
    await scheduler.async_rebuild_plan()
    connection.send_result(msg["id"], {"success": True})
