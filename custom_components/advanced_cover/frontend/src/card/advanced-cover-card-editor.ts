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
  type NextButton,
} from "./types";

type BoolKey = {
  [K in keyof AdvancedCoverCardConfig]-?: AdvancedCoverCardConfig[K] extends
    | boolean
    | undefined
    ? K
    : never;
}[keyof AdvancedCoverCardConfig];

/** Options that only mean something while their section is on the card.
    `confirm_run` and `ignore_conditions` are not among them: they govern
    every run button — the next section's and the compact tile's too. */
const SECTION_KEYS: Record<CardSection, Array<keyof AdvancedCoverCardConfig>> = {
  next: ["next_actions", "show_last_run"],
  timeline: ["timeline_list", "timeline_legend"],
  covers: ["covers", "group_by_area", "cover_controls", "cover_automation"],
  scenarios: ["scenarios"],
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
      (message) => {
        // An unloaded entry only costs the pickers their chips.
        if (!("unloaded" in message)) this._snapshot = message;
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

        ${this._renderEntryPicker()}

        <label class="flabel" for="ac-title"
          >${this._t("card_ed_card_title")}</label
        >
        <input
          id="ac-title"
          class="input"
          type="text"
          .value=${this._config.title ?? ""}
          placeholder=${this._snapshot?.name ?? ""}
          @change=${(ev: Event) =>
            this._emit({
              title: (ev.target as HTMLInputElement).value.trim() || undefined,
            })}
        />

        ${cfg.compact ? nothing : this._toggleRow("card_ed_header", "show_header")}
        ${this._toggleRow("card_ed_compact", "compact", "card_ed_compact_help")}

        ${cfg.compact
          ? this._nextActionRow("run", "card_ed_next_run")
          : html`
              <div class="flabel top strong">${this._t("card_ed_sections")}</div>
              <div class="fhelp bottom">${this._t("card_ed_sections_help")}</div>
              ${ordered.map((section) => this._renderSection(section))}
            `}
        ${this._hasRunButton(cfg)
          ? html`
              <div class="flabel top strong">${this._t("card_ed_runs")}</div>
              <div class="fhelp bottom">${this._t("card_ed_runs_help")}</div>
              ${this._toggleRow("card_ed_confirm", "confirm_run")}
              ${this._toggleRow(
                "card_ed_ignore",
                "ignore_conditions",
                "card_ed_ignore_help"
              )}
            `
          : nothing}
      </div>
    `;
  }

  /** Whether the configured card shows any button that runs a scenario. */
  private _hasRunButton(cfg: AdvancedCoverCardConfig): boolean {
    const sections = cfg.sections ?? DEFAULT_CONFIG.sections;
    const nextRuns = (cfg.next_actions ?? DEFAULT_CONFIG.next_actions).includes(
      "run"
    );
    if (cfg.compact) return nextRuns;
    return (
      sections.includes("scenarios") || (sections.includes("next") && nextRuns)
    );
  }

  /** Offered with several entries — and with a configured entry that no
      longer exists, which otherwise could only be cleared in YAML. */
  private _renderEntryPicker(): TemplateResult | typeof nothing {
    const current = this._config?.entry_id ?? "";
    const known = this._entries.some((entry) => entry.entry_id === current);
    const gone = Boolean(current) && this._entriesLoaded && !known;
    if (this._entries.length <= 1 && !gone) return nothing;
    return html`
      <label class="flabel" for="ac-entry">${this._t("card_ed_entry")}</label>
      <select
        id="ac-entry"
        class="input"
        @change=${(ev: Event) =>
          this._emit({
            entry_id: (ev.target as HTMLSelectElement).value || undefined,
          })}
      >
        <option value="" ?selected=${!current}>
          ${this._t("card_ed_entry_auto")}
        </option>
        ${gone
          ? html`<option value=${current} selected>
              ${t(localizedHass(this.hass!), "config_panel.card_ed_entry_gone", {
                id: current,
              })}
            </option>`
          : nothing}
        ${this._entries.map(
          (entry) =>
            html`<option
              value=${entry.entry_id}
              ?selected=${entry.entry_id === current}
            >
              ${entry.name}
            </option>`
        )}
      </select>
    `;
  }

  private _renderSection(section: CardSection): TemplateResult {
    const sections = this._cfg.sections;
    const index = sections.indexOf(section);
    const on = index >= 0;
    return html`<div class="sec ${on ? "on" : ""}">
      <div class="sec-row">
        ${this._switch(this._t(`card_ed_sec_${section}`), on, (next) =>
          this._toggleSection(section, next)
        )}
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
          ${this._toggleRow("card_ed_cover_auto", "cover_automation")}
        `;
      default:
        return html`
          ${this._picker(
            "scenarios",
            "card_ed_scn_which",
            this._snapshot?.scenarios ?? []
          )}
        `;
    }
  }

  /** A switch drawn by the editor itself. Deliberately not `ha-switch`:
      that element lives in a lazily loaded chunk and may not be defined when
      the dialog opens — and an element that keeps its own checked state
      shows the wrong state once Lit reuses it for another row. */
  private _switch(
    label: string,
    checked: boolean,
    onChange: (on: boolean) => void
  ): TemplateResult {
    return html`<button
      type="button"
      class="toggle ${checked ? "on" : ""}"
      role="switch"
      aria-checked=${checked ? "true" : "false"}
      aria-label=${label}
      @click=${() => onChange(!checked)}
    >
      <span class="knob"></span>
    </button>`;
  }

  private _switchRow(
    labelKey: string,
    checked: boolean,
    onChange: (on: boolean) => void,
    helpKey?: string
  ): TemplateResult {
    return html`<div class="trow">
      <span class="ttext">
        <span>${this._t(labelKey)}</span>
        ${helpKey
          ? html`<span class="fhelp">${this._t(helpKey)}</span>`
          : nothing}
      </span>
      ${this._switch(this._t(labelKey), checked, onChange)}
    </div>`;
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

  private _nextActionRow(action: NextButton, labelKey: string): TemplateResult {
    const actions = this._cfg.next_actions;
    return this._switchRow(labelKey, actions.includes(action), (on) => {
      const next = (["run", "toggle"] as NextButton[]).filter((item) =>
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
          aria-pressed=${custom ? "false" : "true"}
          @click=${() =>
            this._emit({ [key]: "all" } as Partial<AdvancedCoverCardConfig>)}
        >
          ${this._t("card_ed_all")}
        </button>
        <button
          type="button"
          class=${custom ? "on" : ""}
          aria-pressed=${custom ? "true" : "false"}
          ?disabled=${!custom && !items.length}
          @click=${() => {
            // Nothing to pick from (yet): an empty list would empty the card.
            if (!custom && items.length) {
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
                  aria-pressed=${picked.includes(item.id) ? "true" : "false"}
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
      display: block;
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
    }
    .toggle {
      position: relative;
      flex: none;
      width: 38px;
      height: 22px;
      padding: 0;
      border: none;
      border-radius: 999px;
      background: color-mix(in srgb, var(--primary-text-color) 28%, transparent);
      transition: background 0.15s ease;
    }
    .toggle .knob {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.35);
      transition: left 0.15s ease;
    }
    .toggle.on {
      background: var(--primary-color);
    }
    .toggle.on .knob {
      left: 18px;
    }
    .toggle:focus-visible,
    .seg button:focus-visible,
    .chip:focus-visible,
    .order button:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
    }
    @media (prefers-reduced-motion: reduce) {
      .toggle,
      .toggle .knob {
        transition: none;
      }
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
