import { describe, expect, it } from "vitest";
import { actionPolicy, executeAction } from "../src/actions";
import type { Appliance, HassStates, HomeAssistant, Role } from "../src/types";

// Synthetic Local fixture: common.py keys and untranslated HA native states/options.
function fixture() {
  const appliance: Appliance = {
    id: "oven",
    name: "Oven",
    kind: "oven",
    registry: { id: "oven", name: "Oven" },
    entities: [],
    disabledCount: 0,
  };
  const states: HassStates = {};
  const add = (
    id: string,
    role: Role,
    state: string,
    attributes: Record<string, unknown> = {},
    key = id.replace(".", "_"),
  ) => {
    appliance.entities.push({
      entityId: id,
      role,
      name: role,
      registry: {
        entity_id: id,
        platform: "homeconnect_ws",
        device_id: "oven",
        unique_id: `oven-${key}`,
      },
    });
    states[id] = { entity_id: id, state, attributes };
  };
  add("sensor.operation", "operation", "ready", {}, "sensor_operation_state");
  add("button.start", "start", "unknown", {}, "button_start_program");
  add("button.pause", "pause", "unknown", {}, "button_pause_program");
  add("button.resume", "resume", "unknown", {}, "button_resume_program");
  add("button.abort", "abort", "unknown", {}, "button_abort_program");
  add(
    "binary_sensor.remote",
    "remote_start",
    "on",
    {},
    "binary_remote_start_allowed",
  );
  add(
    "select.remote",
    "remote_control",
    "manualremotestart",
    { options: ["monitoring", "manualremotestart", "permanentremotestart"] },
    "select_remote_control_level",
  );
  add(
    "select.program",
    "selected_program",
    "cooking_oven_program_heatingmode_hotair",
    {
      options: [
        "cooking_oven_program_heatingmode_hotair",
        "cooking_oven_program_heatingmode_topbottomheating",
      ],
    },
    "select_program",
  );
  add("number.temperature", "target_temperature", "180", {
    min: 30,
    max: 250,
    step: 5,
  });
  add("switch.lock", "child_lock", "off");
  add("select.mystery", "other", "first", { options: ["first", "second"] });
  add("button.mystery", "other", "unknown");
  const calls: unknown[][] = [];
  const hass: HomeAssistant = {
    states,
    connection: {
      connected: true,
      addEventListener() {},
      removeEventListener() {},
      async sendMessagePromise<T>() {
        return {} as T;
      },
      async subscribeEvents() {
        return () => {};
      },
    },
    async callService(...args) {
      calls.push(args);
    },
  };
  return { appliance, states, hass, calls };
}

describe("guarded native appliance actions", () => {
  it("requires confirmation before start or potentially starting Local selection", async () => {
    const f = fixture();
    for (const action of [
      { entityId: "button.start" },
      {
        entityId: "select.program",
        value: "cooking_oven_program_heatingmode_hotair",
      },
    ]) {
      expect(actionPolicy(f.appliance, f.states, action).confirmation).toBe(
        true,
      );
      await expect(
        executeAction(f.hass, f.appliance, action, false),
      ).rejects.toThrow(/confirm/i);
    }
    expect(f.calls).toEqual([]);
  });
  it("dispatches only precise native service payloads", async () => {
    const f = fixture();
    await executeAction(
      f.hass,
      f.appliance,
      { entityId: "button.start" },
      true,
    );
    await executeAction(
      f.hass,
      f.appliance,
      {
        entityId: "select.program",
        value: "cooking_oven_program_heatingmode_hotair",
      },
      true,
    );
    await executeAction(
      f.hass,
      f.appliance,
      { entityId: "number.temperature", value: 185 },
      false,
    );
    await executeAction(
      f.hass,
      f.appliance,
      { entityId: "switch.lock", value: true },
      false,
    );
    await executeAction(
      f.hass,
      f.appliance,
      { entityId: "switch.lock", value: false },
      false,
    );
    expect(f.calls).toEqual([
      ["button", "press", { entity_id: "button.start" }],
      [
        "select",
        "select_option",
        {
          entity_id: "select.program",
          option: "cooking_oven_program_heatingmode_hotair",
        },
      ],
      ["number", "set_value", { entity_id: "number.temperature", value: 185 }],
      ["switch", "turn_on", { entity_id: "switch.lock" }],
      ["switch", "turn_off", { entity_id: "switch.lock" }],
    ]);
  });
  it.each(["off", "unknown", "unavailable"])(
    "blocks start and selection with remote-start %s",
    async (state) => {
      const f = fixture();
      f.states["binary_sensor.remote"].state = state;
      for (const action of [
        { entityId: "button.start" },
        {
          entityId: "select.program",
          value: "cooking_oven_program_heatingmode_hotair",
        },
      ]) {
        await expect(
          executeAction(f.hass, f.appliance, action, true),
        ).rejects.toThrow(/remote.*start/i);
      }
      expect(f.calls).toEqual([]);
    },
  );
  it.each(["monitoring", "unknown", "unavailable"])(
    "blocks starting for remote control %s",
    async (state) => {
      const f = fixture();
      f.states["select.remote"].state = state;
      await expect(
        executeAction(f.hass, f.appliance, { entityId: "button.start" }, true),
      ).rejects.toThrow(/remote control/i);
      expect(f.calls).toEqual([]);
    },
  );
  it("allows missing or disabled permission only with unverified confirmation", async () => {
    const f = fixture();
    f.appliance.entities = f.appliance.entities.filter(
      (e) => e.role !== "remote_start",
    );
    expect(
      actionPolicy(f.appliance, f.states, { entityId: "button.start" }),
    ).toMatchObject({
      allowed: true,
      confirmation: true,
      reason: expect.stringMatching(/unverified/i),
    });
    f.appliance.entities.find(
      (e) => e.role === "remote_control",
    )!.registry.disabled_by = "integration";
    await executeAction(
      f.hass,
      f.appliance,
      { entityId: "button.start" },
      true,
    );
    expect(f.calls).toHaveLength(1);
  });
  it.each([
    "delayedstart",
    "run",
    "pause",
    "error",
    "actionrequired",
    "aborting",
  ])(
    "allows direct abort in %s despite all remote permissions off",
    async (state) => {
      const f = fixture();
      f.states["sensor.operation"].state = state;
      f.states["binary_sensor.remote"].state = "off";
      f.states["select.remote"].state = "monitoring";
      await executeAction(
        f.hass,
        f.appliance,
        { entityId: "button.abort" },
        false,
      );
      expect(f.calls).toEqual([
        ["button", "press", { entity_id: "button.abort" }],
      ]);
    },
  );
  it("allows pause with remote control while remote-start is off; guards resume", async () => {
    const f = fixture();
    f.states["sensor.operation"].state = "run";
    f.states["binary_sensor.remote"].state = "off";
    await executeAction(
      f.hass,
      f.appliance,
      { entityId: "button.pause" },
      false,
    );
    f.states["sensor.operation"].state = "pause";
    await expect(
      executeAction(f.hass, f.appliance, { entityId: "button.resume" }, true),
    ).rejects.toThrow(/remote.*start/i);
    f.states["binary_sensor.remote"].state = "on";
    await executeAction(
      f.hass,
      f.appliance,
      { entityId: "button.resume" },
      true,
    );
    expect(f.calls).toHaveLength(2);
  });
  it.each([
    "run",
    "pause",
    "delayedstart",
    "error",
    "actionrequired",
    "aborting",
    "unknown",
    "unavailable",
    "inactive",
  ])("rejects start from lifecycle %s", async (state) => {
    const f = fixture();
    f.states["sensor.operation"].state = state;
    await expect(
      executeAction(f.hass, f.appliance, { entityId: "button.start" }, true),
    ).rejects.toThrow();
    expect(f.calls).toEqual([]);
  });
  it("blocks transport buttons outside their lifecycle", () => {
    const f = fixture();
    for (const entityId of ["button.pause", "button.resume", "button.abort"])
      expect(actionPolicy(f.appliance, f.states, { entityId }).allowed).toBe(
        false,
      );
  });
  it("treats unknown button and select semantics conservatively", async () => {
    const f = fixture();
    for (const action of [
      { entityId: "button.mystery" },
      { entityId: "select.mystery", value: "second" },
    ]) {
      await expect(
        executeAction(f.hass, f.appliance, action, false),
      ).rejects.toThrow(/confirm/i);
      f.states["binary_sensor.remote"].state = "off";
      await expect(
        executeAction(f.hass, f.appliance, action, true),
      ).rejects.toThrow();
      f.states["binary_sensor.remote"].state = "on";
      f.states["sensor.operation"].state = "run";
      await expect(
        executeAction(f.hass, f.appliance, action, true),
      ).rejects.toThrow();
      f.states["sensor.operation"].state = "ready";
    }
    expect(f.calls).toEqual([]);
  });
  it.each([NaN, Infinity, -Infinity, 29, 251, 182, "185", undefined])(
    "rejects invalid numeric value %s",
    async (value) => {
      const f = fixture();
      await expect(
        executeAction(
          f.hass,
          f.appliance,
          { entityId: "number.temperature", value },
          true,
        ),
      ).rejects.toThrow();
      expect(f.calls).toEqual([]);
    },
  );
  it("rejects absent or malformed numeric limits and step", async () => {
    for (const attributes of [
      { max: 250, step: 5 },
      { min: 30, max: Infinity, step: 5 },
      { min: 30, max: 250, step: 0 },
      { min: 250, max: 30, step: 5 },
    ]) {
      const f = fixture();
      f.states["number.temperature"].attributes = attributes;
      await expect(
        executeAction(
          f.hass,
          f.appliance,
          { entityId: "number.temperature", value: 180 },
          true,
        ),
      ).rejects.toThrow();
      expect(f.calls).toEqual([]);
    }
  });
  it("rejects unsupported options, nonboolean switches and read-only domains", async () => {
    const f = fixture();
    for (const action of [
      { entityId: "select.program", value: "invented" },
      { entityId: "switch.lock", value: "on" },
      { entityId: "sensor.operation", value: "ready" },
    ])
      await expect(
        executeAction(f.hass, f.appliance, action, true),
      ).rejects.toThrow();
    expect(f.calls).toEqual([]);
  });
  it("revalidates latest availability and permission after confirmation", async () => {
    const f = fixture();
    const action = { entityId: "button.start" };
    expect(actionPolicy(f.appliance, f.states, action).allowed).toBe(true);
    f.hass.states = {
      ...f.states,
      "binary_sensor.remote": {
        ...f.states["binary_sensor.remote"],
        state: "off",
      },
    };
    await expect(
      executeAction(f.hass, f.appliance, action, true),
    ).rejects.toThrow();
    expect(f.calls).toEqual([]);
  });
  it("rejects missing, disabled, foreign, disconnected and unavailable targets", async () => {
    const mutations = [
      (f: ReturnType<typeof fixture>) => {
        f.appliance.entities = [];
      },
      (f: ReturnType<typeof fixture>) => {
        f.appliance.entities[1].registry.disabled_by = "user";
      },
      (f: ReturnType<typeof fixture>) => {
        f.appliance.entities[1].registry.device_id = "other";
      },
      (f: ReturnType<typeof fixture>) => {
        f.appliance.entities[1].registry.platform = "home_connect";
      },
      (f: ReturnType<typeof fixture>) => {
        f.hass.connection = { ...f.hass.connection, connected: false };
      },
      (f: ReturnType<typeof fixture>) => {
        f.states["button.start"].state = "unavailable";
      },
      (f: ReturnType<typeof fixture>) => {
        delete f.states["button.start"];
      },
      (f: ReturnType<typeof fixture>) => {
        f.appliance.registry.disabled_by = "user";
      },
    ];
    for (const mutate of mutations) {
      const f = fixture();
      mutate(f);
      await expect(
        executeAction(f.hass, f.appliance, { entityId: "button.start" }, true),
      ).rejects.toThrow();
      expect(f.calls).toEqual([]);
    }
  });
  it("rejects fractional values that Local would silently truncate", async () => {
    const f = fixture();
    f.states["number.temperature"].attributes = { min: 0, max: 10, step: 0.5 };
    await expect(
      executeAction(
        f.hass,
        f.appliance,
        { entityId: "number.temperature", value: 1.5 },
        true,
      ),
    ).rejects.toThrow(/integer/i);
    expect(f.calls).toEqual([]);
  });
  it("allows integer limits and absent step using Local integer default", async () => {
    const f = fixture();
    f.states["number.temperature"].attributes = { min: 30, max: 250 };
    await executeAction(
      f.hass,
      f.appliance,
      { entityId: "number.temperature", value: 30 },
      false,
    );
    await executeAction(
      f.hass,
      f.appliance,
      { entityId: "number.temperature", value: 250 },
      false,
    );
    expect(f.calls).toEqual([
      ["number", "set_value", { entity_id: "number.temperature", value: 30 }],
      ["number", "set_value", { entity_id: "number.temperature", value: 250 }],
    ]);
  });
  it("does not send service calls for ambiguous identity or mismatched transport domains", async () => {
    const f = fixture();
    f.appliance.entities.push({ ...f.appliance.entities[1] });
    await expect(
      executeAction(f.hass, f.appliance, { entityId: "button.start" }, true),
    ).rejects.toThrow(/ambiguous/i);
    f.appliance.entities.find((e) => e.entityId === "switch.lock")!.role =
      "start";
    await expect(
      executeAction(
        f.hass,
        f.appliance,
        { entityId: "switch.lock", value: true },
        true,
      ),
    ).rejects.toThrow(/domain/i);
    expect(f.calls).toEqual([]);
  });
  it("protects legacy writable active programme selectors with confirmation", async () => {
    const f = fixture();
    f.appliance.entities.find((e) => e.entityId === "select.program")!.role =
      "active_program";
    await expect(
      executeAction(
        f.hass,
        f.appliance,
        {
          entityId: "select.program",
          value: "cooking_oven_program_heatingmode_hotair",
        },
        false,
      ),
    ).rejects.toThrow(/confirm/i);
    expect(f.calls).toEqual([]);
  });
  it("never sends an unavailable abort or uses unavailable service API", async () => {
    const f = fixture();
    f.states["sensor.operation"].state = "run";
    f.states["button.abort"].state = "unavailable";
    await expect(
      executeAction(f.hass, f.appliance, { entityId: "button.abort" }, false),
    ).rejects.toThrow(/unavailable/i);
    f.states["sensor.operation"].state = "ready";
    delete f.hass.callService;
    await expect(
      executeAction(f.hass, f.appliance, { entityId: "button.start" }, true),
    ).rejects.toThrow(/service/i);
    expect(f.calls).toEqual([]);
  });
  it("permits first Local programme selection from unknown with populated options and confirmation", async () => {
    const f = fixture();
    f.states["select.program"].state = "unknown";
    const action = {
      entityId: "select.program",
      value: "cooking_oven_program_heatingmode_hotair",
    };
    expect(actionPolicy(f.appliance, f.states, action)).toMatchObject({
      allowed: true,
      confirmation: true,
    });
    await expect(
      executeAction(f.hass, f.appliance, action, false),
    ).rejects.toThrow(/confirm/i);
    expect(f.calls).toEqual([]);
    await executeAction(f.hass, f.appliance, action, true);
    expect(f.calls).toEqual([
      [
        "select",
        "select_option",
        {
          entity_id: "select.program",
          option: "cooking_oven_program_heatingmode_hotair",
        },
      ],
    ]);
  });
  it("keeps first programme selection bounded by availability, options, lifecycle and permission", async () => {
    const mutations = [
      (f: ReturnType<typeof fixture>) => {
        f.states["select.program"].state = "unavailable";
      },
      (f: ReturnType<typeof fixture>) => {
        delete f.states["select.program"];
      },
      (f: ReturnType<typeof fixture>) => {
        f.states["select.program"].attributes.options = [];
      },
      (f: ReturnType<typeof fixture>) => {
        f.states["sensor.operation"].state = "run";
      },
      (f: ReturnType<typeof fixture>) => {
        f.states["binary_sensor.remote"].state = "unknown";
      },
      (f: ReturnType<typeof fixture>) => {
        delete f.states["binary_sensor.remote"];
      },
      (f: ReturnType<typeof fixture>) => {
        f.states["select.remote"].state = "unknown";
      },
      (f: ReturnType<typeof fixture>) => {
        f.appliance.entities.find(
          (e) => e.entityId === "select.program",
        )!.role = "other";
      },
    ];
    for (const mutate of mutations) {
      const f = fixture();
      f.states["select.program"].state = "unknown";
      mutate(f);
      await expect(
        executeAction(
          f.hass,
          f.appliance,
          {
            entityId: "select.program",
            value: "cooking_oven_program_heatingmode_hotair",
          },
          true,
        ),
      ).rejects.toThrow();
      expect(f.calls).toEqual([]);
    }
  });
});
