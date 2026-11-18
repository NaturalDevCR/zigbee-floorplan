import { html, LitElement, nothing } from "lit";
import { FloorplanController } from "../data/controller";
import type { HomeAssistant } from "../data/hass";
import { translator, type I18nKey } from "../i18n";
import { DEFAULT_CARD_LAYERS, type CardConfig } from "./zfp-card";

/** Visual editor for the card, built on Home Assistant's `ha-form`. */
export class ZigbeeFloorplanCardEditor extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _tick: { state: true },
  };

  declare hass: HomeAssistant;
  declare _config: CardConfig;
  declare _tick: number;
  private detach?: () => void;
  private ctrl?: FloorplanController;

  constructor() {
    super();
    this._tick = 0;
  }

  setConfig(config: CardConfig): void {
    this._config = config;
  }

  protected willUpdate(): void {
    if (this.hass && !this.detach) {
      this.ctrl = FloorplanController.for(this.hass);
      this.detach = this.ctrl.attach(() => this._tick++);
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.detach?.();
    this.detach = undefined;
  }

  protected render() {
    if (!this.hass || !this._config) return nothing;
    const t = translator(this.hass.locale?.language ?? this.hass.language);
    const project = this.ctrl?.ready ? this.ctrl.project : null;
    const floors = project?.floors ?? [];
    const multi = (project?.buildings.length ?? 0) > 1;
    const floorLabel = (f: (typeof floors)[number]) =>
      multi ? `${project!.buildings.find((b) => b.id === f.buildingId)?.name ?? ""} · ${f.name}` : f.name;
    const layerOptions = (["heatmap", "links", "labels", "background", "suggestions"] as const).map((l) => ({
      value: l,
      label: t(`layers.${l}` as I18nKey),
    }));
    const schema = [
      { name: "title", selector: { text: {} } },
      {
        name: "building",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "", label: "—" },
              ...(multi ? [{ value: "site", label: t("site.all") }] : []),
              ...(project?.buildings ?? []).map((b) => ({ value: b.id, label: b.name })),
            ],
          },
        },
      },
      {
        name: "floor",
        selector: {
          select: {
            mode: "dropdown",
            options: [{ value: "", label: "—" }, ...floors.map((f) => ({ value: f.id, label: floorLabel(f) }))],
          },
        },
      },
      { name: "height", selector: { number: { min: 200, max: 1400, step: 10, mode: "box", unit_of_measurement: "px" } } },
      { name: "layers", selector: { select: { multiple: true, mode: "list", options: layerOptions } } },
      {
        name: "links",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "tree", label: t("links.tree") },
              { value: "all", label: t("links.all") },
            ],
          },
        },
      },
      { name: "show_floor_tabs", selector: { boolean: {} } },
    ];
    const labels: Record<string, I18nKey> = {
      title: "card.title",
      building: "card.building",
      floor: "card.floor",
      height: "card.height",
      layers: "card.layers",
      links: "card.links",
      show_floor_tabs: "card.show_tabs",
    };
    const data = {
      height: 420,
      layers: DEFAULT_CARD_LAYERS,
      links: "tree",
      show_floor_tabs: true,
      ...this._config,
      floor: this._config.floor ?? "",
      building: this._config.building ?? "",
    };
    return html`<ha-form
      .hass=${this.hass}
      .data=${data}
      .schema=${schema}
      .computeLabel=${(s: { name: string }) => t(labels[s.name])}
      @value-changed=${(e: CustomEvent<{ value: Record<string, unknown> }>) => {
        const value = { ...e.detail.value };
        if (!value.floor) delete value.floor;
        if (!value.title) delete value.title;
        if (!value.building) delete value.building;
        this._config = { ...(value as unknown as CardConfig), type: this._config.type };
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this._config }, bubbles: true, composed: true }));
      }}
    ></ha-form>`;
  }
}

if (!customElements.get("zigbee-floorplan-card-editor")) {
  customElements.define("zigbee-floorplan-card-editor", ZigbeeFloorplanCardEditor);
}
