import type { NextAction, Occurrence, LogEntry, Trigger } from "../types";

// ---- Snapshot payload (mirrors card_api.py `_snapshot`) ----

export interface CardCover {
  id: string;
  name: string;
  kind: string;
  area_id: string | null;
  entity_id: string;
  enabled: boolean;
  available: boolean;
  position: number | null;
  contact_state: string | null;
  safety_blocked: boolean;
  next_action: NextAction | null;
}

export interface CardScenario {
  id: string;
  name: string;
  enabled: boolean;
  trigger: Trigger;
  cover_ids: string[];
  /** Distinct target positions across the assigned covers, ascending. */
  positions: number[];
  has_conditions: boolean;
}

export interface CardSnapshot {
  entry_id: string;
  name: string;
  enabled: boolean;
  now: string;
  sun: { sunrise: string | null; sunset: string | null; solar_noon: string | null };
  master_entity_id: string | null;
  covers: CardCover[];
  scenarios: CardScenario[];
  plan: Occurrence[];
  /** The first run of the day after, or null when nothing is planned then. */
  tomorrow: { when: string; scenario_id: string; scenario_name: string } | null;
  log: LogEntry[];
}

/** Last message of a subscription whose entry was unloaded (e.g. a reload). */
export interface CardUnloaded {
  unloaded: true;
}

// ---- Card configuration ----

export type CardSection = "next" | "timeline" | "covers" | "scenarios";
export type NextButton = "run" | "toggle";

export const CARD_SECTIONS: CardSection[] = [
  "next",
  "timeline",
  "covers",
  "scenarios",
];
export const NEXT_ACTIONS: NextButton[] = ["run", "toggle"];

export interface AdvancedCoverCardConfig {
  type: string;
  entry_id?: string;
  title?: string;
  /** Which sections the card stacks, in this order. */
  sections?: CardSection[];
  /** One tile-style row with the next run instead of the sections. */
  compact?: boolean;
  show_header?: boolean;
  // next
  next_actions?: NextButton[];
  show_last_run?: boolean;
  // timeline
  timeline_list?: boolean;
  timeline_legend?: boolean;
  // covers
  /** "all" or an explicit list of cover item ids. */
  covers?: "all" | string[];
  group_by_area?: boolean;
  cover_controls?: boolean;
  /** A switch per cover for its own automation. */
  cover_automation?: boolean;
  // scenarios
  /** "all" or an explicit list of scenario ids. */
  scenarios?: "all" | string[];
  confirm_run?: boolean;
  ignore_conditions?: boolean;
}

export const DEFAULT_CONFIG: Required<
  Omit<AdvancedCoverCardConfig, "type" | "entry_id" | "title">
> = {
  sections: ["next", "timeline"],
  compact: false,
  show_header: true,
  next_actions: ["run", "toggle"],
  show_last_run: true,
  timeline_list: true,
  timeline_legend: false,
  covers: "all",
  group_by_area: true,
  cover_controls: true,
  cover_automation: false,
  scenarios: "all",
  confirm_run: true,
  ignore_conditions: false,
};

/** Reject what the card cannot render, with a message the YAML editor shows. */
export function validateConfig(config: AdvancedCoverCardConfig): void {
  if (!config || typeof config !== "object") {
    throw new Error("Invalid configuration");
  }
  if (config.sections !== undefined) {
    if (!Array.isArray(config.sections)) {
      throw new Error("sections must be a list");
    }
    for (const section of config.sections) {
      if (!CARD_SECTIONS.includes(section)) {
        throw new Error(
          `unknown section "${section}" (use ${CARD_SECTIONS.join(", ")})`
        );
      }
    }
  }
  if (config.next_actions !== undefined) {
    if (!Array.isArray(config.next_actions)) {
      throw new Error("next_actions must be a list");
    }
    for (const action of config.next_actions) {
      if (!NEXT_ACTIONS.includes(action)) {
        throw new Error(`unknown next action "${action}"`);
      }
    }
  }
  for (const key of ["covers", "scenarios"] as const) {
    const value = config[key];
    if (value !== undefined && value !== "all" && !Array.isArray(value)) {
      throw new Error(`${key} must be "all" or a list of ids`);
    }
  }
}
