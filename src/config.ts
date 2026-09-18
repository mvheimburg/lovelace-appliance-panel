import { message } from "./localize";
import type { HomeAssistant, ApplianceConfig } from "./types";

export const CARD_KINDS = {
  "oven-card": "oven",
  "dishwasher-card": "dishwasher",
  "coffee-machine-card": "coffee",
  "refrigerator-card": "cooling",
  "appliance-card": "unknown",
} as const;

export function validateConfig(
  raw: Record<string, unknown>,
  hass?: HomeAssistant,
): ApplianceConfig {
  const error = (text: string) => new Error(message(hass, text));
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw error("Card configuration must be an object.");
  const kind =
    typeof raw.type === "string" ? raw.type.replace(/^custom:/, "") : "";
  if (
    !Object.prototype.hasOwnProperty.call(CARD_KINDS, kind) &&
    kind !== "kitchen-panel-card"
  )
    throw error("Unsupported appliance card type.");
  for (const field of ["device", "area", "title"]) {
    if (raw[field] !== undefined && typeof raw[field] !== "string")
      throw error(`${field} must be a string.`);
  }
  if (
    kind !== "kitchen-panel-card" &&
    (typeof raw.device !== "string" || !raw.device.trim())
  )
    throw error("Select a Home Connect Local device (ID or name).");
  if (
    raw.devices !== undefined &&
    (!Array.isArray(raw.devices) ||
      raw.devices.some((value) => typeof value !== "string" || !value.trim()))
  )
    throw error("devices must be an array of device IDs or names.");
  for (const field of ["expand", "confirm_start"]) {
    if (raw[field] !== undefined && typeof raw[field] !== "boolean")
      throw error(`${field} must be true or false.`);
  }
  if (
    raw.appearance !== undefined &&
    raw.appearance !== "default" &&
    raw.appearance !== "bubble"
  )
    throw error("appearance must be default or bubble.");
  const modules = raw.oven_modules ?? "auto";
  if (
    raw.oven_modules === null ||
    (modules !== "auto" &&
      (!Array.isArray(modules) ||
        modules.some((value) => value !== "microwave" && value !== "steam")))
  )
    throw error(
      "oven_modules must be auto or an array containing microwave and/or steam.",
    );
  return {
    ...raw,
    type: raw.type as string,
    appearance: raw.appearance ?? "default",
    expand: (raw.expand as boolean | undefined) ?? true,
    confirm_start: (raw.confirm_start as boolean | undefined) ?? true,
    oven_modules: Array.isArray(modules) ? [...new Set(modules)] : modules,
  } as ApplianceConfig;
}
