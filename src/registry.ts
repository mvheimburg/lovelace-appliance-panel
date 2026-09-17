import type {
  AreaRegistryEntry,
  DeviceRegistryEntry,
  EntityRegistryEntry,
  HassConnection,
  HomeAssistant,
  LabelRegistryEntry,
  RegistrySnapshot,
  RegistryWatchValue,
} from "./types";

type WatchCallback = (value: RegistryWatchValue) => void;

const UPDATE_EVENTS = [
  "entity_registry_updated",
  "device_registry_updated",
  "area_registry_updated",
  "label_registry_updated",
] as const;

const sharedByConnection = new WeakMap<HassConnection, SharedRegistryWatcher>();

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return String(error);
}

function isUnsupportedCommand(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "unknown_command"
  );
}

interface SubscriptionState {
  pending: boolean;
  unsubscribe?: () => void;
  error?: string;
}

class SharedRegistryWatcher {
  private readonly callbacks = new Set<WatchCallback>();
  private readonly subscriptions = new Map<string, SubscriptionState>(
    UPDATE_EVENTS.map((eventType) => [eventType, { pending: false }]),
  );
  private generation = 0;
  private stopped = false;
  private value?: RegistryWatchValue;
  private snapshot?: RegistrySnapshot;
  private fetchError?: string;
  private connected: boolean;

  constructor(private readonly connection: HassConnection) {
    this.connected = connection.connected;
    connection.addEventListener("disconnected", this.handleDisconnected);
    connection.addEventListener("ready", this.handleReady);
    if (this.connected) void this.refresh();
    else this.handleDisconnected();
  }

  private handleDisconnected = (): void => {
    this.connected = false;
    this.generation += 1;
    this.snapshot = undefined;
    this.fetchError = undefined;
    this.publish({ disconnected: true });
  };

  private handleReady = (): void => {
    if (this.stopped) return;
    this.connected = true;
    // Missed registry events are not replayed after HA restores the socket.
    this.snapshot = undefined;
    this.fetchError = undefined;
    this.publish({});
    void this.refresh();
  };

  private ensureSubscriptions(): void {
    for (const eventType of UPDATE_EVENTS) {
      const subscription = this.subscriptions.get(eventType)!;
      if (subscription.pending || subscription.unsubscribe) continue;
      subscription.pending = true;
      void this.connection
        .subscribeEvents(() => {
          void this.refresh();
        }, eventType)
        .then((unsubscribe) => {
          subscription.pending = false;
          if (this.stopped) {
            unsubscribe();
            return;
          }
          subscription.unsubscribe = unsubscribe;
          subscription.error = undefined;
          this.publishCurrent();
        })
        .catch((error: unknown) => {
          subscription.pending = false;
          if (this.stopped) return;
          subscription.error = errorMessage(error);
          this.publishCurrent();
        });
    }
  }

  add(callback: WatchCallback): () => void {
    this.callbacks.add(callback);
    if (this.value) callback(this.value);
    let active = true;
    return () => {
      if (!active) return;
      active = false;
      this.callbacks.delete(callback);
      if (this.callbacks.size === 0) this.destroy();
    };
  }

  async refresh(): Promise<void> {
    if (this.stopped) return;
    if (!this.connected || !this.connection.connected) {
      this.handleDisconnected();
      return;
    }
    // HA restores successful and pending subscriptions itself. Only retry failures.
    this.ensureSubscriptions();
    const generation = ++this.generation;
    const send = <T>(type: string) =>
      this.connection.sendMessagePromise<T>({ type });
    const entities = send<EntityRegistryEntry[]>("config/entity_registry/list");
    const devices = send<DeviceRegistryEntry[]>("config/device_registry/list");
    const areas = send<AreaRegistryEntry[]>("config/area_registry/list");
    const labels = send<LabelRegistryEntry[]>(
      "config/label_registry/list",
    ).catch((error: unknown) => {
      if (isUnsupportedCommand(error)) return [];
      throw error;
    });
    try {
      const [resolvedEntities, resolvedDevices, resolvedAreas, resolvedLabels] =
        await Promise.all([entities, devices, areas, labels]);
      if (generation !== this.generation || this.stopped) return;
      this.snapshot = {
        entities: resolvedEntities,
        devices: resolvedDevices,
        areas: resolvedAreas,
        labels: resolvedLabels,
      };
      this.fetchError = undefined;
      this.publishCurrent();
    } catch (error) {
      if (generation !== this.generation || this.stopped) return;
      this.fetchError = errorMessage(error);
      this.publishCurrent();
    }
  }

  private publishCurrent(): void {
    if (!this.connected || !this.connection.connected) {
      this.publish({ disconnected: true });
      return;
    }
    const subscriptionError = [...this.subscriptions.values()].find(
      (state) => state.error,
    )?.error;
    const error = subscriptionError ?? this.fetchError;
    if (error) this.publish({ error });
    else if (this.snapshot) this.publish({ snapshot: this.snapshot });
  }

  private publish(value: RegistryWatchValue): void {
    if (this.stopped) return;
    this.value = value;
    for (const callback of this.callbacks) callback(value);
  }

  private destroy(): void {
    if (this.stopped) return;
    this.stopped = true;
    this.generation += 1;
    this.connection.removeEventListener(
      "disconnected",
      this.handleDisconnected,
    );
    this.connection.removeEventListener("ready", this.handleReady);
    for (const subscription of this.subscriptions.values()) {
      subscription.unsubscribe?.();
      subscription.unsubscribe = undefined;
    }
    sharedByConnection.delete(this.connection);
  }
}

export function watchRegistries(
  hass: HomeAssistant,
  callback: WatchCallback,
): () => void {
  let watcher = sharedByConnection.get(hass.connection);
  if (!watcher) {
    watcher = new SharedRegistryWatcher(hass.connection);
    sharedByConnection.set(hass.connection, watcher);
  }
  return watcher.add(callback);
}

/** Explicit retry also recovers subscriptions that failed during startup. */
export function refreshRegistries(hass: HomeAssistant): void {
  void sharedByConnection.get(hass.connection)?.refresh();
}
