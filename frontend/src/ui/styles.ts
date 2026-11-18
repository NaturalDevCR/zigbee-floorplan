import { css } from "lit";

/** Design tokens derived from the active Home Assistant theme. */
export const tokens = css`
  :host {
    --zfp-bg: var(--primary-background-color, #f4f5f7);
    --zfp-surface: var(--card-background-color, var(--ha-card-background, #ffffff));
    --zfp-surface-2: color-mix(in srgb, var(--zfp-text) 4%, var(--zfp-surface));
    --zfp-surface-3: color-mix(in srgb, var(--zfp-text) 8%, var(--zfp-surface));
    --zfp-text: var(--primary-text-color, #1c1f24);
    --zfp-text-2: var(--secondary-text-color, #5d6470);
    --zfp-text-3: color-mix(in srgb, var(--zfp-text-2) 70%, transparent);
    --zfp-accent: var(--primary-color, #039be5);
    --zfp-accent-soft: color-mix(in srgb, var(--zfp-accent) 14%, transparent);
    --zfp-on-accent: var(--text-primary-color, #ffffff);
    --zfp-divider: var(--divider-color, rgba(0, 0, 0, 0.12));
    --zfp-success: var(--success-color, #16a34a);
    --zfp-warning: var(--warning-color, #d97706);
    --zfp-error: var(--error-color, #dc2626);
    --zfp-radius: var(--ha-card-border-radius, 12px);
    --zfp-radius-sm: 8px;
    --zfp-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 4px 16px rgba(0, 0, 0, 0.08);
    --zfp-shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.18);
    --zfp-ease: cubic-bezier(0.2, 0, 0, 1);
    --zfp-font: var(--paper-font-body1_-_font-family, var(--ha-font-family-body, Roboto, system-ui, sans-serif));
    font-family: var(--zfp-font);
    color: var(--zfp-text);
    -webkit-font-smoothing: antialiased;
  }
`;

export const controls = css`
  .icon {
    display: block;
    flex: none;
  }
  button {
    font: inherit;
    color: inherit;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 36px;
    padding: 0 14px;
    border-radius: 18px;
    border: 1px solid var(--zfp-divider);
    background: var(--zfp-surface);
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    transition: background 0.15s var(--zfp-ease), border-color 0.15s, box-shadow 0.15s, transform 0.1s;
  }
  .btn:hover {
    background: var(--zfp-surface-2);
  }
  .btn:active {
    transform: scale(0.98);
  }
  .btn.primary {
    background: var(--zfp-accent);
    border-color: transparent;
    color: var(--zfp-on-accent);
  }
  .btn.primary:hover {
    background: color-mix(in srgb, var(--zfp-accent) 88%, black);
  }
  .btn.danger {
    color: var(--zfp-error);
  }
  .btn[disabled],
  .icon-btn[disabled] {
    opacity: 0.45;
    pointer-events: none;
  }
  .btn.small {
    height: 30px;
    padding: 0 10px;
    font-size: 13px;
  }
  .icon-btn {
    display: inline-grid;
    place-items: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--zfp-text-2);
    transition: background 0.15s var(--zfp-ease), color 0.15s;
  }
  .icon-btn:hover {
    background: var(--zfp-surface-3);
    color: var(--zfp-text);
  }
  .icon-btn.active {
    background: var(--zfp-accent-soft);
    color: var(--zfp-accent);
  }
  button:focus-visible,
  input:focus-visible,
  select:focus-visible {
    outline: 2px solid var(--zfp-accent);
    outline-offset: 2px;
  }
  .field {
    display: grid;
    gap: 4px;
    font-size: 12px;
    color: var(--zfp-text-2);
  }
  .field > span {
    font-weight: 500;
  }
  .row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 10px;
  }
  .field {
    min-width: 0;
  }
  select {
    text-overflow: ellipsis;
  }
  input[type="text"],
  input[type="number"],
  input[type="search"],
  select {
    height: 36px;
    box-sizing: border-box;
    width: 100%;
    padding: 0 10px;
    border-radius: var(--zfp-radius-sm);
    border: 1px solid var(--zfp-divider);
    background: var(--zfp-surface);
    color: var(--zfp-text);
    font: inherit;
    font-size: 14px;
    transition: border-color 0.15s;
  }
  input:hover,
  select:hover {
    border-color: color-mix(in srgb, var(--zfp-text) 30%, transparent);
  }
  input[type="range"] {
    width: 100%;
    accent-color: var(--zfp-accent);
  }
  input[type="checkbox"] {
    accent-color: var(--zfp-accent);
    width: 16px;
    height: 16px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 24px;
    padding: 0 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    background: var(--zfp-surface-3);
    color: var(--zfp-text-2);
    white-space: nowrap;
  }
  .chip.ok {
    background: color-mix(in srgb, var(--zfp-success) 15%, transparent);
    color: var(--zfp-success);
  }
  .chip.warn {
    background: color-mix(in srgb, var(--zfp-warning) 16%, transparent);
    color: var(--zfp-warning);
  }
  .chip.bad {
    background: color-mix(in srgb, var(--zfp-error) 14%, transparent);
    color: var(--zfp-error);
  }
  .muted {
    color: var(--zfp-text-2);
  }
  .section-title {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--zfp-text-3);
    margin: 0 0 8px;
  }
  .segmented {
    display: inline-flex;
    padding: 3px;
    border-radius: 20px;
    background: var(--zfp-surface-3);
    gap: 2px;
  }
  .segmented button {
    height: 30px;
    padding: 0 12px;
    border: none;
    border-radius: 15px;
    background: transparent;
    color: var(--zfp-text-2);
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: background 0.15s var(--zfp-ease), color 0.15s;
  }
  .segmented button.active {
    background: var(--zfp-surface);
    color: var(--zfp-text);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  }
`;
