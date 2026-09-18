import { afterEach, expect, test } from "vitest";
import "../src/appliance-panel-card";
import { makeHass, settle } from "./ui-fixtures";
afterEach(() => document.body.replaceChildren());
test("Bokmål renders controls and confirmation while preserving raw service values", async () => {
  const env = makeHass();
  env.hass.language = "NB_no";
  const card = document.createElement("oven-card") as any;
  card.setConfig({ type: "custom:oven-card", device: "oven" });
  card.hass = env.hass;
  document.body.append(card);
  await settle();
  const root = card.shadowRoot as ShadowRoot;
  expect(root.textContent).toContain("Innstillinger");
  expect(root.textContent).toContain("Klar");
  const steam = root.querySelector<HTMLSelectElement>(
    '[data-entity="select.oven_select_steam_level"]',
  )!;
  expect(steam.textContent).toContain("Høy");
  steam.value = "high";
  steam.dispatchEvent(new Event("change"));
  await settle();
  expect(env.calls[0]).toEqual([
    "select",
    "select_option",
    { entity_id: "select.oven_select_steam_level", option: "high" },
  ]);
  root.querySelector<HTMLButtonElement>('[data-role="start"]')!.click();
  await settle();
  expect(root.querySelector("#confirmation")?.textContent).toContain("Bekreft");
  card.hass = { ...env.hass, language: "fr" };
  await settle();
  expect(root.textContent).toContain("Settings");
  expect(root.querySelector("#confirmation")?.textContent).toContain("Confirm");
});
test.each(["nb", "nb-NO", "no", "nn", "NN_no"])(
  "shared editor uses %s and preserves config values",
  async (language) => {
    const env = makeHass();
    const editor = document.createElement("oven-card-editor") as any;
    editor.setConfig({ type: "custom:oven-card", device: "oven" });
    editor.hass = { ...env.hass, language: undefined, locale: { language } };
    document.body.append(editor);
    await settle();
    expect(editor.shadowRoot.textContent).toContain("Utseende");
    expect(editor.shadowRoot.querySelector('[name="appearance"]').value).toBe(
      "default",
    );
    editor.hass = { ...env.hass, language: "en", locale: { language } };
    await settle();
    expect(editor.shadowRoot.textContent).toContain("Appearance");
  },
);

test.each([
  ["oven-card", "oven", "Stekeovn"],
  ["dishwasher-card", "dish", "Vaskevalg"],
  ["coffee-machine-card", "coffee", "Velg drikke"],
  ["refrigerator-card", "fridge", "Temperatursoner"],
  ["appliance-card", "oven", "Stekeovn"],
  ["kitchen-panel-card", undefined, "Kjøkken"],
])(
  "localizes %s while preserving user device names",
  async (type, device, label) => {
    const env = makeHass();
    env.hass.language = "nb";
    const card = document.createElement(type) as any;
    card.setConfig({ type: `custom:${type}`, ...(device ? { device } : {}) });
    card.hass = env.hass;
    document.body.append(card);
    await settle();
    expect(card.shadowRoot.textContent).toContain(label);
    expect(card.shadowRoot.textContent).toContain(
      device === "coffee"
        ? "Coffee machine"
        : device === "dish"
          ? "Dishwasher"
          : device === "fridge"
            ? "Refrigerator"
            : "Combination oven",
    );
    expect(
      card.shadowRoot.querySelector('[aria-label="Lukk detaljer"]'),
    ).not.toBeNull();
    if (type === "kitchen-panel-card")
      expect(card.shadowRoot.textContent).toContain("Vanntank: Tom");
  },
);

test("localizes care, policy denials and formatted integration options without changing names or payloads", async () => {
  const env = makeHass();
  const entry = env.snapshot.entities.find(
    (e) => e.entity_id === "select.oven_select_program",
  )!;
  entry.name = "My Program";
  env.hass.language = "nb";
  env.hass.formatEntityState = (_state, value) =>
    value === "hot_air" ? "Varmluft" : value!;
  env.hass.states["binary_sensor.oven_binary_remote_start_allowed"].state =
    "off";
  const card = document.createElement("oven-card") as any;
  card.setConfig({ type: "custom:oven-card", device: "oven" });
  card.hass = env.hass;
  document.body.append(card);
  await settle();
  const root = card.shadowRoot as ShadowRoot;
  expect(root.textContent).toContain(
    "Fjernstart er deaktivert, ukjent eller utilgjengelig.",
  );
  expect(
    root
      .querySelector('[data-entity="select.oven_select_program"]')
      ?.getAttribute("aria-label"),
  ).toBe("My Program");
  expect(root.querySelector('option[value="hot_air"]')?.textContent).toBe(
    "Varmluft",
  );
  expect(env.calls).toEqual([]);
  env.hass.states["binary_sensor.oven_binary_remote_start_allowed"].state =
    "on";
  card.hass = { ...env.hass };
  await settle();
  const selector = root.querySelector<HTMLSelectElement>(
    '[data-entity="select.oven_select_program"]',
  )!;
  selector.value = "hot_air";
  selector.dispatchEvent(new Event("change"));
  await settle();
  expect(root.querySelector("#confirmation")?.textContent).toContain(
    "My Program: Varmluft",
  );
  root.querySelector<HTMLButtonElement>("[data-confirm]")!.click();
  await settle();
  expect(env.calls).toEqual([
    [
      "select",
      "select_option",
      { entity_id: entry.entity_id, option: "hot_air" },
    ],
  ]);
  expect(root.textContent).toContain("Kommando sendt");
  card.hass = { ...env.hass, language: "en" };
  await settle();
  expect(root.textContent).toContain("Command sent");
});

test("running status and progress aria labels switch at runtime", async () => {
  const env = makeHass();
  env.hass.states["sensor.oven_sensor_operation_state"].state = "run";
  const card = document.createElement("oven-card") as any;
  card.setConfig({ type: "custom:oven-card", device: "oven" });
  card.hass = { ...env.hass, language: "nb" };
  document.body.append(card);
  await settle();
  expect(card.shadowRoot.textContent).toContain("Kjører");
  expect(
    card.shadowRoot.querySelector("progress").getAttribute("aria-label"),
  ).toBe("Programfremdrift");
  expect(
    card.shadowRoot.querySelector('[data-role="abort"]').textContent.trim(),
  ).toBe("Stopp");
  card.hass = { ...env.hass, language: undefined };
  await settle();
  expect(
    card.shadowRoot.querySelector("progress").getAttribute("aria-label"),
  ).toBe("Programme progress");
});

test.each([
  "oven-card",
  "dishwasher-card",
  "coffee-machine-card",
  "refrigerator-card",
  "appliance-card",
  "kitchen-panel-card",
])("%s editor translates shared labels and emits raw values", async (type) => {
  const env = makeHass();
  const editor = document.createElement(`${type}-editor`) as any;
  editor.setConfig({
    type: `custom:${type}`,
    device: "oven",
    title: "Settings",
  });
  editor.hass = { ...env.hass, language: "nb" };
  document.body.append(editor);
  await settle();
  expect(editor.shadowRoot.textContent).toContain("Utseende");
  expect(editor.shadowRoot.textContent).toContain(
    "Bekreft programvalg og start",
  );
  expect(editor.shadowRoot.querySelector('[name="title"]').value).toBe(
    "Settings",
  );
  let config: any;
  editor.addEventListener("config-changed", (event: any) => {
    config = event.detail.config;
  });
  const select = editor.shadowRoot.querySelector('[name="appearance"]');
  select.value = "bubble";
  select.dispatchEvent(new Event("change"));
  expect(config.appearance).toBe("bubble");
  expect(config.device).toBe("oven");
  expect(config.title).toBe("Settings");
});

test("HA formatted readings retain one unit and care uses raw state overrides", async () => {
  const env = makeHass();
  const temperature = env.add(
    "coffee",
    "sensor",
    "sensor_oven_current_temperature",
    "93",
    { unit_of_measurement: "°C" },
  );
  env.hass.formatEntityState = (state, value = state.state) => {
    if (state.attributes.unit_of_measurement)
      return `${value} ${state.attributes.unit_of_measurement}`;
    return value === "empty" ? "Tom beholder" : value;
  };
  const card = document.createElement("coffee-machine-card") as any;
  card.setConfig({ type: "custom:coffee-machine-card", device: "coffee" });
  card.hass = { ...env.hass, language: "nb" };
  document.body.append(card);
  await settle();
  expect(card.shadowRoot.textContent).toContain("Vanntank: Tom beholder");
  expect(
    card.shadowRoot.querySelector(`[data-reading="${temperature}"] strong`)
      .textContent,
  ).toBe("93 °C");
});
