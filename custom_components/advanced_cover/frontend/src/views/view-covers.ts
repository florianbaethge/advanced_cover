import { LitElement, css, html, nothing } from "lit";
import { compassStyles, formatAzimuth, renderCompass } from "../compass";
import { deleteCover, probeCover, saveCover, testCover } from "../data/api";
import { renderAreaSelector, renderEntitySelector } from "../entity-input";
import { defineCustomElementOnce, formatApiError, formatTime } from "../helpers";
import { formatReason } from "../reasons";
import { renderHelp } from "../help";
import { t } from "../i18n";
import { sharedStyles } from "../styles";
import type {
  CoverCapabilities,
  CoverItem,
  CoverRuntime,
  HomeAssistant,
  PanelSnapshot,
} from "../types";

const KINDS = ["shutter", "blind", "awning", "curtain", "shade", "other"];
const KIND_ICONS: Record<string, string> = {
  shutter: "mdi:window-shutter",
  blind: "mdi:blinds-horizontal",
  awning: "mdi:awning-outline",
  curtain: "mdi:curtains",
  shade: "mdi:roller-shade",
  other: "mdi:window-closed-variant",
};
const CONTACT_ICONS: Record<string, string> = {
  closed: "mdi:window-closed",
  tilted: "mdi:window-open",
  open: "mdi:window-open-variant",
  unknown: "mdi:help-circle-outline",
};

function emptyDraft(): CoverItem {
  return {
    id: "",
    name: "",
    cover_entity_id: "",
    kind: "shutter",
    area_id: null,
    azimuth: null,
    low_mode_entity_id: null,
    low_mode_script_id: null,
    manual_low_mode: false,
    contact_entity_id: null,
    contact_state_map: {},
    safety: { ventilation_position: 20, mode: "block", block_when_tilted: false },
    enabled: true,
  };
}

export class ViewCovers extends LitElement {
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
  private _draft: CoverItem | null = null;
  private _draftCaps: CoverCapabilities | null = null;
  private _testPosition: Record<string, number> = {};
  private _expanded = new Set<string>();
  private _search = "";

  static styles = [
    sharedStyles,
    compassStyles,
    css`
      .toolbar {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 12px;
      }
      .search {
        display: flex;
        align-items: center;
        gap: 6px;
        border: 1px solid var(--divider-color);
        border-radius: 8px;
        padding: 4px 10px;
        flex: 1;
        max-width: 320px;
      }
      .search ha-icon {
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
      }
      .search input {
        border: none;
        background: none;
        padding: 4px 0;
        width: 100%;
      }
      .search input:focus-visible {
        outline: none;
      }
      /* Room group header with collective control. */
      .group-head {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 18px 0 8px;
      }
      .group-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 0.85rem;
      }
      .group-title ha-icon {
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
      }
      .group-title .n {
        color: var(--secondary-text-color);
        font-weight: 400;
      }
      .group-next {
        font-size: 0.78rem;
        color: var(--secondary-text-color);
      }
      .group-head .icon-group {
        margin-left: auto;
      }
      /* Compact row: full-width clickable toggle + trailing controls.
         The control buttons and chevron are siblings of the toggle — never
         nested inside it, since a native <button> nested in a <button> is
         invalid HTML and the parser expels it onto its own line. */
      .crow-head {
        display: flex;
        align-items: center;
        padding-right: 8px;
      }
      .crow {
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
        min-width: 0;
        box-sizing: border-box;
        padding: 8px 12px;
        cursor: pointer;
        background: none;
        border: none;
        text-align: left;
        font: inherit;
        color: inherit;
      }
      .crow > ha-switch {
        flex-shrink: 0;
      }
      .kind-icon {
        --mdc-icon-size: 21px;
        color: var(--secondary-text-color);
        flex-shrink: 0;
      }
      .crow-main {
        min-width: 0;
        flex: 1 1 180px;
        display: flex;
        flex-direction: column;
        gap: 1px;
      }
      .crow-name {
        font-weight: 500;
        font-size: 0.95rem;
      }
      .crow-pos {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 150px;
        flex-shrink: 0;
      }
      .crow-pos .position-bar {
        flex: 1;
      }
      .crow-pos .pos-val {
        font-size: 0.82rem;
        color: var(--secondary-text-color);
        font-variant-numeric: tabular-nums;
        width: 34px;
        text-align: right;
      }
      .crow-next {
        flex: 1 1 0;
        min-width: 0;
        font-size: 0.8rem;
        color: var(--secondary-text-color);
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .crow-next ha-icon {
        --mdc-icon-size: 16px;
        flex-shrink: 0;
      }
      .crow-chevron-btn {
        flex-shrink: 0;
        width: 34px;
        height: 34px;
        border-radius: 8px;
      }
      .crow-chevron {
        --mdc-icon-size: 22px;
        color: var(--secondary-text-color);
        flex-shrink: 0;
      }
      .link-off {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        color: var(--error-color, #d93025);
        font-size: 0.8rem;
        flex-shrink: 0;
      }
      .link-off ha-icon {
        --mdc-icon-size: 18px;
      }
      /* Expanded detail. */
      .crow-detail {
        padding: 4px 14px 14px 26px;
        border-top: 1px solid var(--divider-color);
      }
      .drive-row {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        margin: 10px 0;
      }
      .drive-row .slider {
        flex: 1;
        min-width: 160px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .drive-row .slider input[type="range"] {
        flex: 1;
      }
      .safety-note {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        font-size: 0.8rem;
        color: var(--warning-color, #f0b23a);
        margin: 4px 0;
      }
      .safety-note ha-icon {
        --mdc-icon-size: 16px;
        margin-top: 1px;
        flex-shrink: 0;
      }
      .detail-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 12px;
        flex-wrap: wrap;
      }
      .manual-low {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-left: auto;
        font-size: 0.85rem;
        cursor: pointer;
      }
      .manual-low ha-icon {
        --mdc-icon-size: 18px;
        color: var(--secondary-text-color);
      }
      .manual-low.dialog-row {
        margin: 10px 0 0;
        align-items: flex-start;
      }
      .manual-low.dialog-row ha-icon {
        margin-top: 2px;
      }
      .low-tag {
        --mdc-icon-size: 16px;
        color: var(--primary-color);
        align-self: center;
        margin: 0 2px;
      }
      .today-actions {
        margin-top: 12px;
      }
      .today-actions .ta-title {
        font-size: 0.74rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--secondary-text-color);
        font-weight: 600;
        margin-bottom: 6px;
      }
      .ta-row {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.82rem;
        padding: 3px 0;
      }
      .ta-row .ta-time {
        font-variant-numeric: tabular-nums;
        flex-shrink: 0;
      }
      .ta-row .ta-name {
        flex: 1;
        min-width: 0;
      }
      /* Dialog sticky header/footer. */
      .dialog.sticky {
        padding: 0;
        display: flex;
        flex-direction: column;
        max-height: 92vh;
      }
      .dialog-head {
        position: sticky;
        top: 0;
        background: var(--card-background-color);
        padding: 20px 24px 12px;
        border-bottom: 1px solid var(--divider-color);
        z-index: 1;
      }
      .dialog-head h3 {
        margin: 0;
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
        justify-content: flex-end;
        gap: 8px;
      }
      .map-row {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 6px;
      }
      .map-row input,
      .map-row select {
        width: auto;
      }

      @container acview (max-width: 900px) {
        .crow-next {
          display: none;
        }
      }
      @container acview (max-width: 620px) {
        .crow-head .icon-group {
          display: none;
        }
        /* Two-line row: switch/icon/name + meta on top, position bar below.
           Frees the full width for the name (no more hard truncation) and
           drops the position + chevron onto their own line. */
        .crow {
          display: grid;
          grid-template-columns: auto auto 1fr;
          grid-template-areas:
            "sw ic main"
            ".  .  pos";
          column-gap: 10px;
          row-gap: 6px;
          align-items: center;
        }
        .crow > ha-switch {
          grid-area: sw;
        }
        .crow .kind-icon {
          grid-area: ic;
        }
        .crow-main {
          grid-area: main;
          flex-direction: row;
          flex-wrap: wrap;
          align-items: baseline;
          column-gap: 10px;
          row-gap: 2px;
        }
        /* Now that the row is full-width, let the name breathe instead of
           truncating; meta chips wrap under it only when it is truly long. */
        .crow .crow-name {
          white-space: normal;
          overflow: visible;
          overflow-wrap: anywhere;
        }
        .crow-pos {
          grid-area: pos;
          width: auto;
        }
        /* Pull the chevron down so it sits on the position line, not centered
           between the two lines. */
        .crow-chevron-btn {
          align-self: flex-end;
          margin-bottom: 2px;
        }
        .crow-detail {
          padding-left: 14px;
        }
        .drive-row .slider {
          min-width: 120px;
        }
      }
    `,
  ];

  private _areaName(areaId: string | null): string {
    if (!areaId) return t(this.hass, "config_panel.covers_no_area");
    return this.hass.areas?.[areaId]?.name ?? areaId;
  }

  private _filteredCovers(): CoverRuntime[] {
    const q = this._search.trim().toLowerCase();
    if (!q) return this.snapshot.covers;
    return this.snapshot.covers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.cover_entity_id.toLowerCase().includes(q) ||
        this._areaName(c.area_id).toLowerCase().includes(q)
    );
  }

  private _groupByArea(
    covers: CoverRuntime[]
  ): Array<{ areaId: string | null; label: string; covers: CoverRuntime[] }> {
    const groups = new Map<string | null, CoverRuntime[]>();
    for (const cover of covers) {
      const key = cover.area_id ?? null;
      (groups.get(key) ?? groups.set(key, []).get(key)!).push(cover);
    }
    if (groups.size === 1 && groups.has(null)) {
      return [{ areaId: null, label: "", covers }];
    }
    const withArea = [...groups.entries()]
      .filter(([areaId]) => areaId !== null)
      .map(([areaId, items]) => ({
        areaId,
        label: this._areaName(areaId),
        covers: items,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
    const noArea = groups.get(null);
    if (noArea) {
      withArea.push({
        areaId: null,
        label: this._areaName(null),
        covers: noArea,
      });
    }
    return withArea;
  }

  // ------------------------------------------------------------ dialog logic

  private _openAdd(): void {
    this._draft = emptyDraft();
    this._draftCaps = null;
    this._error = undefined;
    this.requestUpdate();
  }

  private _openEdit(cover: CoverRuntime): void {
    const {
      capabilities,
      current_position,
      contact_state,
      safety_blocked,
      next_action,
      missing_entities,
      ...item
    } = cover;
    void current_position;
    void contact_state;
    void safety_blocked;
    void next_action;
    void missing_entities;
    this._draft = JSON.parse(JSON.stringify(item)) as CoverItem;
    this._draftCaps = capabilities;
    this._error = undefined;
    this.requestUpdate();
  }

  private _patchDraft(patch: Partial<CoverItem>): void {
    if (!this._draft) return;
    this._draft = { ...this._draft, ...patch };
    this.requestUpdate();
  }

  private async _probe(): Promise<void> {
    if (!this._draft?.cover_entity_id) return;
    try {
      const res = await probeCover(
        this.hass,
        this._draft.cover_entity_id,
        this._draft.contact_entity_id ?? undefined
      );
      this._draftCaps = res.capabilities;
      const patch: Partial<CoverItem> = {};
      if (!this._draft.id) patch.kind = res.suggested_kind;
      if (
        res.suggested_contact_map &&
        Object.keys(this._draft.contact_state_map).length === 0
      ) {
        patch.contact_state_map = res.suggested_contact_map;
      }
      this._patchDraft(patch);
    } catch (e) {
      this._error = formatApiError(e, this.hass);
      this.requestUpdate();
    }
  }

  private async _save(): Promise<void> {
    if (!this._draft) return;
    if (!this._draft.name.trim() || !this._draft.cover_entity_id.trim()) {
      this._error = t(this.hass, "config_panel.covers_err_name_entity_required");
      this.requestUpdate();
      return;
    }
    this._busy = true;
    this.requestUpdate();
    try {
      await saveCover(this.hass, this.entryId, this._draft);
      this._draft = null;
      this._error = undefined;
    } catch (e) {
      this._error = formatApiError(e, this.hass);
    } finally {
      this._busy = false;
      this.requestUpdate();
    }
  }

  private async _delete(cover: CoverRuntime): Promise<void> {
    if (
      !window.confirm(
        t(this.hass, "config_panel.covers_delete_confirm", { name: cover.name })
      )
    ) {
      return;
    }
    try {
      await deleteCover(this.hass, this.entryId, cover.id);
    } catch (e) {
      this._error = formatApiError(e, this.hass);
      this.requestUpdate();
    }
  }

  private async _toggleEnabled(cover: CoverRuntime): Promise<void> {
    try {
      await saveCover(this.hass, this.entryId, { ...cover, enabled: !cover.enabled });
    } catch (e) {
      this._error = formatApiError(e, this.hass);
      this.requestUpdate();
    }
  }

  private async _toggleManualLow(cover: CoverRuntime): Promise<void> {
    try {
      await saveCover(this.hass, this.entryId, {
        ...cover,
        manual_low_mode: !cover.manual_low_mode,
      });
    } catch (e) {
      this._error = formatApiError(e, this.hass);
      this.requestUpdate();
    }
  }

  private async _test(
    coverId: string,
    command: "open" | "close" | "stop" | "position",
    position?: number
  ): Promise<void> {
    try {
      await testCover(this.hass, this.entryId, coverId, command, position);
    } catch (e) {
      this._error = formatApiError(e, this.hass);
      this.requestUpdate();
    }
  }

  private async _groupTest(
    covers: CoverRuntime[],
    command: "open" | "close" | "stop"
  ): Promise<void> {
    for (const c of covers) {
      if (!c.missing_entities.length) await this._test(c.id, command);
    }
  }

  private _toggleExpand(id: string): void {
    if (this._expanded.has(id)) this._expanded.delete(id);
    else this._expanded.add(id);
    this.requestUpdate();
  }

  // -------------------------------------------------------------- rendering

  private _renderControlGroup(cover: CoverRuntime) {
    const low = cover.manual_low_mode &&
      Boolean(cover.low_mode_entity_id || cover.low_mode_script_id);
    return html`
      <div class="icon-group" @click=${(e: Event) => e.stopPropagation()}>
        ${low
          ? html`<ha-icon
              class="low-tag"
              icon="mdi:tortoise"
              title=${t(this.hass, "config_panel.covers_manual_low_active")}
            ></ha-icon>`
          : nothing}
        <button
          type="button"
          title=${t(this.hass, "config_panel.covers_test_open")}
          aria-label=${t(this.hass, "config_panel.covers_test_open")}
          @click=${() => this._test(cover.id, "open")}
        >
          <ha-icon icon="mdi:arrow-up"></ha-icon>
        </button>
        <button
          type="button"
          title=${t(this.hass, "config_panel.covers_test_stop")}
          aria-label=${t(this.hass, "config_panel.covers_test_stop")}
          @click=${() => this._test(cover.id, "stop")}
        >
          <ha-icon icon="mdi:stop"></ha-icon>
        </button>
        <button
          type="button"
          title=${t(this.hass, "config_panel.covers_test_close")}
          aria-label=${t(this.hass, "config_panel.covers_test_close")}
          @click=${() => this._test(cover.id, "close")}
        >
          <ha-icon icon="mdi:arrow-down"></ha-icon>
        </button>
      </div>
    `;
  }

  private _renderRow(cover: CoverRuntime) {
    const expanded = this._expanded.has(cover.id);
    const missing = cover.missing_entities.length > 0;
    const na = cover.next_action;
    const accentClass = missing ? "danger" : cover.enabled ? "" : "inactive";
    return html`
      <div class="compact-row ${accentClass}">
        <div class="crow-head">
        <button
          type="button"
          class="crow"
          aria-expanded=${expanded ? "true" : "false"}
          @click=${() => this._toggleExpand(cover.id)}
        >
          <ha-switch
            .checked=${cover.enabled}
            title=${t(this.hass, "config_panel.covers_toggle_automation")}
            @click=${(e: Event) => {
              e.stopPropagation();
              this._toggleEnabled(cover);
            }}
          ></ha-switch>
          <ha-icon
            class="kind-icon"
            .icon=${KIND_ICONS[cover.kind] ?? KIND_ICONS.other}
          ></ha-icon>
          <div class="crow-main">
            <span class="crow-name ellipsis">${cover.name}</span>
            <span class="meta-line">
              ${cover.azimuth != null
                ? html`<span class="meta"
                    ><ha-icon icon="mdi:compass-outline"></ha-icon
                    >${formatAzimuth(cover.azimuth)}</span
                  >`
                : nothing}
              ${cover.contact_state
                ? html`<span class="meta"
                    ><ha-icon
                      .icon=${CONTACT_ICONS[cover.contact_state] ??
                      CONTACT_ICONS.unknown}
                    ></ha-icon
                    >${t(this.hass, `config_panel.contact_${cover.contact_state}`)}</span
                  >`
                : nothing}
              ${cover.safety_blocked
                ? html`<span class="meta" style="color:var(--error-color)"
                    ><ha-icon icon="mdi:shield-alert-outline"></ha-icon>Safety</span
                  >`
                : nothing}
              ${cover.kind === "awning"
                ? html`<span class="meta"
                    >${t(this.hass, "config_panel.covers_awning_extended")}</span
                  >`
                : nothing}
            </span>
          </div>
          ${cover.current_position != null
            ? html`<div class="crow-pos">
                <div class="position-bar">
                  <div
                    class="position-bar-fill"
                    style="width:${cover.current_position}%"
                  ></div>
                </div>
                <span class="pos-val">${cover.current_position}%</span>
              </div>`
            : html`<div class="crow-pos"></div>`}
          <div class="crow-next">
            ${na
              ? html`<ha-icon
                    icon=${na.armed ? "mdi:timer-sand" : "mdi:arrow-right-thin"}
                  ></ha-icon>
                  <span class="ellipsis"
                    >${formatTime(na.when)} · ${na.position}% ${na.scenario_name}</span
                  >`
              : html`<span class="ellipsis"
                  >${t(this.hass, "config_panel.covers_no_action_today")}</span
                >`}
          </div>
        </button>
          ${missing
            ? html`<span class="link-off"
                ><ha-icon icon="mdi:link-variant-off"></ha-icon
                >${t(this.hass, "config_panel.covers_link_missing")}</span
              >`
            : this._renderControlGroup(cover)}
          <button
            type="button"
            class="iconbtn crow-chevron-btn"
            aria-expanded=${expanded ? "true" : "false"}
            aria-label=${t(this.hass, "config_panel.covers_expand")}
            @click=${() => this._toggleExpand(cover.id)}
          >
            <ha-icon
              class="crow-chevron"
              icon=${expanded ? "mdi:chevron-up" : "mdi:chevron-down"}
            ></ha-icon>
          </button>
        </div>
        ${expanded ? this._renderDetail(cover) : nothing}
      </div>
    `;
  }

  private _renderDetail(cover: CoverRuntime) {
    const planRuns = this.snapshot.plan.flatMap((occ) =>
      occ.assignments
        .filter((r) => r.cover_item_id === cover.id)
        .map((r) => ({ occ, r }))
    );
    const testPos = this._testPosition[cover.id] ?? cover.current_position ?? 50;
    return html`
      <div class="crow-detail">
        ${cover.missing_entities.length
          ? html`<p class="warning">
              ${t(this.hass, "config_panel.covers_missing_entities", {
                entities: cover.missing_entities.join(", "),
              })}
            </p>`
          : nothing}
        ${cover.capabilities.supports_position && !cover.missing_entities.length
          ? html`<div class="drive-row">
              <span class="muted">${t(this.hass, "config_panel.covers_test_drive")}</span>
              <div class="slider">
                <input
                  type="range"
                  min="0"
                  max="100"
                  .value=${String(testPos)}
                  @input=${(e: Event) => {
                    this._testPosition = {
                      ...this._testPosition,
                      [cover.id]: Number((e.target as HTMLInputElement).value),
                    };
                    this.requestUpdate();
                  }}
                />
                <span class="pos-val">${testPos}%</span>
              </div>
              <button
                type="button"
                class="iconbtn"
                title=${t(this.hass, "config_panel.covers_go_position")}
                aria-label=${t(this.hass, "config_panel.covers_go_position")}
                @click=${() => this._test(cover.id, "position", testPos)}
              >
                <ha-icon icon="mdi:target"></ha-icon>
              </button>
            </div>`
          : nothing}
        ${cover.safety_blocked
          ? html`<div class="safety-note">
              <ha-icon icon="mdi:shield-alert-outline"></ha-icon>
              <span
                >${t(this.hass, "config_panel.cond_sum_safety", {
                  ventilation: cover.safety.ventilation_position,
                })}</span
              >
            </div>`
          : nothing}
        <div class="today-actions">
          <div class="ta-title">
            ${t(this.hass, "config_panel.covers_today_actions", {
              n: planRuns.length,
            })}
          </div>
          ${planRuns.length
            ? planRuns.map(
                ({ occ, r }) => html`<div class="ta-row">
                  <span class="ta-time">${formatTime(occ.planned_at)}</span>
                  <span class="ta-name ellipsis">${occ.scenario_name}</span>
                  <span class="muted">${r.target_position}%</span>
                  <span
                    class="badge badge-${occ.fired
                      ? r.status === "done"
                        ? (r.result ?? "skipped")
                        : r.status
                      : r.preflight?.verdict === "would_skip"
                        ? "armed"
                        : "planned"}"
                    title=${(occ.fired && formatReason(this.hass, r.reason)) || ""}
                    >${t(
                      this.hass,
                      `config_panel.status_${
                        occ.fired
                          ? r.status === "done"
                            ? (r.result ?? "skipped")
                            : r.status
                          : "planned"
                      }`
                    )}</span
                  >
                </div>`
              )
            : html`<p class="muted">${t(this.hass, "config_panel.covers_today_none")}</p>`}
        </div>
        <div class="detail-actions">
          <button class="btn-outline" @click=${() => this._openEdit(cover)}>
            ${t(this.hass, "config_panel.covers_edit")}
          </button>
          <button class="btn-danger" @click=${() => this._delete(cover)}>
            ${t(this.hass, "config_panel.covers_delete")}
          </button>
          ${cover.low_mode_entity_id || cover.low_mode_script_id
            ? html`<label class="manual-low">
                <ha-switch
                  .checked=${cover.manual_low_mode}
                  @click=${(e: Event) => {
                    e.stopPropagation();
                    this._toggleManualLow(cover);
                  }}
                ></ha-switch>
                <ha-icon icon="mdi:tortoise"></ha-icon>
                ${t(this.hass, "config_panel.covers_manual_low")}
              </label>`
            : nothing}
        </div>
      </div>
    `;
  }

  private _renderGroup(group: {
    areaId: string | null;
    label: string;
    covers: CoverRuntime[];
  }) {
    const next = group.covers
      .map((c) => c.next_action)
      .filter((n): n is NonNullable<typeof n> => n != null)
      .sort((a, b) => a.when.localeCompare(b.when))[0];
    return html`
      ${group.label
        ? html`<div class="group-head">
            <span class="group-title">
              <ha-icon icon="mdi:map-marker-outline"></ha-icon>
              ${group.label}
              <span class="n">${group.covers.length}</span>
            </span>
            ${next
              ? html`<span class="group-next"
                  >${t(this.hass, "config_panel.covers_group_next", {
                    time: formatTime(next.when),
                    pos: next.position ?? 0,
                  })}</span
                >`
              : nothing}
            <div
              class="icon-group"
              title=${t(this.hass, "config_panel.covers_group_control")}
            >
              <button
                type="button"
                aria-label=${t(this.hass, "config_panel.covers_test_open")}
                @click=${() => this._groupTest(group.covers, "open")}
              >
                <ha-icon icon="mdi:arrow-up"></ha-icon>
              </button>
              <button
                type="button"
                aria-label=${t(this.hass, "config_panel.covers_test_stop")}
                @click=${() => this._groupTest(group.covers, "stop")}
              >
                <ha-icon icon="mdi:stop"></ha-icon>
              </button>
              <button
                type="button"
                aria-label=${t(this.hass, "config_panel.covers_test_close")}
                @click=${() => this._groupTest(group.covers, "close")}
              >
                <ha-icon icon="mdi:arrow-down"></ha-icon>
              </button>
            </div>
          </div>`
        : nothing}
      ${group.covers.map((c) => this._renderRow(c))}
    `;
  }

  private _renderContactMapEditor(draft: CoverItem) {
    const entries = Object.entries(draft.contact_state_map);
    const meanings = ["closed", "tilted", "open"];
    return html`
      <div class="section-title">
        ${t(this.hass, "config_panel.covers_contact_map_title")}
      </div>
      <p class="section-desc">${t(this.hass, "config_panel.covers_contact_map_desc")}</p>
      ${renderHelp(this.hass, "contact_map")}
      ${entries.map(
        ([raw, meaning]) => html`
          <div class="map-row">
            <input
              type="text"
              style="width:140px"
              .value=${raw}
              @change=${(e: Event) => {
                const newRaw = (e.target as HTMLInputElement).value.trim();
                const map = { ...draft.contact_state_map };
                delete map[raw];
                if (newRaw) map[newRaw] = meaning;
                this._patchDraft({ contact_state_map: map });
              }}
            />
            <ha-icon icon="mdi:arrow-right-thin"></ha-icon>
            <select
              .value=${meaning}
              @change=${(e: Event) =>
                this._patchDraft({
                  contact_state_map: {
                    ...draft.contact_state_map,
                    [raw]: (e.target as HTMLSelectElement).value,
                  },
                })}
            >
              ${meanings.map(
                (m) => html`<option value=${m} ?selected=${m === meaning}>
                  ${t(this.hass, `config_panel.contact_${m}`)}
                </option>`
              )}
            </select>
            <button
              class="iconbtn danger"
              aria-label=${t(this.hass, "config_panel.cond_remove")}
              @click=${() => {
                const map = { ...draft.contact_state_map };
                delete map[raw];
                this._patchDraft({ contact_state_map: map });
              }}
            >
              <ha-icon icon="mdi:close"></ha-icon>
            </button>
          </div>
        `
      )}
      <button
        class="btn-icon"
        @click=${() =>
          this._patchDraft({
            contact_state_map: { ...draft.contact_state_map, "": "closed" },
          })}
      >
        ${t(this.hass, "config_panel.covers_contact_map_add")}
      </button>
    `;
  }

  private _renderDialog() {
    const draft = this._draft;
    if (!draft) return nothing;
    const caps = this._draftCaps;
    const isAwning = draft.kind === "awning";
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
                ? t(this.hass, "config_panel.covers_dialog_edit", { name: draft.name })
                : t(this.hass, "config_panel.covers_dialog_new")}
            </h3>
          </div>
          <div class="dialog-scroll">
            ${this._error ? html`<p class="error">${this._error}</p>` : nothing}

            <div class="row">
              <div class="grow">
                <label class="field-label"
                  >${t(this.hass, "config_panel.covers_field_name")}</label
                >
                <input
                  type="text"
                  .value=${draft.name}
                  @input=${(e: Event) =>
                    this._patchDraft({ name: (e.target as HTMLInputElement).value })}
                />
              </div>
              <div class="grow">
                <label class="field-label"
                  >${t(this.hass, "config_panel.covers_field_kind")}</label
                >
                <select
                  .value=${draft.kind}
                  @change=${(e: Event) =>
                    this._patchDraft({ kind: (e.target as HTMLSelectElement).value })}
                >
                  ${KINDS.map(
                    (k) => html`<option value=${k} ?selected=${k === draft.kind}>
                      ${t(this.hass, `config_panel.kind_${k}`)}
                    </option>`
                  )}
                </select>
              </div>
            </div>

            <div class="row">
              <div class="grow">
                <label class="field-label"
                  >${t(this.hass, "config_panel.covers_field_entity")}</label
                >
                ${renderEntitySelector(
                  this.hass,
                  draft.cover_entity_id,
                  (value) => {
                    this._patchDraft({ cover_entity_id: value });
                    void this._probe();
                  },
                  ["cover"]
                )}
              </div>
            </div>
            ${caps
              ? html`<div class="chips caps-chips" style="margin-bottom:12px">
                  <span class="chip readonly">
                    <ha-icon
                      icon=${caps.supports_position
                        ? "mdi:check-circle"
                        : "mdi:minus-circle-outline"}
                    ></ha-icon>
                    ${t(this.hass, "config_panel.covers_cap_position")}
                  </span>
                  <span class="chip readonly">
                    <ha-icon
                      icon=${caps.supports_tilt
                        ? "mdi:check-circle"
                        : "mdi:minus-circle-outline"}
                    ></ha-icon>
                    ${t(this.hass, "config_panel.covers_cap_tilt")}
                  </span>
                  ${!caps.available
                    ? html`<span class="chip readonly">
                        <ha-icon icon="mdi:alert-outline"></ha-icon>
                        ${t(this.hass, "config_panel.covers_cap_unavailable")}
                      </span>`
                    : nothing}
                </div>`
              : nothing}

            <div class="row">
              <div class="grow">
                <label class="field-label"
                  >${t(this.hass, "config_panel.covers_field_area")}</label
                >
                ${renderAreaSelector(this.hass, draft.area_id ?? "", (value) =>
                  this._patchDraft({ area_id: value || null })
                )}
              </div>
              <div class="grow">
                <label class="field-label"
                  >${t(this.hass, "config_panel.covers_field_azimuth")}</label
                >
                <input
                  type="number"
                  min="0"
                  max="359"
                  .value=${draft.azimuth == null ? "" : String(draft.azimuth)}
                  @input=${(e: Event) => {
                    const raw = (e.target as HTMLInputElement).value;
                    this._patchDraft({ azimuth: raw === "" ? null : Number(raw) });
                  }}
                />
              </div>
            </div>
            ${renderCompass(draft.azimuth, (deg) => this._patchDraft({ azimuth: deg }))}
            <p class="section-desc">${t(this.hass, "config_panel.covers_azimuth_hint")}</p>

            <div class="section-title">
              ${t(this.hass, "config_panel.covers_low_mode_title")}
            </div>
            <p class="section-desc">${t(this.hass, "config_panel.covers_low_mode_desc")}</p>
            ${renderHelp(this.hass, "low_mode")}
            <div class="row">
              <div class="grow">
                <label class="field-label"
                  >${t(this.hass, "config_panel.covers_field_low_entity")}</label
                >
                ${renderEntitySelector(
                  this.hass,
                  draft.low_mode_entity_id ?? "",
                  (value) => this._patchDraft({ low_mode_entity_id: value || null }),
                  ["cover"]
                )}
              </div>
              <div class="grow">
                <label class="field-label"
                  >${t(this.hass, "config_panel.covers_field_low_script")}</label
                >
                ${renderEntitySelector(
                  this.hass,
                  draft.low_mode_script_id ?? "",
                  (value) => this._patchDraft({ low_mode_script_id: value || null }),
                  ["script"]
                )}
              </div>
            </div>
            ${draft.low_mode_entity_id || draft.low_mode_script_id
              ? html`<label class="manual-low dialog-row">
                  <ha-switch
                    .checked=${draft.manual_low_mode}
                    @click=${() =>
                      this._patchDraft({
                        manual_low_mode: !this._draft?.manual_low_mode,
                      })}
                  ></ha-switch>
                  <ha-icon icon="mdi:tortoise"></ha-icon>
                  <span>
                    ${t(this.hass, "config_panel.covers_manual_low")}
                    <span class="section-desc" style="display:block;margin:0">
                      ${t(this.hass, "config_panel.covers_manual_low_desc")}
                    </span>
                  </span>
                </label>`
              : nothing}

            ${!isAwning
              ? html`
                  <div class="section-title">
                    ${t(this.hass, "config_panel.covers_contact_title")}
                  </div>
                  <p class="section-desc">
                    ${t(this.hass, "config_panel.covers_contact_desc")}
                  </p>
                  <div class="row">
                    <div class="grow">
                      <label class="field-label"
                        >${t(this.hass, "config_panel.covers_field_contact")}</label
                      >
                      ${renderEntitySelector(
                        this.hass,
                        draft.contact_entity_id ?? "",
                        (value) => {
                          this._patchDraft({ contact_entity_id: value || null });
                          void this._probe();
                        },
                        ["binary_sensor", "sensor"]
                      )}
                    </div>
                  </div>
                  ${draft.contact_entity_id
                    ? html`
                        ${this._renderContactMapEditor(draft)}
                        <div class="section-title">
                          ${t(this.hass, "config_panel.covers_safety_title")}
                        </div>
                        <p class="section-desc">
                          ${t(this.hass, "config_panel.covers_safety_desc")}
                        </p>
                        ${renderHelp(this.hass, "safety")}
                        <div class="row">
                          <div class="grow">
                            <label class="field-label"
                              >${t(
                                this.hass,
                                "config_panel.covers_field_ventilation"
                              )}</label
                            >
                            <input
                              type="number"
                              min="0"
                              max="100"
                              .value=${String(draft.safety.ventilation_position)}
                              @input=${(e: Event) =>
                                this._patchDraft({
                                  safety: {
                                    ...draft.safety,
                                    ventilation_position: Number(
                                      (e.target as HTMLInputElement).value
                                    ),
                                  },
                                })}
                            />
                          </div>
                          <div class="grow">
                            <label class="field-label"
                              >${t(
                                this.hass,
                                "config_panel.covers_field_safety_mode"
                              )}</label
                            >
                            <select
                              .value=${draft.safety.mode}
                              @change=${(e: Event) =>
                                this._patchDraft({
                                  safety: {
                                    ...draft.safety,
                                    mode: (e.target as HTMLSelectElement).value as
                                      | "block"
                                      | "clamp",
                                  },
                                })}
                            >
                              <option
                                value="block"
                                ?selected=${draft.safety.mode === "block"}
                              >
                                ${t(this.hass, "config_panel.covers_safety_block")}
                              </option>
                              <option
                                value="clamp"
                                ?selected=${draft.safety.mode === "clamp"}
                              >
                                ${t(this.hass, "config_panel.covers_safety_clamp")}
                              </option>
                            </select>
                          </div>
                        </div>
                        <label class="checkbox-row">
                          <input
                            type="checkbox"
                            .checked=${draft.safety.block_when_tilted}
                            @change=${(e: Event) =>
                              this._patchDraft({
                                safety: {
                                  ...draft.safety,
                                  block_when_tilted: (e.target as HTMLInputElement)
                                    .checked,
                                },
                              })}
                          />
                          ${t(this.hass, "config_panel.covers_safety_tilted")}
                        </label>
                      `
                    : nothing}
                `
              : nothing}
          </div>
          <div class="dialog-foot">
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
    const filtered = this._filteredCovers();
    return html`
      <ha-card>
        <div class="card-header">
          <ha-icon icon="mdi:window-shutter-cog"></ha-icon>
          ${t(this.hass, "config_panel.covers_title")}
          <span class="muted" style="font-weight:400">${snap.covers.length}</span>
          <span class="header-actions">
            <button class="btn" @click=${this._openAdd}>
              ${t(this.hass, "config_panel.covers_add")}
            </button>
          </span>
        </div>
        <div class="card-content">
          <p class="intro">${t(this.hass, "config_panel.covers_intro")}</p>
          ${snap.covers.length > 6
            ? html`<div class="toolbar">
                <div class="search">
                  <ha-icon icon="mdi:magnify"></ha-icon>
                  <input
                    type="text"
                    placeholder=${t(this.hass, "config_panel.covers_search_placeholder")}
                    .value=${this._search}
                    @input=${(e: Event) => {
                      this._search = (e.target as HTMLInputElement).value;
                      this.requestUpdate();
                    }}
                  />
                </div>
              </div>`
            : nothing}
          ${this._error && !this._draft
            ? html`<p class="error">${this._error}</p>`
            : nothing}
          ${snap.covers.length
            ? this._groupByArea(filtered).map((g) => this._renderGroup(g))
            : html`<div class="empty-state">
                <ha-icon icon="mdi:window-shutter-alert"></ha-icon>
                <p>${t(this.hass, "config_panel.covers_empty")}</p>
              </div>`}
        </div>
      </ha-card>
      ${this._renderDialog()}
    `;
  }
}

defineCustomElementOnce("ac-view-covers", ViewCovers);
