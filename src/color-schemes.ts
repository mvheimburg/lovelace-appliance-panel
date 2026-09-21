import { css, html } from "lit";
import { live } from "lit/directives/live.js";

export const colorSchemes = [
  "home-assistant",
  "bright",
  "warm",
  "mint",
  "sky",
  "lavender",
] as const;
export type ColorScheme = (typeof colorSchemes)[number];
type LanguageContext = { language?: string; locale?: { language?: string } };
const en = {
  label: "Color scheme",
  "home-assistant": "Home Assistant",
  bright: "Bright",
  warm: "Warm",
  mint: "Mint",
  sky: "Sky",
  lavender: "Lavender",
  invalid:
    "Choose a valid color_scheme: home-assistant, bright, warm, mint, sky or lavender.",
};
const nb: Record<keyof typeof en, string> = {
  label: "Fargevalg",
  "home-assistant": "Home Assistant",
  bright: "Lys",
  warm: "Varm",
  mint: "Mint",
  sky: "Himmelblå",
  lavender: "Lavendel",
  invalid:
    "Velg en gyldig color_scheme: home-assistant, bright, warm, mint, sky eller lavender.",
};
export function colorSchemeText(hass?: LanguageContext) {
  const language = (hass?.language || hass?.locale?.language || "en")
    .toLowerCase()
    .replace(/_/g, "-")
    .split("-")[0];
  return ["nb", "no", "nn"].includes(language) ? nb : en;
}
export function applyColorScheme(
  host: HTMLElement,
  value: unknown,
  hass?: LanguageContext,
): void {
  const scheme = value === undefined ? "home-assistant" : value;
  if (
    typeof scheme !== "string" ||
    !colorSchemes.includes(scheme as ColorScheme)
  ) {
    throw new Error(colorSchemeText(hass).invalid);
  }
  if (scheme === "home-assistant") host.removeAttribute("data-color-scheme");
  else host.setAttribute("data-color-scheme", scheme);
}
export function colorSchemeSchema(hass?: LanguageContext) {
  const text = colorSchemeText(hass);
  return {
    name: "color_scheme",
    selector: {
      select: {
        mode: "dropdown",
        options: colorSchemes.map((value) => ({ value, label: text[value] })),
      },
    },
  };
}
export function colorSchemeSelector(
  hass: LanguageContext | undefined,
  value: unknown,
  change: (scheme: ColorScheme) => void,
) {
  const text = colorSchemeText(hass);
  return html`<label
    style="display:flex;flex-direction:column;align-items:stretch;gap:6px;margin:12px 0;"
  >
    ${text.label}
    <select
      name="color_scheme"
      style="font:inherit;min-height:44px;width:100%;padding:8px 10px;border-radius:8px;border:1px solid var(--divider-color, #ccc);background:var(--card-background-color, #fff);color:var(--primary-text-color, #202b36);"
      .value=${live(String(value ?? "home-assistant"))}
      @change=${(event: Event) => {
        event.stopPropagation();
        change((event.target as HTMLSelectElement).value as ColorScheme);
      }}
    >
      ${colorSchemes.map((scheme) => html`<option value=${scheme} ?selected=${scheme === (value ?? "home-assistant")}>${text[scheme]}</option>`)}
    </select>
  </label>`;
}

/** Local overrides only: removing the attribute restores the dashboard theme. */
export const colorSchemeStyles = css`
  :host([data-color-scheme]) {
    color-scheme: light;
    --primary-text-color: #202b36;
    --secondary-text-color: #52606d;
    --disabled-text-color: #626d78;
    --text-primary-color: #fff;
    --success-color: #28723c;
    --warning-color: #8c6100;
    --error-color: #bd2635;
    --orange-color: #ab4b13;
    --info-color: #146a91;
    --primary-color: var(--scheme-accent);
    --accent-color: var(--scheme-accent);
    --card-background-color: var(--scheme-surface);
    --ha-card-background: var(--scheme-surface);
    --primary-background-color: var(--scheme-surface);
    --secondary-background-color: var(--scheme-secondary);
    --divider-color: var(--scheme-border);
    --ha-card-border-color: var(--scheme-border);
    --bubble-main-background-color: var(--scheme-surface);
    --bubble-secondary-background-color: var(--scheme-secondary);
    --bubble-icon-background-color: var(--scheme-secondary);
    --bubble-sub-button-background-color: var(--scheme-secondary);
    --bubble-accent-color: var(--scheme-accent);
    --bubble-border: 1px solid var(--scheme-border);
    --ha-card-box-shadow: 0 2px 8px rgb(32 43 54 / 0.06);
    --bubble-box-shadow: var(--ha-card-box-shadow);
    --input-fill-color: var(--scheme-secondary);
    --input-ink-color: var(--primary-text-color);
    --input-label-ink-color: var(--secondary-text-color);
    --mdc-theme-primary: var(--scheme-accent);
    --mdc-theme-surface: var(--scheme-surface);
    --mdc-theme-on-surface: var(--primary-text-color);
    --mdc-text-field-fill-color: var(--scheme-secondary);
    --mdc-text-field-ink-color: var(--primary-text-color);
  }
  :host([data-color-scheme="bright"]) {
    --scheme-surface: #ffffff;
    --scheme-secondary: #edf3fa;
    --scheme-accent: #2365a5;
    --scheme-border: #ccd9e7;
  }
  :host([data-color-scheme="warm"]) {
    --scheme-surface: #fffaf1;
    --scheme-secondary: #f4ead9;
    --scheme-accent: #885321;
    --scheme-border: #ddd0ba;
  }
  :host([data-color-scheme="mint"]) {
    --scheme-surface: #f2fbf5;
    --scheme-secondary: #dfefe5;
    --scheme-accent: #286c50;
    --scheme-border: #c1d9ca;
  }
  :host([data-color-scheme="sky"]) {
    --scheme-surface: #f1f8ff;
    --scheme-secondary: #dfeefa;
    --scheme-accent: #22638e;
    --scheme-border: #c2d8e9;
  }
  :host([data-color-scheme="lavender"]) {
    --scheme-surface: #faf5ff;
    --scheme-secondary: #ede3f6;
    --scheme-accent: #725095;
    --scheme-border: #d7c8e5;
  }
`;
