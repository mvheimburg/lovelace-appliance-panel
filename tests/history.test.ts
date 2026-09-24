import { afterEach, expect, test, vi } from "vitest";
import "../src/appliance-panel-card";
import { makeHass, settle } from "./ui-fixtures";
import type { HomeAssistant } from "../src/types";

afterEach(() => document.body.replaceChildren());

const HOUR = 3_600_000;
const OVEN = "sensor.oven_sensor_oven_current_temperature";
const PROBE = "sensor.oven_sensor_oven_current_meatprobe_temperature";
const TARGET = "number.oven_number_oven_setpoint_temperature";
const DOOR = "binary_sensor.fridge_binary_sensor_fridge_door_state";

/** The fixture plus measured temperatures, with a recorder behind them. */
async function mount(
  type = "oven-card",
  device = "oven",
  options: { fail?: Error; language?: string } = {},
) {
  const env = makeHass();
  const now = Date.now();
  const s = (ms: number) => ms / 1000;
  const named = (id: string, name: string) => {
    env.snapshot.entities.find((e) => e.entity_id === id)!.original_name = name;
  };
  const measured = { unit_of_measurement: "°C", state_class: "measurement" };
  named(
    env.add(
      "oven",
      "sensor",
      "sensor_oven_current_temperature",
      "186",
      measured,
    ),
    "Oven temperature",
  );
  named(
    env.add(
      "oven",
      "sensor",
      "sensor_oven_current_meatprobe_temperature",
      "54",
      measured,
    ),
    "Meat probe",
  );
  named(TARGET, "Target temperature");
  env.add("oven", "sensor", "sensor_elapsed_program_time", "1200", {
    unit_of_measurement: "s",
    device_class: "duration",
  });
  named(
    env.add(
      "fridge",
      "sensor",
      "sensor_temperature_memory_freezer",
      "-17.5",
      measured,
    ),
    "Freezer temperature",
  );
  named(
    env.add("fridge", "number", "number_setpoint_freezer", "-18", {
      min: -24,
      max: -16,
      step: 1,
      unit_of_measurement: "°C",
    }),
    "Freezer",
  );
  named(
    env.add("fridge", "sensor", "sensor_humidity", "61", {
      unit_of_measurement: "%",
      state_class: "measurement",
    }),
    "Humidity",
  );
  // An ambient reading carries no zone in its key; it pairs with the one
  // setpoint left over (the fridge's).
  named(
    env.add("fridge", "sensor", "sensor_temperature_ambient", "4.6", measured),
    "Fridge temperature",
  );
  const rows: Record<string, unknown[]> = {
    [OVEN]: [
      { s: "20", lu: s(now - 20 * HOUR) },
      { s: "unavailable", lu: s(now - 12 * HOUR) },
      { s: "150", lu: s(now - 8 * HOUR) },
    ],
    [PROBE]: [{ s: "40", lu: s(now - 20 * HOUR) }],
    [TARGET]: [{ s: "200", lu: s(now - 20 * HOUR) }],
    "sensor.fridge_sensor_temperature_memory_freezer": [
      { s: "-18.5", lu: s(now - 20 * HOUR) },
    ],
    "sensor.fridge_sensor_humidity": [{ s: "58", lu: s(now - 20 * HOUR) }],
    // Open 20 to 16 hours ago, unreported 12 to 10 hours ago, shut since.
    [DOOR]: [
      { s: "on", lu: s(now - 20 * HOUR) },
      { s: "off", lu: s(now - 16 * HOUR) },
      { s: "unavailable", lu: s(now - 12 * HOUR) },
      { s: "off", lu: s(now - 10 * HOUR) },
    ],
  };
  const history = vi.fn(async (m: Record<string, unknown>) => {
    if (options.fail) throw options.fail;
    return Object.fromEntries(
      (m.entity_ids as string[]).map((id) => [id, rows[id] ?? []]),
    );
  });
  const original = env.connection.sendMessagePromise.bind(env.connection);
  env.connection.sendMessagePromise = (async (m: Record<string, unknown>) =>
    m.type === "history/history_during_period"
      ? history(m)
      : original(
          m as { type: string },
        )) as HomeAssistant["connection"]["sendMessagePromise"];
  if (options.language) env.hass.language = options.language;
  const card = document.createElement(type) as HTMLElement & {
    setConfig(c: Record<string, unknown>): void;
    hass: HomeAssistant;
    updateComplete: Promise<boolean>;
  };
  card.setConfig({ type: `custom:${type}`, device });
  card.hass = env.hass;
  document.body.append(card);
  await settle();
  return { ...env, card, root: card.shadowRoot!, history, now };
}
const legend = (root: ShadowRoot) =>
  Array.from(root.querySelectorAll("#history .history-item")).map((i) =>
    i.textContent!.replace(/\s+/g, " ").trim(),
  );
async function open(root: ShadowRoot, entityId: string) {
  root
    .querySelector<HTMLButtonElement>(`[data-reading="${entityId}"]`)!
    .click();
  await vi.waitFor(() => expect(legend(root).length).toBeGreaterThan(0));
  await settle();
}

test("a measured oven temperature opens its history with the probe and the dashed setpoint", async () => {
  const { root, history, now } = await mount();
  const tile = root.querySelector(`[data-reading="${OVEN}"]`)!;
  expect(tile.tagName).toBe("BUTTON");
  await open(root, OVEN);
  const dialog = root.querySelector<HTMLDialogElement>("#history")!;
  expect(dialog.open).toBe(true);
  expect(history).toHaveBeenCalledTimes(1);
  const message = history.mock.calls[0][0];
  expect(message).toMatchObject({
    type: "history/history_during_period",
    entity_ids: [OVEN, PROBE, TARGET],
    minimal_response: true,
    no_attributes: true,
    significant_changes_only: false,
  });
  expect(Date.parse(String(message.start_time))).toBeCloseTo(
    now - 24 * HOUR,
    -4,
  );
  expect(legend(root)).toEqual([
    "Oven temperature 186 °C",
    "Meat probe 54 °C",
    "Oven target 180 °C",
  ]);
  expect(root.querySelector("#history-title")!.textContent).toContain(
    "Combination oven",
  );
  // The setpoint is dashed, in the colour of the reading it belongs to.
  const target = root.querySelector(
    `.history-chart [data-entity="${TARGET}"]`,
  )!;
  const oven = root.querySelector(`.history-chart [data-entity="${OVEN}"]`)!;
  expect(target.classList.contains("dashed")).toBe(true);
  expect(target.classList.contains("series-0")).toBe(true);
  expect(oven.classList.contains("series-0")).toBe(true);
  expect(
    root
      .querySelector(`[data-series="${TARGET}"]`)!
      .classList.contains("kind-step"),
  ).toBe(true);
  // The unavailable spell splits the oven line in two.
  expect(oven.getAttribute("d")!.match(/M/g)).toHaveLength(2);
  // One unit: no right-hand scale.
  expect(
    Array.from(root.querySelectorAll(".history-chart .unit")).map(
      (t) => t.textContent,
    ),
  ).toEqual(["°C"]);
});

test("reads values under the pointer, changes range and opens a reading's details", async () => {
  const { card, root, history, now } = await mount();
  await open(root, PROBE);
  const svg = root.querySelector<SVGSVGElement>(".history-chart")!;
  const box = svg.getBoundingClientRect();
  const width = svg.viewBox.baseVal.width;
  // One scale: the plot spans x 44 to width − 12; a third in is 16 hours ago.
  root.querySelector(".history-plot")!.dispatchEvent(
    new PointerEvent("pointermove", {
      clientX: box.left + ((44 + (width - 56) / 3) / width) * box.width,
    }),
  );
  await card.updateComplete;
  expect(legend(root)).toEqual([
    "Oven temperature 20 °C",
    "Meat probe 40 °C",
    "Oven target 200 °C",
  ]);
  expect(root.querySelector(".history-when")!.textContent!.trim()).not.toBe(
    "Now",
  );
  root
    .querySelector(".history-plot")!
    .dispatchEvent(new PointerEvent("pointerleave"));
  await card.updateComplete;
  expect(root.querySelector(".history-when")!.textContent!.trim()).toBe("Now");
  root.querySelector<HTMLButtonElement>('[data-range="6"]')!.click();
  await vi.waitFor(() => expect(history).toHaveBeenCalledTimes(2));
  expect(Date.parse(String(history.mock.calls[1][0].start_time))).toBeCloseTo(
    now - 6 * HOUR,
    -4,
  );
  await settle();
  expect(
    root.querySelector('[data-range="6"]')!.getAttribute("aria-pressed"),
  ).toBe("true");
  const info: string[] = [];
  card.addEventListener("hass-more-info", (e) =>
    info.push((e as CustomEvent).detail.entityId),
  );
  root.querySelector<HTMLButtonElement>(`[data-series="${TARGET}"]`)!.click();
  expect(info).toEqual([TARGET]);
  expect(root.querySelector<HTMLDialogElement>("#history")!.open).toBe(false);
});

test("a reading in another unit gets the right-hand scale; setpoints share their zone's colour", async () => {
  const { root } = await mount("refrigerator-card", "fridge");
  await open(root, "sensor.fridge_sensor_humidity");
  expect(legend(root)).toEqual([
    "Freezer temperature -17.5 °C",
    "Fridge temperature 4.6 °C",
    "Humidity 61 %",
    "Fridge target 4 °C",
    "Freezer target -18 °C",
    "Fridge door state Closed",
  ]);
  expect(
    Array.from(root.querySelectorAll(".history-chart .unit")).map(
      (t) => t.textContent,
    ),
  ).toEqual(["°C", "%"]);
  const cls = (id: string) =>
    root
      .querySelector(`.history-chart [data-entity="${id}"]`)!
      .getAttribute("class");
  expect(cls("sensor.fridge_sensor_temperature_memory_freezer")).toBe(
    "line series-0",
  );
  expect(cls("number.fridge_number_setpoint_freezer")).toBe(
    "line series-0 dashed",
  );
  expect(cls("sensor.fridge_sensor_temperature_ambient")).toBe("line series-1");
  expect(cls("number.fridge_number_fridge_temperature")).toBe(
    "line series-1 dashed",
  );
});

test("a setpoint the user renamed keeps its name; Bokmål target labels", async () => {
  const { root, snapshot } = await mount("refrigerator-card", "fridge", {
    language: "nb",
  });
  snapshot.entities.find(
    (e) => e.entity_id === "number.fridge_number_setpoint_freezer",
  )!.name = "Dypfryser";
  await open(root, "sensor.fridge_sensor_temperature_ambient");
  expect(legend(root).slice(-3, -1)).toEqual([
    "Kjøleskap, ønsket 4 °C",
    "Dypfryser −18 °C",
  ]);
});

test("timers, labels and controls do not open a history", async () => {
  const { card, root, hass } = await mount();
  hass.states["sensor.oven_sensor_operation_state"].state = "run";
  card.hass = { ...hass };
  await settle();
  const elapsed = root.querySelector(
    '[data-reading="sensor.oven_sensor_elapsed_program_time"]',
  )!;
  expect(elapsed.tagName).toBe("DIV");
  expect(
    root.querySelector('[data-reading="sensor.oven_sensor_oven_water_tank"]')!
      .tagName,
  ).toBe("DIV");
  // The target temperature stays a stepper.
  expect(root.querySelector(`input[data-entity="${TARGET}"]`)).not.toBeNull();
  expect(root.querySelector(`[data-reading="${TARGET}"]`)).toBeNull();
});

test("explains a failed history request in Bokmål", async () => {
  const { root } = await mount("oven-card", "oven", {
    fail: new Error("Recorder is off"),
    language: "nb",
  });
  root.querySelector<HTMLButtonElement>(`[data-reading="${OVEN}"]`)!.click();
  await vi.waitFor(() =>
    expect(
      root.querySelector("#history [role=alert] span")?.textContent?.trim(),
    ).toBe("Kunne ikke hente historikk: Recorder is off"),
  );
  expect(
    Array.from(root.querySelectorAll("[data-range]")).map((b) =>
      b.textContent!.trim(),
    ),
  ).toEqual(["6 t", "24 t", "7 d"]);
  expect(root.querySelector("#history-title")!.textContent).toContain(
    "Historikk",
  );
  expect(
    root.querySelector("[data-close-history]")!.getAttribute("aria-label"),
  ).toBe("Lukk historikk");
});

test("Bokmål formats history values with a decimal comma", async () => {
  const { root } = await mount("refrigerator-card", "fridge", {
    language: "nb-NO",
  });
  await open(root, "sensor.fridge_sensor_temperature_memory_freezer");
  expect(legend(root)[0]).toBe("Freezer temperature −17,5 °C");
  expect(root.querySelector(".history-when")!.textContent!.trim()).toBe("Nå");
});

test("choosing another appliance closes the history and drops a late reply", async () => {
  const { card, root, history } = await mount();
  let release!: (v: Record<string, unknown[]>) => void;
  history.mockImplementationOnce(
    () => new Promise((resolve) => (release = resolve)),
  );
  root.querySelector<HTMLButtonElement>(`[data-reading="${OVEN}"]`)!.click();
  await vi.waitFor(() => expect(history).toHaveBeenCalledTimes(1));
  card.setConfig({ type: "custom:refrigerator-card", device: "fridge" });
  release({ [OVEN]: [] });
  await settle();
  expect(root.querySelector<HTMLDialogElement>("#history")!.open).toBe(false);
  expect(legend(root)).toEqual([]);
});

const last = (items: string[]) => items[items.length - 1];

/** Move the pointer to `hoursAgo` on a one-scale chart of the last 24 hours. */
async function hover(
  card: { updateComplete: Promise<boolean> },
  root: ShadowRoot,
  hoursAgo: number,
) {
  const svg = root.querySelector<SVGSVGElement>(".history-chart")!;
  const box = svg.getBoundingClientRect();
  const width = svg.viewBox.baseVal.width;
  const ratio = (24 - hoursAgo) / 24;
  root.querySelector(".history-plot")!.dispatchEvent(
    new PointerEvent("pointermove", {
      clientX: box.left + ((44 + (width - 56) * ratio) / width) * box.width,
    }),
  );
  await card.updateComplete;
}

test("a door opens its appliance's history with the door as a lane of open spells", async () => {
  const { card, root, history } = await mount("refrigerator-card", "fridge");
  const tile = root.querySelector(`[data-reading="${DOOR}"]`)!;
  expect(tile.tagName).toBe("BUTTON");
  await open(root, DOOR);
  expect(history.mock.calls[0][0].entity_ids).toEqual([
    "sensor.fridge_sensor_temperature_memory_freezer",
    "sensor.fridge_sensor_temperature_ambient",
    "number.fridge_number_fridge_temperature",
    "number.fridge_number_setpoint_freezer",
    DOOR,
  ]);
  expect(legend(root)).toEqual([
    "Freezer temperature -17.5 °C",
    "Fridge temperature 4.6 °C",
    "Fridge target 4 °C",
    "Freezer target -18 °C",
    "Fridge door state Closed",
  ]);
  const lane = root.querySelector(
    `.history-chart .history-lane[data-entity="${DOOR}"]`,
  )!;
  expect(lane).not.toBeNull();
  // Two reported spells, split by the unavailable one; one of them open.
  expect(lane.querySelectorAll(".lane-track")).toHaveLength(4);
  expect(lane.querySelectorAll(".lane-on")).toHaveLength(1);
  // A door is not a line and brings no scale of its own.
  expect(
    root.querySelector(`.history-chart path[data-entity="${DOOR}"]`),
  ).toBeNull();
  expect(
    Array.from(root.querySelectorAll(".history-chart .unit")).map(
      (t) => t.textContent,
    ),
  ).toEqual(["°C"]);

  await hover(card, root, 18);
  expect(last(legend(root))).toBe("Fridge door state Open");
  await hover(card, root, 11);
  expect(last(legend(root))).toBe("Fridge door state —");
  await hover(card, root, 2);
  expect(last(legend(root))).toBe("Fridge door state Closed");

  const info: string[] = [];
  card.addEventListener("hass-more-info", (e) =>
    info.push((e as CustomEvent).detail.entityId),
  );
  root.querySelector<HTMLButtonElement>(`[data-series="${DOOR}"]`)!.click();
  expect(info).toEqual([DOOR]);
});

test("a temperature's history shows the doors too", async () => {
  const { root } = await mount("refrigerator-card", "fridge");
  await open(root, "sensor.fridge_sensor_temperature_memory_freezer");
  expect(last(legend(root))).toBe("Fridge door state Closed");
  expect(
    root.querySelector(`.history-chart .history-lane[data-entity="${DOOR}"]`),
  ).not.toBeNull();
});

test("an appliance with only a door draws just its lane; Bokmål door states", async () => {
  const { root, add, card, hass } = await mount("dishwasher-card", "dish", {
    language: "nb",
  });
  const door = add("dish", "sensor", "sensor_door_state", "open", {
    device_class: "enum",
    options: ["open", "closed", "locked"],
  });
  card.hass = { ...hass };
  await settle();
  await open(root, door);
  expect(legend(root)).toEqual([expect.stringMatching(/ Åpen$/)]);
  expect(root.querySelector(".history-chart .unit")).toBeNull();
  expect(root.querySelectorAll(".history-chart .history-lane")).toHaveLength(1);
  expect(root.querySelector(".history-chart path.line")).toBeNull();
});

test("opens Home Assistant's details instead when the card is set to", async () => {
  const { card, root, history } = await mount();
  (
    card as unknown as { setConfig(c: Record<string, unknown>): void }
  ).setConfig({
    type: "custom:oven-card",
    device: "oven",
    history: "more-info",
  });
  await settle();
  const info: string[] = [];
  card.addEventListener("hass-more-info", (e) =>
    info.push((e as CustomEvent).detail.entityId),
  );
  root.querySelector<HTMLButtonElement>(`[data-reading="${OVEN}"]`)!.click();
  await settle();
  expect(info).toEqual([OVEN]);
  expect(history).not.toHaveBeenCalled();
  expect(root.querySelector<HTMLDialogElement>("#history")!.open).toBe(false);
});
