import { css, html, LitElement, nothing, type PropertyValues, type TemplateResult } from "lit";
import "../canvas/zfp-canvas";
import { DEFAULT_LAYERS, type Layers, type SiteView, type ZfpCanvas } from "../canvas/zfp-canvas";
import { DEVICE_PREFIX, type ToolId } from "../canvas/tools";
import { prepareImage } from "../data/api";
import { FloorplanController, type Notice } from "../data/controller";
import type { HomeAssistant } from "../data/hass";
import { dist } from "../geometry";
import { relativeTime, translator, type I18nKey, type Translate } from "../i18n";
import { WALL_MATERIALS, materialDb } from "../materials";
import {
  addBuilding,
  addFloor,
  duplicateFloor,
  floorsAtLevel,
  floorsOf,
  getBuilding,
  getFloor,
  removeBuilding,
  removeFloor,
  siteLevels,
  updateBuilding,
  setBackground,
  unplaceDevice,
  updateFloor,
  updatePlacement,
  updateRoom,
  updateSettings,
  updateWalls,
} from "../project/ops";
import { RfClient } from "../rf/client";
import type { RfResult } from "../rf/engine";
import type { MaterialId, Project, Pt } from "../types";
import "../ui/device-detail";
import "../ui/dialog";
import type { ZfpDialog } from "../ui/dialog";
import {
  icon,
  mdiCheck,
  mdiChevronDown,
  mdiChevronRight,
  mdiCursorDefaultOutline,
  mdiDevices,
  mdiDotsVertical,
  mdiDownload,
  mdiFitToScreenOutline,
  mdiFloorPlan,
  mdiHandBackRightOutline,
  mdiLayersOutline,
  mdiMenu,
  mdiMinus,
  mdiPencilOutline,
  mdiPlus,
  mdiRadar,
  mdiRedo,
  mdiRuler,
  mdiRulerSquareCompass,
  mdiSignal,
  mdiStairs,
  mdiTuneVariant,
  mdiUndo,
  mdiUpload,
  mdiVectorPolygon,
  mdiWall,
  mdiEyeOutline,
  mdiEyeOffOutline,
  mdiMapOutline,
  mdiOfficeBuildingOutline,
  mdiAlertOutline,
  mdiSync,
} from "../ui/icons";
import { controls, tokens } from "../ui/styles";
import { isStaleBundle } from "../version";
import "../ui/toast";
import type { ZfpToast } from "../ui/toast";
import { paneStyles } from "./pane-styles";
import {
  renderBuildingsPane,
  renderCoveragePane,
  renderDevicesPane,
  renderFloorPane,
  renderInspector,
  type PaneContext,
} from "./panes";

type Tab = "inspector" | "devices" | "coverage" | "floor" | "buildings";
const GRID_SIZES = [0.05, 0.1, 0.25, 0.5];
const PREFS_KEY = "zigbee-floorplan:prefs";

interface Prefs {
  layers: Layers;
  linkMode: "tree" | "all";
  wallMaterial: MaterialId;
  wallThickness: number;
  gridSize: number;
  mode: "view" | "edit";
  view?: { site: boolean; buildingId: string | null; floorId: string | null; level: number };
}

function loadPrefs(): Partial<Prefs> {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function savePrefs(p: Prefs): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(p));
  } catch {
    /* storage unavailable */
  }
}

export class ZigbeeFloorplanPanel extends LitElement {
  static properties = {
    hass: { attribute: false },
    narrow: { type: Boolean },
    _floorId: { state: true },
    _mode: { state: true },
    _tool: { state: true },
    _layers: { state: true },
    _linkMode: { state: true },
    _selection: { state: true },
    _placing: { state: true },
    _tab: { state: true },
    _drawer: { state: true },
    _rf: { state: true },
    _imageUrls: { state: true },
    _site: { state: true },
    _buildingId: { state: true },
    _level: { state: true },
    _buildingMenu: { state: true },
    _wallMaterial: { state: true },
    _wallThickness: { state: true },
    _gridSize: { state: true },
    _highlight: { state: true },
    _search: { state: true },
    _menu: { state: true },
    _layersOpen: { state: true },
    _tick: { state: true },
  };

  declare hass: HomeAssistant;
  declare narrow: boolean;
  declare _floorId: string | null;
  declare _mode: "view" | "edit";
  declare _tool: ToolId;
  declare _layers: Layers;
  declare _linkMode: "tree" | "all";
  declare _selection: string[];
  declare _placing: string | null;
  declare _tab: Tab;
  declare _drawer: boolean;
  declare _rf: RfResult | null;
  declare _imageUrls: Record<string, string>;
  /** site view (all visible buildings) instead of one building's floor */
  declare _site: boolean;
  declare _buildingId: string | null;
  declare _level: number;
  declare _buildingMenu: boolean;
  declare _wallMaterial: MaterialId;
  declare _wallThickness: number;
  declare _gridSize: number;
  declare _highlight: string | null;
  declare _search: string;
  declare _menu: boolean;
  declare _layersOpen: boolean;
  declare _tick: number;

  private ctrl?: FloorplanController;
  private detach?: () => void;
  private unNotice?: () => void;
  private rfClient?: RfClient;
  private readonly imagesRequested = new Set<string>();
  private siteViewObj: SiteView | null = null;

  constructor() {
    super();
    const prefs = loadPrefs();
    this.narrow = false;
    this._floorId = prefs.view?.floorId ?? null;
    this._buildingId = prefs.view?.buildingId ?? null;
    this._site = prefs.view?.site ?? false;
    this._level = prefs.view?.level ?? 0;
    this._buildingMenu = false;
    this._mode = prefs.mode ?? "view";
    this._tool = "select";
    this._layers = { ...DEFAULT_LAYERS, ...prefs.layers };
    this._linkMode = prefs.linkMode ?? "tree";
    this._selection = [];
    this._placing = null;
    this._tab = "devices";
    this._drawer = true;
    this._rf = null;
    this._imageUrls = {};
    this._wallMaterial = prefs.wallMaterial ?? "brick";
    this._wallThickness = prefs.wallThickness ?? 0.15;
    this._gridSize = prefs.gridSize ?? 0.25;
    this._highlight = null;
    this._search = "";
    this._menu = false;
    this._layersOpen = false;
    this._tick = 0;
  }

  // ---------- wiring ----------

  private get t(): Translate {
    return translator(this.hass?.locale?.language ?? this.hass?.language);
  }

  private get project(): Project {
    return this.ctrl!.project;
  }

  private get canEdit(): boolean {
    return !!this.ctrl?.canEdit && this._mode === "edit";
  }

  connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("visibilitychange", this.onVisibility);
    window.addEventListener("connection-status", this.onConnectionStatus);
    if (this.hass) this.attachController();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.removeEventListener("keydown", this.onKeyDown);
    document.removeEventListener("visibilitychange", this.onVisibility);
    window.removeEventListener("connection-status", this.onConnectionStatus);
    void this.ctrl?.flush();
    this.detach?.();
    this.unNotice?.();
    this.detach = undefined;
    this.rfClient?.dispose();
    this.rfClient = undefined;
  }

  private attachController(): void {
    if (this.detach) return;
    this.ctrl = FloorplanController.for(this.hass);
    this.detach = this.ctrl.attach(() => this.onControllerChange());
    this.unNotice = this.ctrl.onNotice((n) => this.onNotice(n));
    this.rfClient = new RfClient((r) => (this._rf = r));
    this.onControllerChange();
  }

  protected firstUpdated(): void {
    // start with the plan unobstructed where the drawer would float over it
    if (!this.narrow && this.getBoundingClientRect().width < 1100) this._drawer = false;
  }

  protected willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("hass") && this.hass) {
      if (!this.detach) this.attachController();
      else this.ctrl?.setHass(this.hass);
    }
    if (changed.has("narrow") && this.narrow && !changed.get("narrow")) this._drawer = false;
  }

  private onControllerChange(): void {
    const ctrl = this.ctrl!;
    const p = ctrl.project;
    // validate the remembered view only once the real project is loaded, or it would be reset
    if (ctrl.ready) {
      if (!p.buildings.find((b) => b.id === this._buildingId)) {
        this._buildingId = getFloor(p, this._floorId)?.buildingId ?? p.buildings[0]?.id ?? null;
      }
      const own = floorsOf(p, this._buildingId);
      if (!own.find((f) => f.id === this._floorId)) this._floorId = own[0]?.id ?? null;
      if (this._site) {
        const levels = siteLevels(p);
        if (!p.buildings.length) this._site = false;
        else if (levels.length && !levels.includes(this._level)) this._level = levels[0];
      }
    }
    // only downgrade once permissions are known, so a remembered Edit mode survives loading
    if (ctrl.info && !ctrl.info.is_admin && this._mode === "edit") this._mode = "view";
    const valid = new Set([
      ...(getFloor(ctrl.project, this._floorId)?.walls.map((w) => w.id) ?? []),
      ...(getFloor(ctrl.project, this._floorId)?.rooms.map((r) => r.id) ?? []),
      ...Object.keys(ctrl.project.placements).map((i) => DEVICE_PREFIX + i),
    ]);
    if (this._selection.some((s) => !valid.has(s))) this._selection = this._selection.filter((s) => valid.has(s));
    this.requestRf();
    void this.resolveImages();
    this._tick++;
  }

  /** Floors drawn right now: the selected floor, or one per visible building in site view. */
  private displayedFloorIds(): string[] {
    if (!this.ctrl?.ready) return [];
    if (this._site) return floorsAtLevel(this.project, this._level).map((f) => f.id);
    return this._floorId ? [this._floorId] : [];
  }

  private get siteView(): SiteView | null {
    if (!this._site) return (this.siteViewObj = null);
    // stable identity: the canvas keeps a viewport per view and compares by reference
    if (this.siteViewObj?.level !== this._level) this.siteViewObj = { level: this._level };
    return this.siteViewObj;
  }

  private requestRf(): void {
    const ctrl = this.ctrl;
    const floorIds = this.displayedFloorIds();
    if (!ctrl?.ready || !floorIds.length || !this.rfClient) return;
    const network = ctrl.network;
    this.rfClient.request({
      project: ctrl.project,
      devices: (network?.devices ?? []).map((d) => ({ ieee: d.ieee, type: d.type })),
      links: network?.links ?? [],
      floorIds,
      suggest: true,
    });
  }

  private async resolveImages(): Promise<void> {
    for (const id of this.displayedFloorIds()) {
      const imageId = getFloor(this.project, id)?.background?.imageId;
      if (!imageId || this.imagesRequested.has(imageId)) continue;
      this.imagesRequested.add(imageId);
      try {
        const url = await this.ctrl!.api.imageUrl(imageId);
        this._imageUrls = { ...this._imageUrls, [imageId]: url };
      } catch {
        this.imagesRequested.delete(imageId);
      }
    }
  }

  private onNotice(n: Notice): void {
    const t = this.t;
    const toast = this.toast;
    if (!toast) return;
    if (n.kind === "conflict") toast.show(t("notice.conflict"));
    else if (n.kind === "remote_update") toast.show(t("notice.remote_update"));
    else if (n.kind === "save_error") toast.show(t("notice.save_error", { message: n.message }), "error");
    else if (n.kind === "scan_error") toast.show(t("notice.scan_error", { message: n.message }), "error");
  }

  private onVisibility = (): void => {
    if (document.visibilityState === "hidden") void this.ctrl?.flush();
    else void this.ctrl?.refreshInfo();
  };

  /** HA reconnects after a restart without reloading the page; re-check the served bundle. */
  private onConnectionStatus = (ev: Event): void => {
    if ((ev as CustomEvent<string>).detail === "connected") void this.ctrl?.refreshInfo();
  };

  private renderUpdateBar(): TemplateResult | typeof nothing {
    if (!isStaleBundle(this.ctrl?.info?.frontend_hash)) return nothing;
    return html`<div class="update-bar" role="status">
      ${icon(mdiSync, 18)}<span>${this.t("banner.update")}</span>
      <button class="btn small primary" @click=${() => location.reload()}>${this.t("action.reload")}</button>
    </div>`;
  }

  private get toast(): ZfpToast | null {
    return this.renderRoot.querySelector("zfp-toast");
  }

  private get dialog(): ZfpDialog {
    return this.renderRoot.querySelector("zfp-dialog")!;
  }

  private get canvas(): ZfpCanvas | null {
    return this.renderRoot.querySelector("zfp-canvas");
  }

  private persistPrefs(): void {
    savePrefs({
      layers: this._layers,
      linkMode: this._linkMode,
      wallMaterial: this._wallMaterial,
      wallThickness: this._wallThickness,
      gridSize: this._gridSize,
      mode: this._mode,
      view: { site: this._site, buildingId: this._buildingId, floorId: this._floorId, level: this._level },
    });
  }

  // ---------- actions ----------

  private edit = (fn: (p: Project) => Project): void => {
    this.ctrl?.apply(fn);
  };

  private setFloor(id: string): void {
    const floor = getFloor(this.project, id);
    if (!floor || (id === this._floorId && !this._site)) return;
    this._floorId = id;
    this._buildingId = floor.buildingId;
    this._site = false;
    this._selection = [];
    this._placing = null;
    if (this._tool === "calibrate" || this._tool === "image") this._tool = "select";
    if (this._tab === "buildings") this._tab = "floor";
    this.afterViewChange();
  }

  private setBuilding(id: string): void {
    this._buildingMenu = false;
    const floor = floorsOf(this.project, id).find((f) => f.level === getFloor(this.project, this._floorId)?.level) ??
      floorsOf(this.project, id)[0];
    this._buildingId = id;
    if (floor) this.setFloor(floor.id);
    else {
      this._site = false;
      this._floorId = null;
      this.afterViewChange();
    }
  }

  private setSite(level?: number): void {
    this._buildingMenu = false;
    const levels = siteLevels(this.project);
    const wanted = level ?? getFloor(this.project, this._floorId)?.level ?? this._level;
    this._level = levels.includes(wanted) ? wanted : (levels[0] ?? 0);
    this._site = true;
    this._selection = [];
    this._placing = null;
    this._tool = "select";
    if (this._tab === "floor") this._tab = "buildings";
    this.afterViewChange();
  }

  private afterViewChange(): void {
    this.persistPrefs();
    this.requestRf();
    void this.resolveImages();
  }

  private async addBuilding(): Promise<void> {
    this._buildingMenu = false;
    const t = this.t;
    const n = this.project.buildings.length + 1;
    let floorId = "";
    this.edit((p) => {
      const b = addBuilding(p, t("building.default_name", { n }));
      const f = addFloor(b.project, t("floor.ground"), b.buildingId);
      floorId = f.floorId;
      return f.project;
    });
    if (floorId) this.startDrawing(floorId);
  }

  private startDrawing(floorId: string): void {
    this.setFloor(floorId);
    this._mode = "edit";
    this._tool = "wall";
    this._tab = "floor";
    this._drawer = !this.narrow;
    this.persistPrefs();
  }

  private async deleteBuilding(id: string): Promise<void> {
    const b = getBuilding(this.project, id);
    if (!b) return;
    const t = this.t;
    const ok = await this.dialog.confirm({
      title: t("action.delete"),
      message: t("building.delete_confirm", { name: b.name }),
      confirmText: t("action.delete"),
      cancelText: t("action.cancel"),
      danger: true,
    });
    if (ok) this.edit((p) => removeBuilding(p, id));
  }

  private setMode(mode: "view" | "edit"): void {
    this._mode = mode;
    this.persistPrefs();
    this._placing = null;
    this._tool = "select";
    if (mode === "view" && (this._tab === "floor" || this._tab === "inspector") && !this.selectedDevice()) this._tab = "devices";
  }

  private setTool(tool: ToolId): void {
    this._tool = tool;
    this._placing = null;
  }

  private selectedDevice(): string | null {
    const d = this._selection.find((s) => s.startsWith(DEVICE_PREFIX));
    return d ? d.slice(DEVICE_PREFIX.length) : null;
  }

  private async addFloor(): Promise<void> {
    const t = this.t;
    if (!this.project.buildings.length) {
      await this.addBuilding();
      return;
    }
    const buildingId = this._buildingId ?? this.project.buildings[0].id;
    const n = floorsOf(this.project, buildingId).length;
    const name = n === 0 ? t("floor.ground") : t("floor.default_name", { n });
    let id = "";
    this.edit((p) => {
      const res = addFloor(p, name, buildingId);
      id = res.floorId;
      return res.project;
    });
    if (id) this.startDrawing(id);
  }

  private async deleteFloor(): Promise<void> {
    const floor = getFloor(this.project, this._floorId);
    if (!floor) return;
    const t = this.t;
    const ok = await this.dialog.confirm({
      title: t("action.delete"),
      message: t("floor.delete_confirm", { name: floor.name }),
      confirmText: t("action.delete"),
      cancelText: t("action.cancel"),
      danger: true,
    });
    if (ok) this.edit((p) => removeFloor(p, floor.id));
  }

  private duplicateFloor(): void {
    if (!this._floorId) return;
    let id = "";
    this.edit((p) => {
      const res = duplicateFloor(p, this._floorId!);
      id = res.floorId;
      return res.project;
    });
    if (id) this.setFloor(id);
  }

  private async scan(): Promise<void> {
    await this.ctrl?.scan();
    if (this.ctrl?.network?.scan.status === "scanning") this.toast?.show(this.t("notice.scan_started"));
  }

  private uploadImage(): void {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg,image/webp";
    input.onchange = async () => {
      const file = input.files?.[0];
      const floor = getFloor(this.project, this._floorId);
      if (!file || !floor) return;
      try {
        const img = await prepareImage(file);
        const imageId = await this.ctrl!.api.uploadImage(img.blob, img.name);
        const existing = floor.background;
        const scale = existing ? (existing.width * existing.scale) / img.width : 15 / img.width;
        this.edit((p) =>
          setBackground(p, floor.id, {
            imageId,
            width: img.width,
            height: img.height,
            x: existing?.x ?? 0,
            y: existing?.y ?? 0,
            scale,
            rotation: 0,
            opacity: existing?.opacity ?? 0.55,
            visible: true,
          }),
        );
        this._layers = { ...this._layers, background: true };
        this.setTool("calibrate");
        await this.updateComplete;
        this.canvas?.fit();
      } catch (err) {
        this.toast?.show(this.t("notice.upload_error", { message: String((err as Error).message ?? err) }), "error");
      }
    };
    input.click();
  }

  private async onCalibrate(e: CustomEvent<{ a: Pt; b: Pt }>): Promise<void> {
    const floor = getFloor(this.project, this._floorId);
    const bg = floor?.background;
    if (!floor || !bg) return;
    const t = this.t;
    const { a, b } = e.detail;
    const measured = dist(a, b);
    const value = await this.dialog.prompt({
      title: t("action.calibrate_image"),
      label: t("calibrate.prompt"),
      value: measured.toFixed(2),
      type: "number",
      min: 0.01,
      confirmText: t("action.ok"),
      cancelText: t("action.cancel"),
    });
    const real = value ? parseFloat(value) : NaN;
    if (!(real > 0)) return;
    const k = real / measured;
    this.edit((p) =>
      setBackground(p, floor.id, {
        ...bg,
        scale: bg.scale * k,
        x: a.x - (a.x - bg.x) * k,
        y: a.y - (a.y - bg.y) * k,
      }),
    );
    this.setTool("select");
    await this.updateComplete;
    this.canvas?.fit();
  }

  private exportPlan(): void {
    const blob = new Blob([JSON.stringify({ type: "zigbee-floorplan", ...this.project }, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "zigbee-floorplan.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    this._menu = false;
  }

  private importPlan(): void {
    this._menu = false;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const t = this.t;
      try {
        const data = JSON.parse(await file.text());
        if (!data || !Array.isArray(data.floors)) throw new Error("invalid");
        const ok = await this.dialog.confirm({
          title: t("action.import"),
          message: t("import.confirm"),
          confirmText: t("action.ok"),
          cancelText: t("action.cancel"),
        });
        if (ok) this.ctrl?.replace(data);
      } catch {
        this.toast?.show(t("import.error"), "error");
      }
    };
    input.click();
  }

  private isDisplayed(ieee: string): boolean {
    const pl = this.project.placements[ieee];
    return !!pl && this.displayedFloorIds().includes(pl.floorId);
  }

  private openDevice(ieee: string): void {
    const pl = this.project.placements[ieee];
    if (pl && !this.isDisplayed(ieee)) this.setFloor(pl.floorId);
    this._selection = [DEVICE_PREFIX + ieee];
    this._tab = "inspector";
    this._drawer = true;
  }

  private locate(ieee: string): void {
    const pl = this.project.placements[ieee];
    if (!pl) return;
    if (!this.isDisplayed(ieee)) this.setFloor(pl.floorId);
    this._highlight = ieee;
    this.updateComplete.then(() => this.canvas?.centerOnDevice(ieee));
    setTimeout(() => {
      if (this._highlight === ieee) this._highlight = null;
    }, 2400);
  }

  private openInHa(id: string): void {
    history.pushState(null, "", `/config/devices/device/${id}`);
    window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
  }

  // ---------- keyboard ----------

  private onKeyDown = (ev: KeyboardEvent): void => {
    if (!this.isConnected || !this.offsetParent) return;
    const path = ev.composedPath();
    if (path.some((el) => el instanceof HTMLElement && /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName))) return;
    if (path.some((el) => el instanceof HTMLElement && el.tagName === "DIALOG")) return;
    const mod = ev.ctrlKey || ev.metaKey;
    const key = ev.key.toLowerCase();
    const editing = this.canEdit;

    if (mod && key === "z" && editing) {
      ev.preventDefault();
      if (ev.shiftKey) this.ctrl?.redo();
      else this.ctrl?.undo();
      return;
    }
    if (mod && key === "y" && editing) {
      ev.preventDefault();
      this.ctrl?.redo();
      return;
    }
    if (this.canvas?.handleKey(ev)) {
      ev.preventDefault();
      return;
    }
    if (mod || ev.altKey) return;
    const tools: Record<string, ToolId> = { v: "select", w: "wall", r: "room", m: "measure", h: "pan", c: "calibrate" };
    if (editing && tools[key]) {
      if (key === "c" && !getFloor(this.project, this._floorId)?.background) return;
      this.setTool(tools[key]);
      return;
    }
    if (key === "f") this.canvas?.fit();
    else if (key === "+" || key === "=") this.canvas?.zoomBy(1.25);
    else if (key === "-") this.canvas?.zoomBy(0.8);
    else if (key === "escape" && this._tool !== "select" && editing) this.setTool("select");
  };

  // ---------- render ----------

  protected render() {
    const ctrl = this.ctrl;
    const t = this.t;
    if (!ctrl || (!ctrl.ready && !ctrl.loadError)) {
      return html`<div class="app">${this.renderHeader()}<div class="loading"><div class="spinner"></div></div></div>`;
    }
    if (ctrl.loadError) {
      return html`<div class="app">${this.renderHeader()}
        <div class="center-msg">${icon(mdiAlertOutline, 40)}<p>${t("banner.not_loaded")}</p><p class="muted">${ctrl.loadError}</p></div></div>`;
    }
    const floor = getFloor(this.project, this._floorId);
    const hasView = this._site ? this.project.buildings.length > 0 : !!floor;
    const railed = this.canEdit && !!floor && !this._site;
    const showDrawer = this._drawer && hasView;
    return html`
      <div class="app ${this.narrow ? "narrow" : ""}">
        ${this.renderHeader()}
        ${this.renderUpdateBar()}
        <div class="body ${showDrawer ? "with-drawer" : ""} ${railed ? "editing" : ""}">
          ${railed ? this.renderRail() : nothing}
          <main class="stage">
            ${hasView ? this.renderCanvas() : this.renderEmpty()}
            ${hasView ? this.renderOverlays() : nothing}
          </main>
          ${showDrawer ? this.renderDrawer() : nothing}
        </div>
        <zfp-toast></zfp-toast>
        <zfp-dialog></zfp-dialog>
      </div>
    `;
  }

  private renderHeader(): TemplateResult {
    const t = this.t;
    const ctrl = this.ctrl;
    const ready = !!ctrl?.ready;
    const floors = ready ? floorsOf(this.project, this._buildingId) : [];
    const anyFloor = ready && this.project.floors.length > 0;
    const scan = ctrl?.network?.scan;
    const scanning = scan?.status === "scanning";
    const isAdmin = !!ctrl?.info?.is_admin;
    return html`<header class="topbar">
      ${this.narrow
        ? html`<button class="icon-btn on-header" aria-label=${t("action.menu")}
            @click=${() => this.dispatchEvent(new Event("hass-toggle-menu", { bubbles: true, composed: true }))}>
            ${icon(mdiMenu)}</button>`
        : nothing}
      <div class="brand">${icon(mdiFloorPlan, 22)}<span>${t("app.title")}</span></div>
      ${ready && this.project.buildings.length ? this.renderBuildingSwitcher() : nothing}
      <nav class="floors" role="tablist">
        ${this._site
          ? siteLevels(this.project).map(
              (level) => html`<button role="tab" class="floor-tab ${level === this._level ? "active" : ""}"
                aria-selected=${level === this._level} @click=${() => this.setSite(level)}>
                ${icon(mdiStairs, 16)}<span>${t("site.level", { n: level })}</span></button>`,
            )
          : floors.map(
          (f) => html`<button role="tab" class="floor-tab ${f.id === this._floorId && !this._site ? "active" : ""}"
            aria-selected=${f.id === this._floorId}
            @click=${() => this.setFloor(f.id)}
            @dblclick=${() => {
              if (this.canEdit) {
                this._tab = "floor";
                this._drawer = true;
              }
            }}>
            ${icon(mdiStairs, 16)}<span>${f.name}</span></button>`,
        )}
        ${!this._site && ready && (this.canEdit || (isAdmin && !anyFloor))
          ? html`<button class="floor-tab add" @click=${() => this.addFloor()} title=${t("action.add_floor")}>
              ${icon(mdiPlus, 16)}${floors.length ? nothing : html`<span>${t("action.add_floor")}</span>`}</button>`
          : nothing}
      </nav>
      <div class="spacer"></div>
      ${ctrl?.ready ? this.renderSaveState() : nothing}
      ${ctrl?.ready && isAdmin
        ? html`<button class="btn header-btn ${scanning ? "busy" : ""}" ?disabled=${scanning} @click=${() => this.scan()}
            title=${scan?.last_scan ? t("scan.last", { time: relativeTime(t, scan.last_scan) ?? "" }) : t("scan.never")}>
            <span class=${scanning ? "spin" : ""}>${icon(scanning ? mdiSync : mdiRadar, 18)}</span>
            <span class="label">${scanning ? t("action.scanning") : t("action.scan")}</span></button>`
        : nothing}
      ${ctrl?.ready && isAdmin && anyFloor
        ? html`<div class="segmented on-header" role="radiogroup">
            <button class=${this._mode === "view" ? "active" : ""} @click=${() => this.setMode("view")}>
              ${icon(mdiEyeOutline, 16)}<span class="label">${t("mode.view")}</span></button>
            <button class=${this._mode === "edit" ? "active" : ""} @click=${() => this.setMode("edit")}>
              ${icon(mdiPencilOutline, 16)}<span class="label">${t("mode.edit")}</span></button>
          </div>`
        : nothing}
      ${ctrl?.ready
        ? html`<div class="menu-wrap">
            <button class="icon-btn on-header" aria-label=${t("action.more")} @click=${() => (this._menu = !this._menu)}>
              ${icon(mdiDotsVertical)}</button>
            ${this._menu
              ? html`<div class="scrim" @click=${() => (this._menu = false)}></div>
                  <div class="menu" role="menu">
                    <button role="menuitem" @click=${() => this.exportPlan()}>${icon(mdiDownload, 18)} ${t("action.export")}</button>
                    ${isAdmin ? html`<button role="menuitem" @click=${() => this.importPlan()}>${icon(mdiUpload, 18)} ${t("action.import")}</button>` : nothing}
                  </div>`
              : nothing}
          </div>`
        : nothing}
    </header>`;
  }

  private renderBuildingSwitcher(): TemplateResult {
    const t = this.t;
    const p = this.project;
    const current = getBuilding(p, this._buildingId);
    const multi = p.buildings.length > 1;
    const label = this._site ? t("site.all") : (current?.name ?? "");
    return html`<div class="menu-wrap building-switch">
      <button class="building-btn on-header" @click=${() => (this._buildingMenu = !this._buildingMenu)}
        aria-haspopup="menu" aria-expanded=${this._buildingMenu}>
        ${this._site
          ? icon(mdiMapOutline, 18)
          : html`<span class="b-dot" style="background:${current?.color ?? "currentColor"}"></span>`}
        <span class="label">${label}</span>${icon(mdiChevronDown, 16)}
      </button>
      ${this._buildingMenu
        ? html`<div class="scrim" @click=${() => (this._buildingMenu = false)}></div>
            <div class="menu building-menu" role="menu">
              ${multi
                ? html`<button role="menuitem" class=${this._site ? "current" : ""} @click=${() => this.setSite()}>
                    ${icon(mdiMapOutline, 18)}<span class="grow">${t("site.all")}</span>
                    ${this._site ? icon(mdiCheck, 16) : nothing}</button>
                    <div class="menu-sep"></div>`
                : nothing}
              ${p.buildings.map(
                (b) => html`<div class="menu-row ${!this._site && b.id === this._buildingId ? "current" : ""}">
                  <button role="menuitem" class="grow-btn" @click=${() => this.setBuilding(b.id)}>
                    <span class="b-dot" style="background:${b.color}"></span>
                    <span class="grow">${b.name}</span>
                    <span class="muted small">${floorsOf(p, b.id).length}</span>
                  </button>
                  ${multi
                    ? html`<button class="icon-btn" ?disabled=${!this.ctrl?.canEdit}
                        title=${b.visible ? t("site.hide") : t("site.show")}
                        @click=${() => this.edit((pr) => updateBuilding(pr, b.id, { visible: !b.visible }))}>
                        ${icon(b.visible ? mdiEyeOutline : mdiEyeOffOutline, 18)}</button>`
                    : nothing}
                </div>`,
              )}
              ${this.ctrl?.canEdit
                ? html`<div class="menu-sep"></div>
                    <button role="menuitem" @click=${() => this.addBuilding()}>
                      ${icon(mdiPlus, 18)}<span class="grow">${t("building.add")}</span></button>`
                : nothing}
            </div>`
        : nothing}
    </div>`;
  }

  private renderSaveState(): TemplateResult | typeof nothing {
    const ctrl = this.ctrl!;
    const t = this.t;
    if (!ctrl.info?.is_admin) return html`<span class="chip on-header">${icon(mdiEyeOutline, 14)} ${t("save.readonly")}</span>`;
    if (this._mode !== "edit") return nothing;
    const map: Record<string, [I18nKey, string]> = {
      idle: ["save.saved", "ok"],
      saved: ["save.saved", "ok"],
      dirty: ["save.dirty", ""],
      saving: ["save.saving", ""],
      error: ["save.error", "bad"],
      conflict: ["save.conflict", "warn"],
    };
    const [key, cls] = map[ctrl.saveState];
    return html`<span class="save-state ${cls}">${t(key)}</span>`;
  }

  private renderRail(): TemplateResult {
    const t = this.t;
    const floor = getFloor(this.project, this._floorId);
    const tool = (id: ToolId, path: string, key: I18nKey, shortcut: string, disabled = false) =>
      html`<button class="icon-btn ${this._tool === id && !this._placing ? "active" : ""}" ?disabled=${disabled}
        title="${t(key)} (${shortcut})" aria-label=${t(key)} @click=${() => this.setTool(id)}>${icon(path)}</button>`;
    return html`<aside class="rail">
      ${tool("select", mdiCursorDefaultOutline, "tool.select", "V")}
      ${tool("wall", mdiWall, "tool.wall", "W")}
      ${tool("room", mdiVectorPolygon, "tool.room", "R")}
      ${tool("measure", mdiRuler, "tool.measure", "M")}
      ${tool("calibrate", mdiRulerSquareCompass, "tool.calibrate", "C", !floor?.background)}
      ${tool("pan", mdiHandBackRightOutline, "tool.pan", "H")}
      <span class="rail-sep"></span>
      <button class="icon-btn" ?disabled=${!this.ctrl?.canUndo} title="${t("action.undo")} (Ctrl+Z)" @click=${() => this.ctrl?.undo()}>${icon(mdiUndo)}</button>
      <button class="icon-btn" ?disabled=${!this.ctrl?.canRedo} title="${t("action.redo")} (Ctrl+Shift+Z)" @click=${() => this.ctrl?.redo()}>${icon(mdiRedo)}</button>
    </aside>`;
  }

  private renderCanvas(): TemplateResult {
    return html`<zfp-canvas
      .project=${this.project}
      .floorId=${this._floorId}
      .network=${this.ctrl!.network}
      .rf=${this._rf}
      .editable=${this.canEdit}
      .tool=${this._tool}
      .layers=${this._layers}
      .linkMode=${this._linkMode}
      .selection=${this._selection}
      .placing=${this._placing}
      .imageUrls=${this._imageUrls}
      .site=${this.siteView}
      .t=${this.t}
      .wallMaterial=${this._wallMaterial}
      .wallThickness=${this._wallThickness}
      .gridSize=${this._gridSize}
      .highlight=${this._highlight}
      .editHint=${!!this.ctrl?.canEdit && this._mode === "view"}
      @zfp-edit-hint=${() => this.toast?.show(this.t("hint.switch_to_edit"))}
      @zfp-commit=${(e: CustomEvent<{ fn: (p: Project) => Project }>) => this.edit(e.detail.fn)}
      @zfp-select=${(e: CustomEvent<{ ids: string[] }>) => {
        this._selection = e.detail.ids;
        if (e.detail.ids.length && this.canEdit) this._tab = "inspector";
      }}
      @zfp-device-click=${(e: CustomEvent<{ ieee: string }>) => this.openDevice(e.detail.ieee)}
      @zfp-placed=${() => (this._placing = null)}
      @zfp-calibrate=${this.onCalibrate}
      @zfp-open-building=${(e: CustomEvent<{ id: string }>) => this.setBuilding(e.detail.id)}
    ></zfp-canvas>`;
  }

  private renderOverlays(): TemplateResult {
    const t = this.t;
    const ctrl = this.ctrl!;
    const net = ctrl.network;
    const banners: TemplateResult[] = [];
    if (net === null || (!net.devices.length && net.bridge_online === null)) {
      banners.push(html`<div class="banner warn">${icon(mdiAlertOutline, 18)} ${t("banner.no_data", { topic: ctrl.info?.base_topic ?? "zigbee2mqtt" })}</div>`);
    } else if (net.bridge_online === false) {
      banners.push(html`<div class="banner bad">${icon(mdiAlertOutline, 18)} ${t("banner.bridge_offline")}</div>`);
    } else if (!net.links.length && net.scan.status !== "scanning" && ctrl.info?.is_admin && net.devices.length) {
      banners.push(html`<div class="banner">${icon(mdiRadar, 18)} ${t("banner.scan_hint")}
        <button class="btn small primary" @click=${() => this.scan()}>${t("action.scan")}</button></div>`);
    }
    const hint = this._placing
      ? t("hint.place", { name: net?.devices.find((d) => d.ieee === this._placing)?.name ?? "" })
      : this.canEdit
        ? this._site
          ? t("hint.site")
          : t(`hint.${this._tool === "image" ? "pan" : this._tool}` as I18nKey)
        : null;
    return html`
      <div class="top-left">
        <button class="fab ${this._layersOpen ? "active" : ""}" @click=${() => (this._layersOpen = !this._layersOpen)}>
          ${icon(mdiLayersOutline, 18)}<span>${t("layers.title")}</span></button>
        ${this._layersOpen ? this.renderLayers() : nothing}
        ${this.canEdit && !this._site && (this._tool === "wall" || this._tool === "room" || this._tool === "select")
          ? this.renderToolOptions()
          : nothing}
      </div>
      <div class="banners">${banners}</div>
      <div class="zoom">
        <button class="icon-btn" title=${t("action.zoom_in")} @click=${() => this.canvas?.zoomBy(1.3)}>${icon(mdiPlus)}</button>
        <button class="icon-btn" title=${t("action.zoom_out")} @click=${() => this.canvas?.zoomBy(1 / 1.3)}>${icon(mdiMinus)}</button>
        <button class="icon-btn" title="${t("action.fit")} (F)" @click=${() => this.canvas?.fit()}>${icon(mdiFitToScreenOutline)}</button>
      </div>
      ${!this._drawer
        ? html`<button class="fab drawer-toggle" @click=${() => (this._drawer = true)}>
            ${icon(mdiDevices, 18)}<span>${t("tab.devices")}</span></button>`
        : nothing}
      ${hint && !this.narrow ? html`<div class="hint-pill">${hint}</div>` : nothing}
    `;
  }

  private renderLayers(): TemplateResult {
    const t = this.t;
    const toggle = (key: keyof Layers, label: I18nKey) =>
      html`<label class="layer-row"><span>${t(label)}</span>
        <input type="checkbox" .checked=${this._layers[key]} @change=${(e: Event) => {
          this._layers = { ...this._layers, [key]: (e.target as HTMLInputElement).checked };
          this.persistPrefs();
        }} /></label>`;
    return html`<div class="popover">
      ${toggle("heatmap", "layers.heatmap")}
      ${toggle("links", "layers.links")}
      ${toggle("labels", "layers.labels")}
      ${toggle("suggestions", "layers.suggestions")}
      ${toggle("background", "layers.background")}
      <div class="segmented full">
        <button class=${this._linkMode === "tree" ? "active" : ""} @click=${() => {
          this._linkMode = "tree";
          this.persistPrefs();
        }}>${t("links.tree")}</button>
        <button class=${this._linkMode === "all" ? "active" : ""} @click=${() => {
          this._linkMode = "all";
          this.persistPrefs();
        }}>${t("links.all")}</button>
      </div>
    </div>`;
  }

  private renderToolOptions(): TemplateResult {
    const t = this.t;
    const settings = this.project.settings;
    return html`<div class="tool-options">
      ${this._tool === "wall"
        ? html`<select title=${t("inspector.material")} @change=${(e: Event) => {
              this._wallMaterial = (e.target as HTMLSelectElement).value as MaterialId;
              this.persistPrefs();
            }}>
              ${WALL_MATERIALS.map((m) => html`<option value=${m.id} ?selected=${m.id === this._wallMaterial}>
                ${t(`material.${m.id}` as I18nKey)} · ${materialDb(settings, m.id)} dB</option>`)}
            </select>
            <select title=${t("inspector.thickness")} @change=${(e: Event) => {
              this._wallThickness = parseFloat((e.target as HTMLSelectElement).value);
              this.persistPrefs();
            }}>
              ${[0.08, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4].map((v) => html`<option value=${v} ?selected=${v === this._wallThickness}>${v * 100} cm</option>`)}
            </select>`
        : nothing}
      <select title="Grid" @change=${(e: Event) => {
        this._gridSize = parseFloat((e.target as HTMLSelectElement).value);
        this.persistPrefs();
      }}>
        ${GRID_SIZES.map((g) => html`<option value=${g} ?selected=${g === this._gridSize}># ${g * 100} cm</option>`)}
      </select>
    </div>`;
  }

  private renderEmpty(): TemplateResult {
    const t = this.t;
    const admin = !!this.ctrl?.info?.is_admin;
    return html`<div class="empty">
      <div class="empty-card">
        <div class="empty-art">${icon(mdiFloorPlan, 56)}</div>
        <h2>${t("empty.title")}</h2>
        <p>${admin ? t("empty.body") : t("empty.readonly")}</p>
        ${admin
          ? html`<button class="btn primary big" @click=${() => this.addFloor()}>${icon(mdiPlus, 18)}
              ${this.project.buildings.length ? t("action.add_floor") : t("empty.cta")}</button>`
          : nothing}
      </div>
    </div>`;
  }

  private paneContext(): PaneContext {
    const floor = getFloor(this.project, this._floorId);
    const fid = this._floorId!;
    return {
      t: this.t,
      project: this.project,
      floor,
      network: this.ctrl!.network,
      rf: this._rf,
      selection: this._selection,
      canEdit: this.canEdit,
      canSwitchToEdit: !!this.ctrl?.canEdit && this._mode === "view",
      site: this._site,
      displayedFloorIds: this.displayedFloorIds(),
      building: getBuilding(this.project, floor?.buildingId ?? this._buildingId),
      editBuilding: (id, patch) => this.edit((p) => updateBuilding(p, id, patch)),
      deleteBuilding: (id) => void this.deleteBuilding(id),
      openBuilding: (id) => this.setBuilding(id),
      addBuilding: () => void this.addBuilding(),
      search: this._search,
      activeTool: this._tool,
      edit: this.edit,
      editWalls: (ids, patch) => this.edit((p) => updateWalls(p, fid, ids, patch)),
      editRoom: (id, patch) => this.edit((p) => updateRoom(p, fid, id, patch)),
      editPlacement: (ieee, patch) => this.edit((p) => updatePlacement(p, ieee, patch)),
      editFloor: (patch) => this.edit((p) => updateFloor(p, fid, patch)),
      editSettings: (patch) => this.edit((p) => updateSettings(p, patch)),
      setSearch: (v) => (this._search = v),
      openDevice: (ieee) => this.openDevice(ieee),
      startPlacing: (ieee) => {
        this._placing = ieee;
        if (this.narrow) this._drawer = false;
      },
      unplace: (ieee) => this.edit((p) => unplaceDevice(p, ieee)),
      highlight: (ieee) => (this._highlight = ieee),
      locateSuggestion: (i) => {
        const shown = this.displayedFloorIds();
        const s = (this._rf?.suggestions ?? []).filter((x) => shown.includes(x.floorId))[i];
        if (s) this.canvas?.centerOnSite(s.pos);
      },
      uploadImage: () => this.uploadImage(),
      removeImage: () => this.edit((p) => setBackground(p, fid, undefined)),
      setTool: (tool) => this.setTool(tool),
      deleteFloor: () => void this.deleteFloor(),
      duplicateFloor: () => this.duplicateFloor(),
    };
  }

  private renderDrawer(): TemplateResult {
    const t = this.t;
    const ctx = this.paneContext();
    const tabs: [Tab, I18nKey, string][] = [
      ["inspector", "tab.inspector", mdiTuneVariant],
      ["devices", "tab.devices", mdiDevices],
      ["coverage", "tab.coverage", mdiSignal],
    ];
    if (this._site) tabs.push(["buildings", "tab.buildings", mdiOfficeBuildingOutline]);
    else if (this.canEdit) tabs.push(["floor", "tab.floor", mdiStairs]);
    const tab = tabs.some(([id]) => id === this._tab) ? this._tab : "devices";
    return html`<aside class="drawer"
      @zfp-locate=${(e: CustomEvent<{ ieee: string }>) => this.locate(e.detail.ieee)}
      @zfp-place=${(e: CustomEvent<{ ieee: string }>) => (this._placing = e.detail.ieee)}
      @zfp-unplace=${(e: CustomEvent<{ ieee: string }>) => {
        this.edit((p) => unplaceDevice(p, e.detail.ieee));
        this._selection = [];
      }}
      @zfp-open-ha=${(e: CustomEvent<{ id: string }>) => this.openInHa(e.detail.id)}
      @zfp-open-device=${(e: CustomEvent<{ ieee: string }>) => this.openDevice(e.detail.ieee)}
      @zfp-highlight=${(e: CustomEvent<{ ieee: string | null }>) => (this._highlight = e.detail.ieee)}>
      <div class="drawer-tabs" role="tablist">
        ${tabs.map(([id, key, path]) => html`<button role="tab" class=${tab === id ? "active" : ""} aria-selected=${tab === id}
          @click=${() => (this._tab = id)}>${icon(path, 18)}<span>${t(key)}</span></button>`)}
        <button class="icon-btn close" aria-label=${t("action.close")} @click=${() => (this._drawer = false)}>${icon(mdiChevronRight)}</button>
      </div>
      <div class="drawer-body">
        ${tab === "inspector" ? renderInspector(ctx) : nothing}
        ${tab === "devices" ? renderDevicesPane(ctx) : nothing}
        ${tab === "coverage" ? renderCoveragePane(ctx) : nothing}
        ${tab === "floor" ? renderFloorPane(ctx) : nothing}
        ${tab === "buildings" ? renderBuildingsPane(ctx) : nothing}
      </div>
    </aside>`;
  }

  static styles = [
    tokens,
    controls,
    paneStyles,
    css`
      :host {
        display: block;
        /* HA's panel container only wraps content, so size to the viewport */
        height: 100vh;
        height: 100dvh;
        background: var(--zfp-bg);
      }
      .app {
        display: grid;
        grid-template-rows: auto 1fr;
        height: 100%;
        position: relative;
        overflow: hidden;
        container: zfp-app / inline-size;
      }
      /* medium widths: the drawer floats over the plan instead of squeezing it */
      @container zfp-app (max-width: 1100px) {
        .app:not(.narrow) .body.with-drawer {
          grid-template-columns: 1fr;
        }
        .app:not(.narrow) .body.editing.with-drawer {
          grid-template-columns: 60px 1fr;
        }
        .app:not(.narrow) .drawer {
          position: absolute;
          top: 8px;
          right: 8px;
          bottom: 8px;
          width: min(340px, calc(100% - 84px));
          border: 1px solid var(--zfp-divider);
          border-radius: 16px;
          box-shadow: var(--zfp-shadow-lg);
          z-index: 8;
          overflow: hidden;
        }
      }
      .topbar {
        display: flex;
        align-items: center;
        gap: 10px;
        height: var(--header-height, 56px);
        padding: 0 12px 0 16px;
        background: var(--app-header-background-color, var(--zfp-surface));
        color: var(--app-header-text-color, var(--zfp-text));
        border-bottom: var(--app-header-border-bottom, 1px solid var(--zfp-divider));
        box-sizing: border-box;
        min-width: 0;
      }
      .narrow .topbar {
        padding-left: 4px;
        flex-wrap: wrap;
        height: auto;
        min-height: var(--header-height, 56px);
        row-gap: 0;
      }
      .narrow .brand {
        min-height: 56px;
      }
      .narrow .floors {
        order: 10;
        flex-basis: 100%;
        margin: 0 0 8px;
        min-height: 0;
        padding: 0 8px;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 20px;
        font-weight: 400;
        white-space: nowrap;
      }
      .narrow .brand span,
      .narrow .label {
        display: none;
      }
      .on-header {
        color: inherit;
      }
      .icon-btn.on-header:hover {
        background: color-mix(in srgb, currentColor 12%, transparent);
        color: inherit;
      }
      .floors {
        display: flex;
        gap: 4px;
        overflow-x: auto;
        scrollbar-width: none;
        margin-left: 12px;
        min-width: 0;
      }
      .floor-tab {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 34px;
        padding: 0 14px;
        border-radius: 17px;
        border: none;
        background: transparent;
        color: inherit;
        opacity: 0.75;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        white-space: nowrap;
        transition: background 0.15s, opacity 0.15s;
      }
      .floor-tab:hover {
        opacity: 1;
        background: color-mix(in srgb, currentColor 10%, transparent);
      }
      .floor-tab.active {
        opacity: 1;
        background: color-mix(in srgb, currentColor 16%, transparent);
      }
      .floor-tab.add {
        padding: 0 10px;
      }
      .spacer {
        flex: 1;
      }
      .header-btn {
        background: color-mix(in srgb, currentColor 10%, transparent);
        border-color: transparent;
        color: inherit;
      }
      .header-btn:hover {
        background: color-mix(in srgb, currentColor 18%, transparent);
      }
      .segmented.on-header {
        background: color-mix(in srgb, currentColor 12%, transparent);
      }
      .segmented.on-header button {
        color: inherit;
        opacity: 0.8;
      }
      .segmented.on-header button.active {
        opacity: 1;
        background: var(--zfp-surface);
        color: var(--zfp-text);
      }
      .spin {
        display: inline-flex;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .save-state {
        font-size: 12px;
        font-weight: 500;
        opacity: 0.8;
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .save-state::before {
        content: "";
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: currentColor;
        opacity: 0.6;
      }
      .save-state.ok::before {
        background: var(--zfp-success);
        opacity: 1;
      }
      .save-state.bad::before {
        background: var(--zfp-error);
        opacity: 1;
      }
      .save-state.warn::before {
        background: var(--zfp-warning);
        opacity: 1;
      }
      .menu-wrap {
        position: relative;
      }
      .scrim {
        position: fixed;
        inset: 0;
        z-index: 30;
      }
      .menu {
        position: absolute;
        right: 0;
        top: 44px;
        z-index: 31;
        min-width: 220px;
        padding: 6px;
        border-radius: 14px;
        background: var(--zfp-surface);
        color: var(--zfp-text);
        box-shadow: var(--zfp-shadow-lg);
        display: grid;
        animation: drop 0.15s var(--zfp-ease);
      }
      .menu button {
        display: flex;
        align-items: center;
        gap: 10px;
        height: 40px;
        padding: 0 12px;
        border: none;
        background: none;
        border-radius: 8px;
        cursor: pointer;
        text-align: left;
        font-size: 14px;
      }
      .menu button:hover {
        background: var(--zfp-surface-2);
      }
      .building-switch {
        margin-left: 8px;
      }
      .building-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        height: 36px;
        padding: 0 10px 0 12px;
        border-radius: 18px;
        border: 1px solid color-mix(in srgb, currentColor 22%, transparent);
        background: transparent;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        white-space: nowrap;
        max-width: 240px;
      }
      .building-btn .label {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .building-btn:hover {
        background: color-mix(in srgb, currentColor 10%, transparent);
      }
      .b-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex: none;
      }
      .building-menu {
        left: 0;
        right: auto;
        min-width: 260px;
      }
      .menu .grow {
        flex: 1;
      }
      .menu .current {
        color: var(--zfp-accent);
      }
      .menu-row {
        display: flex;
        align-items: center;
        border-radius: 8px;
      }
      .menu-row.current {
        background: var(--zfp-accent-soft);
      }
      .menu-row .grow-btn {
        flex: 1;
        min-width: 0;
      }
      .menu-sep {
        height: 1px;
        background: var(--zfp-divider);
        margin: 4px 6px;
      }
      .small {
        font-size: 12px;
      }
      @keyframes drop {
        from {
          opacity: 0;
          transform: translateY(-6px);
        }
      }
      .body {
        display: grid;
        grid-template-columns: 1fr;
        min-height: 0;
        position: relative;
      }
      .body.editing {
        grid-template-columns: 60px 1fr;
      }
      .body.with-drawer {
        grid-template-columns: 1fr 360px;
      }
      .body.editing.with-drawer {
        grid-template-columns: 60px 1fr 360px;
      }
      .narrow .body,
      .narrow .body.editing,
      .narrow .body.with-drawer,
      .narrow .body.editing.with-drawer {
        grid-template-columns: 1fr;
      }
      .rail {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 10px 0;
        background: var(--zfp-surface);
        border-right: 1px solid var(--zfp-divider);
        z-index: 2;
      }
      .rail .icon-btn {
        width: 42px;
        height: 42px;
        border-radius: 12px;
      }
      .rail-sep {
        width: 28px;
        height: 1px;
        background: var(--zfp-divider);
        margin: 6px 0;
      }
      .narrow .rail {
        position: absolute;
        left: 50%;
        bottom: 16px;
        transform: translateX(-50%);
        flex-direction: row;
        padding: 6px;
        border-radius: 18px;
        border: none;
        box-shadow: var(--zfp-shadow-lg);
        z-index: 6;
        max-width: calc(100% - 24px);
        overflow-x: auto;
      }
      .narrow .rail-sep {
        width: 1px;
        height: 28px;
        margin: 0 4px;
      }
      .stage {
        position: relative;
        min-width: 0;
        min-height: 0;
        overflow: hidden;
      }
      zfp-canvas {
        position: absolute;
        inset: 0;
      }
      .top-left {
        position: absolute;
        top: 12px;
        left: 12px;
        display: flex;
        align-items: flex-start;
        gap: 8px;
        z-index: 4;
        flex-wrap: wrap;
        max-width: calc(100% - 24px);
      }
      .fab {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 36px;
        padding: 0 12px;
        border-radius: 18px;
        border: 1px solid var(--zfp-divider);
        background: var(--zfp-surface);
        box-shadow: var(--zfp-shadow);
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        color: var(--zfp-text);
      }
      .fab.active {
        border-color: var(--zfp-accent);
        color: var(--zfp-accent);
      }
      .popover {
        position: absolute;
        top: 44px;
        left: 0;
        width: 230px;
        padding: 8px;
        border-radius: 14px;
        background: var(--zfp-surface);
        box-shadow: var(--zfp-shadow-lg);
        display: grid;
        gap: 2px;
        animation: drop 0.15s var(--zfp-ease);
      }
      .layer-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 36px;
        padding: 0 8px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
      }
      .layer-row:hover {
        background: var(--zfp-surface-2);
      }
      .segmented.full {
        display: flex;
        margin-top: 6px;
      }
      .segmented.full button {
        flex: 1;
        justify-content: center;
      }
      .tool-options {
        display: flex;
        gap: 6px;
        max-width: 100%;
        overflow-x: auto;
        scrollbar-width: none;
        box-sizing: border-box;
        padding: 4px;
        border-radius: 20px;
        background: var(--zfp-surface);
        box-shadow: var(--zfp-shadow);
        border: 1px solid var(--zfp-divider);
      }
      .tool-options select {
        height: 28px;
        border-radius: 14px;
        border: none;
        background: var(--zfp-surface-2);
        width: auto;
        font-size: 13px;
        padding: 0 8px;
      }
      .banners {
        position: absolute;
        top: 12px;
        left: 50%;
        transform: translateX(-50%);
        display: grid;
        gap: 8px;
        z-index: 3;
        width: max-content;
        max-width: calc(100% - 280px);
      }
      .narrow .banners {
        top: 58px;
        max-width: calc(100% - 24px);
      }
      .banner {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 8px 6px 14px;
        min-height: 36px;
        box-sizing: border-box;
        border-radius: 18px;
        background: var(--zfp-surface);
        box-shadow: var(--zfp-shadow);
        font-size: 13px;
        animation: drop 0.2s var(--zfp-ease);
      }
      .banner.warn {
        color: var(--zfp-warning);
      }
      .banner.bad {
        color: var(--zfp-error);
      }
      .zoom {
        position: absolute;
        right: 12px;
        bottom: 16px;
        display: grid;
        border-radius: 14px;
        background: var(--zfp-surface);
        box-shadow: var(--zfp-shadow);
        z-index: 3;
        padding: 2px;
      }
      .narrow .zoom {
        bottom: 84px;
      }
      .drawer-toggle {
        position: absolute;
        right: 12px;
        top: 12px;
        z-index: 3;
      }
      .hint-pill {
        position: absolute;
        bottom: 16px;
        left: 50%;
        transform: translateX(-50%);
        padding: 8px 16px;
        border-radius: 18px;
        background: color-mix(in srgb, var(--zfp-surface) 92%, transparent);
        backdrop-filter: blur(6px);
        box-shadow: var(--zfp-shadow);
        font-size: 12.5px;
        color: var(--zfp-text-2);
        white-space: nowrap;
        max-width: calc(100% - 200px);
        overflow: hidden;
        text-overflow: ellipsis;
        z-index: 2;
        pointer-events: none;
      }
      .drawer {
        display: grid;
        grid-template-rows: auto 1fr;
        min-height: 0;
        background: var(--zfp-surface);
        border-left: 1px solid var(--zfp-divider);
        z-index: 2;
        animation: slide 0.22s var(--zfp-ease);
      }
      @keyframes slide {
        from {
          transform: translateX(24px);
          opacity: 0;
        }
      }
      .narrow .drawer {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        max-height: 70%;
        border-left: none;
        border-radius: 20px 20px 0 0;
        box-shadow: var(--zfp-shadow-lg);
        z-index: 8;
        animation: sheet 0.25s var(--zfp-ease);
      }
      @keyframes sheet {
        from {
          transform: translateY(40px);
          opacity: 0;
        }
      }
      .drawer-tabs {
        display: flex;
        align-items: center;
        gap: 2px;
        padding: 8px 8px 0;
        border-bottom: 1px solid var(--zfp-divider);
      }
      .drawer-tabs button[role="tab"] {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        padding: 6px 4px 8px;
        border: none;
        background: none;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        color: var(--zfp-text-2);
        border-bottom: 2px solid transparent;
        transition: color 0.15s, border-color 0.15s;
      }
      .drawer-tabs button[role="tab"].active {
        color: var(--zfp-accent);
        border-bottom-color: var(--zfp-accent);
      }
      .drawer-tabs .close {
        flex: none;
        align-self: center;
      }
      .narrow .drawer-tabs .close {
        transform: rotate(90deg);
      }
      .drawer-body {
        overflow-y: auto;
        padding: 16px;
        display: grid;
        gap: 22px;
        align-content: start;
      }
      .empty {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        padding: 24px;
        background: radial-gradient(circle at 50% 30%, var(--zfp-accent-soft), transparent 60%);
      }
      .empty-card {
        max-width: 440px;
        text-align: center;
        display: grid;
        justify-items: center;
        gap: 12px;
        animation: drop 0.3s var(--zfp-ease);
      }
      .empty-art {
        width: 104px;
        height: 104px;
        border-radius: 32px;
        display: grid;
        place-items: center;
        color: var(--zfp-accent);
        background: var(--zfp-surface);
        box-shadow: var(--zfp-shadow-lg);
        margin-bottom: 8px;
      }
      .empty h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 500;
      }
      .empty p {
        margin: 0 0 8px;
        color: var(--zfp-text-2);
        line-height: 1.55;
      }
      .btn.big {
        height: 44px;
        padding: 0 22px;
        border-radius: 22px;
        font-size: 15px;
      }
      .update-bar {
        position: absolute;
        top: calc(var(--header-height, 56px) + 12px);
        left: 50%;
        transform: translateX(-50%);
        z-index: 25;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 6px 6px 14px;
        border-radius: 20px;
        background: var(--zfp-accent);
        color: var(--zfp-on-accent);
        box-shadow: var(--zfp-shadow-lg);
        font-size: 14px;
        white-space: nowrap;
        animation: drop 0.2s var(--zfp-ease);
      }
      .update-bar .btn.primary {
        background: var(--zfp-on-accent);
        color: var(--zfp-accent);
      }
      .loading,
      .center-msg {
        display: grid;
        place-items: center;
        align-content: center;
        gap: 8px;
        color: var(--zfp-text-2);
      }
      .spinner {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 3px solid var(--zfp-accent-soft);
        border-top-color: var(--zfp-accent);
        animation: spin 0.8s linear infinite;
      }
    `,
  ];
}

if (!customElements.get("zigbee-floorplan-panel")) customElements.define("zigbee-floorplan-panel", ZigbeeFloorplanPanel);
