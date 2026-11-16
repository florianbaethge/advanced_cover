"""Manual drives (panel test buttons, card controls) in low mode "speed option".

Manual low mode with the speed option sends ``speed: slow`` to the normal
cover entity on open, close and position. Stop never carries a speed, and an
entity without slow speed falls back to a normal move instead of failing.
"""

from __future__ import annotations

from typing import Any

import pytest
from custom_components.advanced_cover.models import CoverItem
from custom_components.advanced_cover.websocket import async_drive_cover
from homeassistant.core import HomeAssistant, ServiceCall

SLOW_COVER = {
    "supported_features": 1 | 2 | 4 | 8 | 256,
    "supported_speeds": ["fast", "slow"],
}


def _record(hass: HomeAssistant) -> list[tuple[str, dict[str, Any]]]:
    calls: list[tuple[str, dict[str, Any]]] = []

    async def _handler(call: ServiceCall) -> None:
        calls.append((call.service, dict(call.data)))

    for service in ("open_cover", "close_cover", "stop_cover", "set_cover_position"):
        hass.services.async_register("cover", service, _handler)
    return calls


def _cover(**kwargs: Any) -> CoverItem:
    return CoverItem(
        id="c1",
        name="Living room",
        cover_entity_id="cover.living",
        manual_low_mode=True,
        low_mode_speed=True,
        **kwargs,
    )


async def test_manual_speed_low_mode_sends_slow_but_stops_plain(
    hass: HomeAssistant,
) -> None:
    hass.states.async_set("cover.living", "open", SLOW_COVER)
    calls = _record(hass)
    cover = _cover()

    assert await async_drive_cover(hass, cover, "close") is None
    await async_drive_cover(hass, cover, "stop")
    await async_drive_cover(hass, cover, "open")
    await async_drive_cover(hass, cover, "position", 40)

    assert calls == [
        ("close_cover", {"entity_id": "cover.living", "speed": "slow"}),
        ("stop_cover", {"entity_id": "cover.living"}),
        ("open_cover", {"entity_id": "cover.living", "speed": "slow"}),
        (
            "set_cover_position",
            {"entity_id": "cover.living", "position": 40, "speed": "slow"},
        ),
    ]


async def test_speed_option_wins_over_a_configured_low_entity(
    hass: HomeAssistant,
) -> None:
    hass.states.async_set("cover.living", "open", SLOW_COVER)
    calls = _record(hass)
    cover = _cover(low_mode_entity_id="cover.living_low_speed")

    await async_drive_cover(hass, cover, "close")

    assert calls == [("close_cover", {"entity_id": "cover.living", "speed": "slow"})]


@pytest.mark.parametrize(
    "attrs",
    [
        {"supported_features": 1 | 2 | 4 | 8},
        {"supported_features": 1 | 2 | 4 | 8 | 256, "supported_speeds": ["fast"]},
    ],
)
async def test_manual_speed_low_mode_falls_back_when_unsupported(
    hass: HomeAssistant, attrs: dict[str, Any]
) -> None:
    hass.states.async_set("cover.living", "open", attrs)
    calls = _record(hass)

    note = await async_drive_cover(hass, _cover(), "close")

    assert note == "cover.living does not support the slow speed, moved at normal speed"
    assert calls == [("close_cover", {"entity_id": "cover.living"})]


async def test_manual_low_mode_off_ignores_the_speed_option(
    hass: HomeAssistant,
) -> None:
    hass.states.async_set("cover.living", "open", SLOW_COVER)
    calls = _record(hass)
    cover = _cover()
    cover.manual_low_mode = False

    await async_drive_cover(hass, cover, "close")

    assert calls == [("close_cover", {"entity_id": "cover.living"})]
