# Recipes

[← Back to the README](../README.md)

## A stable sunshine helper (recommended pattern)

Advanced Cover deliberately does **not** debounce flapping signals — that belongs into the helper. Build one once and reuse it everywhere:

1. Create a [threshold sensor](https://www.home-assistant.io/integrations/threshold/) on your lux/solar sensor with a generous **hysteresis** (e.g. upper 40000 lx, hysteresis 10000).
2. Optionally wrap it in a [template binary sensor with `delay_on`/`delay_off`](https://www.home-assistant.io/integrations/template/) of a few minutes.
3. Use that helper in an *entity state* condition ("Only if `binary_sensor.sunny` is `on`").

## "Close at 13:00 when sunny — or when the sun comes later"

Scenario: trigger 13:00, condition `weather helper is sunny`, re-arm window 4 h, action 0 %.
At 13:00 cloudy → the assignment arms and waits. Helper switches to sunny at 13:37 → covers close at 13:37. Never sunny until 17:00 → expired, nothing happens.

## "…and open again when it clouds over"

No auto-revert by design. Model it as a second, opposite scenario:
trigger 13:00, re-arm until 18:00, condition `weather helper is cloudy`, **cover condition "position below 85 %"** (so it only opens what the sun scenario closed), action 100 %.
Two opposite scenarios with at-most-once-per-day can each fire once — ping-pong is impossible.

## Sun protection only in the warm months

Set the scenario's **time of year** to e.g. 1 Apr – 15 Oct (both days included), or add several periods — 1 Apr – 31 May plus 3 Sep – 12 Oct — of which any one is enough. Outside them the scenario is not planned at all — no daily "skipped" entries in the log — while "Run now" keeps working. A start after the end (15 Oct – 31 Mar) runs across the turn of the year and makes a winter scenario.

## The baby-room rule ("don't touch a manually closed cover")

Add the cover-position condition "only if position **above 5 %**" to the assignment. A cover that was manually closed (≤ 5 %) is skipped. Position conditions never re-arm, so opening the cover by hand later will not trigger a surprise run.

## Presence simulation while away

Give your evening close scenario a random window of ±30 min and add the condition "`input_boolean.vacation` is on" to a duplicate with a wider window — the seeded randomness makes each day different but each *plan* stable.

## Awnings

Create the cover with kind *Awning*. HA convention: **open = extended**. "Extend at 13:00 when sunny" and "retract at sunset" are ordinary scenarios. Wind protection is intentionally out of scope — keep the manufacturer's wind automation active and optionally add a condition "only if `binary_sensor.wind_alarm` is off".
