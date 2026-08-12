import { describe, expect, it } from "vitest";
import {
  entitySelectorConfig,
  renderAreaSelector,
  renderEntitySelector,
} from "./entity-input";
import type { HomeAssistant } from "./types";

describe("entity selector", () => {
  it("uses a native single-entity selector without enumerating hass.states", () => {
    const hass = new Proxy({} as HomeAssistant, {
      get(_target, property) {
        if (property === "states") throw new Error("states must not be enumerated");
        return undefined;
      },
    });

    expect(entitySelectorConfig()).toEqual({ multiple: false });
    expect(() => renderEntitySelector(hass, "sensor.living_room", () => {})).not.toThrow();
  });

  it("preserves domain restrictions with modern entity filters", () => {
    expect(entitySelectorConfig(["cover"])).toEqual({
      filter: [{ domain: ["cover"] }],
      multiple: false,
    });
    expect(entitySelectorConfig(["binary_sensor", "sensor"])).toEqual({
      filter: [{ domain: ["binary_sensor", "sensor"] }],
      multiple: false,
    });
  });

  it("renders a native single-area selector without constructing area options", () => {
    const hass = new Proxy({} as HomeAssistant, {
      get(_target, property) {
        if (property === "areas") throw new Error("areas must not be enumerated");
        return undefined;
      },
    });

    const result = renderAreaSelector(hass, "living_room", () => {});
    expect(result.values[1]).toEqual({ area: { multiple: false } });
    expect(result.values[2]).toBe("living_room");
  });
});
