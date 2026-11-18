import { css } from "lit";

/** Styles for drawer pane content (shared by panel and card detail sheet). */
export const paneStyles = css`
  section {
    display: grid;
    gap: 12px;
  }
  section.tight {
    gap: 8px;
  }
  .section-title {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .count {
    font-weight: 600;
    color: var(--zfp-text-3);
    background: var(--zfp-surface-3);
    border-radius: 8px;
    padding: 0 6px;
    letter-spacing: 0;
  }
  .empty-pane {
    display: grid;
    justify-items: center;
    gap: 8px;
    padding: 32px 12px;
    text-align: center;
    color: var(--zfp-text-3);
  }
  .empty-pane p {
    margin: 0;
    color: var(--zfp-text-2);
    line-height: 1.5;
    font-size: 14px;
  }
  .hint {
    margin: 0;
    font-size: 12.5px;
    line-height: 1.5;
    color: var(--zfp-text-2);
    display: flex;
    gap: 6px;
    align-items: flex-start;
  }
  .hint.ok {
    color: var(--zfp-success);
  }
  .kv {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
    color: var(--zfp-text-2);
  }
  .kv b {
    color: var(--zfp-text);
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .material-swatch {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--zfp-text-2);
    margin-top: -4px;
  }
  .material-swatch span {
    width: 28px;
    height: 8px;
    border-radius: 4px;
    background: var(--c);
  }
  .btn-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    cursor: pointer;
  }
  .search {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 40px;
    padding: 0 12px;
    border-radius: 20px;
    background: var(--zfp-surface-2);
    color: var(--zfp-text-2);
  }
  .search input {
    border: none;
    background: none;
    height: 100%;
    padding: 0;
    outline: none;
  }
  .dev-list,
  .sugg-list,
  .link-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 2px;
  }
  .dev-row,
  .sugg-list li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 8px;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.12s;
  }
  .dev-row:hover,
  .sugg-list li:hover {
    background: var(--zfp-surface-2);
  }
  .dev-row.selected {
    background: var(--zfp-accent-soft);
  }
  .dev-row[draggable="true"] {
    cursor: grab;
  }
  .dev-icon {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: var(--c);
    background: color-mix(in srgb, var(--c) 12%, var(--zfp-surface));
    box-shadow: inset 0 0 0 2px var(--h);
    flex: none;
  }
  .dev-text {
    flex: 1;
    min-width: 0;
    display: grid;
  }
  .dev-name {
    font-size: 14px;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .dev-sub {
    font-size: 12px;
    color: var(--zfp-text-2);
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }
  .lqi-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
  }
  .num {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: var(--zfp-accent);
    color: var(--zfp-on-accent);
    font-size: 13px;
    font-weight: 700;
    flex: none;
  }
  .legend {
    display: grid;
    gap: 6px;
    font-size: 13px;
  }
  .legend div {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .legend .muted {
    margin-left: auto;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
  }
  .sw {
    width: 22px;
    height: 12px;
    border-radius: 4px;
    opacity: 0.85;
  }
  .link-list li {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    padding: 6px 8px;
    border-radius: 8px;
  }
  .link-list li:hover {
    background: var(--zfp-surface-2);
  }
  .link-list span:not(.lqi):not(.muted) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }
  .swatches {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .swatch {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid transparent;
    cursor: pointer;
    padding: 0;
    box-shadow: inset 0 0 0 2px var(--zfp-surface);
  }
  .swatch.on {
    border-color: var(--zfp-text);
  }
  .building-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 10px;
  }
  .building-card {
    display: grid;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid var(--zfp-divider);
    border-left: 4px solid var(--b);
    transition: opacity 0.15s;
  }
  .building-card.hidden {
    opacity: 0.55;
  }
  .b-head {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .b-swatch {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--b);
    flex: none;
  }
  .lqi {
    min-width: 28px;
    text-align: center;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    border-radius: 9px;
    padding: 1px 6px;
    margin-left: auto;
  }
`;
