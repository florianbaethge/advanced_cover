#!/usr/bin/env node
/*
 * Regenerate the panel screenshots in ../screenshots.
 *
 * Renders the Advanced Cover panel headless (system Chrome via puppeteer-core),
 * authenticated with a Home Assistant long-lived access token, and writes tight,
 * sidebar-free PNGs for each tab plus the cover/scenario editors (the scenario
 * editor twice: as the collapsed overview and with its "When" section open).
 *
 * Prerequisites:
 *   - A sandbox HA reachable at HA_URL with a "Demo" Advanced Cover entry that
 *     has a few covers and scenarios configured.
 *   - Google Chrome installed (override with CHROME_PATH).
 *   - npm i puppeteer-core
 *
 * Usage:
 *   HA_URL=http://localhost:8123 \
 *   HA_TOKEN=<long-lived-access-token> \
 *   AC_ENTRY=<config-entry-id> \
 *   node scripts/make_screenshots.js [outDir]
 *
 * The config-entry id is the ULID in the panel URL:
 *   /advanced-cover/<AC_ENTRY>/today
 */
const path = require("path");
const puppeteer = require("puppeteer-core");

const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = process.env.HA_URL || "http://localhost:8123";
const TOKEN = process.env.HA_TOKEN;
const ENTRY = process.env.AC_ENTRY;
const OUT = process.argv[2] || path.join(__dirname, "..", "screenshots");

if (!TOKEN || !ENTRY) {
  console.error("Set HA_TOKEN and AC_ENTRY (see header comment).");
  process.exit(1);
}

const walkSrc = `function* walk(root){const els=root.querySelectorAll('*');for(const e of els){yield e;if(e.shadowRoot)yield* walk(e.shadowRoot);}}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForView(page, tag, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const ok = await page.evaluate(
      (t, ws) => {
        eval(ws);
        for (const e of walk(document)) if (e.tagName === t) return true;
        return false;
      },
      tag,
      walkSrc
    );
    if (ok) return true;
    await sleep(250);
  }
  return false;
}

// Remove modal scrims / stray overlays before a list screenshot.
async function stripOverlays(page) {
  await page.evaluate((ws) => {
    eval(ws);
    const kill = [];
    for (const e of walk(document)) {
      const tg = (e.tagName || "").toLowerCase();
      const cls = "" + (e.className || "");
      if (/dialog|scrim|backdrop|overlay/.test(tg) || /scrim|backdrop|overlay/.test(cls))
        kill.push(e);
      try {
        const st = getComputedStyle(e);
        if (st && st.position === "fixed" && parseFloat(st.zIndex) >= 1 && /rgba\(0, 0, 0/.test(st.backgroundColor))
          kill.push(e);
      } catch (_) {}
    }
    kill.forEach((e) => {
      try {
        e.remove();
      } catch (_) {}
    });
  }, walkSrc);
}

// Clip to the panel header + the tallest stacked cards (no trailing whitespace).
//
// `maxHeight` caps the result for views that grow without bound — the log card
// is as tall as the action history, which is neither readable nor a sensible
// README image once the sandbox has a few hundred rows.
async function clipToContent(page, file, maxHeight) {
  await page.waitForFunction(
    (ws) => {
      eval(ws);
      for (const e of walk(document)) if (e.tagName === "ADVANCED-COVER-PANEL") return true;
      return false;
    },
    { timeout: 10000 },
    walkSrc
  );
  const box = await page.evaluate((ws) => {
    eval(ws);
    let panel = null,
      view = null;
    for (const e of walk(document)) {
      if (e.tagName === "ADVANCED-COVER-PANEL") panel = e;
      if (e.tagName && e.tagName.startsWith("AC-VIEW-")) view = e;
    }
    const vh = window.innerHeight;
    let bottom = 110;
    const hdr = panel.shadowRoot && panel.shadowRoot.querySelector(".header");
    if (hdr) bottom = Math.max(bottom, hdr.getBoundingClientRect().bottom);
    if (view && view.shadowRoot) {
      for (const c of view.shadowRoot.querySelectorAll("*")) {
        const r = c.getBoundingClientRect();
        if (r.width < 200 || r.height < 24) continue;
        // Skip full-height layout wrappers — but never the card itself, which
        // legitimately outgrows the viewport on a long log.
        if (r.height >= vh * 0.85 && c.tagName !== "HA-CARD") continue;
        const st = getComputedStyle(c);
        const m = (st.backgroundColor || "").match(/rgba?\(([^)]+)\)/);
        let a = 1;
        if (m) {
          const parts = m[1].split(",").map((x) => parseFloat(x));
          if (parts.length === 4) a = parts[3];
        }
        const rad = parseFloat(st.borderTopLeftRadius) || 0;
        if (a > 0.02 && rad >= 8) bottom = Math.max(bottom, r.bottom);
      }
    }
    return { x: 0, y: 0, width: Math.round(panel.getBoundingClientRect().width), height: Math.round(bottom + 16) };
  }, walkSrc);
  if (maxHeight && box.height > maxHeight) box.height = maxHeight;
  await page.screenshot({ path: path.join(OUT, file), clip: box });
  return box;
}

// Open an editor dialog, unlock its inner scroll and clip to the full form.
//
// The scenario editor is an accordion that opens as four collapsed summaries;
// `section` unfolds one of them ("when" | "only_if" | "then" | "covers") and
// `option` one of its option chips (e.g. "period").
async function editorShot(page, viewTag, itemName, file, { section = null, option = null } = {}) {
  await page.evaluate(
    (vt, name, sec, opt, ws) => {
      eval(ws);
      let view = null;
      for (const e of walk(document)) if (e.tagName === vt) view = e;
      const list = vt === "AC-VIEW-COVERS" ? view.snapshot.covers : view.snapshot.scenarios;
      view._openEdit(list.find((x) => x.name === name) || list[0]);
      view._openSection = sec;
      view._openOption = opt;
      view.requestUpdate();
    },
    viewTag,
    itemName,
    section,
    option,
    walkSrc
  );
  await sleep(900);
  const box = await page.evaluate(
    (vt, ws) => {
      eval(ws);
      let view = null;
      for (const e of walk(document)) if (e.tagName === vt) view = e;
      const sr = view.shadowRoot;
      const backdrop = sr.querySelector(".dialog-backdrop");
      const dialog = sr.querySelector(".dialog");
      const scroll = sr.querySelector(".dialog-scroll");
      if (backdrop) {
        backdrop.style.alignItems = "flex-start";
        backdrop.style.padding = "20px";
        backdrop.style.overflow = "visible";
      }
      if (scroll) {
        scroll.style.maxHeight = "none";
        scroll.style.overflow = "visible";
      }
      if (dialog) dialog.style.maxHeight = "none";
      const r = dialog.getBoundingClientRect();
      return {
        x: Math.max(0, Math.round(r.left) - 8),
        y: Math.max(0, Math.round(r.top) - 8),
        width: Math.round(r.width) + 16,
        height: Math.round(r.height) + 16,
      };
    },
    viewTag,
    walkSrc
  );
  await sleep(300);
  await page.screenshot({ path: path.join(OUT, file), clip: box });
  return box;
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu", "--force-color-profile=srgb"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 900, height: 1000, deviceScaleFactor: 2 });
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.evaluate(
    (base, token) => {
      localStorage.setItem(
        "hassTokens",
        JSON.stringify({
          access_token: token,
          token_type: "Bearer",
          expires_in: 315360000,
          hassUrl: base,
          clientId: null,
          expires: 4102444800000,
          refresh_token: null,
        })
      );
      localStorage.setItem("dockedSidebar", '"always_hidden"');
      localStorage.setItem("selectedLanguage", '"en"');
    },
    BASE,
    TOKEN
  );

  const tabs = [
    { file: "today.png", page: "today", view: "AC-VIEW-TODAY" },
    { file: "covers.png", page: "covers", view: "AC-VIEW-COVERS" },
    { file: "scenarios.png", page: "scenarios", view: "AC-VIEW-SCENARIOS" },
    { file: "log.png", page: "log", view: "AC-VIEW-LOG", maxHeight: 820 },
  ];
  for (const t of tabs) {
    await page.setViewport({ width: 900, height: t.maxHeight ? 1200 : 1000, deviceScaleFactor: 2 });
    await page.goto(`${BASE}/advanced-cover/${ENTRY}/${t.page}`, { waitUntil: "networkidle2", timeout: 30000 });
    await waitForView(page, t.view);
    await sleep(1200);
    await stripOverlays(page);
    await sleep(150);
    const box = await clipToContent(page, t.file, t.maxHeight);
    console.log(t.file, JSON.stringify(box));
  }

  await page.setViewport({ width: 900, height: 2200, deviceScaleFactor: 2 });
  await page.goto(`${BASE}/advanced-cover/${ENTRY}/covers`, { waitUntil: "networkidle2", timeout: 30000 });
  await waitForView(page, "AC-VIEW-COVERS");
  await sleep(1000);
  console.log("cover_edit.png", JSON.stringify(await editorShot(page, "AC-VIEW-COVERS", "Living Room", "cover_edit.png")));

  await page.setViewport({ width: 900, height: 2600, deviceScaleFactor: 2 });
  await page.goto(`${BASE}/advanced-cover/${ENTRY}/scenarios`, { waitUntil: "networkidle2", timeout: 30000 });
  await waitForView(page, "AC-VIEW-SCENARIOS");
  await sleep(1000);
  console.log("scenario_edit.png", JSON.stringify(await editorShot(page, "AC-VIEW-SCENARIOS", "Midday shade", "scenario_edit.png")));
  console.log(
    "scenario_edit_when.png",
    JSON.stringify(
      await editorShot(page, "AC-VIEW-SCENARIOS", "Midday shade", "scenario_edit_when.png", {
        section: "when",
        option: "retry",
      })
    )
  );

  await browser.close();
})().catch((e) => {
  console.error("ERR", e.message);
  process.exit(1);
});
