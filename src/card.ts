import { applyColorScheme } from "./color-schemes";
import {
  localize,
  message,
  stateLabel,
  language,
  formattingLocale,
  type TranslationKey,
} from "./localize";
import { LitElement, html, nothing, type TemplateResult } from "lit";
import { validateConfig, CARD_KINDS } from "./config";
import { semanticKey } from "./roles";
import { discoverAppliances, applianceStatus, selectAppliances } from "./model";
import { actionPolicy, executeAction } from "./actions";
import { watchRegistries, refreshRegistries } from "./registry";
import { styles } from "./styles";
import { icon, type IconName } from "./icons";
import type {
  HomeAssistant,
  ApplianceConfig,
  RegistryWatchValue,
  Appliance,
  ApplianceEntity,
  ApplianceAction,
  ApplianceKind,
  ApplianceStatus,
  Role,
} from "./types";
const labels: Record<string, TranslationKey> = {
  off: "Off",
  ready: "Ready",
  delayed: "Delayed start",
  running: "Running",
  paused: "Paused",
  finished: "Finished",
  error: "Error",
  action_required: "Needs attention",
  aborting: "Stopping",
  offline: "Offline",
  unknown: "Status unknown",
};
const kindNames: Record<ApplianceKind, TranslationKey> = {
  oven: "Oven",
  dishwasher: "Dishwasher",
  coffee: "Coffee machine",
  cooling: "Refrigerator",
  washer: "Washer",
  dryer: "Dryer",
  unknown: "Appliance",
};
const icons: Record<ApplianceKind, IconName> = {
  oven: "oven",
  dishwasher: "dishwasher",
  coffee: "coffee",
  cooling: "cooling",
  washer: "washer",
  dryer: "dryer",
  unknown: "unknown",
};
/** Presentation tone; the colour comes from HA theme variables in styles.ts. */
type Tone =
  "active" | "ready" | "done" | "attention" | "error" | "offline" | "idle";
const WRITABLE = ["button", "select", "number", "switch"];
export function duration(seconds?: number, hass?: HomeAssistant): string {
  if (seconds === undefined || !Number.isFinite(seconds))
    return localize(hass, "Time unknown");
  const mins = Math.ceil(Math.max(0, seconds) / 60);
  return mins >= 60
    ? `${Math.floor(mins / 60)} ${language(hass) === "nb" ? "t" : "h"}${mins % 60 ? ` ${mins % 60} min` : ""}`
    : `${mins} min`;
}
function moduleOf(entity: ApplianceEntity): "microwave" | "steam" | undefined {
  const key =
    semanticKey(entity.registry) ||
    entity.entityId
      .toLowerCase()
      .match(
        /(?:^|_)((?:microwave_power|micro_wave_power|steam_level|added_steam|water_tank)(?:_\d+)?)$/,
      )?.[1] ||
    "";
  return /microwave|micro_wave/.test(key)
    ? "microwave"
    : /steam|water_tank/.test(key)
      ? "steam"
      : undefined;
}
export class ApplianceCard extends LitElement {
  static styles = styles;
  private t(key: TranslationKey, values: Record<string, string | number> = {}) {
    return localize(this.ha, key, values);
  }
  private m(text: string) {
    return message(this.ha, text);
  }
  private config?: ApplianceConfig;
  private ha?: HomeAssistant;
  private registry: RegistryWatchValue = {};
  private unsubscribe?: () => void;
  private timer?: ReturnType<typeof setInterval>;
  private epoch = 0;
  private detailId?: string;
  private configureId?: string;
  /** Entity whose command is in flight, so its control can show progress. */
  private inFlight?: string;
  private pending?: {
    deviceId: string;
    action: ApplianceAction;
    epoch: number;
    signature: string;
    reason?: string;
  };
  private busy = false;
  private error = "";
  private notice = "";
  set hass(value: HomeAssistant) {
    const replaced = this.ha?.connection !== value.connection;
    this.ha = value;
    if (replaced) {
      this.unsubscribe?.();
      this.unsubscribe = undefined;
      this.invalidate();
      if (this.isConnected) this.watch();
    }
    this.requestUpdate();
  }
  get hass() {
    return this.ha!;
  }
  setConfig(value: Record<string, unknown>) {
    const next = validateConfig(value, this.ha);
    applyColorScheme(this, value.color_scheme, this.ha);
    if (
      this.config &&
      (this.config.device !== next.device ||
        this.config.type !== next.type ||
        JSON.stringify(this.config.devices) !== JSON.stringify(next.devices) ||
        this.config.area !== next.area)
    ) {
      this.closeDialogs();
      this.pending = undefined;
      this.detailId = undefined;
      this.configureId = undefined;
      this.error = "";
      this.notice = "";
      this.epoch++;
    }
    this.config = next;
    this.setAttribute("appearance", next.appearance);
    this.requestUpdate();
  }
  getCardSize() {
    return this.config?.expand === false ? 1 : this.isOverview ? 4 : 6;
  }
  connectedCallback() {
    super.connectedCallback();
    this.watch();
    this.timer = setInterval(() => this.requestUpdate(), 15000);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    clearInterval(this.timer);
    this.closeDialogs();
    this.invalidate();
  }
  private get isOverview() {
    return this.config?.type.replace("custom:", "") === "kitchen-panel-card";
  }
  private watch() {
    if (this.ha && !this.unsubscribe)
      this.unsubscribe = watchRegistries(this.ha, (value) => {
        this.epoch++;
        this.registry = value;
        if (!value.snapshot) {
          this.pending = undefined;
          this.closeDialogs();
        }
        this.requestUpdate();
      });
  }
  private invalidate() {
    this.registry = {};
    this.epoch++;
    this.pending = undefined;
    this.closeDialogs();
  }
  private closeDialogs() {
    this.shadowRoot?.querySelectorAll("dialog").forEach((d) => d.close());
  }
  private selection() {
    if (!this.registry.snapshot || !this.ha || !this.config)
      return { devices: [] as Appliance[] };
    return selectAppliances(
      discoverAppliances(this.registry.snapshot, this.ha.states),
      this.config,
      this.registry.snapshot,
    );
  }
  private kind(device: Appliance): ApplianceKind {
    return CARD_KINDS[
      this.config!.type.replace("custom:", "") as keyof typeof CARD_KINDS
    ] === undefined || this.config!.type.endsWith("appliance-card")
      ? device.kind
      : CARD_KINDS[
          this.config!.type.replace("custom:", "") as keyof typeof CARD_KINDS
        ];
  }
  private status(device: Appliance) {
    return applianceStatus(device, this.ha!.states, Date.now());
  }
  private statusLabel(device: Appliance) {
    const status = this.status(device);
    return this.kind(device) === "cooling" &&
      status.online === "online" &&
      status.operation === "unknown"
      ? this.t("Cooling")
      : this.t(labels[status.operation]);
  }
  private reading(entity: ApplianceEntity) {
    const state = this.ha?.states[entity.entityId];
    if (!state) return this.t("Not reported");
    if (state.state === "unavailable") return this.t("Unavailable");
    if (state.state === "unknown") return this.t("Unknown");
    const formatted = this.ha?.formatEntityState?.(state);
    if (formatted && formatted !== state.state) return formatted;
    const value = stateLabel(
      this.ha,
      state,
      state.state,
      ["selected_program", "active_program"].includes(entity.role),
    );
    return `${value}${state.attributes.unit_of_measurement ? ` ${state.attributes.unit_of_measurement}` : ""}`;
  }
  private entityName(entity: ApplianceEntity): string {
    const state = this.ha?.states[entity.entityId];
    // Integration and user names are not card-owned copy.
    if (
      entity.registry.name ||
      entity.registry.original_name ||
      state?.attributes.friendly_name
    )
      return entity.name;
    return this.m(entity.name);
  }
  private attentionMessage(
    device: Appliance,
    item: ApplianceStatus["attention"][number],
  ): string {
    const entity = device.entities.find((e) => e.entityId === item.entityId);
    if (!entity) return this.m(item.message);
    const value = item.message.slice(entity.name.length + 2);
    const state = this.ha?.states[entity.entityId];
    return `${this.entityName(entity)}: ${value === "not reported" ? this.t("Not reported") : value === "due" ? this.t("Due") : value === "unknown" ? this.t("Unknown") : state ? stateLabel(this.ha, state) : this.m(value)}`;
  }
  private programLabel(device: Appliance, value: string): string {
    const entity =
      device.entities.find((e) => e.role === "active_program") ??
      device.entities.find((e) => e.role === "selected_program");
    const state = entity && this.ha?.states[entity.entityId];
    return state ? stateLabel(this.ha, state, value, true) : value;
  }
  private phaseLabel(device: Appliance, value: string): string {
    const entity = device.entities.find((e) => e.role === "phase");
    const state = entity && this.ha?.states[entity.entityId];
    return state ? stateLabel(this.ha, state, value) : value;
  }
  private confirmationLabel(): string {
    const pending = this.pending;
    if (!pending) return "";
    const entity = this.selection()
      .devices.find((d) => d.id === pending.deviceId)
      ?.entities.find((e) => e.entityId === pending.action.entityId);
    const name = entity ? this.entityName(entity) : this.t("Action");
    if (pending.action.value === undefined) return name;
    const state = this.ha?.states[pending.action.entityId];
    const value = String(pending.action.value);
    return `${name}: ${state ? stateLabel(this.ha, state, value, entity?.role === "selected_program" || entity?.role === "active_program") : value}`;
  }
  private signature(device: Appliance, action: ApplianceAction) {
    return JSON.stringify([
      this.status(device).operation,
      device.entities
        .filter(
          (e) =>
            [
              "selected_program",
              "active_program",
              "remote_start",
              "remote_control",
              "connection",
            ].includes(e.role) || e.entityId === action.entityId,
        )
        .map((e) => [
          e.entityId,
          this.ha?.states[e.entityId]?.state,
          this.ha?.states[e.entityId]?.attributes.options,
        ]),
    ]);
  }
  private async requestAction(device: Appliance, action: ApplianceAction) {
    if (this.busy) return;
    this.error = "";
    this.notice = "";
    const policy = actionPolicy(device, this.ha!.states, action);
    if (!policy.allowed) {
      this.error = policy.reason ?? "This control is unavailable.";
      this.requestUpdate();
      return;
    }
    if (policy.confirmation && this.config!.confirm_start) {
      this.pending = {
        deviceId: device.id,
        reason: policy.reason,
        action,
        epoch: this.epoch,
        signature: this.signature(device, action),
      };
      this.requestUpdate();
      await this.updateComplete;
      this.shadowRoot
        ?.querySelector<HTMLDialogElement>("#confirmation")
        ?.showModal();
      return;
    }
    await this.perform(device, action, true);
  }
  private async perform(
    device: Appliance,
    action: ApplianceAction,
    confirmed: boolean,
  ) {
    this.busy = true;
    this.inFlight = action.entityId;
    this.error = "";
    this.notice = "";
    this.requestUpdate();
    try {
      if (
        !this.registry.snapshot ||
        this.registry.disconnected ||
        this.registry.error
      )
        throw new Error(
          "Device discovery is unavailable. Try again after reconnecting.",
        );
      await executeAction(this.ha!, device, action, confirmed);
      this.notice = "Command sent. Waiting for appliance status.";
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
    } finally {
      this.busy = false;
      this.inFlight = undefined;
      this.requestUpdate();
    }
  }
  private async confirm() {
    const pending = this.pending;
    this.pending = undefined;
    this.shadowRoot?.querySelector<HTMLDialogElement>("#confirmation")?.close();
    if (!pending) return;
    const device = this.selection().devices.find(
      (d) => d.id === pending.deviceId,
    );
    if (
      !device ||
      pending.epoch !== this.epoch ||
      pending.signature !== this.signature(device, pending.action)
    ) {
      this.error =
        "The appliance changed. Review its current status and try again.";
      this.requestUpdate();
      return;
    }
    await this.perform(device, pending.action, true);
  }
  private cancelConfirm() {
    this.pending = undefined;
    this.shadowRoot?.querySelector<HTMLDialogElement>("#confirmation")?.close();
    this.requestUpdate();
  }
  private async openDetails(device: Appliance) {
    this.detailId = device.id;
    this.requestUpdate();
    await this.updateComplete;
    this.shadowRoot?.querySelector<HTMLDialogElement>("#details")?.showModal();
  }
  private retry() {
    this.registry = {};
    this.error = "";
    this.epoch++;
    if (this.ha) refreshRegistries(this.ha);
    this.requestUpdate();
  }
  private async openConfigure(device: Appliance) {
    this.configureId = device.id;
    this.requestUpdate();
    await this.updateComplete;
    this.shadowRoot
      ?.querySelector<HTMLDialogElement>("#configure")
      ?.showModal();
  }
  private closeOnBackdrop(e: MouseEvent) {
    if (e.target !== e.currentTarget) return;
    const dialog = e.currentTarget as HTMLDialogElement;
    const r = dialog.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      dialog.close();
  }
  private tone(device: Appliance, status = this.status(device)): Tone {
    if (status.online === "offline" || status.operation === "offline")
      return "offline";
    switch (status.operation) {
      case "running":
      case "delayed":
      case "aborting":
        return "active";
      case "paused":
      case "action_required":
        return "attention";
      case "error":
        return "error";
      case "finished":
        return "done";
      case "ready":
        return "ready";
      case "unknown":
        return this.kind(device) === "cooling" && status.online === "online"
          ? "ready"
          : "idle";
      default:
        return "idle";
    }
  }
  private clock(epoch: number) {
    try {
      return new Intl.DateTimeFormat(formattingLocale(this.ha), {
        hour: "numeric",
        minute: "2-digit",
      }).format(epoch);
    } catch {
      return new Date(epoch).toLocaleTimeString();
    }
  }
  private isReading(entity: ApplianceEntity) {
    const domain = entity.entityId.split(".")[0];
    if (!WRITABLE.includes(domain)) return true;
    return (
      domain === "select" &&
      !Array.isArray(this.ha?.states[entity.entityId]?.attributes.options)
    );
  }
  private tile(entity: ApplianceEntity) {
    return html`<div class="tile" data-reading=${entity.entityId}>
      <span class="label">${this.entityName(entity)}</span
      ><strong class="value">${this.reading(entity)}</strong>
    </div>`;
  }
  private control(device: Appliance, entity: ApplianceEntity): TemplateResult {
    const state = this.ha!.states[entity.entityId];
    const domain = entity.entityId.split(".")[0];
    const unavailable =
      !state ||
      state.state === "unavailable" ||
      (state.state === "unknown" &&
        domain !== "button" &&
        !(
          domain === "select" &&
          entity.role === "selected_program" &&
          Array.isArray(state.attributes.options) &&
          state.attributes.options.length
        ));
    const sample =
      domain === "select"
        ? String(state?.attributes.options?.[0] ?? "")
        : domain === "number"
          ? Number(state?.attributes.min)
          : domain === "switch"
            ? state?.state !== "on"
            : undefined;
    const policy = actionPolicy(device, this.ha!.states, {
      entityId: entity.entityId,
      value: sample,
    });
    const disabled = this.busy || unavailable || !policy.allowed;
    const reason = unavailable
      ? this.t("Unavailable")
      : policy.reason
        ? this.m(policy.reason)
        : undefined;
    const name = this.entityName(entity);
    const pending = this.inFlight === entity.entityId;
    const hint =
      !policy.allowed && reason
        ? html`<small class="hint">${reason}</small>`
        : nothing;
    const act = (value?: string | number | boolean) =>
      void this.requestAction(device, { entityId: entity.entityId, value });
    if (domain === "select" && Array.isArray(state?.attributes.options)) {
      const options = state.attributes.options as string[];
      const program = ["selected_program", "active_program"].includes(
        entity.role,
      );
      // Short option sets are everyday choices: show them as chips.
      if (!program && options.length > 0 && options.length <= 5)
        return html`<div class="control${pending ? " pending" : ""}">
          <span class="label">${name}</span>
          <div
            class="chips"
            role="group"
            aria-label=${name}
            aria-busy=${pending ? "true" : "false"}
            data-entity=${entity.entityId}
            title=${reason ?? ""}
          >
            ${options.map(
              (option) =>
                html`<button
                  class="chip"
                  data-value=${option}
                  aria-pressed=${option === state.state ? "true" : "false"}
                  ?disabled=${disabled}
                  @click=${() => {
                    if (option !== state.state) act(option);
                  }}
                >
                  ${stateLabel(this.ha, state, option)}
                </button>`,
            )}
          </div>
          ${hint}
        </div>`;
      return html`<label class="control${pending ? " pending" : ""}"
        ><span class="label">${name}</span
        ><span class="select-wrap"
          ><select
            data-entity=${entity.entityId}
            aria-label=${name}
            aria-busy=${pending ? "true" : "false"}
            .value=${state.state}
            ?disabled=${disabled}
            title=${reason ?? ""}
            @change=${(e: Event) => {
              act((e.target as HTMLSelectElement).value);
              (e.target as HTMLSelectElement).value = state.state;
            }}
          >
            ${!options.includes(state.state) ? html`<option value=${state.state}>${this.reading(entity)}</option>` : nothing}${options.map((option: string) => html`<option value=${option} ?selected=${option === state.state}>${stateLabel(this.ha, state, option, program)}</option>`)}</select
          >${icon("chevron", "caret")}</span
        >${hint}</label
      >`;
    }
    if (domain === "number") {
      const unit = state?.attributes.unit_of_measurement;
      const min = Number(state?.attributes.min);
      const max = Number(state?.attributes.max);
      const current = unavailable ? NaN : Number(state.state);
      const step = (direction: number) => {
        const increment = Number(state?.attributes.step) || 1;
        let next = Number.isFinite(current)
          ? current + direction * increment
          : direction < 0
            ? max
            : min;
        if (Number.isFinite(min)) next = Math.max(min, next);
        if (Number.isFinite(max)) next = Math.min(max, next);
        // Keep the service value numeric; strip binary float noise only.
        act(Math.round(next * 1e6) / 1e6);
      };
      return html`<div class="control${pending ? " pending" : ""}">
        <span class="label">${name}${unit ? ` · ${unit}` : ""}</span>
        <div class="stepper">
          <button
            class="step"
            aria-label=${this.t("Decrease {name}", { name })}
            ?disabled=${disabled || (Number.isFinite(current) && current <= min)}
            @click=${() => step(-1)}
          >
            ${icon("minus")}</button
          ><input
            data-entity=${entity.entityId}
            aria-label=${name}
            aria-busy=${pending ? "true" : "false"}
            type="number"
            inputmode="numeric"
            .value=${!unavailable ? state.state : ""}
            min=${state?.attributes.min ?? ""}
            max=${state?.attributes.max ?? ""}
            step=${state?.attributes.step ?? "any"}
            ?disabled=${disabled}
            title=${reason ?? ""}
            @change=${(e: Event) => {
              const input = e.target as HTMLInputElement;
              if (input.value !== "" && input.reportValidity())
                act(Number(input.value));
              else
                this.error = "Enter a valid value within the appliance limits.";
              this.requestUpdate();
            }}
          /><button
            class="step"
            aria-label=${this.t("Increase {name}", { name })}
            ?disabled=${disabled || (Number.isFinite(current) && current >= max)}
            @click=${() => step(1)}
          >
            ${icon("plus")}
          </button>
        </div>
        ${hint}
      </div>`;
    }
    if (domain === "switch") {
      const on = state?.state === "on";
      return html`<div class="control">
        <button
          class="toggle${on ? " on" : ""}${pending ? " pending" : ""}"
          role="switch"
          aria-checked=${on ? "true" : "false"}
          aria-busy=${pending ? "true" : "false"}
          data-entity=${entity.entityId}
          ?disabled=${disabled}
          title=${reason ?? ""}
          @click=${() => act(!on)}
        >
          <span class="toggle-text">${name}</span
          ><span class="knob" aria-hidden="true"></span>
        </button>
        ${hint}
      </div>`;
    }
    if (domain === "button")
      return html`<div class="control">
        <button
          class="pill${pending ? " pending" : ""}"
          data-entity=${entity.entityId}
          aria-busy=${pending ? "true" : "false"}
          ?disabled=${disabled}
          title=${reason ?? ""}
          @click=${() => act()}
        >
          ${name}
        </button>
        ${hint}
      </div>`;
    return this.tile(entity);
  }
  private group(
    device: Appliance,
    title: string,
    entities: ApplianceEntity[],
    section?: string,
    module?: string,
  ) {
    if (!entities.length) return nothing;
    const readings = entities.filter((e) => this.isReading(e));
    const controls = entities.filter((e) => !this.isReading(e));
    return html`<section
      class="group"
      data-section=${section ?? ""}
      data-module=${module ?? nothing}
    >
      <h3>${title}</h3>
      ${readings.length ? html`<div class="tiles">${readings.map((e) => this.tile(e))}</div>` : nothing}
      ${controls.length ? html`<div class="controls">${controls.map((e) => this.control(device, e))}</div>` : nothing}
    </section>`;
  }
  private transport(device: Appliance, status: ApplianceStatus) {
    const roles: Role[] =
      status.operation === "running"
        ? ["pause", "abort"]
        : status.operation === "paused"
          ? ["resume", "abort"]
          : ["delayed", "error", "action_required", "aborting"].includes(
                status.operation,
              )
            ? ["abort"]
            : ["ready", "finished", "off"].includes(status.operation)
              ? ["start"]
              : [];
    const entities = device.entities.filter((e) => roles.includes(e.role));
    if (!entities.length) return nothing;
    return html`<div class="transport">
        ${entities.map((entity) => {
          const policy = actionPolicy(device, this.ha!.states, {
            entityId: entity.entityId,
          });
          const pending = this.inFlight === entity.entityId;
          return html`<button
            data-role=${entity.role}
            class="action ${entity.role === "abort" ? "danger" : entity.role === "start" || entity.role === "resume" ? "primary" : ""}"
            aria-busy=${pending ? "true" : "false"}
            ?disabled=${this.busy || !policy.allowed}
            title=${this.m(policy.reason ?? "")}
            @click=${() => this.requestAction(device, { entityId: entity.entityId })}
          >
            ${pending ? icon("spinner", "spin") : icon(entity.role as IconName)}<span
              >${this.t(({ start: "Start", pause: "Pause", resume: "Resume", abort: "Stop" } as Partial<Record<Role, TranslationKey>>)[entity.role] ?? "Action")}</span
            >
          </button>`;
        })}
      </div>
      ${entities.map((entity) => {
        const policy = actionPolicy(device, this.ha!.states, {
          entityId: entity.entityId,
        });
        return !policy.allowed && policy.reason
          ? html`<p class="permission">${this.m(policy.reason)}</p>`
          : nothing;
      })}`;
  }
  private attention(device: Appliance, status: ApplianceStatus) {
    return status.attention.length
      ? html`<section class="group">
          <h3>${this.t("Needs attention")}</h3>
          <ul class="attention">
            ${status.attention.map(
              (item) =>
                html`<li class="row ${item.severity}">
                  <span class="circ"
                    >${icon(item.severity === "unknown" ? "offline" : "warning")}</span
                  ><span class="text"
                    ><strong
                      >${this.attentionMessage(device, item)}</strong
                    ></span
                  >
                </li>`,
            )}
          </ul>
        </section>`
      : nothing;
  }
  private feedback() {
    return html`${
      this.busy
        ? html`<div class="feedback pending" role="status">
            <span class="circ">${icon("spinner", "spin")}</span
            ><span class="feedback-title">${this.t("Sending…")}</span>
          </div>`
        : nothing
    }${
      this.error
        ? html`<div class="feedback failed" role="alert">
            <span class="circ">${icon("warning")}</span
            ><span class="feedback-title">${this.m(this.error)}</span>
          </div>`
        : nothing
    }${
      this.notice
        ? html`<div class="feedback sent" role="status">
            <span class="circ">${icon("check")}</span
            ><span class="feedback-title">${this.m(this.notice)}</span>
          </div>`
        : nothing
    }`;
  }
  /** Role lookups shared by the everyday body and the configure view. */
  private parts(device: Appliance) {
    const kind = this.kind(device);
    const status = this.status(device);
    const roles = (...values: Role[]) =>
      device.entities.filter((e) => values.includes(e.role));
    const modules = this.config?.oven_modules ?? "auto";
    const moduleEntries = (which: "microwave" | "steam") =>
      kind === "oven" &&
      (modules === "auto" ||
        (Array.isArray(modules) && modules.includes(which)))
        ? device.entities.filter((e) => moduleOf(e) === which)
        : [];
    const moduleCandidates = new Set(
      kind === "oven"
        ? device.entities.filter((e) => moduleOf(e)).map((e) => e.entityId)
        : [],
    );
    const options = roles("option").filter(
      (e) => !moduleCandidates.has(e.entityId),
    );
    return { kind, status, roles, moduleEntries, moduleCandidates, options };
  }
  private hero(device: Appliance, status: ApplianceStatus) {
    const kind = this.kind(device);
    const op = status.operation;
    const roles = (...values: Role[]) =>
      device.entities.filter((e) => values.includes(e.role));
    const program =
      status.program && !["unknown", "unavailable"].includes(status.program)
        ? this.programLabel(device, status.program)
        : undefined;
    const kindName = this.t(kindNames[kind]);
    let line = this.statusLabel(device);
    let headline = line;
    const context: string[] = [];
    if (kind === "cooling") {
      const zones = roles("cooling_setpoint", "target_temperature");
      const zone =
        zones.find((e) =>
          ["unavailable", "unknown", undefined].every(
            (v) => this.ha?.states[e.entityId]?.state !== v,
          ),
        ) ??
        zones[0] ??
        roles("current_temperature")[0];
      if (zone && status.online === "online") {
        headline = this.reading(zone);
        context.push(this.entityName(zone));
      } else line = kindName;
    } else if (op === "error" || op === "action_required") {
      line = kindName;
      if (program) context.push(program);
    } else if (op === "delayed") {
      headline = duration(status.delaySeconds, this.ha);
      if (program) line += ` · ${program}`;
      context.push(this.t("Until start"));
    } else if (["running", "paused", "aborting"].includes(op)) {
      headline = duration(status.remainingSeconds, this.ha);
      if (program) line += ` · ${program}`;
      context.push(
        op === "paused" ? this.t("Paused · remaining") : this.t("Remaining"),
      );
      if (status.phase) context.push(this.phaseLabel(device, status.phase));
      if (op === "running" && status.estimatedFinish)
        context.push(
          this.t("Done around {time}", {
            time: this.clock(status.estimatedFinish),
          }),
        );
    } else if (op === "offline" || op === "unknown") {
      line = kindName;
    } else {
      if (program) headline = program;
      else line = kindName;
      if (op === "finished" && status.finishedAt)
        context.push(
          this.t("Finished {time} ago", {
            time: duration(
              (Date.now() - Date.parse(status.finishedAt)) / 1000,
              this.ha,
            ),
          }),
        );
    }
    if (status.online !== "online" && status.lastReported)
      context.push(
        this.t("Last reported: {time}", {
          time: new Date(status.lastReported).toLocaleString(
            formattingLocale(this.ha),
          ),
        }),
      );
    const showProgress =
      kind !== "cooling" &&
      !["ready", "off", "finished"].includes(op) &&
      status.progress !== undefined;
    return html`<div class="hero tone-${this.tone(device, status)}" data-hero>
      <div class="hero-main">
        <span class="circ big">${icon(icons[kind])}</span>
        <div class="hero-text">
          <div class="status">${line}</div>
          <div class="current">${headline}</div>
          ${context.length ? html`<div class="context">${context.join(" · ")}</div>` : nothing}
        </div>
      </div>
      ${showProgress ? html`<progress max="100" value=${status.progress!} aria-label=${this.t("Programme progress")}></progress>` : nothing}
    </div>`;
  }
  private deviceBody(device: Appliance) {
    const { kind, status, roles, moduleEntries, options } = this.parts(device);
    const picker = ["ready", "off", "finished"].includes(status.operation);
    return html`
      ${this.hero(device, status)}
      ${status.operation === "error" || status.operation === "action_required" ? html`<div class="feedback failed" role="alert"><span class="circ">${icon("warning")}</span><span class="feedback-title">${this.t(labels[status.operation])}</span></div>` : nothing}
      ${
        kind !== "cooling"
          ? html`${
              picker
                ? this.group(
                    device,
                    kind === "coffee"
                      ? this.t("Choose your drink")
                      : this.t("Programme"),
                    roles("selected_program"),
                    "programme",
                  )
                : nothing
            }${this.transport(device, status)}`
          : nothing
      }
      ${
        kind === "oven"
          ? html`${this.group(device, this.t("Oven"), roles("target_temperature", "current_temperature", "duration"), "oven")}${(
              ["microwave", "steam"] as const
            ).map((which) =>
              this.group(
                device,
                which === "microwave" ? this.t("Microwave") : this.t("Steam"),
                moduleEntries(which),
                undefined,
                which,
              ),
            )}`
          : nothing
      }
      ${kind === "cooling" ? html`${this.group(device, this.t("Temperature zones"), roles("cooling_setpoint", "target_temperature", "current_temperature"), "cooling")}${this.group(device, this.t("Doors"), roles("door"))}${this.group(device, this.t("Cooling modes"), roles("super_mode", "vacation"), "cooling-modes")}` : nothing}
      ${kind === "coffee" ? this.group(device, this.t("Your coffee"), options, "coffee") : kind === "dishwasher" ? this.group(device, this.t("Wash options"), options, "dishwasher") : kind !== "oven" && kind !== "cooling" ? this.group(device, this.t("Programme options"), options) : nothing}
      ${kind !== "cooling" ? this.group(device, this.t("Door & temperature"), roles("door", ...(kind !== "oven" ? ["current_temperature" as Role] : []))) : nothing}
      ${status.busy ? this.group(device, this.t("Programme timing"), roles("elapsed")) : nothing}
      ${this.attention(device, status)}
    `;
  }
  /** The power entity the header toggles; the rest stay in the configure view. */
  private headerPower(device: Appliance) {
    const power = device.entities.filter((e) => e.role === "power");
    const domain = (e: ApplianceEntity) => e.entityId.split(".")[0];
    return (
      power.find((e) => domain(e) === "switch") ??
      power.find(
        (e) =>
          domain(e) === "select" &&
          Array.isArray(this.ha?.states[e.entityId]?.attributes.options),
      ) ??
      power.find((e) => domain(e) === "sensor")
    );
  }
  private powerToggle(device: Appliance) {
    const entity = this.headerPower(device);
    if (!entity) return nothing;
    const state = this.ha!.states[entity.entityId];
    const domain = entity.entityId.split(".")[0];
    const value = (state?.state ?? "").toLowerCase().split(".").pop() ?? "";
    const on = value === "on";
    const label = this.reading(entity);
    let target: string | boolean | undefined;
    if (domain === "switch") target = !on;
    else if (domain === "select") {
      const options = (state?.attributes.options ?? []) as string[];
      const find = (key: string) =>
        options.find((o) => o.toLowerCase().split(".").pop() === key);
      target = on ? (find("standby") ?? find("off")) : find("on");
    }
    const unavailable =
      !state || ["unavailable", "unknown"].includes(state.state);
    if (target === undefined)
      return html`<span
        class="power${on ? " on" : ""}"
        data-power=${entity.entityId}
        aria-label=${`${this.t("Power")}: ${label}`}
        >${icon("power")}<span>${label}</span></span
      >`;
    const policy = actionPolicy(device, this.ha!.states, {
      entityId: entity.entityId,
      value: target,
    });
    const pending = this.inFlight === entity.entityId;
    const reason = unavailable
      ? this.t("Unavailable")
      : policy.reason
        ? this.m(policy.reason)
        : this.t("Power");
    return html`<button
      class="power${on ? " on" : ""}"
      data-power=${entity.entityId}
      aria-pressed=${on ? "true" : "false"}
      aria-busy=${pending ? "true" : "false"}
      aria-label=${this.t("Power")}
      title=${reason}
      ?disabled=${this.busy || unavailable || !policy.allowed}
      @click=${() =>
        this.requestAction(device, {
          entityId: entity.entityId,
          value: target,
        })}
    >
      ${pending ? icon("spinner", "spin") : icon("power")}<span>${label}</span>
    </button>`;
  }
  private headerActions(device: Appliance) {
    return html`${this.powerToggle(device)}<button
        class="icon-btn"
        data-configure
        aria-label=${this.t("Appliance settings")}
        title=${this.t("Appliance settings")}
        @click=${() => this.openConfigure(device)}
      >
        ${icon("cog")}
      </button>`;
  }
  private configureBody(device: Appliance) {
    const { kind, roles, moduleCandidates, options } = this.parts(device);
    const header = this.headerPower(device);
    const settings = [
      ...roles("power").filter((e) => e.entityId !== header?.entityId),
      ...roles("child_lock", "remote_control", "start_delay"),
      ...(kind === "oven" || kind === "cooling" ? options : []),
      ...(kind !== "oven" && kind !== "cooling"
        ? roles("target_temperature", "duration")
        : []),
    ];
    const care = roles("attention").filter(
      (e) => !moduleCandidates.has(e.entityId),
    );
    const other = roles("other").filter(
      (e) => !moduleCandidates.has(e.entityId),
    );
    return html`<section class="group" data-section="settings">
        <h3>${this.t("Appliance")}</h3>
        ${settings.length ? html`<div class="controls">${settings.map((e) => this.control(device, e))}</div>` : nothing}
        <div class="tiles">
          ${!roles("remote_start").length ? nothing : roles("remote_start").map((e) => html`<div class="tile"><span class="label">${this.t("Remote start")}</span><strong class="value">${this.reading(e)}</strong></div>`)}
        </div>
        ${!roles("remote_start").length ? html`<p class="permission">${this.t("Remote-start permission is not exposed. The appliance must permit remote operation.")}</p>` : nothing}
      </section>
      ${this.group(device, this.t("Consumables & care"), care, "care")}
      ${other.length ? this.group(device, `${this.t("Other")} · ${other.length}`, other, "other") : nothing}
      ${device.disabledCount ? html`<p class="note"><a href="/config/entities">${this.t(device.disabledCount === 1 ? "{count} disabled entity" : "{count} disabled entities", { count: device.disabledCount })}</a> · ${this.t("Enable needed capabilities in Home Assistant.")}</p>` : nothing}`;
  }
  private topLine(device: Appliance) {
    return html`<div class="top">
      <h2 class="title">${this.config?.title ?? device.name}</h2>
      ${this.headerActions(device)}
    </div>`;
  }
  private compact(device: Appliance) {
    const status = this.status(device);
    return html`<button
      class="compact tone-${this.tone(device, status)}"
      @click=${() => this.openDetails(device)}
    >
      <span class="circ big">${icon(icons[this.kind(device)])}</span
      ><span class="text"
        ><strong>${this.config?.title ?? device.name}</strong
        ><span class="sub"
          >${this.statusLabel(device)}${status.busy ? ` · ${duration(status.remainingSeconds, this.ha)}` : ""}</span
        ></span
      >${icon("next", "chev")}
    </button>`;
  }
  private overview(devices: Appliance[]) {
    const busy = devices
      .map((device) => ({ device, status: this.status(device) }))
      .filter((v) => v.status.busy)
      .sort(
        (a, b) =>
          (a.status.estimatedFinish ?? Infinity) -
            (b.status.estimatedFinish ?? Infinity) ||
          a.device.name.localeCompare(b.device.name),
      );
    const alerts = devices.flatMap((device) =>
      this.status(device).attention.map((item) => ({ device, item })),
    );
    // One row per appliance: its issues joined, coloured by the most serious.
    const rank = { error: 0, warning: 1, unknown: 2 } as const;
    const grouped = devices
      .map((device) => ({ device, items: this.status(device).attention }))
      .filter((group) => group.items.length)
      .map((group) => ({
        ...group,
        severity: group.items.reduce<keyof typeof rank>(
          (worst, item) =>
            rank[item.severity] < rank[worst] ? item.severity : worst,
          "unknown",
        ),
      }));
    const unobserved = devices.filter((d) =>
      d.kind === "cooling"
        ? this.status(d).online !== "online"
        : ["offline", "unknown"].includes(this.status(d).operation),
    );
    const flagged = new Set(alerts.map((a) => a.device.id)).size;
    const count = (value: number) =>
      new Intl.NumberFormat(formattingLocale(this.ha)).format(value);
    return html`<div class="top">
        <h2 class="title">${this.config?.title ?? this.t("Kitchen")}</h2>
      </div>
      <div class="tiles summary">
        <div class="tile tone-active">
          <span class="value">${count(busy.length)}</span
          ><span class="label">${this.t("Running")}</span>
        </div>
        <div class="tile ${flagged ? "tone-attention flagged" : "tone-done"}">
          <span class="value">${count(flagged)}</span
          ><span class="label">${this.t("Needs attention")}</span>
        </div>
        <div class="tile tone-idle">
          <span class="value">${count(devices.length)}</span
          ><span class="label">${this.t("Appliances")}</span>
        </div>
      </div>
      <section class="group">
        <h3>${this.t("In progress")}</h3>
        ${
          busy.length
            ? busy.map(
                ({ device, status }) =>
                  html`<button
                    class="row tone-${this.tone(device, status)}"
                    data-busy=${device.id}
                    @click=${() => this.openDetails(device)}
                  >
                    <span class="circ">${icon(icons[this.kind(device)])}</span
                    ><span class="text"
                      ><strong>${device.name}</strong
                      ><span class="sub"
                        >${this.t(labels[status.operation])}${status.program ? ` · ${this.programLabel(device, status.program)}` : ""}</span
                      ></span
                    ><span class="end"
                      >${status.operation === "delayed" ? this.t("Starts in {time}", { time: duration(status.delaySeconds, this.ha) }) : duration(status.remainingSeconds, this.ha)}</span
                    >
                  </button>`,
              )
            : html`<p class="quiet">
                ${unobserved.length ? this.t("No running programmes reported. Some appliance states are unavailable.") : this.t("Nothing is running.")}
              </p>`
        }
      </section>
      <section class="group">
        <h3>${this.t("Needs attention")}</h3>
        ${
          alerts.length
            ? html`<ul class="attention">
                ${grouped.map(
                  ({ device, items, severity }) =>
                    html`<li class=${severity} data-attention=${device.id}>
                      <button
                        class="row"
                        @click=${() => this.openDetails(device)}
                      >
                        <span class="circ"
                          >${icon(severity === "unknown" ? "offline" : "warning")}</span
                        ><span class="text"
                          ><strong>${device.name}</strong
                          ><span class="sub"
                            >${items
                              .map((item) =>
                                this.attentionMessage(device, item),
                              )
                              .join(" · ")}</span
                          ></span
                        >${icon("next", "chev")}
                      </button>
                    </li>`,
                )}
              </ul>`
            : html`<p class="quiet">
                ${unobserved.length ? this.t("Some appliance states are unavailable.") : this.t("All clear.")}
              </p>`
        }${unobserved.filter((d) => !alerts.some((a) => a.device.id === d.id && a.item.severity === "unknown")).map((device) => html`<p class="note">${device.name}: ${this.statusLabel(device)}</p>`)}
      </section>
      <details class="panel">
        <summary>
          <span class="panel-title">${this.t("All appliances")}</span
          >${icon("chevron", "chevron")}
        </summary>
        <div class="rows">
          ${devices.map(
            (device) =>
              html`<button
                class="row tone-${this.tone(device)}"
                @click=${() => this.openDetails(device)}
              >
                <span class="circ">${icon(icons[this.kind(device)])}</span
                ><span class="text"
                  ><strong>${device.name}</strong
                  ><span class="sub">${this.statusLabel(device)}</span></span
                >${icon("next", "chev")}
              </button>`,
          )}
        </div>
      </details>
      ${devices.some((d) => d.disabledCount) ? html`<p class="note" data-disabled-count><a href="/config/entities">${this.t("{count} disabled entities", { count: devices.reduce((sum, d) => sum + d.disabledCount, 0) })}</a> ${this.t("Across these appliances.")}</p>` : nothing}`;
  }
  render() {
    if (!this.config) return nothing;
    const { devices, error } = this.selection();
    const individual = devices.length === 1 ? devices[0] : undefined;
    const detail = devices.find((d) => d.id === this.detailId);
    const configure =
      devices.find((d) => d.id === this.configureId) ??
      (!this.isOverview ? individual : undefined);
    return html`<ha-card
        >${
          this.registry.disconnected
            ? html`<div class="feedback" role="status">
                <span class="circ">${icon("offline")}</span
                ><span class="feedback-title"
                  >${this.t("Disconnected from Home Assistant.")}</span
                >
              </div>`
            : this.registry.error
              ? html`<div class="feedback failed" role="alert">
                    <span class="circ">${icon("warning")}</span
                    ><span class="feedback-title">${this.registry.error}</span>
                  </div>
                  <button class="pill" @click=${this.retry}>
                    ${this.t("Retry discovery")}
                  </button>`
              : !this.registry.snapshot
                ? html`<p class="quiet">
                    ${this.t("Finding your appliances…")}
                  </p>`
                : error
                  ? html`<div class="feedback failed" role="alert">
                      <span class="circ">${icon("warning")}</span
                      ><span class="feedback-title">${this.m(error)}</span>
                    </div>`
                  : this.isOverview
                    ? this.overview(devices)
                    : individual
                      ? this.config.expand
                        ? html`${this.topLine(individual)}${this.deviceBody(individual)}`
                        : this.compact(individual)
                      : html`<p class="empty">
                          ${this.t("No matching Home Connect Local appliance.")}
                        </p>`
        }${this.feedback()}</ha-card
      >
      <dialog id="details" @click=${this.closeOnBackdrop}>
        <div class="top">
          <h2 class="title">${detail?.name ?? this.t("Appliance")}</h2>
          ${detail ? this.headerActions(detail) : nothing}<button
            class="icon-btn"
            aria-label=${this.t("Close details")}
            @click=${() => this.shadowRoot?.querySelector<HTMLDialogElement>("#details")?.close()}
          >
            ${icon("close")}
          </button>
        </div>
        ${detail ? this.deviceBody(detail) : nothing}${this.feedback()}
      </dialog>
      <dialog id="configure" @click=${this.closeOnBackdrop}>
        <div class="top">
          <h2 class="title">
            ${this.t("Settings")}${configure ? html`<span class="subtitle">${configure.name}</span>` : nothing}
          </h2>
          <button
            class="icon-btn"
            data-close-configure
            aria-label=${this.t("Close settings")}
            @click=${() => this.shadowRoot?.querySelector<HTMLDialogElement>("#configure")?.close()}
          >
            ${icon("close")}
          </button>
        </div>
        ${configure ? this.configureBody(configure) : nothing}${this.feedback()}
      </dialog>
      <dialog id="confirmation" @cancel=${this.cancelConfirm}>
        <div class="confirm-head">
          <span class="circ big">${icon("warning")}</span>
          <h2>${this.t("Confirm appliance command")}</h2>
        </div>
        <p class="confirm-what">${this.confirmationLabel()}</p>
        <p class="note">
          ${this.t("This may start the appliance. Check that it is ready for remote operation.")}
        </p>
        ${this.pending?.reason ? html`<p class="note">${this.m(this.pending.reason)}</p>` : nothing}
        <div class="dialog-actions">
          <button class="pill" @click=${this.cancelConfirm}>
            ${this.t("Cancel")}</button
          ><button class="pill primary" data-confirm @click=${this.confirm}>
            ${this.t("Confirm")}
          </button>
        </div>
      </dialog>`;
  }
}
