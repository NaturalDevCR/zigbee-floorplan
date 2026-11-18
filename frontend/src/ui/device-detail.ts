import { css, html, LitElement, nothing } from "lit";
import { relativeTime, type I18nKey, type Translate } from "../i18n";
import { band } from "../rf/colormap";
import type { Floor, NetworkState, Placement, ZDevice } from "../types";
import { deviceHealth, HEALTH_COLOR, lqiColor, TYPE_COLOR, TYPE_ICON } from "./device-style";
import { icon, mdiClose, mdiCrosshairsGps, mdiOpenInNew } from "./icons";
import { controls, tokens } from "./styles";

/** Device summary: identity, health, real neighbors and estimated signal. */
export class ZfpDeviceDetail extends LitElement {
  static properties = {
    device: { attribute: false },
    placement: { attribute: false },
    network: { attribute: false },
    floors: { attribute: false },
    rssi: { attribute: false },
    t: { attribute: false },
    closable: { type: Boolean },
    editable: { type: Boolean },
  };

  declare device: ZDevice;
  declare placement: Placement | undefined;
  declare network: NetworkState | null;
  declare floors: Floor[];
  declare rssi: number | undefined;
  declare t: Translate;
  declare closable: boolean;
  declare editable: boolean;

  constructor() {
    super();
    this.floors = [];
    this.network = null;
    this.closable = false;
    this.editable = false;
  }

  private fire(name: string, detail?: unknown) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  private neighbors() {
    const d = this.device;
    const byIeee = new Map((this.network?.devices ?? []).map((x) => [x.ieee, x]));
    return (this.network?.links ?? [])
      .filter((l) => l.a === d.ieee || l.b === d.ieee)
      .map((l) => {
        const other = l.a === d.ieee ? l.b : l.a;
        const role =
          l.relationship === "tree" ? (l.parent === other ? "detail.parent" : "detail.child") : "detail.sibling";
        return { link: l, other: byIeee.get(other), ieee: other, role: role as I18nKey };
      })
      .sort((x, y) => (y.link.lqi ?? -1) - (x.link.lqi ?? -1));
  }

  protected render() {
    const d = this.device;
    if (!d) return nothing;
    const t = this.t;
    const health = deviceHealth(d, this.rssi);
    const floor = this.floors.find((f) => f.id === this.placement?.floorId);
    const neighbors = this.neighbors();
    const seen = relativeTime(t, d.last_seen);
    return html`
      <div class="head">
        <div class="avatar" style="--c:${TYPE_COLOR[d.type]};--h:${HEALTH_COLOR[health]}">${icon(TYPE_ICON[d.type], 24)}</div>
        <div class="title">
          <h3>${d.name}</h3>
          <div class="sub">${t(`type.${d.type}` as I18nKey)}${d.vendor ? html` · ${d.vendor}` : nothing}</div>
        </div>
        ${this.closable
          ? html`<button class="icon-btn" @click=${() => this.fire("zfp-close")} aria-label=${t("action.close")}>
              ${icon(mdiClose)}
            </button>`
          : nothing}
      </div>

      <div class="stats">
        <div class="stat">
          <span class="k">${t("detail.lqi")}</span>
          <span class="v" style="color:${lqiColor(d.lqi)}">${d.lqi ?? "—"}</span>
        </div>
        <div class="stat">
          <span class="k">${t("detail.estimated")}</span>
          <span class="v">${this.rssi !== undefined ? html`${this.rssi}<small> dBm</small>` : "—"}</span>
          ${this.rssi !== undefined ? html`<span class="band">${t(`band.${band(this.rssi)}` as I18nKey)}</span>` : nothing}
        </div>
        ${d.battery !== null
          ? html`<div class="stat">
              <span class="k">${t("detail.battery")}</span>
              <span class="v" style=${d.battery <= 15 ? "color:var(--zfp-error)" : ""}>${d.battery}<small>%</small></span>
            </div>`
          : nothing}
      </div>

      <dl>
        ${d.model ? html`<dt>${t("detail.model")}</dt><dd>${d.model}</dd>` : nothing}
        <dt>${t("detail.ieee")}</dt><dd class="mono">${d.ieee}</dd>
        ${d.power_source ? html`<dt>${t("detail.power")}</dt><dd>${d.power_source}</dd>` : nothing}
        ${seen ? html`<dt>${t("detail.last_seen")}</dt><dd>${seen}</dd>` : nothing}
        <dt>${t("detail.floor")}</dt><dd>${floor ? floor.name : t("detail.not_placed")}</dd>
      </dl>

      <div class="section-title">${t("detail.neighbors")}</div>
      ${neighbors.length
        ? html`<ul class="neighbors">
            ${neighbors.map(
              (n) => html`<li
                @mouseenter=${() => this.fire("zfp-highlight", { ieee: n.ieee })}
                @mouseleave=${() => this.fire("zfp-highlight", { ieee: null })}
                @click=${() => this.fire("zfp-open-device", { ieee: n.ieee })}
              >
                <span class="dot" style="background:${TYPE_COLOR[n.other?.type ?? "Unknown"]}"></span>
                <span class="name">${n.other?.name ?? n.ieee}</span>
                <span class="role">${t(n.role)}</span>
                <span class="lqi" style="background:${lqiColor(n.link.lqi)}">${n.link.lqi ?? "?"}</span>
              </li>`,
            )}
          </ul>`
        : html`<p class="muted small">${t("detail.no_neighbors")}</p>`}

      <div class="actions">
        ${this.placement
          ? html`<button class="btn small" @click=${() => this.fire("zfp-locate", { ieee: d.ieee })}>
              ${icon(mdiCrosshairsGps, 16)} ${t("action.locate")}
            </button>`
          : this.editable
            ? html`<button class="btn small primary" @click=${() => this.fire("zfp-place", { ieee: d.ieee })}>
                ${t("action.place")}
              </button>`
            : nothing}
        ${d.ha_device_id
          ? html`<button class="btn small" @click=${() => this.fire("zfp-open-ha", { id: d.ha_device_id })}>
              ${icon(mdiOpenInNew, 16)} ${t("action.open_in_ha")}
            </button>`
          : nothing}
        ${this.placement && this.editable
          ? html`<button class="btn small danger" @click=${() => this.fire("zfp-unplace", { ieee: d.ieee })}>
              ${t("action.unplace")}
            </button>`
          : nothing}
      </div>
    `;
  }

  static styles = [
    tokens,
    controls,
    css`
      :host {
        display: grid;
        gap: 16px;
      }
      .head {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        color: var(--c);
        background: color-mix(in srgb, var(--c) 12%, var(--zfp-surface));
        box-shadow: 0 0 0 3px var(--h);
        flex: none;
      }
      .title {
        flex: 1;
        min-width: 0;
      }
      h3 {
        margin: 0;
        font-size: 17px;
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .sub {
        font-size: 13px;
        color: var(--zfp-text-2);
      }
      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
        gap: 8px;
      }
      .stat {
        padding: 10px 12px;
        border-radius: 12px;
        background: var(--zfp-surface-2);
        display: grid;
        gap: 2px;
      }
      .stat .k {
        font-size: 11px;
        color: var(--zfp-text-2);
      }
      .stat .v {
        font-size: 20px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }
      .stat small {
        font-size: 12px;
        font-weight: 500;
        color: var(--zfp-text-2);
      }
      .stat .band {
        font-size: 11px;
        color: var(--zfp-text-2);
      }
      dl {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 6px 16px;
        margin: 0;
        font-size: 13px;
      }
      dt {
        color: var(--zfp-text-2);
      }
      dd {
        margin: 0;
        text-align: right;
        overflow-wrap: anywhere;
      }
      .mono {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 12px;
      }
      .neighbors {
        list-style: none;
        margin: -4px 0 0;
        padding: 0;
        display: grid;
        gap: 2px;
      }
      .neighbors li {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 7px 8px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 13px;
      }
      .neighbors li:hover {
        background: var(--zfp-surface-2);
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex: none;
      }
      .name {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .role {
        font-size: 11px;
        color: var(--zfp-text-3);
      }
      .lqi {
        min-width: 30px;
        text-align: center;
        font-size: 11px;
        font-weight: 700;
        color: #fff;
        border-radius: 9px;
        padding: 1px 6px;
      }
      .small {
        font-size: 13px;
        margin: 0;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .section-title {
        margin-bottom: 0;
      }
    `,
  ];
}

if (!customElements.get("zfp-device-detail")) customElements.define("zfp-device-detail", ZfpDeviceDetail);
