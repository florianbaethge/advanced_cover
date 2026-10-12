import { nodeResolve } from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import replace from "@rollup/plugin-replace";
import { readdirSync, readFileSync } from "fs";
import { join, resolve } from "path";

// Read version from VERSION file in project root
const versionPath = resolve("../../../VERSION");
const version = readFileSync(versionPath, "utf-8").trim();

// `config_panel` keys the Lovelace card needs: its own (`card_`) plus the
// shared status/condition/reason texts it renders through panel modules.
const CARD_KEY_RE =
  /^(card_|cond_sum_|cond_op_|contact_|reason_|status_|preflight_|today_legend_|covers_no_area$|errors_request_failed$)/;

/**
 * `virtual:card-translations` — the card's strings, cut out of the
 * integration's translation files at build time. A dashboard does not load
 * `component.advanced_cover.config_panel.*` on its own, so the card carries
 * what it needs; the JSON files stay the single source of truth.
 */
function cardTranslations() {
  const id = "virtual:card-translations";
  const dir = resolve("../translations");
  return {
    name: "card-translations",
    resolveId(source) {
      return source === id ? `\0${id}` : null;
    },
    load(resolved) {
      if (resolved !== `\0${id}`) return null;
      const out = {};
      for (const file of readdirSync(dir).sort()) {
        if (!file.endsWith(".json")) continue;
        const path = join(dir, file);
        this.addWatchFile(path);
        const panel = JSON.parse(readFileSync(path, "utf-8")).config_panel ?? {};
        out[file.slice(0, -5)] = Object.fromEntries(
          Object.entries(panel).filter(([key]) => CARD_KEY_RE.test(key))
        );
      }
      return `export default ${JSON.stringify(out)};`;
    },
  };
}

const plugins = (extra = []) => [
  ...extra,
  replace({
    preventAssignment: true,
    values: {
      __VERSION__: `"${version}"`,
    },
  }),
  nodeResolve({ extensions: [".ts", ".js"] }),
  typescript({ tsconfig: "./tsconfig.json" }),
];

// Two independent bundles: the sidebar panel (admin configuration) and the
// Lovelace card (dashboard). The card shares source modules with the panel
// (timeline, status logic) but nothing at runtime — a dashboard must not pull
// in the whole editor to draw a status tile.
export default [
  {
    input: "src/advanced-cover-panel.ts",
    output: {
      file: "dist/advanced-cover-panel.js",
      format: "es",
      sourcemap: true,
    },
    plugins: plugins(),
  },
  {
    input: "src/card/advanced-cover-card.ts",
    output: {
      file: "dist/advanced-cover-card.js",
      format: "es",
      sourcemap: true,
    },
    plugins: plugins([cardTranslations()]),
  },
];
