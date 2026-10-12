import type { LogEntry, Occurrence } from "../types";
import type { CardCover, CardScenario } from "./types";

/* Pure read-model helpers for the card — no DOM, no lit, unit-tested. */

const time = (iso: string | null | undefined): number => {
  const ms = iso ? new Date(iso).getTime() : NaN;
  return Number.isNaN(ms) ? 0 : ms;
};

/** Stable key of one plan block (same shape the panel uses). */
export const occKey = (occ: Occurrence): string =>
  `${occ.scenario_id}@${occ.planned_at}`;

/** The next block that has not fired yet, or null when the day is done. */
export function nextUp(plan: Occurrence[], nowMs: number): Occurrence | null {
  const upcoming = plan
    .filter((occ) => !occ.fired && time(occ.planned_at) >= nowMs)
    .sort((a, b) => time(a.planned_at) - time(b.planned_at));
  return upcoming[0] ?? null;
}

/** The block that fired most recently, or null before the first one. */
export function lastRun(plan: Occurrence[]): Occurrence | null {
  const fired = plan
    .filter((occ) => occ.fired)
    .sort((a, b) => time(b.planned_at) - time(a.planned_at));
  return fired[0] ?? null;
}

/** Blocks with a run that fired but still waits for its conditions. */
export function waitingRuns(plan: Occurrence[]): Occurrence[] {
  return plan.filter(
    (occ) => occ.fired && occ.assignments.some((run) => run.status === "armed")
  );
}

/** Whole hours and minutes until `targetMs`; never negative. */
export function leadTime(
  targetMs: number,
  nowMs: number
): { h: number; m: number } {
  const total = Math.max(0, Math.round((targetMs - nowMs) / 60000));
  return { h: Math.floor(total / 60), m: total % 60 };
}

/** "30 %" for one target, "30–80 %" when the covers differ. */
export function positionsLabel(positions: number[]): string {
  if (!positions.length) return "–";
  const low = Math.min(...positions);
  const high = Math.max(...positions);
  return low === high ? `${low} %` : `${low}–${high} %`;
}

/** Distinct targets of one plan block's covers. */
export function occPositions(occ: Occurrence): number[] {
  return [...new Set(occ.assignments.map((run) => run.target_position))];
}

/** Today's block of a scenario — the upcoming one first, else the last fired. */
export function scenarioOccurrence(
  scenario: CardScenario,
  plan: Occurrence[]
): Occurrence | null {
  const own = plan.filter((occ) => occ.scenario_id === scenario.id);
  return own.find((occ) => !occ.fired) ?? own[own.length - 1] ?? null;
}

/** Keep the configured selection, in the integration's own order. */
export function pick<T extends { id: string }>(
  items: T[],
  selection: "all" | string[] | undefined
): T[] {
  if (!Array.isArray(selection)) return items;
  return items.filter((item) => selection.includes(item.id));
}

/** Covers bucketed by area, areas in first-seen order, "no area" last. */
export function groupByArea(
  covers: CardCover[]
): Array<[string | null, CardCover[]]> {
  const groups = new Map<string | null, CardCover[]>();
  for (const cover of covers) {
    const key = cover.area_id ?? null;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(cover);
  }
  const entries = [...groups.entries()];
  return [
    ...entries.filter(([area]) => area !== null),
    ...entries.filter(([area]) => area === null),
  ];
}

/** Per-result counts of a manual run, read back from the action log.

    A manual run answers with a bare "ok"; what each cover did only shows up
    as log entries. Everything logged for the scenario since `sinceMs` is
    that run. */
export function runResultCounts(
  log: LogEntry[],
  scenarioId: string,
  sinceMs: number
): Array<[string, number]> {
  const counts = new Map<string, number>();
  for (const entry of log) {
    if (entry.scenario_id !== scenarioId || time(entry.time) < sinceMs) continue;
    counts.set(entry.result, (counts.get(entry.result) ?? 0) + 1);
  }
  return [...counts.entries()];
}
