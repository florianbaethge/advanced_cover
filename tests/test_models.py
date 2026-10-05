"""Tests for the domain models (serialization, clamping, merging)."""

from __future__ import annotations

from datetime import date

from custom_components.advanced_cover.models import (
    ActionOverride,
    ActivePeriod,
    Assignment,
    Condition,
    CoverAction,
    CoverItem,
    EntryData,
    SafetyConfig,
    Scenario,
    Trigger,
)


def test_scenario_round_trip():
    scenario = Scenario(
        id="s1",
        name="Sunset close",
        trigger=Trigger(type="sun_event", sun_event="sunset", offset_min=-10),
        random_window_min=15,
        random_direction="after",
        weekdays=["mon", "sat"],
        conditions=[
            Condition(
                type="entity_state",
                entity_id="input_select.weather",
                states=["sunny", "partly_sunny"],
            )
        ],
        retry_window_min=240,
        action=CoverAction(position=0, tilt_position=50, mode="low"),
        assignments=[
            Assignment(
                cover_item_id="c1",
                extra_conditions=[
                    Condition(type="cover_position", op="above", value=5)
                ],
                action_override=ActionOverride(position=25),
            )
        ],
    )
    restored = Scenario.from_dict(scenario.to_dict())
    assert restored.to_dict() == scenario.to_dict()
    assert restored.trigger.sun_event == "sunset"
    assert restored.assignments[0].action_override.position == 25


def test_scenario_defensive_defaults():
    restored = Scenario.from_dict(
        {
            "name": "X",
            "trigger": {"type": "bogus"},
            "random_window_min": 9999,
            "random_direction": "sideways",
            "weekdays": ["mon", "funday"],
            "retry_window_min": -5,
            "action": {"position": 250, "mode": "turbo"},
        }
    )
    assert restored.trigger.type == "fixed_time"
    assert restored.random_window_min == 120  # clamped to max
    assert restored.random_direction == "both"
    assert restored.weekdays == ["mon"]
    assert restored.retry_window_min == 0
    assert restored.action.position == 100
    assert restored.action.mode == "normal"
    assert restored.id  # auto-generated


def test_empty_weekdays_means_all():
    restored = Scenario.from_dict({"name": "X", "weekdays": []})
    assert len(restored.weekdays) == 7


def _seasonal(*periods: tuple[str, str]) -> Scenario:
    return Scenario(
        id="s", name="S", active_periods=[ActivePeriod(a, b) for a, b in periods]
    )


def test_active_periods_round_trip_and_normalization():
    restored = Scenario.from_dict(
        {
            "name": "X",
            "active_periods": [
                {"from": "4-1", "to": "5-31"},
                {"from": "09-03", "to": "10-12"},
            ],
        }
    )
    assert [p.to_dict() for p in restored.active_periods] == [
        {"from": "04-01", "to": "05-31"},
        {"from": "09-03", "to": "10-12"},
    ]
    assert Scenario.from_dict(restored.to_dict()).to_dict() == restored.to_dict()


def test_unusable_active_periods_are_dropped():
    # Legacy store data without the field → active all year.
    legacy = Scenario.from_dict({"name": "X"})
    assert legacy.active_periods == []
    assert legacy.active_on(date(2026, 1, 1))

    restored = Scenario.from_dict(
        {
            "name": "X",
            "active_periods": [
                {"from": "04-01"},
                {"from": "04-31", "to": "10-15"},  # April has 30 days
                {"from": "13-01", "to": "10-15"},
                {"from": "april", "to": "10-15"},
                "04-01",
                {"from": "06-01", "to": "08-31"},
            ],
        }
    )
    assert [p.to_dict() for p in restored.active_periods] == [
        {"from": "06-01", "to": "08-31"}
    ]
    assert Scenario.from_dict({"name": "X", "active_periods": "x"}).active_periods == []


def test_active_on_is_inclusive():
    summer = _seasonal(("04-01", "10-15"))
    assert not summer.active_on(date(2026, 3, 31))
    assert summer.active_on(date(2026, 4, 1))
    assert summer.active_on(date(2026, 7, 20))
    assert summer.active_on(date(2026, 10, 15))
    assert not summer.active_on(date(2026, 10, 16))


def test_active_on_ors_several_periods():
    shoulder = _seasonal(("04-01", "05-31"), ("09-03", "10-12"))
    assert shoulder.active_on(date(2026, 4, 1))
    assert shoulder.active_on(date(2026, 5, 31))
    assert not shoulder.active_on(date(2026, 6, 1))
    assert not shoulder.active_on(date(2026, 9, 2))
    assert shoulder.active_on(date(2026, 9, 3))
    assert shoulder.active_on(date(2026, 10, 12))
    assert not shoulder.active_on(date(2026, 10, 13))


def test_active_on_wraps_around_new_year():
    winter = _seasonal(("10-16", "03-31"))
    assert winter.active_on(date(2026, 10, 16))
    assert winter.active_on(date(2026, 12, 31))
    assert winter.active_on(date(2027, 1, 1))
    assert winter.active_on(date(2027, 3, 31))
    assert not winter.active_on(date(2027, 4, 1))
    assert not winter.active_on(date(2026, 10, 15))


def test_active_on_leap_day_bound():
    # A period ending on Feb 29 simply ends on Feb 28 in a non-leap year.
    until_leap_day = _seasonal(("01-01", "02-29"))
    assert until_leap_day.active_on(date(2026, 2, 28))
    assert not until_leap_day.active_on(date(2026, 3, 1))
    assert until_leap_day.active_on(date(2028, 2, 29))


def test_resolved_action_merges_override():
    default = CoverAction(position=0, tilt_position=30, mode="normal")
    assignment = Assignment(
        cover_item_id="c1", action_override=ActionOverride(position=25)
    )
    resolved = assignment.resolved_action(default)
    assert resolved.position == 25
    assert resolved.tilt_position == 30  # inherited
    assert resolved.mode == "normal"


def test_resolved_action_without_override_is_default():
    default = CoverAction(position=40)
    assignment = Assignment(cover_item_id="c1")
    assert assignment.resolved_action(default) is default


def test_empty_override_is_dropped_on_load():
    a = Assignment.from_dict(
        {
            "cover_item_id": "c1",
            "action_override": {
                "position": None,
                "tilt_position": None,
                "mode": None,
                "min_position_delta": None,
            },
        }
    )
    assert a.action_override is None


def test_cover_item_round_trip_and_contact_map_filtering():
    cover = CoverItem.from_dict(
        {
            "name": "Kitchen",
            "cover_entity_id": "cover.kitchen",
            "kind": "shutter",
            "azimuth": 400,
            "contact_state_map": {"on": "open", "off": "closed", "x": "bogus"},
        }
    )
    assert cover.azimuth == 359  # clamped
    assert cover.contact_state_map == {"on": "open", "off": "closed"}
    restored = CoverItem.from_dict(cover.to_dict())
    assert restored.to_dict() == cover.to_dict()


def test_entry_data_round_trip():
    data = EntryData.from_dict(
        {
            "config": {"name": "Home", "default_min_position_delta": 5},
            "covers": {"c1": {"id": "c1", "name": "A", "cover_entity_id": "cover.a"}},
            "scenarios": [{"id": "s1", "name": "S"}],
        }
    )
    assert data.config.default_min_position_delta == 5
    assert data.scenario_by_id("s1") is not None
    assert data.scenario_by_id("nope") is None
    assert EntryData.from_dict(data.to_dict()).to_dict() == data.to_dict()


def test_condition_external_entities():
    assert Condition(
        type="entity_state", entity_id="sensor.x", states=["on"]
    ).external_entity_ids() == ["sensor.x"]
    assert (
        Condition(type="cover_position", op="above", value=5).external_entity_ids()
        == []
    )
    assert Condition(
        type="numeric_state", entity_id="sensor.lux", above=100
    ).external_entity_ids() == ["sensor.lux"]


def test_sun_trigger_round_trip_and_clamps():
    from custom_components.advanced_cover.models import Trigger

    az = Trigger.from_dict(
        {"type": "sun_azimuth", "azimuth_deg": 200, "offset_min": -15}
    )
    assert az.to_dict() == {
        "type": "sun_azimuth",
        "azimuth_deg": 200,
        "offset_min": -15,
    }

    el = Trigger.from_dict(
        {"type": "sun_elevation", "elevation_deg": 27.5, "elevation_dir": "falling"}
    )
    assert el.to_dict() == {
        "type": "sun_elevation",
        "elevation_deg": 27.5,
        "elevation_dir": "falling",
        "offset_min": 0,
    }

    clamped = Trigger.from_dict(
        {"type": "sun_azimuth", "azimuth_deg": 720, "elevation_deg": 999}
    )
    assert clamped.azimuth_deg == 359
    assert clamped.elevation_deg == 90.0
    # Unknown direction falls back to the default.
    bad_dir = Trigger.from_dict({"type": "sun_elevation", "elevation_dir": "sideways"})
    assert bad_dir.elevation_dir == "falling"


def test_sun_condition_round_trip_and_defaults():
    from custom_components.advanced_cover.models import Condition

    cond = Condition.from_dict(
        {
            "type": "sun_position",
            "above": 15,
            "az_mode": "relative",
            "az_from": -45,
            "az_to": 60,
        }
    )
    assert cond.to_dict() == {
        "type": "sun_position",
        "above": 15.0,
        "below": None,
        "az_mode": "relative",
        "az_from": -45.0,
        "az_to": 60.0,
    }
    assert cond.external_entity_ids() == ["sun.sun"]
    # Unknown az_mode falls back to off.
    bad = Condition.from_dict({"type": "sun_position", "az_mode": "diagonal"})
    assert bad.az_mode == "off"


def test_relative_sun_trigger_round_trip():
    from custom_components.advanced_cover.models import Trigger

    rel = Trigger.from_dict(
        {"type": "sun_azimuth", "az_relative": True, "azimuth_offset_deg": -45}
    )
    assert rel.to_dict() == {
        "type": "sun_azimuth",
        "az_relative": True,
        "azimuth_offset_deg": -45,
        "offset_min": 0,
    }
    # Offset clamped into [-180, 180]; absolute mode omits relative fields.
    clamped = Trigger.from_dict(
        {"type": "sun_azimuth", "az_relative": True, "azimuth_offset_deg": 400}
    )
    assert clamped.azimuth_offset_deg == 180
    absolute = Trigger.from_dict({"type": "sun_azimuth", "azimuth_deg": 90})
    assert "az_relative" not in absolute.to_dict()


def test_cover_action_safety_override_round_trip():
    action = CoverAction.from_dict({"position": 0, "safety_override": "clamp"})
    assert action.safety_override == "clamp"
    assert CoverAction.from_dict(action.to_dict()).safety_override == "clamp"
    # "ignore" is a valid override (close fully despite the open window).
    assert CoverAction.from_dict({"safety_override": "ignore"}).safety_override == (
        "ignore"
    )
    assert (
        ActionOverride.from_dict({"safety_override": "ignore"}).safety_override
        == "ignore"
    )
    # Unknown values fall back to None (= use the cover's own safety mode).
    assert CoverAction.from_dict({"safety_override": "bogus"}).safety_override is None
    assert CoverAction.from_dict({}).safety_override is None


def test_safety_config_mode_rejects_ignore():
    # "ignore" is override-only; a cover's own mode falls back to "block".
    assert SafetyConfig.from_dict({"mode": "ignore"}).mode == "block"


def test_action_override_safety_override_inherits_and_wins():
    default = CoverAction(position=0, safety_override="clamp")
    plain = Assignment(cover_item_id="c1")
    assert plain.resolved_action(default).safety_override == "clamp"

    overridden = Assignment(
        cover_item_id="c1", action_override=ActionOverride(safety_override="block")
    )
    assert overridden.resolved_action(default).safety_override == "block"
    # A safety override alone keeps the override non-empty (survives from_dict).
    assert ActionOverride(safety_override="block").is_empty() is False
    assert Assignment.from_dict(overridden.to_dict()).action_override is not None
