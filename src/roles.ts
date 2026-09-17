import type { EntityRegistryEntry, HassEntity, Role } from "./types";

// Home Connect Local descriptions at 27ee7995d722e0a339cd4946e6f127d4c302150d.
const exact: Record<string, Role> = {
  // Legacy semantic aliases, not current upstream description keys.
  number_fridge_temperature: "cooling_setpoint",
  number_freezer_temperature: "cooling_setpoint",
  switch_super_mode_fridge: "super_mode",
  switch_super_mode_freezer: "super_mode",
  connection: "connection",
  sensor_operation_state: "operation",
  select_program: "selected_program",
  sensor_active_program: "active_program",
  select_active_program: "active_program",
  button_start_program: "start",
  button_pause_program: "pause",
  button_resume_program: "resume",
  button_abort_program: "abort",
  binary_remote_start_allowed: "remote_start",
  select_remote_control_level: "remote_control",
  switch_power_state: "power",
  select_power_state: "power",
  sensor_power_state: "power",
  button_mains_power_off: "power",
  sensor_program_progress: "progress",
  sensor_remaining_program_time: "remaining",
  sensor_elapsed_program_time: "elapsed",
  sensor_start_in: "start_delay",
  number_start_in: "start_delay",
  number_duration: "duration",
  sensor_program_phase: "phase",
  sensor_coffeemaker_process_phase: "phase",
  binary_sensor_program_finished: "finished",
  switch_child_lock: "child_lock",
  select_oven_child_lock_setting: "child_lock",
  number_oven_setpoint_temperature: "target_temperature",
  switch_refrigerator_vacation: "vacation",
  sensor_salt: "attention",
  sensor_rinse_aid: "attention",
  sensor_water_tank: "attention",
  sensor_drip_tray: "attention",
};
const optionKeys = new Set([
  "select_oven_level",
  "select_oven_used_heating_mode",
  "select_pyrolysis_level",
  "switch_oven_fast_pre_heat",
  "select_coffee_temperature",
  "select_bean_amount",
  "select_beverage_size",
  "select_coffee_milk_ratio",
  "select_hot_water_temperature",
  "select_flow_rate",
  "select_coarsness",
  "select_coffee_strength",
  "select_aroma_select",
  "select_bean_container",
  "select_shot_count",
  "select_cups",
  "number_fill_quantity",
  "switch_multiple_beverages",
  "switch_cup_warmer",
  "switch_extra_dry_option",
  "switch_hygiene_plus",
  "switch_intensiv_zone",
  "switch_vario_speed_plus",
  "switch_silence_on_demand",
  "switch_brilliance_dry",
  "switch_zeolite_dry",
  "switch_half_load",
  "switch_extra_rinse",
  "switch_pretreatment",
  // Explicit capability extensions; absent from current upstream description catalog.
  "select_microwave_power",
  "number_microwave_power",
  "select_oven_microwave_power",
  "number_oven_microwave_power",
  "select_steam_level",
  "select_oven_steam_level",
  "select_added_steam",
  "switch_added_steam",
]);
export function semanticKey(entry: EntityRegistryEntry): string {
  const unique = entry.unique_id.toLowerCase();
  const match = unique.match(
    /(?:^|-)((?:binary_sensor_|binary_remote_|sensor_|select_|number_|switch_|button_|light_|fan_).+)$/,
  );
  if (match) return match[1];
  if (/(?:^|-)connection$/.test(unique)) return "connection";
  return "";
}
function roleForKey(key: string): Role | undefined {
  if (exact[key]) return exact[key];
  if (
    /^(?:binary_sensor|sensor)_(?:(?:freezer|fridge|chiller_common)_)?door_state$/.test(
      key,
    )
  )
    return "door";
  if (
    /^sensor_oven_current_(?:temperature|meatprobe_temperature)(?:_\d+)?$/.test(
      key,
    )
  )
    return "current_temperature";
  if (/^sensor_temperature_(?:ambient|memory_freezer)$/.test(key))
    return "current_temperature";
  if (/^sensor_oven_water_tank(?:_\d+)?$/.test(key)) return "attention";
  if (
    /^number_setpoint_(?:freezer|refrigerator|chiller_common)(?:_fahrenheit)?$/.test(
      key,
    )
  )
    return "cooling_setpoint";
  if (/^switch_super_(?:freezer|refrigerator)$/.test(key)) return "super_mode";
  if (
    /^binary_sensor_(?:door_alarm|temperature_alarm)_(?:freezer|fridge|chiller_common)$/.test(
      key,
    )
  )
    return "attention";
  if (
    /^sensor_(?:countdown_(?:calc_n_clean|cleaning|descaling|water_filter)|machinecare_remaining_runs)$/.test(
      key,
    )
  )
    return "attention";
  if (
    /^binary_sensor_(?:.*(?:alarm|error|lack|empty|low_water_pressure|aqua_stop|water_filter_(?:almost_)?full)|program_aborted)$/.test(
      key,
    )
  )
    return "attention";
  if (optionKeys.has(key) || /^select_flexspray_/.test(key)) return "option";
  return undefined;
}
export function resolveRole(
  entry: EntityRegistryEntry,
  state?: HassEntity,
): Role {
  const key = semanticKey(entry);
  // A known unique-key namespace wins even when the entity was renamed to another command.
  if (key)
    return (
      roleForKey(key) ??
      (state?.attributes.device_class === "problem" &&
      entry.entity_id.startsWith("binary_sensor.")
        ? "attention"
        : "other")
    );
  const [domain, objectId = ""] = entry.entity_id.split(".");
  const candidates = new Set<Role>();
  for (const suffix of Object.keys(exact).concat([...optionKeys])) {
    const short = suffix.replace(
      /^(?:binary_sensor|binary|sensor|select|number|switch|button)_/,
      "",
    );
    const expected = suffix.startsWith("binary_")
      ? "binary_sensor"
      : suffix.split("_")[0];
    if (
      (domain === expected ||
        (suffix === "connection" && domain === "binary_sensor")) &&
      (objectId === short || objectId.endsWith(`_${short}`))
    )
      candidates.add(exact[suffix] ?? "option");
  }
  const parts = objectId.split("_");
  for (let i = 0; i < parts.length; i++) {
    const inferred = roleForKey(`${domain}_${parts.slice(i).join("_")}`);
    if (inferred) candidates.add(inferred);
  }
  if (candidates.size === 1) return [...candidates][0];
  if (candidates.size > 1) return "other";
  if (domain === "binary_sensor" && state?.attributes.device_class === "door")
    return "door";
  if (
    domain === "binary_sensor" &&
    state?.attributes.device_class === "problem"
  )
    return "attention";
  return "other";
}
export function humanize(value: string): string {
  const text = value
    .replace(
      /^(?:binary_sensor|binary_remote|sensor|select|number|switch|button)_/,
      "",
    )
    .replace(/[_.]+/g, " ")
    .trim();
  return text ? text[0].toUpperCase() + text.slice(1) : value;
}
