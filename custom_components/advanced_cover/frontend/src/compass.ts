import { css, html, type TemplateResult } from "lit";

import { COMPASS } from "./azimuth";

export { COMPASS, COMPASS_BY_DEG, formatAzimuth, nearestCompassDeg } from "./azimuth";

/**
 * Compass widget: eight direction buttons arranged in a circle around the
 * current azimuth value. Spatially readable, with the number field as a
 * fallback for arbitrary degrees.
 */
export function renderCompass(
  azimuth: number | null,
  onSelect: (deg: number | null) => void
): TemplateResult {
  const r = 62; // radius in px
  return html`
    <div class="compass" role="group" aria-label="Azimuth">
      ${COMPASS.map(([label, deg]) => {
        // 0° = North at the top; clockwise. Screen y grows downward.
        const rad = ((deg - 90) * Math.PI) / 180;
        const x = Math.cos(rad) * r;
        const y = Math.sin(rad) * r;
        return html`<button
          type="button"
          class="compass-point ${azimuth === deg ? "selected" : ""}"
          style="transform:translate(calc(-50% + ${x}px), calc(-50% + ${y}px))"
          @click=${() => onSelect(deg)}
        >
          ${label}
        </button>`;
      })}
      <div class="compass-center">
        ${azimuth == null ? "–" : `${azimuth}°`}
      </div>
    </div>
  `;
}

export const compassStyles = css`
  .compass {
    position: relative;
    width: 168px;
    height: 168px;
    margin: 4px auto 8px;
  }
  .compass-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: var(--primary-text-color);
    width: 46px;
    height: 46px;
    border-radius: 50%;
    border: 1px solid var(--divider-color);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .compass-point {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 1px solid var(--divider-color);
    background: var(--card-background-color);
    color: var(--secondary-text-color);
    font: inherit;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .compass-point:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
  .compass-point.selected {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
    border-color: var(--primary-color);
  }
`;
