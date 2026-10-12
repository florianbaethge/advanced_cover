"""Tests for the Lovelace card's WebSocket API.

The card is a dashboard control for every household member, so the parts worth
pinning down are the ones that differ from the admin panel API: which entry a
bare card resolves to, what the snapshot does and does not carry, that an
ordinary (non-admin) user may read and act while a read-only user may only
read, and that a card is told when its entry goes away.
"""

from __future__ import annotations

from collections import deque
from datetime import datetime
from types import SimpleNamespace
from typing import Any

import pytest
from custom_components.advanced_cover.card_api import (
    _resolve,
    _scenario_row,
    _snapshot,
    async_register_card_api,
    async_release_subscribers,
)
from custom_components.advanced_cover.const import CARD_SUBSCRIBERS_KEY, DOMAIN
from custom_components.advanced_cover.models import (
    ActionOverride,
    Assignment,
    Condition,
    CoverAction,
    CoverItem,
    EntryConfig,
    EntryData,
    Scenario,
    Trigger,
)
from custom_components.advanced_cover.scheduler import AssignmentRun, Occurrence
from homeassistant.auth.const import GROUP_ID_USER
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers import entity_registry as er
from homeassistant.setup import async_setup_component
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import CLIENT_ID


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


@pytest.fixture
async def household_user(hass: HomeAssistant) -> tuple[str, str]:
    """An ordinary, non-admin user: ``(access token, user id)``.

    This is what "Administrator: off" in the user settings gives you. The
    stock read-only fixture is a different, stricter group.
    """
    user = await hass.auth.async_create_user("Kid", group_ids=[GROUP_ID_USER])
    refresh_token = await hass.auth.async_create_refresh_token(user, CLIENT_ID)
    return hass.auth.async_create_access_token(refresh_token), user.id


def _master_switch(hass: HomeAssistant, entry_id: str = "e1") -> str:
    """Register the entry's master switch, as the switch platform would."""
    return (
        er.async_get(hass)
        .async_get_or_create("switch", DOMAIN, f"{entry_id}_master")
        .entity_id
    )


def _plan_block() -> Occurrence:
    """Tonight's block of the demo scenario, not fired yet."""
    when = dt_util.now().replace(hour=20, minute=0, second=0, microsecond=0)
    return Occurrence(
        scenario_id="s1",
        scenario_name="Evening",
        base_at=when,
        planned_at=when,
        random_offset_min=0,
        retry_until=None,
        runs={
            "c1": AssignmentRun(
                cover_item_id="c1", cover_name="Living room", target_position=0
            )
        },
    )


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

    row = _scenario_row(data, data.scenarios[0])

    # The assignment to a cover that no longer exists does not count.
    assert row["cover_ids"] == ["c1", "c2"]
    # c2 overrides the scenario's 0 % with 20 %.
    assert row["positions"] == [0, 20]
    assert row["has_conditions"] is True
    assert row["trigger"] == {"type": "fixed_time", "time_local": "20:00"}


async def test_snapshot_carries_live_state_but_no_editable_configuration(
    hass: HomeAssistant,
) -> None:
    coordinator, scheduler = _install(hass)
    master = _master_switch(hass)
    coordinator.day_plan = [_plan_block()]
    hass.states.async_set("cover.living", "open", {"current_position": 70})
    hass.states.async_set("binary_sensor.living_window", "on")
    hass.states.async_set("input_boolean.home", "off")
    coordinator.action_log.extendleft({"time": str(i)} for i in range(50))

    snap = _snapshot(hass, coordinator, scheduler)

    assert snap["master_entity_id"] == master
    # The live check is part of the day, and it names what it looked at: the
    # card can only say "would be skipped now" together with the reason.
    block = snap["plan"][0]
    assert block["scenario_id"] == "s1"
    assert block["preflight"]["verdict"] == "would_skip"
    assert block["preflight"]["conditions"][0]["entity_id"] == "input_boolean.home"
    assert block["covers_would_run"] == 0

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
    assert set(scenario) == {
        "id",
        "name",
        "enabled",
        "trigger",
        "cover_ids",
        "positions",
        "has_conditions",
    }
    assert "config" not in snap


# --------------------------------------------------------------------------
# websocket commands
# --------------------------------------------------------------------------


async def test_read_only_user_can_subscribe_and_gets_updates(
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


async def test_unsubscribing_releases_the_listener(
    hass: HomeAssistant, card_api: None, hass_ws_client: Any
) -> None:
    coordinator, _ = _install(hass)
    client = await hass_ws_client(hass)

    await client.send_json({"id": 1, "type": f"{DOMAIN}/card/subscribe"})
    await client.receive_json()
    await client.receive_json()
    assert len(coordinator.listeners) == 1
    assert len(hass.data[CARD_SUBSCRIBERS_KEY]["e1"]) == 1

    await client.send_json({"id": 2, "type": "unsubscribe_events", "subscription": 1})
    assert (await client.receive_json())["success"] is True
    assert coordinator.listeners == []
    assert hass.data[CARD_SUBSCRIBERS_KEY]["e1"] == set()


async def test_card_is_told_when_its_entry_is_unloaded(
    hass: HomeAssistant, card_api: None, hass_ws_client: Any
) -> None:
    coordinator, _ = _install(hass)
    client = await hass_ws_client(hass)
    await client.send_json({"id": 1, "type": f"{DOMAIN}/card/subscribe"})
    await client.receive_json()
    await client.receive_json()

    # What async_unload_entry does once the platforms are down.
    hass.data[DOMAIN].pop("e1")
    async_release_subscribers(hass, "e1")

    last = await client.receive_json()
    assert last["event"] == {"unloaded": True}
    # Nothing keeps the old coordinator alive or pushes from it any more.
    assert coordinator.listeners == []
    assert "e1" not in hass.data[CARD_SUBSCRIBERS_KEY]

    # The card subscribes again; until the entry is back that is a clean error.
    await client.send_json({"id": 2, "type": f"{DOMAIN}/card/subscribe"})
    assert (await client.receive_json())["error"]["code"] == "not_found"
    reloaded, _ = _install(hass)
    await client.send_json({"id": 3, "type": f"{DOMAIN}/card/subscribe"})
    assert (await client.receive_json())["success"] is True
    assert len(reloaded.listeners) == 1


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


async def test_household_user_can_run_a_scenario(
    hass: HomeAssistant,
    card_api: None,
    hass_ws_client: Any,
    household_user: tuple[str, str],
) -> None:
    _, scheduler = _install(hass)
    client = await hass_ws_client(hass, household_user[0])

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


async def test_household_user_can_toggle_the_master(
    hass: HomeAssistant,
    card_api: None,
    hass_ws_client: Any,
    household_user: tuple[str, str],
) -> None:
    coordinator, _ = _install(hass)
    _master_switch(hass)
    client = await hass_ws_client(hass, household_user[0])

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


async def test_read_only_user_may_look_but_not_act(
    hass: HomeAssistant,
    card_api: None,
    hass_ws_client: Any,
    hass_read_only_access_token: str,
) -> None:
    """The card's actions bypass the entities, so their permission check is ours."""
    coordinator, scheduler = _install(hass)
    _master_switch(hass)
    client = await hass_ws_client(hass, hass_read_only_access_token)

    await client.send_json(
        {
            "id": 1,
            "type": f"{DOMAIN}/card/action",
            "action": "set_enabled",
            "enabled": False,
        }
    )
    assert (await client.receive_json())["error"]["code"] == "unauthorized"
    assert coordinator.data_model.config.enabled is True
    assert coordinator.saved == 0

    await client.send_json(
        {
            "id": 2,
            "type": f"{DOMAIN}/card/action",
            "action": "run_scenario",
            "scenario_id": "s1",
        }
    )
    assert (await client.receive_json())["error"]["code"] == "unauthorized"
    assert scheduler.runs == []


async def test_cover_buttons_call_the_cover_services_as_the_user(
    hass: HomeAssistant,
    card_api: None,
    hass_ws_client: Any,
    household_user: tuple[str, str],
) -> None:
    _install(hass)
    token, user_id = household_user
    calls: list[tuple[str, Any, str | None]] = []

    async def _record(call: Any) -> None:
        calls.append((call.service, call.data.get("entity_id"), call.context.user_id))

    for service in ("open_cover", "close_cover", "stop_cover", "set_cover_position"):
        hass.services.async_register("cover", service, _record)
    client = await hass_ws_client(hass, token)

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
    # The user's id travels with the call: Home Assistant checks the cover
    # entity's permissions against it and the logbook names the user.
    assert calls == [
        ("open_cover", "cover.living", user_id),
        ("stop_cover", "cover.living", user_id),
        ("close_cover", "cover.living", user_id),
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


async def test_failing_cover_service_is_reported_not_raised(
    hass: HomeAssistant, card_api: None, hass_ws_client: Any
) -> None:
    _install(hass)

    async def _fail(call: Any) -> None:
        raise HomeAssistantError("motor says no")

    hass.services.async_register("cover", "open_cover", _fail)
    client = await hass_ws_client(hass)

    await client.send_json(
        {
            "id": 1,
            "type": f"{DOMAIN}/card/action",
            "action": "cover",
            "cover_item_id": "c1",
            "command": "open",
        }
    )
    error = (await client.receive_json())["error"]
    assert error["code"] == "unknown_error"
    assert "motor says no" in error["message"]


async def test_snapshot_timestamps_carry_their_offset(hass: HomeAssistant) -> None:
    await hass.config.async_set_time_zone("Europe/Berlin")
    coordinator, scheduler = _install(hass)

    snap = _snapshot(hass, coordinator, scheduler)

    # Local time with its offset, so a browser in another zone still places
    # the day correctly.
    now = datetime.fromisoformat(snap["now"])
    assert now.utcoffset() == dt_util.now().utcoffset()
    assert set(snap["sun"]) == {"sunrise", "sunset", "solar_noon"}
