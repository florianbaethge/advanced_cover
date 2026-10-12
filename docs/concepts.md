# Concepts

[← Back to the README](../README.md)

What covers and scenarios are is explained in the [README](../README.md#how-it-works). This page covers the two things worth knowing beyond that: which conditions exist, and the rules the integration never bends.

## Conditions (curated, AND-only)

| Type | Sentence |
|---|---|
| Entity state | "Only if `input_select.weather` is **sunny** or **partly_sunny**" |
| Entity state NOT | "Only if `binary_sensor.wind_alarm` is NOT **on**" |
| Cover position | "Only if this cover is currently **above 5 %** open" |
| Window contact | "Only if the contact is **closed** or **tilted**" |
| Numeric value | "Only if `sensor.lux` is **above 40000**" |

There is deliberately no AND/OR builder: within a scenario everything is AND; for OR you create a second scenario with the same trigger. This keeps configuration readable instead of turning it into programming.

Conditions are evaluated **per cover**, not per scenario — see the [FAQ](faq.md) for what that means when one scenario drives several windows.

## Design principles

- **Fail-safe** — unavailable entities make conditions fail and moves are skipped with a reason; the integration never moves a cover "just in case".
- **At most once per day** — each (scenario, cover) pair executes at most once per day. Flap protection belongs into your helpers (see recipes), ping-pong is impossible by construction.
- **Idempotent** — `min position delta` skips moves when the cover is already close enough to the target (protects motors, avoids twitching after restarts).
- **Deterministic** — the full day plan including random offsets is computed at midnight, seeded with date + scenario id. The Today tab shows exact times; a restart re-enters open re-arm windows instead of losing them.
- **Restart-proof** — today's outcomes and the action log are persisted, so a Home Assistant restart neither wipes the day's history nor re-reports fired scenarios as "expired".
- **Safety rule, not disableable** — with an open contact, automatic closing below the ventilation position is blocked (or clamped). Tilted does not block by default (configurable per cover). Opening and manual control are never restricted. Whether a blocked move stays put, still closes to the ventilation position, or — as an explicit per-scenario opt-in — closes fully despite the open window (e.g. a night close) can be chosen per scenario and overridden per assignment; within the re-arm window a cover that was stopped by the rule retries as soon as the window is closed — whether it stayed put or was clamped to the ventilation position, it then goes to the scenario's full target.
