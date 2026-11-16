"""Tests for capability detection and contact state mapping."""

from __future__ import annotations

from custom_components.advanced_cover.capabilities import (
    capabilities_from_state,
    default_contact_map,
    default_kind_for_state,
    resolve_contact_state,
)
from homeassistant.core import State

# CoverEntityFeature: OPEN=1, CLOSE=2, SET_POSITION=4, STOP=8,
# OPEN_TILT=16, CLOSE_TILT=32, STOP_TILT=64, SET_TILT_POSITION=128


def test_capabilities_full_cover():
    state = State("cover.x", "open", {"supported_features": 1 | 2 | 4 | 128})
    caps = capabilities_from_state(state)
    assert caps.supports_position
    assert caps.supports_tilt
    assert caps.supports_open_close
    assert caps.available


def test_capabilities_open_close_only():
    state = State("cover.x", "open", {"supported_features": 1 | 2})
    caps = capabilities_from_state(state)
    assert not caps.supports_position
    assert not caps.supports_tilt
    assert caps.supports_open_close


def test_capabilities_slow_speed():
    def caps(features, **attrs):
        return capabilities_from_state(
            State("cover.x", "open", {"supported_features": features, **attrs})
        )

    assert caps(1 | 2 | 4 | 256, supported_speeds=["fast", "slow"]).supports_slow_speed
    assert not caps(1 | 2 | 4 | 256, supported_speeds=["fast"]).supports_slow_speed
    assert not caps(1 | 2 | 4, supported_speeds=["slow"]).supports_slow_speed
    assert not caps(1 | 2 | 4 | 256).supports_slow_speed
    assert not caps(1 | 2 | 4 | 256, supported_speeds="slow").supports_slow_speed


def test_capabilities_unavailable():
    assert not capabilities_from_state(None).available
    state = State("cover.x", "unavailable", {})
    assert not capabilities_from_state(state).available


def test_default_kind_from_device_class():
    assert (
        default_kind_for_state(State("cover.x", "open", {"device_class": "awning"}))
        == "awning"
    )
    assert (
        default_kind_for_state(State("cover.x", "open", {"device_class": "shutter"}))
        == "shutter"
    )
    assert default_kind_for_state(State("cover.x", "open", {})) == "other"
    assert default_kind_for_state(None) == "other"


def test_default_contact_map_binary_sensor():
    state = State("binary_sensor.window", "off", {"device_class": "window"})
    assert default_contact_map(state) == {"off": "closed", "on": "open"}


def test_default_contact_map_three_state_sensor():
    state = State("sensor.handle", "tilted", {})
    mapping = default_contact_map(state)
    assert mapping == {"closed": "closed", "tilted": "tilted", "open": "open"}


def test_default_contact_map_numeric_sensor():
    state = State("sensor.handle", "1", {})
    mapping = default_contact_map(state)
    assert mapping == {"0": "closed", "1": "tilted", "2": "open"}


def test_default_contact_map_unknown_states_empty():
    assert default_contact_map(State("sensor.handle", "weird", {})) == {}
    assert default_contact_map(None) == {}


def test_resolve_contact_state():
    mapping = {"off": "closed", "on": "open"}
    assert resolve_contact_state("off", mapping) == "closed"
    assert resolve_contact_state("on", mapping) == "open"
    assert resolve_contact_state("weird", mapping) == "unknown"
    assert resolve_contact_state(None, mapping) == "unknown"
    assert resolve_contact_state("unavailable", mapping) == "unknown"
