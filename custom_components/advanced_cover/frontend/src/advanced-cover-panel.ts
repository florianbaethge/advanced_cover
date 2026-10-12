import { LitElement, html, nothing } from "lit";
import { fetchState, listEntries, subscribeState } from "./data/api";
import { defineCustomElementOnce, navigate, useTimeZone } from "./helpers";
import { t, TRANSLATION_DOMAIN } from "./i18n";
import { loadHaPanelElements } from "./load-ha-elements";
import { exportPath, getEditScenarioQuery, getPath } from "./navigation";
import { panelStyles } from "./styles";
import type { EntryRow, HomeAssistant, PanelSnapshot } from "./types";
import "./views/view-covers";
import "./views/view-log";
import "./views/view-scenarios";
import "./views/view-today";

// Version is injected from the VERSION file during build.
declare const __VERSION__: string;
const VERSION = __VERSION__;

const PANEL_PAGES = ["today", "covers", "scenarios", "log"] as const;
type PanelPage = (typeof PANEL_PAGES)[number];

const TAB_LABEL_KEYS: Record<PanelPage, string> = {
  today: "config_panel.tab_today",
  covers: "config_panel.tab_covers",
  scenarios: "config_panel.tab_scenarios",
  log: "config_panel.tab_log",
};

function normalizePage(raw: string | undefined): PanelPage {
  const p = raw || "today";
  return (PANEL_PAGES as readonly string[]).includes(p) ? (p as PanelPage) : "today";
}

export class AdvancedCoverPanel extends LitElement {
  static properties = {
    hass: { attribute: false },
    narrow: { type: Boolean, reflect: true },
    route: { attribute: false },
    panel: { attribute: false },
  };

  hass?: HomeAssistant;
  narrow = false;
  route?: unknown;
  panel?: unknown;

  static styles = panelStyles;

  private _snapshot: PanelSnapshot | null = null;
  private _loading = true;
  private _error?: string;
  private _entries: EntryRow[] = [];
  private _entriesLoading = false;

  private _unsub?: () => Promise<void>;

  private _resubscribeTimer?: number;
  private _subscribedEntryId?: string;

  /** Language we last loaded `config_panel` for (HA does not auto-load it for panel_custom). */
  private _panelI18nLang?: string;
  private _initialPanelI18nDone = false;

  setProperties(props: Record<string, unknown>): void {
    if (props.hass !== undefined) {
      const next = props.hass as HomeAssistant;
      if (this.hass?.language !== next?.language) {
        this._panelI18nLang = undefined;
      }
      this.hass = next;
      void this._ensurePanelI18n();
    }
    if (props.narrow !== undefined) this.narrow = Boolean(props.narrow);
    if (props.route !== undefined) this.route = props.route;
    if (props.panel !== undefined) this.panel = props.panel;
    this.requestUpdate();
  }

  private async _ensurePanelI18n(): Promise<void> {
    if (!this.hass) return;
    if (!this.hass.loadBackendTranslation) {
      this._markI18nDone();
      return;
    }
    const lang = this.hass.language ?? "en";
    if (this._panelI18nLang === lang) {
      this._markI18nDone();
      return;
    }
    try {
      await this.hass.loadBackendTranslation("config_panel", TRANSLATION_DOMAIN);
    } catch {
      /* localize may keep returning missing keys */
    }
    this._panelI18nLang = lang;
    this._markI18nDone();
  }

  private _markI18nDone(): void {
    if (!this._initialPanelI18nDone) {
      this._initialPanelI18nDone = true;
    }
    this.requestUpdate();
  }

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("location-changed", this._locChanged);
    document.addEventListener("visibilitychange", this._onVisibility);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("location-changed", this._locChanged);
    document.removeEventListener("visibilitychange", this._onVisibility);
    window.clearTimeout(this._resubscribeTimer);
    void this._teardownSubscription();
  }

  private _onVisibility = (): void => {
    if (document.visibilityState !== "visible") return;
    if (!window.location.pathname.includes("advanced-cover")) return;
    const { entryId } = getPath();
    if (entryId && this.hass) {
      void this._refreshOnce(entryId);
    }
  };

  private _locChanged = (): void => {
    if (!window.location.pathname.includes("advanced-cover")) return;
    void this._reloadPath();
  };

  private async _teardownSubscription(): Promise<void> {
    if (this._unsub) {
      try {
        await this._unsub();
      } catch {
        /* ignore */
      }
      this._unsub = undefined;
    }
    this._subscribedEntryId = undefined;
  }

  private async _refreshOnce(entryId: string): Promise<void> {
    if (!this.hass) return;
    try {
      this._snapshot = await fetchState(this.hass, entryId);
      this._error = undefined;
    } catch (e) {
      this._error = String(e);
    }
    this.requestUpdate();
  }

  private async _ensureSubscription(entryId: string): Promise<void> {
    if (!this.hass || this._subscribedEntryId === entryId) return;
    await this._teardownSubscription();
    this._subscribedEntryId = entryId;
    try {
      const unsubPromise = subscribeState(this.hass, entryId, (snapshot) => {
        if ("unloaded" in snapshot) {
          // The entry was unloaded (a reload): this subscription is over.
          // Keep the last state on screen and come back for the new one.
          this._unsub = undefined;
          this._subscribedEntryId = undefined;
          this._resubscribeSoon(entryId);
          return;
        }
        this._snapshot = snapshot;
        this._loading = false;
        this._error = undefined;
        this.requestUpdate();
      });
      if (unsubPromise) {
        this._unsub = await unsubPromise;
      } else {
        // No connection object: fall back to a one-shot fetch.
        await this._refreshOnce(entryId);
        this._loading = false;
      }
    } catch (e) {
      this._error = String(e);
      this._loading = false;
      this._subscribedEntryId = undefined;
    }
    this.requestUpdate();
  }

  /** Subscribe again after the entry was unloaded; a reload takes a moment,
      so a few tries, then the error of the last one stays on screen. */
  private _resubscribeSoon(entryId: string, attempt = 0): void {
    window.clearTimeout(this._resubscribeTimer);
    this._resubscribeTimer = window.setTimeout(
      async () => {
        if (getPath().entryId !== entryId || !this.isConnected) return;
        await this._ensureSubscription(entryId);
        if (this._subscribedEntryId !== entryId && attempt < 5) {
          this._resubscribeSoon(entryId, attempt + 1);
        }
      },
      2000 * (attempt + 1)
    );
  }

  private async _reloadPath(): Promise<void> {
    const { entryId } = getPath();
    if (!entryId) {
      await this._teardownSubscription();
      this._snapshot = null;
      await this._loadEntryList();
      /* A concurrent reload may have navigated to an entry meanwhile. */
      if (getPath().entryId) {
        this.requestUpdate();
        return;
      }
      if (this._entries.length === 1) {
        navigate(this, exportPath(this._entries[0].entry_id, "today"), true);
        return;
      }
      this._loading = false;
      this.requestUpdate();
      return;
    }
    this._loading = this._snapshot === null;
    this.requestUpdate();
    await this._ensureSubscription(entryId);
  }

  private async _loadEntryList(): Promise<void> {
    if (!this.hass) return;
    this._entriesLoading = true;
    this.requestUpdate();
    try {
      this._entries = await listEntries(this.hass);
      this._error = undefined;
    } catch (e) {
      this._error = String(e);
      this._entries = [];
    } finally {
      this._entriesLoading = false;
      this.requestUpdate();
    }
  }

  async firstUpdated(): Promise<void> {
    await loadHaPanelElements();
    await this._ensurePanelI18n();
    if (this.hass) {
      await this._reloadPath();
    }
  }

  updated(changed: Map<PropertyKey, unknown>): void {
    if (!changed.has("hass") || !this.hass) return;
    const prev = changed.get("hass") as HomeAssistant | undefined;
    if (prev === undefined || prev.connection !== this.hass.connection) {
      this._subscribedEntryId = undefined;
      void this._reloadPath();
    }
  }

  private _onTab(ev: CustomEvent): void {
    const name = (ev.detail as { name?: string })?.name;
    const { entryId, page } = getPath();
    if (!name || !entryId || name === page) return;
    navigate(this, exportPath(entryId, name));
    this.requestUpdate();
  }

  protected render() {
    if (!this.hass || !this._initialPanelI18nDone) {
      return html`<div class="view"><div class="view-inner">Loading…</div></div>`;
    }
    // Before the views render: they print and place times through helpers.
    useTimeZone(this.hass);

    const path = getPath();
    const page = normalizePage(path.page);

    if (!path.entryId) {
      return html`
        <div class="entry-picker">
          <h2>${t(this.hass, "config_panel.entry_picker_title")}</h2>
          <p class="lead">${t(this.hass, "config_panel.entry_picker_lead")}</p>
          ${this._error ? html`<p class="error">${this._error}</p>` : nothing}
          ${this._entriesLoading
            ? html`<p class="muted">${t(this.hass, "config_panel.loading")}</p>`
            : nothing}
          <div class="entry-cards">
            ${this._entries.map(
              (e) => html`
                <button
                  type="button"
                  class="entry-card"
                  @click=${() => navigate(this, exportPath(e.entry_id, "today"))}
                >
                  <div class="entry-card-title">${e.name}</div>
                </button>
              `
            )}
          </div>
          ${!this._entries.length && !this._entriesLoading
            ? html`<p class="muted">
                ${t(this.hass, "config_panel.entry_picker_empty")}
              </p>`
            : nothing}
        </div>
      `;
    }

    if (this._loading || !this._snapshot) {
      return html`<div class="view">
        <div class="view-inner">
          ${this._error || t(this.hass, "config_panel.loading")}
        </div>
      </div>`;
    }

    return html`
      <div class="header">
        <div class="toolbar">
          <ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button>
          <div class="main-title">${t(this.hass, "config_panel.main_title")}</div>
          <div class="version">v${VERSION}</div>
        </div>
        <ha-tab-group @wa-tab-show=${this._onTab}>
          ${PANEL_PAGES.map(
            (p) => html`
              <ha-tab-group-tab slot="nav" panel=${p} .active=${page === p}>
                ${t(this.hass, TAB_LABEL_KEYS[p])}
              </ha-tab-group-tab>
            `
          )}
        </ha-tab-group>
      </div>
      <div class="view">
        <div class="view-inner">
          ${page === "today"
            ? html`<ac-view-today
                .hass=${this.hass}
                .entryId=${path.entryId}
                .snapshot=${this._snapshot}
              ></ac-view-today>`
            : nothing}
          ${page === "covers"
            ? html`<ac-view-covers
                .hass=${this.hass}
                .entryId=${path.entryId}
                .snapshot=${this._snapshot}
              ></ac-view-covers>`
            : nothing}
          ${page === "scenarios"
            ? html`<ac-view-scenarios
                .hass=${this.hass}
                .entryId=${path.entryId}
                .snapshot=${this._snapshot}
                .editScenarioId=${getEditScenarioQuery() ?? undefined}
              ></ac-view-scenarios>`
            : nothing}
          ${page === "log"
            ? html`<ac-view-log
                .hass=${this.hass}
                .entryId=${path.entryId}
                .snapshot=${this._snapshot}
              ></ac-view-log>`
            : nothing}
        </div>
      </div>
    `;
  }
}

defineCustomElementOnce("advanced-cover-panel", AdvancedCoverPanel);
