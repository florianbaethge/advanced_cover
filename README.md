[![CI](https://github.com/florianbaethge/advanced_cover/actions/workflows/ci.yml/badge.svg)](https://github.com/florianbaethge/advanced_cover/actions/workflows/ci.yml)
[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://hacs.xyz)
[![License: MIT](https://img.shields.io/github/license/florianbaethge/advanced_cover)](https://github.com/florianbaethge/advanced_cover/blob/main/LICENSE)

<p align="center">
  <img
    src="https://raw.githubusercontent.com/florianbaethge/advanced_cover/main/screenshots/advanced_cover_logo.png"
    alt="Advanced Cover"
    width="760"
  >
</p>

Rule-based, scenario-driven automation for covers (shutters, venetian blinds, awnings, curtains, shades) in Home Assistant — with its own sidebar panel.

- **Scenarios instead of automations** — one trigger, curated sentence-builder conditions, per-cover assignments with overrides
- **Re-arm window** — "at 13:00 if sunny" also fires when the sun arrives at 13:37 (event-driven, no polling, at most once per day)
- **Built-in safety rule** — an open window is never fully shut by automation, unless a scenario explicitly overrides it (e.g. a night close)
- **Deterministic day plan** — random offsets are rolled once per day; restarts change nothing
- **Complete configuration in the GUI** — Today · Covers · Scenarios · Log, no YAML
- **Pure orchestrator** — drives only existing HA entities; weather/presence signals come from *your* helpers

## Contents

- [How it works](#how-it-works)
- [The panel](#the-panel)
- [Dashboard card](#dashboard-card)
- [Installation](#installation)
- [Entities](#entities)
- [Services](#services)
- [Events](#events)
- [Documentation](#documentation)
- [Debug logging](#debug-logging)
- [Development](#development)

## How it works

You build two things in the panel — **covers** and **scenarios** — and Advanced Cover turns them into a deterministic daily plan.

- **A cover** links one of your existing cover entities and adds what automation needs: its **facing** (azimuth, for sun-protection logic), an optional **window / contact sensor** with a built-in safety rule, an optional **low / discreet drive** (a slower, quieter motor path or a script), plus automatic capability detection (position / tilt / open-close only).
- **A scenario** is one rule: a **trigger** at a fixed time or relative to the sun (sunrise / sunset / solar noon, ± offset, optional random window), limited to chosen **weekdays** and optional **times of year** (e.g. 1 Apr – 15 Oct, several periods, also across New Year), optional **"only if" conditions**, a **target** position and tilt, and the **covers** it applies to — each cover with optional extra conditions and overrides.

Advanced Cover brings no sensors of its own — no weather service, no presence detection, no lux. It **orchestrates the cover entities you already have**, driven by signals from helpers you already trust (a weather `input_select`, a presence `input_boolean`, a lux threshold sensor). Conditions are evaluated against the *current* state at trigger time. The one deliberate exception is the **re-arm window**: a scenario that just missed its conditions stays **armed** and re-checks whenever a failing entity changes — event-driven, no polling, at most once per day.

More on conditions and the design principles behind all this: [Concepts](https://github.com/florianbaethge/advanced_cover/blob/main/docs/concepts.md).

## The panel

| Tab | Purpose |
|---|---|
| **Today** | 0–24 h timeline of the day plan with live status per action (planned / executed / skipped / waiting / blocked), master switch, recalculate, sun times |
| **Covers** | Manage covers: capability detection (position / tilt / open-close only), low mode, window contact with state mapping, safety options, test buttons ▲ ■ ▼ |
| **Scenarios** | The accordion editor: When (time/sun ± offset, random window, weekdays, time of year, re-arm) · Only if (sentence conditions) · Then (position, tilt, mode) · Covers (assignments, extra conditions, overrides) |
| **Log** | Every execution, skip, wait and block with its reason |

<p align="center">
  <img src="https://raw.githubusercontent.com/florianbaethge/advanced_cover/main/screenshots/today.png" alt="Today tab — day timeline and today's plan" width="560">
</p>

All tabs and both editors with screenshots: [The panel](https://github.com/florianbaethge/advanced_cover/blob/main/docs/panel.md).

## Dashboard card

`custom:advanced-cover-card` brings the day onto your dashboards — for everyone in the household, not only administrators. It is registered automatically and has a visual editor. You pick the **sections** it shows and their order:

| Section | Shows |
|---|---|
| `next` | The next scenario with countdown, target and live check, plus buttons to run it now or pause the automation |
| `timeline` | The Today tab's day and night strip with every run of the day |
| `covers` | Position, window contact and next action per cover, with open / stop / close |
| `scenarios` | Every scenario with today's status and a button to run it by hand |

<p align="center">
  <img src="https://raw.githubusercontent.com/florianbaethge/advanced_cover/main/screenshots/card_next.png" alt="Card — next up section" width="380">
  <img src="https://raw.githubusercontent.com/florianbaethge/advanced_cover/main/screenshots/card_covers.png" alt="Card — covers section" width="380">
</p>

```yaml
type: custom:advanced-cover-card
sections: [next, timeline, covers, scenarios]
```

All options, the compact tile and more screenshots: [Dashboard card](https://github.com/florianbaethge/advanced_cover/blob/main/docs/card.md).

## Installation

### HACS (custom repository)

1. HACS → Integrations → ⋮ → *Custom repositories* → add this repo as *Integration*.
2. Install **Advanced Cover** and restart Home Assistant.
3. Settings → Devices & services → *Add integration* → **Advanced Cover**.
4. Open **Advanced Cover** in the sidebar and configure covers and scenarios.

### Manual

Copy `custom_components/advanced_cover` into your `config/custom_components/` folder and restart.

## Entities

| Entity | Purpose |
|---|---|
| `switch.<entry>_automation` | Master switch per entry |
| `switch.<cover>_automation` | Per-cover automation on/off |
| `sensor.<entry>_next_action` | Next planned action across all covers |
| `sensor.<cover>_next_action` | Next action for one cover (attributes: scenario, target position, armed state) |
| `binary_sensor.<cover>_safety_blocked` | On while the safety rule would block closing |

## Services

All services accept an optional `config_entry_id` (needed only with multiple entries). Called by a user (rather than an automation), `run_scenario`, `run_scenario_for_cover` and `set_cover_enabled` ask for that user's control permission on the covers involved, as the entities themselves would.

| Service | Purpose |
|---|---|
| `advanced_cover.run_scenario` | Run a scenario now (`ignore_conditions` optional) |
| `advanced_cover.run_scenario_for_cover` | Run a scenario for a single cover |
| `advanced_cover.recalculate_schedule` | Rebuild today's plan |
| `advanced_cover.set_cover_enabled` | Toggle per-cover automation from automations |

## Events

`advanced_cover_action` fires for every outcome with `config_entry_id`, `scenario_id`, `cover_item_id`, `result` (`executed` / `skipped` / `armed` / `expired` / `blocked_safety` / `unavailable`) and `reason` — ideal for notifications ("bedroom cover was blocked: window open").

## Documentation

| Page | Content |
|---|---|
| [Concepts](https://github.com/florianbaethge/advanced_cover/blob/main/docs/concepts.md) | Covers and scenarios, the condition types, design principles (fail-safe, at most once per day, safety rule) |
| [The panel](https://github.com/florianbaethge/advanced_cover/blob/main/docs/panel.md) | The four tabs and the cover and scenario editors, with screenshots |
| [Dashboard card](https://github.com/florianbaethge/advanced_cover/blob/main/docs/card.md) | Sections, all options, compact layout, visual editor |
| [Recipes](https://github.com/florianbaethge/advanced_cover/blob/main/docs/recipes.md) | Sunshine helper, "close when sunny — or later", seasons, the baby-room rule, presence simulation, awnings |
| [FAQ](https://github.com/florianbaethge/advanced_cover/blob/main/docs/faq.md) | Low mode, conflicting scenarios, manual movements, per-cover conditions, "Ignore conditions" |

## Debug logging

```yaml
logger:
  logs:
    custom_components.advanced_cover: debug
```

The day plan, re-arm states and the action log are volatile by design (rebuilt at midnight and on restart; open re-arm windows are re-entered). Download diagnostics from the integration page to inspect the full state.

## Development

```bash
# Backend tests (CI installs pytest-homeassistant-custom-component)
pip install -r requirements_test.txt
pytest tests/

# Panel and card
cd custom_components/advanced_cover/frontend
npm ci
npm run build   # writes dist/advanced-cover-panel.js and dist/advanced-cover-card.js (committed)
npm test
```

CI runs ruff (lint + format), pytest, the frontend build and its unit tests, hassfest and HACS validation. The screenshots are regenerated with `scripts/make_screenshots.js` (panel) and `scripts/make_card_screenshots.js` (card) against a sandbox Home Assistant.

## License

MIT © Florian Bäthge
