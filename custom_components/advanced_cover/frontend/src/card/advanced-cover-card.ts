import {
  LitElement,
  html,
  nothing,
  type PropertyValues,
  type TemplateResult,
} from "lit";

import { fireEvent } from "../fire-event";
import {
  defineCustomElementOnce,
  formatApiError,
  formatTime,
  minutesOfDay,
  navigate,
  useTimeZone,
} from "../helpers";
import { t } from "../i18n";
import { exportPath } from "../navigation";
import {
  occKind,
  occReasonSummary,
  retrySpanEnd,
  runKind,
  timelineClass,
} from "../plan-status";
import { occPreflightReason, occVerdict, preflightReason } from "../preflight";
import { formatReason, reasonSeverity } from "../reasons";
import { renderTimeline, timelineStyles, type TimelineEvent } from "../timeline";
import type {
  AssignmentRun,
  HomeAssistant,
  Occurrence,
  Trigger,
} from "../types";
import {
  driveCover,
  runScenario,
  setCoverEnabled,
  setEnabled,
  subscribeSnapshot,
} from "./api";
import { localizedHass } from "./i18n";
import {
  groupByArea,
  lastRun,
  leadTime,
  nextUp,
  occKey,
  occPositions,
  pick,
  positionsLabel,
  runPositions,
  runResultCounts,
  scenarioOccurrence,
  waitingRuns,
  type UpNext,
} from "./model";
import { cardStyles } from "./styles";
import {
  DEFAULT_CONFIG,
  validateConfig,
  type AdvancedCoverCardConfig,
  type CardCover,
  type CardScenario,
  type CardSection,
  type CardSnapshot,
} from "./types";

import "./advanced-cover-card-editor";

declare global {
  interface Window {
    customCards?: unknown[];
  }
}

declare const __VERSION__: string;

/** Below this the buttons under the summary stack, and lists drop detail. */
const NARROW_PX = 380;
/** Below this the action column drops under the summary. */
const STACK_PX = 440;
/** From here on sections sit side by side. */
const WIDE_PX = 720;

/** How long a "Run?" confirmation stays armed. */
const CONFIRM_MS = 5000;
/** How long the result of a manual run stays on screen. */
const FEEDBACK_MS = 9000;
/** How long a rejected action stays on screen. */
const ERROR_MS = 8000;
/** Repaint interval for the countdown and the timeline's now-line. */
const TICK_MS = 30000;
/** Subscription retries back off from the first to the second value. */
const RETRY_MIN_MS = 2000;
const RETRY_MAX_MS = 60000;
/** Failed subscriptions in a row after which the last snapshot is dropped:
    long enough to ride out a reload or restart, short enough not to show a
    day that is no longer true. */
const STALE_AFTER_FAILURES = 4;

const VERDICT_ICONS: Record<string, string> = {
  would_run: "mdi:play-circle-outline",
  would_skip: "mdi:debug-step-over",
  unknown: "mdi:help-circle-outline",
};

const SECTION_ICONS: Record<CardSection, string> = {
  next: "mdi:skip-next-circle-outline",
  timeline: "mdi:chart-timeline-variant",
  covers: "mdi:window-shutter",
  scenarios: "mdi:play-box-multiple-outline",
};

/** Buttons per cover kind: sideways arrows where the cover moves sideways. */
const COVER_ICONS: Record<string, { open: string; close: string }> = {
  curtain: {
    open: "mdi:arrow-expand-horizontal",
    close: "mdi:arrow-collapse-horizontal",
  },
  // Home Assistant's convention: an awning is "open" when it is extended.
  awning: { open: "mdi:arrow-expand-down", close: "mdi:arrow-collapse-up" },
};
const DEFAULT_COVER_ICONS = { open: "mdi:arrow-up", close: "mdi:arrow-down" };

function triggerMeta(trigger: Trigger | undefined): {
  icon: string;
  key: string;
  time: boolean;
} {
  switch (trigger?.type) {
    case "sun_event":
      if (trigger.sun_event === "sunrise") {
        return { icon: "mdi:weather-sunset-up", key: "sunrise", time: false };
      }
      if (trigger.sun_event === "solar_noon") {
        return { icon: "mdi:weather-sunny", key: "solar_noon", time: false };
      }
      return { icon: "mdi:weather-sunset-down", key: "sunset", time: false };
    case "sun_azimuth":
      return { icon: "mdi:sun-compass", key: "sun_azimuth", time: false };
    case "sun_elevation":
      return { icon: "mdi:sun-angle-outline", key: "sun_elevation", time: false };
    default:
      return { icon: "mdi:clock-outline", key: "fixed_time", time: true };
  }
}

export class AdvancedCoverCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _snapshot: { state: true },
    _error: { state: true },
    _actionError: { state: true },
    _busy: { state: true },
    _confirm: { state: true },
    _selected: { state: true },
    _feedback: { state: true },
    _narrow: { state: true },
    _stack: { state: true },
    _wide: { state: true },
  };

  hass?: HomeAssistant;

  private _config?: AdvancedCoverCardConfig;

  private _snapshot?: CardSnapshot;

  /** Subscription-level failure (no entry, backend gone). */
  private _error?: string;

  /** Last rejected action, shown inline and cleared on the next one. */
  private _actionError?: string;

  /** Keys of the controls whose request is in flight. Per control on
      purpose: a slow move must never grey out another cover's Stop. */
  private _busy = new Set<string>();

  /** Key of the run button that waits for its second tap. It names the
      scenario, so a confirmation can never carry over to another one. */
  private _confirm?: string;

  /** Plan block opened in the timeline. */
  private _selected?: string;

  /** The manual run whose outcome is being shown; `since` is server time. */
  private _feedback?: { scenarioId: string; since: number };

  private _narrow = false;

  private _stack = false;

  private _wide = false;

  private _confirmTimer?: number;

  private _feedbackTimer?: number;

  private _errorTimer?: number;

  private _ticker?: number;

  private _unsubscribe?: Promise<() => Promise<void>>;

  private _subscribedEntry?: string;

  /** Bumped on every teardown, so a late answer to an old attempt is ignored. */
  private _generation = 0;

  private _retryTimer?: number;

  private _retryDelay = RETRY_MIN_MS;

  private _failures = 0;

  /** Connection whose `ready` event (a reconnect) is being listened to. */
  private _watched?: HomeAssistant["connection"];

  private _resizeObserver?: ResizeObserver;

  static styles = [timelineStyles, cardStyles];

  static getConfigElement(): HTMLElement {
    return document.createElement("advanced-cover-card-editor");
  }

  static getStubConfig(): Partial<AdvancedCoverCardConfig> {
    // Nothing required: dropped on a dashboard the card picks the only entry
    // and shows the default sections.
    return {};
  }

  setConfig(config: AdvancedCoverCardConfig): void {
    validateConfig(config);
    const previous = this._config;
    this._config = { ...DEFAULT_CONFIG, ...config };
    if (previous?.entry_id !== this._config.entry_id) {
      this._snapshot = undefined;
      this._selected = undefined;
    }
    this._subscribe();
  }

  /** Rough height in HA's 50 px card units, so masonry can place the card. */
  getCardSize(): number {
    const cfg = this._cfg;
    if (cfg.compact) return 1;
    let size = cfg.show_header ? 1 : 0;
    for (const section of cfg.sections) {
      if (section === "next") size += 3;
      else if (section === "timeline") {
        size += 2 + (cfg.timeline_list ? (this._snapshot?.plan.length ?? 3) : 0);
      } else if (section === "covers") {
        size += 1 + (this._snapshot?.covers.length ?? 3);
      } else {
        size += 1 + (this._snapshot?.scenarios.length ?? 3);
      }
    }
    return Math.max(1, Math.round(size));
  }

  /** Sections view: half a row by default, never less than a third. */
  getGridOptions(): Record<string, unknown> {
    if (this._cfg.compact) {
      return { columns: 12, rows: 1, min_columns: 6, min_rows: 1 };
    }
    return { columns: 12, rows: "auto", min_columns: 6 };
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._subscribe();
    this._observeWidth();
    this._ticker = window.setInterval(() => this.requestUpdate(), TICK_MS);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this._teardown();
    this._watched?.removeEventListener?.("ready", this._onReconnect);
    this._watched = undefined;
    window.clearInterval(this._ticker);
    window.clearTimeout(this._confirmTimer);
    window.clearTimeout(this._feedbackTimer);
    window.clearTimeout(this._errorTimer);
    // The timers are gone, so what they would have ended must end here: a
    // card that is moved in the DOM may not come back with "Run?" still armed.
    this._confirm = undefined;
    this._feedback = undefined;
    this._actionError = undefined;
    this._resizeObserver?.disconnect();
    this._resizeObserver = undefined;
  }

  /** `hass` is replaced on every state change anywhere in Home Assistant;
      repaint only when something the card shows has changed with it. */
  protected shouldUpdate(changed: PropertyValues): boolean {
    if (changed.size !== 1 || !changed.has("hass")) return true;
    const previous = changed.get("hass") as HomeAssistant | undefined;
    const hass = this.hass;
    const snap = this._snapshot;
    if (!previous || !hass || !snap) return true;
    if (
      previous.localize !== hass.localize ||
      previous.locale !== hass.locale ||
      previous.language !== hass.language ||
      previous.areas !== hass.areas ||
      previous.user !== hass.user ||
      previous.connection !== hass.connection ||
      previous.themes?.darkMode !== hass.themes?.darkMode
    ) {
      return true;
    }
    const cfg = this._cfg;
    if (cfg.compact || !cfg.sections.includes("covers")) return false;
    return snap.covers.some(
      (cover) => previous.states[cover.entity_id] !== hass.states[cover.entity_id]
    );
  }

  protected updated(changed: PropertyValues): void {
    if (this.hass && !this._unsubscribe && this._retryTimer === undefined) {
      this._subscribe();
    }
    this.toggleAttribute("data-narrow", this._narrow);
    this.toggleAttribute("data-stack", this._stack);
    this.toggleAttribute("data-wide", this._wide);
    this.toggleAttribute("data-dark", Boolean(this.hass?.themes?.darkMode));
    if (changed.has("_confirm") && this._confirm) {
      // Arming swaps the play button for "Run?"; keep the keyboard on it.
      this.renderRoot.querySelector<HTMLElement>("[data-confirm]")?.focus();
    }
  }

  private get _cfg(): Required<
    Omit<AdvancedCoverCardConfig, "type" | "entry_id" | "title">
  > &
    AdvancedCoverCardConfig {
    return { ...DEFAULT_CONFIG, ...(this._config ?? { type: "" }) };
  }

  /** `hass` that answers the card's translation keys from the bundle. */
  private get _l(): HomeAssistant {
    return localizedHass(this.hass!);
  }

  private _t(key: string, values?: Record<string, string | number>): string {
    return t(this._l, `config_panel.${key}`, values);
  }

  private _observeWidth(): void {
    if (this._resizeObserver || typeof ResizeObserver === "undefined") return;
    this._resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      if (width === 0) return;
      this._narrow = width < NARROW_PX;
      this._stack = width < STACK_PX;
      this._wide = width >= WIDE_PX;
    });
    this._resizeObserver.observe(this);
  }

  // ---- data ---------------------------------------------------------------

  private _teardown(): void {
    this._generation += 1;
    this._unsubscribe?.then((unsub) => unsub()).catch(() => undefined);
    this._unsubscribe = undefined;
    this._subscribedEntry = undefined;
    window.clearTimeout(this._retryTimer);
    this._retryTimer = undefined;
  }

  /** A reconnect (Home Assistant restarted, network came back): the old
      subscription died with the old socket. */
  private _onReconnect = (): void => {
    this._teardown();
    this._retryDelay = RETRY_MIN_MS;
    this._subscribe();
  };

  private _watchConnection(): void {
    const connection = this.hass?.connection;
    if (connection === this._watched) return;
    this._watched?.removeEventListener?.("ready", this._onReconnect);
    this._watched = connection;
    connection?.addEventListener?.("ready", this._onReconnect);
  }

  private _scheduleRetry(): void {
    window.clearTimeout(this._retryTimer);
    this._retryTimer = window.setTimeout(() => {
      this._retryTimer = undefined;
      this._subscribe();
    }, this._retryDelay);
    this._retryDelay = Math.min(this._retryDelay * 2, RETRY_MAX_MS);
  }

  private _subscribe(): void {
    if (!this.hass || !this._config || !this.isConnected) return;
    this._watchConnection();
    const entry = this._config.entry_id ?? "";
    // Subscribed, or waiting for the next attempt at exactly this entry.
    if (
      this._subscribedEntry === entry &&
      (this._unsubscribe || this._retryTimer !== undefined)
    ) {
      return;
    }
    this._teardown();
    const generation = this._generation;
    const pending = subscribeSnapshot(
      this.hass,
      (message) => {
        if (generation !== this._generation) return;
        if ("unloaded" in message) {
          // The entry was unloaded (a reload, usually): keep the last day on
          // screen and come back for the new one.
          this._teardown();
          this._subscribedEntry = entry;
          this._retryDelay = RETRY_MIN_MS;
          this._scheduleRetry();
          return;
        }
        this._snapshot = message;
        this._error = undefined;
        this._failures = 0;
        this._retryDelay = RETRY_MIN_MS;
      },
      this._config.entry_id
    );
    if (!pending) return;
    this._subscribedEntry = entry;
    this._unsubscribe = pending;
    pending.catch((err: { code?: string }) => {
      if (generation !== this._generation) return;
      this._unsubscribe = undefined;
      this._failures += 1;
      // A stale day is fine for a moment (restart, reload), not for long.
      if (!this._snapshot || this._failures >= STALE_AFTER_FAILURES) {
        this._snapshot = undefined;
        // "Nothing configured" and "several entries, pick one" need
        // different answers from the user, so they get different sentences.
        this._error = this._t(
          err?.code === "ambiguous_entry" ? "card_pick_entry" : "card_no_entry"
        );
      }
      // Never on every repaint: a card that cannot subscribe would otherwise
      // send one request per state change in the whole house.
      this._scheduleRetry();
    });
  }

  // ---- actions ------------------------------------------------------------

  private _isBusy(key: string): boolean {
    return this._busy.has(key);
  }

  private _showActionError(text: string | undefined): void {
    this._actionError = text;
    window.clearTimeout(this._errorTimer);
    if (text) {
      this._errorTimer = window.setTimeout(() => {
        this._actionError = undefined;
      }, ERROR_MS);
    }
  }

  /** Run one request; resolves to whether it went through. */
  private async _act(
    key: string,
    request: () => Promise<unknown>
  ): Promise<boolean> {
    if (!this.hass || this._busy.has(key)) return false;
    this._busy = new Set(this._busy).add(key);
    this._showActionError(undefined);
    try {
      await request();
      return true;
    } catch (err) {
      this._showActionError(formatApiError(err, this._l));
      return false;
    } finally {
      const busy = new Set(this._busy);
      busy.delete(key);
      this._busy = busy;
    }
  }

  /** First tap arms the button, the second one runs — unless that is off. */
  private _requestRun(key: string, scenarioId: string): void {
    if (this._cfg.confirm_run && this._confirm !== key) {
      this._confirm = key;
      window.clearTimeout(this._confirmTimer);
      this._confirmTimer = window.setTimeout(() => {
        this._confirm = undefined;
      }, CONFIRM_MS);
      return;
    }
    this._cancelConfirm();
    void this._run(key, scenarioId);
  }

  private _cancelConfirm(): void {
    window.clearTimeout(this._confirmTimer);
    this._confirm = undefined;
  }

  private async _run(key: string, scenarioId: string): Promise<void> {
    // The run's outcome is read back from the action log, which is stamped
    // with the server's clock — so the "since" mark is the server's too: the
    // time of the last snapshot, which is later than everything logged so far.
    const since = this._snapshot ? new Date(this._snapshot.now).getTime() : 0;
    const ran = await this._act(key, () =>
      runScenario(
        this.hass!,
        scenarioId,
        this._cfg.ignore_conditions,
        this._config?.entry_id
      )
    );
    if (!ran) return;
    this._feedback = { scenarioId, since };
    window.clearTimeout(this._feedbackTimer);
    this._feedbackTimer = window.setTimeout(() => {
      this._feedback = undefined;
    }, FEEDBACK_MS);
  }

  private _toggleMaster(): void {
    const enabled = !this._snapshot?.enabled;
    void this._act("master", () =>
      setEnabled(this.hass!, enabled, this._config?.entry_id)
    );
  }

  private _toggleCoverAutomation(cover: CardCover): void {
    void this._act(`auto:${cover.id}`, () =>
      setCoverEnabled(
        this.hass!,
        cover.id,
        !cover.enabled,
        this._config?.entry_id
      )
    );
  }

  private _drive(cover: CardCover, command: "open" | "close" | "stop"): void {
    void this._act(`cover:${cover.id}:${command}`, () =>
      driveCover(this.hass!, cover.id, command, this._config?.entry_id)
    );
  }

  private _moreInfo(entityId: string | null | undefined): void {
    if (entityId) fireEvent(this, "hass-more-info", { entityId });
  }

  private _openPanel(): void {
    if (this._snapshot) {
      navigate(this, exportPath(this._snapshot.entry_id, "today"));
    }
  }

  private _select(key: string): void {
    this._selected = this._selected === key ? undefined : key;
  }

  // ---- render -------------------------------------------------------------

  protected render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    useTimeZone(this.hass);
    const snap = this._snapshot;
    if (this._error || !snap) {
      return html`<ha-card>
        <div class="message">
          <ha-icon
            icon=${this._error ? "mdi:alert-circle-outline" : "mdi:window-shutter-cog"}
          ></ha-icon>
          ${this._error ?? this._t("card_loading")}
        </div>
      </ha-card>`;
    }
    const cfg = this._cfg;
    if (cfg.compact) return this._renderCompact(snap);
    const renderers: Record<CardSection, () => TemplateResult> = {
      next: () => this._renderNext(snap),
      timeline: () => this._renderTimeline(snap),
      covers: () => this._renderCovers(snap),
      scenarios: () => this._renderScenarios(snap),
    };
    // A section listed twice would only repeat itself.
    const sections = [...new Set(cfg.sections)];
    return html`<ha-card>
      ${cfg.show_header ? this._renderHeader(snap) : nothing}
      ${this._actionError
        ? html`<p class="error" role="alert">${this._actionError}</p>`
        : nothing}
      <div class="sections">
        ${sections.map(
          (section) =>
            html`<div class="sec sec-${section}">${renderers[section]()}</div>`
        )}
      </div>
    </ha-card>`;
  }

  /** State of the automation; a tap opens the master switch, which is how
      a card without the "next" section still lets you switch it. */
  private _statePill(snap: CardSnapshot): TemplateResult {
    const [tone, key] = !snap.enabled
      ? ["", "card_state_off"]
      : waitingRuns(snap.plan, Date.now()).length
        ? ["warn", "card_state_waiting"]
        : ["pri", "card_state_active"];
    if (!snap.master_entity_id) {
      return html`<span class="pill ${tone}">${this._t(key)}</span>`;
    }
    return html`<button
      type="button"
      class="pill ${tone}"
      title=${this._t("card_master_info")}
      aria-label="${this._t(key)} · ${this._t("card_master_info")}"
      @click=${() => this._moreInfo(snap.master_entity_id)}
    >
      ${this._t(key)}
    </button>`;
  }

  private _renderHeader(snap: CardSnapshot): TemplateResult {
    return html`<div class="head ${snap.enabled ? "" : "off"}">
      <ha-icon icon="mdi:window-shutter-cog"></ha-icon>
      <span class="title ellipsis">${this._config?.title || snap.name}</span>
      ${this._statePill(snap)}
      ${this.hass?.user?.is_admin
        ? html`<button
            type="button"
            class="iconbtn"
            title=${this._t("card_open_panel")}
            aria-label=${this._t("card_open_panel")}
            @click=${this._openPanel}
          >
            <ha-icon icon="mdi:open-in-new"></ha-icon>
          </button>`
        : nothing}
    </div>`;
  }

  private _secHead(
    section: CardSection,
    aside: TemplateResult | string | typeof nothing = nothing
  ): TemplateResult {
    return html`<div class="sec-head">
      <ha-icon icon=${SECTION_ICONS[section]}></ha-icon>
      <span class="sec-title">${this._t(`card_ed_sec_${section}`)}</span>
      ${aside === nothing ? nothing : html`<span class="sec-aside">${aside}</span>`}
    </div>`;
  }

  private _lead(targetIso: string): string {
    const { h, m } = leadTime(new Date(targetIso).getTime(), Date.now());
    if (h === 0 && m === 0) return this._t("card_now");
    if (h === 0) return this._t("card_in_min", { m });
    if (m === 0) return this._t("card_in_h", { h });
    return this._t("card_in_h_min", { h, m });
  }

  private _coversTarget(count: number, positions: number[]): string {
    const pos = positionsLabel(positions);
    return count === 1
      ? this._t("card_covers_target_one", { pos })
      : this._t("card_covers_target", { n: count, pos });
  }

  /** Status chip of one plan block: its result, or the live check before. */
  private _occBadge(occ: Occurrence): TemplateResult {
    if (occ.fired) {
      const kind = timelineClass(occ);
      const label = kind === "executed_partial" ? "executed" : occKind(occ);
      return html`<span class="badge ${kind}">
        <span>${this._t(`status_${label}`)}</span>
        ${kind === "executed_partial"
          ? html`<ha-icon icon="mdi:alert-circle-outline"></ha-icon>`
          : nothing}
      </span>`;
    }
    const verdict = occVerdict(occ);
    const scenario = this._snapshot?.scenarios.find(
      (s) => s.id === occ.scenario_id
    );
    // Without conditions "would run now" says nothing — it is just planned.
    if (verdict === "would_run" && !scenario?.has_conditions) {
      return html`<span class="badge planned">
        <span>${this._t("status_planned")}</span>
      </span>`;
    }
    return html`<span
      class="verdict ${verdict}"
      title=${occPreflightReason(this._l, occ) ?? ""}
    >
      <ha-icon icon=${VERDICT_ICONS[verdict]}></ha-icon>
      <span>${this._t(`preflight_${verdict}`)}</span>
    </span>`;
  }

  /** Per-result counts of the manual run that just finished, or null. */
  private _feedbackCounts(scenarioId: string): Array<[string, number]> | null {
    const feedback = this._feedback;
    if (!feedback || feedback.scenarioId !== scenarioId || !this._snapshot) {
      return null;
    }
    return runResultCounts(this._snapshot.log, scenarioId, feedback.since);
  }

  /** Per-cover outcome of the manual run that just finished. */
  private _renderFeedback(scenarioId: string): TemplateResult | typeof nothing {
    const counts = this._feedbackCounts(scenarioId);
    if (!counts) return nothing;
    if (!counts.length) {
      return html`<span class="badge" role="status"
        ><span>${this._t("card_run_nothing")}</span></span
      >`;
    }
    return html`<span class="results" role="status"
      >${counts.map(
        ([result, n]) =>
          html`<span class="badge ${result}"
            ><span>${n}× ${this._t(`status_${result}`)}</span></span
          >`
      )}</span
    >`;
  }

  /** The same outcome as one line of text, for the compact tile. */
  private _feedbackText(scenarioId: string): string | null {
    const counts = this._feedbackCounts(scenarioId);
    if (!counts) return null;
    if (!counts.length) return this._t("card_run_nothing");
    return counts
      .map(([result, n]) => `${n}× ${this._t(`status_${result}`)}`)
      .join(" · ");
  }

  /** Status of one plan block in words (the timeline marker's label). */
  private _occStatusText(occ: Occurrence): string {
    if (occ.fired) return this._t(`status_${occKind(occ)}`);
    const verdict = occVerdict(occ);
    return verdict === "would_run"
      ? this._t("status_planned")
      : this._t(`preflight_${verdict}`);
  }

  private _runButton(
    key: string,
    scenarioId: string,
    label: string
  ): TemplateResult {
    const armed = this._confirm === key;
    const busy = this._isBusy(key);
    const confirmLabel = this._t(
      this._cfg.ignore_conditions ? "card_action_run_force" : "card_action_run_confirm"
    );
    return html`<button
      type="button"
      class="btn ${armed ? "confirm" : "primary"}"
      ?data-confirm=${armed}
      .disabled=${busy}
      @click=${() => this._requestRun(key, scenarioId)}
    >
      <ha-icon
        class=${busy ? "spin" : ""}
        icon=${busy ? "mdi:loading" : armed ? "mdi:check" : "mdi:play"}
      ></ha-icon>
      ${armed ? confirmLabel : label}
    </button>`;
  }

  // ---- section: next up ---------------------------------------------------

  private _renderNext(snap: CardSnapshot): TemplateResult {
    const cfg = this._cfg;
    const showRun = cfg.next_actions.includes("run");
    const showToggle = cfg.next_actions.includes("toggle");
    const up = snap.enabled ? nextUp(snap.plan, Date.now()) : null;
    const next = up?.occ ?? null;

    let main: TemplateResult;
    if (!snap.enabled) {
      main = html`
        <div class="label">${this._t("card_next_up")}</div>
        <div class="big">${this._t("card_off_title")}</div>
        <div class="hint">${this._t("card_off_hint")}</div>
      `;
    } else if (up) {
      main = this._renderNextSummary(snap, up);
    } else {
      const done = snap.plan.filter((occ) => occ.fired).length;
      main = html`
        <div class="label">${this._t("card_next_up")}</div>
        <div class="big">
          ${this._t(snap.plan.length ? "card_nothing_more" : "card_no_plan")}
        </div>
        <div class="hint">
          ${snap.plan.length
            ? this._t("card_nothing_more_hint", {
                done,
                total: snap.plan.length,
              })
            : this._t("card_no_plan_hint")}
        </div>
        ${snap.tomorrow
          ? html`<div class="tomorrow">
              <ha-icon icon="mdi:calendar-arrow-right"></ha-icon>
              ${this._t("card_tomorrow", {
                time: formatTime(snap.tomorrow.when),
                name: snap.tomorrow.scenario_name,
              })}
            </div>`
          : nothing}
      `;
    }

    const actions: TemplateResult[] = [];
    if (next && showRun) {
      actions.push(
        this._runButton(
          `next:${next.scenario_id}`,
          next.scenario_id,
          this._t("card_action_run")
        )
      );
    }
    if (showToggle) {
      actions.push(html`<button
        type="button"
        class="btn ${snap.enabled ? "" : "primary"}"
        .disabled=${this._isBusy("master")}
        @click=${this._toggleMaster}
      >
        <ha-icon icon=${snap.enabled ? "mdi:pause" : "mdi:power"}></ha-icon>
        ${this._t(snap.enabled ? "card_action_disable" : "card_action_enable")}
      </button>`);
    }

    const waiting = snap.enabled ? waitingRuns(snap.plan, Date.now()) : [];
    const last = cfg.show_last_run ? lastRun(snap.plan) : null;
    const feedback = next ? this._renderFeedback(next.scenario_id) : nothing;
    return html`
      <div class="next">
        <div class="next-main">
          ${main}
          ${feedback !== nothing
            ? html`<div class="feedback">${feedback}</div>`
            : nothing}
        </div>
        ${actions.length
          ? html`<div class="next-actions">${actions}</div>`
          : nothing}
      </div>
      ${waiting.map((occ) => {
        const until = occ.assignments
          .map((run) => run.armed_until)
          .filter((value): value is string => Boolean(value))
          .sort()
          .pop();
        return html`<div class="note">
          <ha-icon icon="mdi:timer-sand"></ha-icon>
          <span
            >${this._t("card_waiting", {
              name: occ.scenario_name,
              time: formatTime(until ?? occ.retry_until),
            })}</span
          >
        </div>`;
      })}
      ${last
        ? html`<div class="last">
            <span class="what ellipsis"
              >${this._t("card_last_run")}
              <b class="num">${formatTime(last.planned_at)}</b> ·
              ${last.scenario_name}</span
            >
            ${this._occBadge(last)}
          </div>`
        : nothing}
    `;
  }

  private _renderNextSummary(snap: CardSnapshot, up: UpNext): TemplateResult {
    const occ = up.occ;
    const scenario = snap.scenarios.find((s) => s.id === occ.scenario_id);
    const trigger = triggerMeta(scenario?.trigger);
    const verdict = occVerdict(occ);
    // A block that already fired (a facade-relative one with covers still to
    // come) has no live check any more — its conditions were decided then.
    const showCheck =
      !occ.fired &&
      (verdict !== "would_run" || Boolean(scenario?.has_conditions));
    const reason = verdict === "would_run" ? null : occPreflightReason(this._l, occ);
    return html`
      <div class="label">${this._t("card_next_up")}</div>
      <div class="clock-row">
        <span class="clock">${formatTime(up.at)}</span>
        <span class="lead">${this._lead(up.at)}</span>
      </div>
      <div class="next-name">${occ.scenario_name}</div>
      <div class="facts">
        <span>
          <ha-icon icon=${trigger.icon}></ha-icon>
          ${this._t(`card_trigger_${trigger.key}`)}
        </span>
        <span>
          <ha-icon icon="mdi:window-shutter"></ha-icon>
          ${this._coversTarget(up.runs.length, runPositions(up.runs))}
        </span>
      </div>
      ${showCheck
        ? html`<div class="check">
            <span class="verdict ${verdict}">
              <ha-icon icon=${VERDICT_ICONS[verdict]}></ha-icon>
              <span>${this._t(`preflight_${verdict}`)}</span>
            </span>
            ${reason ? html`<span class="check-reason">${reason}</span>` : nothing}
          </div>`
        : nothing}
    `;
  }

  // ---- section: timeline --------------------------------------------------

  private _renderTimeline(snap: CardSnapshot): TemplateResult {
    const cfg = this._cfg;
    const events = snap.plan
      .map((occ): TimelineEvent | null => {
        const minute = minutesOfDay(occ.planned_at);
        if (minute == null) return null;
        const key = occKey(occ);
        return {
          id: key,
          minute,
          colorClass: `${timelineClass(occ)}${this._selected === key ? " sel" : ""}`,
          // Colour alone does not tell a screen reader how the run went.
          label: `${formatTime(occ.planned_at)} · ${occ.scenario_name} · ${this._occStatusText(occ)}`,
          timeLabel: formatTime(occ.planned_at),
          spanEndMinute: retrySpanEnd(occ),
          onClick: () => this._select(key),
        };
      })
      .filter((event): event is TimelineEvent => event !== null);
    const now = new Date();
    const selected = snap.plan.find((occ) => occKey(occ) === this._selected);
    const sun = html`
      ${snap.sun.sunrise
        ? html`<span
            ><ha-icon icon="mdi:weather-sunset-up"></ha-icon>${formatTime(
              snap.sun.sunrise
            )}</span
          >`
        : nothing}
      ${snap.sun.sunset
        ? html`<span
            ><ha-icon icon="mdi:weather-sunset-down"></ha-icon>${formatTime(
              snap.sun.sunset
            )}</span
          >`
        : nothing}
    `;
    return html`
      ${this._secHead("timeline", sun)}
      ${renderTimeline({
        events,
        sunriseMin: snap.sun.sunrise ? minutesOfDay(snap.sun.sunrise) : null,
        sunsetMin: snap.sun.sunset ? minutesOfDay(snap.sun.sunset) : null,
        nowMin: minutesOfDay(now.toISOString()) ?? 0,
        showTimeLabels: false,
        axisEveryH: this._narrow ? 6 : 3,
      })}
      ${cfg.timeline_legend ? this._renderLegend() : nothing}
      ${!snap.plan.length
        ? html`<div class="empty">${this._t("card_timeline_empty")}</div>`
        : cfg.timeline_list
          ? html`<div class="runs">
              ${snap.plan.map((occ) => this._renderRunRow(occ))}
            </div>`
          : selected
            ? this._renderOccDetail(selected, true)
            : nothing}
    `;
  }

  private _renderLegend(): TemplateResult {
    const dot = (cls: string, key: string) =>
      html`<span><span class="dot ${cls}"></span>${this._t(key)}</span>`;
    return html`<div class="legend">
      ${dot("executed", "today_legend_executed")}
      ${dot("will_run", "today_legend_will_run")}
      ${dot("would_skip", "today_legend_would_skip")}
      ${dot("skipped", "today_legend_skipped")}
      ${dot("executed_partial", "today_legend_partial")}
      <span
        ><span class="swatch-retry"></span>${this._t("today_legend_retry")}</span
      >
    </div>`;
  }

  private _renderRunRow(occ: Occurrence): TemplateResult {
    const key = occKey(occ);
    const open = this._selected === key;
    return html`
      <button
        type="button"
        class="run ${occ.fired ? "past" : ""} ${open ? "open" : ""}"
        aria-expanded=${open ? "true" : "false"}
        @click=${() => this._select(key)}
      >
        <span class="dot ${timelineClass(occ)}"></span>
        <span class="run-time">${formatTime(occ.planned_at)}</span>
        <span class="run-name ellipsis">${occ.scenario_name}</span>
        ${this._occBadge(occ)}
        <ha-icon icon="mdi:chevron-down"></ha-icon>
      </button>
      ${open ? this._renderOccDetail(occ, false) : nothing}
    `;
  }

  /** What one plan block does: targets, live check, and each cover's line. */
  private _renderOccDetail(occ: Occurrence, solo: boolean): TemplateResult {
    // The block's own conditions fail for every cover alike and are named
    // once here; cover-scoped ones (window contact, position) are named on
    // the line of the cover they stop.
    const reason = occ.fired
      ? occReasonSummary(this._l, occ)
      : preflightReason(this._l, occ.preflight);
    const error =
      occ.fired &&
      occ.assignments.some((run) =>
        ["blocked_safety", "unavailable"].includes(run.result ?? "")
      );
    return html`<div class="detail ${solo ? "solo" : ""}">
      ${solo
        ? html`<div class="detail-head">
            <span class="run-time">${formatTime(occ.planned_at)}</span>
            <span class="run-name ellipsis">${occ.scenario_name}</span>
            ${this._occBadge(occ)}
          </div>`
        : nothing}
      <div class="detail-facts">
        <span
          >${this._coversTarget(occ.assignments.length, occPositions(occ))}</span
        >
        ${retrySpanEnd(occ) != null && occ.retry_until
          ? html`<span
              >${this._t("card_retry_until", {
                time: formatTime(occ.retry_until),
              })}</span
            >`
          : nothing}
      </div>
      ${reason
        ? html`<div class="detail-reason ${error ? "error" : ""}">
            <ha-icon icon="mdi:information-outline"></ha-icon>
            <span>${reason}</span>
          </div>`
        : nothing}
      ${occ.assignments.length
        ? html`<div class="lines">
            ${occ.assignments.map((run) => this._renderRunLine(occ, run))}
          </div>`
        : nothing}
    </div>`;
  }

  private _renderRunLine(occ: Occurrence, run: AssignmentRun): TemplateResult {
    // A block whose own conditions fail takes every cover with it, whatever
    // the cover's own checks say; otherwise each cover speaks for itself.
    const block = occ.fired ? "would_run" : (occ.preflight?.verdict ?? "would_run");
    const kind = block === "would_run" ? runKind(occ, run) : block;
    let state = "";
    if (occ.fired) {
      state = this._t(`status_${kind}`);
    } else if (block === "would_run" && kind !== "would_run") {
      state =
        preflightReason(this._l, run.preflight) ?? this._t(`preflight_${kind}`);
    }
    const severe = occ.fired && reasonSeverity(run.reason) === "error";
    return html`<div
      class="line"
      title=${occ.fired ? (formatReason(this._l, run.reason) ?? "") : ""}
    >
      <span class="dot ${kind}"></span>
      <span class="line-name ellipsis">${run.cover_name}</span>
      ${state
        ? html`<span class="line-state ${severe ? "err" : ""} ellipsis"
            >${state}</span
          >`
        : nothing}
      <span class="line-target">${run.target_position} %</span>
    </div>`;
  }

  // ---- section: covers ----------------------------------------------------

  private _areaName(areaId: string | null): string {
    if (!areaId) return this._t("covers_no_area");
    return this.hass?.areas?.[areaId]?.name ?? areaId;
  }

  private _renderCovers(snap: CardSnapshot): TemplateResult {
    const cfg = this._cfg;
    const covers = pick(snap.covers, cfg.covers);
    const groups: Array<[string | null, CardCover[]]> =
      cfg.group_by_area && new Set(covers.map((c) => c.area_id)).size > 1
        ? groupByArea(covers)
        : [[null, covers]];
    const grouped = groups.length > 1;
    return html`
      ${this._secHead("covers", html`<span>${covers.length}</span>`)}
      ${!covers.length
        ? html`<div class="empty">${this._t("card_covers_empty")}</div>`
        : groups.map(
            ([area, list]) => html`
              ${grouped
                ? html`<div class="area">${this._areaName(area)}</div>`
                : nothing}
              <div class="rows">
                ${list.map((cover) => this._renderCover(cover))}
              </div>
            `
          )}
    `;
  }

  /** Position and movement, straight from the entity when the frontend has it. */
  private _coverLive(cover: CardCover): {
    position: number | null;
    moving: boolean;
    available: boolean;
  } {
    const state = this.hass?.states[cover.entity_id];
    if (!state) {
      return { position: cover.position, moving: false, available: false };
    }
    if (["unavailable", "unknown"].includes(state.state)) {
      return { position: null, moving: false, available: false };
    }
    const raw = state.attributes.current_position;
    const position =
      typeof raw === "number"
        ? Math.round(raw)
        : state.state === "open"
          ? 100
          : state.state === "closed"
            ? 0
            : cover.position;
    return {
      position,
      moving: ["opening", "closing"].includes(state.state),
      available: true,
    };
  }

  private _renderCoverSub(cover: CardCover, available: boolean): TemplateResult {
    const parts: TemplateResult[] = [];
    if (!available) {
      parts.push(html`<span class="err">
        <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
        ${this._t("card_cover_unavailable")}
      </span>`);
    }
    if (cover.contact_state === "open" || cover.contact_state === "tilted") {
      parts.push(html`<span class=${cover.safety_blocked ? "err" : "warn"}>
        <ha-icon
          icon=${cover.contact_state === "open"
            ? "mdi:window-open-variant"
            : "mdi:window-open"}
        ></ha-icon>
        ${this._t(`card_cover_window_${cover.contact_state}`)}
      </span>`);
    }
    const next = cover.next_action;
    if (!cover.enabled || !this._snapshot?.enabled) {
      parts.push(html`<span>${this._t("card_cover_auto_off")}</span>`);
    } else if (
      next?.armed &&
      next.fire_at &&
      new Date(next.fire_at).getTime() > Date.now()
    ) {
      // Facade-relative scenario: armed, but simply for this cover's turn.
      parts.push(html`<span title=${next.scenario_name}>
        ${this._t("card_cover_next", {
          time: formatTime(next.fire_at),
          pos: next.position ?? 0,
        })}
      </span>`);
    } else if (next?.armed) {
      parts.push(html`<span class="warn" title=${next.scenario_name}>
        <ha-icon icon="mdi:timer-sand"></ha-icon>
        ${this._t("card_cover_waiting", {
          time: formatTime(next.armed_until ?? next.when),
        })}
      </span>`);
    } else if (next) {
      parts.push(html`<span title=${next.scenario_name}>
        ${this._t("card_cover_next", {
          time: formatTime(next.when),
          pos: next.position ?? 0,
        })}
      </span>`);
    } else if (parts.length === 0) {
      parts.push(html`<span>${this._t("card_cover_idle")}</span>`);
    }
    return html`<span class="cover-sub">${parts}</span>`;
  }

  /** How much of the glyph the shade fills. An awning is the odd one out:
      "open" means extended, so its fabric grows with the position. */
  private _shade(cover: CardCover, position: number | null): number {
    if (position == null) return 0;
    return cover.kind === "awning" ? position : 100 - position;
  }

  private _renderCover(cover: CardCover): TemplateResult {
    const live = this._coverLive(cover);
    const icons = COVER_ICONS[cover.kind] ?? DEFAULT_COVER_ICONS;
    const glyphClass = [
      "glyph",
      live.position == null ? "unknown" : "",
      live.moving ? "moving" : "",
      live.available ? "" : "off",
    ].join(" ");
    const button = (
      command: "open" | "close" | "stop",
      icon: string,
      disabled: boolean
    ) =>
      html`<button
        type="button"
        title=${this._t(`card_cover_${command}`, { name: cover.name })}
        aria-label=${this._t(`card_cover_${command}`, { name: cover.name })}
        .disabled=${disabled ||
        !live.available ||
        this._isBusy(`cover:${cover.id}:${command}`)}
        @click=${() => this._drive(cover, command)}
      >
        <ha-icon icon=${icon}></ha-icon>
      </button>`;
    return html`<div class="cover">
      <button
        type="button"
        class="cover-main"
        @click=${() => this._moreInfo(cover.entity_id)}
      >
        <span
          class=${glyphClass}
          style="--closed:${this._shade(cover, live.position)}%"
          ><span class="shade"></span
        ></span>
        <span class="cover-text">
          <span class="cover-name">
            <span class="ellipsis">${cover.name}</span>
            ${live.position == null
              ? nothing
              : html`<span class="pos">${live.position} %</span>`}
          </span>
          ${this._renderCoverSub(cover, live.available)}
        </span>
      </button>
      ${this._cfg.cover_automation
        ? html`<button
            type="button"
            class="auto ${cover.enabled ? "on" : ""}"
            role="switch"
            aria-checked=${cover.enabled ? "true" : "false"}
            title=${this._t("card_cover_auto", { name: cover.name })}
            aria-label=${this._t("card_cover_auto", { name: cover.name })}
            .disabled=${this._isBusy(`auto:${cover.id}`)}
            @click=${() => this._toggleCoverAutomation(cover)}
          >
            <ha-icon
              icon=${cover.enabled ? "mdi:robot-outline" : "mdi:robot-off-outline"}
            ></ha-icon>
          </button>`
        : nothing}
      ${this._cfg.cover_controls
        ? html`<span class="ctrl">
            ${button("open", icons.open, live.position === 100 && !live.moving)}
            ${button("stop", "mdi:stop", false)}
            ${button("close", icons.close, live.position === 0 && !live.moving)}
          </span>`
        : nothing}
    </div>`;
  }

  // ---- section: scenarios -------------------------------------------------

  private _renderScenarios(snap: CardSnapshot): TemplateResult {
    const scenarios = pick(snap.scenarios, this._cfg.scenarios);
    return html`
      ${this._secHead("scenarios")}
      ${!scenarios.length
        ? html`<div class="empty">${this._t("card_scenarios_empty")}</div>`
        : html`<div class="rows">
            ${scenarios.map((scenario) => this._renderScenario(snap, scenario))}
          </div>`}
    `;
  }

  private _scenarioStatus(
    scenario: CardScenario,
    occ: Occurrence | null
  ): TemplateResult {
    if (!scenario.enabled) {
      return html`<span>${this._t("card_scn_disabled")}</span>`;
    }
    if (!occ) {
      return html`<span>${this._t("card_scn_not_today")}</span>`;
    }
    const when = html`<span
      >${this._t("card_scn_today", { time: formatTime(occ.planned_at) })}</span
    >`;
    if (!occ.fired) {
      const verdict = occVerdict(occ);
      if (verdict === "would_run") return when;
      return html`${when}<span class="warn"
          >${this._t(`preflight_${verdict}`)}</span
        >`;
    }
    const kind = occKind(occ);
    const tone =
      kind === "executed"
        ? "ok"
        : kind === "armed"
          ? "warn"
          : ["blocked_safety", "unavailable"].includes(kind)
            ? "err"
            : "";
    return html`${when}<span class=${tone}
        >${this._t(`status_${kind}`)}</span
      >`;
  }

  private _renderScenario(
    snap: CardSnapshot,
    scenario: CardScenario
  ): TemplateResult {
    const key = `scn:${scenario.id}`;
    const trigger = triggerMeta(scenario.trigger);
    const occ = scenarioOccurrence(scenario, snap.plan);
    const armed = this._confirm === key;
    const busy = this._isBusy(key);
    const feedback = this._renderFeedback(scenario.id);
    const count = scenario.cover_ids.length;
    const runLabel = this._t("card_scn_run", { name: scenario.name });
    return html`<div
      class="scn ${scenario.enabled ? "" : "muted"} ${armed ? "armed" : ""}"
    >
      <span
        class="scn-icon ${trigger.time ? "time" : ""}"
        title=${this._t(`card_trigger_${trigger.key}`)}
      >
        <ha-icon icon=${trigger.icon}></ha-icon>
      </span>
      <div class="scn-text">
        <div class="scn-name ellipsis">${scenario.name}</div>
        <div class="scn-sub">
          ${feedback !== nothing
            ? feedback
            : html`${this._scenarioStatus(scenario, occ)}<span class="tgt"
                  >${count
                    ? this._coversTarget(count, scenario.positions)
                    : this._t("card_scn_no_covers")}</span
                >`}
        </div>
      </div>
      ${armed
        ? html`<span class="scn-confirm">
            <button
              type="button"
              class="btn small confirm"
              data-confirm
              @click=${() => this._requestRun(key, scenario.id)}
            >
              <ha-icon icon="mdi:check"></ha-icon>
              ${this._t(
                this._cfg.ignore_conditions
                  ? "card_scn_confirm_force"
                  : "card_scn_confirm"
              )}
            </button>
            <button
              type="button"
              class="iconbtn"
              title=${this._t("card_cancel")}
              aria-label=${this._t("card_cancel")}
              @click=${this._cancelConfirm}
            >
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </span>`
        : html`<button
            type="button"
            class="play"
            title=${runLabel}
            aria-label=${runLabel}
            .disabled=${!count || busy}
            @click=${() => this._requestRun(key, scenario.id)}
          >
            <ha-icon
              class=${busy ? "spin" : ""}
              icon=${busy ? "mdi:loading" : "mdi:play"}
            ></ha-icon>
          </button>`}
    </div>`;
  }

  // ---- compact tile -------------------------------------------------------

  private _renderCompact(snap: CardSnapshot): TemplateResult {
    const up = snap.enabled ? nextUp(snap.plan, Date.now()) : null;
    const next = up?.occ ?? null;
    const waiting =
      snap.enabled && waitingRuns(snap.plan, Date.now()).length > 0;
    let sub: string;
    if (!snap.enabled) {
      sub = this._t("card_off_title");
    } else if (up) {
      sub = `${formatTime(up.at)} · ${up.occ.scenario_name} · ${this._lead(up.at)}`;
    } else if (snap.tomorrow) {
      sub = this._t("card_tomorrow", {
        time: formatTime(snap.tomorrow.when),
        name: snap.tomorrow.scenario_name,
      });
    } else {
      sub = this._t(snap.plan.length ? "card_nothing_more" : "card_no_plan");
    }
    const showRun = next && this._cfg.next_actions.includes("run");
    const key = next ? `next:${next.scenario_id}` : "";
    const armed = Boolean(next) && this._confirm === key;
    const busy = this._isBusy(key);
    const outcome = next ? this._feedbackText(next.scenario_id) : null;
    return html`<ha-card>
      <div class="tile ${snap.enabled ? (waiting ? "warn" : "") : "off"}">
        <span class="tile-icon">
          <ha-icon icon="mdi:window-shutter-cog"></ha-icon>
        </span>
        <div class="tile-text">
          <div class="tile-title ellipsis">
            ${this._config?.title || snap.name}
          </div>
          <div class="tile-sub ellipsis" role="status">
            ${this._actionError ?? outcome ?? sub}
          </div>
        </div>
        ${showRun
          ? armed
            ? html`<button
                type="button"
                class="btn small confirm"
                data-confirm
                @click=${() => this._requestRun(key, next.scenario_id)}
              >
                <ha-icon icon="mdi:check"></ha-icon>
                ${this._t(
                  this._cfg.ignore_conditions
                    ? "card_scn_confirm_force"
                    : "card_scn_confirm"
                )}
              </button>`
            : html`<button
                type="button"
                class="play"
                title=${this._t("card_action_run")}
                aria-label=${this._t("card_action_run")}
                .disabled=${busy}
                @click=${() => this._requestRun(key, next.scenario_id)}
              >
                <ha-icon
                  class=${busy ? "spin" : ""}
                  icon=${busy ? "mdi:loading" : "mdi:play"}
                ></ha-icon>
              </button>`
          : this._statePill(snap)}
      </div>
    </ha-card>`;
  }
}

defineCustomElementOnce("advanced-cover-card", AdvancedCoverCard);

window.customCards = window.customCards ?? [];
if (
  !window.customCards.some(
    (card) => (card as { type?: string }).type === "advanced-cover-card"
  )
) {
  window.customCards.push({
    type: "advanced-cover-card",
    name: "Advanced Cover Card",
    description:
      "Next scenario, today's timeline, cover controls and manual scenario runs — pick the sections you need.",
    preview: true,
    documentationURL: "https://github.com/florianbaethge/advanced_cover",
  });
}

// eslint-disable-next-line no-console
console.info(
  `%c ADVANCED-COVER-CARD %c ${__VERSION__} `,
  "color: #fff; background: #03a9f4; font-weight: 700;",
  "color: #03a9f4; background: #fff; font-weight: 700;"
);

declare global {
  interface HTMLElementTagNameMap {
    "advanced-cover-card": AdvancedCoverCard;
  }
}
