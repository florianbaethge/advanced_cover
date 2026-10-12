# FAQ

[← Back to the README](../README.md)

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
