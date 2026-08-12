import { LitElement, css, html, nothing } from "lit";
import { COMPASS, compassStyles, formatAzimuth, nearestCompassDeg, renderCompass } from "../compass";
import { renderConditionEditor } from "../condition-editor";
import {
  deleteScenario,
  previewTrigger,
  reorderScenarios,
  runScenario,
  saveScenario,
} from "../data/api";
import {
  defineCustomElementOnce,
  formatApiError,
  formatTime,
  minutesOfDay,
} from "../helpers";
import { renderHelp } from "../help";
import { t } from "../i18n";
import { stripEditScenarioQueryFromUrl } from "../navigation";
import { occPreflightBadge } from "../preflight";
import { sharedStyles } from "../styles";
import type {
  ActionOverride,
  Assignment,
  Condition,
  CoverRuntime,
  HomeAssistant,
  Occurrence,
  PanelSnapshot,
  SafetyOverride,
  Scenario,
  TriggerPreview,
} from "../types";

const WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const RANDOM_WINDOWS = [0, 15, 30, 60];
const RETRY_WINDOWS = [0, 15, 30, 45, 60, 120, 240, 480];

const DAYPART_ICONS: Record<string, string> = {
  night: "mdi:weather-night",
  morning: "mdi:weather-sunset-up",
  forenoon: "mdi:weather-partly-cloudy",
  noon: "mdi:weather-sunny",
  afternoon: "mdi:weather-partly-cloudy",
  evening: "mdi:weather-sunset",
};

function emptyScenario(): Scenario {
  return {
    id: "",
    name: "",
    enabled: true,
    trigger: {
      type: "fixed_time",
      time_local: "07:00",
      sun_event: "sunset",
      offset_min: 0,
    },
    random_window_min: 0,
    random_direction: "both",
    weekdays: [...WEEKDAYS],
    conditions: [],
    retry_window_min: 0,
    action: {
      position: 0,
      tilt_position: null,
      mode: "normal",
      min_position_delta: null,
      safety_override: null,
    },
    assignments: [],
  };
}

function emptyOverride(): ActionOverride {
  return {
    position: null,
    tilt_position: null,
    mode: null,
    min_position_delta: null,
    safety_override: null,
  };
}

export class ViewScenarios extends LitElement {
  static properties = {
    hass: { attribute: false },
    entryId: { type: String },
    snapshot: { attribute: false },
    editScenarioId: { type: String },
  };

  hass!: HomeAssistant;
  entryId!: string;
  snapshot!: PanelSnapshot;
  editScenarioId?: string;

  private _error?: string;
  private _warnings: string[] = [];
  private _busy = false;
  private _draft: Scenario | null = null;
  private _runIgnoreConditions = false;
  private _openedDeepLink?: string;
  private _dragIndex: number | null = null;
  private _dragOverIndex: number | null = null;
  private _runPopoverId: string | null = null;
  private _menuOpenId: string | null = null;
  private _preview?: TriggerPreview;
  private _previewKey?: string;
  private _previewTimer?: number;

  static styles = [
    sharedStyles,
    compassStyles,
    css`
      .deg-wrap {
        display: inline-flex;
        align-items: center;
        gap: 3px;
      }
      .deg-sign {
        color: var(--secondary-text-color);
      }
      .inline-field {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .inline-field-label {
        font-size: 0.8rem;
        color: var(--secondary-text-color);
        white-space: nowrap;
      }
      .srow {
        display: flex;
        align-items: stretch;
        border: 1px solid var(--divider-color);
        border-left: 3px solid var(--primary-color);
        border-radius: 10px;
        margin-bottom: 8px;
        background: var(--card-background-color);
      }
      .srow.inactive {
        border-left-color: var(--disabled-text-color, #6d7476);
      }
      .srow.dragover {
        box-shadow: 0 -2px 0 0 var(--primary-color);
      }
      .drag-handle {
        display: flex;
        align-items: center;
        padding: 0 4px 0 8px;
        color: var(--secondary-text-color);
        cursor: grab;
      }
      .drag-handle ha-icon {
        --mdc-icon-size: 20px;
      }
      .srow-body {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px 10px 4px;
        flex-wrap: wrap;
      }
      .srow-main {
        flex: 1;
        min-width: 160px;
      }
      .srow-name {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 1rem;
      }
      .srow-name .ellipsis {
        min-width: 0;
      }
      .srow-meta {
        font-size: 0.82rem;
        color: var(--secondary-text-color);
        margin-top: 2px;
      }
      .cond-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-top: 6px;
      }
      .cond-chip {
        font-size: 0.74rem;
        padding: 2px 8px;
        border-radius: 12px;
        background: var(--secondary-background-color, rgba(0, 0, 0, 0.05));
        color: var(--secondary-text-color);
        white-space: nowrap;
      }
      .srow-daypart {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 210px;
        flex-shrink: 0;
        font-size: 0.78rem;
        color: var(--secondary-text-color);
      }
      .srow-daypart ha-icon {
        --mdc-icon-size: 18px;
      }
      .daybar {
        position: relative;
        flex: 1;
        height: 6px;
        border-radius: 3px;
        border: 1px solid var(--divider-color);
        box-sizing: border-box;
      }
      .daybar-marker {
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: var(--primary-color);
        border: 1.5px solid var(--card-background-color);
      }
      .srow-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        position: relative;
      }
      .warn-line {
        display: flex;
        align-items: center;
        gap: 6px;
        color: var(--warning-color, #f0b23a);
        font-size: 0.8rem;
        margin-top: 4px;
      }
      .warn-line ha-icon {
        --mdc-icon-size: 16px;
      }
      /* Popover (run confirm / overflow menu). */
      .popover {
        position: absolute;
        top: 44px;
        right: 0;
        z-index: 5;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 10px;
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
        padding: 12px;
        min-width: 200px;
      }
      .popover .menu-item {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        border: none;
        background: none;
        color: inherit;
        font: inherit;
        font-size: 0.88rem;
        padding: 8px 6px;
        cursor: pointer;
        border-radius: 6px;
        text-align: left;
      }
      .popover .menu-item:hover {
        background: color-mix(in srgb, var(--primary-color) 10%, transparent);
      }
      .popover .menu-item.danger {
        color: var(--error-color);
      }
      .popover ha-icon {
        --mdc-icon-size: 18px;
      }
      /* Editor dialog sticky frame. */
      .dialog.sticky {
        padding: 0;
        display: flex;
        flex-direction: column;
        max-height: 92vh;
        max-width: 760px;
      }
      .dialog-head {
        position: sticky;
        top: 0;
        background: var(--card-background-color);
        padding: 18px 24px 12px;
        border-bottom: 1px solid var(--divider-color);
        z-index: 1;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .dialog-head h3 {
        margin: 0;
        flex: 1;
      }
      .dialog-scroll {
        overflow-y: auto;
        padding: 12px 24px;
      }
      .dialog-foot {
        position: sticky;
        bottom: 0;
        background: var(--card-background-color);
        padding: 12px 24px;
        border-top: 1px solid var(--divider-color);
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .seg {
        display: inline-flex;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        overflow: hidden;
      }
      .seg button {
        font: inherit;
        font-size: 0.875rem;
        border: none;
        background: transparent;
        color: var(--primary-text-color);
        padding: 8px 14px;
        cursor: pointer;
      }
      .seg button.selected {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
      }
      .assignment-box {
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 10px 12px;
        margin-bottom: 8px;
      }
      .assignment-head {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .assignment-head .name {
        font-weight: 600;
        flex: 1;
        min-width: 120px;
      }
      .slider-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .slider-row input[type="number"] {
        width: 76px;
      }
      .quick-add {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px 8px;
        margin-bottom: 10px;
      }
      .quick-add-label {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--secondary-text-color);
      }
      .quick-add-group {
        display: inline-flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
        padding-left: 8px;
        border-left: 1px solid var(--divider-color);
      }
      .quick-add-sub {
        font-size: 0.76rem;
        color: var(--secondary-text-color);
      }
      .quick-add .chip {
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .quick-add .chip ha-icon {
        --mdc-icon-size: 15px;
      }

      @container acview (max-width: 900px) {
        .srow-daypart {
          width: 100%;
          order: 5;
        }
      }
      @container acview (max-width: 620px) {
        .srow-body {
          gap: 8px;
        }
        .srow-actions {
          width: 100%;
          justify-content: flex-start;
          border-top: 1px solid var(--divider-color);
          padding-top: 6px;
          margin-top: 2px;
        }
      }
    `,
  ];

  protected updated(): void {
    if (
      this.editScenarioId &&
      this._openedDeepLink !== this.editScenarioId &&
      this.snapshot
    ) {
      const scenario = this.snapshot.scenarios.find(
        (s) => s.id === this.editScenarioId
      );
      this._openedDeepLink = this.editScenarioId;
      stripEditScenarioQueryFromUrl();
      if (scenario) this._openEdit(scenario);
    }
  }

  // ------------------------------------------------------------------ helpers

  private _coverName(coverItemId: string): string {
    return (
      this.snapshot.covers.find((c) => c.id === coverItemId)?.name ?? coverItemId
    );
  }

  private _areaName(areaId: string): string {
    return this.hass.areas?.[areaId]?.name ?? areaId;
  }

  private _occFor(s: Scenario): Occurrence | undefined {
    return this.snapshot.plan.find((o) => o.scenario_id === s.id);
  }

  private _triggerSummary(s: Scenario): string {
    const offset = s.trigger.offset_min
      ? ` ${s.trigger.offset_min > 0 ? "+" : ""}${s.trigger.offset_min} min`
      : "";
    let trig: string;
    if (s.trigger.type === "fixed_time") {
      trig = s.trigger.time_local ?? "";
    } else if (s.trigger.type === "sun_azimuth") {
      const off = s.trigger.azimuth_offset_deg ?? 0;
      const target = s.trigger.az_relative
        ? `${t(this.hass, "config_panel.cond_sun_rel_short")} ${
            off > 0 ? `+${off}` : off
          }°`
        : formatAzimuth(s.trigger.azimuth_deg ?? 180);
      trig = `${t(this.hass, "config_panel.trigger_sun_azimuth")} ${target}${offset}`;
    } else if (s.trigger.type === "sun_elevation") {
      const arrow = (s.trigger.elevation_dir ?? "falling") === "rising" ? "↑" : "↓";
      trig = `${t(this.hass, "config_panel.trigger_sun_elevation")} ${arrow} ${
        s.trigger.elevation_deg ?? 0
      }°${offset}`;
    } else {
      trig = `${t(this.hass, `config_panel.sun_${s.trigger.sun_event}`)}${offset}`;
    }
    const random = s.random_window_min ? ` ± ${s.random_window_min} min` : "";
    const days =
      s.weekdays.length === 7
        ? t(this.hass, "config_panel.weekdays_all")
        : s.weekdays.map((d) => t(this.hass, `config_panel.weekday_${d}`)).join(" ");
    return `${trig}${random} · ${days}`;
  }

  private _condChipText(cond: Condition): string {
    const e = cond.entity_id ?? "";
    switch (cond.type) {
      case "entity_state":
        return `${e} = ${(cond.states ?? []).join("/")}`;
      case "entity_state_not":
        return `${e} ≠ ${(cond.states ?? []).join("/")}`;
      case "numeric_state":
        return `${e} ${cond.above != null ? `> ${cond.above}` : ""}${
          cond.below != null ? ` < ${cond.below}` : ""
        }`.trim();
      case "cover_position":
        return `${t(this.hass, "config_panel.scenarios_position")} ${cond.op} ${cond.value}%`;
      case "contact":
        return `${t(this.hass, "config_panel.cond_type_contact")}: ${(
          cond.accepted ?? []
        )
          .map((s) => t(this.hass, `config_panel.contact_${s}`))
          .join("/")}`;
      case "sun_position": {
        const parts: string[] = [];
        if (cond.above != null) parts.push(`> ${cond.above}°`);
        if (cond.below != null) parts.push(`< ${cond.below}°`);
        if (cond.az_mode === "absolute") {
          parts.push(`${cond.az_from ?? 0}°–${cond.az_to ?? 0}°`);
        } else if (cond.az_mode === "relative") {
          const sign = (n: number) => (n > 0 ? `+${n}` : `${n}`);
          parts.push(
            `${t(this.hass, "config_panel.cond_sun_rel_short")} ${sign(
              cond.az_from ?? 0
            )}°…${sign(cond.az_to ?? 0)}°`
          );
        }
        return `${t(this.hass, "config_panel.cond_type_sun_position")}: ${parts.join(" · ")}`;
      }
      default:
        return "";
    }
  }

  private _scenarioMinute(s: Scenario): number | null {
    const occ = this._occFor(s);
    if (occ) {
      const m = minutesOfDay(occ.planned_at);
      if (m != null) return m;
    }
    if (s.trigger.type === "fixed_time") {
      const [h, mm] = (s.trigger.time_local ?? "").split(":").map(Number);
      return Number.isFinite(h) && Number.isFinite(mm) ? h * 60 + mm : null;
    }
    const sr = this.snapshot.sun.sunrise
      ? minutesOfDay(this.snapshot.sun.sunrise)
      : null;
    const ss = this.snapshot.sun.sunset
      ? minutesOfDay(this.snapshot.sun.sunset)
      : null;
    let base: number | null = null;
    if (s.trigger.sun_event === "sunrise") base = sr;
    else if (s.trigger.sun_event === "sunset") base = ss;
    else if (s.trigger.sun_event === "solar_noon")
      base = sr != null && ss != null ? Math.round((sr + ss) / 2) : 12 * 60;
    if (base == null) return null;
    return (((base + (s.trigger.offset_min ?? 0)) % 1440) + 1440) % 1440;
  }

  private _dayPart(min: number): string {
    if (min < 5 * 60) return "night";
    if (min < 9 * 60) return "morning";
    if (min < 12 * 60) return "forenoon";
    if (min < 14 * 60) return "noon";
    if (min < 18 * 60) return "afternoon";
    if (min < 21 * 60) return "evening";
    return "night";
  }

  private _sunGradient(): string {
    const night = "color-mix(in srgb, var(--primary-text-color) 10%, var(--card-background-color))";
    const day = "color-mix(in srgb, var(--warning-color, #f0b23a) 20%, var(--card-background-color))";
    const sr = this.snapshot.sun.sunrise
      ? minutesOfDay(this.snapshot.sun.sunrise)
      : null;
    const ss = this.snapshot.sun.sunset
      ? minutesOfDay(this.snapshot.sun.sunset)
      : null;
    if (sr == null || ss == null || sr >= ss) return night;
    const p = (m: number) => Math.max(0, Math.min(100, (m / 1440) * 100));
    const a = p(sr);
    const b = p(ss);
    const f = 3;
    return `linear-gradient(90deg, ${night} 0%, ${night} ${Math.max(0, a - f)}%, ${day} ${a + f}%, ${day} ${Math.max(a + f, b - f)}%, ${night} ${b + f}%, ${night} 100%)`;
  }

  private _renderDaypart(s: Scenario) {
    const min = this._scenarioMinute(s);
    if (min == null) return nothing;
    const key = this._dayPart(min);
    const label = t(this.hass, `config_panel.scenarios_daypart_${key}`);
    return html`
      <div class="srow-daypart">
        <ha-icon icon=${DAYPART_ICONS[key]}></ha-icon>
        <span>${label}</span>
        <div class="daybar" style="background:${this._sunGradient()}">
          <div class="daybar-marker" style="left:${(min / 1440) * 100}%"></div>
        </div>
      </div>
    `;
  }

  private _patch(patch: Partial<Scenario>): void {
    if (!this._draft) return;
    this._draft = { ...this._draft, ...patch };
    this.requestUpdate();
  }

  // ------------------------------------------------------------------ actions

  private _openAdd(): void {
    this._draft = emptyScenario();
    this._error = undefined;
    this._warnings = [];
    this.requestUpdate();
  }

  private _openEdit(scenario: Scenario): void {
    this._draft = JSON.parse(JSON.stringify(scenario)) as Scenario;
    this._error = undefined;
    this._warnings = scenario.warnings ?? [];
    this._menuOpenId = null;
    this.requestUpdate();
  }

  private _duplicate(scenario: Scenario): void {
    const copy = JSON.parse(JSON.stringify(scenario)) as Scenario;
    copy.id = "";
    copy.name = `${copy.name} (copy)`;
    this._draft = copy;
    this._error = undefined;
    this._warnings = [];
    this._menuOpenId = null;
    this.requestUpdate();
  }

  private async _save(): Promise<void> {
    if (!this._draft) return;
    if (!this._draft.name.trim()) {
      this._error = t(this.hass, "config_panel.scenarios_err_name_required");
      this.requestUpdate();
      return;
    }
    this._busy = true;
    this.requestUpdate();
    try {
      const res = await saveScenario(this.hass, this.entryId, this._draft);
      if (res.warnings?.length) {
        this._warnings = res.warnings;
        this._draft = { ...this._draft, id: res.id };
      } else {
        this._draft = null;
        this._warnings = [];
      }
      this._error = undefined;
    } catch (e) {
      this._error = formatApiError(e, this.hass);
    } finally {
      this._busy = false;
      this.requestUpdate();
    }
  }

  private async _delete(scenario: Scenario): Promise<void> {
    this._menuOpenId = null;
    if (
      !window.confirm(
        t(this.hass, "config_panel.scenarios_delete_confirm", { name: scenario.name })
      )
    ) {
      return;
    }
    try {
      await deleteScenario(this.hass, this.entryId, scenario.id);
      if (this._draft?.id === scenario.id) this._draft = null;
    } catch (e) {
      this._error = formatApiError(e, this.hass);
    }
    this.requestUpdate();
  }

  private async _toggleEnabled(scenario: Scenario): Promise<void> {
    try {
      const { warnings, ...payload } = scenario;
      void warnings;
      await saveScenario(this.hass, this.entryId, {
        ...payload,
        enabled: !scenario.enabled,
      });
    } catch (e) {
      this._error = formatApiError(e, this.hass);
      this.requestUpdate();
    }
  }

  private async _reorder(ids: string[]): Promise<void> {
    try {
      await reorderScenarios(this.hass, this.entryId, ids);
    } catch (e) {
      this._error = formatApiError(e, this.hass);
      this.requestUpdate();
    }
  }

  private async _move(index: number, delta: number): Promise<void> {
    const ids = this.snapshot.scenarios.map((s) => s.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    await this._reorder(ids);
  }

  private async _onDrop(dropIndex: number): Promise<void> {
    const from = this._dragIndex;
    this._dragIndex = null;
    this._dragOverIndex = null;
    if (from == null || from === dropIndex) {
      this.requestUpdate();
      return;
    }
    const ids = this.snapshot.scenarios.map((s) => s.id);
    const [moved] = ids.splice(from, 1);
    ids.splice(dropIndex, 0, moved);
    await this._reorder(ids);
  }

  private async _runNow(scenarioId: string): Promise<void> {
    this._runPopoverId = null;
    this._busy = true;
    this.requestUpdate();
    try {
      await runScenario(this.hass, this.entryId, scenarioId, {
        ignoreConditions: this._runIgnoreConditions,
      });
      this._error = undefined;
    } catch (e) {
      this._error = formatApiError(e, this.hass);
    } finally {
      this._busy = false;
      this.requestUpdate();
    }
  }

  // ---------------------------------------------------------------- rendering

  private _renderResultBadge(occ: Occurrence) {
    const runs = occ.assignments;
    let key: string;
    if (runs.length && runs.every((r) => r.result === "executed"))
      key = "scenarios_result_done";
    else if (runs.some((r) => r.result === "executed"))
      key = "scenarios_result_partial";
    else key = "scenarios_result_skipped";
    return html`<span class="badge">${t(this.hass, `config_panel.${key}`)}</span>`;
  }

  private _renderBadge(s: Scenario) {
    if (!s.enabled) {
      return html`<span class="badge">${t(this.hass, "config_panel.scenarios_disabled_off")}</span>`;
    }
    const occ = this._occFor(s);
    if (!occ) return nothing;
    if (occ.fired) return this._renderResultBadge(occ);
    return occPreflightBadge(this.hass, occ);
  }

  private _renderRow(scenario: Scenario, index: number, total: number) {
    const occ = this._occFor(scenario);
    const conds = scenario.conditions;
    const shownConds = conds.slice(0, 2);
    const dragover = this._dragOverIndex === index;
    return html`
      <div
        class="srow ${scenario.enabled ? "" : "inactive"} ${dragover ? "dragover" : ""}"
        @dragover=${(e: DragEvent) => {
          e.preventDefault();
          if (this._dragOverIndex !== index) {
            this._dragOverIndex = index;
            this.requestUpdate();
          }
        }}
        @drop=${() => this._onDrop(index)}
        @keydown=${(e: KeyboardEvent) => {
          if (e.altKey && e.key === "ArrowUp") {
            e.preventDefault();
            this._move(index, -1);
          } else if (e.altKey && e.key === "ArrowDown") {
            e.preventDefault();
            this._move(index, 1);
          }
        }}
        tabindex="0"
      >
        <div
          class="drag-handle"
          draggable="true"
          title=${t(this.hass, "config_panel.scenarios_drag_handle")}
          @dragstart=${() => {
            this._dragIndex = index;
          }}
          @dragend=${() => {
            this._dragIndex = null;
            this._dragOverIndex = null;
            this.requestUpdate();
          }}
        >
          <ha-icon icon="mdi:drag"></ha-icon>
        </div>
        <div class="srow-body">
          <ha-switch
            .checked=${scenario.enabled}
            @click=${() => this._toggleEnabled(scenario)}
          ></ha-switch>
          <div class="srow-main">
            <div class="srow-name">
              <span class="ellipsis">${scenario.name}</span>
              ${this._renderBadge(scenario)}
            </div>
            <div class="srow-meta">
              ${this._triggerSummary(scenario)} ·
              ${t(this.hass, "config_panel.scenarios_covers_count", {
                n: scenario.assignments.length,
              })}
              → ${scenario.action.position}%
              ${occ
                ? html` · ${t(this.hass, "config_panel.scenarios_today_at", {
                    time: formatTime(occ.planned_at),
                  })}`
                : !scenario.enabled
                  ? html` · ${t(this.hass, "config_panel.scenarios_not_in_plan")}`
                  : nothing}
            </div>
            ${shownConds.length
              ? html`<div class="cond-chips">
                  ${shownConds.map(
                    (c) => html`<span class="cond-chip">${this._condChipText(c)}</span>`
                  )}
                  ${conds.length > 2
                    ? html`<span class="cond-chip"
                        >${t(this.hass, "config_panel.scenarios_cond_more", {
                          n: conds.length - 2,
                        })}</span
                      >`
                    : nothing}
                </div>`
              : nothing}
            ${scenario.warnings?.length
              ? html`<div class="warn-line">
                  <ha-icon icon="mdi:alert-outline"></ha-icon>
                  <span>${scenario.warnings.join(" · ")}</span>
                </div>`
              : nothing}
          </div>
          ${this._renderDaypart(scenario)}
          <div class="srow-actions">
            <button
              type="button"
              class="iconbtn"
              title=${t(this.hass, "config_panel.scenarios_run")}
              aria-label=${t(this.hass, "config_panel.scenarios_run")}
              @click=${() => {
                this._runPopoverId =
                  this._runPopoverId === scenario.id ? null : scenario.id;
                this._menuOpenId = null;
                this.requestUpdate();
              }}
            >
              <ha-icon icon="mdi:play"></ha-icon>
            </button>
            <button
              type="button"
              class="iconbtn"
              title=${t(this.hass, "config_panel.scenarios_edit")}
              aria-label=${t(this.hass, "config_panel.scenarios_edit")}
              @click=${() => this._openEdit(scenario)}
            >
              <ha-icon icon="mdi:pencil-outline"></ha-icon>
            </button>
            <button
              type="button"
              class="iconbtn"
              title=${t(this.hass, "config_panel.scenarios_more")}
              aria-label=${t(this.hass, "config_panel.scenarios_more")}
              @click=${() => {
                this._menuOpenId =
                  this._menuOpenId === scenario.id ? null : scenario.id;
                this._runPopoverId = null;
                this.requestUpdate();
              }}
            >
              <ha-icon icon="mdi:dots-vertical"></ha-icon>
            </button>
            ${this._runPopoverId === scenario.id
              ? this._renderRunPopover(scenario)
              : nothing}
            ${this._menuOpenId === scenario.id
              ? this._renderMenu(scenario, index, total)
              : nothing}
          </div>
        </div>
      </div>
    `;
  }

  private _renderRunPopover(scenario: Scenario) {
    return html`
      <div class="popover" @click=${(e: Event) => e.stopPropagation()}>
        <p style="margin:0 0 8px;font-size:0.88rem">
          ${t(this.hass, "config_panel.scenarios_run_now_confirm")}
        </p>
        <label class="checkbox-row" style="margin:0 0 10px">
          <input
            type="checkbox"
            .checked=${this._runIgnoreConditions}
            @change=${(e: Event) => {
              this._runIgnoreConditions = (e.target as HTMLInputElement).checked;
            }}
          />
          ${t(this.hass, "config_panel.scenarios_run_ignore_short")}
        </label>
        <div style="display:flex;gap:8px;justify-content:flex-end">
          <button
            class="btn-outline"
            @click=${() => {
              this._runPopoverId = null;
              this.requestUpdate();
            }}
          >
            ${t(this.hass, "config_panel.cancel")}
          </button>
          <button
            class="btn"
            .disabled=${this._busy}
            @click=${() => this._runNow(scenario.id)}
          >
            ${t(this.hass, "config_panel.scenarios_run")}
          </button>
        </div>
      </div>
    `;
  }

  private _renderMenu(scenario: Scenario, index: number, total: number) {
    return html`
      <div class="popover" @click=${(e: Event) => e.stopPropagation()}>
        <button
          class="menu-item"
          .disabled=${index === 0}
          @click=${() => {
            this._menuOpenId = null;
            this._move(index, -1);
          }}
        >
          <ha-icon icon="mdi:chevron-up"></ha-icon>
          ${t(this.hass, "config_panel.scenarios_move_up")}
        </button>
        <button
          class="menu-item"
          .disabled=${index === total - 1}
          @click=${() => {
            this._menuOpenId = null;
            this._move(index, 1);
          }}
        >
          <ha-icon icon="mdi:chevron-down"></ha-icon>
          ${t(this.hass, "config_panel.scenarios_move_down")}
        </button>
        <button class="menu-item" @click=${() => this._duplicate(scenario)}>
          <ha-icon icon="mdi:content-copy"></ha-icon>
          ${t(this.hass, "config_panel.scenarios_duplicate")}
        </button>
        <button class="menu-item danger" @click=${() => this._delete(scenario)}>
          <ha-icon icon="mdi:delete-outline"></ha-icon>
          ${t(this.hass, "config_panel.scenarios_delete")}
        </button>
      </div>
    `;
  }

  // ---- editor dialog sections (unchanged logic, emoji-free) ----

  private _renderWhenSection(draft: Scenario) {
    return html`
      <div class="section-title">${t(this.hass, "config_panel.scenarios_when")}</div>
      <div class="row">
        <div class="seg">
          ${(["fixed_time", "sun_event", "sun_azimuth", "sun_elevation"] as const).map(
            (tt) => html`
              <button
                type="button"
                class=${draft.trigger.type === tt ? "selected" : ""}
                @click=${() =>
                  this._patch({ trigger: { ...draft.trigger, type: tt } })}
              >
                ${t(
                  this.hass,
                  tt === "sun_event"
                    ? "config_panel.trigger_sun"
                    : `config_panel.trigger_${tt}`
                )}
              </button>
            `
          )}
        </div>
        ${draft.trigger.type === "fixed_time"
          ? html`<input
              type="time"
              style="width:auto"
              .value=${draft.trigger.time_local ?? "07:00"}
              @input=${(e: Event) =>
                this._patch({
                  trigger: {
                    ...draft.trigger,
                    time_local: (e.target as HTMLInputElement).value,
                  },
                })}
            />`
          : draft.trigger.type === "sun_event"
            ? html`
                <select
                  style="width:auto"
                  .value=${draft.trigger.sun_event ?? "sunset"}
                  @change=${(e: Event) =>
                    this._patch({
                      trigger: {
                        ...draft.trigger,
                        sun_event: (e.target as HTMLSelectElement)
                          .value as Scenario["trigger"]["sun_event"],
                      },
                    })}
                >
                  ${["sunrise", "sunset", "solar_noon"].map(
                    (ev) => html`<option value=${ev} ?selected=${draft.trigger.sun_event === ev}>
                      ${t(this.hass, `config_panel.sun_${ev}`)}
                    </option>`
                  )}
                </select>
                ${this._renderOffsetField(draft)}
              `
            : draft.trigger.type === "sun_azimuth"
              ? this._renderSunAzimuthFields(draft)
              : this._renderSunElevationFields(draft)}
      </div>
      ${this._renderLivePreview(draft)}

      <label class="field-label">${t(this.hass, "config_panel.scenarios_random")}</label>
      ${renderHelp(this.hass, "random")}
      <div class="row">
        <span class="chips">
          ${RANDOM_WINDOWS.map(
            (w) => html`<button
              type="button"
              class="chip ${draft.random_window_min === w ? "selected" : ""}"
              @click=${() => this._patch({ random_window_min: w })}
            >
              ${w === 0 ? t(this.hass, "config_panel.off") : `${w} min`}
            </button>`
          )}
        </span>
        ${draft.random_window_min
          ? html`<select
              style="width:auto"
              .value=${draft.random_direction}
              @change=${(e: Event) =>
                this._patch({
                  random_direction: (e.target as HTMLSelectElement)
                    .value as Scenario["random_direction"],
                })}
            >
              ${(["after", "before", "both"] as const).map(
                (d) => html`<option value=${d} ?selected=${draft.random_direction === d}>
                  ${t(this.hass, `config_panel.random_${d}`)}
                </option>`
              )}
            </select>`
          : nothing}
      </div>

      <label class="field-label">${t(this.hass, "config_panel.scenarios_weekdays")}</label>
      <div class="chips" style="margin-bottom:12px">
        ${WEEKDAYS.map((d) => {
          const selected = draft.weekdays.includes(d);
          return html`<button
            type="button"
            class="chip ${selected ? "selected" : ""}"
            @click=${() =>
              this._patch({
                weekdays: selected
                  ? draft.weekdays.filter((x) => x !== d)
                  : [...draft.weekdays, d],
              })}
          >
            ${t(this.hass, `config_panel.weekday_${d}`)}
          </button>`;
        })}
      </div>

      <label class="field-label">${t(this.hass, "config_panel.scenarios_retry")}</label>
      <div class="chips" style="margin-bottom:4px">
        ${RETRY_WINDOWS.map(
          (w) => html`<button
            type="button"
            class="chip ${draft.retry_window_min === w ? "selected" : ""}"
            @click=${() => this._patch({ retry_window_min: w })}
          >
            ${w === 0
              ? t(this.hass, "config_panel.off")
              : w < 60
                ? `${w} min`
                : `${w / 60} h`}
          </button>`
        )}
      </div>
      <p class="section-desc">${t(this.hass, "config_panel.scenarios_retry_hint")}</p>
      ${renderHelp(this.hass, "retry")}
    `;
  }

  private _renderOffsetField(draft: Scenario) {
    return html`
      <span class="inline-field">
        <span class="inline-field-label"
          >${t(this.hass, "config_panel.scenarios_offset_min")}</span
        >
        <input
          type="number"
          min="-720"
          max="720"
          style="width:80px"
          .value=${String(draft.trigger.offset_min ?? 0)}
          @input=${(e: Event) =>
            this._patch({
              trigger: {
                ...draft.trigger,
                offset_min: Number((e.target as HTMLInputElement).value),
              },
            })}
        />
      </span>
    `;
  }

  /** Number input with a degree sign attached tightly to its right edge. */
  private _degInput(
    value: number,
    min: number,
    max: number,
    onInput: (v: number) => void
  ) {
    return html`
      <span class="deg-wrap">
        <input
          type="number"
          min=${min}
          max=${max}
          style="width:80px"
          .value=${String(value)}
          @input=${(e: Event) =>
            onInput(Number((e.target as HTMLInputElement).value))}
        />
        <span class="deg-sign">°</span>
      </span>
    `;
  }

  private _renderSunAzimuthFields(draft: Scenario) {
    const relative = draft.trigger.az_relative ?? false;
    const deg = draft.trigger.azimuth_deg ?? 180;
    return html`
      <div>
        <div class="chips" style="margin-bottom:8px">
          ${([false, true] as const).map(
            (rel) => html`<button
              type="button"
              class="chip ${relative === rel ? "selected" : ""}"
              @click=${() =>
                this._patch({ trigger: { ...draft.trigger, az_relative: rel } })}
            >
              ${t(
                this.hass,
                rel
                  ? "config_panel.trigger_az_mode_facade"
                  : "config_panel.trigger_az_mode_compass"
              )}
            </button>`
          )}
        </div>
        ${relative
          ? html`
              <div class="row">
                <span class="inline-field-label"
                  >${t(this.hass, "config_panel.trigger_facade_offset")}</span
                >
                ${this._degInput(draft.trigger.azimuth_offset_deg ?? 0, -180, 180, (v) =>
                  this._patch({
                    trigger: { ...draft.trigger, azimuth_offset_deg: v },
                  })
                )}
                ${this._renderOffsetField(draft)}
              </div>
              <p class="section-desc">
                ${t(this.hass, "config_panel.trigger_facade_hint")}
              </p>
            `
          : html`
              ${renderCompass(deg, (d) => {
                if (d != null) {
                  this._patch({ trigger: { ...draft.trigger, azimuth_deg: d } });
                }
              })}
              <div class="row" style="justify-content:center">
                ${this._degInput(deg, 0, 359, (v) =>
                  this._patch({ trigger: { ...draft.trigger, azimuth_deg: v } })
                )}
                ${this._renderOffsetField(draft)}
              </div>
              <p class="section-desc">
                ${t(this.hass, "config_panel.trigger_sun_az_hint")}
              </p>
            `}
      </div>
    `;
  }

  private _renderSunElevationFields(draft: Scenario) {
    return html`
      <select
        style="width:auto"
        .value=${draft.trigger.elevation_dir ?? "falling"}
        @change=${(e: Event) =>
          this._patch({
            trigger: {
              ...draft.trigger,
              elevation_dir: (e.target as HTMLSelectElement)
                .value as Scenario["trigger"]["elevation_dir"],
            },
          })}
      >
        ${(["rising", "falling"] as const).map(
          (d) => html`<option
            value=${d}
            ?selected=${(draft.trigger.elevation_dir ?? "falling") === d}
          >
            ${t(this.hass, `config_panel.trigger_dir_${d}`)}
          </option>`
        )}
      </select>
      ${this._degInput(draft.trigger.elevation_deg ?? 0, -20, 89, (v) =>
        this._patch({ trigger: { ...draft.trigger, elevation_deg: v } })
      )}
      ${this._renderOffsetField(draft)}
    `;
  }

  private _maybePreviewSun(draft: Scenario): void {
    const trig = draft.trigger;
    const coverIds =
      trig.type === "sun_azimuth" && trig.az_relative
        ? draft.assignments.map((a) => a.cover_item_id)
        : [];
    const key = JSON.stringify([trig, coverIds]);
    if (key === this._previewKey) return;
    this._previewKey = key;
    window.clearTimeout(this._previewTimer);
    this._previewTimer = window.setTimeout(async () => {
      try {
        const res = await previewTrigger(
          this.hass,
          this.entryId,
          trig as unknown as Record<string, unknown>,
          coverIds
        );
        if (this._previewKey === key) {
          this._preview = res;
          this.requestUpdate();
        }
      } catch {
        /* preview is best-effort */
      }
    }, 250);
  }

  /** Live preview of today's computed trigger time under the WHEN section. */
  private _renderLivePreview(draft: Scenario) {
    const trig = draft.trigger;
    if (trig.type === "sun_azimuth" || trig.type === "sun_elevation") {
      // Draft triggers are resolved server-side by the scheduler's own
      // solver, so the preview works before the scenario is saved.
      this._maybePreviewSun(draft);
      const pv = this._preview;
      if (pv === undefined) return nothing;
      const relative = trig.type === "sun_azimuth" && trig.az_relative;
      const missing = relative && pv.missing?.length
        ? html`<p
            class="section-desc"
            style="margin-top:2px;color:var(--warning-color,#b58c00)"
          >
            ${t(this.hass, "config_panel.trigger_facade_missing", {
              covers: pv.missing.join(", "),
            })}
          </p>`
        : nothing;
      if (relative && !draft.assignments.length) {
        return html`<p class="section-desc" style="margin-top:6px">
          ${t(this.hass, "config_panel.trigger_facade_no_covers")}
        </p>`;
      }
      if (pv.time === null) {
        return html`<p
            class="section-desc"
            style="margin-top:6px;color:var(--warning-color,#b58c00)"
          >
            ${t(this.hass, "config_panel.scenarios_today_none")}
          </p>
          ${missing}`;
      }
      const range =
        relative && pv.time_last && pv.time_last !== pv.time
          ? `${formatTime(pv.time)}–${formatTime(pv.time_last)}`
          : formatTime(pv.time);
      return html`<p class="section-desc" style="margin-top:6px">
          ${t(this.hass, "config_panel.scenarios_today_at", { time: range })}
        </p>
        ${missing}`;
    }
    if (!draft.id) return nothing;
    const occ = this._occFor(draft);
    if (!occ) return nothing;
    return html`<p class="section-desc" style="margin-top:6px">
      ${t(this.hass, "config_panel.scenarios_today_at", {
        time: formatTime(occ.planned_at),
      })}${occ.random_offset_min
        ? ` (${t(this.hass, "config_panel.today_random_offset", {
            n: occ.random_offset_min,
          })})`
        : ""}
    </p>`;
  }

  private _renderThenSection(draft: Scenario) {
    const anyTilt = draft.assignments.some(
      (a) =>
        this.snapshot.covers.find((c) => c.id === a.cover_item_id)?.capabilities
          .supports_tilt
    );
    return html`
      <div class="section-title">${t(this.hass, "config_panel.scenarios_then")}</div>
      <div class="slider-row">
        <ha-icon
          icon=${draft.action.position >= 50
            ? "mdi:window-shutter-open"
            : "mdi:window-shutter"}
          style="--mdc-icon-size:22px;color:var(--secondary-text-color)"
        ></ha-icon>
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          .value=${String(draft.action.position)}
          @input=${(e: Event) =>
            this._patch({
              action: {
                ...draft.action,
                position: Number((e.target as HTMLInputElement).value),
              },
            })}
        />
        <input
          type="number"
          min="0"
          max="100"
          .value=${String(draft.action.position)}
          @input=${(e: Event) =>
            this._patch({
              action: {
                ...draft.action,
                position: Number((e.target as HTMLInputElement).value),
              },
            })}
        />
        <span class="muted">%</span>
      </div>
      <p class="section-desc">${t(this.hass, "config_panel.scenarios_position_hint")}</p>
      ${anyTilt
        ? html`<div class="slider-row">
            <span class="muted">${t(this.hass, "config_panel.scenarios_tilt")}</span>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              .value=${String(draft.action.tilt_position ?? 0)}
              .disabled=${draft.action.tilt_position == null}
              @input=${(e: Event) =>
                this._patch({
                  action: {
                    ...draft.action,
                    tilt_position: Number((e.target as HTMLInputElement).value),
                  },
                })}
            />
            <label class="checkbox-row" style="margin:0">
              <input
                type="checkbox"
                .checked=${draft.action.tilt_position != null}
                @change=${(e: Event) =>
                  this._patch({
                    action: {
                      ...draft.action,
                      tilt_position: (e.target as HTMLInputElement).checked ? 50 : null,
                    },
                  })}
              />
              ${draft.action.tilt_position != null
                ? `${draft.action.tilt_position}%`
                : t(this.hass, "config_panel.off")}
            </label>
          </div>`
        : nothing}
      <div class="row" style="margin-top:8px">
        <div>
          <label class="field-label">${t(this.hass, "config_panel.scenarios_mode")}</label>
          <select
            style="width:auto"
            .value=${draft.action.mode}
            @change=${(e: Event) =>
              this._patch({
                action: {
                  ...draft.action,
                  mode: (e.target as HTMLSelectElement).value as "normal" | "low",
                },
              })}
          >
            <option value="normal" ?selected=${draft.action.mode === "normal"}>
              ${t(this.hass, "config_panel.mode_normal")}
            </option>
            <option value="low" ?selected=${draft.action.mode === "low"}>
              ${t(this.hass, "config_panel.mode_low")}
            </option>
          </select>
        </div>
      </div>
      ${renderHelp(this.hass, "mode_low")}
      <div class="row" style="margin-top:8px">
        <div>
          <label class="field-label"
            >${t(this.hass, "config_panel.scenarios_safety_override")}</label
          >
          <select
            style="width:auto"
            @change=${(e: Event) => {
              const value = (e.target as HTMLSelectElement).value;
              this._patch({
                action: {
                  ...draft.action,
                  safety_override:
                    value === "" ? null : (value as SafetyOverride),
                },
              });
            }}
          >
            <option value="" ?selected=${draft.action.safety_override == null}>
              ${t(this.hass, "config_panel.safety_override_inherit")}
            </option>
            <option
              value="block"
              ?selected=${draft.action.safety_override === "block"}
            >
              ${t(this.hass, "config_panel.safety_override_block")}
            </option>
            <option
              value="clamp"
              ?selected=${draft.action.safety_override === "clamp"}
            >
              ${t(this.hass, "config_panel.safety_override_clamp")}
            </option>
            <option
              value="ignore"
              ?selected=${draft.action.safety_override === "ignore"}
            >
              ${t(this.hass, "config_panel.safety_override_ignore")}
            </option>
          </select>
        </div>
      </div>
      <p class="section-desc">
        ${t(this.hass, "config_panel.scenarios_safety_override_hint")}
      </p>
      <details class="expand">
        <summary>${t(this.hass, "config_panel.scenarios_advanced")}</summary>
        <div class="row" style="margin-top:8px">
          <div>
            <label class="field-label"
              >${t(this.hass, "config_panel.scenarios_min_delta")}</label
            >
            <input
              type="number"
              min="0"
              max="100"
              style="width:90px"
              placeholder=${String(this.snapshot.config.default_min_position_delta)}
              .value=${draft.action.min_position_delta == null
                ? ""
                : String(draft.action.min_position_delta)}
              @input=${(e: Event) => {
                const raw = (e.target as HTMLInputElement).value;
                this._patch({
                  action: {
                    ...draft.action,
                    min_position_delta: raw === "" ? null : Number(raw),
                  },
                });
              }}
            />
          </div>
        </div>
        <p class="section-desc">${t(this.hass, "config_panel.scenarios_min_delta_hint")}</p>
        ${renderHelp(this.hass, "min_delta")}
      </details>
    `;
  }

  private _patchAssignment(index: number, patch: Partial<Assignment>): void {
    if (!this._draft) return;
    const assignments = this._draft.assignments.map((a, i) =>
      i === index ? { ...a, ...patch } : a
    );
    this._patch({ assignments });
  }

  private _addCovers(covers: CoverRuntime[]): void {
    if (!this._draft || !covers.length) return;
    const assigned = new Set(this._draft.assignments.map((a) => a.cover_item_id));
    const additions: Assignment[] = covers
      .filter((c) => !assigned.has(c.id))
      .map((c) => ({
        cover_item_id: c.id,
        extra_conditions: [],
        action_override: null,
      }));
    if (!additions.length) return;
    this._patch({ assignments: [...this._draft.assignments, ...additions] });
  }

  private _renderAssignment(draft: Scenario, assignment: Assignment, index: number) {
    const cover = this.snapshot.covers.find((c) => c.id === assignment.cover_item_id);
    const ov = assignment.action_override ?? emptyOverride();
    const hasOverride =
      ov.position != null ||
      ov.tilt_position != null ||
      ov.mode != null ||
      ov.safety_override != null;
    return html`
      <div class="assignment-box">
        <div class="assignment-head">
          <span class="name">${this._coverName(assignment.cover_item_id)}</span>
          ${assignment.extra_conditions.length
            ? html`<span class="badge"
                >${t(this.hass, "config_panel.scenarios_extra_conditions_badge", {
                  n: assignment.extra_conditions.length,
                })}</span
              >`
            : nothing}
          ${hasOverride
            ? html`<span class="badge"
                >${t(this.hass, "config_panel.scenarios_override_badge")}</span
              >`
            : nothing}
          <button
            class="iconbtn danger"
            aria-label=${t(this.hass, "config_panel.scenarios_remove_cover")}
            title=${t(this.hass, "config_panel.scenarios_remove_cover")}
            @click=${() =>
              this._patch({
                assignments: draft.assignments.filter((_, i) => i !== index),
              })}
          >
            <ha-icon icon="mdi:close"></ha-icon>
          </button>
        </div>
        <details class="expand">
          <summary>${t(this.hass, "config_panel.scenarios_assignment_details")}</summary>
          <div class="section-title">
            ${t(this.hass, "config_panel.scenarios_extra_conditions")}
          </div>
          <p class="section-desc">
            ${t(this.hass, "config_panel.scenarios_extra_conditions_desc")}
          </p>
          ${renderConditionEditor({
            hass: this.hass,
            conditions: assignment.extra_conditions,
            onChange: (conds) =>
              this._patchAssignment(index, { extra_conditions: conds }),
            contactAvailable: Boolean(cover?.contact_entity_id),
            coverAzimuth: cover ? cover.azimuth : undefined,
          })}
          <div class="section-title">
            ${t(this.hass, "config_panel.scenarios_override")}
          </div>
          ${renderHelp(this.hass, "override")}
          <div class="row">
            <div>
              <label class="field-label"
                >${t(this.hass, "config_panel.scenarios_position")}</label
              >
              <input
                type="number"
                min="0"
                max="100"
                style="width:90px"
                placeholder=${String(draft.action.position)}
                .value=${ov.position == null ? "" : String(ov.position)}
                @input=${(e: Event) => {
                  const raw = (e.target as HTMLInputElement).value;
                  this._patchAssignment(index, {
                    action_override: {
                      ...ov,
                      position: raw === "" ? null : Number(raw),
                    },
                  });
                }}
              />
            </div>
            ${cover?.capabilities.supports_tilt
              ? html`<div>
                  <label class="field-label"
                    >${t(this.hass, "config_panel.scenarios_tilt")}</label
                  >
                  <input
                    type="number"
                    min="0"
                    max="100"
                    style="width:90px"
                    .value=${ov.tilt_position == null ? "" : String(ov.tilt_position)}
                    @input=${(e: Event) => {
                      const raw = (e.target as HTMLInputElement).value;
                      this._patchAssignment(index, {
                        action_override: {
                          ...ov,
                          tilt_position: raw === "" ? null : Number(raw),
                        },
                      });
                    }}
                  />
                </div>`
              : nothing}
            <div>
              <label class="field-label"
                >${t(this.hass, "config_panel.scenarios_mode")}</label
              >
              <select
                style="width:auto"
                @change=${(e: Event) => {
                  const value = (e.target as HTMLSelectElement).value;
                  this._patchAssignment(index, {
                    action_override: {
                      ...ov,
                      mode: value === "" ? null : (value as "normal" | "low"),
                    },
                  });
                }}
              >
                <option value="" ?selected=${ov.mode == null}>
                  ${t(this.hass, "config_panel.scenarios_inherit")}
                </option>
                <option value="normal" ?selected=${ov.mode === "normal"}>
                  ${t(this.hass, "config_panel.mode_normal")}
                </option>
                <option value="low" ?selected=${ov.mode === "low"}>
                  ${t(this.hass, "config_panel.mode_low")}
                </option>
              </select>
            </div>
            ${cover?.contact_entity_id
              ? html`<div>
                  <label class="field-label"
                    >${t(this.hass, "config_panel.scenarios_safety_override")}</label
                  >
                  <select
                    style="width:auto"
                    @change=${(e: Event) => {
                      const value = (e.target as HTMLSelectElement).value;
                      this._patchAssignment(index, {
                        action_override: {
                          ...ov,
                          safety_override:
                            value === "" ? null : (value as SafetyOverride),
                        },
                      });
                    }}
                  >
                    <option value="" ?selected=${ov.safety_override == null}>
                      ${t(this.hass, "config_panel.scenarios_inherit")}
                    </option>
                    <option
                      value="block"
                      ?selected=${ov.safety_override === "block"}
                    >
                      ${t(this.hass, "config_panel.safety_override_block")}
                    </option>
                    <option
                      value="clamp"
                      ?selected=${ov.safety_override === "clamp"}
                    >
                      ${t(this.hass, "config_panel.safety_override_clamp")}
                    </option>
                    <option
                      value="ignore"
                      ?selected=${ov.safety_override === "ignore"}
                    >
                      ${t(this.hass, "config_panel.safety_override_ignore")}
                    </option>
                  </select>
                </div>`
              : nothing}
          </div>
        </details>
      </div>
    `;
  }

  private _renderQuickAdd(addable: CoverRuntime[]) {
    if (!addable.length) return nothing;
    const byDir = new Map<number, CoverRuntime[]>();
    for (const c of addable) {
      if (c.azimuth == null) continue;
      const deg = nearestCompassDeg(c.azimuth);
      (byDir.get(deg) ?? byDir.set(deg, []).get(deg)!).push(c);
    }
    const byArea = new Map<string, CoverRuntime[]>();
    for (const c of addable) {
      if (!c.area_id) continue;
      (byArea.get(c.area_id) ?? byArea.set(c.area_id, []).get(c.area_id)!).push(c);
    }
    const areas = [...byArea.entries()]
      .map(([id, covers]) => ({ id, name: this._areaName(id), covers }))
      .sort((a, b) => a.name.localeCompare(b.name));
    const anyDir = [...byDir.values()].some((v) => v.length);
    return html`
      <div class="quick-add">
        <span class="quick-add-label"
          >${t(this.hass, "config_panel.scenarios_quick_add")}</span
        >
        <button type="button" class="chip" @click=${() => this._addCovers(addable)}>
          ${t(this.hass, "config_panel.scenarios_quick_add_all", { n: addable.length })}
        </button>
        ${anyDir
          ? html`<span class="quick-add-group">
              <span class="quick-add-sub"
                >${t(this.hass, "config_panel.scenarios_quick_add_direction")}</span
              >
              ${COMPASS.map(([label, deg]) => {
                const covers = byDir.get(deg) ?? [];
                return covers.length
                  ? html`<button
                      type="button"
                      class="chip"
                      @click=${() => this._addCovers(covers)}
                    >
                      <ha-icon icon="mdi:compass-outline"></ha-icon>${label} ·${covers.length}
                    </button>`
                  : nothing;
              })}
            </span>`
          : nothing}
        ${areas.length
          ? html`<span class="quick-add-group">
              <span class="quick-add-sub"
                >${t(this.hass, "config_panel.scenarios_quick_add_room")}</span
              >
              ${areas.map(
                (a) => html`<button
                  type="button"
                  class="chip"
                  @click=${() => this._addCovers(a.covers)}
                >
                  <ha-icon icon="mdi:map-marker-outline"></ha-icon>${a.name} ·${a.covers.length}
                </button>`
              )}
            </span>`
          : nothing}
      </div>
    `;
  }

  private _renderCoversSection(draft: Scenario) {
    const assignedIds = new Set(draft.assignments.map((a) => a.cover_item_id));
    const addable = this.snapshot.covers.filter((c) => !assignedIds.has(c.id));
    return html`
      <div class="section-title">${t(this.hass, "config_panel.scenarios_covers")}</div>
      ${renderHelp(this.hass, "assignments")}
      ${this._renderQuickAdd(addable)}
      ${draft.assignments.map((a, i) => this._renderAssignment(draft, a, i))}
      ${addable.length
        ? html`<select
            @change=${(e: Event) => {
              const sel = e.target as HTMLSelectElement;
              if (!sel.value) return;
              this._patch({
                assignments: [
                  ...draft.assignments,
                  {
                    cover_item_id: sel.value,
                    extra_conditions: [],
                    action_override: null,
                  },
                ],
              });
              sel.value = "";
            }}
          >
            <option value="">+ ${t(this.hass, "config_panel.scenarios_add_cover")}</option>
            ${addable.map((c) => html`<option value=${c.id}>${c.name}</option>`)}
          </select>`
        : nothing}
      ${!this.snapshot.covers.length
        ? html`<p class="muted">${t(this.hass, "config_panel.scenarios_no_covers_hint")}</p>`
        : nothing}
    `;
  }

  private _renderDialog() {
    const draft = this._draft;
    if (!draft) return nothing;
    return html`
      <div
        class="dialog-backdrop"
        @click=${(e: Event) => {
          if (e.target === e.currentTarget) {
            this._draft = null;
            this.requestUpdate();
          }
        }}
      >
        <div class="dialog sticky">
          <div class="dialog-head">
            <h3>
              ${draft.id
                ? t(this.hass, "config_panel.scenarios_dialog_edit", { name: draft.name })
                : t(this.hass, "config_panel.scenarios_dialog_new")}
            </h3>
            <label class="checkbox-row" style="margin:0">
              <input
                type="checkbox"
                .checked=${draft.enabled}
                @change=${(e: Event) =>
                  this._patch({ enabled: (e.target as HTMLInputElement).checked })}
              />
              ${t(this.hass, "config_panel.scenarios_enabled")}
            </label>
          </div>
          <div class="dialog-scroll">
            ${this._error ? html`<p class="error">${this._error}</p>` : nothing}
            ${this._warnings.map(
              (w) => html`<p class="warning">
                <ha-icon icon="mdi:alert-outline" style="--mdc-icon-size:16px"></ha-icon>
                ${w}
              </p>`
            )}

            <div class="row">
              <div class="grow">
                <label class="field-label"
                  >${t(this.hass, "config_panel.scenarios_field_name")}</label
                >
                <input
                  type="text"
                  .value=${draft.name}
                  @input=${(e: Event) =>
                    this._patch({ name: (e.target as HTMLInputElement).value })}
                />
              </div>
            </div>

            ${this._renderWhenSection(draft)}

            <div class="section-title">
              ${t(this.hass, "config_panel.scenarios_only_if")}
            </div>
            <p class="section-desc">
              ${t(this.hass, "config_panel.scenarios_only_if_desc")}
            </p>
            ${renderHelp(this.hass, "conditions_scope")}
            ${renderConditionEditor({
              hass: this.hass,
              conditions: draft.conditions,
              onChange: (conds) => this._patch({ conditions: conds }),
              contactAvailable: draft.assignments.some((a) =>
                Boolean(
                  this.snapshot.covers.find((c) => c.id === a.cover_item_id)
                    ?.contact_entity_id
                )
              ),
            })}

            ${this._renderThenSection(draft)} ${this._renderCoversSection(draft)}
          </div>
          <div class="dialog-foot">
            ${draft.id
              ? html`<label
                    class="checkbox-row"
                    style="margin:0"
                    title=${t(this.hass, "config_panel.scenarios_run_ignore_help")}
                  >
                    <input
                      type="checkbox"
                      .checked=${this._runIgnoreConditions}
                      @change=${(e: Event) => {
                        this._runIgnoreConditions = (
                          e.target as HTMLInputElement
                        ).checked;
                      }}
                    />
                    ${t(this.hass, "config_panel.scenarios_run_ignore_short")}
                  </label>
                  <button
                    class="btn-outline"
                    .disabled=${this._busy}
                    @click=${() => this._runNow(draft.id)}
                  >
                    ${t(this.hass, "config_panel.scenarios_run_now")}
                  </button>`
              : nothing}
            <span style="flex:1"></span>
            <button
              class="btn-outline"
              @click=${() => {
                this._draft = null;
                this.requestUpdate();
              }}
            >
              ${t(this.hass, "config_panel.cancel")}
            </button>
            <button class="btn" .disabled=${this._busy} @click=${this._save}>
              ${this._busy
                ? t(this.hass, "config_panel.saving")
                : t(this.hass, "config_panel.save")}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  protected render() {
    const snap = this.snapshot;
    if (!snap) return nothing;
    return html`
      <ha-card>
        <div class="card-header">
          <ha-icon icon="mdi:script-text-outline"></ha-icon>
          ${t(this.hass, "config_panel.scenarios_title")}
          <span class="muted" style="font-weight:400">${snap.scenarios.length}</span>
          <span class="header-actions">
            <button class="btn" @click=${this._openAdd}>
              ${t(this.hass, "config_panel.scenarios_add")}
            </button>
          </span>
        </div>
        <div class="card-content">
          <p class="intro">${t(this.hass, "config_panel.scenarios_order_desc")}</p>
          ${renderHelp(this.hass, "priority")}
          ${this._error && !this._draft
            ? html`<p class="error">${this._error}</p>`
            : nothing}
          ${snap.scenarios.length
            ? snap.scenarios.map((s, i) =>
                this._renderRow(s, i, snap.scenarios.length)
              )
            : html`<div class="empty-state">
                <ha-icon icon="mdi:script-text-outline"></ha-icon>
                <p>${t(this.hass, "config_panel.scenarios_empty")}</p>
              </div>`}
        </div>
      </ha-card>
      ${this._renderDialog()}
    `;
  }
}

defineCustomElementOnce("ac-view-scenarios", ViewScenarios);
