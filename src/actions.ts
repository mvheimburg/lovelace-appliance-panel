import { applianceStatus } from "./model";
import type {
  ActionPolicy,
  Appliance,
  ApplianceAction,
  HassStates,
  HomeAssistant,
  Role,
} from "./types";

const deny = (reason: string): ActionPolicy => ({
  allowed: false,
  reason,
  confirmation: false,
});
const allowed = (confirmation = false, reason?: string): ActionPolicy => ({
  allowed: true,
  confirmation,
  ...(reason ? { reason } : {}),
});
const finite = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

/** Disabled diagnostics are normally absent from HA's state machine, not a denial. */
function permission(
  appliance: Appliance,
  states: HassStates,
  role: "remote_start" | "remote_control",
): "yes" | "no" | "unverified" {
  const entries = appliance.entities.filter(
    (e) => e.role === role && !e.registry.disabled_by,
  );
  if (!entries.length) return "unverified";
  return entries.every((e) => {
    if (
      e.registry.platform !== "homeconnect_ws" ||
      e.registry.device_id !== appliance.id
    )
      return false;
    const value = states[e.entityId]?.state.toLowerCase().split(".").pop();
    return role === "remote_start"
      ? value === "on"
      : ["on", "manualremotestart", "permanentremotestart"].includes(
          value ?? "",
        );
  })
    ? "yes"
    : "no";
}

/** Pure policy shared by all UI paths; dispatch repeats it against current HA state. */
export function actionPolicy(
  appliance: Appliance,
  states: HassStates,
  action: ApplianceAction,
): ActionPolicy {
  if (appliance.registry.disabled_by)
    return deny("This appliance is disabled.");
  const entries = appliance.entities.filter(
    (e) => e.entityId === action.entityId,
  );
  if (entries.length !== 1)
    return deny("The control is missing or ambiguous on this appliance.");
  const entity = entries[0];
  if (
    entity.registry.device_id !== appliance.id ||
    entity.registry.platform !== "homeconnect_ws" ||
    entity.registry.entity_id !== action.entityId
  )
    return deny(
      "The control does not belong to this Home Connect Local appliance.",
    );
  if (entity.registry.disabled_by)
    return deny("This control is disabled in Home Assistant.");
  const domain = entity.entityId.split(".")[0];
  if (!["button", "select", "number", "switch"].includes(domain))
    return deny(
      "This entity is read-only; its domain has no supported appliance action.",
    );
  const state = states[entity.entityId];
  // Local HCProgram returns no current option before the first selection; it can
  // still expose available programmes. Retain every selection/start guard below.
  const unselectedProgram =
    domain === "select" &&
    entity.role === "selected_program" &&
    Array.isArray(state?.attributes.options) &&
    state.attributes.options.length > 0;
  // HA buttons have state "unknown" until their first press: this is available.
  if (
    !state ||
    state.state === "unavailable" ||
    (state.state === "unknown" && domain !== "button" && !unselectedProgram)
  )
    return deny("This control is unavailable or its state is unknown.");
  const transport: Role[] = ["start", "pause", "resume", "abort"];
  if (transport.includes(entity.role) && domain !== "button")
    return deny("This transport control has an unsupported entity domain.");
  if (
    ["selected_program", "active_program"].includes(entity.role) &&
    domain !== "select"
  )
    return deny("This programme entity is not a supported selector.");
  if (domain === "select") {
    if (
      typeof action.value !== "string" ||
      !Array.isArray(state.attributes.options) ||
      !state.attributes.options.includes(action.value)
    )
      return deny("Choose an option currently exposed by this selector.");
  }
  if (domain === "number") {
    const { min, max, step } = state.attributes;
    if (!finite(action.value)) return deny("Enter a finite numeric value.");
    if (!Number.isInteger(action.value))
      return deny(
        "Home Connect Local requires an integer value for this number control.",
      );
    if (
      !finite(min) ||
      !finite(max) ||
      min > max ||
      (step != null && (!finite(step) || step <= 0))
    )
      return deny("This control does not expose valid numeric limits or step.");
    if (action.value < min || action.value > max)
      return deny(`Enter a value between ${min} and ${max}.`);
    // Local's number implementation coerces to int; HA defaults the absent step to 1.
    const increment = step ?? 1;
    const steps = (action.value - min) / increment;
    if (Math.abs(steps - Math.round(steps)) > 1e-7)
      return deny(
        `Enter a value aligned with the ${increment} step from ${min}.`,
      );
  }
  if (domain === "switch" && typeof action.value !== "boolean")
    return deny("Switch controls require an explicit on or off value.");
  const status = applianceStatus(appliance, states);
  if (status.online === "offline" || status.operation === "offline")
    return deny("The appliance is offline.");
  const operation = status.operation;
  if (entity.role === "abort") {
    return [
      "delayed",
      "running",
      "paused",
      "error",
      "action_required",
      "aborting",
    ].includes(operation)
      ? allowed()
      : deny("Abort is available only for an active or interrupted programme.");
  }
  const remoteControl = permission(appliance, states, "remote_control");
  if (entity.role === "pause") {
    if (!["running", "delayed"].includes(operation))
      return deny("Pause requires a running or delayed programme.");
    if (remoteControl === "no")
      return deny("Remote control is disabled or unavailable.");
    return allowed(
      remoteControl === "unverified",
      remoteControl === "unverified"
        ? "Remote control permission is unverified; confirm this action."
        : undefined,
    );
  }
  const starts =
    ["start", "resume", "selected_program", "active_program"].includes(
      entity.role,
    ) ||
    (entity.role === "other" && ["button", "select"].includes(domain));
  if (starts) {
    if (
      entity.role === "resume"
        ? operation !== "paused"
        : !["ready", "finished"].includes(operation)
    )
      return deny(
        entity.role === "resume"
          ? "Resume requires a paused programme."
          : "This action requires a ready or finished appliance.",
      );
    if (permission(appliance, states, "remote_start") === "no")
      return deny("Remote start is disabled, unknown or unavailable.");
    if (remoteControl === "no")
      return deny("Remote control is disabled, unknown or unavailable.");
    const unverified =
      remoteControl === "unverified" ||
      permission(appliance, states, "remote_start") === "unverified";
    return allowed(
      true,
      unverified
        ? "Remote permission is unverified; this action may start the appliance. Confirm before proceeding."
        : "This action may start the appliance. Confirm before proceeding.",
    );
  }
  return allowed();
}

export async function executeAction(
  hass: HomeAssistant,
  appliance: Appliance,
  action: ApplianceAction,
  confirmed: boolean,
): Promise<void> {
  if (!hass.connection.connected)
    throw new Error(
      "Home Assistant is disconnected. Reconnect before controlling this appliance.",
    );
  const policy = actionPolicy(appliance, hass.states, action);
  if (!policy.allowed)
    throw new Error(policy.reason ?? "This action is not permitted.");
  if (policy.confirmation && !confirmed)
    throw new Error(policy.reason ?? "Confirm this action before proceeding.");
  if (!hass.callService)
    throw new Error("Home Assistant service calls are unavailable.");
  const domain = action.entityId.split(".")[0];
  const data: Record<string, unknown> = { entity_id: action.entityId };
  let service: string;
  if (domain === "button") service = "press";
  else if (domain === "select") {
    service = "select_option";
    data.option = action.value;
  } else if (domain === "number") {
    service = "set_value";
    data.value = action.value;
  } else service = action.value ? "turn_on" : "turn_off";
  await hass.callService(domain, service, data);
}
