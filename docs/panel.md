# The panel

[← Back to the README](../README.md)

Everything is configured in the **Advanced Cover** sidebar panel (admins only). It has four tabs:

| Tab | Purpose |
|---|---|
| **Today** | 0–24 h timeline of the day plan with live status per action (planned / executed / skipped / waiting / blocked), master switch, recalculate, sun times |
| **Covers** | Manage covers: capability detection (position / tilt / open-close only), low mode, window contact with state mapping, safety options, test buttons ▲ ■ ▼ |
| **Scenarios** | The accordion editor: When (time/sun ± offset, random window, weekdays, time of year, re-arm) · Only if (sentence conditions) · Then (position, tilt, mode) · Covers (assignments, extra conditions, overrides) |
| **Log** | Every execution, skip, wait and block with its reason |

## A tour

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
