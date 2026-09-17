import { describe, expect, test, vi } from "vitest";
import { watchRegistries, refreshRegistries } from "../src/registry";
import { FixtureConnection } from "./ui-fixtures";
import { fixture } from "./ui-fixtures";
const { snapshot } = fixture();
snapshot.labels.push({ label_id: "kitchen", name: "Kitchen" });
import type {
  HassConnection,
  HomeAssistant,
  RegistryWatchValue,
} from "../src/types";

const settle = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

class FakeConnection extends FixtureConnection implements HassConnection {
  calls: string[] = [];
  subscribeCalls: string[] = [];
  listeners = new Map<string, (event: unknown) => void>();
  unsubscribes: Array<ReturnType<typeof vi.fn>> = [];
  subscribeGates: Array<ReturnType<typeof deferred<() => void>>> = [];
  responder: (type: string) => Promise<unknown>;

  constructor(responder?: (type: string) => Promise<unknown>) {
    super(structuredClone(snapshot));
    this.responder =
      responder ??
      (async (type) =>
        ({
          "config/entity_registry/list": snapshot.entities,
          "config/device_registry/list": snapshot.devices,
          "config/area_registry/list": snapshot.areas,
          "config/label_registry/list": snapshot.labels,
        })[type]);
  }

  sendMessagePromise<T>(message: { type: string }): Promise<T> {
    this.calls.push(message.type);
    return this.responder(message.type) as Promise<T>;
  }

  subscribeEvents<T>(
    callback: (event: T) => void,
    eventType: string,
  ): Promise<() => void> {
    this.subscribeCalls.push(eventType);
    this.listeners.set(eventType, callback as (event: unknown) => void);
    const unsubscribe = vi.fn();
    this.unsubscribes.push(unsubscribe);
    const gate = this.subscribeGates.shift();
    return gate ? gate.promise : Promise.resolve(unsubscribe);
  }

  emit(eventType: string) {
    this.listeners.get(eventType)?.({ event_type: eventType });
  }
}

const hassFor = (connection: HassConnection): HomeAssistant => ({
  connection,
  states: {},
});

describe("watchRegistries", () => {
  test("fetches all registries initially and publishes one coherent snapshot", async () => {
    const connection = new FakeConnection();
    const observed: RegistryWatchValue[] = [];
    const stop = watchRegistries(hassFor(connection), (value) =>
      observed.push(value),
    );
    await settle();
    expect(connection.calls).toEqual([
      "config/entity_registry/list",
      "config/device_registry/list",
      "config/area_registry/list",
      "config/label_registry/list",
    ]);
    expect(observed[observed.length - 1]?.snapshot?.devices[0].name).toBe(
      "Combination oven",
    );
    stop();
  });

  test("shares fetches and registry subscriptions per connection", async () => {
    const connection = new FakeConnection();
    const first: RegistryWatchValue[] = [];
    const second: RegistryWatchValue[] = [];
    const stopFirst = watchRegistries(hassFor(connection), (value) =>
      first.push(value),
    );
    const stopSecond = watchRegistries(hassFor(connection), (value) =>
      second.push(value),
    );
    await settle();
    expect(connection.calls).toHaveLength(4);
    expect(connection.listeners.size).toBe(4);
    expect(first[first.length - 1]?.snapshot).toBe(
      second[second.length - 1]?.snapshot,
    );
    stopFirst();
    stopSecond();
  });

  test("refreshes after each registry update event", async () => {
    const connection = new FakeConnection();
    const observed: RegistryWatchValue[] = [];
    const stop = watchRegistries(hassFor(connection), (value) =>
      observed.push(value),
    );
    await settle();
    connection.emit("entity_registry_updated");
    await settle();
    expect(connection.calls).toHaveLength(8);
    expect(observed).toHaveLength(2);
    stop();
  });

  test("makes required registry failures visible and retries on the next update", async () => {
    let failing = true;
    const connection = new FakeConnection(async (type) => {
      if (type === "config/device_registry/list" && failing)
        throw new Error("device registry denied");
      return {
        "config/entity_registry/list": snapshot.entities,
        "config/device_registry/list": snapshot.devices,
        "config/area_registry/list": snapshot.areas,
        "config/label_registry/list": snapshot.labels,
      }[type];
    });
    const observed: RegistryWatchValue[] = [];
    const stop = watchRegistries(hassFor(connection), (value) =>
      observed.push(value),
    );
    await settle();
    expect(observed[observed.length - 1]).toEqual({
      error: "device registry denied",
    });
    failing = false;
    connection.emit("device_registry_updated");
    await settle();
    expect(observed[observed.length - 1]?.snapshot?.devices).toEqual(
      snapshot.devices,
    );
    expect(observed[observed.length - 1]?.error).toBeUndefined();
    stop();
  });

  test("treats the unavailable label API as optional", async () => {
    const connection = new FakeConnection(async (type) => {
      if (type === "config/label_registry/list")
        throw { code: "unknown_command", message: "unknown command" };
      return {
        "config/entity_registry/list": snapshot.entities,
        "config/device_registry/list": snapshot.devices,
        "config/area_registry/list": snapshot.areas,
      }[type];
    });
    const observed: RegistryWatchValue[] = [];
    const stop = watchRegistries(hassFor(connection), (value) =>
      observed.push(value),
    );
    await settle();
    expect(observed[observed.length - 1]?.snapshot?.labels).toEqual([]);
    expect(observed[observed.length - 1]?.error).toBeUndefined();
    stop();
  });

  test("publishes transient label failures and recovers on the next registry update", async () => {
    let failing = true;
    const connection = new FakeConnection(async (type) => {
      if (type === "config/label_registry/list" && failing) {
        throw Object.assign(new Error("label registry forbidden"), {
          code: "unauthorized",
        });
      }
      return {
        "config/entity_registry/list": snapshot.entities,
        "config/device_registry/list": snapshot.devices,
        "config/area_registry/list": snapshot.areas,
        "config/label_registry/list": snapshot.labels,
      }[type];
    });
    const observed: RegistryWatchValue[] = [];
    const stop = watchRegistries(hassFor(connection), (value) =>
      observed.push(value),
    );
    await settle();
    expect(observed[observed.length - 1]).toEqual({
      error: "label registry forbidden",
    });
    failing = false;
    connection.emit("entity_registry_updated");
    await settle();
    expect(observed[observed.length - 1]?.snapshot?.labels).toEqual(
      snapshot.labels,
    );
    stop();
  });

  test("keeps a concurrent subscription failure visible and reinstalls that listener on refresh", async () => {
    const devices = deferred<typeof snapshot.devices>();
    const failedSubscription = deferred<() => void>();
    const connection = new FakeConnection(async (type) => {
      if (type === "config/device_registry/list") return devices.promise;
      return {
        "config/entity_registry/list": snapshot.entities,
        "config/area_registry/list": snapshot.areas,
        "config/label_registry/list": snapshot.labels,
      }[type];
    });
    connection.subscribeGates.push(failedSubscription);
    const observed: RegistryWatchValue[] = [];
    const stop = watchRegistries(hassFor(connection), (value) =>
      observed.push(value),
    );

    failedSubscription.reject(new Error("entity updates unavailable"));
    await settle();
    expect(observed[observed.length - 1]).toEqual({
      error: "entity updates unavailable",
    });

    devices.resolve(snapshot.devices);
    await settle();
    expect(observed[observed.length - 1]).toEqual({
      error: "entity updates unavailable",
    });

    connection.emit("device_registry_updated");
    await settle();
    expect(
      connection.subscribeCalls.filter(
        (event) => event === "entity_registry_updated",
      ),
    ).toHaveLength(2);
    expect(observed[observed.length - 1]?.snapshot?.devices).toEqual(
      snapshot.devices,
    );

    const fetchCount = connection.calls.length;
    connection.emit("entity_registry_updated");
    await settle();
    expect(connection.calls).toHaveLength(fetchCount + 4);
    stop();
  });

  test("suppresses a stale refresh that resolves after a newer one", async () => {
    const deviceRequests: Array<
      ReturnType<typeof deferred<typeof snapshot.devices>>
    > = [];
    let initial = true;
    const connection = new FakeConnection(async (type) => {
      if (type === "config/device_registry/list") {
        if (initial) return snapshot.devices;
        const request = deferred<typeof snapshot.devices>();
        deviceRequests.push(request);
        return request.promise;
      }
      return {
        "config/entity_registry/list": snapshot.entities,
        "config/area_registry/list": snapshot.areas,
        "config/label_registry/list": snapshot.labels,
      }[type];
    });
    const observed: RegistryWatchValue[] = [];
    const stop = watchRegistries(hassFor(connection), (value) =>
      observed.push(value),
    );
    await settle();
    initial = false;
    connection.emit("entity_registry_updated");
    connection.emit("device_registry_updated");
    await Promise.resolve();
    deviceRequests[1].resolve([
      { ...snapshot.devices[0], name: "Newest" },
      snapshot.devices[1],
    ]);
    await settle();
    deviceRequests[0].resolve([
      { ...snapshot.devices[0], name: "Stale" },
      snapshot.devices[1],
    ]);
    await settle();
    expect(observed[observed.length - 1]?.snapshot?.devices[0].name).toBe(
      "Newest",
    );
    stop();
  });

  test("unsubscribes a pending subscription once it resolves after detach", async () => {
    const connection = new FakeConnection();
    const gate = deferred<() => void>();
    connection.subscribeGates.push(gate);
    const stop = watchRegistries(hassFor(connection), () => undefined);
    stop();
    const unsubscribe = vi.fn();
    gate.resolve(unsubscribe);
    await settle();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  test("keeps subscriptions until the last watcher detaches and then cleans them all", async () => {
    const connection = new FakeConnection();
    const stopFirst = watchRegistries(hassFor(connection), () => undefined);
    const stopSecond = watchRegistries(hassFor(connection), () => undefined);
    await settle();
    stopFirst();
    expect(
      connection.unsubscribes.every(
        (unsubscribe) => unsubscribe.mock.calls.length === 0,
      ),
    ).toBe(true);
    stopSecond();
    expect(connection.unsubscribes).toHaveLength(4);
    expect(
      connection.unsubscribes.every(
        (unsubscribe) => unsubscribe.mock.calls.length === 1,
      ),
    ).toBe(true);
  });
});

describe("same-Connection transport lifecycle", () => {
  test("refetches all registries on ready without duplicating restored subscriptions", async () => {
    const connection = new FakeConnection();
    const values: RegistryWatchValue[] = [];
    const stop = watchRegistries(hassFor(connection), (value) =>
      values.push(value),
    );
    await settle();
    connection.lifecycle("disconnected");
    await settle();
    expect(values[values.length - 1]?.snapshot).toBeUndefined();
    const changed = structuredClone(snapshot);
    changed.devices[0].name_by_user = "Fresh workshop";
    changed.entities = changed.entities.filter(
      (entity) => entity.entity_id !== "binary_sensor.workshop_heat",
    );
    changed.entities[0].disabled_by = "user";
    changed.areas[0].name = "Fresh area";
    changed.labels[0].name = "Fresh label";
    connection.responder = async (type) =>
      ({
        "config/entity_registry/list": changed.entities,
        "config/device_registry/list": changed.devices,
        "config/area_registry/list": changed.areas,
        "config/label_registry/list": changed.labels,
      })[type];
    connection.lifecycle("ready");
    await settle();
    expect(values[values.length - 1]?.snapshot).toEqual(changed);
    expect(connection.calls).toHaveLength(8);
    expect(connection.subscribeCalls).toHaveLength(4);
    stop();
  });

  test("cannot publish in-flight fetches or subscription completions after disconnect", async () => {
    const devices = deferred<typeof snapshot.devices>();
    const subscription = deferred<() => void>();
    const connection = new FakeConnection();
    connection.subscribeGates.push(subscription);
    const values: RegistryWatchValue[] = [];
    const hass = hassFor(connection);
    const stop = watchRegistries(hass, (value) => values.push(value));
    await settle();
    const responder = connection.responder;
    connection.responder = (type) =>
      type === "config/device_registry/list"
        ? devices.promise
        : responder(type);
    refreshRegistries(hass);
    connection.lifecycle("disconnected");
    const disconnectedAt = values.length;
    devices.resolve(snapshot.devices);
    subscription.resolve(() => {});
    await settle();
    expect(values[values.length - 1]?.snapshot).toBeUndefined();
    expect(values.slice(disconnectedAt).some((value) => value.snapshot)).toBe(
      false,
    );
    const calls = connection.calls.length;
    refreshRegistries(hass);
    await settle();
    expect(connection.calls).toHaveLength(calls);
    stop();
  });

  test("does not fetch or show a cached snapshot when first attached offline", async () => {
    const connection = new FakeConnection();
    connection.connected = false;
    const values: RegistryWatchValue[] = [];
    const stop = watchRegistries(hassFor(connection), (value) =>
      values.push(value),
    );
    await settle();
    expect(connection.calls).toHaveLength(0);
    expect(values[values.length - 1]?.snapshot).toBeUndefined();
    connection.lifecycle("ready");
    await settle();
    expect(values[values.length - 1]?.snapshot?.devices).toEqual(
      snapshot.devices,
    );
    stop();
  });

  test("ready retries failed subscriptions while retaining pending and restored subscriptions", async () => {
    const failed = deferred<() => void>();
    const pending = deferred<() => void>();
    const connection = new FakeConnection();
    connection.subscribeGates.push(failed, pending);
    const values: RegistryWatchValue[] = [];
    const stop = watchRegistries(hassFor(connection), (value) =>
      values.push(value),
    );
    failed.reject(new Error("Subscription denied"));
    await settle();
    connection.lifecycle("disconnected");
    connection.lifecycle("ready");
    await settle();
    pending.resolve(() => {});
    await settle();
    expect(
      connection.subscribeCalls.filter(
        (type) => type === "entity_registry_updated",
      ),
    ).toHaveLength(2);
    expect(
      connection.subscribeCalls.filter(
        (type) => type === "device_registry_updated",
      ),
    ).toHaveLength(1);
    expect(connection.subscribeCalls).toHaveLength(5);
    expect(values[values.length - 1]?.snapshot?.devices).toEqual(
      snapshot.devices,
    );
    stop();
  });

  test("shares lifecycle listeners and removes them only when the final subscriber detaches", async () => {
    const connection = new FakeConnection();
    const stopFirst = watchRegistries(hassFor(connection), () => {});
    const stopSecond = watchRegistries(hassFor(connection), () => {});
    await settle();
    expect(connection.lifecycleListeners.get("ready")?.size).toBe(1);
    expect(connection.lifecycleListeners.get("disconnected")?.size).toBe(1);
    stopFirst();
    expect(connection.lifecycleListeners.get("ready")?.size).toBe(1);
    stopSecond();
    expect(connection.lifecycleListeners.get("ready")?.size).toBe(0);
    expect(connection.lifecycleListeners.get("disconnected")?.size).toBe(0);
    const calls = connection.calls.length;
    connection.lifecycle("ready");
    await settle();
    expect(connection.calls).toHaveLength(calls);
  });
});

test("keeps ready loading until fresh fetch completes despite delayed pre-disconnect work", async () => {
  const connection = new FakeConnection();
  const subscription = deferred<() => void>();
  connection.subscribeGates.push(subscription);
  const values: RegistryWatchValue[] = [];
  const hass = hassFor(connection);
  const stop = watchRegistries(hass, (value) => values.push(value));
  await settle();
  const stale = deferred<typeof snapshot.devices>();
  const fresh = deferred<typeof snapshot.devices>();
  const responder = connection.responder;
  connection.responder = (type) =>
    type === "config/device_registry/list" ? stale.promise : responder(type);
  refreshRegistries(hass);
  connection.lifecycle("disconnected");
  connection.responder = (type) =>
    type === "config/device_registry/list" ? fresh.promise : responder(type);
  connection.lifecycle("ready");
  stale.resolve(snapshot.devices);
  subscription.resolve(() => {});
  await settle();
  expect(values[values.length - 1]?.snapshot).toBeUndefined();
  expect(values[values.length - 1]?.disconnected).not.toBe(true);
  fresh.resolve([{ ...snapshot.devices[0], name_by_user: "Fresh workshop" }]);
  await settle();
  expect(values[values.length - 1]?.snapshot?.devices[0].name_by_user).toBe(
    "Fresh workshop",
  );
  expect(connection.subscribeCalls).toHaveLength(4);
  stop();
});
