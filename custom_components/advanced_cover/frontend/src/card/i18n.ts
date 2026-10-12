import translations from "virtual:card-translations";

import { TRANSLATION_DOMAIN } from "../i18n";
import type { HomeAssistant } from "../types";

const PREFIX = `component.${TRANSLATION_DOMAIN}.config_panel.`;

function language(hass: HomeAssistant): string {
  const lang = hass.locale?.language ?? hass.language ?? "en";
  if (translations[lang]) return lang;
  const base = lang.split("-")[0];
  return translations[base] ? base : "en";
}

function fill(text: string, values?: Record<string, unknown>): string {
  if (!values) return text;
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
}

const wrapped = new WeakMap<HomeAssistant, HomeAssistant>();

/**
 * `hass` whose `localize` answers the card's keys from the bundle.
 *
 * The shared modules (timeline, preflight, reasons) and the card itself all
 * look their texts up through `t()` under `config_panel`. On a dashboard those
 * backend translations are not loaded, so the card hands them this view of
 * `hass` instead of the raw one; everything else falls through to Home
 * Assistant.
 */
export function localizedHass(hass: HomeAssistant): HomeAssistant {
  const known = wrapped.get(hass);
  if (known) return known;
  const table = translations[language(hass)] ?? {};
  const fallback = translations.en ?? {};
  const view: HomeAssistant = Object.create(hass);
  view.localize = (key, values) => {
    if (key.startsWith(PREFIX)) {
      const short = key.slice(PREFIX.length);
      const text = table[short] ?? fallback[short];
      if (text !== undefined) return fill(text, values);
    }
    return hass.localize ? hass.localize(key, values) : key;
  };
  wrapped.set(hass, view);
  return view;
}
