"""Tests for the Lovelace card's WebSocket API.

The card is a dashboard control for every household member, so the parts worth
pinning down are the ones that differ from the admin panel API: which entry a
bare card resolves to, that the snapshot carries live state but none of the
configuration behind it, and that a non-admin user may read and act.
"""

from __future__ import annotations

from collections import deque
from datetime import date, datetime
from types import SimpleNamespace
from typing import Any

import pytest
from custom_components.advanced_cover.card_api import (
    _resolve,
    _scenario_row,
    _snapshot,
    async_register_card_api,
)
from custom_components.advanced_cover.const import DOMAIN, WEEKDAYS
from custom_components.advanced_cover.models import (
    ActionOverride,
    ActivePeriod,
    Assignment,
    Condition,
    CoverAction,
    CoverItem,
    EntryConfig,
    EntryData,
    Scenario,
    Trigger,
)
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component
from homeassistant.util import dt as dt_util


class StubCoordinator:
    """The coordinator surface the card API touches."""

    def __init__(self, entry_id: str, data: EntryData) -> None:
        self.config_entry = SimpleNamespace(entry_id=entry_id)
        self.data_model = data
        self.day_plan: list[Any] = []
        self.action_log: deque[dict[str, Any]] = deque(maxlen=100)
        self.saved = 0
        self.listeners: list[Any] = []

    def cover_by_id(self, cover_item_id: str) -> CoverItem | None:
        return self.data_model.covers.get(cover_item_id)

    def async_add_listener(self, update: Any) -> Any:
        self.listeners.append(update)
        return lambda: self.listeners.remove(update)

    async def async_save_and_notify(self) -> None:
        self.saved += 1
        for update in list(self.listeners):
            update()


class StubScheduler:
    """Records manual runs instead of driving covers."""

    def __init__(self, data: EntryData) -> None:
        self.data = data
        self.runs: list[tuple[str, bool]] = []

    def next_action_for_cover(self, cover_item_id: str) -> dict[str, Any] | None:
        return None

    async def async_run_scenario(
        self,
        scenario_id: str,
        *,
        cover_item_id: str | None = None,
        ignore_conditions: bool = False,
    ) -> None:
        if self.data.scenario_by_id(scenario_id) is None:
            raise ValueError(f"Unknown scenario: {scenario_id}")
        self.runs.append((scenario_id, ignore_conditions))


def _data(name: str = "Home") -> EntryData:
    covers = {
        "c1": CoverItem(
            id="c1",
            name="Living room",
            cover_entity_id="cover.living",
            area_id="living_room",
            contact_entity_id="binary_sensor.living_window",
            contact_state_map={"off": "closed", "on": "open"},
        ),
        "c2": CoverItem(id="c2", name="Hall", cover_entity_id="cover.hall"),
    }
    scenario = Scenario(
        id="s1",
        name="Evening",
        trigger=Trigger(type="fixed_time", time_local="20:00"),
        conditions=[
            Condition(
                type="entity_state", entity_id="input_boolean.home", states=["on"]
            )
        ],
        action=CoverAction(position=0),
        assignments=[
            Assignment(cover_item_id="c1"),
            Assignment(cover_item_id="c2", action_override=ActionOverride(position=20)),
            Assignment(cover_item_id="gone"),
        ],
    )
    return EntryData(config=EntryConfig(name=name), covers=covers, scenarios=[scenario])


def _install(
    hass: HomeAssistant, entry_id: str = "e1", name: str = "Home"
) -> tuple[StubCoordinator, StubScheduler]:
    data = _data(name)
    coordinator = StubCoordinator(entry_id, data)
    scheduler = StubScheduler(data)
    hass.data.setdefault(DOMAIN, {})[entry_id] = {
        "coordinator": coordinator,
        "scheduler": scheduler,
    }
    return coordinator, scheduler


@pytest.fixture
async def card_api(hass: HomeAssistant) -> None:
    """Register the card commands on a bare websocket API."""
    assert await async_setup_component(hass, "websocket_api", {})
    async_register_card_api(hass)


# --------------------------------------------------------------------------
# read model
# --------------------------------------------------------------------------


async def test_bare_card_resolves_the_only_entry(hass: HomeAssistant) -> None:
    coordinator, scheduler = _install(hass)

    assert _resolve(hass, None) == (coordinator, scheduler)
    assert _resolve(hass, "e1") == (coordinator, scheduler)
    assert _resolve(hass, "unknown") is None


async def test_several_entries_need_an_explicit_pick(hass: HomeAssistant) -> None:
    _install(hass, "e1")
    second = _install(hass, "e2")

    assert _resolve(hass, None) is None
    assert _resolve(hass, "e2") == second


async def test_scenario_row_reports_targets_and_drops_removed_covers() -> None:
    data = _data()
    weekday = WEEKDAYS[dt_util.now().weekday()]

    row = _scenario_row(data, data.scenarios[0], weekday)

    # The assignment to a cover that no longer exists does not count.
    assert row["cover_ids"] == ["c1", "c2"]
    # c2 overrides the scenario's 0 % with 20 %.
    assert row["positions"] == [0, 20]
    assert row["has_conditions"] is True
    assert row["scheduled_today"] is True


async def test_scenario_row_knows_when_today_cannot_hold_it() -> None:
    data = _data()
    scenario = data.scenarios[0]
    today = dt_util.now().date()
    weekday = WEEKDAYS[today.weekday()]

    scenario.weekdays = [day for day in WEEKDAYS if day != weekday]
    assert _scenario_row(data, scenario, weekday)["scheduled_today"] is False

    scenario.weekdays = list(WEEKDAYS)
    scenario.enabled = False
    assert _scenario_row(data, scenario, weekday)["scheduled_today"] is False

    scenario.enabled = True
    other = date(today.year, 1 if today.month != 1 else 7, 15)
    day = f"{other.month:02d}-{other.day:02d}"
    scenario.active_periods = [ActivePeriod.from_dict({"from": day, "to": day})]
    assert _scenario_row(data, scenario, weekday)["scheduled_today"] is False


async def test_snapshot_carries_live_state_but_no_configuration(
    hass: HomeAssistant,
) -> None:
    coordinator, scheduler = _install(hass)
    hass.states.async_set("cover.living", "open", {"current_position": 70})
    hass.states.async_set("binary_sensor.living_window", "on")
    coordinator.action_log.extendleft({"time": str(i)} for i in range(50))

    snap = _snapshot(hass, coordinator, scheduler)

    assert snap["entry_id"] == "e1"
    assert snap["name"] == "Home"
    assert snap["enabled"] is True
    living, hall = snap["covers"]
    assert living["position"] == 70
    assert living["available"] is True
    assert living["contact_state"] == "open"
    assert living["safety_blocked"] is True
    # No state object at all: shown, but flagged.
    assert hall["available"] is False
    assert hall["position"] is None
    # The newest entries only — the full log stays in the panel.
    assert len(snap["log"]) == 30
    assert snap["log"][0] == {"time": "49"}

    # Wiring and rules are the panel's business, not the dashboard's.
    assert set(living) == {
        "id",
        "name",
        "kind",
        "area_id",
        "entity_id",
        "enabled",
        "available",
        "position",
        "contact_state",
        "safety_blocked",
        "next_action",
    }
    scenario = snap["scenarios"][0]
    assert "conditions" not in scenario
    assert "assignments" not in scenario
    assert "config" not in snap


# --------------------------------------------------------------------------
# websocket commands (as a non-admin user)
# --------------------------------------------------------------------------


async def test_non_admin_can_subscribe_and_gets_updates(
    hass: HomeAssistant,
    card_api: None,
    hass_ws_client: Any,
    hass_read_only_access_token: str,
) -> None:
    coordinator, _ = _install(hass)
    client = await hass_ws_client(hass, hass_read_only_access_token)

    await client.send_json({"id": 1, "type": f"{DOMAIN}/card/subscribe"})
    result = await client.receive_json()
    assert result["success"] is True
    first = await client.receive_json()
    assert first["event"]["enabled"] is True

    coordinator.data_model.config.enabled = False
    for update in coordinator.listeners:
        update()
    second = await client.receive_json()
    assert second["event"]["enabled"] is False


async def test_subscribe_explains_why_nothing_resolved(
    hass: HomeAssistant, card_api: None, hass_ws_client: Any
) -> None:
    client = await hass_ws_client(hass)

    await client.send_json({"id": 1, "type": f"{DOMAIN}/card/subscribe"})
    assert (await client.receive_json())["error"]["code"] == "not_found"

    _install(hass, "e1")
    _install(hass, "e2")
    await client.send_json({"id": 2, "type": f"{DOMAIN}/card/subscribe"})
    assert (await client.receive_json())["error"]["code"] == "ambiguous_entry"

    await client.send_json({"id": 3, "type": f"{DOMAIN}/card/entries"})
    entries = (await client.receive_json())["result"]
    assert [e["entry_id"] for e in entries] == ["e1", "e2"]


async def test_non_admin_can_run_a_scenario(
    hass: HomeAssistant,
    card_api: None,
    hass_ws_client: Any,
    hass_read_only_access_token: str,
) -> None:
    _, scheduler = _install(hass)
    client = await hass_ws_client(hass, hass_read_only_access_token)

    await client.send_json(
        {
            "id": 1,
            "type": f"{DOMAIN}/card/action",
            "action": "run_scenario",
            "scenario_id": "s1",
        }
    )
    assert (await client.receive_json())["success"] is True
    await client.send_json(
        {
            "id": 2,
            "type": f"{DOMAIN}/card/action",
            "action": "run_scenario",
            "scenario_id": "s1",
            "ignore_conditions": True,
        }
    )
    assert (await client.receive_json())["success"] is True
    # Conditions are honored unless the card explicitly opts out.
    assert scheduler.runs == [("s1", False), ("s1", True)]

    await client.send_json(
        {
            "id": 3,
            "type": f"{DOMAIN}/card/action",
            "action": "run_scenario",
            "scenario_id": "nope",
        }
    )
    assert (await client.receive_json())["error"]["code"] == "not_found"

    await client.send_json(
        {"id": 4, "type": f"{DOMAIN}/card/action", "action": "run_scenario"}
    )
    assert (await client.receive_json())["error"]["code"] == "invalid_format"


async def test_master_toggle_saves_and_notifies(
    hass: HomeAssistant, card_api: None, hass_ws_client: Any
) -> None:
    coordinator, _ = _install(hass)
    client = await hass_ws_client(hass)

    await client.send_json(
        {
            "id": 1,
            "type": f"{DOMAIN}/card/action",
            "action": "set_enabled",
            "enabled": False,
        }
    )
    assert (await client.receive_json())["success"] is True
    assert coordinator.data_model.config.enabled is False
    assert coordinator.saved == 1


async def test_cover_buttons_call_the_cover_services(
    hass: HomeAssistant, card_api: None, hass_ws_client: Any
) -> None:
    _install(hass)
    calls: list[tuple[str, Any]] = []

    async def _record(call: Any) -> None:
        calls.append((call.service, call.data.get("entity_id")))

    for service in ("open_cover", "close_cover", "stop_cover", "set_cover_position"):
        hass.services.async_register("cover", service, _record)
    client = await hass_ws_client(hass)

    for msg_id, command in enumerate(("open", "stop", "close"), start=1):
        await client.send_json(
            {
                "id": msg_id,
                "type": f"{DOMAIN}/card/action",
                "action": "cover",
                "cover_item_id": "c1",
                "command": command,
            }
        )
        assert (await client.receive_json())["success"] is True
    assert calls == [
        ("open_cover", "cover.living"),
        ("stop_cover", "cover.living"),
        ("close_cover", "cover.living"),
    ]

    # The card has no slider: a position command is rejected by the schema.
    await client.send_json(
        {
            "id": 9,
            "type": f"{DOMAIN}/card/action",
            "action": "cover",
            "cover_item_id": "c1",
            "command": "position",
        }
    )
    assert (await client.receive_json())["success"] is False

    await client.send_json(
        {
            "id": 10,
            "type": f"{DOMAIN}/card/action",
            "action": "cover",
            "cover_item_id": "gone",
            "command": "open",
        }
    )
    assert (await client.receive_json())["error"]["code"] == "not_found"


async def test_snapshot_timestamps_are_local_iso(hass: HomeAssistant) -> None:
    coordinator, scheduler = _install(hass)

    snap = _snapshot(hass, coordinator, scheduler)

    assert datetime.fromisoformat(snap["now"]).tzinfo is not None
    assert set(snap["sun"]) == {"sunrise", "sunset", "solar_noon"}
