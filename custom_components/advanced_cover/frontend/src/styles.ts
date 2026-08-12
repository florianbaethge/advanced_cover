import { css } from "lit";

/** Root panel chrome (header, tabs, entry picker). */
export const panelStyles = css`
  :host {
    display: block;
    color: var(--primary-text-color);
  }
  .header {
    background-color: var(--app-header-background-color);
    color: var(--app-header-text-color, white);
    border-bottom: var(--app-header-border-bottom, none);
  }
  .toolbar {
    height: var(--header-height);
    display: flex;
    align-items: center;
    font-size: 20px;
    padding: 0 16px;
    font-weight: 400;
    box-sizing: border-box;
  }
  .main-title {
    margin: 0 0 0 24px;
    line-height: 20px;
    flex-grow: 1;
  }
  .version {
    font-size: 14px;
    opacity: 0.85;
  }
  ha-tab-group {
    margin-left: max(env(safe-area-inset-left), 24px);
    margin-right: max(env(safe-area-inset-right), 24px);
    --ha-tab-active-text-color: var(--app-header-text-color, white);
    --ha-tab-indicator-color: var(--app-header-text-color, white);
    --ha-tab-track-color: transparent;
  }
  .view {
    min-height: calc(100vh - 112px);
    display: flex;
    justify-content: center;
    padding: 16px;
    box-sizing: border-box;
  }
  .view-inner {
    width: 100%;
    max-width: 1100px;
    container-type: inline-size;
    container-name: acview;
  }
  .entry-picker {
    padding: 24px;
    max-width: 560px;
    margin: 0 auto;
  }
  .entry-picker h2 {
    margin: 0 0 8px;
    font-size: 1.5rem;
    font-weight: 600;
  }
  .entry-picker .lead {
    margin: 0 0 20px;
    color: var(--secondary-text-color);
    line-height: 1.5;
    font-size: 0.95rem;
  }
  .entry-cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .entry-card {
    display: block;
    width: 100%;
    text-align: left;
    padding: 16px 18px;
    border-radius: 12px;
    border: 1px solid var(--divider-color);
    background: var(--card-background-color);
    color: var(--primary-text-color);
    cursor: pointer;
    font: inherit;
    box-sizing: border-box;
  }
  .entry-card:hover {
    border-color: var(--primary-color);
  }
  .entry-card-title {
    font-size: 1.1rem;
    font-weight: 600;
  }
  .error {
    color: var(--error-color);
    margin: 8px 0;
  }
  .muted {
    opacity: 0.8;
    font-size: 0.9rem;
  }
`;

/** Shared styles for views: cards, rows, buttons, dialogs, chips, forms. */
export const sharedStyles = css`
  ha-card {
    margin-bottom: 20px;
    border-radius: 14px;
  }
  .card-content {
    padding: 20px 22px 22px;
  }
  .card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px 22px 0;
    font-size: 1.25rem;
    font-weight: 500;
    letter-spacing: -0.01em;
    line-height: 1.3;
  }
  .card-header ha-icon {
    --mdc-icon-size: 22px;
    color: var(--primary-color);
  }
  .card-header .header-actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.875rem;
    font-weight: 400;
  }
  .intro {
    font-size: 0.875rem;
    color: var(--secondary-text-color);
    line-height: 1.5;
    margin: 6px 0 18px;
  }

  /* Expandable inline help (info icon) */
  details.inline-help {
    margin: 6px 0 10px;
    font-size: 0.82rem;
  }
  details.inline-help summary {
    cursor: pointer;
    color: var(--secondary-text-color);
    list-style: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    user-select: none;
    transition: color 0.15s ease;
  }
  details.inline-help summary::-webkit-details-marker {
    display: none;
  }
  details.inline-help summary:hover,
  details.inline-help[open] summary {
    color: var(--primary-color);
  }
  details.inline-help .inline-help-icon {
    --mdc-icon-size: 16px;
    flex-shrink: 0;
    color: currentColor;
  }
  details.inline-help p {
    margin: 8px 0 4px;
    padding: 10px 14px;
    border-left: 3px solid var(--primary-color);
    border-radius: 0 8px 8px 0;
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.04));
    color: var(--secondary-text-color);
    line-height: 1.55;
    max-width: 640px;
  }
  .error {
    color: var(--error-color);
    margin: 8px 0;
  }
  .warning {
    color: var(--warning-color, #b85c00);
    margin: 8px 0;
    font-size: 0.875rem;
  }
  .muted {
    color: var(--secondary-text-color);
    font-size: 0.875rem;
  }
  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: flex-end;
    margin-bottom: 12px;
  }
  .grow {
    flex: 1;
    min-width: 160px;
  }
  .section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--secondary-text-color);
    margin: 26px 0 10px;
  }
  .section-title::after {
    content: "";
    flex: 1;
    height: 1px;
    background: var(--divider-color);
  }
  .section-desc {
    font-size: 0.825rem;
    color: var(--secondary-text-color);
    margin: 0 0 10px;
    line-height: 1.4;
  }

  /* Buttons */
  .btn,
  .btn-outline,
  .btn-danger,
  .btn-icon {
    font: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: 8px;
    padding: 8px 16px;
    cursor: pointer;
    border: 1px solid transparent;
    box-sizing: border-box;
    transition:
      background 0.15s ease,
      border-color 0.15s ease,
      box-shadow 0.15s ease,
      opacity 0.15s ease;
  }
  .btn {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }
  .btn:hover:not(:disabled) {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.22);
  }
  .btn:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .btn-outline {
    background: transparent;
    color: var(--primary-color);
    border-color: var(--primary-color);
  }
  .btn-outline:hover:not(:disabled) {
    background: rgba(var(--rgb-primary-color, 33, 150, 243), 0.08);
  }
  .btn-danger {
    background: transparent;
    color: var(--error-color);
    border-color: var(--error-color);
  }
  .btn-danger:hover:not(:disabled) {
    background: rgba(244, 67, 54, 0.08);
  }
  .btn-icon {
    background: transparent;
    color: var(--primary-text-color);
    border: 1px solid var(--divider-color);
    padding: 6px 10px;
    line-height: 1;
  }
  .btn-icon:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  /* Inputs */
  label.field-label {
    display: block;
    font-size: 0.78rem;
    color: var(--secondary-text-color);
    margin-bottom: 4px;
  }
  input[type="text"],
  input[type="time"],
  input[type="number"],
  select {
    font: inherit;
    color: var(--primary-text-color);
    background: var(
      --input-fill-color,
      var(--secondary-background-color, rgba(127, 127, 127, 0.12))
    );
    border: 1px solid var(--input-idle-line-color, var(--divider-color));
    border-radius: 8px;
    padding: 8px 10px;
    box-sizing: border-box;
    width: 100%;
    transition:
      background-color 0.15s ease,
      border-color 0.15s ease,
      box-shadow 0.15s ease;
  }
  input[type="text"]:hover,
  input[type="time"]:hover,
  input[type="number"]:hover,
  select:hover {
    border-color: var(--input-hover-line-color, var(--primary-color));
  }
  input:focus-visible,
  select:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: 1px;
  }
  ha-selector {
    display: block;
    width: 100%;
    --mdc-text-field-fill-color: var(
      --input-fill-color,
      var(--secondary-background-color, rgba(127, 127, 127, 0.12))
    );
    --mdc-text-field-idle-line-color: var(
      --input-idle-line-color,
      var(--divider-color)
    );
    --mdc-text-field-hover-line-color: var(
      --input-hover-line-color,
      var(--primary-color)
    );
  }
  input[type="range"] {
    width: 100%;
  }
  .checkbox-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 8px 0;
    font-size: 0.9rem;
  }

  /* Chips */
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .chip {
    font: inherit;
    font-size: 0.8rem;
    padding: 5px 10px;
    border-radius: 14px;
    border: 1px solid var(--divider-color);
    background: transparent;
    color: var(--primary-text-color);
    cursor: pointer;
  }
  .chip.selected {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    border-color: var(--primary-color);
  }
  .chip.readonly {
    cursor: default;
    color: var(--secondary-text-color);
  }

  /* Status badges */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 3px 9px;
    border-radius: 999px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.06));
    color: var(--secondary-text-color);
  }
  .badge::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }
  .badge-executed {
    color: var(--success-color, #0f9d58);
  }
  .badge-skipped {
    color: var(--secondary-text-color);
  }
  .badge-armed {
    color: var(--warning-color, #b85c00);
  }
  .badge-expired {
    color: var(--secondary-text-color);
  }
  .badge-blocked_safety {
    color: var(--error-color);
  }
  .badge-unavailable {
    color: var(--error-color);
  }
  .badge-planned {
    color: var(--primary-color);
  }

  /* List rows */
  .list-row-wrap {
    display: flex;
    align-items: stretch;
    margin-bottom: 12px;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid var(--divider-color);
    background: var(--secondary-background-color, rgba(0, 0, 0, 0.02));
    transition: border-color 0.15s ease, box-shadow 0.15s ease;
  }
  .list-row-wrap:hover {
    border-color: var(--primary-color);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.07);
  }
  .list-row-accent {
    width: 6px;
    flex-shrink: 0;
    background: var(--primary-color);
  }
  .list-row-accent.inactive {
    background: var(--disabled-text-color, rgba(158, 158, 158, 0.45));
  }
  .list-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 16px;
    flex: 1;
    min-width: 0;
    padding: 14px 16px;
  }
  .list-main {
    flex: 1;
    min-width: 160px;
  }
  .list-name {
    font-size: 1.05rem;
    font-weight: 600;
    margin: 0 0 4px;
  }
  .list-detail {
    font-size: 0.85rem;
    color: var(--secondary-text-color);
    margin: 0;
    line-height: 1.4;
  }
  .list-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  /* Dialog (plain, works inside scoped registries) */
  .dialog-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 4vh 16px;
    z-index: 10;
    overflow-y: auto;
  }
  .dialog {
    background: var(--card-background-color);
    color: var(--primary-text-color);
    border-radius: 16px;
    width: 100%;
    max-width: 680px;
    padding: 26px 28px;
    box-sizing: border-box;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  }
  .dialog h3 {
    margin: 0 0 20px;
    font-size: 1.3rem;
    font-weight: 500;
    letter-spacing: -0.01em;
  }
  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 20px;
    flex-wrap: wrap;
  }
  .dialog-actions .spacer {
    flex: 1;
  }

  /* Condition sentence rows */
  .cond-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    border: 1px solid var(--divider-color);
    border-radius: 8px;
    margin-bottom: 8px;
    font-size: 0.9rem;
  }
  .cond-row select,
  .cond-row input {
    width: auto;
    min-width: 90px;
    padding: 5px 8px;
    font-size: 0.85rem;
  }
  .cond-row .cond-entity {
    min-width: 220px;
  }
  .cond-remove {
    margin-left: auto;
    background: none;
    border: none;
    color: var(--secondary-text-color);
    font-size: 1rem;
    cursor: pointer;
    padding: 4px;
  }
  .cond-remove:hover {
    color: var(--error-color);
  }

  .position-bar {
    position: relative;
    height: 8px;
    border-radius: 4px;
    background: var(--divider-color);
    overflow: hidden;
    min-width: 60px;
  }
  .position-bar-fill {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    background: var(--primary-color);
  }

  /* Empty states */
  .empty-state {
    text-align: center;
    padding: 36px 20px;
    color: var(--secondary-text-color);
  }
  .empty-state ha-icon {
    --mdc-icon-size: 44px;
    opacity: 0.35;
    display: block;
    margin: 0 auto 10px;
  }
  .empty-state p {
    margin: 0;
    font-size: 0.92rem;
    line-height: 1.5;
  }

  details.expand {
    margin: 8px 0;
  }
  details.expand summary {
    cursor: pointer;
    font-size: 0.875rem;
    color: var(--primary-color);
  }
  table.plain {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }
  table.plain th,
  table.plain td {
    text-align: left;
    padding: 8px 10px;
    border-bottom: 1px solid var(--divider-color);
    vertical-align: top;
  }
  table.plain th {
    color: var(--secondary-text-color);
    font-weight: 500;
  }

  /* ---- Redesign v0.3 shared components ------------------------------- */

  /* Removable chip: icon sits at the chip's baseline, dimmed until hover. */
  .chip.chip-removable ha-icon {
    --mdc-icon-size: 15px;
    opacity: 0.7;
    vertical-align: -2px;
  }

  /* Preflight badge (would run / would skip / cannot evaluate). */
  .preflight-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    padding: 3px 9px 3px 7px;
    border-radius: 999px;
    border: 1px solid transparent;
    white-space: nowrap;
  }
  .preflight-badge ha-icon {
    --mdc-icon-size: 15px;
  }
  .preflight-badge.would_run {
    color: var(--primary-color);
    background: color-mix(in srgb, var(--primary-color) 12%, transparent);
    border-color: color-mix(in srgb, var(--primary-color) 45%, transparent);
  }
  .preflight-badge.would_skip {
    color: var(--warning-color, #f0b23a);
    background: color-mix(in srgb, var(--warning-color, #f0b23a) 12%, transparent);
    border-color: color-mix(
      in srgb,
      var(--warning-color, #f0b23a) 45%,
      transparent
    );
  }
  .preflight-badge.unknown {
    color: var(--secondary-text-color);
    background: color-mix(in srgb, var(--secondary-text-color) 12%, transparent);
    border-color: color-mix(
      in srgb,
      var(--secondary-text-color) 40%,
      transparent
    );
  }

  /* Condition checklist line (preflight detail). */
  .cond-check {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 0.82rem;
    line-height: 1.4;
    padding: 3px 0;
    color: var(--secondary-text-color);
  }
  .cond-check ha-icon {
    --mdc-icon-size: 17px;
    flex-shrink: 0;
    margin-top: 1px;
  }
  .cond-check.ok ha-icon {
    color: var(--success-color, #43a047);
  }
  .cond-check.fail {
    color: var(--primary-text-color);
  }
  .cond-check.fail ha-icon {
    color: var(--warning-color, #f0b23a);
  }
  .cond-check.na ha-icon {
    color: var(--disabled-text-color, #6d7476);
  }
  .cond-check .cond-actual {
    color: var(--primary-text-color);
    font-variant-numeric: tabular-nums;
  }

  /* Segmented icon button group (open · stop · close, filters). */
  .icon-group {
    display: inline-flex;
    border: 1px solid var(--divider-color);
    border-radius: 9px;
    overflow: hidden;
    flex-shrink: 0;
  }
  .icon-group button {
    font: inherit;
    border: none;
    background: transparent;
    color: var(--primary-text-color);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 38px;
    height: 34px;
    padding: 0 6px;
    border-left: 1px solid var(--divider-color);
    transition: background 0.12s ease, color 0.12s ease;
  }
  .icon-group button:first-child {
    border-left: none;
  }
  .icon-group button:hover:not(:disabled) {
    background: color-mix(in srgb, var(--primary-color) 12%, transparent);
    color: var(--primary-color);
  }
  .icon-group button.selected {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }
  .icon-group button:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .icon-group ha-icon {
    --mdc-icon-size: 20px;
  }

  /* Compact list row: header + optional expanded detail stack vertically.
     Left accent is a rounded border (matches Today's .block / Scenarios .srow). */
  .compact-row {
    border: 1px solid var(--divider-color);
    border-left: 3px solid var(--primary-color);
    border-radius: 10px;
    background: var(--card-background-color);
    margin-bottom: 8px;
    overflow: hidden;
    transition: background 0.12s ease;
  }
  .compact-row:hover {
    background: color-mix(in srgb, var(--primary-color) 4%, var(--card-background-color));
  }
  .compact-row.inactive {
    border-left-color: var(--disabled-text-color, #6d7476);
  }
  .compact-row.danger {
    border-left-color: var(--error-color, #d93025);
  }

  /* Icon-only button with a guaranteed hit area + focus ring. */
  .iconbtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    border: none;
    background: transparent;
    color: var(--primary-text-color);
    cursor: pointer;
    flex-shrink: 0;
  }
  .iconbtn:hover:not(:disabled) {
    background: color-mix(in srgb, var(--primary-color) 12%, transparent);
    color: var(--primary-color);
  }
  .iconbtn:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .iconbtn.danger:hover:not(:disabled) {
    background: color-mix(in srgb, var(--error-color) 14%, transparent);
    color: var(--error-color);
  }
  .iconbtn ha-icon {
    --mdc-icon-size: 22px;
  }
  .iconbtn:focus-visible,
  .icon-group button:focus-visible,
  .chip:focus-visible {
    outline: 2px solid var(--primary-color);
    outline-offset: -2px;
  }

  /* Meta line with inline mdi icons (room, azimuth, contact, next action). */
  .meta-line {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px 12px;
    font-size: 0.8rem;
    color: var(--secondary-text-color);
    min-width: 0;
  }
  .meta-line .meta {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
  }
  .meta-line ha-icon {
    --mdc-icon-size: 16px;
    flex-shrink: 0;
  }

  /* Segmented filter control (All / Upcoming / Issues). */
  .segmented {
    display: inline-flex;
    border: 1px solid var(--divider-color);
    border-radius: 9px;
    overflow: hidden;
  }
  .segmented button {
    font: inherit;
    font-size: 0.8rem;
    border: none;
    border-left: 1px solid var(--divider-color);
    background: transparent;
    color: var(--secondary-text-color);
    padding: 6px 12px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .segmented button:first-child {
    border-left: none;
  }
  .segmented button.selected {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }
  .segmented .count {
    font-size: 0.7rem;
    font-weight: 600;
    padding: 0 6px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--warning-color, #f0b23a) 22%, transparent);
    color: var(--warning-color, #f0b23a);
  }
  .segmented button.selected .count {
    background: rgba(255, 255, 255, 0.25);
    color: inherit;
  }

  /* Truncating text that must never wrap in a data row. */
  .ellipsis {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
      animation: none !important;
    }
  }
`;
