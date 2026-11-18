import { css, html, LitElement, nothing, type PropertyValues } from "lit";
import "../canvas/zfp-canvas";
import type { Layers, ZfpCanvas } from "../canvas/zfp-canvas";
import { DEVICE_PREFIX } from "../canvas/tools";
import { FloorplanController } from "../data/controller";
import type { HomeAssistant } from "../data/hass";
import { translator, type I18nKey, type Translate } from "../i18n";
import { getFloor } from "../project/ops";
import { BANDS } from "../rf/colormap";
import { RfClient } from "../rf/client";
import type { RfResult } from "../rf/engine";
import "../ui/device-detail";
import { icon, mdiFitToScreenOutline, mdiFloorPlan } from "../ui/icons";
import { controls, tokens } from "../ui/styles";

export type CardLayer = keyof Layers;

export interface CardConfig {
  type: string;
  title?: string;
  floor?: string;
  height?: number;
  layers?: CardLayer[];
  show_floor_tabs?: boolean;
  links?: "tree" | "all";
}

const ALL_LAYERS: CardLayer[] = ["heatmap", "links", "labels", "background", "suggestions"];
export const DEFAULT_CARD_LAYERS: CardLayer[] = ["heatmap", "links", "labels", "background"];

export class ZigbeeFloorplanCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _floorId: { state: true },
    _rf: { state: true },
    _detail: { state: true },
    _imageUrl: { state: true },
    _highlight: { state: true },
    _tick: { state: true },
  };

  declare hass: HomeAssistant;
  declare _config: CardConfig;
  declare _floorId: string | null;
  declare _rf: RfResult | null;
  declare _detail: string | null;
  declare _imageUrl: string | null;
  declare _highlight: string | null;
  declare _tick: number;

  private ctrl?: FloorplanController;
  private detach?: () => void;
  private rfClient?: RfClient;
  private imageFor: string | null = null;

  constructor() {
    super();
    this._floorId = null;
    this._rf = null;
    this._detail = null;
    this._imageUrl = null;
    this._highlight = null;
    this._tick = 0;
  }

  static getConfigElement(): HTMLElement {
    return document.createElement("zigbee-floorplan-card-editor");
  }

  static getStubConfig(): Partial<CardConfig> {
    return { height: 420, layers: DEFAULT_CARD_LAYERS, show_floor_tabs: true, links: "tree" };
  }

  setConfig(config: CardConfig): void {
    if (!config || typeof config !== "object") throw new Error("Invalid configuration");
    if (config.height !== undefined && (typeof config.height !== "number" || config.height < 150)) {
      throw new Error("height must be a number ≥ 150");
    }
    if (config.layers && (!Array.isArray(config.layers) || config.layers.some((l) => !ALL_LAYERS.includes(l)))) {
      throw new Error(`layers must be a list of: ${ALL_LAYERS.join(", ")}`);
    }
    if (config.links && config.links !== "tree" && config.links !== "all") throw new Error("links must be tree or all");
    this._config = config;
    if (config.floor) this._floorId = config.floor;
  }

  getCardSize(): number {
    return Math.ceil((this._config?.height ?? 420) / 50) + 1;
  }

  getGridOptions() {
    const rows = Math.ceil(((this._config?.height ?? 420) + 60) / 64);
    return { columns: 12, rows, min_columns: 6, min_rows: 4 };
  }

  private get t(): Translate {
    return translator(this.hass?.locale?.language ?? this.hass?.language);
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (this.hass) this.attach();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.detach?.();
    this.detach = undefined;
    this.rfClient?.dispose();
    this.rfClient = undefined;
  }

  private attach(): void {
    if (this.detach) return;
    this.ctrl = FloorplanController.for(this.hass);
    this.rfClient = new RfClient((r) => (this._rf = r));
    this.detach = this.ctrl.attach(() => this.onChange());
    this.onChange();
  }

  protected willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("hass") && this.hass) {
      if (!this.detach) this.attach();
      else this.ctrl?.setHass(this.hass);
    }
    if (changed.has("_config") && this.ctrl) this.onChange();
  }

  private onChange(): void {
    const ctrl = this.ctrl;
    if (!ctrl?.ready) {
      this._tick++;
      return;
    }
    const floors = ctrl.project.floors;
    if (!floors.find((f) => f.id === this._floorId)) {
      this._floorId = floors.find((f) => f.id === this._config?.floor)?.id ?? floors[0]?.id ?? null;
    }
    const layers = this.layers();
    if (this._floorId && this.rfClient && (layers.heatmap || layers.suggestions)) {
      this.rfClient.request({
        project: ctrl.project,
        devices: (ctrl.network?.devices ?? []).map((d) => ({ ieee: d.ieee, type: d.type })),
        links: ctrl.network?.links ?? [],
        floorId: this._floorId,
        suggest: layers.suggestions,
      });
    }
    void this.resolveImage();
    this._tick++;
  }

  private async resolveImage(): Promise<void> {
    const id = getFloor(this.ctrl!.project, this._floorId)?.background?.imageId ?? null;
    if (id === this.imageFor) return;
    this.imageFor = id;
    this._imageUrl = null;
    if (!id || !this.layers().background) return;
    try {
      const url = await this.ctrl!.api.imageUrl(id);
      if (this.imageFor === id) this._imageUrl = url;
    } catch {
      /* image missing */
    }
  }

  private layers(): Layers {
    const list = this._config?.layers ?? DEFAULT_CARD_LAYERS;
    return Object.fromEntries(ALL_LAYERS.map((l) => [l, list.includes(l)])) as unknown as Layers;
  }

  protected render() {
    if (!this._config) return nothing;
    const t = this.t;
    const ctrl = this.ctrl;
    const height = this._config.height ?? 420;
    const floors = ctrl?.ready ? ctrl.project.floors : [];
    const floor = ctrl?.ready ? getFloor(ctrl.project, this._floorId) : undefined;
    const showTabs = (this._config.show_floor_tabs ?? true) && floors.length > 1;
    const detailDevice = this._detail ? ctrl?.network?.devices.find((d) => d.ieee === this._detail) : undefined;
    const layers = this.layers();
    return html`<ha-card>
      ${this._config.title || showTabs
        ? html`<div class="head">
            ${this._config.title ? html`<div class="title">${this._config.title}</div>` : nothing}
            ${showTabs
              ? html`<div class="tabs">${floors.map(
                  (f) => html`<button class=${f.id === this._floorId ? "active" : ""} @click=${() => {
                    this._floorId = f.id;
                    this._detail = null;
                    this.onChange();
                  }}>${f.name}</button>`,
                )}</div>`
              : nothing}
          </div>`
        : nothing}
      <div class="stage" style="height:${height}px">
        ${!ctrl?.ready
          ? html`<div class="msg">${ctrl?.loadError ?? html`<div class="spinner"></div>`}</div>`
          : !floor
            ? html`<div class="msg">${icon(mdiFloorPlan, 36)}<span>${t("card.no_plan")}</span></div>`
            : html`<zfp-canvas
                  .project=${ctrl.project}
                  .floorId=${this._floorId}
                  .network=${ctrl.network}
                  .rf=${this._rf}
                  .editable=${false}
                  .layers=${layers}
                  .linkMode=${this._config.links ?? "tree"}
                  .selection=${this._detail ? [DEVICE_PREFIX + this._detail] : []}
                  .imageUrl=${this._imageUrl}
                  .highlight=${this._highlight}
                  .t=${t}
                  @zfp-device-click=${(e: CustomEvent<{ ieee: string }>) => (this._detail = e.detail.ieee)}
                ></zfp-canvas>
                <button class="icon-btn fit" title=${t("action.fit")}
                  @click=${() => (this.renderRoot.querySelector("zfp-canvas") as ZfpCanvas | null)?.fit()}>
                  ${icon(mdiFitToScreenOutline, 18)}</button>
                ${layers.heatmap
                  ? html`<div class="legend">${BANDS.slice(0, 4).map(
                      (b) => html`<span><i style="background:${b.color}"></i>${t(`band.${b.id}` as I18nKey)}</span>`,
                    )}</div>`
                  : nothing}
                ${detailDevice
                  ? html`<div class="sheet"
                      @zfp-close=${() => (this._detail = null)}
                      @zfp-open-device=${(e: CustomEvent<{ ieee: string }>) => (this._detail = e.detail.ieee)}
                      @zfp-highlight=${(e: CustomEvent<{ ieee: string | null }>) => (this._highlight = e.detail.ieee)}
                      @zfp-locate=${(e: CustomEvent<{ ieee: string }>) => {
                        const pl = ctrl.project.placements[e.detail.ieee];
                        if (pl) (this.renderRoot.querySelector("zfp-canvas") as ZfpCanvas | null)?.centerOn(pl);
                      }}
                      @zfp-open-ha=${(e: CustomEvent<{ id: string }>) => {
                        history.pushState(null, "", `/config/devices/device/${e.detail.id}`);
                        window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
                      }}>
                      <zfp-device-detail closable
                        .device=${detailDevice}
                        .placement=${ctrl.project.placements[detailDevice.ieee]}
                        .network=${ctrl.network}
                        .floors=${ctrl.project.floors}
                        .rssi=${this._rf?.deviceRssi[detailDevice.ieee]}
                        .t=${t}
                      ></zfp-device-detail>
                    </div>`
                  : nothing}`}
      </div>
    </ha-card>`;
  }

  static styles = [
    tokens,
    controls,
    css`
      :host {
        display: block;
      }
      ha-card {
        overflow: hidden;
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      .head {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px 8px;
        flex-wrap: wrap;
      }
      .title {
        font-size: 16px;
        font-weight: 500;
        flex: 1;
      }
      .tabs {
        display: flex;
        gap: 4px;
        overflow-x: auto;
        scrollbar-width: none;
      }
      .tabs button {
        height: 30px;
        padding: 0 12px;
        border-radius: 15px;
        border: none;
        background: var(--zfp-surface-2);
        color: var(--zfp-text-2);
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        white-space: nowrap;
      }
      .tabs button.active {
        background: var(--zfp-accent-soft);
        color: var(--zfp-accent);
      }
      .stage {
        position: relative;
        flex: 1;
        min-height: 150px;
      }
      zfp-canvas {
        position: absolute;
        inset: 0;
      }
      .fit {
        position: absolute;
        top: 8px;
        right: 8px;
        background: var(--zfp-surface);
        box-shadow: var(--zfp-shadow);
      }
      .legend {
        position: absolute;
        right: 10px;
        bottom: 10px;
        display: flex;
        gap: 10px;
        padding: 4px 10px;
        border-radius: 12px;
        background: color-mix(in srgb, var(--zfp-surface) 88%, transparent);
        backdrop-filter: blur(4px);
        font-size: 11px;
        color: var(--zfp-text-2);
        pointer-events: none;
      }
      .legend span {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .legend i {
        width: 10px;
        height: 10px;
        border-radius: 3px;
      }
      .msg {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        align-content: center;
        gap: 10px;
        text-align: center;
        padding: 24px;
        color: var(--zfp-text-2);
        font-size: 14px;
      }
      .sheet {
        position: absolute;
        top: 8px;
        right: 8px;
        bottom: 8px;
        width: min(320px, calc(100% - 16px));
        overflow-y: auto;
        padding: 16px;
        box-sizing: border-box;
        border-radius: 16px;
        background: var(--zfp-surface);
        box-shadow: var(--zfp-shadow-lg);
        animation: slide 0.2s var(--zfp-ease);
        z-index: 2;
      }
      @keyframes slide {
        from {
          transform: translateX(16px);
          opacity: 0;
        }
      }
      .spinner {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 3px solid var(--zfp-accent-soft);
        border-top-color: var(--zfp-accent);
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ];
}

if (!customElements.get("zigbee-floorplan-card")) customElements.define("zigbee-floorplan-card", ZigbeeFloorplanCard);
