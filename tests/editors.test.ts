import { afterEach, expect, it } from "vitest";
import "../src/editors";
import type { HomeAssistant, RegistrySnapshot } from "../src/types";
import type { LitElement } from "lit";
type Editor = LitElement & {
  setConfig(raw: Record<string, unknown>): void;
  hass: HomeAssistant;
};
const registry: RegistrySnapshot = {
  devices: [
    { id: "oven-id", name: "My oven" },
    { id: "cloud-id", name: "Cloud oven" },
  ],
  entities: [
    {
      entity_id: "sensor.oven",
      platform: "homeconnect_ws",
      device_id: "oven-id",
      unique_id: "oven_sensor_operation_state",
    },
    {
      entity_id: "sensor.cloud",
      platform: "home_connect",
      device_id: "cloud-id",
      unique_id: "cloud",
    },
  ],
  areas: [{ area_id: "kitchen", name: "Kitchen" }],
  labels: [],
};
function hass(): HomeAssistant {
  return {
    states: {},
    connection: {
      connected: true,
      addEventListener() {},
      removeEventListener() {},
      async subscribeEvents() {
        return () => {};
      },
      async sendMessagePromise<T>(message: { type: string }): Promise<T> {
        const key = message.type.split("/")[1].replace("_registry", "");
        return registry[
          `${key === "entity" ? "entitie" : key}s` as keyof RegistrySnapshot
        ] as T;
      },
    },
  };
}
function make(
  type = "oven-card",
  raw: Record<string, unknown> = { device: "My oven" },
): Editor {
  const editor = document.createElement(`${type}-editor`) as Editor;
  editor.setConfig({ type: `custom:${type}`, ...raw });
  document.body.append(editor);
  return editor;
}
async function settled(editor: Editor) {
  await editor.updateComplete;
  await new Promise((resolve) => setTimeout(resolve, 40));
  await editor.updateComplete;
}
function change(editor: Editor, key: string, value: string | boolean) {
  const control = editor.shadowRoot!.querySelector(
    `[name="${key}"]`,
  ) as HTMLInputElement;
  expect(control).toBeTruthy();
  if (typeof value === "boolean") control.checked = value;
  else control.value = value;
  control.dispatchEvent(new Event("change", { bubbles: true }));
}
afterEach(() => document.body.replaceChildren());
it("preserves false, empty modules and unknown keys while editing the title", async () => {
  const editor = make("oven-card", {
    device: "My oven",
    expand: false,
    confirm_start: false,
    oven_modules: [],
    future: { a: 1 },
  });
  await settled(editor);
  let result: any;
  editor.addEventListener(
    "config-changed",
    (event: any) => (result = event.detail.config),
  );
  change(editor, "title", "Dinner");
  expect(result).toEqual({
    type: "custom:oven-card",
    device: "My oven",
    expand: false,
    confirm_start: false,
    oven_modules: [],
    future: { a: 1 },
    title: "Dinner",
  });
});
it("retains configured names in a Local-only device dropdown and emits IDs only on selection", async () => {
  const editor = make();
  editor.hass = hass();
  await settled(editor);
  const select = editor.shadowRoot!.querySelector(
    '[name="device"]',
  ) as HTMLSelectElement;
  expect(select.value).toBe("My oven");
  expect(select.textContent).toContain("My oven");
  expect(select.textContent).not.toContain("Cloud oven");
  let result: any;
  editor.addEventListener(
    "config-changed",
    (event: any) => (result = event.detail.config),
  );
  change(editor, "device", "oven-id");
  expect(result.device).toBe("oven-id");
});
it("explains missing device without silently clearing configuration", async () => {
  const editor = make("dishwasher-card", { device: "Missing washer" });
  editor.hass = hass();
  await settled(editor);
  expect(editor.shadowRoot!.textContent).toMatch(/not found/i);
  expect(
    (editor.shadowRoot!.querySelector('[name="device"]') as HTMLSelectElement)
      .value,
  ).toBe("Missing washer");
});
it("exposes independent module choices and supports standard oven only", async () => {
  const editor = make();
  await settled(editor);
  let result: any;
  editor.addEventListener(
    "config-changed",
    (event: any) => (result = event.detail.config),
  );
  change(editor, "module_mode", "manual");
  await settled(editor);
  change(editor, "microwave", true);
  await settled(editor);
  change(editor, "steam", true);
  expect(result.oven_modules).toEqual(["microwave", "steam"]);
  await settled(editor);
  change(editor, "microwave", false);
  await settled(editor);
  change(editor, "steam", false);
  expect(result.oven_modules).toEqual([]);
});
it("supports overview area selection and explicit empty device selection", async () => {
  const editor = make("kitchen-panel-card", {});
  editor.hass = hass();
  await settled(editor);
  let result: any;
  editor.addEventListener(
    "config-changed",
    (event: any) => (result = event.detail.config),
  );
  change(editor, "area", "kitchen");
  expect(result.area).toBe("kitchen");
  change(editor, "selection_mode", "devices");
  await settled(editor);
  expect(result.devices).toEqual([]);
  expect(result.area).toBeUndefined();
  const device = editor.shadowRoot!.querySelector(
    '[name="devices"]',
  ) as HTMLSelectElement;
  device.options[0].selected = true;
  device.dispatchEvent(new Event("change", { bubbles: true }));
  expect(result.devices).toEqual(["oven-id"]);
});
it.each([
  "oven-card",
  "dishwasher-card",
  "coffee-machine-card",
  "refrigerator-card",
  "appliance-card",
  "kitchen-panel-card",
])("offers appearance, expand and confirmation options on %s", async (type) => {
  const editor = make(type);
  await settled(editor);
  let result: any;
  editor.addEventListener(
    "config-changed",
    (event: any) => (result = event.detail.config),
  );
  change(editor, "appearance", "bubble");
  await settled(editor);
  change(editor, "expand", false);
  await settled(editor);
  change(editor, "confirm_start", false);
  expect(result).toMatchObject({
    appearance: "bubble",
    expand: false,
    confirm_start: false,
  });
});
it("resolves configured device names with the same case-insensitive rules as cards", async () => {
  const editor = make("oven-card", { device: "my OVEN" });
  editor.hass = hass();
  await settled(editor);
  expect(editor.shadowRoot!.textContent).not.toMatch(/device not found/i);
  expect(
    (editor.shadowRoot!.querySelector('[name="device"]') as HTMLSelectElement)
      .value,
  ).toBe("my OVEN");
});
it("shows registry failure and recovers its Local device list through retry", async () => {
  const editor = make();
  const connection = hass();
  const send = connection.connection.sendMessagePromise;
  let failed = true;
  connection.connection.sendMessagePromise = async <T>(message: {
    type: string;
  }): Promise<T> => {
    if (failed) throw new Error("Registry permission denied");
    return send(message);
  };
  editor.hass = connection;
  await settled(editor);
  expect(
    editor.shadowRoot!.querySelector('[role="alert"]')?.textContent,
  ).toContain("Registry permission denied");
  failed = false;
  (editor.shadowRoot!.querySelector("button") as HTMLButtonElement).click();
  await settled(editor);
  expect(editor.shadowRoot!.querySelector('[role="alert"]')).toBeNull();
  expect(
    editor.shadowRoot!.querySelector('option[value="oven-id"]'),
  ).not.toBeNull();
});
