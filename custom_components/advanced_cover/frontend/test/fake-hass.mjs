// A `hass` stand-in that localizes from the shipped English translations, so
// the tests assert the texts a user actually reads.
import { readFileSync } from "node:fs";

const en = JSON.parse(
  readFileSync(new URL("../../translations/en.json", import.meta.url), "utf8")
);

function flatten(node, prefix, out) {
  for (const [key, value] of Object.entries(node)) {
    const path = `${prefix}.${key}`;
    if (typeof value === "string") out[path] = value;
    else flatten(value, path, out);
  }
  return out;
}

const messages = flatten(en, "component.advanced_cover", {});

export function fakeHass(states = {}) {
  return {
    language: "en",
    states,
    localize(key, values = {}) {
      const message = messages[key];
      if (message === undefined) return "";
      return message.replace(/\{(\w+)\}/g, (_, name) => String(values[name]));
    },
    formatEntityState(stateObj, state) {
      const value = state ?? stateObj.state;
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
  };
}

/** A complete scenario with the defaults of a new one; override per test. */
export function scenario(overrides = {}) {
  return {
    id: "s1",
    name: "Test",
    enabled: true,
    trigger: { type: "fixed_time", time_local: "08:30", sun_event: "sunset", offset_min: 0 },
    random_window_min: 0,
    random_direction: "both",
    weekdays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    active_periods: [],
    conditions: [],
    retry_window_min: 0,
    action: {
      position: 0,
      tilt_position: null,
      mode: "normal",
      min_position_delta: null,
      safety_override: null,
    },
    assignments: [],
    ...overrides,
  };
}
