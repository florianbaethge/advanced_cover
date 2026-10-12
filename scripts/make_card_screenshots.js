#!/usr/bin/env node
/*
 * Regenerate the Lovelace card screenshots in ../screenshots.
 *
 * Renders the "Advanced Cover card" demo dashboard headless (system Chrome via
 * puppeteer-core), authenticated with a Home Assistant long-lived access token,
 * and writes tight, 2x element screenshots of the card in its variations plus
 * the card configuration dialog.
 *
 * Sibling of make_screenshots.js, which covers the admin panel instead.
 *
 * Prerequisites:
 *   - A sandbox HA reachable at HA_URL with an Advanced Cover entry that has
 *     covers and scenarios, and a storage dashboard at url_path "ac-card" whose
 *     views hold the card in the configurations listed in SHOTS below (view
 *     path + index of the card among that view's Advanced Cover cards).
 *   - Google Chrome installed (override with CHROME_PATH).
 *   - npm i puppeteer-core
 *
 * Usage:
 *   HA_URL=http://localhost:8123 \
 *   HA_TOKEN=<long-lived-access-token> \
 *   node scripts/make_card_screenshots.js [outDir]
 *
 * Review mode — every view of the dashboard as one full-page image, for
 * checking all variations at a glance (AC_DARK=0 switches to the light theme):
 *   AC_REVIEW=1 AC_DARK=0 node scripts/make_card_screenshots.js /tmp/review
 */
const path = require("path");
const puppeteer = require("puppeteer-core");

const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = process.env.HA_URL || "http://localhost:8123";
const TOKEN = process.env.HA_TOKEN;
const DASH = process.env.AC_DASHBOARD || "ac-card";
const DARK = process.env.AC_DARK !== "0";
const REVIEW = Boolean(process.env.AC_REVIEW);
const OUT = process.argv[2] || path.join(__dirname, "..", "screenshots");

if (!TOKEN) {
  console.error("Set HA_TOKEN (see header comment).");
  process.exit(1);
}

/** view path · index among that view's cards · output file. */
const SHOTS = [
  ["overview", 1, "card_all.png"],
  ["next", 0, "card_next.png"],
  ["timeline", 1, "card_timeline.png"],
  ["covers", 0, "card_covers.png"],
  ["scenarios", 0, "card_scenarios.png"],
  ["compact", 0, "card_compact.png"],
];

/** Views captured whole in review mode, with the viewport width to use. */
const REVIEW_VIEWS = [
  ["overview", 520],
  ["next", 520],
  ["timeline", 520],
  ["covers", 520],
  ["scenarios", 520],
  ["compact", 520],
  ["wide", 1100],
  ["sections", 1400],
  ["overview", 340],
];

/** Single masonry column — see the note at first use. */
const CARD_VIEWPORT = 520;

const walkSrc = `function* walk(root){const els=root.querySelectorAll('*');for(const e of els){yield e;if(e.shadowRoot)yield* walk(e.shadowRoot);}}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * A fresh browser profile reloads the frontend once, a few seconds after its
 * first page load (the service worker takes over). Sit that out here, so it
 * cannot wipe a card's state halfway through a capture.
 */
async function warmUp(page, url) {
  await page.goto(url, { waitUntil: "networkidle0" });
  await new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer);
      page.off("framenavigated", onNav);
      resolve();
    };
    const onNav = (frame) => {
      if (frame === page.mainFrame()) done();
    };
    const timer = setTimeout(done, 12000);
    page.on("framenavigated", onNav);
  });
  await sleep(1500);
}

/** Bounding box (CSS px) of the nth Advanced Cover card on the page. */
async function cardBox(page, index) {
  return page.evaluate(
    (ws, i) => {
      eval(ws);
      const cards = [];
      for (const e of walk(document)) {
        if (e.tagName === "ADVANCED-COVER-CARD") cards.push(e);
      }
      const card = cards[i];
      if (!card || !card.shadowRoot) return null;
      const inner = card.shadowRoot.querySelector("ha-card");
      const r = (inner ?? card).getBoundingClientRect();
      if (r.height < 24) return null;
      return { x: r.x, y: r.y, width: r.width, height: r.height, n: cards.length };
    },
    walkSrc,
    index
  );
}

/** Wait until the nth card has a box, retrying while it re-renders. */
async function waitForCard(page, index, tries = 40) {
  for (let i = 0; i < tries; i++) {
    const box = await cardBox(page, index);
    if (box) return box;
    await sleep(250);
  }
  return null;
}

async function shootCard(page, view, index, file) {
  await page.goto(`${BASE}/${DASH}/${view}`, { waitUntil: "networkidle0" });
  let box = await waitForCard(page, index);
  if (!box) throw new Error(`card ${index} not found on view ${view}`);
  // The card renders once more when its first snapshot arrives.
  await sleep(900);
  box = (await waitForCard(page, index, 8)) ?? box;
  await page.screenshot({
    path: path.join(OUT, file),
    clip: { x: box.x, y: box.y, width: box.width, height: box.height },
  });
  console.log("wrote", file, `${Math.round(box.width)}×${Math.round(box.height)}`);
}

/** One full-page image of a whole dashboard view (review mode). */
async function shootView(page, view, width) {
  await page.setViewport({ width, height: 900, deviceScaleFactor: 2 });
  await page.goto(`${BASE}/${DASH}/${view}`, { waitUntil: "networkidle0" });
  if (!(await waitForCard(page, 0))) throw new Error(`no card on view ${view}`);
  await sleep(1200);
  // The dashboard scrolls inside the document; grow the viewport to its
  // content so one screenshot holds every card.
  const height = await page.evaluate(
    () => document.documentElement.scrollHeight
  );
  await page.setViewport({
    width,
    height: Math.min(Math.max(height, 900), 6000),
    deviceScaleFactor: 2,
  });
  await sleep(500);
  const file = `review_${view}_${width}.png`;
  await page.screenshot({ path: path.join(OUT, file) });
  console.log("wrote", file);
}

/**
 * Capture the card configuration dialog with its live preview. Best-effort: the
 * Lovelace edit flow is a little flaky headless, so a failure here only logs
 * and leaves the other screenshots intact.
 */
async function shootEditor(page, view, file) {
  // ?edit=1 drops the dashboard straight into edit mode (no menu clicks).
  await page.goto(`${BASE}/${DASH}/${view}?edit=1`, { waitUntil: "networkidle0" });
  await sleep(1800);
  // Click the "Edit" of the card options wrapper that actually holds an
  // Advanced Cover card — the markdown headers on the demo dashboard have one
  // too. .click() rather than a synthetic mouse click: the edit-mode overlay
  // swallows real pointer events.
  const clicked = await page.evaluate((ws) => {
    eval(ws);
    const holdsCard = (root) => {
      for (const e of walk(root)) {
        if (e.tagName === "ADVANCED-COVER-CARD") return true;
      }
      return false;
    };
    for (const wrapper of walk(document)) {
      if (wrapper.tagName !== "HUI-CARD-OPTIONS") continue;
      // The card sits in the wrapper's light DOM (slotted), the buttons in its
      // shadow root — so the two searches run over different trees.
      if (!holdsCard(wrapper)) continue;
      for (const e of walk(wrapper.shadowRoot ?? wrapper)) {
        if (!/HA-BUTTON|MWC-BUTTON|BUTTON/.test(e.tagName)) continue;
        if (!/^(edit|bearbeiten)$/i.test((e.textContent || "").trim())) continue;
        e.click();
        return true;
      }
    }
    return false;
  }, walkSrc);
  if (!clicked) throw new Error("card Edit button not found");
  let ok = false;
  for (let i = 0; i < 30 && !ok; i++) {
    await sleep(400);
    ok = await page.evaluate((ws) => {
      eval(ws);
      for (const e of walk(document))
        if (e.tagName === "ADVANCED-COVER-CARD-EDITOR") return true;
      return false;
    }, walkSrc);
  }
  if (!ok) throw new Error("card editor did not mount");
  // Let the dialog finish sliding in before measuring it.
  await sleep(1500);
  // Clip from the sheet's header down to the dialog's bottom edge. A clip is
  // in page coordinates while the dialog sits in the viewport, hence the
  // scroll offsets (and no scrolling to the Edit button above).
  const box = await page.evaluate((ws) => {
    eval(ws);
    let dialog = null;
    let header = null;
    for (const e of walk(document)) {
      const r = e.getBoundingClientRect();
      if (e.tagName === "HA-DIALOG-HEADER" && r.height > 0) header = r;
      if (e.tagName !== "DIALOG" || r.width < 200 || r.height < 120) continue;
      if (!dialog || r.width * r.height > dialog.width * dialog.height) dialog = r;
    }
    if (!dialog) return null;
    const top = header ? header.y : dialog.y;
    const bottom = Math.min(dialog.y + dialog.height, window.innerHeight);
    return {
      x: dialog.x + window.scrollX,
      y: top + window.scrollY,
      width: dialog.width,
      height: bottom - top,
    };
  }, walkSrc);
  await page.screenshot({
    path: path.join(OUT, file),
    captureBeyondViewport: false,
    ...(box ? { clip: { x: box.x, y: box.y, width: box.width, height: box.height } } : {}),
  });
  console.log("wrote", file);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: "new",
    args: ["--hide-scrollbars", "--force-color-profile=srgb"],
  });
  const page = await browser.newPage();
  page.on("pageerror", (err) => console.warn("page error:", err.message));
  // 520 px puts the masonry view into a single column, so every card is
  // captured at the ~500 px width a dashboard actually gives it.
  await page.setViewport({ width: CARD_VIEWPORT, height: 1200, deviceScaleFactor: 2 });
  await page.goto(BASE + "/manifest.json", { waitUntil: "domcontentloaded" });
  await page.evaluate(
    (base, token, dark) => {
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
      localStorage.setItem("selectedTheme", JSON.stringify({ dark }));
    },
    BASE,
    TOKEN,
    DARK
  );
  await warmUp(page, `${BASE}/${DASH}/${SHOTS[0][0]}`);

  if (REVIEW) {
    for (const [view, width] of REVIEW_VIEWS) {
      await shootView(page, view, width);
    }
    await page.setViewport({ width: 1100, height: 1500, deviceScaleFactor: 2 });
    try {
      await shootEditor(page, "overview", "review_editor.png");
    } catch (e) {
      console.warn("editor screenshot skipped:", e.message);
    }
    await browser.close();
    return;
  }

  for (const [view, index, file] of SHOTS) {
    await shootCard(page, view, index, file);
  }

  // The dialog needs room: it is a near-fullscreen panel with a live preview.
  await page.setViewport({ width: 1100, height: 1500, deviceScaleFactor: 2 });
  try {
    await shootEditor(page, "overview", "card_editor.png");
  } catch (e) {
    console.warn("editor screenshot skipped:", e.message);
  }

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
