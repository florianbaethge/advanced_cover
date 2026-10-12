import type {
  CoverItem,
  EntryRow,
  HomeAssistant,
  PanelSnapshot,
  Scenario,
  TriggerPreview,
} from "../types";

const D = "advanced_cover";

export const listEntries = (hass: HomeAssistant): Promise<EntryRow[]> =>
  hass.callWS({ type: `${D}/entries/list` });

export const fetchState = (
  hass: HomeAssistant,
  entryId: string
): Promise<PanelSnapshot> => hass.callWS({ type: `${D}/state`, entry_id: entryId });

export const subscribeState = (
  hass: HomeAssistant,
  entryId: string,
  onState: (snapshot: PanelSnapshot | { unloaded: true }) => void
): Promise<() => Promise<void>> | undefined =>
  hass.connection?.subscribeMessage(onState, {
    type: `${D}/subscribe`,
    entry_id: entryId,
  });

/** Resolve a (draft) trigger to today's base time via the scheduler's solver. */
export const previewTrigger = (
  hass: HomeAssistant,
  entryId: string,
  trigger: Record<string, unknown>,
  coverItemIds?: string[]
): Promise<TriggerPreview> =>
  hass.callWS({
    type: `${D}/trigger/preview`,
    entry_id: entryId,
    trigger,
    ...(coverItemIds?.length ? { cover_item_ids: coverItemIds } : {}),
  });

export const saveConfig = (
  hass: HomeAssistant,
  entryId: string,
  config: Record<string, unknown>
): Promise<{ success: boolean }> =>
  hass.callWS({ type: `${D}/config/save`, entry_id: entryId, config });

export const saveCover = (
  hass: HomeAssistant,
  entryId: string,
  cover: Partial<CoverItem>
): Promise<{ success: boolean; id: string }> =>
  hass.callWS({ type: `${D}/covers/save`, entry_id: entryId, cover });

export const deleteCover = (
  hass: HomeAssistant,
  entryId: string,
  coverItemId: string
): Promise<{ success: boolean }> =>
  hass.callWS({
    type: `${D}/covers/delete`,
    entry_id: entryId,
    cover_item_id: coverItemId,
  });

export const probeCover = (
  hass: HomeAssistant,
  entityId: string,
  contactEntityId?: string
): Promise<{
  capabilities: {
    supports_position: boolean;
    supports_tilt: boolean;
    supports_open_close: boolean;
    available: boolean;
  };
  suggested_kind: string;
  suggested_contact_map?: Record<string, string>;
  contact_current_state?: string | null;
}> =>
  hass.callWS({
    type: `${D}/covers/probe`,
    entity_id: entityId,
    ...(contactEntityId ? { contact_entity_id: contactEntityId } : {}),
  });

export const testCover = (
  hass: HomeAssistant,
  entryId: string,
  coverItemId: string,
  command: "open" | "close" | "stop" | "position",
  position?: number
): Promise<{ success: boolean }> =>
  hass.callWS({
    type: `${D}/covers/test`,
    entry_id: entryId,
    cover_item_id: coverItemId,
    command,
    ...(position !== undefined ? { position } : {}),
  });

export const saveScenario = (
  hass: HomeAssistant,
  entryId: string,
  scenario: Partial<Scenario>
): Promise<{ success: boolean; id: string; warnings: string[] }> =>
  hass.callWS({ type: `${D}/scenarios/save`, entry_id: entryId, scenario });

export const deleteScenario = (
  hass: HomeAssistant,
  entryId: string,
  scenarioId: string
): Promise<{ success: boolean }> =>
  hass.callWS({
    type: `${D}/scenarios/delete`,
    entry_id: entryId,
    scenario_id: scenarioId,
  });

export const reorderScenarios = (
  hass: HomeAssistant,
  entryId: string,
  scenarioIds: string[]
): Promise<{ success: boolean }> =>
  hass.callWS({
    type: `${D}/scenarios/reorder`,
    entry_id: entryId,
    scenario_ids: scenarioIds,
  });

export const runScenario = (
  hass: HomeAssistant,
  entryId: string,
  scenarioId: string,
  options?: { coverItemId?: string; ignoreConditions?: boolean }
): Promise<{ success: boolean }> =>
  hass.callWS({
    type: `${D}/scenarios/run`,
    entry_id: entryId,
    scenario_id: scenarioId,
    ...(options?.coverItemId ? { cover_item_id: options.coverItemId } : {}),
    ignore_conditions: Boolean(options?.ignoreConditions),
  });

export const recalculate = (
  hass: HomeAssistant,
  entryId: string
): Promise<{ success: boolean }> =>
  hass.callWS({ type: `${D}/recalculate`, entry_id: entryId });
