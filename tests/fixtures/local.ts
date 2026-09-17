import type { HassStates, RegistrySnapshot } from "../../src/types";
/** Synthetic registry/state fixture derived from Home Connect Local
 * 27ee7995d722e0a339cd4946e6f127d4c302150d. No live instance data.
 * microwave_power / steam_level are explicit capability-extension examples;
 * current upstream does not publish those two descriptions. */
export function localFixture() {
  const registry: RegistrySnapshot = {
    devices: [
      {
        id: "oven",
        name: "Oven",
        model: "Combination oven",
        area_id: "kitchen",
      },
      { id: "dish", name: "Dishwasher", area_id: "kitchen" },
      { id: "coffee", name: "Coffee machine", area_id: "kitchen" },
      { id: "fridge", name: "Refrigerator", area_id: "kitchen" },
      { id: "generic", name: "Unclassified appliance" },
      { id: "cloud", name: "Cloud oven" },
    ],
    entities: [],
    areas: [{ area_id: "kitchen", name: "Kitchen" }],
    labels: [],
  };
  const states: HassStates = {};
  function add(
    device: string,
    key: string,
    state: string,
    attributes: Record<string, unknown> = {},
    entityId?: string,
  ) {
    const domain = key.startsWith("binary_")
      ? "binary_sensor"
      : key === "connection"
        ? "binary_sensor"
        : key.split("_")[0];
    const id = entityId ?? `${domain}.${device}_${key}`;
    registry.entities.push({
      entity_id: id,
      device_id: device,
      platform: device === "cloud" ? "home_connect" : "homeconnect_ws",
      unique_id: `serial-${device}-${key}`,
    });
    states[id] = { entity_id: id, state, attributes };
    return id;
  }
  add("oven", "sensor_operation_state", "run", {}, "sensor.renamed");
  add("oven", "connection", "on");
  add("oven", "sensor_program_progress", "37");
  add("oven", "sensor_remaining_program_time", "0.5", {
    unit_of_measurement: "h",
  });
  add("oven", "number_oven_setpoint_temperature", "180", {
    unit_of_measurement: "°C",
  });
  add("oven", "sensor_oven_current_temperature_1", "172", {
    unit_of_measurement: "°C",
  });
  add("oven", "sensor_oven_water_tank_1", "ok");
  add("oven", "select_microwave_power", "600", { options: ["600", "900"] });
  add("oven", "select_steam_level", "medium", {
    options: ["low", "medium", "high"],
  });
  add("oven", "button_start_program", "unknown");
  add("oven", "binary_remote_start_allowed", "on");
  add("dish", "sensor_operation_state", "ready");
  add("dish", "sensor_salt", "full");
  add("dish", "sensor_rinse_aid", "nearly_empty");
  add("dish", "switch_half_load", "off");
  add("coffee", "sensor_operation_state", "ready");
  add("coffee", "sensor_water_tank", "full");
  add("coffee", "sensor_drip_tray", "full");
  add("coffee", "select_bean_amount", "normal", {
    options: ["normal", "strong"],
  });
  add("fridge", "number_setpoint_freezer", "-18", {
    unit_of_measurement: "°C",
  });
  add("fridge", "number_setpoint_refrigerator", "4", {
    unit_of_measurement: "°C",
  });
  add("fridge", "binary_sensor_freezer_door_state", "off");
  add("fridge", "binary_sensor_fridge_door_state", "on");
  add("generic", "sensor_operation_state", "unknown");
  add("cloud", "sensor_operation_state", "run");
  return { registry, states, add };
}
