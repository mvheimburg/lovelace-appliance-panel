export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed?: string;
  last_updated?: string;
}
export type HassStates = Record<string, HassEntity>;
export interface EntityRegistryEntry {
  entity_id: string;
  platform: string;
  device_id: string | null;
  unique_id: string;
  name?: string | null;
  original_name?: string | null;
  disabled_by?: string | null;
  labels?: string[];
}
export interface DeviceRegistryEntry {
  id: string;
  name: string;
  name_by_user?: string | null;
  area_id?: string | null;
  disabled_by?: string | null;
  model?: string | null;
  manufacturer?: string | null;
}
export interface AreaRegistryEntry {
  area_id: string;
  name: string;
}
export interface LabelRegistryEntry {
  label_id: string;
  name: string;
}
export interface RegistrySnapshot {
  entities: EntityRegistryEntry[];
  devices: DeviceRegistryEntry[];
  areas: AreaRegistryEntry[];
  labels: LabelRegistryEntry[];
}
export interface HassConnection {
  readonly connected: boolean;
  addEventListener(type: "ready" | "disconnected", callback: () => void): void;
  removeEventListener(
    type: "ready" | "disconnected",
    callback: () => void,
  ): void;
  sendMessagePromise<T>(message: { type: string }): Promise<T>;
  subscribeEvents<T>(
    callback: (event: T) => void,
    eventType: string,
  ): Promise<() => void>;
}
export interface HomeAssistant {
  connection: HassConnection;
  states: HassStates;
  language?: string;
  locale?: { language?: string };
  formatEntityState?(state: HassEntity, stateOverride?: string): string;
  callService?(
    domain: string,
    service: string,
    data: Record<string, unknown>,
  ): Promise<unknown>;
}
export interface RegistryWatchValue {
  disconnected?: boolean;
  snapshot?: RegistrySnapshot;
  error?: string;
}
export type ApplianceKind =
  "oven" | "dishwasher" | "coffee" | "cooling" | "washer" | "dryer" | "unknown";
export type Role =
  | "power"
  | "operation"
  | "selected_program"
  | "active_program"
  | "progress"
  | "remaining"
  | "elapsed"
  | "start_delay"
  | "phase"
  | "door"
  | "start"
  | "pause"
  | "resume"
  | "abort"
  | "remote_start"
  | "remote_control"
  | "target_temperature"
  | "current_temperature"
  | "duration"
  | "child_lock"
  | "connection"
  | "finished"
  | "cooling_setpoint"
  | "super_mode"
  | "vacation"
  | "attention"
  | "option"
  | "other";
export interface ApplianceEntity {
  entityId: string;
  role: Role;
  name: string;
  registry: EntityRegistryEntry;
}
export interface Appliance {
  id: string;
  name: string;
  kind: ApplianceKind;
  area?: { id: string; name: string };
  registry: DeviceRegistryEntry;
  entities: ApplianceEntity[];
  disabledCount: number;
}
export type Operation =
  | "off"
  | "ready"
  | "delayed"
  | "running"
  | "paused"
  | "finished"
  | "error"
  | "action_required"
  | "aborting"
  | "offline"
  | "unknown";
export interface Attention {
  entityId?: string;
  message: string;
  severity: "error" | "warning" | "unknown";
}
export interface ApplianceStatus {
  operation: Operation;
  busy: boolean;
  online: "online" | "offline" | "unknown";
  progress?: number;
  remainingSeconds?: number;
  delaySeconds?: number;
  estimatedFinish?: number;
  phase?: string;
  program?: string;
  lastReported?: string;
  finishedAt?: string;
  attention: Attention[];
}
export interface ApplianceConfig {
  type: string;
  device?: string;
  area?: string;
  devices?: string[];
  title?: string;
  appearance: "default" | "bubble";
  expand: boolean;
  confirm_start: boolean;
  [key: string]: unknown;
}
export interface ApplianceAction {
  entityId: string;
  value?: string | number | boolean;
}
export interface ActionPolicy {
  allowed: boolean;
  reason?: string;
  confirmation: boolean;
}
