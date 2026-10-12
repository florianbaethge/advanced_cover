import { css } from "lit";

/**
 * The card draws with Home Assistant's own theme variables, so it follows any
 * theme the dashboard uses. Only the alpha-derived tints have no HA
 * equivalent; they are mixed here, a little stronger on dark themes (a flat
 * alpha reads muddy on a dark card).
 *
 * `[data-dark]` is set from `hass.themes.darkMode` rather than
 * `prefers-color-scheme`: a user can pick a dark HA theme on a light OS.
 * `[data-narrow]` / `[data-stack]` / `[data-wide]` follow the card's own
 * width, not the viewport: the same card is narrow in a three-column section and wide in a
 * panel view on the very same screen.
 */
export const cardStyles = css`
  :host {
    --ac-fg: var(--primary-text-color);
    --ac-fg2: var(--secondary-text-color);
    --ac-div: var(--divider-color);
    --ac-pri: var(--primary-color);
    --ac-prifg: var(--text-primary-color, #fff);
    --ac-ok: var(--success-color, #43a047);
    --ac-warn: var(--warning-color, #f0b23a);
    --ac-err: var(--error-color, #d93025);
    --ac-off: var(--disabled-text-color, #6d7476);

    --ac-soft: color-mix(in srgb, var(--primary-text-color) 5%, transparent);
    --ac-tint: color-mix(in srgb, var(--ac-pri) 12%, transparent);
    --ac-okT: color-mix(in srgb, var(--ac-ok) 14%, transparent);
    --ac-warnT: color-mix(in srgb, var(--ac-warn) 14%, transparent);
    --ac-errT: color-mix(in srgb, var(--ac-err) 12%, transparent);

    display: block;
  }
  :host([data-dark]) {
    --ac-soft: color-mix(in srgb, var(--primary-text-color) 7%, transparent);
    --ac-tint: color-mix(in srgb, var(--ac-pri) 18%, transparent);
    --ac-okT: color-mix(in srgb, var(--ac-ok) 18%, transparent);
    --ac-warnT: color-mix(in srgb, var(--ac-warn) 16%, transparent);
    --ac-errT: color-mix(in srgb, var(--ac-err) 16%, transparent);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  ha-card {
    color: var(--ac-fg);
    overflow: hidden;
    height: 100%;
  }

  button {
    font: inherit;
    color: inherit;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  button:disabled {
    cursor: default;
    opacity: 0.45;
  }
  button:focus-visible {
    outline: 2px solid var(--ac-pri);
    outline-offset: 2px;
  }

  .ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }
  .num {
    font-variant-numeric: tabular-nums;
  }

  /* ---- header ---------------------------------------------------------- */

  .head {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px 0;
  }
  .head > ha-icon {
    --mdc-icon-size: 22px;
    color: var(--ac-pri);
    flex: none;
  }
  .head .title {
    font-size: 16px;
    font-weight: 500;
    letter-spacing: -0.01em;
    flex: 1;
  }
  .head.off > ha-icon {
    color: var(--ac-off);
  }

  .pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 999px;
    background: var(--ac-soft);
    color: var(--ac-fg2);
    flex: none;
    white-space: nowrap;
  }
  .pill::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
  button.pill {
    border: none;
    font-family: inherit;
  }
  button.pill:hover {
    filter: brightness(1.15);
  }
  .pill.pri {
    background: var(--ac-tint);
    color: var(--ac-pri);
  }
  .pill.warn {
    background: var(--ac-warnT);
    color: var(--ac-warn);
  }

  .iconbtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    border-radius: 8px;
    background: none;
    color: var(--ac-fg2);
    flex: none;
    --mdc-icon-size: 20px;
  }
  .iconbtn:hover:not(:disabled) {
    background: var(--ac-soft);
    color: var(--ac-fg);
  }
  .head .iconbtn {
    margin: -4px -6px -4px -2px;
  }

  /* ---- sections -------------------------------------------------------- */

  .sections {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
  }
  .sec {
    padding: 14px 16px 16px;
    min-width: 0;
  }
  .sec + .sec {
    border-top: 1px solid var(--ac-div);
  }
  /* Wide cards (panel views, full-width sections) lay sections out in two
     columns; a lone last section takes the whole row. */
  :host([data-wide]) .sections {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  :host([data-wide]) .sec + .sec {
    border-top: none;
  }
  :host([data-wide]) .sec:nth-child(n + 3) {
    border-top: 1px solid var(--ac-div);
  }
  :host([data-wide]) .sec:nth-child(even) {
    border-left: 1px solid var(--ac-div);
  }
  :host([data-wide]) .sec:last-child:nth-child(odd) {
    grid-column: 1 / -1;
  }
  .head + .sections .sec:first-child,
  :host([data-wide]) .head + .sections .sec:nth-child(2) {
    padding-top: 12px;
  }

  .sec-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    min-height: 20px;
  }
  .sec-head > ha-icon {
    --mdc-icon-size: 18px;
    color: var(--ac-fg2);
    flex: none;
  }
  .sec-title {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ac-fg2);
  }
  .sec-aside {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-size: 12px;
    color: var(--ac-fg2);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .sec-aside span {
    display: inline-flex;
    align-items: center;
    gap: 3px;
  }
  .sec-aside ha-icon {
    --mdc-icon-size: 15px;
    color: var(--ac-warn);
  }

  .empty {
    font-size: 13px;
    color: var(--ac-fg2);
    padding: 4px 0;
  }
  .error {
    margin: 0;
    padding: 10px 16px;
    font-size: 13px;
    color: var(--ac-err);
    background: var(--ac-errT);
  }
  .message {
    padding: 18px 16px;
    font-size: 14px;
    color: var(--ac-fg2);
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .message ha-icon {
    --mdc-icon-size: 20px;
    flex: none;
  }

  /* ---- buttons --------------------------------------------------------- */

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 40px;
    padding: 0 14px;
    border-radius: 10px;
    border: 1px solid var(--ac-div);
    background: none;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    transition:
      background 0.15s ease,
      border-color 0.15s ease;
    --mdc-icon-size: 18px;
  }
  .btn:hover:not(:disabled) {
    background: var(--ac-soft);
  }
  .btn.primary {
    background: var(--ac-pri);
    border-color: var(--ac-pri);
    color: var(--ac-prifg);
  }
  .btn.primary:hover:not(:disabled) {
    background: color-mix(in srgb, var(--ac-pri) 88%, #000);
  }
  .btn.confirm {
    background: var(--ac-tint);
    border-color: var(--ac-pri);
    color: var(--ac-pri);
  }
  .btn.confirm:hover:not(:disabled) {
    background: color-mix(in srgb, var(--ac-pri) 22%, transparent);
  }
  .btn.small {
    min-height: 32px;
    padding: 0 12px;
    font-size: 13px;
    border-radius: 8px;
  }

  /* ---- status chips ---------------------------------------------------- */

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 3px 9px;
    border-radius: 999px;
    background: var(--ac-soft);
    color: var(--ac-fg2);
    white-space: nowrap;
    flex: none;
    --mdc-icon-size: 14px;
  }
  .badge::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex: none;
  }
  .badge.executed,
  .badge.executed_partial {
    color: var(--ac-ok);
  }
  .badge.executed_partial ha-icon {
    color: var(--ac-err);
  }
  .badge.armed {
    color: var(--ac-warn);
  }
  .badge.blocked_safety,
  .badge.unavailable {
    color: var(--ac-err);
  }
  .badge.planned {
    color: var(--ac-pri);
  }

  /* Live check ("would run now" / "would be skipped now"). */
  .verdict {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11.5px;
    font-weight: 600;
    padding: 3px 9px 3px 7px;
    border-radius: 999px;
    border: 1px solid transparent;
    white-space: nowrap;
    flex: none;
    --mdc-icon-size: 15px;
  }
  .verdict.would_run {
    color: var(--ac-pri);
    background: var(--ac-tint);
    border-color: color-mix(in srgb, var(--ac-pri) 40%, transparent);
  }
  .verdict.would_skip {
    color: var(--ac-warn);
    background: var(--ac-warnT);
    border-color: color-mix(in srgb, var(--ac-warn) 45%, transparent);
  }
  .verdict.unknown {
    color: var(--ac-fg2);
    background: var(--ac-soft);
    border-color: color-mix(in srgb, var(--ac-fg2) 35%, transparent);
  }

  /* ---- next up --------------------------------------------------------- */

  .next {
    display: flex;
    gap: 14px 16px;
    align-items: flex-start;
  }
  .next-main {
    flex: 1;
    min-width: 0;
  }
  .next-actions {
    flex: none;
    width: 190px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  /* Too narrow for a button column: the buttons go below, side by side —
     and one above the other once even that gets tight. */
  :host([data-stack]) .next {
    flex-direction: column;
    align-items: stretch;
  }
  :host([data-stack]) .next-actions {
    width: auto;
    flex-direction: row;
  }
  :host([data-stack]) .next-actions .btn {
    flex: 1;
    min-width: 0;
  }
  :host([data-narrow]) .next-actions {
    flex-direction: column;
  }
  .label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ac-fg2);
  }
  .clock-row {
    display: flex;
    align-items: baseline;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 2px;
  }
  .clock {
    font-size: 30px;
    line-height: 1.15;
    font-weight: 400;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }
  .lead {
    font-size: 14px;
    color: var(--ac-fg2);
    font-variant-numeric: tabular-nums;
  }
  .next-name {
    font-size: 15px;
    font-weight: 500;
    margin-top: 2px;
    text-wrap: pretty;
  }
  .facts {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
    margin-top: 8px;
    font-size: 13px;
    color: var(--ac-fg2);
  }
  .facts span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .facts ha-icon {
    --mdc-icon-size: 17px;
    flex: none;
  }
  .check {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px 8px;
    margin-top: 10px;
  }
  .check-reason {
    font-size: 12.5px;
    color: var(--ac-fg2);
    flex: 1 1 140px;
    min-width: 0;
    text-wrap: pretty;
  }
  .big {
    font-size: 19px;
    line-height: 1.3;
    font-weight: 500;
    letter-spacing: -0.01em;
    margin-top: 2px;
  }
  .hint {
    font-size: 13px;
    color: var(--ac-fg2);
    margin-top: 4px;
    text-wrap: pretty;
  }
  .tomorrow {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    font-size: 13px;
    color: var(--ac-fg);
    font-variant-numeric: tabular-nums;
  }
  .tomorrow ha-icon {
    --mdc-icon-size: 17px;
    color: var(--ac-fg2);
    flex: none;
  }
  .note {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-top: 12px;
    padding: 8px 10px;
    border-radius: 10px;
    font-size: 12.5px;
    line-height: 1.4;
    background: var(--ac-warnT);
    color: var(--ac-fg);
  }
  .note ha-icon {
    --mdc-icon-size: 17px;
    color: var(--ac-warn);
    flex: none;
    margin-top: 1px;
  }
  .last {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid var(--ac-div);
    font-size: 13px;
    color: var(--ac-fg2);
    min-width: 0;
  }
  .last .what {
    flex: 1;
  }
  .last .what b {
    font-weight: 500;
    color: var(--ac-fg);
  }
  .feedback {
    margin-top: 10px;
  }
  .results {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  /* ---- timeline -------------------------------------------------------- */

  /* The shared strip is sized for the panel; a card wants it flatter. */
  .tl {
    height: 58px;
  }
  .tl-marker.row-0 {
    top: 12px;
  }
  .tl-marker.row-1 {
    top: 32px;
  }
  .tl-tick {
    bottom: 0;
  }
  .tl-marker.sel .tl-dot {
    transform: scale(1.35);
    box-shadow:
      0 0 0 2px var(--ac-pri),
      0 1px 3px rgba(0, 0, 0, 0.3);
  }
  .tl-axis-label:first-child {
    transform: none;
  }
  .tl-axis-label:last-child {
    transform: translateX(-100%);
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 12px;
    margin-top: 8px;
    font-size: 11.5px;
    color: var(--ac-fg2);
  }
  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    flex: none;
    background: var(--ac-off);
  }
  .dot.executed,
  .dot.executed_partial {
    background: var(--ac-ok);
  }
  .dot.executed_partial {
    box-shadow: 0 0 0 1.5px var(--ac-err);
  }
  .dot.will_run,
  .dot.would_run,
  .dot.planned {
    background: var(--ac-pri);
  }
  .dot.would_skip,
  .dot.armed {
    background: var(--ac-warn);
  }
  .dot.blocked_safety,
  .dot.unavailable {
    background: var(--ac-err);
  }
  .swatch-retry {
    width: 16px;
    height: 9px;
    border-radius: 3px;
    background: var(--ac-warnT);
    border: 1px dashed color-mix(in srgb, var(--ac-warn) 55%, transparent);
  }

  .runs {
    margin: 10px -8px -6px;
  }
  .run {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 7px 8px;
    border: none;
    border-radius: 8px;
    background: none;
    text-align: left;
    font-size: 14px;
  }
  .run:hover {
    background: var(--ac-soft);
  }
  .run.past .run-time,
  .run.past .run-name {
    color: var(--ac-fg2);
  }
  .run-time {
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    flex: none;
  }
  .run-name {
    flex: 1;
  }
  .run > ha-icon {
    --mdc-icon-size: 18px;
    color: var(--ac-fg2);
    flex: none;
    transition: transform 0.15s ease;
  }
  .run.open > ha-icon {
    transform: rotate(180deg);
  }
  /* Narrow: the row's leading dot already carries the result. */
  :host([data-narrow]) .run .badge,
  :host([data-narrow]) .run .verdict span {
    display: none;
  }
  :host([data-narrow]) .run .verdict {
    padding: 3px 6px;
  }

  .detail {
    margin: 2px 8px 8px 27px;
    padding: 8px 10px;
    border-radius: 10px;
    background: var(--ac-soft);
    font-size: 13px;
  }
  .detail.solo {
    margin: 10px 0 0;
  }
  .detail-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
    font-size: 14px;
  }
  .detail-head .run-name {
    font-weight: 500;
  }
  .detail-facts {
    display: flex;
    flex-wrap: wrap;
    gap: 2px 12px;
    color: var(--ac-fg2);
    font-size: 12.5px;
  }
  .detail-reason {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    margin-top: 6px;
    font-size: 12.5px;
    color: var(--ac-fg2);
    text-wrap: pretty;
  }
  .detail-reason.error {
    color: var(--ac-err);
  }
  .detail-reason ha-icon {
    --mdc-icon-size: 15px;
    flex: none;
    margin-top: 1px;
  }
  .lines {
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px solid var(--ac-div);
  }
  .line {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 2px 0;
  }
  .line .dot {
    width: 7px;
    height: 7px;
  }
  .line .line-name {
    flex: 1;
  }
  .line .line-state {
    font-size: 12px;
    color: var(--ac-fg2);
    flex: none;
  }
  .line .line-target {
    font-variant-numeric: tabular-nums;
    color: var(--ac-fg2);
    flex: none;
    min-width: 40px;
    text-align: right;
  }

  /* ---- covers ---------------------------------------------------------- */

  .area {
    font-size: 12px;
    font-weight: 600;
    color: var(--ac-fg2);
    margin: 12px 0 2px;
  }
  .area:first-of-type {
    margin-top: 0;
  }
  .rows {
    margin: 0 -8px -6px;
  }
  .cover {
    display: flex;
    align-items: center;
    gap: 4px;
    border-radius: 10px;
    padding-right: 8px;
  }
  .cover-main {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
    min-width: 0;
    padding: 7px 4px 7px 8px;
    border: none;
    border-radius: 10px;
    background: none;
    text-align: left;
  }
  .cover-main:hover {
    background: var(--ac-soft);
  }
  .cover-text {
    flex: 1;
    min-width: 0;
  }
  .cover-name {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 14px;
  }
  .cover-name .pos {
    font-size: 13px;
    color: var(--ac-fg2);
    font-variant-numeric: tabular-nums;
    flex: none;
  }
  .cover-sub {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 2px 10px;
    font-size: 12.5px;
    color: var(--ac-fg2);
    font-variant-numeric: tabular-nums;
    margin-top: 1px;
  }
  .cover-sub span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .cover-sub ha-icon {
    --mdc-icon-size: 14px;
    flex: none;
  }
  .cover-sub .warn {
    color: var(--ac-warn);
  }
  .cover-sub .err {
    color: var(--ac-err);
  }

  /* A little window: the shade hangs from the top as far as the cover is
     closed, so 100 % (open) is an empty frame and 0 % a full one. */
  .glyph {
    position: relative;
    width: 30px;
    height: 30px;
    flex: none;
    border-radius: 6px;
    border: 1.5px solid color-mix(in srgb, var(--ac-fg2) 70%, transparent);
    background: var(--ac-soft);
    overflow: hidden;
  }
  .glyph .shade {
    position: absolute;
    inset: 0 0 auto 0;
    height: var(--closed, 0%);
    background: repeating-linear-gradient(
      to bottom,
      var(--ac-pri) 0 3px,
      color-mix(in srgb, var(--ac-pri) 55%, transparent) 3px 4.5px
    );
    transition: height 0.4s ease;
  }
  .glyph.moving .shade {
    animation: ac-pulse 1.2s ease-in-out infinite;
  }
  .glyph.unknown {
    border-style: dashed;
  }
  .glyph.off {
    border-color: color-mix(in srgb, var(--ac-off) 60%, transparent);
  }
  .glyph.off .shade {
    background: repeating-linear-gradient(
      to bottom,
      var(--ac-off) 0 3px,
      color-mix(in srgb, var(--ac-off) 55%, transparent) 3px 4.5px
    );
  }
  @keyframes ac-pulse {
    50% {
      opacity: 0.45;
    }
  }

  /* Per-cover automation switch. */
  .auto {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    flex: none;
    border-radius: 10px;
    border: 1px solid var(--ac-div);
    background: none;
    color: var(--ac-off);
    --mdc-icon-size: 19px;
  }
  .auto.on {
    color: var(--ac-pri);
    background: var(--ac-tint);
    border-color: color-mix(in srgb, var(--ac-pri) 40%, transparent);
  }
  .auto:hover:not(:disabled) {
    filter: brightness(1.15);
  }
  :host([data-narrow]) .auto {
    width: 32px;
  }

  .ctrl {
    display: inline-flex;
    flex: none;
    border: 1px solid var(--ac-div);
    border-radius: 10px;
    overflow: hidden;
  }
  .ctrl button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 34px;
    padding: 0;
    border: none;
    background: none;
    color: var(--ac-fg);
    --mdc-icon-size: 19px;
  }
  .ctrl button + button {
    border-left: 1px solid var(--ac-div);
  }
  .ctrl button:hover:not(:disabled) {
    background: var(--ac-soft);
  }
  .ctrl button:active:not(:disabled) {
    background: var(--ac-tint);
    color: var(--ac-pri);
  }
  :host([data-narrow]) .ctrl button {
    width: 32px;
  }

  /* ---- scenarios ------------------------------------------------------- */

  .scn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 7px 8px;
    border-radius: 10px;
  }
  .scn-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--ac-warnT);
    color: var(--ac-warn);
    flex: none;
    --mdc-icon-size: 18px;
  }
  .scn-icon.time {
    background: var(--ac-tint);
    color: var(--ac-pri);
  }
  .scn.muted .scn-icon {
    background: var(--ac-soft);
    color: var(--ac-off);
  }
  .scn.muted .scn-name {
    color: var(--ac-fg2);
  }
  .scn-text {
    flex: 1;
    min-width: 0;
  }
  .scn-name {
    font-size: 14px;
  }
  .scn-sub {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 2px 6px;
    font-size: 12.5px;
    color: var(--ac-fg2);
    font-variant-numeric: tabular-nums;
    margin-top: 1px;
  }
  /* The separator belongs to the item it introduces, so a wrapped line never
     ends on a dangling dot. */
  .scn-sub > span + span::before {
    content: "·";
    margin-right: 6px;
    color: var(--ac-fg2);
    opacity: 0.6;
  }
  /* Narrow rows wrap anyway; a wider gap separates better than dots that
     end up leading a line. */
  :host([data-narrow]) .scn-sub {
    gap: 0 12px;
  }
  :host([data-narrow]) .scn-sub > span + span::before {
    content: none;
  }
  /* While the row asks "Run?", the target makes way for the two buttons. */
  .scn.armed .scn-sub .tgt {
    display: none;
  }
  .scn-sub .ok {
    color: var(--ac-ok);
  }
  .scn-sub .warn {
    color: var(--ac-warn);
  }
  .scn-sub .err {
    color: var(--ac-err);
  }
  .play {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 50%;
    border: 1px solid var(--ac-div);
    background: none;
    color: var(--ac-pri);
    flex: none;
    --mdc-icon-size: 20px;
    transition:
      background 0.15s ease,
      border-color 0.15s ease;
  }
  .play:hover:not(:disabled) {
    background: var(--ac-tint);
    border-color: color-mix(in srgb, var(--ac-pri) 45%, transparent);
  }
  .scn-confirm {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    flex: none;
  }
  .spin {
    animation: ac-spin 1s linear infinite;
  }
  @keyframes ac-spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* ---- compact tile ---------------------------------------------------- */

  .tile {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    height: 100%;
    min-height: 54px;
    line-height: 1.3;
  }
  .tile-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--ac-tint);
    color: var(--ac-pri);
    flex: none;
    --mdc-icon-size: 20px;
  }
  .tile.off .tile-icon {
    background: var(--ac-soft);
    color: var(--ac-off);
  }
  .tile.warn .tile-icon {
    background: var(--ac-warnT);
    color: var(--ac-warn);
  }
  .tile-text {
    flex: 1;
    min-width: 0;
  }
  .tile-title {
    font-size: 14px;
    font-weight: 500;
  }
  .tile-sub {
    font-size: 12.5px;
    color: var(--ac-fg2);
    font-variant-numeric: tabular-nums;
  }

  @media (prefers-reduced-motion: reduce) {
    .spin,
    .glyph.moving .shade,
    .tl-now-dot {
      animation: none;
    }
  }
`;
