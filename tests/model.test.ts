import { describe, expect, it } from "vitest";
import {
  applianceStatus,
  discoverAppliances,
  selectAppliances,
} from "../src/model";
import { localFixture } from "./fixtures/local";
import type { ApplianceConfig } from "../src/types";
const config = (extra: Record<string, unknown> = {}): ApplianceConfig => ({
  type: "custom:appliance-card",
  appearance: "default",
  expand: false,
  confirm_start: true,
  ...extra,
});
function setup() {
  const f = localFixture();
  return { ...f, devices: discoverAppliances(f.registry, f.states) };
}
describe("Local discovery", () => {
  it("keeps local devices and resolves renamed semantic IDs with all zone entities", () => {
    const f = setup();
    expect(f.devices.map((d) => d.id)).toEqual([
      "oven",
      "dish",
      "coffee",
      "fridge",
      "generic",
    ]);
    expect(f.devices.map((d) => d.kind)).toEqual([
      "oven",
      "dishwasher",
      "coffee",
      "cooling",
      "unknown",
    ]);
    expect(
      f.devices[0].entities.find((e) => e.entityId === "sensor.renamed")?.role,
    ).toBe("operation");
    expect(f.devices[3].entities.filter((e) => e.role === "door")).toHaveLength(
      2,
    );
    expect(
      f.devices[3].entities.filter((e) => e.role === "cooling_setpoint"),
    ).toHaveLength(2);
    expect(
      f.devices[0].entities.find((e) =>
        e.registry.unique_id.endsWith("select_microwave_power"),
      )?.role,
    ).toBe("option");
    expect(
      f.devices[0].entities.find((e) =>
        e.registry.unique_id.endsWith("select_steam_level"),
      )?.role,
    ).toBe("option");
  });
  it("counts disabled entries without presenting them as usable and preserves unknown controls", () => {
    const f = localFixture();
    f.registry.entities[0].disabled_by = "user";
    const id = f.add("oven", "button_mystery_command", "unknown");
    const d = discoverAppliances(f.registry, f.states)[0];
    expect(d.disabledCount).toBe(1);
    expect(d.entities.some((e) => e.entityId === "sensor.renamed")).toBe(false);
    expect(d.entities.find((e) => e.entityId === id)?.role).toBe("other");
  });
  it("prefers stable metadata and never treats user renames or generic temperature classes as type/target evidence", () => {
    const f = localFixture();
    f.registry.devices[4].name_by_user = "My oven";
    const id = f.add("generic", "number_unrelated", "10", {
      device_class: "temperature",
    });
    const d = discoverAppliances(f.registry, f.states)[4];
    expect(d.kind).toBe("unknown");
    expect(d.entities.find((e) => e.entityId === id)?.role).toBe("other");
    expect(
      discoverAppliances(f.registry, f.states)[0].entities.find(
        (e) => e.entityId === "sensor.renamed",
      )?.name,
    ).toBe("Operation state");
  });
});
describe("status", () => {
  it("normalizes active lifecycle and duration units without counting progress as activity", () => {
    const f = setup();
    const s = applianceStatus(f.devices[0], f.states, 1_000_000);
    expect(s).toMatchObject({
      operation: "running",
      busy: true,
      online: "online",
      progress: 37,
      remainingSeconds: 1800,
      estimatedFinish: 2_800_000,
    });
    f.states["sensor.renamed"].state = "ready";
    expect(applianceStatus(f.devices[0], f.states).busy).toBe(false);
  });
  it.each([
    ["delayedstart", "delayed", true],
    ["pause", "paused", true],
    ["actionrequired", "action_required", true],
    ["aborting", "aborting", true],
    ["finished", "finished", false],
    ["error", "error", false],
    ["inactive", "off", false],
    ["surprise", "unknown", false],
  ])("normalizes %s", (value, want, busy) => {
    const f = setup();
    f.states["sensor.renamed"].state = value;
    expect(applianceStatus(f.devices[0], f.states)).toMatchObject({
      operation: want,
      busy,
    });
  });
  it("distinguishes lost connection, missing states and unknown readings", () => {
    const f = setup();
    f.states["binary_sensor.oven_connection"].state = "off";
    expect(applianceStatus(f.devices[0], f.states)).toMatchObject({
      operation: "offline",
      online: "offline",
      busy: false,
    });
    expect(applianceStatus(f.devices[0], {})).toMatchObject({
      operation: "unknown",
      online: "unknown",
    });
    expect(applianceStatus(f.devices[4], f.states).operation).toBe("unknown");
  });
  it("treats consumable full by semantic key and adds door attention", () => {
    const f = setup();
    expect(
      applianceStatus(f.devices[1], f.states).attention.map((a) => a.entityId),
    ).toEqual(["sensor.dish_sensor_rinse_aid"]);
    expect(
      applianceStatus(f.devices[2], f.states).attention.map((a) => a.entityId),
    ).toEqual(["sensor.coffee_sensor_drip_tray"]);
    expect(
      applianceStatus(f.devices[3], f.states).attention.map((a) => a.entityId),
    ).toEqual(["binary_sensor.fridge_binary_sensor_fridge_door_state"]);
  });
  it("does not invent timestamps and validates numbers", () => {
    const f = setup();
    f.states["sensor.oven_sensor_remaining_program_time"].state = "NaN";
    const s = applianceStatus(f.devices[0], f.states);
    expect(s.remainingSeconds).toBeUndefined();
    expect(s.lastReported).toBeUndefined();
    expect(s.finishedAt).toBeUndefined();
  });
});
describe("selection", () => {
  it("resolves area and explicit IDs/names and rejects ambiguous names", () => {
    const f = setup();
    expect(
      selectAppliances(f.devices, config({ area: "Kitchen" }), f.registry)
        .devices,
    ).toHaveLength(4);
    expect(
      selectAppliances(f.devices, config({ device: "oven" }), f.registry)
        .devices[0].id,
    ).toBe("oven");
    expect(
      selectAppliances(
        f.devices,
        config({ device: "Coffee machine" }),
        f.registry,
      ).devices[0].id,
    ).toBe("coffee");
    f.devices[1].name = "Oven";
    const s = selectAppliances(
      f.devices,
      config({ device: "Oven" }),
      f.registry,
    );
    expect(s.error).toMatch(/ambiguous/i);
    expect(s.devices).toEqual([]);
    expect(
      selectAppliances(f.devices, config({ device: "missing" }), f.registry)
        .error,
    ).toMatch(/not found/i);
  });
});

describe("role fallback and telemetry edges", () => {
  it("uses legacy suffixes only when the semantic unique key is absent", () => {
    const f = localFixture();
    const legacy = f.add(
      "generic",
      "sensor_placeholder",
      "run",
      {},
      "sensor.unit_operation_state",
    );
    f.registry.entities.find((e) => e.entity_id === legacy)!.unique_id =
      "legacy-id";
    const conflict = f.add(
      "generic",
      "button_unknown_command",
      "unknown",
      {},
      "button.unit_start_program",
    );
    const devices = discoverAppliances(f.registry, f.states);
    expect(devices[4].entities.find((e) => e.entityId === legacy)?.role).toBe(
      "operation",
    );
    expect(devices[4].entities.find((e) => e.entityId === conflict)?.role).toBe(
      "other",
    );
  });
  it("does not conceal unfamiliar consumable enum readings as healthy", () => {
    const f = setup();
    f.states["sensor.coffee_sensor_water_tank"].state = "new_firmware_value";
    expect(
      applianceStatus(f.devices[2], f.states).attention.find(
        (a) => a.entityId === "sensor.coffee_sensor_water_tank",
      )?.severity,
    ).toBe("unknown");
  });
  it("converts minutes, rejects negative/unknown units and omits paused estimates", () => {
    const f = setup();
    const remaining = f.states["sensor.oven_sensor_remaining_program_time"];
    remaining.state = "12";
    remaining.attributes.unit_of_measurement = "min";
    expect(applianceStatus(f.devices[0], f.states).remainingSeconds).toBe(720);
    remaining.state = "-2";
    expect(
      applianceStatus(f.devices[0], f.states).remainingSeconds,
    ).toBeUndefined();
    remaining.state = "12";
    remaining.attributes.unit_of_measurement = "fortnights";
    expect(
      applianceStatus(f.devices[0], f.states).remainingSeconds,
    ).toBeUndefined();
    remaining.attributes.unit_of_measurement = "s";
    f.states["sensor.renamed"].state = "pause";
    expect(
      applianceStatus(f.devices[0], f.states).estimatedFinish,
    ).toBeUndefined();
  });
  it("exposes all-unavailable as offline and uses only reported timestamps", () => {
    const f = setup();
    const ovenStates = Object.fromEntries(
      f.devices[0].entities.map((e) => [
        e.entityId,
        { entity_id: e.entityId, state: "unavailable", attributes: {} },
      ]),
    );
    expect(applianceStatus(f.devices[0], ovenStates).operation).toBe("offline");
    f.states["sensor.renamed"].last_updated = "2026-09-17T12:00:00Z";
    f.states["sensor.renamed"].last_changed = "2026-09-17T11:00:00Z";
    expect(applianceStatus(f.devices[0], f.states).lastReported).toBe(
      "2026-09-17T12:00:00Z",
    );
  });
});

describe("care and cooling alerts", () => {
  it("recognizes compartment alarm keys without requiring optional device classes", () => {
    const f = localFixture();
    const id = f.add("fridge", "binary_sensor_temperature_alarm_freezer", "on");
    const door = f.add(
      "fridge",
      "binary_sensor_door_alarm_chiller_common",
      "on",
    );
    const d = discoverAppliances(f.registry, f.states)[3];
    expect(d.entities.find((e) => e.entityId === id)?.role).toBe("attention");
    expect(
      applianceStatus(d, f.states).attention.map((a) => a.entityId),
    ).toContain(door);
  });
  it("alerts when remaining care counts reach zero while keeping positive counts healthy", () => {
    const f = localFixture();
    const due = f.add("coffee", "sensor_countdown_descaling", "0");
    const later = f.add("coffee", "sensor_countdown_cleaning", "25");
    const d = discoverAppliances(f.registry, f.states)[2];
    const alerts = applianceStatus(d, f.states).attention;
    expect(alerts.map((a) => a.entityId)).toContain(due);
    expect(alerts.map((a) => a.entityId)).not.toContain(later);
  });
});
it("falls back to multi-compartment semantic suffixes on legacy registry entries", () => {
  const f = localFixture();
  const id = f.add(
    "fridge",
    "number_placeholder",
    "4",
    {},
    "number.my_appliance_setpoint_refrigerator",
  );
  const door = f.add(
    "fridge",
    "binary_sensor_placeholder",
    "on",
    {},
    "binary_sensor.my_appliance_freezer_door_state",
  );
  f.registry.entities
    .filter((e) => e.entity_id === id || e.entity_id === door)
    .forEach((e) => (e.unique_id = "legacy"));
  const d = discoverAppliances(f.registry, f.states)[3];
  expect(d.entities.find((e) => e.entityId === id)?.role).toBe(
    "cooling_setpoint",
  );
  expect(d.entities.find((e) => e.entityId === door)?.role).toBe("door");
});

describe("integration edge cases", () => {
  it("treats explicitly unavailable operation as offline despite available diagnostics", () => {
    const f = setup();
    f.states["sensor.renamed"].state = "unavailable";
    expect(applianceStatus(f.devices[0], f.states)).toMatchObject({
      operation: "offline",
      online: "offline",
      busy: false,
    });
  });
  it("recognizes legacy fridge/freezer number and super mode aliases", () => {
    const f = localFixture();
    const fridge = f.add("fridge", "number_fridge_temperature", "4");
    const freezer = f.add("fridge", "number_freezer_temperature", "-18");
    const superFridge = f.add("fridge", "switch_super_mode_fridge", "off");
    const superFreezer = f.add("fridge", "switch_super_mode_freezer", "on");
    const d = discoverAppliances(f.registry, f.states)[3];
    for (const id of [fridge, freezer])
      expect(d.entities.find((e) => e.entityId === id)?.role).toBe(
        "cooling_setpoint",
      );
    for (const id of [superFridge, superFreezer])
      expect(d.entities.find((e) => e.entityId === id)?.role).toBe(
        "super_mode",
      );
  });
  it("recognizes legacy low consumable enums as warnings", () => {
    const f = setup();
    f.states["sensor.dish_sensor_salt"].state = "low";
    expect(
      applianceStatus(f.devices[1], f.states).attention.find(
        (a) => a.entityId === "sensor.dish_sensor_salt",
      )?.severity,
    ).toBe("warning");
  });
});
