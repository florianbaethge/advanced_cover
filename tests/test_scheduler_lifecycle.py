"""Behavioral scheduler tests: midnight rollover, unavailable re-arm, startup.

These use the real Home Assistant test instance (timers, event bus, state
machine) with a stub coordinator/executor, so they cover the plan lifecycle
end to end.
"""

from __future__ import annotations

from typing import Any

from custom_components.advanced_cover.const import (
    RESULT_BLOCKED_SAFETY,
    RESULT_EXECUTED,
    RESULT_UNAVAILABLE,
    RUN_STATE_ARMED,
    RUN_STATE_DONE,
    RUN_STATE_EXPIRED,
    RUN_STATE_IDLE,
)
from custom_components.advanced_cover.executor import ExecutionOutcome
from custom_components.advanced_cover.models import (
    ActivePeriod,
    Assignment,
    CoverItem,
    EntryData,
    Scenario,
    Trigger,
)
from custom_components.advanced_cover.scheduler import AdvancedCoverScheduler
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import CoreState, HomeAssistant


class StubCoordinator:
    """Minimal coordinator surface used by the scheduler."""

    def __init__(self, data: EntryData) -> None:
        self.data_model = data
        self.plan: list[Any] = []
        self.logs: list[dict[str, Any]] = []
        self.runtime_data: dict[str, Any] | None = None

    def set_day_plan(self, plan: list[Any], plan_date: Any = None) -> None:
        self.plan = plan

    def runtime_data_for(self, day: Any) -> dict[str, Any] | None:
        if self.runtime_data and self.runtime_data.get("date") == day.isoformat():
            return self.runtime_data
        return None

    def notify_plan_changed(self) -> None:
        pass

    def log_action(self, **kwargs: Any) -> None:
        self.logs.append(kwargs)

    def cover_by_id(self, cover_item_id: str):
        return self.data_model.covers.get(cover_item_id)


class StubExecutor:
    """Returns queued outcomes and counts calls."""

    def __init__(self, *outcomes: ExecutionOutcome) -> None:
        self.outcomes = list(outcomes)
        self.calls = 0

    async def async_execute(self, cover, action) -> ExecutionOutcome:
        self.calls += 1
        return self.outcomes.pop(0)


async def use_utc(hass: HomeAssistant) -> None:
    """Pin the instance to UTC so wall-clock literals below are unambiguous."""
    await hass.config.async_set_time_zone("UTC")


def make_data(*, retry_window_min: int = 0, time_local: str = "08:00") -> EntryData:
    cover = CoverItem(id="c1", name="Cover", cover_entity_id="cover.test")
    scenario = Scenario(
        id="s1",
        name="Scenario",
        trigger=Trigger(type="fixed_time", time_local=time_local),
        retry_window_min=retry_window_min,
        assignments=[Assignment(cover_item_id="c1")],
    )
    return EntryData(covers={"c1": cover}, scenarios=[scenario])


async def test_midnight_rollover_starts_fresh(hass: HomeAssistant, freezer) -> None:
    """Yesterday's outcomes must not leak into a new day's plan."""
    await use_utc(hass)
    freezer.move_to("2026-07-03 12:00:00+00:00")
    coordinator = StubCoordinator(make_data())
    scheduler = AdvancedCoverScheduler(hass, coordinator, StubExecutor())
    await scheduler.async_rebuild_plan()

    occ = coordinator.plan[0]
    assert occ.fired is True
    assert occ.runs["c1"].status == RUN_STATE_EXPIRED

    # Same-day rebuild (config save): outcomes are carried over.
    await scheduler.async_rebuild_plan()
    occ = coordinator.plan[0]
    assert occ.fired is True
    assert occ.runs["c1"].status == RUN_STATE_EXPIRED

    # Next day (midnight rollover / rebuild after a date change): fresh plan.
    freezer.move_to("2026-07-04 00:00:30+00:00")
    await scheduler.async_rebuild_plan()
    occ = coordinator.plan[0]
    assert occ.fired is False
    assert occ.runs["c1"].status == RUN_STATE_IDLE
    assert occ.runs["c1"].result is None

    await scheduler.async_shutdown()


async def test_active_period_keeps_scenario_out_of_the_plan(
    hass: HomeAssistant, freezer
) -> None:
    """Outside its active periods a scenario is not planned at all."""
    await use_utc(hass)
    freezer.move_to("2026-03-31 06:00:00+00:00")
    data = make_data()
    data.scenarios[0].active_periods = [
        ActivePeriod("04-01", "05-31"),
        ActivePeriod("09-03", "10-12"),
    ]
    coordinator = StubCoordinator(data)
    executor = StubExecutor(ExecutionOutcome(RESULT_EXECUTED))
    scheduler = AdvancedCoverScheduler(hass, coordinator, executor)
    await scheduler.async_rebuild_plan()
    assert coordinator.plan == []

    # A manual run ignores the period, just like it ignores the weekdays.
    await scheduler.async_run_scenario("s1")
    assert executor.calls == 1

    freezer.move_to("2026-04-01 00:00:30+00:00")
    await scheduler.async_rebuild_plan()
    assert [occ.scenario_id for occ in coordinator.plan] == ["s1"]

    freezer.move_to("2026-06-01 00:00:30+00:00")
    await scheduler.async_rebuild_plan()
    assert coordinator.plan == []

    freezer.move_to("2026-09-03 00:00:30+00:00")
    await scheduler.async_rebuild_plan()
    assert [occ.scenario_id for occ in coordinator.plan] == ["s1"]

    await scheduler.async_shutdown()


async def test_unavailable_within_retry_window_arms_and_recovers(
    hass: HomeAssistant, freezer
) -> None:
    """An unavailable target entity re-arms and executes once it comes back."""
    await use_utc(hass)
    freezer.move_to("2026-07-03 08:10:00+00:00")
    executor = StubExecutor(
        ExecutionOutcome(
            RESULT_UNAVAILABLE,
            "cover.test is unavailable",
            0,
            unavailable_entity_id="cover.test",
        ),
        ExecutionOutcome(RESULT_EXECUTED, None, 0),
    )
    coordinator = StubCoordinator(make_data(retry_window_min=60))
    scheduler = AdvancedCoverScheduler(hass, coordinator, executor)
    await scheduler.async_rebuild_plan()
    await hass.async_block_till_done()

    run = coordinator.plan[0].runs["c1"]
    assert run.status == RUN_STATE_ARMED
    assert run.rearm_entity_ids == {"cover.test"}

    hass.states.async_set("cover.test", "open")
    await hass.async_block_till_done()

    run = coordinator.plan[0].runs["c1"]
    assert run.status == RUN_STATE_DONE
    assert run.result == RESULT_EXECUTED
    assert executor.calls == 2

    await scheduler.async_shutdown()


async def test_unavailable_without_retry_window_finishes(
    hass: HomeAssistant, freezer
) -> None:
    """No retry window: unavailable stays a terminal outcome."""
    await use_utc(hass)
    freezer.move_to("2026-07-03 08:10:00+00:00")
    executor = StubExecutor(
        ExecutionOutcome(
            RESULT_UNAVAILABLE,
            "cover.test is unavailable",
            0,
            unavailable_entity_id="cover.test",
        ),
    )
    coordinator = StubCoordinator(make_data(retry_window_min=0))
    scheduler = AdvancedCoverScheduler(hass, coordinator, executor)
    await scheduler.async_rebuild_plan()

    occ = coordinator.plan[0]
    # Planned time passed and no retry window -> expired without execution.
    assert occ.runs["c1"].status == RUN_STATE_EXPIRED
    assert executor.calls == 0

    await scheduler.async_shutdown()


async def test_startup_defers_catchup_until_started(
    hass: HomeAssistant, freezer
) -> None:
    """During HA startup nothing fires; the post-startup rebuild catches up."""
    await use_utc(hass)
    freezer.move_to("2026-07-03 12:00:00+00:00")
    hass.set_state(CoreState.starting)
    coordinator = StubCoordinator(make_data())
    executor = StubExecutor()
    scheduler = AdvancedCoverScheduler(hass, coordinator, executor)
    await scheduler.async_setup()

    occ = coordinator.plan[0]
    assert occ.fired is False
    assert occ.runs["c1"].status == RUN_STATE_IDLE

    hass.set_state(CoreState.running)
    hass.bus.async_fire(EVENT_HOMEASSISTANT_STARTED)
    await hass.async_block_till_done()

    occ = coordinator.plan[0]
    assert occ.fired is True
    assert occ.runs["c1"].status == RUN_STATE_EXPIRED
    assert executor.calls == 0

    await scheduler.async_shutdown()


async def test_relative_azimuth_covers_fire_at_their_own_times(
    hass: HomeAssistant, freezer
) -> None:
    """Facade-relative trigger: the south cover fires first, the west cover
    stays armed and executes once the sun reaches its facade."""
    from datetime import timedelta

    from homeassistant.util import dt as dt_util

    await use_utc(hass)
    freezer.move_to("2026-07-03 12:00:00+00:00")

    south = CoverItem(
        id="c-south", name="South", cover_entity_id="cover.south", azimuth=150
    )
    west = CoverItem(
        id="c-west", name="West", cover_entity_id="cover.west", azimuth=210
    )
    scenario = Scenario(
        id="s-rel",
        name="Facade",
        trigger=Trigger(type="sun_azimuth", az_relative=True, azimuth_offset_deg=0),
        assignments=[
            Assignment(cover_item_id="c-south"),
            Assignment(cover_item_id="c-west"),
        ],
    )
    data = EntryData(covers={"c-south": south, "c-west": west}, scenarios=[scenario])
    executor = StubExecutor(
        ExecutionOutcome(RESULT_EXECUTED, None, 0),
        ExecutionOutcome(RESULT_EXECUTED, None, 0),
    )
    coordinator = StubCoordinator(data)
    scheduler = AdvancedCoverScheduler(hass, coordinator, executor)

    day = dt_util.now().date()
    t_south = scheduler.azimuth_crossing_local(150.0, day)
    t_west = scheduler.azimuth_crossing_local(210.0, day)
    assert t_south is not None and t_west is not None and t_south < t_west

    # Between the two crossings: catch-up fires the occurrence, the south
    # cover executes, the west cover arms for its own later time.
    freezer.move_to(t_south + timedelta(minutes=1))
    await scheduler.async_rebuild_plan()
    await hass.async_block_till_done()

    occ = coordinator.plan[0]
    assert occ.fired is True
    assert occ.runs["c-south"].status == RUN_STATE_DONE
    assert occ.runs["c-south"].result == RESULT_EXECUTED
    west_run = occ.runs["c-west"]
    assert west_run.status == RUN_STATE_ARMED
    assert west_run.fire_at is not None
    assert abs((west_run.fire_at - t_west).total_seconds()) < 60
    assert west_run.rearm_entity_ids == {"sun.sun"}
    assert executor.calls == 1

    # Past the west crossing a sun.sun update re-checks the armed run.
    freezer.move_to(t_west + timedelta(minutes=1))
    hass.states.async_set(
        "sun.sun", "above_horizon", {"azimuth": 215.0, "elevation": 30.0}
    )
    await hass.async_block_till_done()

    west_run = coordinator.plan[0].runs["c-west"]
    assert west_run.status == RUN_STATE_DONE
    assert west_run.result == RESULT_EXECUTED
    assert executor.calls == 2

    await scheduler.async_shutdown()


async def test_blocked_safety_within_retry_window_arms_and_recovers(
    hass: HomeAssistant, freezer
) -> None:
    """A safety-blocked run re-arms on the contact and executes once it closes."""
    await use_utc(hass)
    freezer.move_to("2026-07-03 08:10:00+00:00")
    executor = StubExecutor(
        ExecutionOutcome(
            RESULT_BLOCKED_SAFETY,
            "contact is open; closing below 20% is blocked",
            0,
        ),
        ExecutionOutcome(RESULT_EXECUTED, None, 0),
    )
    data = make_data(retry_window_min=60)
    data.covers["c1"].contact_entity_id = "binary_sensor.window"
    coordinator = StubCoordinator(data)
    scheduler = AdvancedCoverScheduler(hass, coordinator, executor)
    await scheduler.async_rebuild_plan()
    await hass.async_block_till_done()

    run = coordinator.plan[0].runs["c1"]
    assert run.status == RUN_STATE_ARMED
    assert run.rearm_entity_ids == {"binary_sensor.window"}
    assert run.safety_blocked is True

    # Window gets closed inside the retry window -> the move runs after all.
    hass.states.async_set("binary_sensor.window", "off")
    await hass.async_block_till_done()

    run = coordinator.plan[0].runs["c1"]
    assert run.status == RUN_STATE_DONE
    assert run.result == RESULT_EXECUTED
    assert executor.calls == 2

    await scheduler.async_shutdown()


async def test_blocked_safety_expiry_keeps_blocked_result(
    hass: HomeAssistant, freezer
) -> None:
    """When the retry window ends still blocked, the outcome stays 'blocked'."""
    await use_utc(hass)
    freezer.move_to("2026-07-03 08:10:00+00:00")
    executor = StubExecutor(
        ExecutionOutcome(
            RESULT_BLOCKED_SAFETY,
            "contact is open; closing below 20% is blocked",
            0,
        ),
    )
    data = make_data(retry_window_min=30)
    data.covers["c1"].contact_entity_id = "binary_sensor.window"
    coordinator = StubCoordinator(data)
    scheduler = AdvancedCoverScheduler(hass, coordinator, executor)
    await scheduler.async_rebuild_plan()
    await hass.async_block_till_done()
    assert coordinator.plan[0].runs["c1"].status == RUN_STATE_ARMED

    # Past retry_until (08:00 + 30 min): the next contact change expires the
    # run, but the visible outcome stays blocked_safety, not a generic expiry.
    freezer.move_to("2026-07-03 09:00:00+00:00")
    hass.states.async_set("binary_sensor.window", "on")
    await hass.async_block_till_done()

    run = coordinator.plan[0].runs["c1"]
    assert run.status == RUN_STATE_EXPIRED
    assert run.result == RESULT_BLOCKED_SAFETY
    assert executor.calls == 1

    await scheduler.async_shutdown()


async def test_safety_clamp_within_retry_window_closes_after_contact_shuts(
    hass: HomeAssistant, freezer
) -> None:
    """A clamped run keeps waiting and reaches its target once the window closes."""
    await use_utc(hass)
    freezer.move_to("2026-07-03 08:10:00+00:00")
    executor = StubExecutor(
        ExecutionOutcome(
            RESULT_EXECUTED,
            "clamped to the ventilation position 20% while the contact is open",
            20,
            safety_clamped=True,
        ),
        ExecutionOutcome(RESULT_EXECUTED, None, 0),
    )
    data = make_data(retry_window_min=60)
    data.covers["c1"].contact_entity_id = "binary_sensor.window"
    coordinator = StubCoordinator(data)
    scheduler = AdvancedCoverScheduler(hass, coordinator, executor)
    await scheduler.async_rebuild_plan()
    await hass.async_block_till_done()

    run = coordinator.plan[0].runs["c1"]
    assert run.status == RUN_STATE_ARMED
    assert run.rearm_entity_ids == {"binary_sensor.window"}
    assert run.safety_clamped is True
    assert run.safety_blocked is False

    hass.states.async_set("binary_sensor.window", "off")
    await hass.async_block_till_done()

    run = coordinator.plan[0].runs["c1"]
    assert run.status == RUN_STATE_DONE
    assert run.result == RESULT_EXECUTED
    assert run.safety_clamped is False
    assert executor.calls == 2

    await scheduler.async_shutdown()


async def test_safety_clamp_expiry_keeps_the_partial_outcome(
    hass: HomeAssistant, freezer
) -> None:
    """Window stays open past the retry window: the clamped move is the outcome."""
    await use_utc(hass)
    freezer.move_to("2026-07-03 08:10:00+00:00")
    executor = StubExecutor(
        ExecutionOutcome(
            RESULT_EXECUTED,
            "clamped to the ventilation position 20% while the contact is open",
            20,
            safety_clamped=True,
        ),
    )
    data = make_data(retry_window_min=30)
    data.covers["c1"].contact_entity_id = "binary_sensor.window"
    coordinator = StubCoordinator(data)
    scheduler = AdvancedCoverScheduler(hass, coordinator, executor)
    await scheduler.async_rebuild_plan()
    await hass.async_block_till_done()
    assert coordinator.plan[0].runs["c1"].status == RUN_STATE_ARMED

    freezer.move_to("2026-07-03 09:00:00+00:00")
    hass.states.async_set("binary_sensor.window", "on")
    await hass.async_block_till_done()

    run = coordinator.plan[0].runs["c1"]
    assert run.status == RUN_STATE_EXPIRED
    # Not "expired": the cover really did move to the ventilation position.
    assert run.result == RESULT_EXECUTED
    assert "ventilation position" in (run.reason or "")
    assert executor.calls == 1

    await scheduler.async_shutdown()


async def test_safety_clamp_without_retry_window_finishes(
    hass: HomeAssistant, freezer
) -> None:
    """With no retry window a clamped move is simply today's outcome."""
    from homeassistant.util import dt as dt_util
    from pytest_homeassistant_custom_component.common import async_fire_time_changed

    await use_utc(hass)
    freezer.move_to("2026-07-03 07:59:00+00:00")
    executor = StubExecutor(
        ExecutionOutcome(RESULT_EXECUTED, "clamped", 20, safety_clamped=True),
    )
    data = make_data(retry_window_min=0)
    data.covers["c1"].contact_entity_id = "binary_sensor.window"
    coordinator = StubCoordinator(data)
    scheduler = AdvancedCoverScheduler(hass, coordinator, executor)
    await scheduler.async_rebuild_plan()

    # Trigger time arrives: the run fires once and is done — nothing to wait for.
    freezer.move_to("2026-07-03 08:00:30+00:00")
    async_fire_time_changed(hass, dt_util.utcnow())
    await hass.async_block_till_done()

    run = coordinator.plan[0].runs["c1"]
    assert run.status == RUN_STATE_DONE
    assert run.result == RESULT_EXECUTED
    assert executor.calls == 1

    await scheduler.async_shutdown()


async def test_restart_carryover_restores_persisted_outcomes(
    hass: HomeAssistant, freezer
) -> None:
    """First rebuild after a restart restores today's outcomes from the store."""
    await use_utc(hass)
    freezer.move_to("2026-07-03 12:00:00+00:00")
    coordinator = StubCoordinator(make_data())
    coordinator.runtime_data = {
        "date": "2026-07-03",
        "fired": {"s1": True},
        "runs": [
            {
                "scenario_id": "s1",
                "cover_item_id": "c1",
                "status": RUN_STATE_DONE,
                "result": RESULT_EXECUTED,
                "reason": None,
            }
        ],
    }
    executor = StubExecutor()
    scheduler = AdvancedCoverScheduler(hass, coordinator, executor)
    await scheduler.async_rebuild_plan()

    occ = coordinator.plan[0]
    assert occ.fired is True
    assert occ.runs["c1"].status == RUN_STATE_DONE
    assert occ.runs["c1"].result == RESULT_EXECUTED
    assert executor.calls == 0
    await scheduler.async_shutdown()

    # A snapshot from another day is ignored: normal expiry applies.
    coordinator.runtime_data["date"] = "2026-07-02"
    scheduler2 = AdvancedCoverScheduler(hass, coordinator, StubExecutor())
    await scheduler2.async_rebuild_plan()
    occ = coordinator.plan[0]
    assert occ.runs["c1"].status == RUN_STATE_EXPIRED
    await scheduler2.async_shutdown()
