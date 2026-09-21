import type {
  Appliance,
  ApplianceEntity,
  HassConnection,
  HassEntity,
  HassStates,
  Role,
} from "./types";
import { semanticKey } from "./roles";

/** Time (ms) and value; `undefined` breaks the line (unavailable). */
export type Point = [number, number | undefined];
export interface Source {
  entityId: string;
  /** Palette slot: a setpoint shares its zone's reading colour. */
  color: number;
  /** Setpoints are drawn dashed. */
  setpoint: boolean;
}
export interface Series extends Source {
  unit: string;
  points: Point[];
}
export const RANGES = [6, 24, 168] as const;
export type Range = (typeof RANGES)[number];
/** Number of palette slots in styles.ts (.series-0 … .series-4). */
export const PALETTE = 5;

/** Home Assistant's compressed, minimal history row. */
interface Row {
  s: string;
  lu?: number;
  lc?: number;
}

export const isTemperature = (unit: string) => ["°C", "°F", "K"].includes(unit);

function numeric(state: string): number | undefined {
  if (["unavailable", "unknown", ""].includes(state)) return undefined;
  const value = Number(state);
  return Number.isFinite(value) ? value : undefined;
}

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
 * A reading tile opens the history when it is a numeric sensor measurement.
 * Programme timing, progress, labels, on/off states and timestamps do not.
 */
export function hasHistory(
  entity: ApplianceEntity,
  state: HassEntity | undefined,
): boolean {
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
function zone(entity: ApplianceEntity): string {
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
 * the matching setpoints (dashed, in the reading's colour) and the reading
 * that was tapped when it is something else.
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
  const temperature =
    tapped.role === "current_temperature" || isTemperature(unit(tapped));
  const sources: Source[] = [];
  const colors = new Map<string, number>();
  let next = 0;
  const color = () => next++ % PALETTE;
  for (const e of readings) {
    const c = color();
    sources.push({ entityId: e.entityId, color: c, setpoint: false });
    const z = zone(e);
    if (z && !colors.has(z)) colors.set(z, c);
  }
  if (!temperature && !readings.some((e) => e.entityId === tapped.entityId))
    sources.push({
      entityId: tapped.entityId,
      color: color(),
      setpoint: false,
    });
  const lone =
    readings.length === 1 && setpoints.length === 1
      ? sources[0]?.color
      : undefined;
  for (const e of setpoints) {
    const matched = colors.get(zone(e)) ?? lone;
    sources.push({
      entityId: e.entityId,
      color: matched ?? color(),
      setpoint: true,
    });
  }
  // A reading's own entity first, then the rest in card order.
  if (temperature && !sources.some((s) => s.entityId === tapped.entityId))
    sources.unshift({
      entityId: tapped.entityId,
      color: color(),
      setpoint: false,
    });
  return sources;
}

/**
 * The history of each source over the last `hours`, from Home Assistant's
 * recorder, ending with the current state.
 */
export async function loadHistory(
  connection: HassConnection,
  sources: Source[],
  states: HassStates,
  hours: number,
  now = Date.now(),
): Promise<Series[]> {
  const start = now - hours * 3_600_000;
  const reply = sources.length
    ? await connection.sendMessagePromise<Record<string, Row[]>>({
        type: "history/history_during_period",
        start_time: new Date(start).toISOString(),
        entity_ids: [...new Set(sources.map((s) => s.entityId))],
        minimal_response: true,
        no_attributes: true,
        significant_changes_only: false,
      } as { type: string })
    : {};
  return sources.map((source) => {
    const current = states[source.entityId];
    const points: Point[] = (reply?.[source.entityId] ?? []).map((row) => [
      Math.max(start, (row.lu ?? row.lc ?? 0) * 1000),
      numeric(row.s),
    ]);
    if (current) points.push([now, numeric(current.state)]);
    return {
      ...source,
      unit: String(current?.attributes.unit_of_measurement ?? ""),
      points,
    };
  });
}

/** The value in force at `time`: the last point at or before it. */
export function valueAt(series: Series, time: number): number | undefined {
  let value: number | undefined;
  for (const [t, v] of series.points) {
    if (t > time) break;
    value = v;
  }
  return value;
}

/** Round-number ticks covering [min, max], about `count` of them. */
export function ticks(min: number, max: number, count = 4): number[] {
  const raw = (max - min) / count || 1;
  const power = 10 ** Math.floor(Math.log10(raw));
  const step =
    [1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= raw) ??
    10 * power;
  const out: number[] = [];
  // From the step at or below min up to the first step at or above max.
  for (let v = Math.floor(min / step) * step; ; v += step) {
    out.push(Number(v.toFixed(6)));
    if (v >= max - 1e-9) break;
  }
  return out;
}
