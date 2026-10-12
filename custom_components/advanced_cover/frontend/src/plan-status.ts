import { minutesOfDay } from "./helpers";
import { occVerdict } from "./preflight";
import { formatReason, reasonSeverity } from "./reasons";
import type { AssignmentRun, HomeAssistant, Occurrence } from "./types";

/* Display status of today's plan blocks — shared by the panel's Today view
   and the Lovelace card, so both always tell the same story. */

/** Aggregate display kind of a block: preflight verdict, or real result. */
export function occKind(occ: Occurrence): string {
  if (!occ.fired) return occVerdict(occ);
  const runs = occ.assignments;
  if (runs.some((r) => r.status === "armed")) return "armed";
  if (runs.some((r) => r.result === "blocked_safety")) return "blocked_safety";
  if (runs.some((r) => r.result === "unavailable")) return "unavailable";
  if (runs.some((r) => r.result === "executed")) return "executed";
  if (runs.some((r) => r.result === "expired")) return "expired";
  return "skipped";
}

/** Per-result counts of a fired block's runs, in display order.

    Unknown result strings are appended verbatim so no outcome is ever
    silently dropped from the badge row. */
const COUNT_ORDER = [
  "executed",
  "armed",
  "skipped",
  "expired",
  "unavailable",
  "blocked_safety",
];
export function occStatusCounts(occ: Occurrence): Array<[string, number]> {
  const counts = new Map<string, number>();
  for (const r of occ.assignments) {
    const kind = r.status === "armed" ? "armed" : (r.result ?? "skipped");
    counts.set(kind, (counts.get(kind) ?? 0) + 1);
  }
  const ordered: Array<[string, number]> = COUNT_ORDER.filter((k) =>
    counts.has(k)
  ).map((k) => [k, counts.get(k)!]);
  for (const [k, n] of counts) {
    if (!COUNT_ORDER.includes(k)) ordered.push([k, n]);
  }
  return ordered;
}

/** Most common reason among a fired block's non-executed runs, localized.

    Everyday outcomes ("trigger already passed", "already in position") are
    left out entirely — the status badge says it all; a wall of orange text
    on every block would drown out the reasons that matter. Shown collapsed
    only when the whole block failed: as soon as one cover executed, the
    problem is per-cover, the count badges tell the story and the details
    live in the expanded view. */
export function occReasonSummary(hass: HomeAssistant, occ: Occurrence): string | null {
  if (!occ.fired) return null;
  if (occ.assignments.some((r) => r.result === "executed")) return null;
  const counts = new Map<string, number>();
  for (const r of occ.assignments) {
    if (r.result === "executed" || !r.reason) continue;
    if (reasonSeverity(r.reason) === "noise") continue;
    counts.set(r.reason, (counts.get(r.reason) ?? 0) + 1);
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  if (!top) return null;
  const text = formatReason(hass, top[0]);
  if (!text) return null;
  return top[1] > 1 ? `${text} (${top[1]}×)` : text;
}

/** Map a block to a timeline marker color class.

    A fired block with executed covers *and* real problems (blocked /
    unavailable) renders as a green dot with a red ring: mostly fine, but
    something needs attention. */
export function timelineClass(occ: Occurrence): string {
  const kind = occKind(occ);
  if (kind === "would_run") return "will_run";
  if (occ.fired && occ.assignments.some((r) => r.result === "executed")) {
    const problems = occ.assignments.some((r) =>
      ["blocked_safety", "unavailable"].includes(r.result ?? "")
    );
    if (problems) return "executed_partial";
  }
  return kind;
}

/** Per-cover run kind for the grouped list. */
export function runKind(occ: Occurrence, run: AssignmentRun): string {
  if (!occ.fired) return run.preflight?.verdict ?? "would_run";
  if (run.status === "armed") return "armed";
  return run.result ?? "skipped";
}

export function occHasIssue(occ: Occurrence): boolean {
  if (occ.fired) {
    return occ.assignments.some((r) =>
      ["blocked_safety", "unavailable"].includes(r.result ?? "")
    );
  }
  if (occVerdict(occ) !== "would_run") return true;
  // Partially blocked blocks still deserve the issues filter.
  return occ.assignments.some(
    (r) => r.preflight && r.preflight.verdict !== "would_run"
  );
}

/** Retry window of a block as an end minute on today's strip, or null.

    Drawn only while it still matters: for upcoming blocks and for blocks
    with armed runs. A window past midnight clamps to the end of the strip. */
export function retrySpanEnd(occ: Occurrence): number | null {
  if (
    !occ.retry_until ||
    !(!occ.fired || occ.assignments.some((r) => r.status === "armed"))
  ) {
    return null;
  }
  const start = minutesOfDay(occ.planned_at);
  if (start == null) return null;
  const end = minutesOfDay(occ.retry_until);
  return end == null || end <= start ? 1440 : end;
}
