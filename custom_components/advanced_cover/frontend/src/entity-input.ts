import { html, type TemplateResult } from "lit";
import type { HomeAssistant } from "./types";

/**
 * Entity and entity-state fields, rendered with Home Assistant's own pickers.
 *
 * Names, icons, supporting information, and search all come from the Home
 * Assistant frontend. The value handed back is always the plain entity_id (or
 * raw state), so nothing about the stored configuration changes.
 *
 * The panel used to sort `config.favorite_entity_ids` to the top of its own
 * `<datalist>`. `ha-entity-picker` has no equivalent hook: `entityFilter` and
 * `includeEntities` are hard filters, so using either would *hide* every
 * non-favorite instead of ranking it. Pinning is therefore dropped on purpose —
 * the native picker searches friendly names, areas, and entity IDs, which is
 * what the favorites list was working around. `favorite_entity_ids` stays in
 * the stored config and the websocket payload; the panel no longer reads it.
 */

export interface EntityFieldOptions {
  /**
   * Keep the field open to entities outside `domains`.
   *
   * `includeDomains` is a hard filter, while the old datalist was only a
   * suggestion — so it may only be used where the backend enforces the same
   * rule. The cover, low-mode, and script fields qualify: `executor.py` calls
   * `cover.*` services on the first two and `script.<object_id>` on the third,
   * so anything else was already broken. The contact sensor does not: it is
   * only ever read via `hass.states.get()`, and mapped through
   * `contact_state_map`, so a handle sensor on `input_select.window` has to
   * stay selectable.
   */
  allowCustom?: boolean;
  /** Extra class on the picker, for layout inside a row. */
  className?: string;
}

/** Searchable entity picker; emits the selected entity_id (`""` when cleared). */
export function renderEntityField(
  hass: HomeAssistant,
  /** Domains to offer, or `null` for every entity (conditions accept any). */
  domains: string[] | null,
  label: string,
  value: string,
  onValue: (v: string) => void,
  { allowCustom = false, className }: EntityFieldOptions = {}
): TemplateResult {
  return html`
    <ha-entity-picker
      class=${className ?? ""}
      .hass=${hass}
      .label=${label || undefined}
      .value=${value || undefined}
      .includeDomains=${domains ?? undefined}
      .allowCustomEntity=${allowCustom}
      .required=${false}
      @value-changed=${(e: CustomEvent<{ value?: string }>) =>
        onValue(e.detail.value ?? "")}
    ></ha-entity-picker>
  `;
}

/**
 * Searchable area picker; emits the selected area_id (`""` when cleared).
 *
 * The panel used to render a `<datalist>` over `hass.areas`, which put the raw
 * `area_id` in the text field — the user typed and read the slug while the
 * friendly name was only a suggestion. The native selector shows the name and
 * still hands back the id, so the stored `area_id` is unchanged.
 */
export function renderAreaField(
  hass: HomeAssistant,
  label: string,
  value: string,
  onValue: (v: string) => void,
  { className }: { className?: string } = {}
): TemplateResult {
  return html`
    <ha-selector
      class=${className ?? ""}
      .hass=${hass}
      .selector=${{ area: { multiple: false } }}
      .label=${label}
      .value=${value || undefined}
      .required=${false}
      @value-changed=${(e: CustomEvent<{ value?: string }>) =>
        onValue(e.detail.value ?? "")}
    ></ha-selector>
  `;
}

export interface StateFieldOptions {
  /** States already used in the same list — kept out of the dropdown. */
  hideStates?: string[];
  /** Shown below the field while it is disabled for want of an entity. */
  helper?: string;
  /** Extra class on the selector, for layout inside a row. */
  className?: string;
}

/**
 * State picker for one entity: the value stays the raw state (`"on"`) while the
 * dropdown shows the localized label ("On").
 *
 * `ha-selector-state` always sets `allow-custom-value`, so a state the entity
 * does not currently report can still be typed — the contact map depends on
 * that for handle sensors that only report `tilted` while actually tilted.
 */
export function renderEntityStateField(
  hass: HomeAssistant,
  entityId: string,
  label: string,
  value: string,
  onValue: (v: string) => void,
  { hideStates, helper, className }: StateFieldOptions = {}
): TemplateResult {
  // The offered states come from the entity, so without one there is nothing to
  // choose from — say so instead of showing an empty dropdown.
  const noEntity = !entityId.trim();
  return html`
    <ha-selector
      class=${className ?? ""}
      .hass=${hass}
      .selector=${{
        state: { entity_id: entityId || undefined, hide_states: hideStates },
      }}
      .label=${label}
      .value=${value}
      .disabled=${noEntity}
      .required=${false}
      .helper=${noEntity ? helper : undefined}
      @value-changed=${(e: CustomEvent<{ value?: string }>) =>
        onValue(e.detail.value ?? "")}
    ></ha-selector>
  `;
}

/** Localized label for a raw state, falling back to the raw value. */
export function formatState(
  hass: HomeAssistant,
  entityId: string | null | undefined,
  state: string
): string {
  const stateObj = entityId ? hass.states[entityId] : undefined;
  if (!stateObj || !hass.formatEntityState) return state;
  return hass.formatEntityState(stateObj, state) || state;
}
