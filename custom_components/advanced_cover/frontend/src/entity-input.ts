import { html, type TemplateResult } from "lit";
import type { HomeAssistant } from "./types";

export interface EntitySelectorFilter {
  domain?: string[];
}

export interface EntitySelectorConfig {
  filter?: EntitySelectorFilter[];
  multiple: boolean;
}

export interface AreaSelectorConfig {
  multiple: boolean;
}

/** Build the native Home Assistant entity selector configuration. */
export function entitySelectorConfig(domains?: string[]): EntitySelectorConfig {
  return {
    ...(domains ? { filter: [{ domain: domains }] } : {}),
    multiple: false,
  };
}

/** Render Home Assistant's native searchable entity picker. */
export function renderEntitySelector(
  hass: HomeAssistant,
  value: string,
  onValue: (value: string) => void,
  domains?: string[]
): TemplateResult {
  return html`
    <ha-selector
      .hass=${hass}
      .selector=${{ entity: entitySelectorConfig(domains) }}
      .value=${value}
      @value-changed=${(event: CustomEvent<{ value?: string }>) =>
        onValue(event.detail.value ?? "")}
    ></ha-selector>
  `;
}

/** Render Home Assistant's native searchable area picker. */
export function renderAreaSelector(
  hass: HomeAssistant,
  value: string,
  onValue: (value: string) => void
): TemplateResult {
  const config: AreaSelectorConfig = { multiple: false };
  return html`
    <ha-selector
      .hass=${hass}
      .selector=${{ area: config }}
      .value=${value}
      @value-changed=${(event: CustomEvent<{ value?: string }>) =>
        onValue(event.detail.value ?? "")}
    ></ha-selector>
  `;
}
