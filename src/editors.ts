import { LitElement, css, html, nothing } from "lit";
import { CARD_KINDS } from "./config";
import { discoverAppliances } from "./model";
import { refreshRegistries, watchRegistries } from "./registry";
import type { HomeAssistant, RegistryWatchValue } from "./types";

/** Editors keep the original YAML fields intact and change only the chosen field. */
class ApplianceEditor extends LitElement {
  private raw: Record<string, unknown> = {};
  private currentHass?: HomeAssistant;
  private registry: RegistryWatchValue = {};
  private stop?: () => void;

  static styles = css`
    :host {
      display: block;
      color: var(--primary-text-color, #20252b);
      font-family: var(--paper-font-body1_-_font-family, sans-serif);
    }
    form {
      display: grid;
      gap: 16px;
      min-width: 0;
    }
    label {
      display: grid;
      gap: 6px;
      min-width: 0;
    }
    input,
    select,
    button {
      font: inherit;
      color: inherit;
      background: var(--card-background-color, #fff);
      border: 1px solid var(--divider-color, #bbb);
      border-radius: 8px;
      padding: 10px;
      min-width: 0;
      width: 100%;
      box-sizing: border-box;
    }
    input[type="checkbox"] {
      width: 20px;
      height: 20px;
      margin: 0;
    }
    .check {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    p {
      margin: 0;
      line-height: 1.5;
      overflow-wrap: anywhere;
    }
    .hint {
      color: var(--secondary-text-color, #606873);
      font-size: 0.9em;
    }
    fieldset {
      display: grid;
      gap: 12px;
      min-width: 0;
      border: 1px solid var(--divider-color, #bbb);
      border-radius: 8px;
    }
    select[multiple] {
      min-height: 130px;
    }
    :focus-visible {
      outline: 2px solid var(--primary-color, #2879b9);
      outline-offset: 2px;
    }
  `;

  setConfig(raw: Record<string, unknown>): void {
    this.raw = { ...raw };
    this.requestUpdate();
  }
  set hass(value: HomeAssistant) {
    const changed = this.currentHass?.connection !== value.connection;
    this.currentHass = value;
    if (changed) {
      this.stop?.();
      this.stop = undefined;
      this.registry = {};
    }
    this.watch();
    this.requestUpdate();
  }
  get hass(): HomeAssistant | undefined {
    return this.currentHass;
  }
  connectedCallback(): void {
    super.connectedCallback();
    this.watch();
  }
  disconnectedCallback(): void {
    this.stop?.();
    this.stop = undefined;
    super.disconnectedCallback();
  }
  private watch(): void {
    if (this.isConnected && this.currentHass && !this.stop)
      this.stop = watchRegistries(this.currentHass, (value) => {
        this.registry = value;
        this.requestUpdate();
      });
  }
  private updateConfig(
    patch: Record<string, unknown>,
    remove: string[] = [],
  ): void {
    this.raw = { ...this.raw, ...patch };
    for (const field of remove) delete this.raw[field];
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: { ...this.raw } },
        bubbles: true,
        composed: true,
      }),
    );
    this.requestUpdate();
  }
  private change = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    this.updateConfig({
      [input.name]: input.type === "checkbox" ? input.checked : input.value,
    });
  };
  private checkbox(name: string, label: string, checked: boolean) {
    return html`<label class="check"
      ><input
        type="checkbox"
        name=${name}
        .checked=${checked}
        @change=${this.change}
      />${label}</label
    >`;
  }
  protected render() {
    const overview =
      String(this.raw.type).replace(/^custom:/, "") === "kitchen-panel-card";
    const oven = String(this.raw.type).replace(/^custom:/, "") === "oven-card";
    const snapshot = this.registry.snapshot;
    const appliances = snapshot
      ? discoverAppliances(snapshot, this.currentHass?.states ?? {})
      : [];
    const device = typeof this.raw.device === "string" ? this.raw.device : "";
    const area = typeof this.raw.area === "string" ? this.raw.area : "";
    const selected = Array.isArray(this.raw.devices)
      ? (this.raw.devices as string[])
      : [];
    const explicit = Array.isArray(this.raw.devices);
    const modules = Array.isArray(this.raw.oven_modules)
      ? (this.raw.oven_modules as string[])
      : [];
    const choices = appliances.map((item) => ({
      value: item.id,
      label: item.name,
    }));
    const areas = (snapshot?.areas ?? []).map((item) => ({
      value: item.area_id,
      label: item.name,
    }));
    const isMissing =
      device &&
      snapshot &&
      !appliances.some(
        (item) =>
          item.id === device ||
          item.name.toLowerCase() === device.toLowerCase(),
      );
    const option = (value: string, label: string, current: string) =>
      html`<option value=${value} ?selected=${current === value}>
        ${label}
      </option>`;
    const retained = (
      value: string,
      options: { value: string; label: string }[],
    ) =>
      value && !options.some((item) => item.value === value)
        ? option(value, `${value} (configured name or missing ID)`, value)
        : nothing;
    return html`<form @submit=${(event: Event) => event.preventDefault()}>
      <p class="hint">
        Devices are discovered from Home Connect Local. Configured names stay
        unchanged until you select another device.
      </p>
      ${
        this.registry.error
          ? html`<p role="alert">${this.registry.error}</p>
              <button
                type="button"
                @click=${() => this.currentHass && refreshRegistries(this.currentHass)}
              >
                Retry discovery
              </button>`
          : nothing
      }
      ${this.registry.disconnected ? html`<p role="status">Home Assistant is disconnected. Reconnect to refresh devices.</p>` : nothing}
      ${!snapshot && !this.registry.error ? html`<p role="status">${this.currentHass ? "Loading appliance registries…" : "Connect to Home Assistant to discover devices."}</p>` : nothing}
      ${snapshot && !appliances.length ? html`<p role="status">No Home Connect Local appliances found. Check the integration and enabled entities.</p>` : nothing}
      ${
        overview
          ? html`
              <label
                >Appliance selection<select
                  name="selection_mode"
                  @change=${(event: Event) => ((event.target as HTMLSelectElement).value === "devices" ? this.updateConfig({ devices: [] }, ["area", "device"]) : this.updateConfig({}, ["devices"]))}
                >
                  ${option("area", "All devices or area", explicit ? "devices" : "area")}${option("devices", "Choose devices", explicit ? "devices" : "area")}
                </select></label
              >
              ${
                explicit
                  ? html`<label
                        >Devices<select
                          name="devices"
                          multiple
                          @change=${(event: Event) => this.updateConfig({ devices: Array.from((event.target as HTMLSelectElement).selectedOptions, (entry) => entry.value) })}
                        >
                          ${selected.filter((value) => !choices.some((item) => item.value === value)).map((value) => html`<option value=${value} selected>${value} (configured name or missing ID)</option>`)}
                          ${choices.map((item) => html`<option value=${item.value} ?selected=${selected.includes(item.value)}>${item.label}</option>`)}
                        </select></label
                      >
                      <p class="hint">
                        An empty selection displays no appliances. Use
                        Ctrl/Command or Shift to select multiple devices.
                      </p>`
                  : html` <label
                      >Area<select
                        name="area"
                        @change=${(event: Event) => {
                          const value = (event.target as HTMLSelectElement)
                            .value;
                          this.updateConfig(
                            value ? { area: value } : {},
                            value ? [] : ["area"],
                          );
                        }}
                      >
                        ${option("", "All areas", area)}${retained(area, areas)}${areas.map((item) => option(item.value, item.label, area))}
                      </select></label
                    >`
              }
            `
          : html`<label
                >Device<select name="device" @change=${this.change}>
                  ${option("", "Select a Local appliance", device)}${retained(device, choices)}${choices.map((item) => option(item.value, item.label, device))}
                </select></label
              >${isMissing ? html`<p role="status">Configured device not found. Choose a Home Connect Local appliance or check its name and integration.</p>` : nothing}
              ${!device ? html`<p class="hint">A device is required before this card can display an appliance.</p>` : nothing}`
      }
      <label
        >Title<input
          name="title"
          .value=${typeof this.raw.title === "string" ? this.raw.title : ""}
          @change=${this.change}
      /></label>
      <label
        >Appearance<select name="appearance" @change=${this.change}>
          ${option("default", "Default", String(this.raw.appearance ?? "default"))}${option("bubble", "Bubble", String(this.raw.appearance ?? "default"))}
        </select></label
      >
      ${this.checkbox("expand", "Expand appliance details", this.raw.expand !== false)}
      ${this.checkbox("confirm_start", "Confirm programme selection and start", this.raw.confirm_start !== false)}
      ${
        oven
          ? html`<fieldset>
              <legend>Oven modules</legend>
              <label
                >Module detection<select
                  name="module_mode"
                  @change=${(event: Event) => this.updateConfig({ oven_modules: (event.target as HTMLSelectElement).value === "auto" ? "auto" : [] })}
                >
                  ${option("auto", "Detect automatically", Array.isArray(this.raw.oven_modules) ? "manual" : "auto")}${option("manual", "Choose modules", Array.isArray(this.raw.oven_modules) ? "manual" : "auto")}
                </select></label
              >${Array.isArray(this.raw.oven_modules) ? ["microwave", "steam"].map((module) => html`<label class="check"><input type="checkbox" name=${module} .checked=${modules.includes(module)} @change=${(event: Event) => this.updateConfig({ oven_modules: (event.target as HTMLInputElement).checked ? [...new Set([...modules, module])] : modules.filter((value) => value !== module) })} />${module === "steam" ? "Steam" : "Microwave"}</label>`) : nothing}
              <p class="hint">
                Both modules can be enabled together. No modules selected means
                a standard oven. Controls appear only when exposed by your
                appliance.
              </p>
            </fieldset>`
          : nothing
      }
    </form>`;
  }
}
for (const type of [...Object.keys(CARD_KINDS), "kitchen-panel-card"]) {
  if (!customElements.get(`${type}-editor`))
    customElements.define(`${type}-editor`, class extends ApplianceEditor {});
}
