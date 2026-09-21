import { html, svg, type SVGTemplateResult, type TemplateResult } from "lit";

/** Inline stroke icons shared by every card in this package. */
const paths = {
  oven: svg`<rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 8h18"></path><rect x="7" y="11" width="10" height="6" rx="1"></rect><path d="M7 5.5h.01M11 5.5h.01"></path>`,
  dishwasher: svg`<rect x="4" y="2" width="16" height="20" rx="2"></rect><path d="M4 7h16"></path><circle cx="12" cy="14" r="4"></circle><path d="M8 4.5h.01M11 4.5h.01"></path>`,
  coffee: svg`<path d="M17 8h1a4 4 0 1 1 0 8h-1"></path><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"></path><path d="M6 2v2M10 2v2M14 2v2"></path>`,
  cooling: svg`<rect x="5" y="2" width="14" height="20" rx="2"></rect><path d="M5 10h14M9 5v2M9 13v3"></path>`,
  washer: svg`<rect x="3" y="2" width="18" height="20" rx="2"></rect><path d="M3 6h18"></path><circle cx="12" cy="14" r="5"></circle><path d="M7 4h.01"></path>`,
  dryer: svg`<rect x="3" y="2" width="18" height="20" rx="2"></rect><path d="M3 6h18"></path><circle cx="12" cy="14" r="5"></circle><path d="M10 12.5c1 .5 1 2.5 2 3M14 12.5c-1 .5-1 2.5-2 3"></path>`,
  unknown: svg`<path d="M3 10.5 12 3l9 7.5"></path><path d="M5 9.5V21h14V9.5"></path>`,
  kitchen: svg`<path d="M7 2v8a2 2 0 0 0 4 0V2M9 10v12"></path><path d="M17 2c-1.7 1.5-2.5 3.5-2.5 6s1 3.5 2.5 3.5V22"></path>`,
  cog: svg`<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>`,
  power: svg`<path d="M12 2v10"></path><path d="M18.4 6.6a9 9 0 1 1-12.8 0"></path>`,
  start: svg`<path d="M7 4v16l13-8Z"></path>`,
  pause: svg`<path d="M8 5v14M16 5v14"></path>`,
  resume: svg`<path d="M7 4v16l13-8Z"></path>`,
  abort: svg`<rect x="6" y="6" width="12" height="12" rx="1.5"></rect>`,
  close: svg`<path d="M18 6 6 18M6 6l12 12"></path>`,
  chevron: svg`<path d="m6 9 6 6 6-6"></path>`,
  next: svg`<path d="m9 6 6 6-6 6"></path>`,
  minus: svg`<path d="M5 12h14"></path>`,
  plus: svg`<path d="M12 5v14M5 12h14"></path>`,
  warning: svg`<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"></path><path d="M12 9v4M12 17h.01"></path>`,
  check: svg`<path d="M20 6 9 17l-5-5"></path>`,
  spinner: svg`<path d="M21 12a9 9 0 1 1-6.2-8.56"></path>`,
  offline: svg`<path d="M2 8.8a15 15 0 0 1 4.2-2.6M22 8.8A15 15 0 0 0 10.4 5M5 12.9a10 10 0 0 1 3.4-2M19 12.9a10 10 0 0 0-2.7-1.8M8.5 16.4a5 5 0 0 1 7 0M12 20h.01M2 2l20 20"></path>`,
  clock: svg`<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>`,
} satisfies Record<string, SVGTemplateResult>;

export type IconName = keyof typeof paths;

// No whitespace inside <svg>: it would leak into a button's textContent.
export function icon(name: IconName, extra = ""): TemplateResult {
  // prettier-ignore
  return html`<svg class="i ${extra}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
}
