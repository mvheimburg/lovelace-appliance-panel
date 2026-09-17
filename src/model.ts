import type {
  Appliance,
  ApplianceConfig,
  ApplianceKind,
  ApplianceStatus,
  HassEntity,
  HassStates,
  Operation,
  RegistrySnapshot,
  Role,
} from "./types";
import { humanize, resolveRole, semanticKey } from "./roles";

function kindOf(
  device: RegistrySnapshot["devices"][number],
  keys: string[],
): ApplianceKind {
  const evidence = keys.join(" ");
  if (/oven_|microwave|steam_level/.test(evidence)) return "oven";
  if (
    /setpoint_(?:freezer|refrigerator|chiller)|super_freezer|fridge_door/.test(
      evidence,
    )
  )
    return "cooling";
  if (/coffee_|bean_amount|beverage|drip_tray/.test(evidence)) return "coffee";
  if (
    /sensor_salt|sensor_rinse_aid|flexspray|vario_speed|half_load/.test(
      evidence,
    )
  )
    return "dishwasher";
  const name = `${device.model ?? ""} ${device.name}`.toLowerCase();
  if (/dishwasher/.test(name)) return "dishwasher";
  if (/coffee|coffeemaker/.test(name)) return "coffee";
  if (/refrigerator|fridge|freezer/.test(name)) return "cooling";
  if (/oven|microwave/.test(name)) return "oven";
  if (/washer|washing machine/.test(name)) return "washer";
  if (/dryer/.test(name)) return "dryer";
  return "unknown";
}
export function discoverAppliances(
  snapshot: RegistrySnapshot,
  states: HassStates,
): Appliance[] {
  const supported = snapshot.entities.filter(
    (e) => e.platform === "homeconnect_ws" && e.device_id,
  );
  return snapshot.devices.flatMap((device) => {
    const entries = supported.filter((e) => e.device_id === device.id);
    if (!entries.length) return [];
    const area = snapshot.areas.find((a) => a.area_id === device.area_id);
    return [
      {
        id: device.id,
        name: device.name_by_user || device.name,
        kind: kindOf(device, entries.map(semanticKey)),
        area: area ? { id: area.area_id, name: area.name } : undefined,
        registry: device,
        disabledCount: entries.filter(
          (e) => e.disabled_by || device.disabled_by,
        ).length,
        entities: entries
          .filter((e) => !e.disabled_by && !device.disabled_by)
          .map((registry) => ({
            entityId: registry.entity_id,
            role: resolveRole(registry, states[registry.entity_id]),
            registry,
            name:
              registry.name ||
              registry.original_name ||
              states[registry.entity_id]?.attributes.friendly_name ||
              humanize(
                semanticKey(registry) || registry.entity_id.split(".")[1],
              ),
          })),
      },
    ];
  });
}
const normalized = (value?: string) =>
  (value ?? "").split(".").pop()!.toLowerCase().replace(/[ _-]/g, "");
const valid = (state?: HassEntity) =>
  !!state &&
  !["unknown", "unavailable", ""].includes(state.state.toLowerCase());
function numeric(state?: HassEntity): number | undefined {
  if (!valid(state)) return undefined;
  const value = Number(state!.state);
  return Number.isFinite(value) ? value : undefined;
}
function seconds(state?: HassEntity): number | undefined {
  const value = numeric(state);
  if (value === undefined || value < 0) return undefined;
  const unit = String(
    state!.attributes.unit_of_measurement ?? "s",
  ).toLowerCase();
  const scale: Record<string, number> = {
    s: 1,
    sec: 1,
    second: 1,
    seconds: 1,
    min: 60,
    minute: 60,
    minutes: 60,
    h: 3600,
    hr: 3600,
    hour: 3600,
    hours: 3600,
    ms: 0.001,
    d: 86400,
  };
  return scale[unit] === undefined ? undefined : value * scale[unit];
}
export function applianceStatus(
  appliance: Appliance,
  states: HassStates,
  now = Date.now(),
): ApplianceStatus {
  const entities = appliance.entities;
  const get = (role: Role) =>
    entities
      .filter((e) => e.role === role)
      .map((e) => states[e.entityId])
      .find(valid);
  const connection = entities.find((e) => e.role === "connection");
  const connectionState = connection ? states[connection.entityId] : undefined;
  const reported = entities
    .map((e) => states[e.entityId])
    .filter((s): s is HassEntity => !!s);
  let online: ApplianceStatus["online"] = "unknown";
  if (
    connectionState &&
    ["off", "unavailable", "disconnected"].includes(connectionState.state)
  )
    online = "offline";
  else if (connectionState?.state === "on") online = "online";
  else if (!connection && reported.some(valid)) online = "online";
  else if (
    !connection &&
    reported.length > 0 &&
    reported.every((s) => s.state === "unavailable")
  )
    online = "offline";
  const operationEntities = entities.filter((e) => e.role === "operation");
  if (
    operationEntities.length &&
    operationEntities.every((e) => states[e.entityId]?.state === "unavailable")
  )
    online = "offline";
  const operationMap: Record<string, Operation> = {
    inactive: "off",
    off: "off",
    ready: "ready",
    delayedstart: "delayed",
    delayed: "delayed",
    run: "running",
    running: "running",
    pause: "paused",
    paused: "paused",
    finished: "finished",
    error: "error",
    actionrequired: "action_required",
    aborting: "aborting",
  };
  let operation: Operation =
    operationMap[normalized(get("operation")?.state)] ?? "unknown";
  if (online === "offline") operation = "offline";
  const busy = [
    "running",
    "delayed",
    "paused",
    "action_required",
    "aborting",
  ].includes(operation);
  const attention: ApplianceStatus["attention"] = [];
  if (online === "offline")
    attention.push({ message: "Appliance offline", severity: "error" });
  else if (operation === "unknown" && appliance.kind !== "cooling")
    attention.push({
      message: "Appliance status unknown",
      severity: "unknown",
    });
  if (operation === "error" || operation === "action_required")
    attention.push({
      message: humanize(operation),
      severity: operation === "error" ? "error" : "warning",
    });
  for (const entity of entities.filter(
    (e) => e.role === "attention" || e.role === "door",
  )) {
    const state = states[entity.entityId];
    if (!valid(state)) {
      attention.push({
        entityId: entity.entityId,
        message: `${entity.name}: ${state?.state ?? "not reported"}`,
        severity: "unknown",
      });
      continue;
    }
    const value = normalized(state!.state);
    const key = semanticKey(entity.registry) || entity.entityId;
    if (/sensor_(?:countdown_|machinecare_remaining_runs)/.test(key)) {
      const count = numeric(state);
      if (count === undefined || count <= 0)
        attention.push({
          entityId: entity.entityId,
          message: `${entity.name}: ${count === undefined ? "unknown" : "due"}`,
          severity: count === undefined ? "unknown" : "warning",
        });
      continue;
    }
    const bad =
      entity.role === "door"
        ? ["on", "open", "ajar"].includes(value)
        : [
            "on",
            "present",
            "empty",
            "low",
            "nearlyempty",
            "notinserted",
            "unplugged",
            "error",
            "alarm",
            "required",
          ].includes(value) ||
          (value === "full" && /drip_tray/.test(key));
    const healthy =
      entity.role === "door"
        ? ["off", "closed", "locked"].includes(value)
        : ["off", "confirmed", "ok", "normal", "none"].includes(value) ||
          (value === "full" && !/drip_tray/.test(key));
    if (bad || !healthy)
      attention.push({
        entityId: entity.entityId,
        message: `${entity.name}: ${humanize(state!.state)}`,
        severity: bad ? "warning" : "unknown",
      });
  }
  const progress = numeric(get("progress"));
  const remainingSeconds = seconds(get("remaining"));
  const delaySeconds = seconds(get("start_delay"));
  const dates = reported
    .flatMap((s) => [s.last_updated, s.last_changed])
    .filter((s): s is string => !!s && Number.isFinite(Date.parse(s)))
    .sort((a, b) => Date.parse(b) - Date.parse(a));
  const finished = entities
    .filter((e) => e.role === "finished")
    .map((e) => states[e.entityId])
    .find((s) => s?.state === "on");
  return {
    operation,
    busy,
    online,
    attention,
    progress:
      progress !== undefined && progress >= 0 && progress <= 100
        ? progress
        : undefined,
    remainingSeconds,
    delaySeconds,
    estimatedFinish:
      (operation === "running" || operation === "delayed") &&
      remainingSeconds !== undefined
        ? now +
          (remainingSeconds +
            (operation === "delayed" ? (delaySeconds ?? 0) : 0)) *
            1000
        : undefined,
    phase: get("phase")?.state,
    program: get("active_program")?.state ?? get("selected_program")?.state,
    lastReported: dates[0],
    finishedAt: finished?.last_changed,
  };
}
export function selectAppliances(
  appliances: Appliance[],
  config: ApplianceConfig,
  snapshot: RegistrySnapshot,
): { devices: Appliance[]; error?: string } {
  let candidates = appliances;
  if (config.area) {
    const id = snapshot.areas.find((a) => a.area_id === config.area);
    const matches = id
      ? [id]
      : snapshot.areas.filter(
          (a) => a.name.toLowerCase() === config.area!.toLowerCase(),
        );
    if (matches.length !== 1)
      return {
        devices: [],
        error: matches.length
          ? `Area name is ambiguous: ${config.area}`
          : `Area not found: ${config.area}`,
      };
    candidates = candidates.filter((d) => d.area?.id === matches[0].area_id);
  }
  const requested = config.device ? [config.device] : config.devices;
  if (!requested) return { devices: candidates };
  const devices: Appliance[] = [];
  for (const value of requested) {
    const id = candidates.find((d) => d.id === value);
    const matches = id
      ? [id]
      : candidates.filter((d) => d.name.toLowerCase() === value.toLowerCase());
    if (matches.length !== 1)
      return {
        devices: [],
        error: matches.length
          ? `Device name is ambiguous: ${value}`
          : `Device not found: ${value}`,
      };
    if (!devices.includes(matches[0])) devices.push(matches[0]);
  }
  return { devices };
}
