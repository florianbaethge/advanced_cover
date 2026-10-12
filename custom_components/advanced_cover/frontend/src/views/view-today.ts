import { LitElement, css, html, nothing } from "lit";
import { recalculate, saveConfig } from "../data/api";
import {
  defineCustomElementOnce,
  formatApiError,
  formatTime,
  minutesOfDay,
  navigate,
} from "../helpers";
import { renderHelp } from "../help";
import { t } from "../i18n";
import { exportPath } from "../navigation";
import {
  condSummary,
  occPreflightBadge,
  occPreflightReason,
  occVerdict,
  renderCondChecklist,
} from "../preflight";
import {
  occHasIssue,
  occKind,
  occReasonSummary,
  occStatusCounts,
  retrySpanEnd,
  runKind,
  timelineClass,
} from "../plan-status";
import { formatReason, reasonSeverity } from "../reasons";
import { sharedStyles } from "../styles";
import { renderTimeline, timelineStyles, type TimelineEvent } from "../timeline";
import type {
  AssignmentRun,
  HomeAssistant,
  Occurrence,
  PanelSnapshot,
} from "../types";

const EXPAND_KEY = "ac-today-expanded";
type Filter = "all" | "upcoming" | "issues";

export class ViewToday extends LitElement {
  static properties = {
    hass: { attribute: false },
    entryId: { type: String },
    snapshot: { attribute: false },
  };

  hass!: HomeAssistant;
  entryId!: string;
  snapshot!: PanelSnapshot;

  private _error?: string;
  private _busy = false;
  private _filter: Filter = "all";
  private _expanded = new Set<string>();

  constructor() {
    super();
    try {
      const raw = sessionStorage.getItem(EXPAND_KEY);
      if (raw) this._expanded = new Set(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }

  private static _occKey(occ: Occurrence): string {
    return `${occ.scenario_id}@${occ.planned_at}`;
  }

  private _isExpanded(occ: Occurrence): boolean {
    const key = ViewToday._occKey(occ);
    if (this._expanded.has(`-${key}`)) return false; // explicitly collapsed
    if (this._expanded.has(key)) return true;
    // Blocks with problems auto-expand unless the user collapsed them.
    return !occ.fired && occHasIssue(occ);
  }

  private _toggleOcc(occ: Occurrence): void {
    const key = ViewToday._occKey(occ);
    const auto = !occ.fired && occHasIssue(occ);
    const open = this._isExpanded(occ);
    this._expanded.delete(key);
    this._expanded.delete(`-${key}`);
    if (open) {
      // collapse: for auto-expanded blocks store an explicit "-" marker
      if (auto) this._expanded.add(`-${key}`);
    } else {
      this._expanded.add(key);
    }
    try {
      sessionStorage.setItem(EXPAND_KEY, JSON.stringify([...this._expanded]));
    } catch {
      /* ignore */
    }
    this.requestUpdate();
  }

  static styles = [
    sharedStyles,
    timelineStyles,
    css`
      /* Status card: two-column head + Next up. */
      .status-grid {
        display: grid;
        grid-template-columns: 1fr minmax(280px, 0.9fr);
        gap: 20px;
        align-items: start;
      }
      .status-main {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .master {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 1rem;
        font-weight: 500;
      }
      .summary {
        font-size: 0.85rem;
        color: var(--secondary-text-color);
      }
      .sun-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px 18px;
        margin-top: 2px;
      }
      .sun-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.85rem;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
      }
      .sun-item ha-icon {
        --mdc-icon-size: 18px;
        color: var(--warning-color, #f0b23a);
      }
      .status-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 4px;
      }
      /* Next up panel. */
      .nextup {
        border: 1px solid var(--divider-color);
        border-radius: 12px;
        padding: 14px 16px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.03));
      }
      .nextup-label {
        font-size: 0.72rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--secondary-text-color);
        font-weight: 600;
        margin-bottom: 6px;
      }
      .nextup-time {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        margin-bottom: 4px;
      }
      .nextup-time .clock {
        font-size: 1.15rem;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }
      .nextup-in {
        font-size: 0.8rem;
        color: var(--secondary-text-color);
      }
      .nextup-name {
        font-size: 0.92rem;
        margin: 2px 0;
        text-wrap: pretty;
      }
      .nextup-detail {
        font-size: 0.82rem;
        color: var(--secondary-text-color);
      }
      /* Timeline legend. */
      .legend {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 14px;
        margin-left: auto;
        font-size: 0.74rem;
        color: var(--secondary-text-color);
        font-weight: 400;
      }
      .legend span {
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      .legend .dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
      }
      .legend .dot.executed {
        background: var(--success-color, #43a047);
      }
      .legend .dot.will_run {
        background: var(--primary-color);
      }
      .legend .dot.would_skip {
        background: var(--warning-color, #f0b23a);
      }
      .legend .dot.skipped {
        background: var(--disabled-text-color, #6d7476);
      }
      .legend .dot.executed_partial {
        width: 11px;
        height: 11px;
        background: var(--success-color, #43a047);
        border: 2px solid var(--error-color, #d93025);
        box-sizing: border-box;
      }
      .legend .swatch-retry {
        width: 16px;
        height: 9px;
        border-radius: 3px;
        background: color-mix(in srgb, var(--warning-color, #f0b23a) 16%, transparent);
        border: 1px dashed
          color-mix(in srgb, var(--warning-color, #f0b23a) 55%, transparent);
        box-sizing: border-box;
      }
      /* Plan blocks. */
      .plan-toolbar {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 12px;
      }
      .block {
        border: 1px solid var(--divider-color);
        border-left: 3px solid var(--divider-color);
        border-radius: 10px;
        margin-bottom: 8px;
        overflow: hidden;
      }
      .block.would_skip,
      .block.armed {
        border-left-color: var(--warning-color, #f0b23a);
      }
      .block.would_run,
      .block.executed {
        border-left-color: var(--primary-color);
      }
      .block.blocked_safety,
      .block.unavailable {
        border-left-color: var(--error-color, #d93025);
      }
      /* Row: full-width clickable toggle + trailing icon buttons.
         The icon buttons are siblings of the toggle (never nested inside
         it) — a native <button> nested in a <button> is invalid HTML and
         the parser expels it onto its own line. */
      .block-head {
        display: flex;
        align-items: center;
        gap: 2px;
        padding-right: 6px;
      }
      .block-head:hover {
        background: color-mix(in srgb, var(--primary-color) 5%, transparent);
      }
      .block-toggle {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
        min-width: 0;
        padding: 8px 6px 8px 12px;
        cursor: pointer;
        background: none;
        border: none;
        text-align: left;
        font: inherit;
        color: inherit;
        box-sizing: border-box;
      }
      .block-time {
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        flex-shrink: 0;
      }
      .block-titles {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
        flex: 1;
      }
      .block-line1 {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .block-name {
        font-weight: 500;
      }
      .block-offset {
        font-size: 0.76rem;
        color: var(--secondary-text-color);
      }
      .block-reason {
        font-size: 0.8rem;
        color: var(--secondary-text-color);
      }
      .block-edit,
      .block-chevron-btn {
        flex-shrink: 0;
        width: 34px;
        height: 34px;
        border-radius: 8px;
      }
      .block-chevron {
        color: var(--secondary-text-color);
        --mdc-icon-size: 22px;
      }
      .block-body {
        padding: 0 14px 14px;
        border-top: 1px solid var(--divider-color);
      }
      .only-if {
        margin: 12px 0;
      }
      .only-if-label {
        font-size: 0.74rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--secondary-text-color);
        font-weight: 600;
        margin-bottom: 4px;
      }
      .covers-summary {
        font-size: 0.82rem;
        color: var(--secondary-text-color);
        margin: 10px 0 8px;
      }
      .area-groups {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 8px 16px;
      }
      .area-group-title {
        font-size: 0.76rem;
        font-weight: 600;
        color: var(--secondary-text-color);
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 6px 0 2px;
      }
      .area-group-title .n {
        opacity: 0.7;
      }
      .cover-line {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.85rem;
        padding: 3px 0;
      }
      .cover-line .cover-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
        background: var(--disabled-text-color, #6d7476);
      }
      .cover-line .cover-dot.would_run,
      .cover-line .cover-dot.executed {
        background: var(--primary-color);
      }
      .cover-line .cover-dot.would_skip,
      .cover-line .cover-dot.armed {
        background: var(--warning-color, #f0b23a);
      }
      .cover-line .cover-dot.blocked_safety,
      .cover-line .cover-dot.unavailable {
        background: var(--error-color, #d93025);
      }
      .cover-line .cover-badge {
        flex-shrink: 0;
      }
      .cover-reason {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        font-size: 0.78rem;
        color: var(--secondary-text-color);
        margin: 0 0 4px 16px;
      }
      .cover-reason.error {
        color: var(--error-color, #d93025);
      }
      .cover-reason ha-icon {
        --mdc-icon-size: 15px;
        margin-top: 1px;
        flex-shrink: 0;
      }
      .block-reason.error {
        color: var(--error-color, #d93025);
      }
      .cover-line .cover-fire-at {
        font-size: 0.78rem;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
        flex-shrink: 0;
      }
      .cover-line .cover-target {
        margin-left: auto;
        font-variant-numeric: tabular-nums;
        color: var(--secondary-text-color);
        flex-shrink: 0;
      }
      .cover-safety {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        font-size: 0.78rem;
        color: var(--error-color, #d93025);
        margin: 2px 0 4px 16px;
      }
      .cover-safety ha-icon {
        --mdc-icon-size: 15px;
        margin-top: 1px;
        flex-shrink: 0;
      }
      .show-all {
        font: inherit;
        font-size: 0.8rem;
        color: var(--primary-color);
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px 0;
      }

      @container acview (max-width: 900px) {
        .status-grid {
          grid-template-columns: 1fr;
        }
        .legend {
          margin-left: 0;
        }
        .area-groups {
          grid-template-columns: 1fr 1fr;
        }
      }
      @container acview (max-width: 620px) {
        .area-groups {
          grid-template-columns: 1fr;
        }
      }
    `,
  ];

  private async _toggleMaster(): Promise<void> {
    this._busy = true;
    this.requestUpdate();
    try {
      await saveConfig(this.hass, this.entryId, {
        enabled: !this.snapshot.config.enabled,
      });
    } catch (e) {
      this._error = formatApiError(e, this.hass);
    } finally {
      this._busy = false;
      this.requestUpdate();
    }
  }

  private async _recalculate(): Promise<void> {
    this._busy = true;
    this.requestUpdate();
    try {
      await recalculate(this.hass, this.entryId);
      this._error = undefined;
    } catch (e) {
      this._error = formatApiError(e, this.hass);
    } finally {
      this._busy = false;
      this.requestUpdate();
    }
  }

  private _openScenario(scenarioId: string): void {
    navigate(
      this,
      `${exportPath(this.entryId, "scenarios")}?editScenario=${scenarioId}`
    );
  }

  private _scrollToBlock(occ: Occurrence): void {
    const el = this.renderRoot.querySelector(
      `#block-${CSS.escape(ViewToday._occKey(occ))}`
    );
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (!this._isExpanded(occ)) this._toggleOcc(occ);
  }

  private _areaName(areaId: string | null): string {
    if (!areaId) return t(this.hass, "config_panel.covers_no_area");
    return this.hass.areas?.[areaId]?.name ?? areaId;
  }

  // ------------------------------------------------------------- status card

  private _nextUp(): Occurrence | null {
    const nowMin = minutesOfDay(this.snapshot.now) ?? 0;
    const upcoming = this.snapshot.plan
      .filter((o) => !o.fired && (minutesOfDay(o.planned_at) ?? -1) >= nowMin)
      .sort(
        (a, b) => (minutesOfDay(a.planned_at) ?? 0) - (minutesOfDay(b.planned_at) ?? 0)
      );
    return upcoming[0] ?? null;
  }

  private _renderStatusCard() {
    const snap = this.snapshot;
    const coverCount = snap.covers.length;
    const scenarioCount = snap.scenarios.length;
    const next = this._nextUp();
    return html`
      <ha-card>
        <div class="card-content">
          <div class="status-grid">
            <div class="status-main">
              <label class="master">
                <ha-switch
                  .checked=${snap.config.enabled}
                  .disabled=${this._busy}
                  @click=${this._toggleMaster}
                ></ha-switch>
                ${t(this.hass, "config_panel.today_master")}
              </label>
              <div class="summary">
                ${t(this.hass, "config_panel.today_summary", {
                  scenarios: scenarioCount,
                  covers: coverCount,
                  time: formatTime(this._planRolledAt()),
                })}
              </div>
              <div class="sun-row">
                <span class="sun-item">
                  <ha-icon icon="mdi:weather-sunset-up"></ha-icon>
                  ${t(this.hass, "config_panel.today_sun_sunrise")}
                  ${formatTime(snap.sun.sunrise)}
                </span>
                <span class="sun-item">
                  <ha-icon icon="mdi:weather-sunset-down"></ha-icon>
                  ${t(this.hass, "config_panel.today_sun_sunset")}
                  ${formatTime(snap.sun.sunset)}
                </span>
                ${snap.sun.solar_noon
                  ? html`<span class="sun-item">
                      <ha-icon icon="mdi:weather-sunny"></ha-icon>
                      ${t(this.hass, "config_panel.today_sun_noon")}
                      ${formatTime(snap.sun.solar_noon)}
                    </span>`
                  : nothing}
              </div>
              <div class="status-actions">
                <button
                  type="button"
                  class="iconbtn"
                  aria-label=${t(this.hass, "config_panel.today_recalculate")}
                  title=${t(this.hass, "config_panel.today_recalculate")}
                  .disabled=${this._busy}
                  @click=${this._recalculate}
                >
                  <ha-icon icon="mdi:refresh"></ha-icon>
                </button>
                <span class="muted">${t(this.hass, "config_panel.today_recalculate")}</span>
              </div>
              ${this._error ? html`<p class="error">${this._error}</p>` : nothing}
              ${!snap.config.enabled
                ? html`<p class="warning">
                    ${t(this.hass, "config_panel.today_master_off_hint")}
                  </p>`
                : nothing}
            </div>
            ${next ? this._renderNextUp(next) : nothing}
          </div>
        </div>
      </ha-card>
    `;
  }

  private _planRolledAt(): string | null {
    // Plan is rebuilt at local midnight; use the earliest base_at's day start.
    const first = this.snapshot.plan[0];
    if (!first) return null;
    const d = new Date(first.base_at);
    if (Number.isNaN(d.getTime())) return null;
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }

  private _renderNextUp(occ: Occurrence) {
    const nowMin = minutesOfDay(this.snapshot.now) ?? 0;
    const occMin = minutesOfDay(occ.planned_at) ?? 0;
    const inMin = Math.max(0, occMin - nowMin);
    const targetPos = occ.assignments[0]?.target_position ?? 0;
    const reason = occPreflightReason(this.hass, occ);
    return html`
      <div class="nextup">
        <div class="nextup-label">${t(this.hass, "config_panel.today_next_up")}</div>
        <div class="nextup-time">
          <span class="clock">${formatTime(occ.planned_at)}</span>
          <span class="nextup-in"
            >${t(this.hass, "config_panel.today_in_min", { n: inMin })}</span
          >
          ${occPreflightBadge(this.hass, occ)}
        </div>
        <div class="nextup-name">${occ.scenario_name}</div>
        <div class="nextup-detail">
          ${t(this.hass, "config_panel.today_covers_target", {
            n: occ.assignments.length,
            pos: targetPos,
          })}${reason ? html` · ${reason}` : nothing}
        </div>
      </div>
    `;
  }

  // ---------------------------------------------------------- timeline card

  private _timelineEvents(): TimelineEvent[] {
    return this.snapshot.plan
      .map((occ) => {
        const m = minutesOfDay(occ.planned_at);
        if (m == null) return null;
        return {
          id: ViewToday._occKey(occ),
          minute: m,
          colorClass: timelineClass(occ),
          label: `${formatTime(occ.planned_at)} · ${occ.scenario_name}`,
          timeLabel: formatTime(occ.planned_at),
          spanEndMinute: retrySpanEnd(occ),
          onClick: () => this._scrollToBlock(occ),
        } as TimelineEvent;
      })
      .filter((e): e is TimelineEvent => e !== null);
  }

  private get _phone(): boolean {
    return (this.renderRoot as ShadowRoot)?.host?.clientWidth
      ? (this.renderRoot as ShadowRoot).host.clientWidth < 620
      : window.innerWidth < 620;
  }

  private _renderTimelineCard() {
    const snap = this.snapshot;
    const phone = this._phone;
    return html`
      <ha-card>
        <div class="card-header">
          <ha-icon icon="mdi:chart-timeline-variant"></ha-icon>
          ${t(this.hass, "config_panel.today_timeline")}
          <span class="legend">
            <span><span class="dot executed"></span>${t(this.hass, "config_panel.today_legend_executed")}</span>
            <span><span class="dot will_run"></span>${t(this.hass, "config_panel.today_legend_will_run")}</span>
            <span><span class="dot would_skip"></span>${t(this.hass, "config_panel.today_legend_would_skip")}</span>
            <span><span class="dot skipped"></span>${t(this.hass, "config_panel.today_legend_skipped")}</span>
            <span><span class="dot executed_partial"></span>${t(this.hass, "config_panel.today_legend_partial")}</span>
            <span><span class="swatch-retry"></span>${t(this.hass, "config_panel.today_legend_retry")}</span>
          </span>
        </div>
        <div class="card-content">
          ${snap.plan.length
            ? renderTimeline({
                events: this._timelineEvents(),
                sunriseMin: snap.sun.sunrise ? minutesOfDay(snap.sun.sunrise) : null,
                sunsetMin: snap.sun.sunset ? minutesOfDay(snap.sun.sunset) : null,
                nowMin: minutesOfDay(snap.now) ?? 0,
                showTimeLabels: !phone,
                axisEveryH: phone ? 4 : 2,
              })
            : html`<p class="muted">
                ${t(this.hass, "config_panel.today_empty_nothing_planned")}
              </p>`}
        </div>
      </ha-card>
    `;
  }

  // -------------------------------------------------------------- plan card

  private _filteredPlan(): Occurrence[] {
    const nowMin = minutesOfDay(this.snapshot.now) ?? 0;
    return this.snapshot.plan.filter((occ) => {
      if (this._filter === "upcoming") {
        return !occ.fired && (minutesOfDay(occ.planned_at) ?? -1) >= nowMin;
      }
      if (this._filter === "issues") return occHasIssue(occ);
      return true;
    });
  }

  private _renderBlockBody(occ: Occurrence) {
    const scenario = this.snapshot.scenarios.find((s) => s.id === occ.scenario_id);
    const blockedCount = occ.assignments.filter(
      (r) => runKind(occ, r) === "blocked_safety" || r.result === "blocked_safety"
    ).length;
    // Group runs by area.
    const groups = new Map<string | null, AssignmentRun[]>();
    for (const run of occ.assignments) {
      const key = run.area_id ?? null;
      (groups.get(key) ?? groups.set(key, []).get(key)!).push(run);
    }
    const orderedGroups = [...groups.entries()].sort((a, b) =>
      this._areaName(a[0]).localeCompare(this._areaName(b[0]))
    );
    const conds = occ.preflight?.conditions ?? [];
    return html`
      <div class="block-body">
        ${!occ.fired && conds.length
          ? html`<div class="only-if">
              <div class="only-if-label">
                ${t(this.hass, "config_panel.preflight_only_if")}
              </div>
              ${renderCondChecklist(this.hass, conds)}
            </div>`
          : nothing}
        <div class="covers-summary">
          ${t(this.hass, "config_panel.today_covers_target", {
            n: occ.assignments.length,
            pos: scenario?.action.position ?? occ.assignments[0]?.target_position ?? 0,
          })}
          ${!occ.fired
            ? html` ·
                ${t(this.hass, "config_panel.today_covers_split", {
                  run: occ.covers_would_run,
                  blocked: occ.assignments.length - occ.covers_would_run,
                })}`
            : blockedCount
              ? html` ·
                  ${t(this.hass, "config_panel.today_covers_blocked", {
                    n: blockedCount,
                  })}`
              : nothing}
        </div>
        <div class="area-groups">
          ${orderedGroups.map(
            ([areaId, runs]) => html`
              <div>
                <div class="area-group-title">
                  <ha-icon icon="mdi:map-marker-outline" style="--mdc-icon-size:16px"></ha-icon>
                  ${this._areaName(areaId)}
                  <span class="n">${runs.length}</span>
                </div>
                ${runs.map((run) => this._renderCoverLine(occ, run))}
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  private _renderCoverLine(occ: Occurrence, run: AssignmentRun) {
    const kind = runKind(occ, run);
    const safety = (run.preflight?.conditions ?? []).find(
      (c) => c.scope === "safety" && c.ok === false
    );
    const cover = this.snapshot.covers.find((c) => c.id === run.cover_item_id);
    // After firing, a non-executed run explains itself inline — except for
    // everyday outcomes (trigger passed, already in position), where the
    // status badge alone is enough and a repeated hint per cover is noise.
    const severity = reasonSeverity(run.reason);
    // Before firing: the cover's own failing condition (a scenario condition
    // like "position above 5%" is checked per cover, so this is where it
    // belongs). After firing: the recorded reason.
    const pending = !occ.fired
      ? (run.preflight?.conditions ?? []).find(
          (c) => c.scope !== "safety" && c.ok !== true
        )
      : undefined;
    const reason = pending
      ? condSummary(this.hass, pending)
      : occ.fired && run.result !== "executed" && severity !== "noise"
        ? formatReason(this.hass, run.reason)
        : null;
    const severe =
      ["unavailable", "blocked_safety"].includes(kind) || severity === "error";
    return html`
      <div class="cover-line">
        <span class="cover-dot ${kind}"></span>
        <span class="ellipsis">${run.cover_name}</span>
        ${occ.fired
          ? html`<span class="badge badge-${kind} cover-badge"
              >${t(this.hass, `config_panel.status_${kind}`)}</span
            >`
          : nothing}
        ${run.status === "armed" && run.fire_at
          ? html`<span class="cover-fire-at">≈ ${formatTime(run.fire_at)}</span>`
          : nothing}
        <span class="cover-target">${run.target_position}%</span>
      </div>
      ${reason
        ? html`<div class="cover-reason ${severe ? "error" : ""}">
            <ha-icon
              icon=${severe ? "mdi:alert-outline" : "mdi:information-outline"}
            ></ha-icon>
            <span>${reason}</span>
          </div>`
        : nothing}
      ${safety
        ? html`<div class="cover-safety">
            <ha-icon icon="mdi:alert-outline"></ha-icon>
            <span>
              ${cover?.name}:
              ${t(this.hass, "config_panel.cond_sum_safety", {
                ventilation: cover?.safety.ventilation_position ?? 20,
              })}
            </span>
          </div>`
        : nothing}
    `;
  }

  private _renderBlock(occ: Occurrence) {
    const kind = occKind(occ);
    const expanded = this._isExpanded(occ);
    const reason = !occ.fired
      ? occPreflightReason(this.hass, occ)
      : occReasonSummary(this.hass, occ);
    return html`
      <div class="block ${kind}" id="block-${ViewToday._occKey(occ)}">
        <div class="block-head">
          <button
            type="button"
            class="block-toggle"
            aria-expanded=${expanded ? "true" : "false"}
            @click=${() => this._toggleOcc(occ)}
          >
            <span class="block-time">${formatTime(occ.planned_at)}</span>
            <span class="block-titles">
            <span class="block-line1">
              <span class="block-name ellipsis">${occ.scenario_name}</span>
              ${occ.random_offset_min
                ? html`<span class="block-offset"
                    >${t(this.hass, "config_panel.today_random_offset", {
                      n: occ.random_offset_min,
                    })}</span
                  >`
                : nothing}
              ${occ.fired
                ? this._renderResultBadge(occ)
                : occPreflightBadge(this.hass, occ)}
              ${occ.fired &&
              occ.assignments.some((r) => r.status === "armed") &&
              occ.retry_until
                ? html`<span class="block-offset"
                    >${t(this.hass, "config_panel.today_armed_until", {
                      time: formatTime(occ.retry_until),
                    })}</span
                  >`
                : nothing}
            </span>
              ${reason && !expanded
                ? html`<span
                    class="block-reason ${["unavailable", "blocked_safety"].includes(
                      kind
                    )
                      ? "error"
                      : ""}"
                    >${reason}</span
                  >`
                : nothing}
            </span>
          </button>
          <button
            type="button"
            class="iconbtn block-edit"
            aria-label=${t(this.hass, "config_panel.scenarios_edit")}
            title=${t(this.hass, "config_panel.scenarios_edit")}
            @click=${() => this._openScenario(occ.scenario_id)}
          >
            <ha-icon icon="mdi:pencil-outline"></ha-icon>
          </button>
          <button
            type="button"
            class="iconbtn block-chevron-btn"
            aria-expanded=${expanded ? "true" : "false"}
            aria-label=${t(
              this.hass,
              expanded
                ? "config_panel.today_collapse"
                : "config_panel.today_expand"
            )}
            @click=${() => this._toggleOcc(occ)}
          >
            <ha-icon
              class="block-chevron"
              icon=${expanded ? "mdi:chevron-up" : "mdi:chevron-down"}
            ></ha-icon>
          </button>
        </div>
        ${expanded && occ.assignments.length ? this._renderBlockBody(occ) : nothing}
        ${expanded && !occ.assignments.length
          ? html`<div class="block-body">
              <p class="muted">${t(this.hass, "config_panel.today_no_assignments")}</p>
            </div>`
          : nothing}
      </div>
    `;
  }

  private _renderResultBadge(occ: Occurrence) {
    const counts = occStatusCounts(occ);
    if (counts.length <= 1) {
      const kind = occKind(occ);
      return html`<span class="badge badge-${kind}"
        >${t(this.hass, `config_panel.status_${kind}`)}</span
      >`;
    }
    // Mixed outcomes: one count badge per result ("13× Executed · 1× Blocked").
    return counts.map(
      ([kind, n]) => html`<span class="badge badge-${kind}"
        >${n}× ${t(this.hass, `config_panel.status_${kind}`)}</span
      >`
    );
  }

  private _renderPlanCard() {
    const snap = this.snapshot;
    const issues = snap.plan.filter(occHasIssue).length;
    const filtered = this._filteredPlan();
    return html`
      <ha-card>
        <div class="card-header">
          <ha-icon icon="mdi:format-list-checks"></ha-icon>
          ${t(this.hass, "config_panel.today_plan_title")}
        </div>
        <div class="card-content">
          <div class="plan-toolbar">
            <div class="segmented">
              ${(["all", "upcoming", "issues"] as Filter[]).map(
                (f) => html`
                  <button
                    type="button"
                    class=${this._filter === f ? "selected" : ""}
                    @click=${() => {
                      this._filter = f;
                      this.requestUpdate();
                    }}
                  >
                    ${t(this.hass, `config_panel.today_filter_${f}`)}
                    ${f === "issues" && issues
                      ? html`<span class="count">${issues}</span>`
                      : nothing}
                  </button>
                `
              )}
            </div>
            ${renderHelp(this.hass, "today_statuses")}
          </div>
          <p class="intro">
            ${t(this.hass, "config_panel.today_plan_intro")}
            ${t(this.hass, "config_panel.preflight_evaluated_at", {
              time: formatTime(snap.now),
            })}
          </p>
          ${filtered.length
            ? filtered.map((occ) => this._renderBlock(occ))
            : html`<div class="empty-state">
                <ha-icon icon="mdi:calendar-blank-outline"></ha-icon>
                <p>
                  ${snap.scenarios.length
                    ? t(this.hass, "config_panel.today_empty_nothing_planned")
                    : t(this.hass, "config_panel.today_empty_no_scenarios")}
                </p>
              </div>`}
        </div>
      </ha-card>
    `;
  }

  protected render() {
    if (!this.snapshot) return nothing;
    return html`
      ${this._renderStatusCard()} ${this._renderTimelineCard()}
      ${this._renderPlanCard()}
    `;
  }
}

defineCustomElementOnce("ac-view-today", ViewToday);
