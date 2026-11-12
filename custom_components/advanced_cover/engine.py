"""Pure condition evaluation engine.

No Home Assistant imports beyond constants: the engine works on a
``get_state`` callable and a :class:`CoverContext` snapshot so it can be
tested without a running core. All conditions are AND-ed; multiple states
inside one ``entity_state`` condition are OR-ed (the only OR in the model).

Fail-safe: unavailable/unknown entity states make a condition fail — the
integration never moves a cover "just in case".
"""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass, field
from typing import Any

from .const import (
    AZ_MODE_OFF,
    AZ_MODE_RELATIVE,
    COND_CONTACT,
    COND_COVER_POSITION,
    COND_ENTITY_STATE,
    COND_ENTITY_STATE_NOT,
    COND_NUMERIC_STATE,
    COND_SUN_POSITION,
    CONTACT_OPEN,
    CONTACT_TILTED,
    CONTACT_UNKNOWN,
    POSITION_OP_ABOVE,
    POSITION_OP_BELOW,
    POSITION_OP_BETWEEN,
)
from .models import Condition

# States that always count as "no usable value" (fail-safe).
_UNUSABLE_STATES = (None, "unknown", "unavailable", "")

GetState = Callable[[str], str | None]


@dataclass(frozen=True)
class CoverContext:
    """Snapshot of the assigned cover for cover-scoped conditions."""

    position: int | None = None  # current cover position 0-100, None if unknown
    contact: str = CONTACT_UNKNOWN  # resolved contact abstraction
    contact_entity_id: str | None = None  # for re-arm subscription
    azimuth: int | None = None  # facade azimuth for relative sun conditions


@dataclass(frozen=True)
class SunContext:
    """Snapshot of the sun's current position (from ``sun.sun``)."""

    azimuth: float | None = None
    elevation: float | None = None


@dataclass
class EvaluationResult:
    """Outcome of evaluating a condition list (AND semantics)."""

    passed: bool
    failed_reasons: list[str] = field(default_factory=list)
    # External entities from *failed* conditions; a state change of any of
    # them re-evaluates the whole list while the assignment is armed.
    rearm_entity_ids: set[str] = field(default_factory=set)


def _check_entity_state(cond: Condition, get_state: GetState) -> str | None:
    """Return failure reason or ``None`` when passed."""
    if not cond.entity_id or not cond.states:
        return "invalid condition: missing entity or states"
    state = get_state(cond.entity_id)
    if state in _UNUSABLE_STATES:
        return f"{cond.entity_id} is unavailable"
    if cond.type == COND_ENTITY_STATE:
        if state in cond.states:
            return None
        return f"{cond.entity_id} is '{state}', expected one of {cond.states}"
    # entity_state_not
    if state not in cond.states:
        return None
    return f"{cond.entity_id} is '{state}', expected none of {cond.states}"


def _check_cover_position(cond: Condition, cover: CoverContext) -> str | None:
    """Return failure reason or ``None`` when passed."""
    if cover.position is None:
        return "cover position is unknown"
    pos = cover.position
    if cond.op == POSITION_OP_ABOVE:
        if cond.value is None:
            return "invalid condition: missing value"
        if pos > cond.value:
            return None
        return f"cover position {pos}% is not above {cond.value:g}%"
    if cond.op == POSITION_OP_BELOW:
        if cond.value is None:
            return "invalid condition: missing value"
        if pos < cond.value:
            return None
        return f"cover position {pos}% is not below {cond.value:g}%"
    if cond.op == POSITION_OP_BETWEEN:
        if cond.value is None or cond.value2 is None:
            return "invalid condition: missing range"
        low, high = sorted((cond.value, cond.value2))
        if low <= pos <= high:
            return None
        return f"cover position {pos}% is not between {low:g}% and {high:g}%"
    return f"invalid condition: unknown operator '{cond.op}'"


def _check_contact(cond: Condition, cover: CoverContext) -> str | None:
    """Return failure reason or ``None`` when passed."""
    if not cond.accepted:
        return "invalid condition: no accepted contact states"
    if cover.contact_entity_id is None:
        return "no contact sensor configured"
    if cover.contact == CONTACT_UNKNOWN:
        return "contact state is unknown"
    if cover.contact in cond.accepted:
        return None
    return f"contact is '{cover.contact}', expected one of {cond.accepted}"


def _check_numeric_state(cond: Condition, get_state: GetState) -> str | None:
    """Return failure reason or ``None`` when passed."""
    if not cond.entity_id:
        return "invalid condition: missing entity"
    if cond.above is None and cond.below is None:
        return "invalid condition: no threshold"
    state = get_state(cond.entity_id)
    if state in _UNUSABLE_STATES:
        return f"{cond.entity_id} is unavailable"
    try:
        value = float(state)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return f"{cond.entity_id} value '{state}' is not numeric"
    if cond.above is not None and value <= cond.above:
        return f"{cond.entity_id} is {value:g}, not above {cond.above:g}"
    if cond.below is not None and value >= cond.below:
        return f"{cond.entity_id} is {value:g}, not below {cond.below:g}"
    return None


def _az_in_window(azimuth: float, start: float, end: float) -> bool:
    """Whether ``azimuth`` lies in the clockwise window from ``start`` to ``end``.

    Wrap-aware (a window 300°→60° spans north) and free of any assumption
    about the sun's direction of travel, so it is hemisphere-neutral.
    """
    span = (end - start) % 360.0
    return (azimuth - start) % 360.0 <= span


def _sun_window(cond: Condition, cover: CoverContext) -> tuple[float, float] | None:
    """Resolve the condition's azimuth window to absolute compass degrees."""
    if cond.az_from is None or cond.az_to is None:
        return None
    if cond.az_mode == AZ_MODE_RELATIVE:
        if cover.azimuth is None:
            return None
        return (
            (cover.azimuth + cond.az_from) % 360.0,
            (cover.azimuth + cond.az_to) % 360.0,
        )
    return (cond.az_from % 360.0, cond.az_to % 360.0)


def _check_sun_position(
    cond: Condition, sun: SunContext, cover: CoverContext
) -> str | None:
    """Return failure reason or ``None`` when passed."""
    has_elevation = cond.above is not None or cond.below is not None
    if not has_elevation and cond.az_mode == AZ_MODE_OFF:
        return "invalid condition: no sun constraint"
    if has_elevation:
        if sun.elevation is None:
            return "sun elevation is unavailable"
        if cond.above is not None and sun.elevation <= cond.above:
            return f"sun elevation {sun.elevation:.1f}° is not above {cond.above:g}°"
        if cond.below is not None and sun.elevation >= cond.below:
            return f"sun elevation {sun.elevation:.1f}° is not below {cond.below:g}°"
    if cond.az_mode != AZ_MODE_OFF:
        if cond.az_from is None or cond.az_to is None:
            return "invalid condition: missing azimuth window"
        if cond.az_mode == AZ_MODE_RELATIVE and cover.azimuth is None:
            return "cover has no facade direction configured"
        if sun.azimuth is None:
            return "sun azimuth is unavailable"
        window = _sun_window(cond, cover)
        if window is None:
            return "invalid condition: missing azimuth window"
        start, end = window
        if not _az_in_window(sun.azimuth, start, end):
            return f"sun azimuth {sun.azimuth:.0f}° is outside {start:.0f}°-{end:.0f}°"
    return None


def evaluate_condition(
    cond: Condition,
    get_state: GetState,
    cover: CoverContext,
    sun: SunContext | None = None,
) -> str | None:
    """Evaluate one condition; return failure reason or ``None`` when passed."""
    if cond.type in (COND_ENTITY_STATE, COND_ENTITY_STATE_NOT):
        return _check_entity_state(cond, get_state)
    if cond.type == COND_COVER_POSITION:
        return _check_cover_position(cond, cover)
    if cond.type == COND_CONTACT:
        return _check_contact(cond, cover)
    if cond.type == COND_NUMERIC_STATE:
        return _check_numeric_state(cond, get_state)
    if cond.type == COND_SUN_POSITION:
        return _check_sun_position(cond, sun or SunContext(), cover)
    return f"invalid condition: unknown type '{cond.type}'"


def is_cover_scoped(cond: Condition) -> bool:
    """Whether a condition can only be answered against a concrete cover.

    Scenario-level conditions are AND-ed onto every assigned cover at trigger
    time (see :meth:`scheduler._async_run_assignment`), so these types are
    perfectly valid in a scenario — they simply have to be evaluated once per
    cover instead of once per scenario.
    """
    if cond.type in (COND_COVER_POSITION, COND_CONTACT):
        return True
    return cond.type == COND_SUN_POSITION and cond.az_mode == AZ_MODE_RELATIVE


def split_cover_scoped(
    conditions: list[Condition],
) -> tuple[list[Condition], list[Condition]]:
    """Split conditions into (scenario-wide, cover-scoped), keeping order."""
    wide: list[Condition] = []
    scoped: list[Condition] = []
    for cond in conditions:
        (scoped if is_cover_scoped(cond) else wide).append(cond)
    return wide, scoped


def _rearm_entities_for(cond: Condition, cover: CoverContext) -> list[str]:
    """External entities whose changes may satisfy this failed condition.

    ``cover_position`` deliberately never re-arms (plan §3): a manually moved
    cover must not cause a surprise automatic run.
    """
    if cond.type == COND_CONTACT:
        return [cover.contact_entity_id] if cover.contact_entity_id else []
    return cond.external_entity_ids()


def _merge_entity_state_conditions(conditions: list[Condition]) -> list[Condition]:
    """Merge multiple ``entity_state`` conditions on the same entity into one.

    Their states are OR-ed — the single deliberate OR in the model (plan
    §2.3). Other condition types are kept as-is, in order.
    """
    merged: list[Condition] = []
    by_entity: dict[str, Condition] = {}
    for cond in conditions:
        if cond.type != COND_ENTITY_STATE or not cond.entity_id:
            merged.append(cond)
            continue
        existing = by_entity.get(cond.entity_id)
        if existing is None:
            copy = Condition(
                type=COND_ENTITY_STATE,
                entity_id=cond.entity_id,
                states=list(cond.states),
            )
            by_entity[cond.entity_id] = copy
            merged.append(copy)
        else:
            existing.states.extend(s for s in cond.states if s not in existing.states)
    return merged


def evaluate_conditions(
    conditions: list[Condition],
    get_state: GetState,
    cover: CoverContext,
    sun: SunContext | None = None,
) -> EvaluationResult:
    """Evaluate all conditions with AND semantics.

    All conditions are always evaluated (no short-circuit) so that the
    re-arm listener set covers every currently failing condition.
    """
    failed_reasons: list[str] = []
    rearm: set[str] = set()
    for cond in _merge_entity_state_conditions(conditions):
        reason = evaluate_condition(cond, get_state, cover, sun)
        if reason is None:
            continue
        failed_reasons.append(reason)
        rearm.update(_rearm_entities_for(cond, cover))
    return EvaluationResult(
        passed=not failed_reasons,
        failed_reasons=failed_reasons,
        rearm_entity_ids=rearm,
    )


# ---------------------------------------------------------------------------
# Preflight: per-condition evaluation for the live "would run / would skip"
# display in the panel. Verdict (ok) comes from the very same primitives the
# trigger path uses (``evaluate_condition``), so the two never diverge.
# ---------------------------------------------------------------------------

# scope values
SCOPE_SCENARIO = "scenario"
SCOPE_ASSIGNMENT = "assignment"
SCOPE_SAFETY = "safety"

# rollup verdicts
VERDICT_WOULD_RUN = "would_run"
VERDICT_WOULD_SKIP = "would_skip"
VERDICT_UNKNOWN = "unknown"

# i18n summary keys (rendered in the frontend via IntlMessageFormat)
_SUM_ENTITY_STATE = "config_panel.cond_sum_entity_state"
_SUM_ENTITY_STATE_NOT = "config_panel.cond_sum_entity_state_not"
_SUM_COVER_POSITION = "config_panel.cond_sum_cover_position"
_SUM_CONTACT = "config_panel.cond_sum_contact"
_SUM_NUMERIC = "config_panel.cond_sum_numeric"
_SUM_SUN_POSITION = "config_panel.cond_sum_sun_position"
_SUM_SAFETY = "config_panel.cond_sum_safety"
_SUM_SAFETY_CLAMP = "config_panel.cond_sum_safety_clamp"
_SUM_SAFETY_IGNORE = "config_panel.cond_sum_safety_ignore"
_SUM_SAFETY_CLAMP_DELAYED = "config_panel.cond_sum_safety_clamp_delayed"
_SUM_SAFETY_IGNORE_DELAYED = "config_panel.cond_sum_safety_ignore_delayed"
_SUM_UNAVAILABLE = "config_panel.cond_sum_unavailable"
_SUM_POSITION_UNKNOWN = "config_panel.cond_sum_position_unknown"
_SUM_NO_CONTACT = "config_panel.cond_sum_no_contact"
_SUM_NO_FACADE = "config_panel.cond_sum_no_facade"
_SUM_AUTOMATION_DISABLED = "config_panel.cond_sum_automation_disabled"
_SUM_INVALID = "config_panel.cond_sum_invalid"


@dataclass
class ConditionEval:
    """One evaluated condition, ready to render as a checklist line."""

    scope: str
    type: str
    entity_id: str | None
    ok: bool | None  # None = cannot be evaluated (unavailable / missing)
    actual: str | None
    summary_key: str
    summary_values: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        """Serialize for the WebSocket API."""
        return {
            "scope": self.scope,
            "type": self.type,
            "entity_id": self.entity_id,
            "ok": self.ok,
            "actual": self.actual,
            "summary_key": self.summary_key,
            "summary_values": dict(self.summary_values),
        }


def _condition_actual(
    cond: Condition, get_state: GetState, cover: CoverContext, sun: SunContext
) -> str | None:
    """Raw current value of the entity/quantity a condition looks at."""
    if cond.type in (COND_ENTITY_STATE, COND_ENTITY_STATE_NOT, COND_NUMERIC_STATE):
        return get_state(cond.entity_id) if cond.entity_id else None
    if cond.type == COND_COVER_POSITION:
        return None if cover.position is None else str(cover.position)
    if cond.type == COND_CONTACT:
        return cover.contact
    if cond.type == COND_SUN_POSITION:
        if sun.azimuth is None or sun.elevation is None:
            return None
        return f"{sun.azimuth:.0f}° / {sun.elevation:.1f}°"
    return None


def _condition_unavailable(
    cond: Condition, get_state: GetState, cover: CoverContext, sun: SunContext
) -> bool:
    """Return True when a condition cannot be evaluated (missing value)."""
    if cond.type in (COND_ENTITY_STATE, COND_ENTITY_STATE_NOT, COND_NUMERIC_STATE):
        if not cond.entity_id:
            return True
        return get_state(cond.entity_id) in _UNUSABLE_STATES
    if cond.type == COND_COVER_POSITION:
        return cover.position is None
    if cond.type == COND_CONTACT:
        return cover.contact_entity_id is None or cover.contact == CONTACT_UNKNOWN
    if cond.type == COND_SUN_POSITION:
        if cond.az_mode == AZ_MODE_RELATIVE and cover.azimuth is None:
            return True
        return sun.azimuth is None or sun.elevation is None
    return False


def _op_and_value(cond: Condition) -> tuple[str, str]:
    """Human-oriented (operator, value) pair for cover/numeric summaries."""
    if cond.type == COND_COVER_POSITION:
        if cond.op == POSITION_OP_BETWEEN and cond.value is not None:
            low, high = sorted((cond.value, cond.value2 or cond.value))
            return POSITION_OP_BETWEEN, f"{low:g}-{high:g}"
        return cond.op, f"{cond.value:g}" if cond.value is not None else "?"
    # numeric_state
    if cond.above is not None and cond.below is not None:
        return POSITION_OP_BETWEEN, f"{cond.above:g}-{cond.below:g}"
    if cond.above is not None:
        return POSITION_OP_ABOVE, f"{cond.above:g}"
    if cond.below is not None:
        return POSITION_OP_BELOW, f"{cond.below:g}"
    return "?", "?"


def _sun_elev_requirement(cond: Condition) -> str:
    """Short, language-neutral elevation requirement ("> 15°", "15°-30°")."""
    if cond.above is not None and cond.below is not None:
        return f"{cond.above:g}°-{cond.below:g}°"
    if cond.above is not None:
        return f"> {cond.above:g}°"
    if cond.below is not None:
        return f"< {cond.below:g}°"
    return "—"


def _sun_az_requirement(cond: Condition, cover: CoverContext) -> str:
    """Short azimuth-window requirement in absolute compass degrees."""
    if cond.az_mode == AZ_MODE_OFF:
        return "—"
    window = _sun_window(cond, cover)
    if window is None:
        return "?"
    return f"{window[0]:.0f}°-{window[1]:.0f}°"


def _summary_for(
    cond: Condition,
    actual: str | None,
    cover: CoverContext,
    *,
    unavailable: bool,
) -> tuple[str, dict[str, Any]]:
    """Build (summary_key, values) for a condition's checklist line."""
    if unavailable:
        # Cover-scoped types carry no entity id of their own — name the thing
        # that is actually missing instead of rendering a bare "?".
        if cond.type == COND_SUN_POSITION:
            if cond.az_mode == AZ_MODE_RELATIVE and cover.azimuth is None:
                return _SUM_NO_FACADE, {}
            return _SUM_UNAVAILABLE, {"entity": "sun.sun"}
        if cond.type == COND_COVER_POSITION:
            return _SUM_POSITION_UNKNOWN, {}
        if cond.type == COND_CONTACT:
            if cover.contact_entity_id is None:
                return _SUM_NO_CONTACT, {}
            return _SUM_UNAVAILABLE, {"entity": cover.contact_entity_id}
        return _SUM_UNAVAILABLE, {"entity": cond.entity_id or "?"}
    if cond.type == COND_ENTITY_STATE:
        return _SUM_ENTITY_STATE, {
            "entity": cond.entity_id or "?",
            "actual": actual or "?",
            "expected": ", ".join(cond.states),
        }
    if cond.type == COND_ENTITY_STATE_NOT:
        return _SUM_ENTITY_STATE_NOT, {
            "entity": cond.entity_id or "?",
            "expected": ", ".join(cond.states),
        }
    if cond.type == COND_COVER_POSITION:
        op, value = _op_and_value(cond)
        return _SUM_COVER_POSITION, {
            "actual": actual or "?",
            "op": op,
            "value": value,
        }
    if cond.type == COND_CONTACT:
        return _SUM_CONTACT, {
            "actual": actual or "?",
            "expected": ", ".join(cond.accepted),
        }
    if cond.type == COND_NUMERIC_STATE:
        op, value = _op_and_value(cond)
        return _SUM_NUMERIC, {
            "entity": cond.entity_id or "?",
            "actual": actual or "?",
            "op": op,
            "value": value,
        }
    if cond.type == COND_SUN_POSITION:
        return _SUM_SUN_POSITION, {
            "actual": actual or "?",
            "elev_req": _sun_elev_requirement(cond),
            "az_req": _sun_az_requirement(cond, cover),
        }
    return _SUM_INVALID, {}


def evaluate_condition_eval(
    cond: Condition,
    get_state: GetState,
    cover: CoverContext,
    scope: str,
    sun: SunContext | None = None,
) -> ConditionEval:
    """Evaluate one condition into a render-ready :class:`ConditionEval`.

    ``ok`` uses the exact same primitive as the trigger path
    (:func:`evaluate_condition`): ``None`` reason means pass. A failure is
    reported as ``ok is None`` when the value is simply unavailable, else
    ``ok is False``.
    """
    sun_ctx = sun or SunContext()
    reason = evaluate_condition(cond, get_state, cover, sun_ctx)
    unavailable = _condition_unavailable(cond, get_state, cover, sun_ctx)
    ok: bool | None
    if reason is None:
        ok = True
    elif unavailable:
        ok = None
    else:
        ok = False
    actual = _condition_actual(cond, get_state, cover, sun_ctx)
    summary_key, summary_values = _summary_for(
        cond, actual, cover, unavailable=ok is None
    )
    entity_id = cover.contact_entity_id if cond.type == COND_CONTACT else cond.entity_id
    return ConditionEval(
        scope=scope,
        type=cond.type,
        entity_id=entity_id,
        ok=ok,
        actual=actual,
        summary_key=summary_key,
        summary_values=summary_values,
    )


def evaluate_conditions_detailed(
    conditions: list[Condition],
    get_state: GetState,
    cover: CoverContext,
    scope: str,
    sun: SunContext | None = None,
) -> list[ConditionEval]:
    """Render-ready evaluation of a condition list (same merge as the engine)."""
    return [
        evaluate_condition_eval(cond, get_state, cover, scope, sun)
        for cond in _merge_entity_state_conditions(conditions)
    ]


def safety_would_block(
    *,
    contact: str,
    block_when_tilted: bool,
    ventilation_position: int,
    target_position: int,
    current_position: int | None,
) -> bool:
    """Whether the safety rule would block this closing move right now.

    Mirrors :meth:`executor.CoverExecutor._apply_safety` as a pure predicate
    so the preflight matches what execution would do (fail-safe: an unknown
    current position counts as a closing move).
    """
    blocking = contact == CONTACT_OPEN or (
        contact == CONTACT_TILTED and block_when_tilted
    )
    if not blocking:
        return False
    if target_position >= ventilation_position:
        return False
    # Fail-safe: an unknown current position counts as a closing move.
    return not (current_position is not None and target_position >= current_position)


def rollup_preflight(evals: list[ConditionEval], evaluated_at: str) -> dict[str, Any]:
    """Roll a list of :class:`ConditionEval` up into a Preflight dict.

    - any ``ok is False``  → ``would_skip``
    - else any ``ok is None`` → ``unknown``
    - else (incl. empty)   → ``would_run``
    """
    failing = sum(1 for e in evals if e.ok is False)
    if failing:
        verdict = VERDICT_WOULD_SKIP
    elif any(e.ok is None for e in evals):
        verdict = VERDICT_UNKNOWN
    else:
        verdict = VERDICT_WOULD_RUN
    return {
        "verdict": verdict,
        "evaluated_at": evaluated_at,
        "failing": failing,
        "conditions": [e.to_dict() for e in evals],
    }


def disabled_condition_eval(scope: str) -> ConditionEval:
    """Return a synthetic failing condition for a disabled master/cover switch."""
    return ConditionEval(
        scope=scope,
        type="automation_disabled",
        entity_id=None,
        ok=False,
        actual=None,
        summary_key=_SUM_AUTOMATION_DISABLED,
        summary_values={},
    )


def safety_condition_eval(*, blocked: bool, ventilation_position: int) -> ConditionEval:
    """Return a ConditionEval line for the per-cover safety rule."""
    return ConditionEval(
        scope=SCOPE_SAFETY,
        type="safety_rule",
        entity_id=None,
        ok=not blocked,
        actual=None,
        summary_key=_SUM_SAFETY,
        summary_values={"ventilation": ventilation_position},
    )


def safety_clamp_eval(
    *, ventilation_position: int, delay_min: int = 0
) -> ConditionEval:
    """Info line: the safety rule will clamp this move to the ventilation gap.

    ``ok=True`` on purpose — a clamped move still runs, it just stops at the
    ventilation position instead of the scenario target. With a delay it
    first waits that long for the window to be shut.
    """
    return ConditionEval(
        scope=SCOPE_SAFETY,
        type="safety_clamp",
        entity_id=None,
        ok=True,
        actual=None,
        summary_key=_SUM_SAFETY_CLAMP_DELAYED if delay_min else _SUM_SAFETY_CLAMP,
        summary_values=(
            {"ventilation": ventilation_position, "minutes": delay_min}
            if delay_min
            else {"ventilation": ventilation_position}
        ),
    )


def safety_ignore_eval(*, delay_min: int = 0) -> ConditionEval:
    """Info line: the safety override closes fully despite the open window.

    ``ok=True`` — the move runs to the full scenario target (after the
    delay, if one is set).
    """
    return ConditionEval(
        scope=SCOPE_SAFETY,
        type="safety_ignore",
        entity_id=None,
        ok=True,
        actual=None,
        summary_key=_SUM_SAFETY_IGNORE_DELAYED if delay_min else _SUM_SAFETY_IGNORE,
        summary_values={"minutes": delay_min} if delay_min else {},
    )
