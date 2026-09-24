import { colorSchemeStyles } from "./color-schemes";
import { css } from "lit";
/**
 * One style module for every card in this package, in the same visual family
 * as our other cards: muted title line, a hero with a tinted status circle,
 * reading tiles, pill controls and chips. Colours come from HA theme variables.
 */
export const styles = css`
  :host {
    display: block;
    color: var(--primary-text-color, #1b1b1a);
    font-family: var(--paper-font-body1_-_font-family, system-ui, sans-serif);
    --ap-text: var(--primary-text-color, #1b1b1a);
    --ap-muted: var(--secondary-text-color, #5b5a55);
    --ap-accent: var(--primary-color, #03a9f4);
    --ap-ok: var(--success-color, #2e7d32);
    --ap-warn: var(--warning-color, #f59e0b);
    --ap-offline: var(--orange-color, #ea580c);
    --ap-error: var(--error-color, #c62828);
    --ap-neutral: var(--disabled-text-color, #8a8984);
    --ap-surface: var(--ha-card-background, var(--card-background-color, #fff));
    --ap-pill: var(--secondary-background-color, #f3f2ee);
    --ap-radius: 20px;
    --ap-tile: 16px;
    --ap-circle: 50%;
  }
  :host([appearance="bubble"]) {
    --ap-surface: var(
      --bubble-main-background-color,
      var(--ha-card-background, var(--card-background-color, #fff))
    );
    --ap-pill: var(
      --bubble-secondary-background-color,
      var(--secondary-background-color, #f3f2ee)
    );
    --ap-accent: var(--bubble-accent-color, var(--primary-color, #03a9f4));
    --ap-radius: var(--bubble-border-radius, 32px);
    --ap-tile: var(--bubble-sub-button-border-radius, 22px);
    --ap-circle: var(--bubble-icon-border-radius, 50%);
  }
  * {
    box-sizing: border-box;
  }
  ha-card {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: var(--ap-surface);
    border-radius: var(--ha-card-border-radius, 16px);
    overflow: hidden;
    --sev: var(--ap-neutral);
  }
  :host([appearance="bubble"]) ha-card {
    border: var(--bubble-border, none);
    border-radius: var(--bubble-border-radius, 32px);
    box-shadow: var(--bubble-box-shadow, var(--ha-card-box-shadow));
  }
  /* Status tones -> --sev, used by circles, status lines and tiles. */
  .tone-active {
    --sev: var(--ap-ok);
  }
  .tone-ready {
    --sev: var(--ap-accent);
  }
  .tone-done {
    --sev: var(--ap-ok);
  }
  .tone-attention,
  .warning {
    --sev: var(--ap-warn);
  }
  .tone-error,
  .error,
  .failed {
    --sev: var(--ap-error);
  }
  .tone-offline {
    --sev: var(--ap-offline);
  }
  .tone-idle,
  .unknown {
    --sev: var(--ap-neutral);
  }
  .i {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
  }
  .spin {
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .spin {
      animation: none;
    }
  }
  h2,
  h3,
  p {
    margin: 0;
  }
  /* Title line */
  .top {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    padding-left: 8px;
  }
  .title {
    flex: 1;
    min-width: 0;
    font-size: 17px;
    font-weight: 700;
    color: var(--ap-muted);
    overflow-wrap: anywhere;
  }
  .subtitle {
    display: block;
    font-size: 13px;
    font-weight: 500;
  }
  .icon-btn {
    flex: 0 0 44px;
    width: 44px;
    height: 44px;
    padding: 0;
    display: grid;
    place-items: center;
    border-radius: 50%;
    color: var(--ap-muted);
    background: var(--ap-pill);
  }
  .power {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 44px;
    padding: 0 14px 0 11px;
    border-radius: 22px;
    font-size: 14px;
    font-weight: 700;
    color: var(--ap-muted);
    background: var(--ap-pill);
  }
  .power .i {
    width: 18px;
    height: 18px;
  }
  .power.on {
    color: color-mix(in srgb, var(--ap-ok) 70%, var(--ap-text));
    background: color-mix(in srgb, var(--ap-ok) 22%, var(--ap-pill));
  }
  /* Hero */
  .circ {
    flex: 0 0 44px;
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    border-radius: var(--ap-circle);
    color: color-mix(in srgb, var(--sev) 75%, var(--ap-text));
    background: color-mix(in srgb, var(--sev) 20%, transparent);
  }
  .circ.big {
    flex-basis: 52px;
    width: 52px;
    height: 52px;
  }
  .circ.big .i {
    width: 26px;
    height: 26px;
  }
  .hero {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 14px;
    border-radius: var(--ap-radius);
    background: var(--ap-pill);
  }
  .hero-main {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .hero-text {
    flex: 1;
    min-width: 0;
  }
  .status {
    font-size: 13px;
    font-weight: 600;
    color: color-mix(in srgb, var(--sev) 65%, var(--ap-text));
    overflow-wrap: anywhere;
  }
  .current {
    font-size: 30px;
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.01em;
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
  }
  .context {
    font-size: 13px;
    color: var(--ap-muted);
    overflow-wrap: anywhere;
  }
  progress {
    display: block;
    width: 100%;
    height: 8px;
    border: 0;
    border-radius: 4px;
    overflow: hidden;
    accent-color: var(--sev);
    background: color-mix(in srgb, var(--ap-text) 10%, transparent);
  }
  progress::-webkit-progress-bar {
    background: color-mix(in srgb, var(--ap-text) 10%, transparent);
  }
  progress::-webkit-progress-value {
    background: color-mix(in srgb, var(--sev) 80%, var(--ap-text));
    border-radius: 4px;
  }
  progress::-moz-progress-bar {
    background: color-mix(in srgb, var(--sev) 80%, var(--ap-text));
  }
  /* Sections */
  .group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  h3 {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ap-muted);
    margin: 4px 8px 0;
  }
  .tiles {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(110px, 100%), 1fr));
    gap: 6px;
  }
  .tiles:empty {
    display: none;
  }
  .tile {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    padding: 12px 14px;
    border-radius: var(--ap-tile);
    background: var(--ap-pill);
  }
  .tile .label {
    font-size: 0.78rem;
    color: var(--ap-muted);
    overflow-wrap: anywhere;
  }
  .tile .value {
    font-size: 1.05rem;
    font-weight: 700;
    overflow-wrap: anywhere;
  }
  .summary .tile .value {
    font-size: 1.6rem;
    font-weight: 800;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
    color: color-mix(in srgb, var(--sev) 70%, var(--ap-text));
  }
  .summary .tile.flagged {
    background: color-mix(in srgb, var(--sev) 16%, var(--ap-pill));
  }
  .controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr));
    gap: 8px;
  }
  .control {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }
  .control > .label {
    font-size: 13px;
    color: var(--ap-muted);
    padding: 0 8px;
    overflow-wrap: anywhere;
  }
  /* The section heading already names the programme picker. */
  [data-section="programme"] .control > .label {
    display: none;
  }
  .hint,
  .permission {
    font-size: 12.5px;
    color: var(--ap-muted);
    padding: 0 8px;
    line-height: 1.4;
    overflow-wrap: anywhere;
  }
  /* Controls */
  button,
  input,
  select {
    font: inherit;
    color: var(--ap-text);
  }
  button {
    border: 0;
    cursor: pointer;
    background: none;
  }
  .pill,
  .toggle,
  .action,
  select {
    min-height: 48px;
    border-radius: 24px;
    padding: 0 18px;
    font-weight: 600;
    background: color-mix(in srgb, var(--ap-text) 7%, transparent);
    overflow-wrap: anywhere;
  }
  .pill {
    width: 100%;
  }
  .pill.primary,
  .action.primary {
    color: #fff;
    background: color-mix(in srgb, var(--ap-accent) 62%, #000);
  }
  .select-wrap {
    position: relative;
    display: block;
  }
  select {
    appearance: none;
    width: 100%;
    min-width: 0;
    padding-right: 44px;
    border: 0;
    cursor: pointer;
  }
  select option {
    color: #1b1b1a;
  }
  .caret {
    position: absolute;
    right: 16px;
    top: 50%;
    width: 18px;
    height: 18px;
    transform: translateY(-50%);
    color: var(--ap-muted);
    pointer-events: none;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .chip {
    flex: 1 1 auto;
    min-height: 44px;
    border-radius: 22px;
    padding: 0 16px;
    font-weight: 600;
    font-size: 14px;
    background: color-mix(in srgb, var(--ap-text) 7%, transparent);
  }
  .chip[aria-pressed="true"] {
    color: color-mix(in srgb, var(--ap-accent) 65%, var(--ap-text));
    background: color-mix(in srgb, var(--ap-accent) 24%, transparent);
    box-shadow: inset 0 0 0 1.5px
      color-mix(in srgb, var(--ap-accent) 60%, transparent);
  }
  .stepper {
    display: flex;
    align-items: center;
    gap: 4px;
    min-height: 48px;
    padding: 2px;
    border-radius: 24px;
    background: color-mix(in srgb, var(--ap-text) 7%, transparent);
  }
  .step {
    flex: 0 0 44px;
    height: 44px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--ap-surface);
  }
  .stepper input {
    flex: 1;
    min-width: 0;
    width: 100%;
    height: 44px;
    border: 0;
    background: none;
    text-align: center;
    font-size: 18px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    -moz-appearance: textfield;
    appearance: textfield;
  }
  .stepper input::-webkit-inner-spin-button,
  .stepper input::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .toggle {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    text-align: left;
    padding-right: 10px;
  }
  .toggle-text {
    flex: 1;
    min-width: 0;
  }
  .knob {
    position: relative;
    flex: 0 0 44px;
    height: 26px;
    border-radius: 13px;
    background: color-mix(in srgb, var(--ap-text) 22%, transparent);
    transition: background 0.2s;
  }
  .knob::after {
    content: "";
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    transition: transform 0.2s;
  }
  .toggle.on {
    color: color-mix(in srgb, var(--ap-accent) 65%, var(--ap-text));
    background: color-mix(in srgb, var(--ap-accent) 20%, transparent);
  }
  .toggle.on .knob {
    background: color-mix(in srgb, var(--ap-accent) 62%, #000);
  }
  .toggle.on .knob::after {
    transform: translateX(18px);
  }
  .transport {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .action {
    flex: 1 1 120px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-weight: 700;
  }
  .action .i {
    width: 18px;
    height: 18px;
  }
  .action.danger {
    color: color-mix(in srgb, var(--ap-error) 70%, var(--ap-text));
    background: color-mix(in srgb, var(--ap-error) 20%, var(--ap-pill));
  }
  [aria-busy="true"],
  .pending {
    cursor: progress;
  }
  button:disabled,
  input:disabled,
  select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  button:hover:enabled {
    filter: brightness(0.97);
  }
  button:focus-visible,
  select:focus-visible,
  input:focus-visible,
  summary:focus-visible,
  a:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4);
    outline-offset: 2px;
  }
  /* Rows (attention, overview, compact) */
  .attention,
  .rows {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .row,
  .compact {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 56px;
    padding: 6px 14px 6px 6px;
    border-radius: var(--ap-radius);
    background: var(--ap-pill);
    text-align: left;
  }
  li.warning > .row,
  li.error > .row,
  li.row.warning,
  li.row.error {
    background: color-mix(in srgb, var(--sev) 14%, var(--ap-pill));
  }
  .compact {
    min-height: 64px;
  }
  .text {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }
  .text strong {
    font-size: 15px;
    font-weight: 700;
    overflow-wrap: anywhere;
  }
  .sub {
    font-size: 13px;
    color: var(--ap-muted);
    overflow-wrap: anywhere;
  }
  .compact .sub {
    color: color-mix(in srgb, var(--sev) 65%, var(--ap-text));
    font-weight: 600;
  }
  .end {
    font-size: 17px;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    text-align: right;
  }
  .chev {
    color: var(--ap-muted);
    width: 20px;
    height: 20px;
  }
  .panel {
    border-radius: var(--ap-radius);
    background: var(--ap-pill);
    padding: 4px;
  }
  .panel summary {
    list-style: none;
    display: flex;
    align-items: center;
    min-height: 48px;
    padding: 0 6px 0 14px;
    cursor: pointer;
    font-weight: 700;
    border-radius: calc(var(--ap-radius) - 4px);
  }
  .panel summary::-webkit-details-marker {
    display: none;
  }
  .panel-title {
    flex: 1;
  }
  .chevron {
    width: 20px;
    height: 20px;
    margin: 0 10px;
    color: var(--ap-muted);
    transition: transform 0.2s;
  }
  .panel[open] .chevron {
    transform: rotate(180deg);
  }
  .panel .rows {
    padding: 4px;
  }
  .panel .row {
    background: var(--ap-surface);
  }
  /* Feedback */
  .feedback {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px 8px 8px;
    border-radius: var(--ap-radius);
    background: var(--ap-pill);
    --sev: var(--ap-neutral);
  }
  .feedback.sent {
    --sev: var(--ap-ok);
  }
  .feedback.pending {
    --sev: var(--ap-accent);
  }
  .feedback.failed {
    background: color-mix(in srgb, var(--ap-error) 16%, var(--ap-pill));
  }
  .feedback-title {
    font-size: 14px;
    font-weight: 600;
    overflow-wrap: anywhere;
  }
  .note {
    font-size: 13px;
    padding: 10px 14px;
    border-radius: var(--ap-tile);
    background: color-mix(in srgb, var(--ap-muted) 12%, var(--ap-pill));
    overflow-wrap: anywhere;
  }
  .quiet,
  .empty {
    font-size: 14px;
    color: var(--ap-muted);
    padding: 4px 8px;
  }
  a {
    color: var(--ap-accent);
  }
  /* Dialogs carry the card's tokens: they are inside the same host. */
  dialog {
    color: var(--ap-text);
    background: var(--ap-surface);
    border: 0;
    border-radius: 24px;
    padding: 16px;
    width: min(520px, calc(100vw - 24px));
    max-width: calc(100vw - 24px);
    max-height: calc(100dvh - 32px);
    overflow: auto;
    box-shadow: 0 16px 60px #0006;
    --sev: var(--ap-neutral);
  }
  :host([appearance="bubble"]) dialog {
    border-radius: var(--bubble-border-radius, 32px);
  }
  dialog[open] {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  dialog::backdrop {
    background: #0008;
  }
  #confirmation {
    width: min(440px, calc(100vw - 24px));
    --sev: var(--ap-warn);
  }
  .confirm-head {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .confirm-head h2 {
    font-size: 20px;
    font-weight: 800;
  }
  .confirm-what {
    font-size: 16px;
    font-weight: 700;
    padding: 0 4px;
    overflow-wrap: anywhere;
  }
  .dialog-actions {
    display: flex;
    gap: 8px;
  }
  .dialog-actions .pill {
    flex: 1;
  }
  /* A measurement tile opens the appliance's history. */
  .reading-button {
    position: relative;
    width: 100%;
    text-align: left;
    padding-right: 34px;
  }
  .tile-mark {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 16px;
    height: 16px;
    color: var(--ap-muted);
    opacity: 0.7;
  }
  /* History: one chart per appliance, the main unit left, another right. */
  .series-0 {
    --series: var(--ap-accent);
  }
  .series-1 {
    --series: var(--ap-offline);
  }
  .series-2 {
    --series: var(--ap-ok);
  }
  .series-3 {
    --series: var(--purple-color, #8e44ad);
  }
  .series-4 {
    --series: var(--ap-warn);
  }
  #history {
    width: min(640px, calc(100vw - 24px));
  }
  .history-ranges {
    display: flex;
    gap: 6px;
  }
  .history-range {
    min-height: 44px;
    padding: 0 16px;
    border-radius: 22px;
    font-size: 14px;
    font-weight: 600;
    background: color-mix(in srgb, var(--ap-text) 7%, transparent);
  }
  .history-range[aria-pressed="true"] {
    color: color-mix(in srgb, var(--ap-accent) 65%, var(--ap-text));
    background: color-mix(in srgb, var(--ap-accent) 24%, transparent);
    box-shadow: inset 0 0 0 1.5px
      color-mix(in srgb, var(--ap-accent) 60%, transparent);
  }
  .history-plot {
    min-height: 120px;
    touch-action: pan-y;
  }
  .history-chart {
    display: block;
    width: 100%;
    height: auto;
  }
  .history-chart .grid {
    stroke: color-mix(in srgb, var(--ap-muted) 22%, transparent);
  }
  .history-chart .axis {
    fill: var(--ap-muted);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }
  .history-chart .line {
    fill: none;
    stroke: var(--series);
    stroke-width: 2;
    stroke-linejoin: round;
  }
  .history-chart .dashed {
    stroke-dasharray: 5 4;
  }
  .history-chart .lane-track {
    fill: color-mix(in srgb, var(--series) 16%, transparent);
  }
  .history-chart .lane-open {
    fill: var(--series);
  }
  .history-chart .cursor {
    stroke: var(--ap-muted);
    stroke-dasharray: 3 3;
  }
  .history-note {
    margin: 40px 0;
    text-align: center;
    font-size: 14px;
    color: var(--ap-muted);
  }
  .history-when {
    margin: -6px 8px 0;
    font-size: 12.5px;
    color: var(--ap-muted);
    font-variant-numeric: tabular-nums;
  }
  .history-legend {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(150px, 100%), 1fr));
    gap: 6px;
  }
  .history-item {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 2px 10px;
    min-height: 44px;
    padding: 8px 14px;
    border-radius: var(--ap-tile);
    background: var(--ap-pill);
    text-align: left;
  }
  .history-item .swatch {
    grid-row: span 2;
    width: 16px;
    height: 0;
    border-top: 3px solid var(--series);
  }
  .history-item.setpoint .swatch {
    border-top-style: dashed;
  }
  .history-item.door .swatch {
    height: 10px;
    border-top: 0;
    border-radius: 2px;
    background: var(--series);
  }
  .history-item .label {
    font-size: 0.78rem;
    color: var(--ap-muted);
    overflow-wrap: anywhere;
  }
  .history-item strong {
    font-size: 1rem;
    font-variant-numeric: tabular-nums;
  }
  @media (max-width: 400px) {
    ha-card {
      padding: 12px;
    }
    dialog {
      padding: 12px;
    }
    .current {
      font-size: 26px;
    }
    .power {
      padding: 0 12px 0 10px;
    }
    .power span {
      display: none;
    }
  }
  ${colorSchemeStyles}
`;
