import { LitElement, css, html, nothing, type TemplateResult } from "lit";

import { fireEvent } from "../fire-event";
import { defineCustomElementOnce } from "../helpers";
import { t } from "../i18n";
import type { EntryRow, HomeAssistant } from "../types";
import { listEntries, subscribeSnapshot } from "./api";
import { localizedHass } from "./i18n";
import {
  CARD_SECTIONS,
  DEFAULT_CONFIG,
  type AdvancedCoverCardConfig,
  type CardSection,
  type CardSnapshot,
  type NextAction_,
} from "./types";

type BoolKey = {
  [K in keyof AdvancedCoverCardConfig]-?: AdvancedCoverCardConfig[K] extends
    | boolean
    | undefined
    ? K
    : never;
}[keyof AdvancedCoverCardConfig];

/** Options that only mean something while their section is on the card. */
const SECTION_KEYS: Record<CardSection, Array<keyof AdvancedCoverCardConfig>> = {
  next: ["next_actions", "show_last_run"],
  timeline: ["timeline_list", "timeline_legend"],
  covers: ["covers", "group_by_area", "cover_controls"],
  scenarios: ["scenarios", "confirm_run", "ignore_conditions"],
};

export class AdvancedCoverCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _entries: { state: true },
    _snapshot: { state: true },
  };

  hass?: HomeAssistant;

  private _config?: AdvancedCoverCardConfig;

  private _entries: EntryRow[] = [];

  /** Only needed for the cover and scenario pickers. */
  private _snapshot?: CardSnapshot;

  private _entriesLoaded = false;

  private _unsubscribe?: Promise<() => Promise<void>>;

  private _subscribedEntry?: string;

  setConfig(config: AdvancedCoverCardConfig): void {
    this._config = { ...config };
  }

  connectedCallback(): void {
    super.connectedCallback();
    void this._loadEntries();
    this._resubscribe();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._teardown();
  }

  protected updated(): void {
    void this._loadEntries();
    this._resubscribe();
  }

  private async _loadEntries(): Promise<void> {
    if (!this.hass || this._entriesLoaded) return;
    this._entriesLoaded = true;
    try {
      this._entries = await listEntries(this.hass);
    } catch {
      this._entries = [];
    }
  }

  private _teardown(): void {
    this._unsubscribe?.then((unsub) => unsub()).catch(() => undefined);
    this._unsubscribe = undefined;
    this._subscribedEntry = undefined;
  }

  private _resubscribe(): void {
    if (!this.hass || !this.isConnected) return;
    const entry = this._config?.entry_id ?? "";
    if (this._subscribedEntry === entry) return;
    this._teardown();
    this._subscribedEntry = entry;
    this._snapshot = undefined;
    this._unsubscribe = subscribeSnapshot(
      this.hass,
      (snapshot) => {
        this._snapshot = snapshot;
      },
      this._config?.entry_id
    );
    // Without an entry the pickers simply stay empty; no retry loop.
    this._unsubscribe?.catch(() => {
      this._unsubscribe = undefined;
    });
  }

  private _t(key: string): string {
    return t(localizedHass(this.hass!), `config_panel.${key}`);
  }

  private get _cfg(): Required<
    Omit<AdvancedCoverCardConfig, "type" | "entry_id" | "title">
  > &
    AdvancedCoverCardConfig {
    return { ...DEFAULT_CONFIG, ...(this._config ?? { type: "" }) };
  }

  private _emit(patch: Partial<AdvancedCoverCardConfig>): void {
    if (!this._config) return;
    const next = { ...this._config, ...patch } as Record<string, unknown>;
    // Keep the YAML honest: options at their default add noise, and an option
    // of a section the card does not show is worse than noise.
    for (const [key, value] of Object.entries(DEFAULT_CONFIG)) {
      if (JSON.stringify(next[key]) === JSON.stringify(value)) {
        delete next[key];
      }
    }
    const sections = (next.sections as CardSection[] | undefined) ??
      DEFAULT_CONFIG.sections;
    for (const section of CARD_SECTIONS) {
      if (sections.includes(section)) continue;
      // The compact tile is the "next" section in one row; keep its options.
      if (section === "next" && next.compact) continue;
      for (const key of SECTION_KEYS[section]) delete next[key];
    }
    if (!next.entry_id) delete next.entry_id;
    if (!next.title) delete next.title;
    const config = next as unknown as AdvancedCoverCardConfig;
    this._config = config;
    fireEvent(this, "config-changed", { config });
  }

  // ---- sections -----------------------------------------------------------

  private _toggleSection(section: CardSection, on: boolean): void {
    const current = this._cfg.sections;
    if (on) {
      if (!current.includes(section)) this._emit({ sections: [...current, section] });
      return;
    }
    this._emit({ sections: current.filter((item) => item !== section) });
  }

  private _moveSection(section: CardSection, delta: -1 | 1): void {
    const sections = [...this._cfg.sections];
    const from = sections.indexOf(section);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= sections.length) return;
    [sections[from], sections[to]] = [sections[to], sections[from]];
    this._emit({ sections });
  }

  // ---- render -------------------------------------------------------------

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    const cfg = this._cfg;
    // Shown sections first, in card order; the rest below, ready to switch on.
    const ordered = [
      ...cfg.sections,
      ...CARD_SECTIONS.filter((section) => !cfg.sections.includes(section)),
    ];
    return html`
      <div class="wrap">
        <div class="etitle">${this._t("card_ed_title")}</div>

        ${this._entries.length > 1
          ? html`
              <div class="flabel">${this._t("card_ed_entry")}</div>
              <select
                class="input"
                .value=${this._config.entry_id ?? ""}
                @change=${(ev: Event) =>
                  this._emit({
                    entry_id: (ev.target as HTMLSelectElement).value || undefined,
                  })}
              >
                <option value="">${this._t("card_ed_entry_auto")}</option>
                ${this._entries.map(
                  (entry) =>
                    html`<option
                      value=${entry.entry_id}
                      ?selected=${entry.entry_id === this._config?.entry_id}
                    >
                      ${entry.name}
                    </option>`
                )}
              </select>
            `
          : nothing}

        <div class="flabel">${this._t("card_ed_card_title")}</div>
        <input
          class="input"
          type="text"
          .value=${this._config.title ?? ""}
          placeholder=${this._snapshot?.name ?? ""}
          @change=${(ev: Event) =>
            this._emit({
              title: (ev.target as HTMLInputElement).value.trim() || undefined,
            })}
        />

        ${this._toggleRow("card_ed_header", "show_header")}
        ${this._toggleRow("card_ed_compact", "compact", "card_ed_compact_help")}

        ${cfg.compact
          ? this._nextActionRow("run", "card_ed_next_run")
          : html`
              <div class="flabel top strong">${this._t("card_ed_sections")}</div>
              <div class="fhelp bottom">${this._t("card_ed_sections_help")}</div>
              ${ordered.map((section) => this._renderSection(section))}
            `}
      </div>
    `;
  }

  private _renderSection(section: CardSection): TemplateResult {
    const sections = this._cfg.sections;
    const index = sections.indexOf(section);
    const on = index >= 0;
    return html`<div class="sec ${on ? "on" : ""}">
      <div class="sec-row">
        <ha-switch
          .checked=${on}
          @change=${(ev: Event) =>
            this._toggleSection(section, (ev.target as HTMLInputElement).checked)}
        ></ha-switch>
        <div class="sec-text">
          <div class="sec-name">${this._t(`card_ed_sec_${section}`)}</div>
          <div class="fhelp">${this._t(`card_ed_sec_${section}_help`)}</div>
        </div>
        ${on && sections.length > 1
          ? html`<div class="order">
              <button
                type="button"
                title=${this._t("card_ed_move_up")}
                aria-label=${this._t("card_ed_move_up")}
                ?disabled=${index === 0}
                @click=${() => this._moveSection(section, -1)}
              >
                <ha-icon icon="mdi:arrow-up"></ha-icon>
              </button>
              <button
                type="button"
                title=${this._t("card_ed_move_down")}
                aria-label=${this._t("card_ed_move_down")}
                ?disabled=${index === sections.length - 1}
                @click=${() => this._moveSection(section, 1)}
              >
                <ha-icon icon="mdi:arrow-down"></ha-icon>
              </button>
            </div>`
          : nothing}
      </div>
      ${on ? html`<div class="sec-opts">${this._sectionOptions(section)}</div>` : nothing}
    </div>`;
  }

  private _sectionOptions(section: CardSection): TemplateResult {
    switch (section) {
      case "next":
        return html`
          ${this._nextActionRow("run", "card_ed_next_run")}
          ${this._nextActionRow("toggle", "card_ed_next_toggle")}
          ${this._toggleRow("card_ed_last_run", "show_last_run")}
        `;
      case "timeline":
        return html`
          ${this._toggleRow("card_ed_tl_list", "timeline_list")}
          ${this._toggleRow("card_ed_tl_legend", "timeline_legend")}
        `;
      case "covers":
        return html`
          ${this._picker(
            "covers",
            "card_ed_covers_which",
            this._snapshot?.covers ?? []
          )}
          ${this._toggleRow("card_ed_group_area", "group_by_area")}
          ${this._toggleRow("card_ed_controls", "cover_controls")}
        `;
      default:
        return html`
          ${this._picker(
            "scenarios",
            "card_ed_scn_which",
            this._snapshot?.scenarios ?? []
          )}
          ${this._toggleRow("card_ed_confirm", "confirm_run")}
          ${this._toggleRow(
            "card_ed_ignore",
            "ignore_conditions",
            "card_ed_ignore_help"
          )}
        `;
    }
  }

  private _switchRow(
    labelKey: string,
    checked: boolean,
    onChange: (on: boolean) => void,
    helpKey?: string
  ): TemplateResult {
    return html`<label class="trow">
      <span class="ttext">
        <span>${this._t(labelKey)}</span>
        ${helpKey
          ? html`<span class="fhelp">${this._t(helpKey)}</span>`
          : nothing}
      </span>
      <ha-switch
        .checked=${checked}
        @change=${(ev: Event) =>
          onChange((ev.target as HTMLInputElement).checked)}
      ></ha-switch>
    </label>`;
  }

  private _toggleRow(
    labelKey: string,
    key: BoolKey,
    helpKey?: string
  ): TemplateResult {
    return this._switchRow(
      labelKey,
      Boolean(this._cfg[key]),
      (on) => this._emit({ [key]: on } as Partial<AdvancedCoverCardConfig>),
      helpKey
    );
  }

  private _nextActionRow(action: NextAction_, labelKey: string): TemplateResult {
    const actions = this._cfg.next_actions;
    return this._switchRow(labelKey, actions.includes(action), (on) => {
      const next = (["run", "toggle"] as NextAction_[]).filter((item) =>
        item === action ? on : actions.includes(item)
      );
      this._emit({ next_actions: next });
    });
  }

  /** "All" or a hand-picked subset, offered as chips. */
  private _picker(
    key: "covers" | "scenarios",
    labelKey: string,
    items: Array<{ id: string; name: string }>
  ): TemplateResult {
    const value = this._cfg[key];
    const custom = Array.isArray(value);
    const picked = custom ? value : [];
    const toggle = (id: string): void => {
      const next = picked.includes(id)
        ? picked.filter((item) => item !== id)
        : [...picked, id];
      this._emit({ [key]: next } as Partial<AdvancedCoverCardConfig>);
    };
    return html`
      <div class="flabel">${this._t(labelKey)}</div>
      <div class="seg">
        <button
          type="button"
          class=${custom ? "" : "on"}
          @click=${() =>
            this._emit({ [key]: "all" } as Partial<AdvancedCoverCardConfig>)}
        >
          ${this._t("card_ed_all")}
        </button>
        <button
          type="button"
          class=${custom ? "on" : ""}
          @click=${() => {
            if (!custom) {
              this._emit({
                [key]: items.map((item) => item.id),
              } as Partial<AdvancedCoverCardConfig>);
            }
          }}
        >
          ${this._t("card_ed_pick")}
        </button>
      </div>
      ${custom
        ? html`<div class="chips">
            ${items.map(
              (item) =>
                html`<button
                  type="button"
                  class="chip ${picked.includes(item.id) ? "on" : ""}"
                  @click=${() => toggle(item.id)}
                >
                  ${item.name}
                </button>`
            )}
          </div>`
        : nothing}
    `;
  }

  static styles = css`
    :host {
      display: block;
    }
    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }
    .wrap {
      color: var(--primary-text-color);
      font-size: 14px;
    }
    .etitle {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 12px;
    }
    .flabel {
      font-size: 12.5px;
      color: var(--secondary-text-color);
      margin: 12px 0 6px;
    }
    .flabel.top {
      margin-top: 20px;
    }
    .flabel.strong {
      font-size: 15px;
      font-weight: 500;
      color: var(--primary-text-color);
      margin-bottom: 2px;
    }
    .fhelp {
      font-size: 12.5px;
      line-height: 1.4;
      color: var(--secondary-text-color);
    }
    .fhelp.bottom {
      margin-bottom: 10px;
    }
    .input {
      width: 100%;
      height: 40px;
      padding: 0 12px;
      border-radius: 10px;
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font: inherit;
    }
    .input:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 1px;
    }
    button {
      font: inherit;
      color: inherit;
      cursor: pointer;
    }
    button:disabled {
      cursor: default;
      opacity: 0.35;
    }

    .trow {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 9px 0;
      cursor: pointer;
    }
    .ttext {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 1px;
    }

    .sec {
      border: 1px solid var(--divider-color);
      border-radius: 12px;
      margin-bottom: 8px;
    }
    .sec.on {
      border-color: color-mix(in srgb, var(--primary-color) 45%, transparent);
    }
    .sec-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
    }
    .sec-text {
      flex: 1;
      min-width: 0;
    }
    .sec-name {
      font-weight: 500;
    }
    .order {
      display: inline-flex;
      flex: none;
    }
    .order button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      padding: 0;
      border: none;
      border-radius: 8px;
      background: none;
      color: var(--secondary-text-color);
      --mdc-icon-size: 18px;
    }
    .order button:hover:not(:disabled) {
      background: color-mix(in srgb, var(--primary-text-color) 7%, transparent);
    }
    .sec-opts {
      padding: 2px 12px 6px;
      border-top: 1px solid var(--divider-color);
    }

    .seg {
      display: inline-flex;
      border: 1px solid var(--divider-color);
      border-radius: 10px;
      overflow: hidden;
    }
    .seg button {
      padding: 7px 14px;
      border: none;
      background: none;
      font-size: 13px;
    }
    .seg button + button {
      border-left: 1px solid var(--divider-color);
    }
    .seg button.on {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 10px 0 4px;
    }
    .chip {
      padding: 5px 12px;
      border-radius: 999px;
      border: 1px solid var(--divider-color);
      background: none;
      font-size: 13px;
    }
    .chip.on {
      background: color-mix(in srgb, var(--primary-color) 14%, transparent);
      border-color: var(--primary-color);
      color: var(--primary-color);
    }
  `;
}

defineCustomElementOnce("advanced-cover-card-editor", AdvancedCoverCardEditor);

declare global {
  interface HTMLElementTagNameMap {
    "advanced-cover-card-editor": AdvancedCoverCardEditor;
  }
}
