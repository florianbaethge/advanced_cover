"""Domain services (registered once, work across config entries)."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING, Any

import voluptuous as vol
from homeassistant.auth.permissions.const import POLICY_CONTROL
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import (
    ServiceValidationError,
    Unauthorized,
    UnknownUser,
)
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import entity_registry as er

from .const import (
    ATTR_CONFIG_ENTRY_ID,
    ATTR_COVER_ITEM_ID,
    ATTR_ENABLED,
    ATTR_IGNORE_CONDITIONS,
    ATTR_SCENARIO_ID,
    DOMAIN,
    SERVICE_RECALCULATE_SCHEDULE,
    SERVICE_RUN_SCENARIO,
    SERVICE_RUN_SCENARIO_FOR_COVER,
    SERVICE_SET_COVER_ENABLED,
)

if TYPE_CHECKING:
    from .coordinator import AdvancedCoverCoordinator
    from .scheduler import AdvancedCoverScheduler

_LOGGER = logging.getLogger(__name__)

_SCHEMA_RUN_SCENARIO = vol.Schema(
    {
        vol.Required(ATTR_SCENARIO_ID): cv.string,
        vol.Optional(ATTR_CONFIG_ENTRY_ID): cv.string,
        vol.Optional(ATTR_IGNORE_CONDITIONS, default=False): cv.boolean,
    }
)

_SCHEMA_RUN_SCENARIO_FOR_COVER = _SCHEMA_RUN_SCENARIO.extend(
    {vol.Required(ATTR_COVER_ITEM_ID): cv.string}
)

_SCHEMA_RECALCULATE = vol.Schema({vol.Optional(ATTR_CONFIG_ENTRY_ID): cv.string})

_SCHEMA_SET_COVER_ENABLED = vol.Schema(
    {
        vol.Required(ATTR_COVER_ITEM_ID): cv.string,
        vol.Required(ATTR_ENABLED): cv.boolean,
        vol.Optional(ATTR_CONFIG_ENTRY_ID): cv.string,
    }
)


def _domain_data(hass: HomeAssistant, entry_id: str | None) -> dict[str, Any]:
    """Resolve the runtime dict for an entry (or the only loaded entry)."""
    domain = {
        k: v
        for k, v in hass.data.get(DOMAIN, {}).items()
        if isinstance(v, dict) and "coordinator" in v
    }
    if entry_id:
        if entry_id not in domain:
            raise ServiceValidationError(
                f"Config entry {entry_id} is not loaded for {DOMAIN}"
            )
        return domain[entry_id]
    if len(domain) == 1:
        return next(iter(domain.values()))
    raise ServiceValidationError(
        "Multiple Advanced Cover entries are configured; "
        f"please pass {ATTR_CONFIG_ENTRY_ID}"
    )


def _find_entry_for_scenario(
    hass: HomeAssistant, scenario_id: str
) -> dict[str, Any] | None:
    """Locate the (single) entry containing the given scenario id."""
    for value in hass.data.get(DOMAIN, {}).values():
        if not isinstance(value, dict) or "coordinator" not in value:
            continue
        coordinator: AdvancedCoverCoordinator = value["coordinator"]
        if coordinator.data_model.scenario_by_id(scenario_id):
            return value
    return None


async def _async_require_control(
    hass: HomeAssistant, call: ServiceCall, entity_ids: list[str | None]
) -> None:
    """Refuse a user who may not control the entities a call acts on.

    These services move covers and flip switches without going through the
    entities, so Home Assistant's own permission check never sees them. Calls
    without a user (automations, scripts, the system) pass.
    """
    if call.context.user_id is None:
        return
    user = await hass.auth.async_get_user(call.context.user_id)
    if user is None:
        raise UnknownUser(context=call.context)
    for entity_id in entity_ids:
        if entity_id and not user.permissions.check_entity(entity_id, POLICY_CONTROL):
            raise Unauthorized(
                context=call.context, entity_id=entity_id, permission=POLICY_CONTROL
            )


async def async_setup_services(hass: HomeAssistant) -> None:
    """Register domain services."""
    if hass.services.has_service(DOMAIN, SERVICE_RUN_SCENARIO):
        return

    def _resolve(call: ServiceCall) -> dict[str, Any]:
        entry_id = call.data.get(ATTR_CONFIG_ENTRY_ID)
        if entry_id:
            return _domain_data(hass, entry_id)
        scenario_id = call.data.get(ATTR_SCENARIO_ID)
        if scenario_id:
            found = _find_entry_for_scenario(hass, scenario_id)
            if found:
                return found
        return _domain_data(hass, None)

    async def _run_scenario(call: ServiceCall) -> None:
        data = _resolve(call)
        scheduler: AdvancedCoverScheduler = data["scheduler"]
        coordinator: AdvancedCoverCoordinator = data["coordinator"]
        scenario = coordinator.data_model.scenario_by_id(call.data[ATTR_SCENARIO_ID])
        only = call.data.get(ATTR_COVER_ITEM_ID)
        await _async_require_control(
            hass,
            call,
            [
                cover.cover_entity_id
                for a in (scenario.assignments if scenario else [])
                if (only is None or a.cover_item_id == only)
                and (cover := coordinator.cover_by_id(a.cover_item_id))
            ],
        )
        try:
            await scheduler.async_run_scenario(
                call.data[ATTR_SCENARIO_ID],
                cover_item_id=call.data.get(ATTR_COVER_ITEM_ID),
                ignore_conditions=call.data[ATTR_IGNORE_CONDITIONS],
            )
        except ValueError as err:
            raise ServiceValidationError(str(err)) from err

    async def _recalculate(call: ServiceCall) -> None:
        data = _resolve(call)
        scheduler: AdvancedCoverScheduler = data["scheduler"]
        await scheduler.async_rebuild_plan()

    async def _set_cover_enabled(call: ServiceCall) -> None:
        data = _resolve(call)
        coordinator: AdvancedCoverCoordinator = data["coordinator"]
        cover = coordinator.cover_by_id(call.data[ATTR_COVER_ITEM_ID])
        if cover is None:
            raise ServiceValidationError(
                f"Unknown cover item: {call.data[ATTR_COVER_ITEM_ID]}"
            )
        await _async_require_control(
            hass,
            call,
            [
                er.async_get(hass).async_get_entity_id(
                    "switch",
                    DOMAIN,
                    f"{coordinator.config_entry.entry_id}_cover_{cover.id}_automation",
                )
            ],
        )
        cover.enabled = call.data[ATTR_ENABLED]
        await coordinator.async_save_and_notify()

    hass.services.async_register(
        DOMAIN, SERVICE_RUN_SCENARIO, _run_scenario, schema=_SCHEMA_RUN_SCENARIO
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_RUN_SCENARIO_FOR_COVER,
        _run_scenario,
        schema=_SCHEMA_RUN_SCENARIO_FOR_COVER,
    )
    hass.services.async_register(
        DOMAIN, SERVICE_RECALCULATE_SCHEDULE, _recalculate, schema=_SCHEMA_RECALCULATE
    )
    hass.services.async_register(
        DOMAIN,
        SERVICE_SET_COVER_ENABLED,
        _set_cover_enabled,
        schema=_SCHEMA_SET_COVER_ENABLED,
    )
