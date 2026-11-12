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

    # Before either crossing each cover reports its own time, not the block's
    # (which is only the earliest of them).
    freezer.move_to(t_south - timedelta(minutes=30))
    await scheduler.async_rebuild_plan()
    await hass.async_block_till_done()
    south_next = scheduler.next_action_for_cover("c-south")
    west_next = scheduler.next_action_for_cover("c-west")
    assert south_next is not None and west_next is not None
    assert south_next["armed"] is False and west_next["armed"] is False
    assert dt_util.parse_datetime(south_next["when"]) < dt_util.parse_datetime(
        west_next["when"]
    )
    assert (
        abs((dt_util.parse_datetime(west_next["when"]) - t_west).total_seconds()) < 60
    )

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
    # Armed, but for its own turn — the report carries that time.
    west_next = scheduler.next_action_for_cover("c-west")
    assert west_next is not None and west_next["armed"] is True
    assert west_next["fire_at"] == west_run.fire_at.isoformat()

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


async def test_first_occurrence_on_another_day(hass: HomeAssistant, freezer) -> None:
    """What the card shows once today is through: tomorrow's first run."""
    from datetime import timedelta

    from homeassistant.util import dt as dt_util

    await use_utc(hass)
    # A Friday, so "tomorrow" is a Saturday.
    freezer.move_to("2026-07-03 12:00:00+00:00")
    cover = CoverItem(id="c1", name="One", cover_entity_id="cover.one")

    def _scenario(sid: str, time_local: str, **kwargs: Any) -> Scenario:
        return Scenario(
            id=sid,
            name=sid,
            trigger=Trigger(type="fixed_time", time_local=time_local),
            assignments=[Assignment(cover_item_id="c1")],
            **kwargs,
        )

    weekdays_only = _scenario(
        "weekdays", "06:00", weekdays=["mon", "tue", "wed", "thu", "fri"]
    )
    disabled = _scenario("disabled", "05:00", enabled=False)
    no_covers = _scenario("no-covers", "05:30")
    no_covers.assignments = []
    morning = _scenario("morning", "08:00")
    evening = _scenario("evening", "20:00")
    data = EntryData(
        covers={"c1": cover},
        scenarios=[evening, weekdays_only, disabled, no_covers, morning],
    )
    scheduler = AdvancedCoverScheduler(
        hass, StubCoordinator(data), StubExecutor(ExecutionOutcome(RESULT_EXECUTED))
    )
    await scheduler.async_rebuild_plan(catch_up=False)
    tomorrow = dt_util.now().date() + timedelta(days=1)

    first = scheduler.first_occurrence_on(tomorrow)

    # Not the weekday-only one (tomorrow is Saturday), not the disabled one,
    # not the one that moves nothing: the earliest that really fires.
    assert first is not None
    assert first["scenario_id"] == "morning"
    assert first["when"].startswith(f"{tomorrow.isoformat()}T08:00")

    # A config change rebuilds the plan and with it this answer.
    morning.enabled = False
    assert scheduler.first_occurrence_on(tomorrow)["scenario_id"] == "morning"
    await scheduler.async_rebuild_plan(catch_up=False)
    assert scheduler.first_occurrence_on(tomorrow)["scenario_id"] == "evening"

    evening.enabled = False
    await scheduler.async_rebuild_plan(catch_up=False)
    assert scheduler.first_occurrence_on(tomorrow) is None

    await scheduler.async_shutdown()


# --------------------------------------------------- open-window delay (hold)


def make_delay_data(
    *,
    delay_min: int | None = 10,
    override: str | None = "clamp",
    retry_window_min: int = 0,
) -> EntryData:
    """One cover with a window contact; the scenario closes it fully."""
    data = make_data(retry_window_min=retry_window_min)
    cover = data.covers["c1"]
    cover.contact_entity_id = "binary_sensor.window"
    cover.contact_state_map = {"on": "open", "off": "closed"}
    action = data.scenarios[0].action
    action.position = 0
    action.safety_override = override
    action.safety_delay_min = delay_min
    return data


async def _fire_at(hass: HomeAssistant, freezer, when: str) -> None:
    from homeassistant.util import dt as dt_util
    from pytest_homeassistant_custom_component.common import async_fire_time_changed

    freezer.move_to(when)
    async_fire_time_changed(hass, dt_util.utcnow())
    await hass.async_block_till_done()


async def _start(
    hass: HomeAssistant, freezer, data: EntryData, executor: StubExecutor
) -> tuple[StubCoordinator, AdvancedCoverScheduler]:
    await use_utc(hass)
    freezer.move_to("2026-07-03 07:59:00+00:00")
    hass.states.async_set("cover.test", "open", {"current_position": 100})
    hass.states.async_set("binary_sensor.window", "on")
    coordinator = StubCoordinator(data)
    scheduler = AdvancedCoverScheduler(hass, coordinator, executor)
    await scheduler.async_rebuild_plan()
    await _fire_at(hass, freezer, "2026-07-03 08:00:30+00:00")
    return coordinator, scheduler


async def test_delay_waits_then_runs_the_clamped_move(
    hass: HomeAssistant, freezer
) -> None:
    """Window stays open: nothing moves during the delay, then the clamp runs."""
    executor = StubExecutor(ExecutionOutcome(RESULT_EXECUTED, "clamped", 20))
    coordinator, scheduler = await _start(hass, freezer, make_delay_data(), executor)

    run = coordinator.plan[0].runs["c1"]
    assert run.status == RUN_STATE_ARMED
    assert executor.calls == 0
    assert run.rearm_entity_ids == {"binary_sensor.window"}
    assert run.reason == (
        "window open: waits until 08:10, then closes to the ventilation position"
    )
    assert run.to_dict()["hold_until"] is not None
    assert coordinator.logs[-1]["result"] == "armed"

    await _fire_at(hass, freezer, "2026-07-03 08:05:00+00:00")
    assert executor.calls == 0

    await _fire_at(hass, freezer, "2026-07-03 08:10:31+00:00")
    run = coordinator.plan[0].runs["c1"]
    assert executor.calls == 1
    assert run.status == RUN_STATE_DONE
    assert run.result == RESULT_EXECUTED
    assert run.hold_until is None

    await scheduler.async_shutdown()


async def test_delay_window_shut_meanwhile_closes_right_away(
    hass: HomeAssistant, freezer
) -> None:
    """Shutting the window during the delay runs the normal move at once."""
    executor = StubExecutor(ExecutionOutcome(RESULT_EXECUTED, None, 0))
    data = make_delay_data(override="ignore")
    coordinator, scheduler = await _start(hass, freezer, data, executor)
    assert coordinator.plan[0].runs["c1"].reason == (
        "window open: waits until 08:10, then closes fully"
    )

    freezer.move_to("2026-07-03 08:03:00+00:00")
    hass.states.async_set("binary_sensor.window", "off")
    await hass.async_block_till_done()

    run = coordinator.plan[0].runs["c1"]
    assert executor.calls == 1
    assert run.status == RUN_STATE_DONE
    assert run.result == RESULT_EXECUTED

    # The old delay end passes without a second move.
    await _fire_at(hass, freezer, "2026-07-03 08:10:31+00:00")
    assert executor.calls == 1

    await scheduler.async_shutdown()


async def test_delay_outlives_the_retry_window(hass: HomeAssistant, freezer) -> None:
    """A delay longer than the retry window is not cut short by its expiry."""
    executor = StubExecutor(ExecutionOutcome(RESULT_EXECUTED, "clamped", 20))
    data = make_delay_data(delay_min=20, retry_window_min=5)
    coordinator, scheduler = await _start(hass, freezer, data, executor)

    await _fire_at(hass, freezer, "2026-07-03 08:06:00+00:00")
    run = coordinator.plan[0].runs["c1"]
    assert run.status == RUN_STATE_ARMED
    assert executor.calls == 0

    await _fire_at(hass, freezer, "2026-07-03 08:20:31+00:00")
    run = coordinator.plan[0].runs["c1"]
    assert executor.calls == 1
    assert run.status == RUN_STATE_DONE

    await scheduler.async_shutdown()


async def test_no_delay_when_window_is_shut(hass: HomeAssistant, freezer) -> None:
    """With the window shut the delay never starts."""
    executor = StubExecutor(ExecutionOutcome(RESULT_EXECUTED, None, 0))
    await use_utc(hass)
    freezer.move_to("2026-07-03 07:59:00+00:00")
    hass.states.async_set("cover.test", "open", {"current_position": 100})
    hass.states.async_set("binary_sensor.window", "off")
    coordinator = StubCoordinator(make_delay_data())
    scheduler = AdvancedCoverScheduler(hass, coordinator, executor)
    await scheduler.async_rebuild_plan()
    await _fire_at(hass, freezer, "2026-07-03 08:00:30+00:00")

    assert executor.calls == 1
    assert coordinator.plan[0].runs["c1"].status == RUN_STATE_DONE

    await scheduler.async_shutdown()


async def test_block_mode_ignores_the_delay(hass: HomeAssistant, freezer) -> None:
    """ "Keep position" already waits for the window: the executor decides at once."""
    executor = StubExecutor(
        ExecutionOutcome(RESULT_BLOCKED_SAFETY, "contact is open; blocked", 0)
    )
    data = make_delay_data(override="block")
    coordinator, scheduler = await _start(hass, freezer, data, executor)

    assert executor.calls == 1
    assert coordinator.plan[0].runs["c1"].result == RESULT_BLOCKED_SAFETY

    await scheduler.async_shutdown()


async def test_delay_survives_a_config_save(hass: HomeAssistant, freezer) -> None:
    """A plan rebuild during the delay keeps its end time instead of losing it."""
    executor = StubExecutor(ExecutionOutcome(RESULT_EXECUTED, "clamped", 20))
    coordinator, scheduler = await _start(hass, freezer, make_delay_data(), executor)
    hold_until = coordinator.plan[0].runs["c1"].hold_until

    freezer.move_to("2026-07-03 08:04:00+00:00")
    await scheduler.async_rebuild_plan()
    await hass.async_block_till_done()
    run = coordinator.plan[0].runs["c1"]
    assert run.status == RUN_STATE_ARMED
    assert run.hold_until == hold_until
    assert executor.calls == 0

    await _fire_at(hass, freezer, "2026-07-03 08:10:31+00:00")
    assert executor.calls == 1
    assert coordinator.plan[0].runs["c1"].status == RUN_STATE_DONE

    await scheduler.async_shutdown()


async def test_delay_restored_after_restart(hass: HomeAssistant, freezer) -> None:
    """The persisted delay continues after a restart."""
    executor = StubExecutor(ExecutionOutcome(RESULT_EXECUTED, "clamped", 20))
    await use_utc(hass)
    freezer.move_to("2026-07-03 08:04:00+00:00")
    hass.states.async_set("cover.test", "open", {"current_position": 100})
    hass.states.async_set("binary_sensor.window", "on")
    coordinator = StubCoordinator(make_delay_data())
    coordinator.runtime_data = {
        "date": "2026-07-03",
        "fired": {"s1": True},
        "runs": [],
        "holds": [
            {
                "scenario_id": "s1",
                "cover_item_id": "c1",
                "until": "2026-07-03T08:10:00+00:00",
                "done": False,
            }
        ],
    }
    scheduler = AdvancedCoverScheduler(hass, coordinator, executor)
    await scheduler.async_rebuild_plan()
    await hass.async_block_till_done()

    run = coordinator.plan[0].runs["c1"]
    assert run.status == RUN_STATE_ARMED
    assert run.reason == (
        "window open: waits until 08:10, then closes to the ventilation position"
    )
    assert executor.calls == 0

    await _fire_at(hass, freezer, "2026-07-03 08:10:31+00:00")
    assert executor.calls == 1

    await scheduler.async_shutdown()


async def test_newer_scenario_supersedes_a_running_delay(
    hass: HomeAssistant, freezer
) -> None:
    """A later scenario that moves the cover ends the older delay."""
    executor = StubExecutor(ExecutionOutcome(RESULT_EXECUTED, None, 0))
    data = make_delay_data(delay_min=30)
    night = Scenario(
        id="s2",
        name="Night",
        trigger=Trigger(type="fixed_time", time_local="08:10"),
        assignments=[Assignment(cover_item_id="c1")],
    )
    night.action.position = 0
    night.action.safety_override = "ignore"
    data.scenarios.append(night)
    coordinator, scheduler = await _start(hass, freezer, data, executor)
    assert coordinator.plan[0].runs["c1"].status == RUN_STATE_ARMED

    await _fire_at(hass, freezer, "2026-07-03 08:10:30+00:00")
    older = coordinator.plan[0].runs["c1"]
    newer = coordinator.plan[1].runs["c1"]
    assert older.status == RUN_STATE_DONE
    assert older.reason == "superseded by scenario 'Night'"
    assert newer.status == RUN_STATE_DONE
    assert executor.calls == 1

    # The older delay's end passes without moving the cover again.
    await _fire_at(hass, freezer, "2026-07-03 08:30:31+00:00")
    assert executor.calls == 1

    await scheduler.async_shutdown()
