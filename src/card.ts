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
const icons: Record<ApplianceKind, string> = {
  oven: "mdi:stove",
  dishwasher: "mdi:dishwasher",
  coffee: "mdi:coffee-maker",
  cooling: "mdi:fridge-outline",
  washer: "mdi:washing-machine",
  dryer: "mdi:tumble-dryer",
  unknown: "mdi:home-outline",
};
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
    this.error = "";
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
    const act = (value?: string | number | boolean) =>
      void this.requestAction(device, { entityId: entity.entityId, value });
    if (domain === "select" && Array.isArray(state?.attributes.options))
      return html`<label class="control"
        ><span>${this.entityName(entity)}</span
        ><select
          data-entity=${entity.entityId}
          aria-label=${this.entityName(entity)}
          .value=${state.state}
          ?disabled=${disabled}
          title=${reason ?? ""}
          @change=${(e: Event) => {
            act((e.target as HTMLSelectElement).value);
            (e.target as HTMLSelectElement).value = state.state;
          }}
        >
          ${!state.attributes.options.includes(state.state) ? html`<option value=${state.state}>${this.reading(entity)}</option>` : nothing}${state.attributes.options.map((option: string) => html`<option value=${option} ?selected=${option === state.state}>${stateLabel(this.ha, state, option, ["selected_program", "active_program"].includes(entity.role))}</option>`)}</select
        >${!policy.allowed && reason ? html`<small class="muted">${reason}</small>` : nothing}</label
      >`;
    if (domain === "number")
      return html`<label class="control"
        ><span
          >${this.entityName(entity)}${state?.attributes.unit_of_measurement ? ` · ${state.attributes.unit_of_measurement}` : ""}</span
        ><input
          data-entity=${entity.entityId}
          aria-label=${this.entityName(entity)}
          type="number"
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
        />${!policy.allowed && reason ? html`<small class="muted">${reason}</small>` : nothing}</label
      >`;
    if (domain === "switch")
      return html`<label class="control switch"
        ><span>${this.entityName(entity)}</span
        ><input
          data-entity=${entity.entityId}
          aria-label=${this.entityName(entity)}
          type="checkbox"
          .checked=${state?.state === "on"}
          ?disabled=${disabled}
          title=${reason ?? ""}
          @change=${(e: Event) => {
            act((e.target as HTMLInputElement).checked);
            (e.target as HTMLInputElement).checked = state?.state === "on";
          }}
        />${!policy.allowed && reason ? html`<small class="muted">${reason}</small>` : nothing}</label
      >`;
    if (domain === "button")
      return html`<button
        data-entity=${entity.entityId}
        ?disabled=${disabled}
        title=${reason ?? ""}
        @click=${() => act()}
      >
        ${this.entityName(entity)}
      </button>`;
    return html`<div class="reading" data-reading=${entity.entityId}>
      <span>${this.entityName(entity)}</span
      ><strong>${this.reading(entity)}</strong>
    </div>`;
  }
  private group(
    device: Appliance,
    title: string,
    entities: ApplianceEntity[],
    section?: string,
  ) {
    return entities.length
      ? html`<section data-section=${section ?? ""}>
          <h3>${title}</h3>
          <div class="controls">
            ${entities.map((entity) => this.control(device, entity))}
          </div>
        </section>`
      : nothing;
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
    return html`<div class="transport">
        ${entities.map((entity) => {
          const policy = actionPolicy(device, this.ha!.states, {
            entityId: entity.entityId,
          });
          return html`<button
            data-role=${entity.role}
            class=${entity.role === "abort" ? "danger" : entity.role === "start" ? "primary" : ""}
            ?disabled=${this.busy || !policy.allowed}
            title=${this.m(policy.reason ?? "")}
            @click=${() => this.requestAction(device, { entityId: entity.entityId })}
          >
            ${this.t(({ start: "Start", pause: "Pause", resume: "Resume", abort: "Stop" } as Partial<Record<Role, TranslationKey>>)[entity.role] ?? "Action")}
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
      ? html`<section>
          <h3>${this.t("Needs attention")}</h3>
          <ul class="attention">
            ${status.attention.map((item) => html`<li class=${item.severity}>${this.attentionMessage(device, item)}</li>`)}
          </ul>
        </section>`
      : nothing;
  }
  private feedback() {
    return html`${this.error ? html`<p class="feedback" role="alert">${this.m(this.error)}</p>` : nothing}${this.notice ? html`<p class="note" role="status">${this.m(this.notice)}</p>` : nothing}`;
  }
  private deviceBody(device: Appliance) {
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
    const picker = ["ready", "off", "finished"].includes(status.operation);
    return html`
      ${status.operation === "error" || status.operation === "action_required" ? html`<p class="feedback" role="alert">${this.t(labels[status.operation])}</p>` : nothing}
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
                : html`<section class="surface">
                    <div class="progress-head">
                      <div>
                        <strong
                          >${status.operation === "delayed" ? duration(status.delaySeconds, this.ha) : duration(status.remainingSeconds, this.ha)}</strong
                        ><br /><span
                          >${status.operation === "delayed" ? this.t("Until start") : status.operation === "paused" ? this.t("Paused · remaining") : this.t("Remaining")}</span
                        >
                      </div>
                      <span
                        >${status.program ? this.programLabel(device, status.program) : this.t(labels[status.operation])}</span
                      >
                    </div>
                    ${status.progress !== undefined ? html`<progress max="100" value=${status.progress} aria-label=${this.t("Programme progress")}></progress>` : nothing}${status.phase ? html`<div class="phase">${this.phaseLabel(device, status.phase)}</div>` : nothing}
                  </section>`
            }${status.operation === "finished" && status.finishedAt ? html`<p class="note">${this.t("Finished {time} ago", { time: duration((Date.now() - Date.parse(status.finishedAt)) / 1000, this.ha) })}</p>` : nothing}${this.transport(device, status)}`
          : nothing
      }
      ${
        kind === "oven"
          ? html`${this.group(device, this.t("Oven"), roles("target_temperature", "current_temperature", "duration"), "oven")}${(
              ["microwave", "steam"] as const
            ).map((which) =>
              moduleEntries(which).length
                ? html`<section data-module=${which}>
                    <h3>
                      ${which === "microwave" ? this.t("Microwave") : this.t("Steam")}
                    </h3>
                    <div class="controls">
                      ${moduleEntries(which).map((e) => this.control(device, e))}
                    </div>
                  </section>`
                : nothing,
            )}`
          : nothing
      }
      ${kind === "cooling" ? html`${this.group(device, this.t("Temperature zones"), roles("cooling_setpoint", "target_temperature", "current_temperature"), "cooling")}${this.group(device, this.t("Doors"), roles("door"))}${this.group(device, this.t("Cooling modes"), roles("super_mode", "vacation"), "cooling-modes")}` : nothing}
      ${kind === "coffee" ? this.group(device, this.t("Your coffee"), options, "coffee") : kind === "dishwasher" ? this.group(device, this.t("Wash options"), options, "dishwasher") : kind !== "oven" && kind !== "cooling" ? this.group(device, this.t("Programme options"), options) : nothing}
      ${kind !== "cooling" ? this.group(device, this.t("Door & temperature"), roles("door", ...(kind !== "oven" ? ["current_temperature" as Role] : []))) : nothing}
      ${status.busy ? this.group(device, this.t("Programme timing"), roles("elapsed")) : nothing}
      ${this.attention(device, status)}
      ${
        roles("attention").filter((e) => !moduleCandidates.has(e.entityId))
          .length
          ? html`<details>
              <summary>${this.t("Consumables & care")}</summary>
              ${roles("attention")
                .filter((e) => !moduleCandidates.has(e.entityId))
                .map((e) => this.control(device, e))}
            </details>`
          : nothing
      }
      <details>
        <summary>${this.t("Settings")}</summary>
        <div class="controls">
          ${roles("power", "child_lock", "remote_control", "start_delay").map((e) => this.control(device, e))}${kind === "oven" || kind === "cooling" ? options.map((e) => this.control(device, e)) : nothing}${kind !== "oven" && kind !== "cooling" ? roles("target_temperature", "duration").map((e) => this.control(device, e)) : nothing}
        </div>
        ${!roles("remote_start").length ? html`<p class="permission">${this.t("Remote-start permission is not exposed. The appliance must permit remote operation.")}</p>` : roles("remote_start").map((e) => html`<div class="reading"><span>${this.t("Remote start")}</span><strong>${this.reading(e)}</strong></div>`)}
      </details>
      ${
        roles("other").filter((e) => !moduleCandidates.has(e.entityId)).length
          ? html`<details>
              <summary>
                ${this.t("Other")} ·
                ${roles("other").filter((e) => !moduleCandidates.has(e.entityId)).length}
              </summary>
              <div class="controls">
                ${roles("other")
                  .filter((e) => !moduleCandidates.has(e.entityId))
                  .map((e) => this.control(device, e))}
              </div>
            </details>`
          : nothing
      }
      ${device.disabledCount ? html`<p class="note"><a href="/config/entities">${this.t(device.disabledCount === 1 ? "{count} disabled entity" : "{count} disabled entities", { count: device.disabledCount })}</a> · ${this.t("Enable needed capabilities in Home Assistant.")}</p>` : nothing}
      ${status.online !== "online" && status.lastReported ? html`<p class="note">${this.t("Last reported: {time}", { time: new Date(status.lastReported).toLocaleString(formattingLocale(this.ha)) })}</p>` : nothing}
    `;
  }
  private heading(device: Appliance) {
    const kind = this.kind(device);
    return html`<header>
      <div class="icon"><ha-icon icon=${icons[kind]}></ha-icon></div>
      <div class="heading">
        <div class="eyebrow">${this.t(kindNames[kind])}</div>
        <h2>
          ${!this.isOverview ? (this.config?.title ?? device.name) : device.name}
        </h2>
        <div class="status">${this.statusLabel(device)}</div>
      </div>
      ${device.entities
        .filter((e) => e.role === "power")
        .slice(0, 1)
        .map((e) => html`<span class="badge">${this.reading(e)}</span>`)}
    </header>`;
  }
  private compact(device: Appliance) {
    const status = this.status(device);
    return html`<button
      class="compact"
      @click=${() => this.openDetails(device)}
    >
      <span class="icon"
        ><ha-icon icon=${icons[this.kind(device)]}></ha-icon></span
      ><span class="heading"
        ><strong>${this.config?.title ?? device.name}</strong
        ><span class="status"
          >${this.statusLabel(device)}${status.busy ? ` · ${duration(status.remainingSeconds, this.ha)}` : ""}</span
        ></span
      ><span aria-hidden="true">›</span>
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
    const unobserved = devices.filter((d) =>
      d.kind === "cooling"
        ? this.status(d).online !== "online"
        : ["offline", "unknown"].includes(this.status(d).operation),
    );
    return html`<header>
        <div class="icon">
          <ha-icon icon="mdi:silverware-fork-knife"></ha-icon>
        </div>
        <div class="heading">
          <div class="eyebrow">Home Connect Local</div>
          <h2>${this.config?.title ?? this.t("Kitchen")}</h2>
        </div>
        <span class="badge"
          >${this.t("{count} appliances", { count: devices.length })}</span
        >
      </header>
      <section>
        <h3>${this.t("In progress")}</h3>
        ${
          busy.length
            ? busy.map(
                ({ device, status }) =>
                  html`<button
                    class="row"
                    data-busy=${device.id}
                    @click=${() => this.openDetails(device)}
                  >
                    <span class="icon"
                      ><ha-icon icon=${icons[device.kind]}></ha-icon></span
                    ><span class="heading"
                      ><strong>${device.name}</strong
                      ><small
                        >${this.t(labels[status.operation])}${status.program ? ` · ${this.programLabel(device, status.program)}` : ""}</small
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
      <section>
        <h3>${this.t("Needs attention")}</h3>
        ${
          alerts.length
            ? html`<ul class="attention">
                ${alerts.map(
                  ({ device, item }) =>
                    html`<li class=${item.severity}>
                      <button
                        class="row"
                        @click=${() => this.openDetails(device)}
                      >
                        <span
                          ><strong>${device.name}</strong
                          ><small
                            >${this.attentionMessage(device, item)}</small
                          ></span
                        >
                      </button>
                    </li>`,
                )}
              </ul>`
            : html`<p class="quiet">
                ${unobserved.length ? this.t("Some appliance states are unavailable.") : this.t("All clear.")}
              </p>`
        }${unobserved.filter((d) => !alerts.some((a) => a.device.id === d.id && a.item.severity === "unknown")).map((device) => html`<p class="note">${device.name}: ${this.statusLabel(device)}</p>`)}
      </section>
      <details>
        <summary>${this.t("All appliances")}</summary>
        ${devices.map(
          (device) =>
            html`<button class="row" @click=${() => this.openDetails(device)}>
              <span class="heading"
                ><strong>${device.name}</strong
                ><small>${this.statusLabel(device)}</small></span
              ><span>›</span>
            </button>`,
        )}
      </details>
      ${devices.some((d) => d.disabledCount) ? html`<p class="note" data-disabled-count><a href="/config/entities">${this.t("{count} disabled entities", { count: devices.reduce((sum, d) => sum + d.disabledCount, 0) })}</a> ${this.t("Across these appliances.")}</p>` : nothing}`;
  }
  render() {
    if (!this.config) return nothing;
    const { devices, error } = this.selection();
    const individual = devices.length === 1 ? devices[0] : undefined;
    const detail = devices.find((d) => d.id === this.detailId);
    return html`<ha-card
        >${
          this.registry.disconnected
            ? html`<p role="status">
                ${this.t("Disconnected from Home Assistant.")}
              </p>`
            : this.registry.error
              ? html`<p class="feedback" role="alert">${this.registry.error}</p>
                  <button @click=${this.retry}>
                    ${this.t("Retry discovery")}
                  </button>`
              : !this.registry.snapshot
                ? html`<p class="quiet">
                    ${this.t("Finding your appliances…")}
                  </p>`
                : error
                  ? html`<p class="feedback" role="alert">${this.m(error)}</p>`
                  : this.isOverview
                    ? this.overview(devices)
                    : individual
                      ? this.config.expand
                        ? html`${this.heading(individual)}${this.deviceBody(individual)}`
                        : this.compact(individual)
                      : html`<p class="empty">
                          ${this.t("No matching Home Connect Local appliance.")}
                        </p>`
        }${this.feedback()}</ha-card
      >
      <dialog
        id="details"
        @click=${(e: MouseEvent) => {
          if (e.target === e.currentTarget) {
            const r = (
              e.currentTarget as HTMLDialogElement
            ).getBoundingClientRect();
            if (
              e.clientX < r.left ||
              e.clientX > r.right ||
              e.clientY < r.top ||
              e.clientY > r.bottom
            )
              (e.currentTarget as HTMLDialogElement).close();
          }
        }}
      >
        <div class="dialog-head">
          <h2>${detail?.name ?? this.t("Appliance")}</h2>
          <button
            class="icon-button"
            aria-label=${this.t("Close details")}
            @click=${() => this.shadowRoot?.querySelector<HTMLDialogElement>("#details")?.close()}
          >
            ✕
          </button>
        </div>
        ${detail ? this.deviceBody(detail) : nothing}${this.feedback()}
      </dialog>
      <dialog id="confirmation" @cancel=${this.cancelConfirm}>
        <h2>${this.t("Confirm appliance command")}</h2>
        <p>${this.confirmationLabel()}</p>
        <p class="note">
          ${this.t("This may start the appliance. Check that it is ready for remote operation.")}
        </p>
        ${this.pending?.reason ? html`<p class="note">${this.m(this.pending.reason)}</p>` : nothing}
        <div class="dialog-actions">
          <button @click=${this.cancelConfirm}>${this.t("Cancel")}</button
          ><button class="primary" data-confirm @click=${this.confirm}>
            ${this.t("Confirm")}
          </button>
        </div>
      </dialog>`;
  }
}
