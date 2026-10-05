/**
 * One-line summaries of a scenario's parts.
 *
 * The scenario editor is an accordion: a collapsed section shows what it
 * holds, so an existing scenario reads like a sentence (when … only if …
 * then … for these covers). The scenario list uses the same texts, so the
 * two can never describe one scenario differently.
 *
 * No rendering imports on purpose — this module is unit-tested under Node.
 */

import { formatAzimuth } from "./azimuth";
import { formatMonthDay } from "./helpers";
import { t } from "./i18n";
import type { Condition, HomeAssistant, Scenario } from "./types";

type Hass = HomeAssistant | undefined;

/** The editor's sections, in reading order. */
export const SECTIONS = ["when", "only_if", "then", "covers"] as const;
export type SectionId = (typeof SECTIONS)[number];

const WEEKDAY_COUNT = 7;
/** Stands in for the part of a condition that has not been chosen yet. */
const PENDING = "…";
const SEPARATOR = " · ";

// Number and unit never wrap apart ("1" at the end of a line, "h" on the next).
const NBSP = "\u00a0";

/** "45 min" below an hour, "4 h" from there on (re-arm and random windows). */
export function formatWindow(minutes: number): string {
  return minutes < 60 || minutes % 60
    ? `${minutes}${NBSP}min`
    : `${minutes / 60}${NBSP}h`;
}

function signed(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}

/** What fires the scenario: "08:30", "Sunset +20 min", "Sun direction SW". */
export function triggerText(hass: Hass, s: Scenario): string {
  const trigger = s.trigger;
  const offset = trigger.offset_min ? ` ${signed(trigger.offset_min)}${NBSP}min` : "";
  if (trigger.type === "fixed_time") return trigger.time_local ?? "";
  if (trigger.type === "sun_azimuth") {
    const target = trigger.az_relative
      ? `${t(hass, "config_panel.cond_sun_rel_short")} ${signed(
          trigger.azimuth_offset_deg ?? 0
        )}°`
      : formatAzimuth(trigger.azimuth_deg ?? 180);
    return `${t(hass, "config_panel.trigger_sun_azimuth")} ${target}${offset}`;
  }
  if (trigger.type === "sun_elevation") {
    const arrow = (trigger.elevation_dir ?? "falling") === "rising" ? "↑" : "↓";
    return `${t(hass, "config_panel.trigger_sun_elevation")} ${arrow} ${
      trigger.elevation_deg ?? 0
    }°${offset}`;
  }
  return `${t(hass, `config_panel.sun_${trigger.sun_event}`)}${offset}`;
}

/** The random window as a range ("± 15 min"), or `null` when it is off. */
export function randomText(s: Scenario): string | null {
  const window = s.random_window_min;
  if (!window) return null;
  if (s.random_direction === "after") return `+0…${window}${NBSP}min`;
  if (s.random_direction === "before") return `−${window}…0${NBSP}min`;
  return `±${NBSP}${window}${NBSP}min`;
}

/** "daily", or the selected weekdays in week order. */
export function weekdaysText(hass: Hass, s: Scenario): string {
  // An empty selection is stored as "every day" by the backend.
  if (!s.weekdays.length || s.weekdays.length === WEEKDAY_COUNT) {
    return t(hass, "config_panel.weekdays_all");
  }
  return s.weekdays.map((d) => t(hass, `config_panel.weekday_${d}`)).join(" ");
}

/** The active periods ("Apr 1 – May 31, Sep 3 – Oct 12"); empty = all year. */
export function periodsText(hass: Hass, s: Scenario): string {
  return (s.active_periods ?? [])
    .map((p) => `${formatMonthDay(hass, p.from)} – ${formatMonthDay(hass, p.to)}`)
    .join(", ");
}

/** Trigger, random window, weekdays and time of year — the scenario list line. */
export function scheduleText(hass: Hass, s: Scenario): string {
  const random = randomText(s);
  const trigger = random
    ? `${triggerText(hass, s)} ${random}`
    : triggerText(hass, s);
  return [trigger, weekdaysText(hass, s), periodsText(hass, s)]
    .filter(Boolean)
    .join(SEPARATOR);
}

/** Summary of the "When" section: the schedule plus the re-arm window. */
export function summarizeWhen(hass: Hass, s: Scenario): string {
  const retry = s.retry_window_min
    ? t(hass, "config_panel.scenarios_sum_retry", {
        window: formatWindow(s.retry_window_min),
      })
    : "";
  return [scheduleText(hass, s), retry].filter(Boolean).join(SEPARATOR);
}

/** Friendly name of an entity, falling back to its id. */
export function entityName(hass: Hass, entityId: string | null | undefined): string {
  if (!entityId) return "";
  const name = hass?.states?.[entityId]?.attributes?.friendly_name;
  return typeof name === "string" && name ? name : entityId;
}

function stateLabel(hass: Hass, entityId: string | null | undefined, state: string): string {
  const stateObj = entityId ? hass?.states?.[entityId] : undefined;
  if (!stateObj || !hass?.formatEntityState) return state;
  return hass.formatEntityState(stateObj, state) || state;
}

/** One condition as a short phrase ("Weather = Sunny", "Position > 5%"). */
export function conditionText(hass: Hass, cond: Condition): string {
  const entity = entityName(hass, cond.entity_id);
  // A condition that is still being filled in reads "… = …", never a bare "=".
  const states =
    (cond.states ?? [])
      .map((state) => stateLabel(hass, cond.entity_id, state))
      .join("/") || PENDING;
  const entityBased =
    cond.type === "entity_state" ||
    cond.type === "entity_state_not" ||
    cond.type === "numeric_state";
  if (entityBased && !entity) {
    return `${t(hass, `config_panel.cond_type_${cond.type}`)} ${PENDING}`;
  }
  switch (cond.type) {
    case "entity_state":
      return `${entity} = ${states}`;
    case "entity_state_not":
      return `${entity} ≠ ${states}`;
    case "numeric_state": {
      const bounds = [
        cond.above != null ? `> ${cond.above}` : "",
        cond.below != null ? `< ${cond.below}` : "",
      ].filter(Boolean);
      return `${entity} ${bounds.join(" ") || PENDING}`;
    }
    case "cover_position": {
      const label = t(hass, "config_panel.scenarios_position");
      if (cond.op === "between") {
        const [low, high] = [cond.value ?? 0, cond.value2 ?? cond.value ?? 0].sort(
          (a, b) => a - b
        );
        return `${label} ${low}–${high}%`;
      }
      return `${label} ${cond.op === "below" ? "<" : ">"} ${cond.value ?? 0}%`;
    }
    case "contact":
      return `${t(hass, "config_panel.cond_type_contact")}: ${(cond.accepted ?? [])
        .map((state) => t(hass, `config_panel.contact_${state}`))
        .join("/")}`;
    case "sun_position": {
      const parts: string[] = [];
      if (cond.above != null) parts.push(`> ${cond.above}°`);
      if (cond.below != null) parts.push(`< ${cond.below}°`);
      if (cond.az_mode === "absolute") {
        parts.push(`${cond.az_from ?? 0}°–${cond.az_to ?? 0}°`);
      } else if (cond.az_mode === "relative") {
        parts.push(
          `${t(hass, "config_panel.cond_sun_rel_short")} ${signed(
            cond.az_from ?? 0
          )}°…${signed(cond.az_to ?? 0)}°`
        );
      }
      return `${t(hass, "config_panel.cond_type_sun_position")}: ${parts.join(SEPARATOR)}`;
    }
    default:
      return "";
  }
}

/** `items`, cut to `max` entries with a "+n" for the rest. */
function truncated(hass: Hass, items: string[], max: number, separator: string): string {
  if (items.length <= max) return items.join(separator);
  const more = t(hass, "config_panel.scenarios_cond_more", { n: items.length - max });
  return `${items.slice(0, max).join(separator)} ${more}`;
}

/** Summary of the "Only if" section; says so when nothing restricts the run. */
export function summarizeConditions(hass: Hass, conditions: Condition[], max = 2): string {
  if (!conditions.length) return t(hass, "config_panel.scenarios_sum_always");
  return truncated(
    hass,
    conditions.map((cond) => conditionText(hass, cond)),
    max,
    SEPARATOR
  );
}

/** Summary of the "Then" section: target plus every non-default option. */
export function summarizeThen(hass: Hass, s: Scenario): string {
  const action = s.action;
  const parts = [`→ ${action.position}%`];
  if (action.tilt_position != null) {
    parts.push(`${t(hass, "config_panel.scenarios_tilt")} ${action.tilt_position}%`);
  }
  if (action.mode === "low") {
    parts.push(
      `${t(hass, "config_panel.scenarios_mode")}: ${t(hass, "config_panel.mode_low")}`
    );
  }
  if (action.safety_override) {
    parts.push(t(hass, `config_panel.safety_override_${action.safety_override}`));
  }
  if (action.min_position_delta != null) {
    parts.push(
      `${t(hass, "config_panel.scenarios_opt_min_delta")} ${action.min_position_delta}%`
    );
  }
  return parts.join(SEPARATOR);
}

/** Summary of the "Covers" section from the assigned covers' names. */
export function summarizeCovers(hass: Hass, coverNames: string[], max = 3): string {
  if (!coverNames.length) return t(hass, "config_panel.scenarios_sum_no_covers");
  return truncated(hass, coverNames, max, ", ");
}

/** Value shown on the "time of year" option chip. */
export function periodValue(hass: Hass, s: Scenario): string {
  const count = (s.active_periods ?? []).length;
  if (!count) return t(hass, "config_panel.scenarios_period_all_year");
  if (count === 1) return periodsText(hass, s);
  return t(hass, "config_panel.scenarios_period_count", { n: count });
}
