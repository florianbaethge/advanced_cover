import type { HassConfig, HassEntities, HassEntity } from "home-assistant-js-websocket";

/** Minimal hass shape for the custom panel. */
export interface HomeAssistant {
  states: HassEntities;
  config?: HassConfig;
  areas?: Record<string, { area_id: string; name: string }>;
  locale?: {
    language: string;
    time_format: string;
    date_format: string;
  };
  callWS<T>(msg: Record<string, unknown>): Promise<T>;
  callService?(
    domain: string,
    service: string,
    serviceData?: Record<string, unknown>
  ): Promise<unknown>;
  localize?: (
    key: string,
    values?: Record<string, string | number | null | undefined>
  ) => string;
  /** Localized label for a state, e.g. `("on")` → "On" (chips next to a picker). */
  formatEntityState?: (stateObj: HassEntity, state?: string) => string;
  loadBackendTranslation?(
    category: string,
    integration?: string | string[],
    configFlow?: boolean
  ): Promise<(key: string) => string>;
  connection?: {
    subscribeEvents<EventType>(
      callback: (ev: EventType) => void,
      eventType?: string
    ): Promise<() => Promise<void>>;
    subscribeMessage<Result>(
      callback: (result: Result) => void,
      message: Record<string, unknown>
    ): Promise<() => Promise<void>>;
  };
  language?: string;
}

// ---- Domain payloads (mirror the Python models' to_dict output) ----

export type ConditionType =
  | "entity_state"
  | "entity_state_not"
  | "cover_position"
  | "contact"
  | "numeric_state"
  | "sun_position";

export interface Condition {
  type: ConditionType;
  entity_id?: string | null;
  states?: string[];
  op?: "above" | "below" | "between";
  value?: number | null;
  value2?: number | null;
  accepted?: string[];
  above?: number | null;
  below?: number | null;
  az_mode?: "off" | "absolute" | "relative";
  az_from?: number | null;
  az_to?: number | null;
}

export interface Trigger {
  type: "fixed_time" | "sun_event" | "sun_azimuth" | "sun_elevation";
  time_local?: string;
  sun_event?: "sunrise" | "sunset" | "solar_noon";
  offset_min?: number;
  azimuth_deg?: number;
  az_relative?: boolean;
  azimuth_offset_deg?: number;
  elevation_deg?: number;
  elevation_dir?: "rising" | "falling";
}

/** Result of the trigger/preview WS command. */
export interface TriggerPreview {
  time: string | null;
  time_last?: string | null;
  times?: Array<{ cover_item_id: string; name: string; time: string | null }>;
  missing?: string[];
}

export interface CoverAction {
  position: number;
  tilt_position: number | null;
  mode: "normal" | "low";
  min_position_delta: number | null;
  /** Safety-rule behavior when the window contact blocks this closing move:
      null = the cover's own setting, "block" = stay put, "clamp" = close to
      the ventilation position, "ignore" = close fully despite the window. */
  safety_override: SafetyOverride | null;
}

export type SafetyOverride = "block" | "clamp" | "ignore";

export interface ActionOverride {
  position: number | null;
  tilt_position: number | null;
  mode: "normal" | "low" | null;
  min_position_delta: number | null;
  safety_override: SafetyOverride | null;
}

export interface Assignment {
  cover_item_id: string;
  extra_conditions: Condition[];
  action_override: ActionOverride | null;
}

/** Yearly stretch of days as yearless "MM-DD" dates, both inclusive. */
export interface ActivePeriod {
  from: string;
  to: string;
}

export interface Scenario {
  id: string;
  name: string;
  enabled: boolean;
  trigger: Trigger;
  random_window_min: number;
  random_direction: "after" | "before" | "both";
  weekdays: string[];
  /** Times of year the scenario runs in (OR-ed); empty = all year. */
  active_periods: ActivePeriod[];
  conditions: Condition[];
  retry_window_min: number;
  action: CoverAction;
  assignments: Assignment[];
  warnings?: string[];
}

export interface SafetyConfig {
  ventilation_position: number;
  mode: "block" | "clamp";
  block_when_tilted: boolean;
}

export interface CoverCapabilities {
  supports_position: boolean;
  supports_tilt: boolean;
  supports_open_close: boolean;
  available: boolean;
}

export interface CoverItem {
  id: string;
  name: string;
  cover_entity_id: string;
  kind: string;
  area_id: string | null;
  azimuth: number | null;
  low_mode_entity_id: string | null;
  low_mode_script_id: string | null;
  manual_low_mode: boolean;
  contact_entity_id: string | null;
  contact_state_map: Record<string, string>;
  safety: SafetyConfig;
  enabled: boolean;
}

export interface NextAction {
  when: string;
  scenario_id: string;
  scenario_name: string;
  position?: number;
  armed: boolean;
  armed_until?: string | null;
  waiting_for?: string[];
}

export interface CoverRuntime extends CoverItem {
  capabilities: CoverCapabilities;
  current_position: number | null;
  contact_state: string | null;
  safety_blocked: boolean;
  next_action: NextAction | null;
  missing_entities: string[];
}

/** One evaluated condition, ready to render as a checklist line. */
export interface ConditionEval {
  scope: "scenario" | "assignment" | "safety";
  type: string;
  entity_id: string | null;
  ok: boolean | null; // null = cannot be evaluated (unavailable / missing)
  actual: string | null;
  summary_key: string;
  summary_values: Record<string, string | number>;
}

/** Rollup over all conditions of one scope. */
export interface Preflight {
  verdict: "would_run" | "would_skip" | "unknown";
  evaluated_at: string;
  failing: number;
  conditions: ConditionEval[];
}

export interface AssignmentRun {
  cover_item_id: string;
  cover_name: string;
  target_position: number;
  target_tilt: number | null;
  area_id: string | null;
  status: "idle" | "armed" | "done" | "expired";
  result: string | null;
  reason: string | null;
  armed_until: string | null;
  fire_at: string | null;
  waiting_for: string[];
  preflight: Preflight | null;
}

export interface Occurrence {
  scenario_id: string;
  scenario_name: string;
  base_at: string;
  planned_at: string;
  random_offset_min: number;
  retry_until: string | null;
  fired: boolean;
  assignments: AssignmentRun[];
  preflight: Preflight | null;
  covers_would_run: number;
}

export interface LogEntry {
  time: string;
  scenario_id: string;
  scenario_name: string;
  cover_item_id: string;
  cover_name: string;
  result: string;
  reason: string | null;
  position: number | null;
}

export interface EntryConfig {
  name: string;
  enabled: boolean;
  default_min_position_delta: number;
  favorite_entity_ids: string[];
}

export interface PanelSnapshot {
  entry_id: string;
  config: EntryConfig;
  covers: CoverRuntime[];
  scenarios: Scenario[];
  plan: Occurrence[];
  log: LogEntry[];
  sun: { sunrise: string | null; sunset: string | null; solar_noon: string | null };
  now: string;
}

export interface EntryRow {
  entry_id: string;
  name: string;
}
