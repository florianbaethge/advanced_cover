"""Tests for the executor: safety rule, min-delta, open/close mapping."""

from __future__ import annotations

import asyncio
from types import SimpleNamespace

import pytest
from custom_components.advanced_cover.executor import (
    CoverExecutor,
    current_cover_position,
)
from custom_components.advanced_cover.models import CoverAction, CoverItem, SafetyConfig
from homeassistant.core import State

# CoverEntityFeature bits
POS = 1 | 2 | 4  # open, close, set_position
OPEN_CLOSE = 1 | 2


class FakeServices:
    def __init__(self) -> None:
        self.calls: list[tuple[str, str, dict]] = []

    async def async_call(self, domain, service, data, blocking=False):
        self.calls.append((domain, service, data))


class FakeHass:
    def __init__(self, states: dict[str, State]) -> None:
        self.states = SimpleNamespace(get=states.get)
        self.services = FakeServices()


def make_cover(**kwargs) -> CoverItem:
    defaults = {
        "id": "c1",
        "name": "Test",
        "cover_entity_id": "cover.test",
        "safety": SafetyConfig(ventilation_position=20, mode="block"),
    }
    defaults.update(kwargs)
    return CoverItem(**defaults)


@pytest.fixture
def loop():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    yield loop
    loop.close()


# ------------------------------------------------------ current_cover_position


def test_current_cover_position():
    assert (
        current_cover_position(State("cover.x", "open", {"current_position": 70})) == 70
    )
    assert current_cover_position(State("cover.x", "open", {})) == 100
    assert current_cover_position(State("cover.x", "closed", {})) == 0
    assert current_cover_position(State("cover.x", "unavailable", {})) is None
    assert current_cover_position(None) is None


# ---------------------------------------------------------------- min delta


def test_skip_when_within_min_delta(loop):
    hass = FakeHass(
        {
            "cover.test": State(
                "cover.test",
                "open",
                {"supported_features": POS, "current_position": 51},
            )
        }
    )
    executor = CoverExecutor(hass, default_min_position_delta=3)
    outcome = loop.run_until_complete(
        executor.async_execute(make_cover(), CoverAction(position=50))
    )
    assert outcome.result == "skipped"
    assert hass.services.calls == []


def test_execute_when_beyond_min_delta(loop):
    hass = FakeHass(
        {
            "cover.test": State(
                "cover.test",
                "open",
                {"supported_features": POS, "current_position": 80},
            )
        }
    )
    executor = CoverExecutor(hass, default_min_position_delta=3)
    outcome = loop.run_until_complete(
        executor.async_execute(make_cover(), CoverAction(position=50))
    )
    assert outcome.result == "executed"
    assert hass.services.calls == [
        ("cover", "set_cover_position", {"entity_id": "cover.test", "position": 50})
    ]


# ---------------------------------------------------------- open/close mapping


def test_open_close_only_cover_maps_position(loop):
    hass = FakeHass(
        {"cover.test": State("cover.test", "open", {"supported_features": OPEN_CLOSE})}
    )
    executor = CoverExecutor(hass, default_min_position_delta=3)
    outcome = loop.run_until_complete(
        executor.async_execute(make_cover(), CoverAction(position=0))
    )
    assert outcome.result == "executed"
    assert hass.services.calls[-1][1] == "close_cover"


# -------------------------------------------------------------------- safety


def _hass_with_contact(cover_pos: int, contact_state: str) -> FakeHass:
    return FakeHass(
        {
            "cover.test": State(
                "cover.test",
                "open",
                {"supported_features": POS, "current_position": cover_pos},
            ),
            "binary_sensor.window": State("binary_sensor.window", contact_state, {}),
        }
    )


def _contact_cover(**safety_kwargs) -> CoverItem:
    return make_cover(
        contact_entity_id="binary_sensor.window",
        contact_state_map={"off": "closed", "on": "open"},
        safety=SafetyConfig(ventilation_position=20, **safety_kwargs),
    )


def test_safety_blocks_closing_below_ventilation_when_open(loop):
    hass = _hass_with_contact(cover_pos=80, contact_state="on")
    executor = CoverExecutor(hass, 3)
    outcome = loop.run_until_complete(
        executor.async_execute(_contact_cover(mode="block"), CoverAction(position=0))
    )
    assert outcome.result == "blocked_safety"
    assert hass.services.calls == []


def test_safety_clamps_to_ventilation_position(loop):
    hass = _hass_with_contact(cover_pos=80, contact_state="on")
    executor = CoverExecutor(hass, 3)
    outcome = loop.run_until_complete(
        executor.async_execute(_contact_cover(mode="clamp"), CoverAction(position=0))
    )
    assert outcome.result == "executed"
    assert hass.services.calls[-1][2]["position"] == 20
    # The target was not reached — the scheduler may retry within its window.
    assert outcome.safety_clamped is True
    assert "ventilation position 20%" in (outcome.reason or "")


def test_safety_clamp_on_already_parked_cover_still_reports_clamped(loop):
    """A no-op clamp (cover already at the gap) must not look like a plain skip."""
    hass = _hass_with_contact(cover_pos=20, contact_state="on")
    executor = CoverExecutor(hass, 3)
    outcome = loop.run_until_complete(
        executor.async_execute(_contact_cover(mode="clamp"), CoverAction(position=0))
    )
    assert outcome.result == "skipped"
    assert outcome.safety_clamped is True
    assert hass.services.calls == []


def test_unclamped_moves_do_not_set_the_clamped_flag(loop):
    hass = _hass_with_contact(cover_pos=80, contact_state="off")
    executor = CoverExecutor(hass, 3)
    outcome = loop.run_until_complete(
        executor.async_execute(_contact_cover(mode="clamp"), CoverAction(position=0))
    )
    assert outcome.result == "executed"
    assert outcome.safety_clamped is False


def test_safety_allows_closing_when_window_closed(loop):
    hass = _hass_with_contact(cover_pos=80, contact_state="off")
    executor = CoverExecutor(hass, 3)
    outcome = loop.run_until_complete(
        executor.async_execute(_contact_cover(mode="block"), CoverAction(position=0))
    )
    assert outcome.result == "executed"


def test_safety_never_blocks_opening_moves(loop):
    # Cover almost closed (5%), window open, target 10% (< ventilation 20)
    # but it is an OPENING move → allowed.
    hass = _hass_with_contact(cover_pos=5, contact_state="on")
    executor = CoverExecutor(hass, 3)
    outcome = loop.run_until_complete(
        executor.async_execute(_contact_cover(mode="block"), CoverAction(position=10))
    )
    assert outcome.result == "executed"


def test_safety_tilted_blocks_only_when_configured(loop):
    hass = FakeHass(
        {
            "cover.test": State(
                "cover.test",
                "open",
                {"supported_features": POS, "current_position": 80},
            ),
            "sensor.handle": State("sensor.handle", "tilted", {}),
        }
    )
    cover_map = {"closed": "closed", "tilted": "tilted", "open": "open"}
    executor = CoverExecutor(hass, 3)

    lenient = make_cover(
        contact_entity_id="sensor.handle",
        contact_state_map=cover_map,
        safety=SafetyConfig(ventilation_position=20, block_when_tilted=False),
    )
    outcome = loop.run_until_complete(
        executor.async_execute(lenient, CoverAction(position=0))
    )
    assert outcome.result == "executed"

    strict = make_cover(
        contact_entity_id="sensor.handle",
        contact_state_map=cover_map,
        safety=SafetyConfig(ventilation_position=20, block_when_tilted=True),
    )
    outcome = loop.run_until_complete(
        executor.async_execute(strict, CoverAction(position=0))
    )
    assert outcome.result == "blocked_safety"


# ------------------------------------------------------------------ low mode


def test_low_mode_uses_alternate_entity(loop):
    hass = FakeHass(
        {
            "cover.test": State(
                "cover.test",
                "open",
                {"supported_features": POS, "current_position": 80},
            ),
            "cover.test_low": State(
                "cover.test_low",
                "open",
                {"supported_features": POS, "current_position": 80},
            ),
        }
    )
    executor = CoverExecutor(hass, 3)
    cover = make_cover(low_mode_entity_id="cover.test_low")
    outcome = loop.run_until_complete(
        executor.async_execute(cover, CoverAction(position=0, mode="low"))
    )
    assert outcome.result == "executed"
    assert hass.services.calls[-1][2]["entity_id"] == "cover.test_low"


def test_low_mode_script_receives_position(loop):
    hass = FakeHass(
        {
            "cover.test": State(
                "cover.test",
                "open",
                {"supported_features": POS, "current_position": 80},
            ),
            "script.low_move": State("script.low_move", "off", {}),
        }
    )
    executor = CoverExecutor(hass, 3)
    cover = make_cover(low_mode_script_id="script.low_move")
    outcome = loop.run_until_complete(
        executor.async_execute(cover, CoverAction(position=30, mode="low"))
    )
    assert outcome.result == "executed"
    assert hass.services.calls == [("script", "low_move", {"position": 30})]


# -------------------------------------------------------- low mode: speed

SPEED = 256  # CoverEntityFeature.SPEED (HA 2026.11+)


def _speed_hass(features: int, speeds: list[str] | None, position: int = 80):
    attrs: dict = {"supported_features": features, "current_position": position}
    if speeds is not None:
        attrs["supported_speeds"] = speeds
    return FakeHass({"cover.test": State("cover.test", "open", attrs)})


def test_low_mode_speed_sends_slow_with_set_position(loop):
    hass = _speed_hass(POS | SPEED, ["fast", "slow"])
    executor = CoverExecutor(hass, 3)
    cover = make_cover(low_mode_speed=True)
    outcome = loop.run_until_complete(
        executor.async_execute(cover, CoverAction(position=30, mode="low"))
    )
    assert outcome.result == "executed"
    assert outcome.reason is None
    assert hass.services.calls == [
        (
            "cover",
            "set_cover_position",
            {"entity_id": "cover.test", "position": 30, "speed": "slow"},
        )
    ]


def test_low_mode_speed_sends_slow_with_open_close(loop):
    hass = _speed_hass(OPEN_CLOSE | SPEED, ["slow"], position=100)
    executor = CoverExecutor(hass, 3)
    cover = make_cover(low_mode_speed=True)
    loop.run_until_complete(
        executor.async_execute(cover, CoverAction(position=0, mode="low"))
    )
    assert hass.services.calls == [
        ("cover", "close_cover", {"entity_id": "cover.test", "speed": "slow"})
    ]


def test_low_mode_speed_wins_over_low_entity_and_script(loop):
    hass = _speed_hass(POS | SPEED, ["fast", "slow"])
    executor = CoverExecutor(hass, 3)
    cover = make_cover(
        low_mode_speed=True,
        low_mode_entity_id="cover.test_low_speed",
        low_mode_script_id="script.low_move",
    )
    loop.run_until_complete(
        executor.async_execute(cover, CoverAction(position=30, mode="low"))
    )
    assert [c[2]["entity_id"] for c in hass.services.calls] == ["cover.test"]
    assert hass.services.calls[0][2]["speed"] == "slow"


def test_normal_mode_on_speed_cover_sends_no_speed(loop):
    hass = _speed_hass(POS | SPEED, ["fast", "slow"])
    executor = CoverExecutor(hass, 3)
    cover = make_cover(low_mode_speed=True)
    loop.run_until_complete(executor.async_execute(cover, CoverAction(position=30)))
    assert "speed" not in hass.services.calls[0][2]


@pytest.mark.parametrize(
    ("features", "speeds"),
    [
        (POS, None),  # pre-2026.11 entity: no speed at all
        (POS, ["fast", "slow"]),  # speeds listed but feature bit missing
        (POS | SPEED, ["fast"]),  # speed feature without "slow"
        (POS | SPEED, None),
    ],
)
def test_low_mode_speed_falls_back_when_unsupported(loop, features, speeds):
    hass = _speed_hass(features, speeds)
    executor = CoverExecutor(hass, 3)
    cover = make_cover(low_mode_speed=True)
    outcome = loop.run_until_complete(
        executor.async_execute(cover, CoverAction(position=30, mode="low"))
    )
    assert outcome.result == "executed"
    assert outcome.reason == (
        "cover.test does not support the slow speed, moved at normal speed"
    )
    assert hass.services.calls == [
        ("cover", "set_cover_position", {"entity_id": "cover.test", "position": 30})
    ]


def test_low_mode_speed_tilt_stays_plain(loop):
    hass = FakeHass(
        {
            "cover.test": State(
                "cover.test",
                "open",
                {
                    "supported_features": POS | 128 | SPEED,
                    "supported_speeds": ["slow"],
                    "current_position": 80,
                    "current_tilt_position": 0,
                },
            )
        }
    )
    executor = CoverExecutor(hass, 3)
    cover = make_cover(low_mode_speed=True)
    loop.run_until_complete(
        executor.async_execute(
            cover, CoverAction(position=30, tilt_position=50, mode="low")
        )
    )
    assert hass.services.calls[0][2]["speed"] == "slow"
    assert hass.services.calls[1] == (
        "cover",
        "set_cover_tilt_position",
        {"entity_id": "cover.test", "tilt_position": 50},
    )


def test_unavailable_cover_is_reported(loop):
    hass = FakeHass({"cover.test": State("cover.test", "unavailable", {})})
    executor = CoverExecutor(hass, 3)
    outcome = loop.run_until_complete(
        executor.async_execute(make_cover(), CoverAction(position=0))
    )
    assert outcome.result == "unavailable"


def test_safety_override_clamp_beats_cover_block_mode(loop):
    hass = _hass_with_contact(cover_pos=80, contact_state="on")
    executor = CoverExecutor(hass, 3)
    outcome = loop.run_until_complete(
        executor.async_execute(
            _contact_cover(mode="block"),
            CoverAction(position=0, safety_override="clamp"),
        )
    )
    assert outcome.result == "executed"
    assert hass.services.calls[-1][2]["position"] == 20


def test_safety_override_block_beats_cover_clamp_mode(loop):
    hass = _hass_with_contact(cover_pos=80, contact_state="on")
    executor = CoverExecutor(hass, 3)
    outcome = loop.run_until_complete(
        executor.async_execute(
            _contact_cover(mode="clamp"),
            CoverAction(position=0, safety_override="block"),
        )
    )
    assert outcome.result == "blocked_safety"
    assert hass.services.calls == []


def test_safety_override_ignore_closes_fully_despite_open_window(loop):
    hass = _hass_with_contact(cover_pos=80, contact_state="on")
    executor = CoverExecutor(hass, 3)
    outcome = loop.run_until_complete(
        executor.async_execute(
            _contact_cover(mode="block"),
            CoverAction(position=0, safety_override="ignore"),
        )
    )
    assert outcome.result == "executed"
    assert hass.services.calls[-1][2]["position"] == 0


def test_safety_override_ignore_beats_cover_clamp_mode(loop):
    hass = _hass_with_contact(cover_pos=80, contact_state="on")
    executor = CoverExecutor(hass, 3)
    outcome = loop.run_until_complete(
        executor.async_execute(
            _contact_cover(mode="clamp"),
            CoverAction(position=0, safety_override="ignore"),
        )
    )
    assert outcome.result == "executed"
    assert hass.services.calls[-1][2]["position"] == 0
