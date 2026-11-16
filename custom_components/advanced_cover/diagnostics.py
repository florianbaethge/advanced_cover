"""Diagnostics support for Advanced Cover."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .capabilities import supports_slow_speed
from .const import ATTR_SUPPORTED_SPEEDS, DOMAIN
from .coordinator import AdvancedCoverCoordinator


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ConfigEntry
) -> dict[str, Any]:
    """Return diagnostics: full configuration, today's plan and recent log."""
    domain_data = hass.data.get(DOMAIN, {}).get(entry.entry_id)
    if not domain_data:
        return {"error": "entry not loaded"}
    coordinator: AdvancedCoverCoordinator = domain_data["coordinator"]

    referenced_entities: dict[str, str | None] = {}
    speed_support: dict[str, dict[str, Any]] = {}
    for cover in coordinator.data_model.covers.values():
        for entity_id in (
            cover.cover_entity_id,
            cover.low_mode_entity_id,
            cover.low_mode_script_id,
            cover.contact_entity_id,
        ):
            if entity_id:
                state = hass.states.get(entity_id)
                referenced_entities[entity_id] = state.state if state else None
        # Cover speed support (low mode "speed option", HA 2026.11+).
        main = hass.states.get(cover.cover_entity_id)
        speed_support[cover.cover_entity_id] = {
            "supported_features": main.attributes.get("supported_features")
            if main
            else None,
            "supported_speeds": main.attributes.get(ATTR_SUPPORTED_SPEEDS)
            if main
            else None,
            "supports_slow_speed": supports_slow_speed(main),
        }

    return {
        "data": coordinator.data_model.to_dict(),
        "day_plan": [occ.to_dict() for occ in coordinator.day_plan],
        "action_log": list(coordinator.action_log),
        "referenced_entity_states": referenced_entities,
        "cover_speed_support": speed_support,
    }
