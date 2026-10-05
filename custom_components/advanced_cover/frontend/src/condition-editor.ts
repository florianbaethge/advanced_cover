import { html, nothing, type TemplateResult } from "lit";
import { keyed } from "lit/directives/keyed.js";
import { formatState, renderEntityField, renderEntityStateField } from "./entity-input";
import { t } from "./i18n";
import type { Condition, ConditionType, HomeAssistant } from "./types";

const CONTACT_STATES = ["closed", "tilted", "open"] as const;

export interface ConditionEditorOptions {
  hass: HomeAssistant;
  conditions: Condition[];
  onChange: (conditions: Condition[]) => void;
  /** Whether the contact condition type is offered (cover has a contact). */
  contactAvailable: boolean;
  /**
   * Facade azimuth of the cover these conditions belong to, for the
   * relative sun window: a number shows the reference, ``null`` warns that
   * the cover has none, ``undefined`` (scenario scope) shows a generic hint.
   */
  coverAzimuth?: number | null;
}

function emptyCondition(type: ConditionType): Condition {
  switch (type) {
    case "cover_position":
      return { type, op: "above", value: 5, value2: null };
    case "contact":
      return { type, accepted: ["closed"] };
    case "numeric_state":
      return { type, entity_id: "", above: null, below: null };
    case "sun_position":
      return {
        type,
        above: 20,
        below: null,
        az_mode: "relative",
        az_from: -45,
        az_to: 45,
      };
    default:
      return { type, entity_id: "", states: [] };
  }
}

function update(
  opts: ConditionEditorOptions,
  index: number,
  patch: Partial<Condition>
): void {
  const next = opts.conditions.map((c, i) => (i === index ? { ...c, ...patch } : c));
  opts.onChange(next);
}

function remove(opts: ConditionEditorOptions, index: number): void {
  opts.onChange(opts.conditions.filter((_, i) => i !== index));
}

/**
 * The entity a condition watches.
 *
 * No domain filter and `allowCustom`: the engine only ever reads
 * `hass.states.get(cond.entity_id)`, so every domain is fair game — and an
 * entity_id whose integration happens to be unloaded right now must survive
 * editing the rest of the row.
 */
function renderConditionEntityField(
  opts: ConditionEditorOptions,
  index: number,
  cond: Condition,
  patch: (entityId: string) => Partial<Condition>
): TemplateResult {
  // No floating label: it sits above the field and pushes the picker out of
  // line with the rest of the sentence. The picker's own placeholder suffices.
  return renderEntityField(
    opts.hass,
    null,
    "",
    cond.entity_id ?? "",
    (v) => {
      // The picker re-emits on every render pass; only a real change may run
      // `patch`, which is what drops the states belonging to the old entity.
      if (v === (cond.entity_id ?? "")) return;
      update(opts, index, patch(v));
    },
    { allowCustom: true, className: "cond-entity" }
  );
}

function renderStateChips(
  opts: ConditionEditorOptions,
  index: number,
  cond: Condition
): TemplateResult {
  const states = cond.states ?? [];
  const addState = (value: string): void => {
    if (!value || states.includes(value)) return;
    update(opts, index, { states: [...states, value] });
  };
  return html`
    <span class="chips">
      ${states.map(
        (s) => html`
          <button
            type="button"
            class="chip selected chip-removable"
            title=${t(opts.hass, "config_panel.cond_remove_state")}
            @click=${() =>
              update(opts, index, { states: states.filter((x) => x !== s) })}
          >
            ${formatState(opts.hass, cond.entity_id, s)}
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        `
      )}
    </span>
    ${
      // The picker keeps the state it just handed over, so re-key it on the
      // current selection: adding (or removing) a chip rebuilds it empty.
      keyed(
        states.join("|"),
        renderEntityStateField(
          opts.hass,
          cond.entity_id ?? "",
          t(opts.hass, "config_panel.cond_state_add"),
          "",
          addState,
          {
            hideStates: states,
            helper: t(opts.hass, "config_panel.cond_state_needs_entity"),
            className: "cond-state",
          }
        )
      )
    }
  `;
}

function renderCondition(
  opts: ConditionEditorOptions,
  cond: Condition,
  index: number
): TemplateResult {
  const { hass } = opts;
  let body: TemplateResult;
  switch (cond.type) {
    case "entity_state":
    case "entity_state_not":
      body = html`
        <span>${t(hass, "config_panel.cond_only_if")}</span>
        ${renderConditionEntityField(opts, index, cond, (entity_id) => ({
          entity_id,
          // The chips name states of the old entity and would silently never
          // match the new one — drop them with the entity they belong to.
          states: [],
        }))}
        <span>
          ${cond.type === "entity_state"
            ? t(hass, "config_panel.cond_is_one_of")
            : t(hass, "config_panel.cond_is_none_of")}
        </span>
        ${renderStateChips(opts, index, cond)}
      `;
      break;
    case "cover_position":
      body = html`
        <span>${t(hass, "config_panel.cond_position_prefix")}</span>
        <select
          .value=${cond.op ?? "above"}
          @change=${(e: Event) =>
            update(opts, index, {
              op: (e.target as HTMLSelectElement).value as Condition["op"],
            })}
        >
          <option value="above">${t(hass, "config_panel.cond_op_above")}</option>
          <option value="below">${t(hass, "config_panel.cond_op_below")}</option>
          <option value="between">${t(hass, "config_panel.cond_op_between")}</option>
        </select>
        <input
          type="number"
          min="0"
          max="100"
          style="width:80px"
          .value=${String(cond.value ?? 0)}
          @input=${(e: Event) =>
            update(opts, index, {
              value: Number((e.target as HTMLInputElement).value),
            })}
        />
        ${cond.op === "between"
          ? html`
              <span>${t(hass, "config_panel.cond_and")}</span>
              <input
                type="number"
                min="0"
                max="100"
                style="width:80px"
                .value=${String(cond.value2 ?? 100)}
                @input=${(e: Event) =>
                  update(opts, index, {
                    value2: Number((e.target as HTMLInputElement).value),
                  })}
              />
            `
          : nothing}
        <span>${t(hass, "config_panel.cond_position_suffix")}</span>
      `;
      break;
    case "contact":
      body = html`
        <span>${t(hass, "config_panel.cond_contact_prefix")}</span>
        <span class="chips">
          ${CONTACT_STATES.map((s) => {
            const accepted = cond.accepted ?? [];
            const selected = accepted.includes(s);
            return html`
              <button
                type="button"
                class="chip ${selected ? "selected" : ""}"
                @click=${() =>
                  update(opts, index, {
                    accepted: selected
                      ? accepted.filter((x) => x !== s)
                      : [...accepted, s],
                  })}
              >
                ${t(hass, `config_panel.contact_${s}`)}
              </button>
            `;
          })}
        </span>
      `;
      break;
    case "numeric_state":
      body = html`
        <span>${t(hass, "config_panel.cond_only_if")}</span>
        ${renderConditionEntityField(opts, index, cond, (entity_id) => ({
          entity_id,
        }))}
        <span>${t(hass, "config_panel.cond_numeric_above")}</span>
        <input
          type="number"
          style="width:90px"
          .value=${cond.above == null ? "" : String(cond.above)}
          @input=${(e: Event) => {
            const raw = (e.target as HTMLInputElement).value;
            update(opts, index, { above: raw === "" ? null : Number(raw) });
          }}
        />
        <span>${t(hass, "config_panel.cond_numeric_below")}</span>
        <input
          type="number"
          style="width:90px"
          .value=${cond.below == null ? "" : String(cond.below)}
          @input=${(e: Event) => {
            const raw = (e.target as HTMLInputElement).value;
            update(opts, index, { below: raw === "" ? null : Number(raw) });
          }}
        />
      `;
      break;
    case "sun_position": {
      const numInput = (
        value: number | null | undefined,
        patchKey: "above" | "below" | "az_from" | "az_to",
        min: number,
        max: number
      ) => html`
        <input
          type="number"
          min=${min}
          max=${max}
          style="width:80px"
          .value=${value == null ? "" : String(value)}
          @input=${(e: Event) => {
            const raw = (e.target as HTMLInputElement).value;
            update(opts, index, { [patchKey]: raw === "" ? null : Number(raw) });
          }}
        />
      `;
      const azMode = cond.az_mode ?? "off";
      const relHint =
        azMode !== "relative"
          ? nothing
          : opts.coverAzimuth === undefined
            ? html`<span class="muted">${t(hass, "config_panel.cond_sun_rel_generic")}</span>`
            : opts.coverAzimuth === null
              ? html`<span class="muted warn">${t(hass, "config_panel.cond_sun_rel_missing")}</span>`
              : html`<span class="muted">
                  ${t(hass, "config_panel.cond_sun_rel_hint", {
                    az: opts.coverAzimuth,
                  })}
                </span>`;
      body = html`
        <span>${t(hass, "config_panel.cond_sun_prefix")}</span>
        <span>${t(hass, "config_panel.cond_sun_above")}</span>
        ${numInput(cond.above, "above", -90, 90)}
        <span>${t(hass, "config_panel.cond_sun_below")}</span>
        ${numInput(cond.below, "below", -90, 90)}
        <span>${t(hass, "config_panel.cond_sun_deg_suffix")}</span>
        <select
          .value=${azMode}
          @change=${(e: Event) =>
            update(opts, index, {
              az_mode: (e.target as HTMLSelectElement)
                .value as Condition["az_mode"],
            })}
        >
          ${(["off", "absolute", "relative"] as const).map(
            (m) => html`<option value=${m} ?selected=${azMode === m}>
              ${t(hass, `config_panel.cond_sun_az_mode_${m}`)}
            </option>`
          )}
        </select>
        ${azMode === "off"
          ? nothing
          : html`
              <span>${t(hass, "config_panel.cond_sun_from")}</span>
              ${numInput(
                cond.az_from,
                "az_from",
                azMode === "relative" ? -180 : 0,
                azMode === "relative" ? 180 : 359
              )}
              <span>${t(hass, "config_panel.cond_sun_to")}</span>
              ${numInput(
                cond.az_to,
                "az_to",
                azMode === "relative" ? -180 : 0,
                azMode === "relative" ? 180 : 359
              )}
              <span>°</span>
              ${relHint}
            `}
      `;
      break;
    }
    default:
      body = html`<span class="muted">?</span>`;
  }
  return html`
    <div class="cond-row">
      ${body}
      <button
        type="button"
        class="cond-remove"
        title=${t(hass, "config_panel.cond_remove")}
        @click=${() => remove(opts, index)}
      >
        <ha-icon icon="mdi:close"></ha-icon>
      </button>
    </div>
  `;
}

/** Sentence-builder condition list (AND semantics, no operators). */
export function renderConditionEditor(
  opts: ConditionEditorOptions
): TemplateResult {
  const { hass } = opts;
  const types: ConditionType[] = [
    "entity_state",
    "entity_state_not",
    "cover_position",
    "numeric_state",
    "sun_position",
    ...(opts.contactAvailable ? (["contact"] as ConditionType[]) : []),
  ];
  return html`
    <div>
      ${opts.conditions.map((c, i) => renderCondition(opts, c, i))}
      <div class="row">
        <select
          @change=${(e: Event) => {
            const sel = e.target as HTMLSelectElement;
            if (!sel.value) return;
            opts.onChange([
              ...opts.conditions,
              emptyCondition(sel.value as ConditionType),
            ]);
            sel.value = "";
          }}
        >
          <option value="">
            + ${t(hass, "config_panel.cond_add")}
          </option>
          ${types.map(
            (ct) => html`
              <option value=${ct}>${t(hass, `config_panel.cond_type_${ct}`)}</option>
            `
          )}
        </select>
      </div>
    </div>
  `;
}
