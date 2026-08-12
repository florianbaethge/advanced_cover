/** Wait until core HA custom elements used by the panel are defined. */
export async function loadHaPanelElements(): Promise<void> {
  const tags = [
    "ha-menu-button",
    "ha-tab-group",
    "ha-tab-group-tab",
    "ha-card",
    "ha-icon",
    "ha-selector",
    "ha-switch",
  ];
  await Promise.all(
    tags.map((tag) => customElements.whenDefined(tag).catch(() => undefined))
  );
}
