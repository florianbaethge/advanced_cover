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

## How it works

You build two things in the panel — **covers** and **scenarios** — and Advanced Cover turns them into a deterministic daily plan.

- **A cover** links one of your existing cover entities and adds what automation needs: its **facing** (azimuth, for sun-protection logic), an optional **window / contact sensor** with a built-in safety rule, an optional **low / discreet drive** (a slower, quieter motor path or a script), plus automatic capability detection (position / tilt / open-close only).
- **A scenario** is one rule: a **trigger** at a fixed time or relative to the sun (sunrise / sunset / solar noon, ± offset, optional random window), limited to chosen **weekdays** and optional **times of year** (e.g. 1 Apr – 15 Oct, several periods, also across New Year), optional **"only if" conditions**, a **target** position and tilt, and the **covers** it applies to — each cover with optional extra conditions and overrides.

Advanced Cover brings no sensors of its own — no weather service, no presence detection, no lux. It **orchestrates the cover entities you already have**, driven by signals from helpers you already trust (a weather `input_select`, a presence `input_boolean`, a lux threshold sensor). Conditions are evaluated against the *current* state at trigger time. The one deliberate exception is the **re-arm window**: a scenario that just missed its conditions stays **armed** and re-checks whenever a failing entity changes — event-driven, no polling, at most once per day.

### The panel

| Tab | Purpose |
|---|---|
| **Today** | 0–24 h timeline of the day plan with live status per action (planned / executed / skipped / waiting / blocked), master switch, recalculate, sun times |
| **Covers** | Manage covers: capability detection (position / tilt / open-close only), low mode, window contact with state mapping, safety options, test buttons ▲ ■ ▼ |
| **Scenarios** | The accordion editor: When (time/sun ± offset, random window, weekdays, time of year, re-arm) · Only if (sentence conditions) · Then (position, tilt, mode) · Covers (assignments, extra conditions, overrides) |
| **Log** | Every execution, skip, wait and block with its reason |

### Conditions (curated, AND-only)

| Type | Sentence |
|---|---|
| Entity state | "Only if `input_select.weather` is **sunny** or **partly_sunny**" |
| Entity state NOT | "Only if `binary_sensor.wind_alarm` is NOT **on**" |
| Cover position | "Only if this cover is currently **above 5 %** open" |
| Window contact | "Only if the contact is **closed** or **tilted**" |
| Numeric value | "Only if `sensor.lux` is **above 40000**" |

There is deliberately no AND/OR builder: within a scenario everything is AND; for OR you create a second scenario with the same trigger. This keeps configuration readable instead of turning it into programming.

Conditions are evaluated **per cover**, not per scenario — see the FAQ below for what that means when one scenario drives several windows.

## Screenshots

**Today** — day timeline with live per-action status, master switch and sun times:

<p align="center">
  <img src="https://raw.githubusercontent.com/florianbaethge/advanced_cover/main/screenshots/today.png" alt="Today tab — day timeline and today's plan" width="560">
</p>

**Covers** — one row per cover with capability detection (position / tilt / open-close only), window contact, low mode and inline test buttons:

<p align="center">
  <img src="https://raw.githubusercontent.com/florianbaethge/advanced_cover/main/screenshots/covers.png" alt="Covers tab — cover list with capabilities and test buttons" width="560">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/florianbaethge/advanced_cover/main/screenshots/cover_edit.png" alt="Cover editor — capabilities, azimuth compass, low mode and window contact" width="380">
</p>

**Scenarios** — every rule with its trigger, sun-phase bar and target position; drag to set priority:

<p align="center">
  <img src="https://raw.githubusercontent.com/florianbaethge/advanced_cover/main/screenshots/scenarios.png" alt="Scenarios tab — scenario list" width="560">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/florianbaethge/advanced_cover/main/screenshots/scenario_edit.png" alt="Scenario editor — the four sections When, Only if, Then and Covers, each collapsed to a one-line summary" width="380">
  <img src="https://raw.githubusercontent.com/florianbaethge/advanced_cover/main/screenshots/scenario_edit_when.png" alt="Scenario editor — the When section unfolded, with its option chips" width="380">
</p>

The editor is an accordion: a scenario opens as four one-line summaries that read like a sentence (when … only if … then … for these covers), and one section unfolds at a time. Everything optional — random window, weekdays, time of year, re-arm window, mode, safety behavior — sits behind a chip that shows its current value, so the whole scenario fits on a phone screen.

**Log** — every execution, skip, wait and block with its reason:

<p align="center">
  <img src="https://raw.githubusercontent.com/florianbaethge/advanced_cover/main/screenshots/log.png" alt="Log tab — action log" width="560">
</p>

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

All services accept an optional `config_entry_id` (needed only with multiple entries).

| Service | Purpose |
|---|---|
| `advanced_cover.run_scenario` | Run a scenario now (`ignore_conditions` optional) |
| `advanced_cover.run_scenario_for_cover` | Run a scenario for a single cover |
| `advanced_cover.recalculate_schedule` | Rebuild today's plan |
| `advanced_cover.set_cover_enabled` | Toggle per-cover automation from automations |

## Events

`advanced_cover_action` fires for every outcome with `config_entry_id`, `scenario_id`, `cover_item_id`, `result` (`executed` / `skipped` / `armed` / `expired` / `blocked_safety` / `unavailable`) and `reason` — ideal for notifications ("bedroom cover was blocked: window open").

## Design principles

- **Fail-safe** — unavailable entities make conditions fail and moves are skipped with a reason; the integration never moves a cover "just in case".
- **At most once per day** — each (scenario, cover) pair executes at most once per day. Flap protection belongs into your helpers (see recipes), ping-pong is impossible by construction.
- **Idempotent** — `min position delta` skips moves when the cover is already close enough to the target (protects motors, avoids twitching after restarts).
- **Deterministic** — the full day plan including random offsets is computed at midnight, seeded with date + scenario id. The Today tab shows exact times; a restart re-enters open re-arm windows instead of losing them.
- **Restart-proof** — today's outcomes and the action log are persisted, so a Home Assistant restart neither wipes the day's history nor re-reports fired scenarios as "expired".
- **Safety rule, not disableable** — with an open contact, automatic closing below the ventilation position is blocked (or clamped). Tilted does not block by default (configurable per cover). Opening and manual control are never restricted. Whether a blocked move stays put, still closes to the ventilation position, or — as an explicit per-scenario opt-in — closes fully despite the open window (e.g. a night close) can be chosen per scenario and overridden per assignment; within the re-arm window a cover that was stopped by the rule retries as soon as the window is closed — whether it stayed put or was clamped to the ventilation position, it then goes to the scenario's full target.

## Recipes

### A stable sunshine helper (recommended pattern)

Advanced Cover deliberately does **not** debounce flapping signals — that belongs into the helper. Build one once and reuse it everywhere:

1. Create a [threshold sensor](https://www.home-assistant.io/integrations/threshold/) on your lux/solar sensor with a generous **hysteresis** (e.g. upper 40000 lx, hysteresis 10000).
2. Optionally wrap it in a [template binary sensor with `delay_on`/`delay_off`](https://www.home-assistant.io/integrations/template/) of a few minutes.
3. Use that helper in an *entity state* condition ("Only if `binary_sensor.sunny` is `on`").

### "Close at 13:00 when sunny — or when the sun comes later"

Scenario: trigger 13:00, condition `weather helper is sunny`, re-arm window 4 h, action 0 %.
At 13:00 cloudy → the assignment arms and waits. Helper switches to sunny at 13:37 → covers close at 13:37. Never sunny until 17:00 → expired, nothing happens.

### "…and open again when it clouds over"

No auto-revert by design. Model it as a second, opposite scenario:
trigger 13:00, re-arm until 18:00, condition `weather helper is cloudy`, **cover condition "position below 85 %"** (so it only opens what the sun scenario closed), action 100 %.
Two opposite scenarios with at-most-once-per-day can each fire once — ping-pong is impossible.

### Sun protection only in the warm months

Set the scenario's **time of year** to e.g. 1 Apr – 15 Oct (both days included), or add several periods — 1 Apr – 31 May plus 3 Sep – 12 Oct — of which any one is enough. Outside them the scenario is not planned at all — no daily "skipped" entries in the log — while "Run now" keeps working. A start after the end (15 Oct – 31 Mar) runs across the turn of the year and makes a winter scenario.

### The baby-room rule ("don't touch a manually closed cover")

Add the cover-position condition "only if position **above 5 %**" to the assignment. A cover that was manually closed (≤ 5 %) is skipped. Position conditions never re-arm, so opening the cover by hand later will not trigger a surprise run.

### Presence simulation while away

Give your evening close scenario a random window of ±30 min and add the condition "`input_boolean.vacation` is on" to a duplicate with a wider window — the seeded randomness makes each day different but each *plan* stable.

### Awnings

Create the cover with kind *Awning*. HA convention: **open = extended**. "Extend at 13:00 when sunny" and "retract at sunset" are ordinary scenarios. Wind protection is intentionally out of scope — keep the manufacturer's wind automation active and optionally add a condition "only if `binary_sensor.wind_alarm` is off".

## FAQ

**What happens when a scenario uses mode "Low" but the cover has no low-mode entity/script?**
The action simply runs on the normal cover entity — it never fails because of the mode. If both entity and script are configured, the script wins and receives the target position as variable `position`.

**Two scenarios hit the same cover in the same minute — who wins?**
They execute in panel list order (top first); the last executed action determines the final position. The conflict is logged.

**Does the integration fight manual movements?**
No. There is no manual-movement detection and cover-position conditions never re-arm. Use position conditions (baby-room rule) where manual overrides must be respected.

**One scenario drives several windows with a shared "only if window contact is closed" — does one open window skip everything?**
No. A scenario is a set of **independent per-cover actions**. Every condition — the scenario's "only if" and any per-cover condition — is evaluated **for each cover on its own**. A *window contact* condition uses that cover's own contact sensor, so "only if the contact is closed" skips only the covers whose window is open; the others still run (each logged with its reason). A condition on a *shared* entity (e.g. one weather helper) is identical for every cover, so it lets them all run or skips them all together. Often you don't even need the condition: the built-in **safety rule** already stops any single cover from closing past its ventilation position while its own window is open.

**What does the "Ignore conditions" checkbox next to "Run now" do?**
*Run now* fires the scenario immediately — a manual, ephemeral run that ignores the trigger time and never touches today's plan. Tick **Ignore conditions** to also bypass the "only if" checks, so every assigned cover moves to its target regardless of the current state — handy to preview positions or test a scenario at the "wrong" time of day. The safety rule still applies: an open window is never fully closed (unless the scenario's safety override says so).

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

# Panel
cd custom_components/advanced_cover/frontend
npm ci
npm run build   # writes dist/advanced-cover-panel.js (committed)
```

CI runs ruff (lint + format), pytest, the panel build, hassfest and HACS validation.

## License

MIT © Florian Bäthge
