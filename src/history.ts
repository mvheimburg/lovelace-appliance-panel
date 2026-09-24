import {
  PALETTE,
  isTemperature,
  numeric,
  type Source,
} from "lovelace-card-history";
import type {
  Appliance,
  ApplianceEntity,
  HassEntity,
  HassStates,
  Role,
} from "./types";
import { semanticKey } from "./roles";

/** Roles whose value is a countdown, timer or label, not a measurement. */
const NOT_A_MEASUREMENT: Role[] = [
  "operation",
  "selected_program",
  "active_program",
  "progress",
  "remaining",
  "elapsed",
  "start_delay",
  "phase",
  "power",
  "connection",
];

/**
 * A reading tile opens the history when it is a numeric sensor measurement or
 * a door. Programme timing, progress, labels, other on/off states and
 * timestamps do not.
 */
export function hasHistory(
  entity: ApplianceEntity,
  state: HassEntity | undefined,
): boolean {
  if (entity.role === "door")
    return (
      !!state &&
      ["binary_sensor.", "sensor."].some((d) => entity.entityId.startsWith(d))
    );
  if (!entity.entityId.startsWith("sensor.") || !state) return false;
  if (NOT_A_MEASUREMENT.includes(entity.role)) return false;
  const attributes = state.attributes;
  if (
    ["duration", "timestamp", "date", "enum"].includes(attributes.device_class)
  )
    return false;
  if (!attributes.unit_of_measurement && !attributes.state_class) return false;
  return (
    ["unavailable", "unknown"].includes(state.state) ||
    numeric(state.state) !== undefined
  );
}

/** The zone an entity measures or controls, to pair a reading with its setpoint. */
export type Zone = "meatprobe" | "freezer" | "chiller" | "fridge" | "oven" | "";
function zone(entity: ApplianceEntity): Zone {
  // The unique key, not the entity ID: that starts with the device's name.
  const key = (
    semanticKey(entity.registry) || entity.entityId.split(".")[1]
  ).toLowerCase();
  if (/meat_?probe/.test(key)) return "meatprobe";
  if (/freezer/.test(key)) return "freezer";
  if (/chiller/.test(key)) return "chiller";
  if (/fridge|refrigerator/.test(key)) return "fridge";
  if (/oven/.test(key)) return "oven";
  return "";
}

/**
 * The readings drawn together for one appliance: its current temperatures,
 * the matching setpoints (dashed, in the reading's colour), the reading that
 * was tapped when it is something else, and its doors as lanes below.
 */
export function historySources(
  device: Appliance,
  tapped: ApplianceEntity,
  states: HassStates,
): Source[] {
  const unit = (e: ApplianceEntity) =>
    String(states[e.entityId]?.attributes.unit_of_measurement ?? "");
  const readings = device.entities.filter(
    (e) =>
      e.role === "current_temperature" &&
      (e.entityId === tapped.entityId || hasHistory(e, states[e.entityId])),
  );
  const setpoints = device.entities.filter(
    (e) =>
      ["cooling_setpoint", "target_temperature"].includes(e.role) &&
      e.entityId.startsWith("number.") &&
      !!states[e.entityId],
  );
  const doors = device.entities.filter(
    (e) =>
      e.role === "door" &&
      (e.entityId === tapped.entityId || hasHistory(e, states[e.entityId])),
  );
  const door = tapped.role === "door";
  const temperature =
    !door &&
    (tapped.role === "current_temperature" || isTemperature(unit(tapped)));
  const sources: Source[] = [];
  const colors = new Map<string, number>();
  let next = 0;
  const color = () => next++ % PALETTE;
  for (const e of readings) {
    const c = color();
    sources.push({ entityId: e.entityId, color: c });
    const z = zone(e);
    if (z && !colors.has(z)) colors.set(z, c);
  }
  if (
    !door &&
    !temperature &&
    !readings.some((e) => e.entityId === tapped.entityId)
  )
    sources.push({ entityId: tapped.entityId, color: color() });
  // One setpoint left over for one reading left over (a fridge setpoint and
  // an ambient reading without a zone in its key): they belong together.
  const zones = new Set(setpoints.map(zone));
  const spareReadings = readings.filter((e) => !zone(e) || !zones.has(zone(e)));
  const spareSetpoints = setpoints.filter((e) => !colors.has(zone(e)));
  const spare =
    spareReadings.length === 1 && spareSetpoints.length === 1
      ? sources.find((s) => s.entityId === spareReadings[0].entityId)?.color
      : undefined;
  for (const e of setpoints) {
    const z = zone(e);
    sources.push({
      entityId: e.entityId,
      color: colors.get(z) ?? spare ?? color(),
      kind: "step",
      tag: z,
    });
  }
  // A reading's own entity first, then the rest in card order.
  if (temperature && !sources.some((s) => s.entityId === tapped.entityId))
    sources.unshift({ entityId: tapped.entityId, color: color() });
  for (const e of doors)
    sources.push({
      entityId: e.entityId,
      color: color(),
      kind: "lane",
    });
  return sources;
}
