"""Tests for serving the card and keeping its Lovelace resource entry current.

The resource entry is what makes the card appear in the card picker without a
manual step, so the cases worth pinning down are the ones a user would notice:
one entry, never two; an entry that follows the bundle after an update; and no
crash on a dashboard setup the integration cannot write to.
"""

from __future__ import annotations

from types import SimpleNamespace
from typing import Any
from unittest.mock import AsyncMock, patch

from custom_components.advanced_cover import _async_register_frontend
from custom_components.advanced_cover.card import (
    async_register_card,
    async_unregister_card,
)
from custom_components.advanced_cover.const import (
    CARD_API_REGISTERED_KEY,
    CARD_REGISTERED_KEY,
    CARD_URL,
    PANEL_REGISTERED_KEY,
    WEBSOCKET_REGISTERED_KEY,
)
from homeassistant.core import HomeAssistant


class FakeResources:
    """The slice of Lovelace's resource collection the card registration uses."""

    def __init__(self, items: list[dict[str, Any]] | None = None) -> None:
        self.items = list(items or [])
        self.loaded = True
        self.load_calls = 0

    async def async_load(self) -> None:
        self.load_calls += 1

    def async_items(self) -> list[dict[str, Any]]:
        return list(self.items)

    async def async_create_item(self, data: dict[str, Any]) -> None:
        self.items.append(
            {
                "id": f"id{len(self.items)}",
                "url": data["url"],
                "type": data["res_type"],
            }
        )

    async def async_update_item(self, item_id: str, data: dict[str, Any]) -> None:
        for item in self.items:
            if item["id"] == item_id:
                item["url"] = data["url"]

    async def async_delete_item(self, item_id: str) -> None:
        self.items = [item for item in self.items if item["id"] != item_id]


def _prepare(hass: HomeAssistant, lovelace: Any) -> AsyncMock:
    """Give hass a stub HTTP server and the given Lovelace data."""
    register = AsyncMock()
    hass.http = SimpleNamespace(async_register_static_paths=register)
    if lovelace is None:
        hass.data.pop("lovelace", None)
    else:
        hass.data["lovelace"] = lovelace
    return register


def _own(resources: FakeResources) -> list[str]:
    return [item["url"] for item in resources.items if item["url"].startswith(CARD_URL)]


async def _register(hass: HomeAssistant, mtime: int = 1000) -> None:
    with patch(
        "custom_components.advanced_cover.card.os.path.getmtime", return_value=mtime
    ):
        await async_register_card(hass)


async def test_registers_the_resource_once(hass: HomeAssistant) -> None:
    other = {"id": "x", "url": "/local/other-card.js", "type": "module"}
    resources = FakeResources([other])
    register = _prepare(
        hass, SimpleNamespace(resource_mode="storage", resources=resources)
    )

    await _register(hass)
    await _register(hass)

    assert register.await_count == 2
    assert len(_own(resources)) == 1
    assert _own(resources)[0].startswith(f"{CARD_URL}?v=")
    assert _own(resources)[0].endswith("&m=1000")
    # Somebody else's resource is none of our business.
    assert other in resources.items


async def test_resource_follows_a_rebuilt_bundle(hass: HomeAssistant) -> None:
    resources = FakeResources()
    _prepare(hass, SimpleNamespace(resource_mode="storage", resources=resources))

    await _register(hass, mtime=1000)
    await _register(hass, mtime=2000)

    # Updated in place: a second entry would load the card twice.
    assert len(_own(resources)) == 1
    assert _own(resources)[0].endswith("&m=2000")


async def test_unloaded_collection_is_loaded_first(hass: HomeAssistant) -> None:
    resources = FakeResources()
    resources.loaded = False
    _prepare(hass, SimpleNamespace(resource_mode="storage", resources=resources))

    await _register(hass)

    assert resources.load_calls == 1
    assert len(_own(resources)) == 1


async def test_yaml_mode_and_missing_lovelace_do_not_crash(
    hass: HomeAssistant,
) -> None:
    resources = FakeResources()
    register = _prepare(
        hass, SimpleNamespace(resource_mode="yaml", resources=resources)
    )
    await _register(hass)
    assert _own(resources) == []

    _prepare(hass, None)
    await _register(hass)

    # The bundle is still served, so a manually added resource works.
    assert register.await_count == 1


async def test_legacy_dict_shaped_lovelace_data(hass: HomeAssistant) -> None:
    resources = FakeResources()
    _prepare(hass, {"mode": "storage", "resources": resources})

    await _register(hass)

    assert len(_own(resources)) == 1


async def test_already_served_bundle_is_not_an_error(hass: HomeAssistant) -> None:
    resources = FakeResources()
    register = _prepare(
        hass, SimpleNamespace(resource_mode="storage", resources=resources)
    )
    # aiohttp refuses to register the same route twice — the integration was
    # removed and added again without a restart.
    register.side_effect = RuntimeError("already registered")

    await _register(hass)

    assert len(_own(resources)) == 1


async def test_missing_bundle_still_registers(hass: HomeAssistant) -> None:
    resources = FakeResources()
    _prepare(hass, SimpleNamespace(resource_mode="storage", resources=resources))

    with patch(
        "custom_components.advanced_cover.card.os.path.getmtime",
        side_effect=OSError,
    ):
        await async_register_card(hass)

    assert _own(resources)[0].endswith("&m=0")


async def test_removing_the_integration_removes_its_resource(
    hass: HomeAssistant,
) -> None:
    other = {"id": "x", "url": "/local/other-card.js", "type": "module"}
    resources = FakeResources([other])
    _prepare(hass, SimpleNamespace(resource_mode="storage", resources=resources))
    await _register(hass)
    assert len(_own(resources)) == 1

    await async_unregister_card(hass)

    # No dashboard is left requesting a module that no longer exists.
    assert _own(resources) == []
    assert resources.items == [other]

    # YAML mode and a missing Lovelace have nothing to clean up.
    _prepare(hass, SimpleNamespace(resource_mode="yaml", resources=resources))
    await async_unregister_card(hass)
    _prepare(hass, None)
    await async_unregister_card(hass)


async def test_a_failing_card_registration_does_not_fail_the_entry(
    hass: HomeAssistant,
) -> None:
    """By then the scheduler runs; the card is an extra and must not undo that."""
    for key in (
        WEBSOCKET_REGISTERED_KEY,
        CARD_API_REGISTERED_KEY,
        PANEL_REGISTERED_KEY,
    ):
        hass.data[key] = True

    with patch(
        "custom_components.advanced_cover.card.async_register_card",
        side_effect=ValueError("resource collection is broken"),
    ):
        await _async_register_frontend(hass)

    # Not claimed, so the next setup tries again.
    assert CARD_REGISTERED_KEY not in hass.data
