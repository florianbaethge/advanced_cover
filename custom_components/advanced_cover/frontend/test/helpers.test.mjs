import assert from "node:assert/strict";
import { test } from "node:test";

import {
  daysInMonth,
  formatMonthDay,
  formatTime,
  inActivePeriods,
  minutesOfDay,
  nextPeriodStart,
  parseMonthDay,
  toMonthDay,
  useTimeZone,
} from "../src/helpers.ts";

const day = (month, date) => new Date(2026, month - 1, date, 12);

test("parseMonthDay accepts real yearless dates only", () => {
  assert.deepEqual(parseMonthDay("04-01"), { month: 4, day: 1 });
  assert.deepEqual(parseMonthDay("2-29"), { month: 2, day: 29 });
  for (const bad of ["04-31", "13-01", "00-10", "april", "", null, undefined]) {
    assert.equal(parseMonthDay(bad), null, String(bad));
  }
});

test("toMonthDay pads and clamps the day to the month", () => {
  assert.equal(toMonthDay(4, 1), "04-01");
  assert.equal(toMonthDay(4, 31), "04-30");
  assert.equal(toMonthDay(2, 31), "02-29");
  assert.equal(daysInMonth(2), 29);
});

test("formatMonthDay follows the user's language", () => {
  assert.equal(formatMonthDay({ language: "en" }, "04-01"), "Apr 1");
  assert.equal(formatMonthDay({ language: "de" }, "04-01"), "1. Apr.");
  assert.equal(formatMonthDay({ language: "en" }, "nope"), "–");
});

test("no periods means active all year", () => {
  assert.equal(inActivePeriods([], day(1, 1)), true);
  assert.equal(inActivePeriods(undefined, day(1, 1)), true);
});

test("a period includes both of its days", () => {
  const summer = [{ from: "04-01", to: "10-15" }];
  assert.equal(inActivePeriods(summer, day(3, 31)), false);
  assert.equal(inActivePeriods(summer, day(4, 1)), true);
  assert.equal(inActivePeriods(summer, day(10, 15)), true);
  assert.equal(inActivePeriods(summer, day(10, 16)), false);
});

test("several periods are OR-ed", () => {
  const shoulder = [
    { from: "04-01", to: "05-31" },
    { from: "09-03", to: "10-12" },
  ];
  assert.equal(inActivePeriods(shoulder, day(5, 31)), true);
  assert.equal(inActivePeriods(shoulder, day(7, 1)), false);
  assert.equal(inActivePeriods(shoulder, day(9, 3)), true);
  assert.equal(inActivePeriods(shoulder, day(10, 13)), false);
});

test("a start after the end wraps over the turn of the year", () => {
  const winter = [{ from: "10-16", to: "03-31" }];
  assert.equal(inActivePeriods(winter, day(12, 31)), true);
  assert.equal(inActivePeriods(winter, day(1, 1)), true);
  assert.equal(inActivePeriods(winter, day(4, 1)), false);
  assert.equal(inActivePeriods(winter, day(10, 15)), false);
});

test("nextPeriodStart names the period that begins next", () => {
  const shoulder = [
    { from: "04-01", to: "05-31" },
    { from: "09-03", to: "10-12" },
  ];
  assert.equal(nextPeriodStart(shoulder, day(7, 1)), "09-03");
  // Past the last start of the year: the first one of next year.
  assert.equal(nextPeriodStart(shoulder, day(11, 20)), "04-01");
  assert.equal(nextPeriodStart([], day(7, 1)), null);
});

test("times follow Home Assistant's zone when the profile says \"server\"", () => {
  // 18:25 in Berlin (UTC+2 in October before the change).
  const iso = "2026-10-12T18:25:00+02:00";
  const local = new Date(iso);
  const browserMinutes = local.getHours() * 60 + local.getMinutes();

  useTimeZone({ locale: { time_zone: "server" }, config: { time_zone: "Asia/Tokyo" } });
  // Tokyo is seven hours ahead of Berlin then: 01:25 the next day.
  assert.equal(minutesOfDay(iso), 60 + 25);
  assert.match(formatTime(iso), /0?1:25/);

  useTimeZone({ locale: { time_zone: "server" }, config: { time_zone: "Europe/Berlin" } });
  assert.equal(minutesOfDay(iso), 18 * 60 + 25);

  // "local" (the default), a missing profile and an unknown zone all mean
  // the browser's own clock.
  for (const hass of [
    { locale: { time_zone: "local" }, config: { time_zone: "Asia/Tokyo" } },
    undefined,
    { locale: { time_zone: "server" }, config: { time_zone: "Mars/Olympus" } },
  ]) {
    useTimeZone(hass);
    assert.equal(minutesOfDay(iso), browserMinutes);
  }
});
