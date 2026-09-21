const { chromium } = require("playwright");
const { readFileSync, mkdirSync } = require("node:fs");
const { resolve } = require("node:path");

const root = resolve(__dirname, "..");

const light = `--primary-text-color: #1b1b1a; --secondary-text-color: #5b5a55; --card-background-color: #fff; --secondary-background-color: #f3f2ee; --divider-color: #e4e2dc; --primary-color: #1d4ed8; --success-color: #2e7d32; --warning-color: #f59e0b; --error-color: #c62828; --orange-color: #ea580c; --disabled-text-color: #8a8984; background: #eeede9;`;
const dark = `--primary-text-color: #ecebe8; --secondary-text-color: #a9a8a3; --card-background-color: #1a1c20; --secondary-background-color: #25272c; --divider-color: #2f3137; --primary-color: #8ab4f8; --success-color: #4caf50; --warning-color: #ffa600; --error-color: #ef5350; --orange-color: #ff9800; --disabled-text-color: #6f6f6f; --bubble-main-background-color: #1a1c20; --bubble-secondary-background-color: #25272c; --bubble-border-radius: 32px; --bubble-sub-button-border-radius: 22px; background: #121316;`;

/** Simulated Home Connect Local registries and states: no live Home Assistant. */
function simulate() {
  const devices = [
    { id: "oven", name: "Combination oven", model: "Oven", area_id: "kitchen" },
    { id: "dish", name: "Dishwasher", model: "Dishwasher", area_id: "kitchen" },
    {
      id: "coffee",
      name: "Coffee machine",
      model: "CoffeeMaker",
      area_id: "kitchen",
    },
    {
      id: "fridge",
      name: "Fridge freezer",
      model: "FridgeFreezer",
      area_id: "kitchen",
    },
  ];
  const entities = [];
  const states = {};
  const stamp = new Date().toISOString();
  const add = (device, domain, key, state, name, attributes = {}) => {
    const entity_id = `${domain}.${device}_${key}`;
    entities.push({
      entity_id,
      device_id: device,
      platform: "homeconnect_ws",
      unique_id: `sim-${device}-${key}`,
      original_name: name,
      disabled_by: null,
    });
    states[entity_id] = {
      entity_id,
      state,
      attributes,
      last_updated: stamp,
      last_changed: stamp,
    };
  };
  const programs = {
    oven: ["hot_air", "top_bottom_heating", "pizza", "grill", "steam_cooking"],
    dish: ["eco_50", "auto_2", "intensive_70", "quick_45", "glass_40"],
    coffee: ["espresso", "coffee", "cappuccino", "latte_macchiato"],
  };
  const program = {
    oven: "hot_air",
    dish: "eco_50",
    coffee: "cappuccino",
  };
  for (const id of ["oven", "dish", "coffee"]) {
    add(id, "switch", "switch_power_state", "on", "Power");
    add(
      id,
      "sensor",
      "sensor_operation_state",
      id === "oven"
        ? "BSH.Common.EnumType.OperationState.Run"
        : "BSH.Common.EnumType.OperationState.Ready",
      "Operation state",
    );
    add(id, "select", "select_program", program[id], "Programme", {
      options: programs[id],
    });
    for (const button of ["start", "abort", "pause", "resume"])
      add(id, "button", `button_${button}_program`, "unknown", button);
    add(
      id,
      "binary_sensor",
      "binary_remote_start_allowed",
      "on",
      "Remote start",
    );
    add(id, "switch", "switch_child_lock", "off", "Child lock");
  }
  add("oven", "sensor", "sensor_program_progress", "45", "Progress", {
    unit_of_measurement: "%",
  });
  add("oven", "sensor", "sensor_remaining_program_time", "2460", "Remaining", {
    unit_of_measurement: "s",
    device_class: "duration",
  });
  add("oven", "sensor", "sensor_program_phase", "heating", "Phase");
  add(
    "oven",
    "number",
    "number_oven_setpoint_temperature",
    "200",
    "Target temperature",
    {
      min: 30,
      max: 250,
      step: 5,
      unit_of_measurement: "°C",
    },
  );
  add(
    "oven",
    "sensor",
    "sensor_oven_current_temperature",
    "186",
    "Oven temperature",
    {
      unit_of_measurement: "°C",
    },
  );
  add("oven", "number", "number_microwave_power", "600", "Microwave power", {
    min: 90,
    max: 900,
    step: 90,
    unit_of_measurement: "W",
  });
  add("oven", "select", "select_steam_level", "medium", "Steam level", {
    options: ["low", "medium", "high"],
  });
  add("oven", "sensor", "sensor_oven_water_tank", "full", "Water tank");
  add("oven", "switch", "switch_oven_fast_pre_heat", "off", "Fast preheat");
  add("dish", "switch", "switch_vario_speed_plus", "on", "Vario speed");
  add("dish", "switch", "switch_half_load", "off", "Half load");
  add("dish", "switch", "switch_extra_dry_option", "off", "Extra dry");
  add("dish", "sensor", "sensor_salt", "low", "Salt");
  add("dish", "sensor", "sensor_rinse_aid", "ok", "Rinse aid");
  add("dish", "binary_sensor", "binary_sensor_door_state", "off", "Door", {
    device_class: "door",
  });
  add("coffee", "select", "select_bean_amount", "strong", "Bean amount", {
    options: ["mild", "normal", "strong"],
  });
  add("coffee", "select", "select_beverage_size", "medium", "Cup size", {
    options: ["small", "medium", "large"],
  });
  add("coffee", "sensor", "sensor_water_tank", "empty", "Water tank");
  add("coffee", "sensor", "sensor_drip_tray", "ok", "Drip tray");
  add("fridge", "number", "number_setpoint_refrigerator", "4", "Fridge", {
    min: 2,
    max: 8,
    step: 1,
    unit_of_measurement: "°C",
  });
  add("fridge", "number", "number_setpoint_freezer", "-18", "Freezer", {
    min: -24,
    max: -16,
    step: 1,
    unit_of_measurement: "°C",
  });
  add(
    "fridge",
    "binary_sensor",
    "binary_sensor_fridge_door_state",
    "off",
    "Fridge door",
    { device_class: "door" },
  );
  add("fridge", "switch", "switch_super_refrigerator", "off", "Super cooling");
  add("fridge", "switch", "switch_refrigerator_vacation", "off", "Vacation");
  return {
    snapshot: {
      devices,
      entities,
      areas: [{ area_id: "kitchen", name: "Kitchen" }],
      labels: [],
    },
    states,
  };
}

const labels = {
  hot_air: "Hot air",
  top_bottom_heating: "Top/bottom heat",
  pizza: "Pizza",
  grill: "Grill",
  steam_cooking: "Steam cooking",
  eco_50: "Eco 50°",
  auto_2: "Auto 45–65°",
  intensive_70: "Intensive 70°",
  quick_45: "Quick 45°",
  glass_40: "Glass 40°",
  espresso: "Espresso",
  coffee: "Caffè crema",
  cappuccino: "Cappuccino",
  latte_macchiato: "Latte macchiato",
  heating: "Heating",
  ok: "OK",
  small: "Small",
  large: "Large",
};

async function shot(
  browser,
  errors,
  { file, width, height = 400, theme, appearance, cards, open },
) {
  const page = await browser.newPage({
    viewport: { width, height },
    deviceScaleFactor: 1,
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setContent(`<style>
    body { margin: 0; padding: 28px; font: 15px system-ui, sans-serif; ${theme} }
    main { display: flex; gap: 24px; align-items: flex-start; }
    main > * { display: block; flex: 0 0 380px; }
  </style><main></main>`);
  await page.addScriptTag({
    type: "module",
    content: readFileSync(
      resolve(root, "dist/appliance-panel-card.js"),
      "utf8",
    ),
  });
  await page.evaluate(
    async ({ cards, appearance, data, labels, open }) => {
      const connection = {
        connected: true,
        async sendMessagePromise({ type }) {
          const key = {
            entity_registry: "entities",
            device_registry: "devices",
            area_registry: "areas",
            label_registry: "labels",
          }[type.split("/")[1]];
          return data.snapshot[key];
        },
        async subscribeEvents() {
          return () => {};
        },
        addEventListener() {},
        removeEventListener() {},
      };
      const hass = {
        connection,
        states: data.states,
        language: "en-GB",
        locale: { language: "en-GB" },
        formatEntityState(state, value = state.state) {
          const unit = state.attributes.unit_of_measurement;
          if (labels[value]) return labels[value];
          if (unit === "°C") return `${value} °C`;
          if (unit === "W") return `${value} W`;
          return value;
        },
        callService: async () => {},
      };
      for (const [type, config] of cards) {
        await customElements.whenDefined(type);
        const card = document.createElement(type);
        card.setConfig({ type: `custom:${type}`, appearance, ...config });
        card.hass = hass;
        document.querySelector("main").append(card);
      }
      await new Promise((r) => setTimeout(r, 200));
      if (open) {
        const card = document.querySelectorAll("main > *")[open.index];
        card.shadowRoot.querySelector(open.selector).click();
        await new Promise((r) => setTimeout(r, 200));
      }
    },
    { cards, appearance, data: simulate(), labels, open },
  );
  await page.waitForFunction(
    (count) =>
      [...document.querySelectorAll("main > *")].filter((card) =>
        card.shadowRoot?.querySelector("ha-card .top, ha-card .hero"),
      ).length === count,
    cards.length,
  );
  await page.screenshot({ path: resolve(root, "docs", file), fullPage: true });
  await page.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const errors = [];
    mkdirSync(resolve(root, "docs"), { recursive: true });
    const cards = [
      ["kitchen-panel-card", { area: "Kitchen" }],
      ["oven-card", { device: "oven" }],
      ["dishwasher-card", { device: "dish" }],
    ];
    const more = [
      ["coffee-machine-card", { device: "coffee" }],
      ["refrigerator-card", { device: "fridge" }],
    ];
    await shot(browser, errors, {
      file: "appliance-panel-dark.png",
      width: 1300,
      theme: dark,
      appearance: "bubble",
      cards,
    });
    await shot(browser, errors, {
      file: "appliance-panel-light.png",
      width: 1300,
      theme: light,
      appearance: "default",
      cards,
    });
    await shot(browser, errors, {
      file: "appliance-panel-more.png",
      width: 880,
      theme: light,
      appearance: "default",
      cards: more,
    });
    await shot(browser, errors, {
      file: "appliance-panel-settings.png",
      width: 880,
      height: 860,
      theme: dark,
      appearance: "bubble",
      cards: [cards[1], cards[2]],
      open: { index: 1, selector: "[data-configure]" },
    });
    if (errors.length) throw new Error(`Browser errors: ${errors.join("; ")}`);
    console.log(
      "Wrote docs/appliance-panel-{dark,light,more,settings}.png with simulated Home Assistant data.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
