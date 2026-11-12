import { t } from "./i18n";
import type { HomeAssistant } from "./types";

/** Localize a backend run/log reason into a human-readable explanation.

    The backend stores technical English strings (entity ids, service
    errors). Recognized patterns are mapped to translated texts; anything
    unknown is shown verbatim so no reason is ever lost. */
export function formatReason(
  hass: HomeAssistant,
  reason: string | null | undefined
): string | null {
  if (!reason) return null;
  let m = reason.match(/^(\S+) is unavailable$/);
  if (m)
    return t(hass, "config_panel.reason_entity_unavailable", { entity: m[1] });
  if (reason === "trigger time already passed")
    return t(hass, "config_panel.reason_trigger_passed");
  m = reason.match(/^already at (\d+)% \(min delta (\d+)%\)$/);
  if (m)
    return t(hass, "config_panel.reason_already_at", {
      pos: m[1],
      delta: m[2],
    });
  m = reason.match(/^contact is (\w+); closing below (\d+)% is blocked$/);
  if (m)
    return t(hass, "config_panel.cond_sum_safety", { ventilation: m[2] });
  m = reason.match(
    /^clamped to the ventilation position (\d+)% while the contact is open$/
  );
  if (m)
    return t(hass, "config_panel.reason_safety_clamped", {
      ventilation: m[1],
    });
  m = reason.match(
    /^window open: waits until (\d{2}:\d{2}), then closes (to the ventilation position|fully)$/
  );
  if (m)
    return t(
      hass,
      m[2] === "fully"
        ? "config_panel.reason_safety_delay_ignore"
        : "config_panel.reason_safety_delay_clamp",
      { time: m[1] }
    );
  m = reason.match(/^superseded by scenario '([\s\S]*)'$/);
  if (m) return t(hass, "config_panel.reason_superseded", { scenario: m[1] });
  m = reason.match(/^(?:service|script) call failed: ([\s\S]*)$/);
  if (m) return t(hass, "config_panel.reason_service_failed", { error: m[1] });
  if (reason === "waiting for the sun to reach the facade direction")
    return t(hass, "config_panel.reason_waiting_facade");
  if (reason === "no facade direction configured")
    return t(hass, "config_panel.reason_no_facade");
  if (reason === "sun does not reach this facade today")
    return t(hass, "config_panel.reason_sun_not_reaching");
  if (reason === "master switch is off")
    return t(hass, "config_panel.reason_master_off");
  if (reason === "cover automation is off")
    return t(hass, "config_panel.reason_cover_off");
  if (reason === "scenario or assignment removed" || reason === "cover removed")
    return t(hass, "config_panel.reason_removed");
  // Condition reasons from the engine ("sensor.x is 'on', expected …") are
  // already descriptive; possibly a "; "-joined list.
  return reason;
}

export type ReasonSeverity = "noise" | "info" | "error";

/** Classify a backend reason for display prominence.

    "noise" = expected everyday outcomes (trigger already passed, cover was
    already in position) that the status badge fully covers — hidden from
    the reason lines. "error" = something is actually wrong and deserves
    color. Everything else is "info": useful context, rendered muted. */
export function reasonSeverity(
  reason: string | null | undefined
): ReasonSeverity {
  if (!reason) return "info";
  // The safety reason itself contains "; " — match it before splitting.
  if (/^contact is \w+; closing below \d+% is blocked$/.test(reason)) {
    return "error";
  }
  let severity: ReasonSeverity = "noise";
  for (const part of reason.split("; ")) {
    if (
      / is unavailable$/.test(part) ||
      /^(?:service|script) call failed:/.test(part)
    ) {
      return "error";
    }
    if (
      part !== "trigger time already passed" &&
      !/^already at \d+% \(min delta \d+%\)$/.test(part)
    ) {
      severity = "info";
    }
  }
  return severity;
}
