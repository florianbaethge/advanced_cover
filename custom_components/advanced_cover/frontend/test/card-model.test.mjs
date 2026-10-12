import assert from "node:assert/strict";
import { test } from "node:test";

import {
  groupByArea,
  lastRun,
  leadTime,
  nextUp,
  occPositions,
  pick,
  positionsLabel,
  runResultCounts,
  scenarioOccurrence,
  waitingRuns,
} from "../src/card/model.ts";

const at = (hhmm) => `2026-10-12T${hhmm}:00+02:00`;
const ms = (hhmm) => new Date(at(hhmm)).getTime();

const occ = (id, hhmm, fired, runs = []) => ({
  scenario_id: id,
  scenario_name: id,
  planned_at: at(hhmm),
  fired,
  assignments: runs,
});

const PLAN = [
  occ("morning", "07:30", true, [{ status: "done", target_position: 100 }]),
  occ("noon", "13:00", true, [{ status: "armed", target_position: 30 }]),
  occ("sunset", "18:25", false, [
    { status: "idle", target_position: 0 },
    { status: "idle", target_position: 20 },
  ]),
  occ("night", "22:00", false, [{ status: "idle", target_position: 0 }]),
];

test("nextUp is the earliest block that has not fired yet", () => {
  assert.equal(nextUp(PLAN, ms("14:00")).scenario_id, "sunset");
  assert.equal(nextUp(PLAN, ms("19:00")).scenario_id, "night");
  assert.equal(nextUp(PLAN, ms("23:00")), null);
  assert.equal(nextUp([], ms("12:00")), null);
});

test("a block whose time passed without firing is not coming up any more", () => {
  const run = [{ status: "idle", target_position: 0 }];
  const stale = [occ("late", "09:00", false, run), occ("later", "20:00", false, run)];
  assert.equal(nextUp(stale, ms("12:00")).scenario_id, "later");
});

test("a block without covers moves nothing and is not next", () => {
  const plan = [
    occ("empty", "15:00", false),
    occ("real", "16:00", false, [{ status: "idle", target_position: 0 }]),
  ];
  assert.equal(nextUp(plan, ms("14:00")).scenario_id, "real");
  assert.equal(nextUp([plan[0]], ms("14:00")), null);
});

test("lastRun is the latest fired block, waitingRuns the armed ones", () => {
  assert.equal(lastRun(PLAN).scenario_id, "noon");
  assert.equal(lastRun([occ("a", "09:00", false)]), null);
  assert.deepEqual(
    waitingRuns(PLAN, ms("14:00")).map((o) => o.scenario_id),
    ["noon"]
  );
});

test("a cover armed for its own later turn is not waiting for a condition", () => {
  const facade = [
    occ("facade", "09:00", true, [
      { status: "done", target_position: 0 },
      { status: "armed", target_position: 0, fire_at: at("16:40") },
    ]),
  ];
  assert.deepEqual(waitingRuns(facade, ms("12:00")), []);
  // Past its turn and still armed: now it does wait (retry window).
  assert.equal(waitingRuns(facade, ms("17:00")).length, 1);
});

test("leadTime splits into hours and minutes and never goes negative", () => {
  assert.deepEqual(leadTime(ms("18:25"), ms("14:10")), { h: 4, m: 15 });
  assert.deepEqual(leadTime(ms("14:40"), ms("14:10")), { h: 0, m: 30 });
  assert.deepEqual(leadTime(ms("12:00"), ms("14:10")), { h: 0, m: 0 });
});

test("positionsLabel shows one target or the range", () => {
  assert.equal(positionsLabel([30]), "30 %");
  assert.equal(positionsLabel([80, 30, 50]), "30–80 %");
  assert.equal(positionsLabel([]), "–");
  assert.deepEqual(occPositions(PLAN[2]), [0, 20]);
});

test("scenarioOccurrence prefers the upcoming block over a fired one", () => {
  const plan = [occ("s", "08:00", true), occ("s", "20:00", false)];
  assert.equal(scenarioOccurrence({ id: "s" }, plan).planned_at, at("20:00"));
  assert.equal(scenarioOccurrence({ id: "s" }, [plan[0]]).planned_at, at("08:00"));
  assert.equal(scenarioOccurrence({ id: "other" }, plan), null);
});

test("pick keeps the integration's order and ignores unknown ids", () => {
  const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
  assert.deepEqual(pick(items, "all"), items);
  assert.deepEqual(pick(items, undefined), items);
  assert.deepEqual(pick(items, ["c", "gone", "a"]), [{ id: "a" }, { id: "c" }]);
});

test("groupByArea keeps first-seen order and puts no-area last", () => {
  const covers = [
    { id: "1", area_id: null },
    { id: "2", area_id: "kitchen" },
    { id: "3", area_id: "living" },
    { id: "4", area_id: "kitchen" },
  ];
  assert.deepEqual(
    groupByArea(covers).map(([area, list]) => [area, list.map((c) => c.id)]),
    [
      ["kitchen", ["2", "4"]],
      ["living", ["3"]],
      [null, ["1"]],
    ]
  );
});

test("runResultCounts only counts this scenario's entries since the run", () => {
  const log = [
    { scenario_id: "s", time: at("14:10"), result: "executed" },
    { scenario_id: "s", time: at("14:10"), result: "skipped" },
    { scenario_id: "s", time: at("14:10"), result: "executed" },
    { scenario_id: "other", time: at("14:10"), result: "executed" },
    { scenario_id: "s", time: at("09:00"), result: "blocked_safety" },
  ];
  assert.deepEqual(runResultCounts(log, "s", ms("14:09")), [
    ["executed", 2],
    ["skipped", 1],
  ]);
  assert.deepEqual(runResultCounts(log, "s", ms("15:00")), []);
  // The mark is the server time of the last snapshot: what was logged up to
  // and including that instant is older than the run.
  assert.deepEqual(runResultCounts(log, "s", ms("14:10")), []);
});
