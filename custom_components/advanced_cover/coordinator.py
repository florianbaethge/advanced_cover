"""Coordinator holding entry data, day plan and the action log."""

from __future__ import annotations

import logging
from collections import deque
from datetime import datetime
from typing import TYPE_CHECKING, Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers.event import (
    EventStateChangedData,
    async_call_later,
    async_track_state_change_event,
)
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator
from homeassistant.util import dt as dt_util

from .const import (
    DOMAIN,
    EVENT_ACTION,
    EVENT_LOG_SIZE,
    RUN_STATE_ARMED,
    RUN_STATE_DONE,
    RUN_STATE_EXPIRED,
)
from .models import CoverItem, EntryData
from .store import AdvancedCoverRuntimeStore, AdvancedCoverStore

if TYPE_CHECKING:
    from datetime import date

    from .scheduler import Occurrence

_LOGGER = logging.getLogger(__name__)

# Debounce for the live preflight push: collapse a burst of state changes
# (someone arriving home flips several entities) into one snapshot.
_PREFLIGHT_DEBOUNCE_S = 1.0


class AdvancedCoverCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    """Holds configuration + volatile runtime state, notifies listeners."""

    def __init__(
        self,
        hass: HomeAssistant,
        entry: ConfigEntry,
        store: AdvancedCoverStore,
        runtime_store: AdvancedCoverRuntimeStore | None = None,
    ) -> None:
        """Initialize coordinator."""
        super().__init__(
            hass, _LOGGER, config_entry=entry, name=DOMAIN, update_interval=None
        )
        self.store = store
        # Snapshot of today's outcomes + log, so a restart does not wipe them.
        self.runtime_store = runtime_store
        # Volatile per-day state, rebuilt at midnight/restart (plan: no tracking).
        self.day_plan: list[Occurrence] = []
        self.day_plan_date: date | None = None
        self.action_log: deque[dict[str, Any]] = deque(maxlen=EVENT_LOG_SIZE)
        # Live preflight: track condition-referenced entities and push a fresh
        # snapshot (debounced) whenever one of them changes.
        self._state_unsub: CALLBACK_TYPE | None = None
        self._debounce_unsub: CALLBACK_TYPE | None = None

    @property
    def data_model(self) -> EntryData:
        """Return the persisted entry data."""
        return self.store.data

    def cover_by_id(self, cover_item_id: str) -> CoverItem | None:
        """Return cover item by id or ``None``."""
        return self.store.data.covers.get(cover_item_id)

    async def _async_update_data(self) -> dict[str, Any]:
        """Unused polling path — state is pushed via async_update_listeners."""
        return {"data": self.store.data}

    async def async_save_and_notify(self) -> None:
        """Persist entry data, notify entities/panel and reschedule."""
        await self.store.async_save()
        self.async_update_listeners()
        self._resubscribe_referenced_entities()
        domain_data = self.hass.data.get(DOMAIN, {}).get(self.config_entry.entry_id)
        if domain_data and (scheduler := domain_data.get("scheduler")):
            await scheduler.async_rebuild_plan()

    # ------------------------------------------------- live preflight tracking

    def _referenced_entities(self) -> set[str]:
        """Entities whose state feeds a preflight verdict (conditions + covers)."""
        ids: set[str] = set()
        data = self.store.data
        for cover in data.covers.values():
            if cover.cover_entity_id:
                ids.add(cover.cover_entity_id)
            if cover.contact_entity_id:
                ids.add(cover.contact_entity_id)
        for scenario in data.scenarios:
            conditions = [
                *scenario.conditions,
                *(c for a in scenario.assignments for c in a.extra_conditions),
            ]
            for cond in conditions:
                ids.update(cond.external_entity_ids())
        return ids

    @callback
    def async_setup_state_tracking(self) -> None:
        """Start pushing snapshots when referenced entities change."""
        self._resubscribe_referenced_entities()

    @callback
    def _resubscribe_referenced_entities(self) -> None:
        """(Re)subscribe to the current set of referenced entities."""
        if self._state_unsub is not None:
            self._state_unsub()
            self._state_unsub = None
        entities = sorted(self._referenced_entities())
        if not entities:
            return
        self._state_unsub = async_track_state_change_event(
            self.hass, entities, self._on_referenced_state_change
        )

    @callback
    def _on_referenced_state_change(self, _event: Event[EventStateChangedData]) -> None:
        """Debounce a burst of changes into a single snapshot push."""
        if self._debounce_unsub is not None:
            self._debounce_unsub()
        self._debounce_unsub = async_call_later(
            self.hass, _PREFLIGHT_DEBOUNCE_S, self._debounced_push
        )

    @callback
    def _debounced_push(self, _now: datetime) -> None:
        """Fire after the debounce window: refresh the panel snapshot."""
        self._debounce_unsub = None
        self.async_update_listeners()

    @callback
    def async_shutdown_state_tracking(self) -> None:
        """Release the state-change listener and any pending debounce."""
        if self._state_unsub is not None:
            self._state_unsub()
            self._state_unsub = None
        if self._debounce_unsub is not None:
            self._debounce_unsub()
            self._debounce_unsub = None

    def set_day_plan(
        self, plan: list[Occurrence], plan_date: date | None = None
    ) -> None:
        """Replace the day plan and notify listeners."""
        self.day_plan = plan
        if plan_date is not None:
            self.day_plan_date = plan_date
        self._schedule_runtime_save()
        self.async_update_listeners()

    def notify_plan_changed(self) -> None:
        """Notify listeners after in-place plan mutation (e.g. re-arm fired)."""
        self._schedule_runtime_save()
        self.async_update_listeners()

    # -------------------------------------------------- runtime persistence

    def runtime_data_for(self, day: date) -> dict[str, Any] | None:
        """Return the persisted snapshot for ``day``; ``None`` on date mismatch."""
        if self.runtime_store is None:
            return None
        data = self.runtime_store.data
        if data.get("date") != day.isoformat():
            return None
        return data

    def restore_action_log(self, day: date) -> None:
        """Re-fill the in-memory action log from the persisted snapshot."""
        data = self.runtime_data_for(day)
        if not data or self.action_log:
            return
        entries = [e for e in data.get("log") or [] if isinstance(e, dict)]
        # Stored newest-first (list(deque)); extend keeps that order.
        self.action_log.extend(entries[:EVENT_LOG_SIZE])

    def _schedule_runtime_save(self) -> None:
        """Debounced persist of today's outcomes + action log."""
        if self.runtime_store is None or self.day_plan_date is None:
            return
        self.runtime_store.async_schedule_save(
            {
                "date": self.day_plan_date.isoformat(),
                "fired": {occ.scenario_id: occ.fired for occ in self.day_plan},
                "runs": [
                    {
                        "scenario_id": occ.scenario_id,
                        "cover_item_id": run.cover_item_id,
                        "status": run.status,
                        "result": run.result,
                        "reason": run.reason,
                    }
                    for occ in self.day_plan
                    for run in occ.runs.values()
                    if run.status in (RUN_STATE_DONE, RUN_STATE_EXPIRED)
                ],
                # Running open-window delays, so a restart continues them.
                "holds": [
                    {
                        "scenario_id": occ.scenario_id,
                        "cover_item_id": run.cover_item_id,
                        "until": (
                            run.hold_until.isoformat() if run.hold_until else None
                        ),
                        "done": run.hold_done,
                    }
                    for occ in self.day_plan
                    for run in occ.runs.values()
                    if run.status == RUN_STATE_ARMED
                    and (run.hold_until is not None or run.hold_done)
                ],
                "log": list(self.action_log),
            }
        )

    def log_action(
        self,
        *,
        scenario_id: str,
        scenario_name: str,
        cover_item_id: str,
        cover_name: str,
        result: str,
        reason: str | None = None,
        position: int | None = None,
    ) -> None:
        """Append to the action log and fire the observability event."""
        entry = {
            "time": dt_util.now().isoformat(),
            "scenario_id": scenario_id,
            "scenario_name": scenario_name,
            "cover_item_id": cover_item_id,
            "cover_name": cover_name,
            "result": result,
            "reason": reason,
            "position": position,
        }
        self.action_log.appendleft(entry)
        self._schedule_runtime_save()
        self.hass.bus.async_fire(
            EVENT_ACTION,
            {
                "config_entry_id": self.config_entry.entry_id,
                "scenario_id": scenario_id,
                "cover_item_id": cover_item_id,
                "result": result,
                "reason": reason,
                "position": position,
            },
        )
        self.async_update_listeners()
