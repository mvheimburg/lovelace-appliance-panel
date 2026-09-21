import type {
  RegistrySnapshot,
  HassConnection,
  HassStates,
  HomeAssistant,
} from "../src/types";
// Synthetic data from Local description keys, with explicit firmware extensions for modules.
export function fixture() {
  const snapshot: RegistrySnapshot = {
    devices: [
      {
        id: "oven",
        name: "Combination oven",
        model: "Oven",
        area_id: "kitchen",
      },
      {
        id: "dish",
        name: "Dishwasher",
        model: "Dishwasher",
        area_id: "kitchen",
      },
      {
        id: "coffee",
        name: "Coffee machine",
        model: "CoffeeMaker",
        area_id: "kitchen",
      },
      {
        id: "fridge",
        name: "Refrigerator",
        model: "Refrigerator",
        area_id: "kitchen",
      },
    ],
    entities: [],
    areas: [{ area_id: "kitchen", name: "Kitchen" }],
    labels: [],
  };
  const states: HassStates = {};
  function add(
    device: string,
    domain: string,
    key: string,
    state: string,
    attributes: Record<string, unknown> = {},
  ) {
    const entity_id = `${domain}.${device}_${key}`;
    snapshot.entities.push({
      entity_id,
      device_id: device,
      platform: "homeconnect_ws",
      unique_id: `device-${device}-${key}`,
      disabled_by: null,
    });
    states[entity_id] = {
      entity_id,
      state,
      attributes,
      last_updated: "2026-09-17T12:00:00Z",
      last_changed: "2026-09-17T12:00:00Z",
    };
    return entity_id;
  }
  for (const id of ["oven", "dish", "coffee"]) {
    add(id, "sensor", "sensor_operation_state", "ready", {
      device_class: "enum",
    });
    add(
      id,
      "select",
      "select_program",
      id === "coffee" ? "espresso" : id === "dish" ? "eco" : "hot_air",
      {
        options:
          id === "coffee"
            ? ["espresso", "cappuccino", "latte"]
            : id === "dish"
              ? ["eco", "auto", "intensive"]
              : ["hot_air", "eco", "grill"],
      },
    );
    add(id, "button", "button_start_program", "unknown");
    add(id, "button", "button_abort_program", "unknown");
    add(id, "button", "button_pause_program", "unknown");
    add(id, "button", "button_resume_program", "unknown");
    add(id, "binary_sensor", "binary_remote_start_allowed", "on");
    add(id, "sensor", "sensor_program_progress", "25", {
      unit_of_measurement: "%",
    });
    add(id, "sensor", "sensor_remaining_program_time", "900", {
      unit_of_measurement: "s",
      device_class: "duration",
    });
  }
  add("oven", "number", "number_oven_setpoint_temperature", "180", {
    min: 30,
    max: 250,
    step: 5,
    unit_of_measurement: "°C",
  });
  add("oven", "number", "number_microwave_power", "600", {
    min: 90,
    max: 900,
    step: 10,
    unit_of_measurement: "W",
  });
  add("oven", "select", "select_steam_level", "medium", {
    options: ["low", "medium", "high"],
  });
  add("oven", "sensor", "sensor_oven_water_tank", "full");
  add("dish", "switch", "switch_vario_speed_plus", "off");
  add("dish", "sensor", "sensor_salt", "low");
  add("dish", "sensor", "sensor_rinse_aid", "nearly_empty");
  add("coffee", "select", "select_bean_amount", "normal", {
    options: ["mild", "normal", "strong"],
  });
  add("coffee", "sensor", "sensor_water_tank", "empty");
  add("fridge", "number", "number_fridge_temperature", "4", {
    min: 2,
    max: 8,
    step: 1,
    unit_of_measurement: "°C",
  });
  add("fridge", "binary_sensor", "binary_sensor_fridge_door_state", "off", {
    device_class: "door",
  });
  add("fridge", "switch", "switch_super_mode_fridge", "off");
  add("fridge", "switch", "switch_refrigerator_vacation", "off");
  return { snapshot, states, add };
}
export class FixtureConnection implements HassConnection {
  connected = true;
  readonly events = new Map<string, Set<(event: any) => void>>();
  readonly lifecycleListeners = new Map<string, Set<() => void>>();
  constructor(public snapshot: RegistrySnapshot) {}
  async sendMessagePromise<T>({ type }: { type: string }): Promise<T> {
    const key = (
      {
        entity_registry: "entities",
        device_registry: "devices",
        area_registry: "areas",
        label_registry: "labels",
      } as const
    )[type.split("/")[1] as "entity_registry"];
    return this.snapshot[key] as T;
  }
  async subscribeEvents<T>(callback: (event: T) => void, type: string) {
    const list = this.events.get(type) ?? new Set();
    list.add(callback);
    this.events.set(type, list);
    return () => {
      list.delete(callback);
    };
  }
  addEventListener(type: "ready" | "disconnected", callback: () => void) {
    const list = this.lifecycleListeners.get(type) ?? new Set();
    list.add(callback);
    this.lifecycleListeners.set(type, list);
  }
  removeEventListener(type: "ready" | "disconnected", callback: () => void) {
    this.lifecycleListeners.get(type)?.delete(callback);
  }
  emit(type: string) {
    this.events.get(type)?.forEach((cb) => cb({}));
  }
  lifecycle(type: "ready" | "disconnected") {
    if (type === "ready") this.reconnect();
    else this.disconnect();
  }
  disconnect() {
    this.connected = false;
    this.lifecycleListeners.get("disconnected")?.forEach((cb) => cb());
  }
  reconnect() {
    this.connected = true;
    this.lifecycleListeners.get("ready")?.forEach((cb) => cb());
  }
}
export async function settle() {
  await new Promise((resolve) => setTimeout(resolve, 15));
}
export function makeHass() {
  const data = fixture();
  const calls: unknown[][] = [];
  const connection = new FixtureConnection(data.snapshot);
  const hass: HomeAssistant = {
    connection,
    states: data.states,
    language: "en",
    callService: async (...args) => {
      calls.push(args);
    },
  };
  return { ...data, hass, connection, calls };
}
