import assert from "node:assert/strict";
import { test } from "node:test";

import {
  conditionText,
  formatWindow,
  periodValue,
  randomText,
  scheduleText,
  summarizeConditions,
  summarizeCovers,
  summarizeThen,
  summarizeWhen,
  triggerText,
  weekdaysText,
} from "../src/scenario-summary.ts";
import { fakeHass, scenario } from "./fake-hass.mjs";

const hass = fakeHass({
  "input_boolean.away": { state: "on", attributes: { friendly_name: "Everyone away" } },
});
// The summaries glue number and unit with a no-break space; compare readably.
const plain = (text) => text.replaceAll(" ", " ");

test("formatWindow switches to hours from a full hour on", () => {
  assert.equal(plain(formatWindow(45)), "45 min");
  assert.equal(plain(formatWindow(60)), "1 h");
  assert.equal(plain(formatWindow(90)), "90 min");
  assert.equal(plain(formatWindow(480)), "8 h");
  assert.ok(formatWindow(60).includes(" "), "number and unit must not wrap apart");
});

test("triggerText covers every trigger type", () => {
  const trigger = (t) => plain(triggerText(hass, scenario({ trigger: t })));
  assert.equal(trigger({ type: "fixed_time", time_local: "08:30" }), "08:30");
  assert.equal(
    trigger({ type: "sun_event", sun_event: "sunset", offset_min: 20 }),
    "Sunset +20 min"
  );
  assert.equal(
    trigger({ type: "sun_event", sun_event: "sunrise", offset_min: -15 }),
    "Sunrise -15 min"
  );
  assert.equal(trigger({ type: "sun_azimuth", azimuth_deg: 225 }), "Sun direction SW");
  assert.equal(trigger({ type: "sun_azimuth", azimuth_deg: 200 }), "Sun direction 200°");
  assert.equal(
    trigger({ type: "sun_azimuth", az_relative: true, azimuth_offset_deg: -30 }),
    "Sun direction facade -30°"
  );
  assert.equal(
    trigger({ type: "sun_elevation", elevation_deg: 12, elevation_dir: "rising" }),
    "Sun height ↑ 12°"
  );
});

test("randomText shows the range in the chosen direction", () => {
  const random = (window, direction) =>
    randomText(scenario({ random_window_min: window, random_direction: direction }));
  assert.equal(random(0, "both"), null);
  assert.equal(plain(random(15, "both")), "± 15 min");
  assert.equal(plain(random(15, "after")), "+0…15 min");
  assert.equal(plain(random(30, "before")), "−30…0 min");
});

test("weekdaysText treats an empty selection like every day", () => {
  assert.equal(weekdaysText(hass, scenario()), "daily");
  assert.equal(weekdaysText(hass, scenario({ weekdays: [] })), "daily");
  assert.equal(weekdaysText(hass, scenario({ weekdays: ["mon", "sat"] })), "Mon Sat");
});

test("scheduleText and summarizeWhen read like a sentence", () => {
  const s = scenario({
    random_window_min: 15,
    random_direction: "after",
    weekdays: ["mon", "tue"],
    active_periods: [
      { from: "04-01", to: "05-31" },
      { from: "09-03", to: "10-12" },
    ],
    retry_window_min: 240,
  });
  assert.equal(
    plain(scheduleText(hass, s)),
    "08:30 +0…15 min · Mon Tue · Apr 1 – May 31, Sep 3 – Oct 12"
  );
  assert.equal(
    plain(summarizeWhen(hass, s)),
    "08:30 +0…15 min · Mon Tue · Apr 1 – May 31, Sep 3 – Oct 12 · keeps trying for 4 h"
  );
  assert.equal(summarizeWhen(hass, scenario()), "08:30 · daily");
});

test("periodValue names one period and counts several", () => {
  assert.equal(periodValue(hass, scenario()), "All year");
  assert.equal(
    periodValue(hass, scenario({ active_periods: [{ from: "04-01", to: "09-30" }] })),
    "Apr 1 – Sep 30"
  );
  assert.equal(
    periodValue(
      hass,
      scenario({
        active_periods: [
          { from: "04-01", to: "05-31" },
          { from: "09-03", to: "10-12" },
        ],
      })
    ),
    "2 periods"
  );
});

test("conditionText uses friendly names and localized states", () => {
  assert.equal(
    conditionText(hass, { type: "entity_state", entity_id: "input_boolean.away", states: ["on"] }),
    "Everyone away = On"
  );
  // An entity Home Assistant does not know keeps its id and raw states.
  assert.equal(
    conditionText(hass, {
      type: "entity_state_not",
      entity_id: "sensor.gone",
      states: ["rainy", "cloudy"],
    }),
    "sensor.gone ≠ rainy/cloudy"
  );
  assert.equal(
    conditionText(hass, { type: "numeric_state", entity_id: "sensor.lux", above: 40000 }),
    "sensor.lux > 40000"
  );
  assert.equal(
    conditionText(hass, { type: "cover_position", op: "above", value: 5 }),
    "Position > 5%"
  );
  assert.equal(
    conditionText(hass, { type: "cover_position", op: "between", value: 80, value2: 20 }),
    "Position 20–80%"
  );
  assert.equal(
    conditionText(hass, { type: "contact", accepted: ["closed", "tilted"] }),
    "Window contact: Closed/Tilted"
  );
  assert.equal(
    conditionText(hass, {
      type: "sun_position",
      above: 20,
      az_mode: "relative",
      az_from: -45,
      az_to: 45,
    }),
    "Sun position: > 20° · facade -45°…+45°"
  );
});

test("conditionText marks what a half-filled condition still lacks", () => {
  assert.equal(
    conditionText(hass, { type: "entity_state", entity_id: "", states: [] }),
    "An entity has a state …"
  );
  assert.equal(
    conditionText(hass, { type: "entity_state", entity_id: "input_boolean.away", states: [] }),
    "Everyone away = …"
  );
  assert.equal(
    conditionText(hass, { type: "numeric_state", entity_id: "sensor.lux" }),
    "sensor.lux …"
  );
});

test("summarizeConditions says when nothing restricts the run", () => {
  assert.equal(summarizeConditions(hass, []), "Always — no conditions");
  const conditions = [
    { type: "entity_state", entity_id: "input_boolean.away", states: ["on"] },
    { type: "cover_position", op: "above", value: 5 },
    { type: "numeric_state", entity_id: "sensor.lux", above: 40000 },
  ];
  assert.equal(
    summarizeConditions(hass, conditions.slice(0, 2)),
    "Everyone away = On · Position > 5%"
  );
  assert.equal(
    summarizeConditions(hass, conditions),
    "Everyone away = On · Position > 5% +1"
  );
});

test("summarizeThen lists the target and every non-default option", () => {
  assert.equal(summarizeThen(hass, scenario()), "→ 0%");
  assert.equal(
    summarizeThen(
      hass,
      scenario({
        action: {
          position: 20,
          tilt_position: 50,
          mode: "low",
          min_position_delta: 5,
          safety_override: "ignore",
        },
      })
    ),
    "→ 20% · Tilt 50% · Mode: Low · Close fully (ignore open window) · Min. change 5%"
  );
});

test("summarizeCovers truncates a long list", () => {
  assert.equal(summarizeCovers(hass, []), "No covers yet");
  assert.equal(summarizeCovers(hass, ["Kitchen", "Office"]), "Kitchen, Office");
  assert.equal(
    summarizeCovers(hass, ["Kitchen", "Office", "Bath", "Hall", "Attic"]),
    "Kitchen, Office, Bath +2"
  );
});
