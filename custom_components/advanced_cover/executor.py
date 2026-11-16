"""Execute resolved cover actions: service calls, safety rule, min-delta.

The executor is the only place that calls cover/script services. Every
outcome (executed, skipped, blocked_safety, unavailable) is reported back to
the caller and logged via the coordinator.
"""

from __future__ import annotations

import logging
from dataclasses import dataclass

from homeassistant.components.cover import (
    ATTR_CURRENT_POSITION,
    ATTR_CURRENT_TILT_POSITION,
    ATTR_POSITION,
    ATTR_TILT_POSITION,
    SERVICE_CLOSE_COVER,
    SERVICE_OPEN_COVER,
    SERVICE_SET_COVER_POSITION,
    SERVICE_SET_COVER_TILT_POSITION,
)
from homeassistant.components.cover import (
    DOMAIN as COVER_DOMAIN,
)
from homeassistant.const import ATTR_ENTITY_ID, STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import HomeAssistant, State
from homeassistant.exceptions import HomeAssistantError

from .capabilities import (
    CoverCapabilities,
    capabilities_from_state,
    resolve_contact_state,
)
from .const import (
    ATTR_SPEED,
    CONTACT_OPEN,
    CONTACT_TILTED,
    LOW_MODE_ENTITY,
    LOW_MODE_SCRIPT,
    LOW_MODE_SPEED,
    MODE_LOW,
    RESULT_BLOCKED_SAFETY,
    RESULT_EXECUTED,
    RESULT_SKIPPED,
    RESULT_UNAVAILABLE,
    SAFETY_MODE_CLAMP,
    SAFETY_MODE_IGNORE,
    SCRIPT_DOMAIN,
    SPEED_SLOW,
)
from .models import CoverAction, CoverItem

_LOGGER = logging.getLogger(__name__)


@dataclass(frozen=True)
class ExecutionOutcome:
    """Result of one execution attempt."""

    result: str  # executed | skipped | blocked_safety | unavailable
    reason: str | None = None
    position: int | None = None  # the position actually commanded
    # Entity that was missing/unavailable — lets the scheduler wait for it
    # to come back instead of finishing the run for the day.
    unavailable_entity_id: str | None = None
    # The safety rule cut this move short at the ventilation position. The
    # target was not reached, so within an open retry window the scheduler
    # keeps waiting for the contact instead of calling it a day.
    safety_clamped: bool = False


def current_cover_position(state: State | None) -> int | None:
    """Read the current position from a cover state, if known."""
    if state is None or state.state in (STATE_UNAVAILABLE, STATE_UNKNOWN):
        return None
    pos = state.attributes.get(ATTR_CURRENT_POSITION)
    if pos is None:
        # Position-less covers: map open/closed to 100/0.
        if state.state == "open":
            return 100
        if state.state == "closed":
            return 0
        return None
    try:
        return int(pos)
    except (TypeError, ValueError):
        return None


class CoverExecutor:
    """Perform cover movements for resolved actions."""

    def __init__(self, hass: HomeAssistant, default_min_position_delta: int) -> None:
        """Initialize executor."""
        self.hass = hass
        self._default_delta = default_min_position_delta

    def set_default_delta(self, delta: int) -> None:
        """Update entry-wide default min position delta."""
        self._default_delta = delta

    def _apply_safety(
        self, cover: CoverItem, action: CoverAction
    ) -> tuple[int | None, str | None, bool]:
        """Apply the safety rule; return (position, block reason, clamped).

        With an open window contact (or tilted, if configured to block),
        *closing* moves below the ventilation position are blocked or
        clamped — unless the resolved mode is "ignore", which closes to
        the full target despite the open window (e.g. a night scenario).
        Opening moves are never restricted. The rule only applies
        when a contact sensor is configured — for awnings and covers
        without a contact it is inert by construction. The action's
        ``safety_override`` (scenario/assignment level) takes precedence
        over the cover's configured safety mode.
        """
        target_position = action.position
        if not cover.contact_entity_id:
            return target_position, None, False
        raw = self.hass.states.get(cover.contact_entity_id)
        contact = resolve_contact_state(
            raw.state if raw else None, cover.contact_state_map
        )
        blocking_states = {CONTACT_OPEN}
        if cover.safety.block_when_tilted:
            blocking_states.add(CONTACT_TILTED)
        if contact not in blocking_states:
            return target_position, None, False
        if target_position >= cover.safety.ventilation_position:
            return target_position, None, False
        current = current_cover_position(self.hass.states.get(cover.cover_entity_id))
        if current is not None and target_position >= current:
            # Not a closing move (fail-safe: unknown position counts as closing).
            return target_position, None, False
        mode = action.safety_override or cover.safety.mode
        if mode == SAFETY_MODE_IGNORE:
            _LOGGER.debug(
                "Safety override ignores open contact on %s; closing to %s%%",
                cover.name,
                target_position,
            )
            return target_position, None, False
        if mode == SAFETY_MODE_CLAMP:
            _LOGGER.debug(
                "Safety rule clamps %s to ventilation position %s%%",
                cover.name,
                cover.safety.ventilation_position,
            )
            return cover.safety.ventilation_position, None, True
        return (
            None,
            (
                f"contact is {contact}; closing below "
                f"{cover.safety.ventilation_position}% is blocked"
            ),
            False,
        )

    async def async_execute(
        self, cover: CoverItem, action: CoverAction
    ) -> ExecutionOutcome:
        """Drive the cover to the action's target, honoring all guards."""
        low_kind = cover.low_mode_kind if action.mode == MODE_LOW else None

        target_position, block_reason, clamped = self._apply_safety(cover, action)
        if block_reason is not None or target_position is None:
            return ExecutionOutcome(
                RESULT_BLOCKED_SAFETY, block_reason, action.position
            )
        # Carried on every outcome below: a clamped move looks successful but
        # stopped short of the target, which the scheduler needs to know.
        clamp_note = (
            f"clamped to the ventilation position {target_position}% "
            "while the contact is open"
            if clamped
            else None
        )

        if low_kind == LOW_MODE_SCRIPT:
            return await self._async_run_low_mode_script(
                cover, target_position, clamp_note=clamp_note, clamped=clamped
            )

        entity_id = (
            cover.low_mode_entity_id
            if low_kind == LOW_MODE_ENTITY and cover.low_mode_entity_id
            else cover.cover_entity_id
        )
        state = self.hass.states.get(entity_id)
        if state is None or state.state == STATE_UNAVAILABLE:
            return ExecutionOutcome(
                RESULT_UNAVAILABLE,
                f"{entity_id} is unavailable",
                target_position,
                unavailable_entity_id=entity_id,
                safety_clamped=clamped,
            )

        caps = capabilities_from_state(state)
        speed: str | None = None
        speed_note: str | None = None
        if low_kind == LOW_MODE_SPEED:
            if caps.supports_slow_speed:
                speed = SPEED_SLOW
            else:
                speed_note = (
                    f"{entity_id} does not support the slow speed, "
                    "moved at normal speed"
                )
                _LOGGER.warning(
                    "Low mode for %s: %s does not support speed %r, "
                    "moving at normal speed",
                    cover.name,
                    entity_id,
                    SPEED_SLOW,
                )
        note = "; ".join(n for n in (clamp_note, speed_note) if n) or None
        current = current_cover_position(state)
        delta = (
            action.min_position_delta
            if action.min_position_delta is not None
            else self._default_delta
        )

        tilt_needed = action.tilt_position is not None and caps.supports_tilt
        tilt_changed = tilt_needed and (
            state.attributes.get(ATTR_CURRENT_TILT_POSITION) != action.tilt_position
        )
        position_changed = current is None or abs(current - target_position) >= max(
            delta, 1
        )

        if not position_changed and not tilt_changed:
            # A clamped move that finds the cover already parked at the
            # ventilation position is still "not at the target" — say so, or
            # the scheduler would read it as a plain no-op.
            return ExecutionOutcome(
                RESULT_SKIPPED,
                clamp_note or f"already at {current}% (min delta {delta}%)",
                target_position,
                safety_clamped=clamped,
            )

        try:
            if position_changed:
                await self._async_move(entity_id, caps, target_position, speed=speed)
            if tilt_changed and action.tilt_position is not None:
                await self.hass.services.async_call(
                    COVER_DOMAIN,
                    SERVICE_SET_COVER_TILT_POSITION,
                    {
                        ATTR_ENTITY_ID: entity_id,
                        ATTR_TILT_POSITION: action.tilt_position,
                    },
                    blocking=True,
                )
        except HomeAssistantError as err:
            return ExecutionOutcome(
                RESULT_UNAVAILABLE,
                f"service call failed: {err}",
                target_position,
                safety_clamped=clamped,
            )

        return ExecutionOutcome(
            RESULT_EXECUTED, note, target_position, safety_clamped=clamped
        )

    async def _async_move(
        self,
        entity_id: str,
        caps: CoverCapabilities,
        position: int,
        *,
        speed: str | None = None,
    ) -> None:
        """Move the cover: set_position if supported, else open/close."""
        extra = {ATTR_SPEED: speed} if speed else {}
        if caps.supports_position:
            await self.hass.services.async_call(
                COVER_DOMAIN,
                SERVICE_SET_COVER_POSITION,
                {ATTR_ENTITY_ID: entity_id, ATTR_POSITION: position, **extra},
                blocking=True,
            )
            return
        # Open/close-only covers: intermediate values map to the closer end.
        service = SERVICE_OPEN_COVER if position >= 50 else SERVICE_CLOSE_COVER
        await self.hass.services.async_call(
            COVER_DOMAIN,
            service,
            {ATTR_ENTITY_ID: entity_id, **extra},
            blocking=True,
        )

    async def _async_run_low_mode_script(
        self,
        cover: CoverItem,
        position: int,
        *,
        clamp_note: str | None = None,
        clamped: bool = False,
    ) -> ExecutionOutcome:
        """Run the configured low-mode script with the position variable."""
        script_entity = cover.low_mode_script_id or ""
        state = self.hass.states.get(script_entity)
        if state is None or state.state == STATE_UNAVAILABLE:
            return ExecutionOutcome(
                RESULT_UNAVAILABLE,
                f"{script_entity} is unavailable",
                position,
                unavailable_entity_id=script_entity,
                safety_clamped=clamped,
            )
        object_id = script_entity.split(".", 1)[-1]
        try:
            await self.hass.services.async_call(
                SCRIPT_DOMAIN,
                object_id,
                {"position": position},
                blocking=True,
            )
        except HomeAssistantError as err:
            return ExecutionOutcome(
                RESULT_UNAVAILABLE,
                f"script call failed: {err}",
                position,
                safety_clamped=clamped,
            )
        return ExecutionOutcome(
            RESULT_EXECUTED, clamp_note, position, safety_clamped=clamped
        )
