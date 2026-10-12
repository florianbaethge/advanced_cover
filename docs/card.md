# Dashboard card

[← Back to the README](../README.md)

The integration ships a Lovelace card, `custom:advanced-cover-card`, and registers it as a dashboard resource automatically — nothing to add under **Settings → Dashboards → Resources**. Pick it from the card picker as *Advanced Cover Card*.

The card is built from **sections** you switch on and put in order: one card can show everything, or four cards can each show one piece. Dropped on a dashboard with no options at all it shows *Next up* and the *Day timeline*:

```yaml
type: custom:advanced-cover-card
```

<p align="center">
  <img src="https://raw.githubusercontent.com/florianbaethge/advanced_cover/main/screenshots/card_all.png" alt="Advanced Cover card with all four sections: next up, day timeline, covers and scenarios" width="420">
</p>

## Contents

- [Sections](#sections)
- [Options](#options)
- [Compact layout](#compact-layout)
- [The visual editor](#the-visual-editor)
- [Who may do what](#who-may-do-what)
- [Layout and theming](#layout-and-theming)

## Sections

| Section | Shows |
|---|---|
| `next` | The next scenario of the day: time, countdown, trigger, how many covers go where, and the **live check** ("would run now" / "would be skipped now" with the reason). Buttons run it right away or pause the whole automation. Below: scenarios waiting in their re-arm window and the last run. |
| `timeline` | The day and night strip from the panel's Today tab with one marker per run, the now-line and re-arm windows. Tap a marker or a row to see what the run does for each cover. |
| `covers` | Every cover with its position, window contact, next action and open / stop / close buttons. Tap a row for the cover's own dialog (with the position slider). |
| `scenarios` | Every scenario with today's time and status and a button to run it by hand. |

### Next up

<p align="center">
  <img src="https://raw.githubusercontent.com/florianbaethge/advanced_cover/main/screenshots/card_next.png" alt="Next up section — next scenario with countdown, target and action buttons" width="420">
</p>

**Run now** runs the scenario as a manual, one-off run: it ignores the trigger time and does not touch today's plan — the scenario still fires at its planned time. With the automation switched off the section says so and offers to switch it back on; manual runs keep working either way.

### Day timeline

<p align="center">
  <img src="https://raw.githubusercontent.com/florianbaethge/advanced_cover/main/screenshots/card_timeline.png" alt="Day timeline section — runs on the day and night strip with a legend and the list of today's runs" width="420">
</p>

The colours match the panel: green ran, blue will run, amber would be skipped right now, grey was skipped or expired, a red ring marks a run where some covers ran and others were blocked. With `timeline_list: false` only the strip is shown, and a tapped marker opens its details below it.

### Covers

<p align="center">
  <img src="https://raw.githubusercontent.com/florianbaethge/advanced_cover/main/screenshots/card_covers.png" alt="Covers section — position glyph, next action and open, stop, close buttons per cover" width="420">
</p>

The little window shows how far each cover is closed (an awning the other way round: its fabric grows as it extends). The line below names the next action today, a re-arm window the cover is waiting in, an open or tilted window, or that the cover's automation is off. The buttons drive the cover directly, exactly like the test buttons in the panel — including a cover's *low mode for manual control*. They are not scenario runs, so the safety rule does not apply to them.

### Scenarios

<p align="center">
  <img src="https://raw.githubusercontent.com/florianbaethge/advanced_cover/main/screenshots/card_scenarios.png" alt="Scenarios section — every scenario with today's status and a run button" width="420">
</p>

The first tap on ▶ turns the button into **Run?**, the second one runs the scenario; after five seconds the question goes away by itself. Afterwards the row shows what happened per cover (*2× Executed · 1× Skipped*) for a few seconds. A manual run honors the scenario's conditions unless `ignore_conditions` is set — and the window safety rule in either case.

## Options

Every option is optional.

| Option | Default | Meaning |
|---|---|---|
| `entry_id` | the only entry | Which Advanced Cover entry to show |
| `title` | the entry's name | Header text |
| `sections` | `[next, timeline]` | Sections to show, in this order: `next` · `timeline` · `covers` · `scenarios` |
| `show_header` | `true` | Header with title, state pill and (for admins) the link into the panel |
| `compact` | `false` | One tile-style row with the next run instead of the sections |
| `next_actions` | `[run, toggle]` | Buttons of the *next* section: `run` (run now) · `toggle` (automation on/off) |
| `show_last_run` | `true` | The line with the last run in the *next* section |
| `timeline_list` | `true` | List today's runs below the strip |
| `timeline_legend` | `false` | Colour legend below the strip |
| `covers` | `all` | `all` or a list of cover ids |
| `group_by_area` | `true` | Group covers by their area (only when they sit in more than one) |
| `cover_controls` | `true` | Open / stop / close buttons |
| `scenarios` | `all` | `all` or a list of scenario ids |
| `confirm_run` | `true` | Ask before a manual run |
| `ignore_conditions` | `false` | Manual runs skip the scenario's conditions (the safety rule still applies) |

A fully specified card — this is what every option looks like, not what you need:

```yaml
type: custom:advanced-cover-card
title: Shutters
sections: [next, timeline, covers, scenarios]
show_header: true
next_actions: [run, toggle]
show_last_run: true
timeline_list: true
timeline_legend: true
covers: all
group_by_area: true
cover_controls: true
scenarios: all
confirm_run: true
ignore_conditions: false
```

Cover and scenario ids are easiest to pick in the visual editor, which writes them for you.

## Compact layout

```yaml
type: custom:advanced-cover-card
compact: true
```

<p align="center">
  <img src="https://raw.githubusercontent.com/florianbaethge/advanced_cover/main/screenshots/card_compact.png" alt="Compact layout — one tile-style row with the next run and a run button" width="420">
</p>

One row for a status area: the next run with its countdown and, unless `next_actions` leaves out `run`, the run button.

## The visual editor

<p align="center">
  <img src="https://raw.githubusercontent.com/florianbaethge/advanced_cover/main/screenshots/card_editor.png" alt="Card editor — sections with switches, order arrows and their options, next to the live preview" width="640">
</p>

Each section has a switch, arrows for its position and — once it is on — its own options right below. Options at their default are left out of the YAML, and so are the options of a section that is switched off.

## Who may do what

The card is meant for everyone in the household, so it works for users who are not administrators — like the switches, cover entities and services behind it. What it shows is today's plan and the live state of covers and scenarios; the configuration (conditions, wiring, safety settings) stays in the admin-only panel. The link into the panel in the card's header is only shown to administrators.

## Layout and theming

Colours come from the active theme, so the card follows light and dark mode and any custom theme. The layout follows the card's own width, not the screen's: below about 440 px the buttons of the *next* section move under the summary, below about 380 px lists drop detail, and from about 720 px on — a panel view or a full-width section — the sections sit side by side in two columns.
