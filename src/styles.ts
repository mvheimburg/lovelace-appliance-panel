import { css } from "lit";
export const styles = css`
  :host {
    display: block;
    --ap-accent: var(--primary-color, #2563eb);
    --ap-bg: var(--ha-card-background, var(--card-background-color, #fff));
    --ap-surface: var(--secondary-background-color, #f3f5f8);
    --ap-text: var(--primary-text-color, #192435);
    --ap-muted: var(--secondary-text-color, #607086);
    --ap-border: var(--divider-color, #dce2eb);
    --ap-radius: 20px;
    --ap-icon-radius: 15px;
    --ap-button-radius: 12px;
    --ap-icon-bg: var(--ap-surface);
    --ap-button-bg: var(--ap-surface);
    --ap-card-border: 1px solid var(--ap-border);
    --ap-shadow: none;
    --ap-error: #b42330;
    --ap-warning: #9b5900;
    color: var(--ap-text);
    font-family: var(--paper-font-body1_-_font-family, system-ui, sans-serif);
  }
  :host([appearance="bubble"]) {
    --ap-bg: var(
      --bubble-main-background-color,
      var(--card-background-color, #fff)
    );
    --ap-surface: var(
      --bubble-secondary-background-color,
      var(--secondary-background-color, #f1f4f8)
    );
    --ap-accent: var(--bubble-accent-color, var(--primary-color, #2563eb));
    --ap-radius: var(--bubble-border-radius, 28px);
    --ap-icon-radius: var(--bubble-icon-border-radius, 15px);
    --ap-button-radius: var(--bubble-sub-button-border-radius, 12px);
    --ap-icon-bg: var(--bubble-icon-background-color, var(--ap-surface));
    --ap-button-bg: var(
      --bubble-sub-button-background-color,
      var(--ap-surface)
    );
    --ap-card-border: var(--bubble-border, 1px solid var(--ap-border));
    --ap-shadow: var(--bubble-box-shadow, none);
  }
  * {
    box-sizing: border-box;
  }
  ha-card {
    display: block;
    background: var(--ap-bg);
    border: var(--ap-card-border);
    border-radius: var(--ap-radius);
    box-shadow: var(--ap-shadow);
    padding: 20px;
    overflow: hidden;
  }
  header {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    margin-bottom: 16px;
  }
  .heading {
    flex: 1;
    min-width: 0;
  }
  h2 {
    font-size: 1.1rem;
    line-height: 1.35;
    margin: 0;
    overflow-wrap: anywhere;
  }
  h3 {
    font-size: 0.82rem;
    letter-spacing: 0.03em;
    margin: 0 0 12px;
    font-weight: 650;
    color: var(--ap-muted);
  }
  .eyebrow {
    font-size: 0.68rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ap-muted);
    margin: 0 0 5px;
  }
  .icon {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    flex-shrink: 0;
    border-radius: var(--ap-icon-radius);
    color: var(--ap-accent);
    background: var(--ap-icon-bg);
  }
  .icon ha-icon {
    --mdc-icon-size: 24px;
  }
  .status {
    font-size: 0.78rem;
    color: var(--ap-muted);
    margin-top: 3px;
  }
  .badge {
    padding: 4px 9px;
    border-radius: 12px;
    font-size: 0.75rem;
    background: var(--ap-surface);
    white-space: nowrap;
  }
  section {
    margin-top: 18px;
  }
  .surface {
    padding: 14px;
    background: var(--ap-surface);
    border-radius: 16px;
  }
  .controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(170px, 100%), 1fr));
    gap: 12px;
  }
  .control {
    display: flex;
    flex-direction: column;
    gap: 7px;
    min-width: 0;
  }
  .control > span {
    font-size: 0.8rem;
    color: var(--ap-muted);
    overflow-wrap: anywhere;
  }
  input,
  select,
  button {
    font: inherit;
    color: var(--ap-text);
  }
  input,
  select {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    min-height: 42px;
    padding: 8px 10px;
    border: 1px solid var(--ap-border);
    border-radius: 10px;
    background: var(--ap-bg);
  }
  button {
    min-height: 40px;
    padding: 9px 13px;
    border: 1px solid var(--ap-border);
    background: var(--ap-button-bg);
    border-radius: var(--ap-button-radius);
    cursor: pointer;
    overflow-wrap: anywhere;
  }
  button:hover:enabled {
    filter: brightness(0.96);
  }
  button:disabled,
  input:disabled,
  select:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
  button.primary {
    background: var(--ap-accent);
    color: #fff;
    border-color: transparent;
  }
  button.danger {
    background: #b42330;
    color: #fff;
    border-color: transparent;
  }
  .transport,
  .dialog-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 9px;
    margin-top: 16px;
  }
  .transport button {
    flex: 1;
  }
  .feedback {
    font-size: 0.84rem;
    border-left: 3px solid var(--ap-error);
    padding: 10px 12px;
    color: var(--ap-error);
    overflow-wrap: anywhere;
  }
  .muted,
  .note {
    font-size: 0.78rem;
    color: var(--ap-muted);
    line-height: 1.5;
  }
  .note {
    margin: 10px 0 0;
  }
  .reading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    font-size: 0.86rem;
    min-width: 0;
    padding: 7px 0;
  }
  .reading span {
    overflow-wrap: anywhere;
  }
  .reading strong {
    font-weight: 550;
    overflow-wrap: anywhere;
    text-align: right;
  }
  .progress-head {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 12px;
    overflow-wrap: anywhere;
  }
  .progress-head strong {
    font-size: 1.3rem;
    font-weight: 550;
  }
  .progress-head span {
    color: var(--ap-muted);
    font-size: 0.8rem;
  }
  progress {
    display: block;
    width: 100%;
    height: 8px;
    accent-color: var(--ap-accent);
    border: 0;
    border-radius: 10px;
    overflow: hidden;
  }
  progress::-webkit-progress-bar {
    background: var(--ap-border);
  }
  progress::-webkit-progress-value {
    background: var(--ap-accent);
    border-radius: 10px;
  }
  .phase {
    margin-top: 8px;
    font-size: 0.8rem;
    color: var(--ap-muted);
  }
  .attention {
    list-style: none;
    padding: 0;
    margin: 0;
    display: grid;
    gap: 8px;
  }
  .attention li {
    border-radius: 10px;
    background: var(--ap-surface);
    padding: 10px 12px;
    font-size: 0.82rem;
    overflow-wrap: anywhere;
    border-left: 3px solid var(--ap-warning);
  }
  .attention li.error {
    border-left-color: var(--ap-error);
  }
  .attention li.unknown {
    border-left-color: var(--ap-muted);
  }
  .row {
    width: 100%;
    display: flex;
    text-align: left;
    align-items: center;
    gap: 12px;
    padding: 12px;
    margin-bottom: 8px;
    background: var(--ap-surface);
    border: 0;
  }
  .row .heading {
    display: block;
  }
  .row strong {
    display: block;
    font-size: 0.87rem;
    font-weight: 600;
  }
  .row small {
    display: block;
    color: var(--ap-muted);
    margin-top: 4px;
  }
  .row .end {
    font-size: 0.8rem;
    white-space: nowrap;
  }
  .quiet {
    padding: 12px 0;
    color: var(--ap-muted);
    font-size: 0.87rem;
  }
  details {
    margin-top: 16px;
    border-top: 1px solid var(--ap-border);
    padding-top: 12px;
  }
  summary {
    cursor: pointer;
    font-size: 0.86rem;
    color: var(--ap-muted);
    padding: 4px 0 10px;
  }
  .compact {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    text-align: left;
    background: none;
    border: 0;
    padding: 0;
  }
  .compact .heading {
    flex: 1;
  }
  .compact .status {
    display: block;
  }
  dialog {
    color: var(--ap-text);
    background: var(--ap-bg);
    border: 1px solid var(--ap-border);
    border-radius: var(--ap-radius);
    width: min(560px, calc(100vw - 24px));
    max-width: calc(100vw - 24px);
    max-height: calc(100dvh - 32px);
    padding: 22px;
    overflow: auto;
  }
  dialog::backdrop {
    background: #10182780;
  }
  dialog h2 {
    padding-right: 10px;
  }
  .dialog-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 15px;
  }
  .dialog-actions {
    justify-content: flex-end;
  }
  .icon-button {
    flex: none;
    min-width: 40px;
    padding: 8px;
  }
  .empty {
    font-size: 0.85rem;
    color: var(--ap-muted);
  }
  .permission {
    font-size: 0.77rem;
    color: var(--ap-muted);
    margin-top: 10px;
  }
  .control.switch {
    flex-direction: row;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .switch input {
    width: 22px;
    height: 22px;
    min-height: 0;
    accent-color: var(--ap-accent);
  }
  a {
    color: var(--ap-accent);
  }
  @media (max-width: 380px) {
    ha-card {
      padding: 15px;
    }
    header {
      gap: 9px;
    }
    .icon {
      width: 38px;
      height: 38px;
    }
    dialog {
      padding: 16px;
    }
    .controls {
      grid-template-columns: 1fr;
    }
    .badge {
      font-size: 0.69rem;
    }
    .row .end {
      white-space: normal;
      text-align: right;
    }
  }
`;
