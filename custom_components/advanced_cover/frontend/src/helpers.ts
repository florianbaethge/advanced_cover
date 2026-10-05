import { fireEvent } from "./fire-event";
import { t } from "./i18n";
import type { ActivePeriod, HomeAssistant } from "./types";

/** Home Assistant may put a string or structured object in `error`. */
export function formatApiError(value: unknown, hass?: HomeAssistant): string {
  const fallback =
    hass?.localize != null
      ? t(hass, "config_panel.errors_request_failed")
      : "Request failed";
  if (value == null || value === "") {
    return fallback;
  }
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Error) {
    return value.message;
  }
  if (typeof value === "object") {
    const o = value as Record<string, unknown>;
    if (typeof o.message === "string") {
      return o.message;
    }
    if (typeof o.error === "string") {
      return o.error;
    }
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }
  return String(value);
}

/** Safe when the panel bundle runs twice (navigation, scoped custom element registry). */
export function defineCustomElementOnce(
  name: string,
  constructor: CustomElementConstructor,
  options?: ElementDefinitionOptions
): void {
  if (customElements.get(name) !== undefined) {
    return;
  }
  customElements.define(name, constructor, options);
}

export const navigate = (_node: unknown, path: string, replace = false): void => {
  if (replace) {
    history.replaceState(null, "", path);
  } else {
    history.pushState(null, "", path);
  }
  fireEvent(window, "location-changed", { replace });
};

/** "HH:MM" for an ISO timestamp in the user's locale. */
export function formatTime(iso: string | null | undefined): string {
  if (!iso) return "–";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "–";
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/** Minutes since local midnight for an ISO timestamp (for timeline placement). */
export function minutesOfDay(iso: string): number | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.getHours() * 60 + d.getMinutes();
}

/** Days per month of a yearless date; February includes the leap day. */
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function daysInMonth(month: number): number {
  return DAYS_IN_MONTH[month - 1] ?? 31;
}

/** Parse a yearless "MM-DD" date (a scenario's active period bounds). */
export function parseMonthDay(
  value: string | null | undefined
): { month: number; day: number } | null {
  const match = /^(\d{1,2})-(\d{1,2})$/.exec(value ?? "");
  if (!match) return null;
  const month = Number(match[1]);
  const day = Number(match[2]);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(month)) return null;
  return { month, day };
}

export function toMonthDay(month: number, day: number): string {
  const clamped = Math.min(day, daysInMonth(month));
  return `${String(month).padStart(2, "0")}-${String(clamped).padStart(2, "0")}`;
}

function userLanguage(hass: HomeAssistant | undefined): string | undefined {
  return hass?.locale?.language ?? hass?.language;
}

/** Localized month name; 2024 is a leap year, so every "MM-DD" is a real date. */
export function monthName(hass: HomeAssistant | undefined, month: number): string {
  return new Date(2024, month - 1, 1).toLocaleDateString(userLanguage(hass), {
    month: "long",
  });
}

/** "1. Apr" / "Apr 1" for a yearless "MM-DD" date in the user's locale. */
export function formatMonthDay(
  hass: HomeAssistant | undefined,
  value: string | null | undefined
): string {
  const md = parseMonthDay(value);
  if (!md) return "–";
  return new Date(2024, md.month - 1, md.day).toLocaleDateString(userLanguage(hass), {
    day: "numeric",
    month: "short",
  });
}

const dayKey = (month: number, day: number): number => month * 100 + day;

/**
 * Whether `now` lies inside one of the yearly periods (both days inclusive, a
 * start after the end wraps over the turn of the year; no periods = all
 * year). Mirrors `Scenario.active_on` in the backend.
 */
export function inActivePeriods(
  periods: ActivePeriod[] | null | undefined,
  now: Date = new Date()
): boolean {
  if (!periods?.length) return true;
  const today = dayKey(now.getMonth() + 1, now.getDate());
  return periods.some((p) => {
    const start = parseMonthDay(p.from);
    const end = parseMonthDay(p.to);
    if (!start || !end) return false;
    const a = dayKey(start.month, start.day);
    const b = dayKey(end.month, end.day);
    return a <= b ? a <= today && today <= b : today >= a || today <= b;
  });
}

/** Start ("MM-DD") of the period that begins next after `now`. */
export function nextPeriodStart(
  periods: ActivePeriod[] | null | undefined,
  now: Date = new Date()
): string | null {
  const today = dayKey(now.getMonth() + 1, now.getDate());
  let best: { from: string; wait: number } | null = null;
  for (const p of periods ?? []) {
    const start = parseMonthDay(p.from);
    if (!start) continue;
    // Days-ish until the start, a passed start counting for next year.
    const wait = (dayKey(start.month, start.day) - today + 1300) % 1300;
    if (!best || wait < best.wait) best = { from: p.from, wait };
  }
  return best?.from ?? null;
}
