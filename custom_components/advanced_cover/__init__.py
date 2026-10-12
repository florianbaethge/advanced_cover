"""Advanced Cover integration: rule-based, scenario-driven cover automation."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from homeassistant.helpers import config_validation as cv

from .const import (
    CARD_API_REGISTERED_KEY,
    CARD_REGISTERED_KEY,
    DOMAIN,
    HASS_CONFIG_KEY,
    PANEL_REGISTERED_KEY,
    WEBSOCKET_REGISTERED_KEY,
)

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry
    from homeassistant.core import HomeAssistant
    from homeassistant.helpers.typing import ConfigType

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Set up integration (YAML not used)."""
    from .services import async_setup_services

    domain_data = hass.data.setdefault(DOMAIN, {})
    domain_data[HASS_CONFIG_KEY] = config
    await async_setup_services(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Advanced Cover from a config entry."""
    from homeassistant.const import Platform
    from homeassistant.util import dt as dt_util

    from .coordinator import AdvancedCoverCoordinator
    from .executor import CoverExecutor
    from .models import EntryConfig, EntryData
    from .scheduler import AdvancedCoverScheduler
    from .store import AdvancedCoverRuntimeStore, AdvancedCoverStore

    platforms: list[Platform] = [
        Platform.SWITCH,
        Platform.SENSOR,
        Platform.BINARY_SENSOR,
    ]

    store = AdvancedCoverStore(hass, entry.entry_id)
    initial = EntryData(
        config=EntryConfig(
            name=entry.data.get("name", "Advanced Cover"),
            default_min_position_delta=int(
                entry.data.get("default_min_position_delta", 3)
            ),
        )
    )
    await store.async_load(initial=initial)

    runtime_store = AdvancedCoverRuntimeStore(hass, entry.entry_id)
    await runtime_store.async_load()

    coordinator = AdvancedCoverCoordinator(hass, entry, store, runtime_store)
    # Restore today's action log before anything can append to it.
    coordinator.restore_action_log(dt_util.now().date())
    executor = CoverExecutor(hass, store.data.config.default_min_position_delta)
    scheduler = AdvancedCoverScheduler(hass, coordinator, executor)

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {
        "coordinator": coordinator,
        "executor": executor,
        "scheduler": scheduler,
    }

    await coordinator.async_config_entry_first_refresh()
    await hass.config_entries.async_forward_entry_setups(entry, platforms)
    await scheduler.async_setup()
    coordinator.async_setup_state_tracking()

    await _async_register_frontend(hass)

    return True


async def _async_register_frontend(hass: HomeAssistant) -> None:
    """Register the WebSocket APIs, the Lovelace card and the sidebar panel.

    Everything here is per Home Assistant instance, not per entry, hence the
    ``hass.data`` flags.
    """
    if not hass.data.get(WEBSOCKET_REGISTERED_KEY):
        from .websocket import async_register_websocket_api

        async_register_websocket_api(hass)
        hass.data[WEBSOCKET_REGISTERED_KEY] = True

    if not hass.data.get(CARD_API_REGISTERED_KEY):
        from .card_api import async_register_card_api

        async_register_card_api(hass)

    if not hass.data.get(CARD_REGISTERED_KEY):
        # Claim before the first await: entries of this domain set up
        # concurrently, and a second pass would re-register the static route.
        hass.data[CARD_REGISTERED_KEY] = True
        try:
            from .card import async_register_card

            await async_register_card(hass)
        except Exception:
            # The card is an extra: by now the scheduler runs and the entities
            # exist, and a Lovelace hiccup must not take the entry down with it.
            hass.data.pop(CARD_REGISTERED_KEY, None)
            _LOGGER.exception("Could not register the dashboard card")

    if not hass.data.get(PANEL_REGISTERED_KEY):
        # Claim the flag before the first await: entries of this domain are
        # set up concurrently, and a second entry passing this guard would
        # re-register the panel (ValueError) and the static path (RuntimeError).
        hass.data[PANEL_REGISTERED_KEY] = True
        try:
            from homeassistant.setup import async_setup_component

            if "panel_custom" not in hass.config.components:
                hass_config: ConfigType = (
                    hass.data.get(DOMAIN, {}).get(HASS_CONFIG_KEY) or {}
                )
                await async_setup_component(hass, "panel_custom", hass_config)

            from .panel import async_register_panel

            await async_register_panel(hass)
        except Exception:
            hass.data.pop(PANEL_REGISTERED_KEY, None)
            raise


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload config entry."""
    from homeassistant.const import Platform

    from .scheduler import AdvancedCoverScheduler

    platforms: list[Platform] = [
        Platform.SWITCH,
        Platform.SENSOR,
        Platform.BINARY_SENSOR,
    ]

    domain_data = hass.data.get(DOMAIN, {}).get(entry.entry_id)
    if domain_data:
        scheduler: AdvancedCoverScheduler = domain_data["scheduler"]
        await scheduler.async_shutdown()
        domain_data["coordinator"].async_shutdown_state_tracking()

    unload_ok = await hass.config_entries.async_unload_platforms(entry, platforms)
    if unload_ok and entry.entry_id in hass.data.get(DOMAIN, {}):
        hass.data[DOMAIN].pop(entry.entry_id)
    if unload_ok:
        from .websocket import async_release_subscribers

        # Open panels and cards hang on the coordinator that just went away;
        # tell them, so they subscribe again once the entry is back.
        async_release_subscribers(hass, entry.entry_id)

    if unload_ok and hass.data.get(PANEL_REGISTERED_KEY):
        from homeassistant.config_entries import ConfigEntryState

        from .panel import async_unregister_panel

        still_loaded = any(
            e.state == ConfigEntryState.LOADED
            for e in hass.config_entries.async_entries(DOMAIN)
            if e.entry_id != entry.entry_id
        )
        if not still_loaded:
            async_unregister_panel(hass)
            hass.data.pop(PANEL_REGISTERED_KEY, None)

    return unload_ok


async def async_remove_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Delete the store files when the entry is removed."""
    from .store import AdvancedCoverRuntimeStore, AdvancedCoverStore

    store = AdvancedCoverStore(hass, entry.entry_id)
    await store.async_remove()
    runtime_store = AdvancedCoverRuntimeStore(hass, entry.entry_id)
    await runtime_store.async_remove()

    others = [
        other
        for other in hass.config_entries.async_entries(DOMAIN)
        if other.entry_id != entry.entry_id
    ]
    if not others:
        from .card import async_unregister_card

        try:
            await async_unregister_card(hass)
        except Exception:
            _LOGGER.exception("Could not remove the dashboard card resource")
        # Adding the integration again without a restart registers it anew.
        hass.data.pop(CARD_REGISTERED_KEY, None)
