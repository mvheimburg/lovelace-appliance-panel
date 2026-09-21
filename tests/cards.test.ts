import { afterEach, expect, test } from "vitest";
import "../src/appliance-panel-card";
import { makeHass, settle } from "./ui-fixtures";
afterEach(() => document.body.replaceChildren());
async function mount(type = "oven-card", config: Record<string, unknown> = {}) {
  const env = makeHass();
  const card = document.createElement(type) as any;
  card.setConfig({ type: `custom:${type}`, device: "oven", ...config });
  card.hass = env.hass;
  document.body.append(card);
  await settle();
  return { ...env, card, root: card.shadowRoot as ShadowRoot };
}
test("dedicated oven exposes microwave and steam modules, respecting explicit empty modules", async () => {
  const { card, root } = await mount();
  expect(root.querySelector('[data-module="microwave"]')).not.toBeNull();
  expect(root.querySelector('[data-module="steam"]')).not.toBeNull();
  card.setConfig({
    type: "custom:oven-card",
    device: "oven",
    oven_modules: [],
  });
  await settle();
  expect(root.querySelector('[data-module="microwave"]')).toBeNull();
  expect(root.querySelector('[data-module="steam"]')).toBeNull();
});
test("programme change is confirmed and a changed remote permission prevents dispatch", async () => {
  const { card, root, hass, calls } = await mount();
  const selector = root.querySelector<HTMLSelectElement>(
    '[data-entity="select.oven_select_program"]',
  )!;
  expect(selector).not.toBeNull();
  selector.value = "eco";
  selector.dispatchEvent(new Event("change"));
  await settle();
  expect(calls).toEqual([]);
  expect(root.querySelector<HTMLDialogElement>("#confirmation")?.open).toBe(
    true,
  );
  hass.states["binary_sensor.oven_binary_remote_start_allowed"].state = "off";
  card.hass = { ...hass };
  root.querySelector<HTMLButtonElement>("[data-confirm]")!.click();
  await settle();
  expect(calls).toEqual([]);
  expect(root.querySelector('[role="alert"]')).not.toBeNull();
});
test("running oven shows abort and pause without a start button; abort needs no confirmation", async () => {
  const { card, root, hass, calls } = await mount();
  hass.states["sensor.oven_sensor_operation_state"].state = "run";
  card.hass = { ...hass };
  await settle();
  expect(root.querySelector('[data-role="start"]')).toBeNull();
  expect(root.querySelector('[data-role="pause"]')).not.toBeNull();
  root.querySelector<HTMLButtonElement>('[data-role="abort"]')!.click();
  await settle();
  expect(calls).toEqual([
    ["button", "press", { entity_id: "button.oven_button_abort_program" }],
  ]);
});
test("refrigerator renders cooling controls without programme transport", async () => {
  const { root } = await mount("refrigerator-card", { device: "fridge" });
  expect(root.querySelector('[data-section="cooling"]')).not.toBeNull();
  expect(root.querySelector('[data-role="start"]')).toBeNull();
  expect(
    root.querySelector(
      '[data-entity="number.fridge_number_fridge_temperature"]',
    ),
  ).not.toBeNull();
});
test("kitchen shows busy appliances and care attention without declaring offline devices idle", async () => {
  const { card, root, hass } = await mount("kitchen-panel-card", {
    device: undefined,
    area: "Kitchen",
  });
  hass.states["sensor.oven_sensor_operation_state"].state = "run";
  hass.states["sensor.dish_sensor_operation_state"].state = "unavailable";
  card.hass = { ...hass };
  await settle();
  expect(root.querySelectorAll("[data-busy]")).toHaveLength(1);
  expect(root.textContent).toContain("Water tank");
  expect(root.textContent?.toLowerCase()).toContain("offline");
});
test("reconnect invalidates an open confirmation and never automatically sends commands", async () => {
  const { root, connection, calls } = await mount();
  root.querySelector<HTMLButtonElement>('[data-role="start"]')!.click();
  await settle();
  connection.disconnect();
  connection.reconnect();
  await settle();
  root.querySelector<HTMLButtonElement>("[data-confirm]")?.click();
  await settle();
  expect(calls).toEqual([]);
});

test("coffee and dishwasher have their own controls and no oven section", async () => {
  for (const [type, device, section, entity] of [
    [
      "coffee-machine-card",
      "coffee",
      "coffee",
      "select.coffee_select_bean_amount",
    ],
    [
      "dishwasher-card",
      "dish",
      "dishwasher",
      "switch.dish_switch_vario_speed_plus",
    ],
  ]) {
    const { card, root } = await mount(type, { device });
    expect(root.querySelector(`[data-section="${section}"]`)).not.toBeNull();
    expect(root.querySelector(`[data-entity="${entity}"]`)).not.toBeNull();
    expect(root.querySelector('[data-section="oven"]')).toBeNull();
    card.remove();
  }
});
test("healthy cooling appliances are shown as cooling, not as unknown or unavailable", async () => {
  const { root } = await mount("refrigerator-card", { device: "fridge" });
  expect(root.querySelector("[data-hero] .status")?.textContent).toContain(
    "Cooling",
  );
  const overview = await mount("kitchen-panel-card", { device: undefined });
  expect(overview.root.querySelector("ha-card")?.textContent).not.toContain(
    "Some appliance states are unavailable",
  );
});
test("confirmed selection sends one native service call and a rejected service stays visible", async () => {
  const { root, card, hass, calls } = await mount();
  const select = root.querySelector<HTMLSelectElement>(
    '[data-entity="select.oven_select_program"]',
  )!;
  select.value = "eco";
  select.dispatchEvent(new Event("change"));
  await settle();
  root.querySelector<HTMLButtonElement>("[data-confirm]")!.click();
  await settle();
  expect(calls).toEqual([
    [
      "select",
      "select_option",
      { entity_id: "select.oven_select_program", option: "eco" },
    ],
  ]);
  card.hass = {
    ...hass,
    callService: async () => {
      throw new Error("Appliance refused command");
    },
  };
  root.querySelector<HTMLButtonElement>('[data-role="start"]')!.click();
  await settle();
  root.querySelector<HTMLButtonElement>("[data-confirm]")!.click();
  await settle();
  expect(root.querySelector('[role="alert"]')?.textContent).toContain(
    "Appliance refused command",
  );
});
test("compact oven opens full controls in a dialog", async () => {
  const { root } = await mount("oven-card", { expand: false });
  expect(root.querySelector("ha-card [data-module]")).toBeNull();
  root.querySelector<HTMLButtonElement>(".compact")!.click();
  await settle();
  expect(root.querySelector<HTMLDialogElement>("#details")!.open).toBe(true);
  expect(root.querySelector('#details [data-module="steam"]')).not.toBeNull();
  root.querySelector<HTMLDialogElement>("#details")!.close();
  expect(root.querySelector<HTMLDialogElement>("#details")!.open).toBe(false);
});
test("current out-of-range number does not prevent correcting it within exposed bounds", async () => {
  const { root, hass, card, calls } = await mount();
  hass.states["number.oven_number_oven_setpoint_temperature"].state = "0";
  card.hass = { ...hass };
  await settle();
  const input = root.querySelector<HTMLInputElement>(
    '[data-entity="number.oven_number_oven_setpoint_temperature"]',
  )!;
  expect(input.disabled).toBe(false);
  input.value = "200";
  input.dispatchEvent(new Event("change"));
  await settle();
  expect(calls).toEqual([
    [
      "number",
      "set_value",
      { entity_id: "number.oven_number_oven_setpoint_temperature", value: 200 },
    ],
  ]);
});
test("unselected but available programme can make its first confirmed selection", async () => {
  const { root, card, hass, calls } = await mount();
  hass.states["select.oven_select_program"].state = "unknown";
  card.hass = { ...hass };
  await settle();
  const select = root.querySelector<HTMLSelectElement>(
    '[data-entity="select.oven_select_program"]',
  )!;
  expect(select.disabled).toBe(false);
  select.value = "eco";
  select.dispatchEvent(new Event("change"));
  await settle();
  root.querySelector<HTMLButtonElement>("[data-confirm]")!.click();
  await settle();
  expect(calls).toEqual([
    [
      "select",
      "select_option",
      { entity_id: "select.oven_select_program", option: "eco" },
    ],
  ]);
});
test("exposed delayed-start number is editable in settings", async () => {
  const { root, card, hass, snapshot, connection, add } = await mount();
  const id = add("oven", "number", "number_start_in", "0", {
    min: 0,
    max: 86400,
    step: 60,
    unit_of_measurement: "s",
  });
  connection.snapshot = snapshot;
  connection.emit("entity_registry_updated");
  card.hass = { ...hass };
  await settle();
  expect(root.querySelector(`[data-entity="${id}"]`)).not.toBeNull();
});
test("overview reports disabled entities once and retains elapsed programme diagnostics", async () => {
  const { root, card, hass, snapshot, connection, add } = await mount(
    "kitchen-panel-card",
    { device: undefined },
  );
  const id = add("oven", "sensor", "sensor_elapsed_program_time", "600", {
    unit_of_measurement: "s",
    device_class: "duration",
  });
  snapshot.entities.push({
    entity_id: "sensor.oven_disabled",
    device_id: "oven",
    platform: "homeconnect_ws",
    unique_id: "oven-sensor_unused",
    disabled_by: "integration",
  });
  hass.states["sensor.oven_sensor_operation_state"].state = "run";
  connection.emit("entity_registry_updated");
  card.hass = { ...hass };
  await settle();
  expect(
    root.querySelector("ha-card [data-disabled-count]")?.textContent,
  ).toContain("1 disabled");
  root.querySelector<HTMLButtonElement>('[data-busy="oven"]')!.click();
  await settle();
  expect(root.querySelector(`[data-reading="${id}"]`)).not.toBeNull();
});
test("microwave or steam in a device prefix cannot turn ordinary controls into module capabilities", async () => {
  const { root, card, hass, snapshot, connection } = await mount();
  for (const entity of snapshot.entities.filter(
    (e) => e.device_id === "oven",
  )) {
    const old = entity.entity_id;
    const renamed = old.replace(".oven_", ".kitchen_microwave_steam_oven_");
    entity.entity_id = renamed;
    entity.name = "Steam oven " + (entity.name ?? old);
    hass.states[renamed] = { ...hass.states[old], entity_id: renamed };
    delete hass.states[old];
  }
  connection.emit("entity_registry_updated");
  card.hass = { ...hass };
  await settle();
  for (const module of Array.from(root.querySelectorAll("[data-module]"))) {
    expect(
      module.querySelector(
        '[data-entity="select.kitchen_microwave_steam_oven_select_program"]',
      ),
    ).toBeNull();
    expect(
      module.querySelector(
        '[data-entity="button.kitchen_microwave_steam_oven_button_start_program"]',
      ),
    ).toBeNull();
  }
  expect(
    root.querySelector(
      '[data-module="microwave"] [data-entity="number.kitchen_microwave_steam_oven_number_microwave_power"]',
    ),
  ).not.toBeNull();
});
async function withEntities(
  type: string,
  device: string,
  entities: [string, string, string, Record<string, unknown>?][],
) {
  const env = await mount(type, { device });
  const ids = entities.map(([domain, key, state, attributes]) =>
    env.add(device, domain, key, state, attributes),
  );
  env.connection.emit("entity_registry_updated");
  env.card.hass = { ...env.hass };
  await settle();
  return { ...env, ids };
}
test("configure button opens and closes the settings dialog holding the rarely used controls", async () => {
  const { root, ids } = await withEntities("oven-card", "oven", [
    ["switch", "switch_child_lock", "off"],
  ]);
  const [childLock] = ids;
  const dialog = root.querySelector<HTMLDialogElement>("#configure")!;
  expect(root.querySelector(`ha-card [data-entity="${childLock}"]`)).toBeNull();
  expect(dialog.querySelector(`[data-entity="${childLock}"]`)).not.toBeNull();
  const cog = root.querySelector<HTMLButtonElement>(".top [data-configure]")!;
  expect(cog.getAttribute("aria-label")).toBe("Appliance settings");
  cog.click();
  await settle();
  expect(dialog.open).toBe(true);
  root.querySelector<HTMLButtonElement>("[data-close-configure]")!.click();
  await settle();
  expect(dialog.open).toBe(false);
});
test("child lock in the configure dialog sends the same switch service", async () => {
  const { root, calls, ids } = await withEntities("dishwasher-card", "dish", [
    ["switch", "switch_child_lock", "off"],
  ]);
  root.querySelector<HTMLButtonElement>("[data-configure]")!.click();
  await settle();
  root
    .querySelector<HTMLButtonElement>(`#configure [data-entity="${ids[0]}"]`)!
    .click();
  await settle();
  expect(calls).toEqual([["switch", "turn_on", { entity_id: ids[0] }]]);
});
test("header power switch toggles, shows pending and keeps HA state after a rejected request", async () => {
  const { root, card, hass, ids } = await withEntities("oven-card", "oven", [
    ["switch", "switch_power_state", "on"],
  ]);
  const power = () =>
    root.querySelector<HTMLButtonElement>(`.top [data-power="${ids[0]}"]`)!;
  expect(power().getAttribute("aria-pressed")).toBe("true");
  expect(root.querySelector(`#configure [data-entity="${ids[0]}"]`)).toBeNull();
  let release!: () => void;
  const sent: unknown[][] = [];
  card.hass = {
    ...hass,
    callService: (...args: unknown[]) => {
      sent.push(args);
      return new Promise<void>((resolve) => (release = resolve));
    },
  };
  await settle();
  power().click();
  await settle();
  expect(sent).toEqual([["switch", "turn_off", { entity_id: ids[0] }]]);
  expect(power().getAttribute("aria-busy")).toBe("true");
  expect(power().disabled).toBe(true);
  power().click();
  await settle();
  expect(sent).toHaveLength(1);
  release();
  await settle();
  expect(power().getAttribute("aria-busy")).toBe("false");
  card.hass = {
    ...hass,
    callService: async () => {
      throw new Error("Appliance refused power");
    },
  };
  await settle();
  power().click();
  await settle();
  expect(root.querySelector('ha-card [role="alert"]')?.textContent).toContain(
    "Appliance refused power",
  );
  expect(power().getAttribute("aria-pressed")).toBe("true");
});
test("header power select switches between the exposed on and standby options", async () => {
  const on = "BSH.Common.EnumType.PowerState.On";
  const standby = "BSH.Common.EnumType.PowerState.Standby";
  const { root, calls, ids } = await withEntities(
    "coffee-machine-card",
    "coffee",
    [["select", "select_power_state", on, { options: [on, standby] }]],
  );
  const power = root.querySelector<HTMLButtonElement>(
    `.top [data-power="${ids[0]}"]`,
  )!;
  expect(power.getAttribute("aria-pressed")).toBe("true");
  power.click();
  await settle();
  expect(calls).toEqual([
    ["select", "select_option", { entity_id: ids[0], option: standby }],
  ]);
});
test("unavailable power disables the header toggle", async () => {
  const { root, ids } = await withEntities("oven-card", "oven", [
    ["switch", "switch_power_state", "unavailable"],
  ]);
  expect(
    root.querySelector<HTMLButtonElement>(`[data-power="${ids[0]}"]`)!.disabled,
  ).toBe(true);
});
test("overview details carry power and configure for the opened appliance", async () => {
  const env = await mount("kitchen-panel-card", { device: undefined });
  const id = env.add("dish", "switch", "switch_child_lock", "off");
  env.connection.emit("entity_registry_updated");
  env.card.hass = { ...env.hass };
  await settle();
  const { root } = env;
  expect(root.querySelector("ha-card [data-configure]")).toBeNull();
  const row = Array.from(
    root.querySelectorAll<HTMLButtonElement>(".panel .row"),
  ).find((r) => r.textContent?.includes("Dishwasher"))!;
  row.click();
  await settle();
  root.querySelector<HTMLButtonElement>("#details [data-configure]")!.click();
  await settle();
  const dialog = root.querySelector<HTMLDialogElement>("#configure")!;
  expect(dialog.open).toBe(true);
  expect(dialog.querySelector(`[data-entity="${id}"]`)).not.toBeNull();
});
test("number stepper sends the next step within limits", async () => {
  const { root, calls } = await mount();
  root
    .querySelector<HTMLButtonElement>(
      '[aria-label="Increase Oven setpoint temperature"]',
    )!
    .click();
  await settle();
  expect(calls).toEqual([
    [
      "number",
      "set_value",
      { entity_id: "number.oven_number_oven_setpoint_temperature", value: 185 },
    ],
  ]);
});
test("running oven hero shows the remaining time, programme and progress", async () => {
  const { card, root, hass } = await mount();
  hass.states["sensor.oven_sensor_operation_state"].state = "run";
  card.hass = { ...hass };
  await settle();
  const hero = root.querySelector("[data-hero]")!;
  expect(hero.classList.contains("tone-active")).toBe(true);
  expect(hero.querySelector(".current")?.textContent).toBe("15 min");
  expect(hero.querySelector(".status")?.textContent).toContain("hot_air");
  expect(hero.querySelector("progress")).not.toBeNull();
});
