import type { EntryRow, HomeAssistant } from "../types";
import type { CardSnapshot } from "./types";

const D = "advanced_cover";

function withEntry(
  msg: Record<string, unknown>,
  entryId?: string
): Record<string, unknown> {
  return entryId ? { ...msg, entry_id: entryId } : msg;
}

export const listEntries = (hass: HomeAssistant): Promise<EntryRow[]> =>
  hass.callWS({ type: `${D}/card/entries` });

export const subscribeSnapshot = (
  hass: HomeAssistant,
  callback: (snapshot: CardSnapshot) => void,
  entryId?: string
): Promise<() => Promise<void>> | undefined =>
  hass.connection?.subscribeMessage(
    callback,
    withEntry({ type: `${D}/card/subscribe` }, entryId)
  );

const action = (
  hass: HomeAssistant,
  entryId: string | undefined,
  payload: Record<string, unknown>
): Promise<unknown> =>
  hass.callWS(withEntry({ type: `${D}/card/action`, ...payload }, entryId));

export const runScenario = (
  hass: HomeAssistant,
  scenarioId: string,
  ignoreConditions: boolean,
  entryId?: string
) =>
  action(hass, entryId, {
    action: "run_scenario",
    scenario_id: scenarioId,
    ignore_conditions: ignoreConditions,
  });

export const setEnabled = (
  hass: HomeAssistant,
  enabled: boolean,
  entryId?: string
) => action(hass, entryId, { action: "set_enabled", enabled });

export const driveCover = (
  hass: HomeAssistant,
  coverItemId: string,
  command: "open" | "close" | "stop",
  entryId?: string
) =>
  action(hass, entryId, {
    action: "cover",
    cover_item_id: coverItemId,
    command,
  });
