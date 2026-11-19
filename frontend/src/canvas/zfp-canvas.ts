import { css, html, LitElement, nothing, svg, type PropertyValues, type SVGTemplateResult } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { bboxOf, dist, distToSegment, pointInPolygon, polygonArea, polygonCentroid, unionBBox } from "../geometry";
import type { I18nKey, Translate } from "../i18n";
import { MATERIALS } from "../materials";
import type { RfResult } from "../rf/engine";
import type { Suggestion } from "../rf/suggest";
import { buildingExtent, floorsOf, updateBuilding } from "../project/ops";
import type { Building, Floor, MaterialId, NetworkState, Project, Pt, ZDevice, ZLink } from "../types";
import {
  deviceHealth,
  HEALTH_COLOR,
  lqiColor,
  lqiWidth,
  TYPE_COLOR,
  TYPE_ICON,
  visibleLinks,
} from "../ui/device-style";
import { getTopology, isRoute } from "../topology";
import { mdiBatteryAlertVariantOutline, mdiHelpCircleOutline, mdiPlus } from "../ui/icons";
import { tokens } from "../ui/styles";
import { snapPoint, type SnapResult } from "./snapping";
import {
  createTool,
  DEVICE_PREFIX,
  placeAt,
  type Hit,
  type Tool,
  type ToolHost,
  type ToolId,
} from "./tools";
import { fitViewport, toScreen, toWorld, zoomAt, type Viewport } from "./viewport";

export interface Layers {
  heatmap: boolean;
  links: boolean;
  labels: boolean;
  background: boolean;
  suggestions: boolean;
}

export const DEFAULT_LAYERS: Layers = { heatmap: true, links: true, labels: true, background: true, suggestions: true };

export const DEVICE_DRAG_TYPE = "application/x-zigbee-floorplan-device";

/** Site view: every visible building, showing its floor at `level`. */
export interface SiteView {
  level: number;
}

/** A floor drawn in the current view, offset from its local coordinates. */
interface ViewLayer {
  floor: Floor;
  building: Building;
  dx: number;
  dy: number;
}

const BUILDING_PAD = 0.6;

const DEVICE_R = 15;
const SNAP_PX = 10;
const HIT_PAD_PX = 6;

/**
 * Interactive plan view. World geometry is drawn inside a transformed SVG
 * group (meters), devices/labels/overlays in screen space so they keep a
 * constant size; grid and coverage are painted on a canvas underneath.
 */
export class ZfpCanvas extends LitElement {
  static properties = {
    project: { attribute: false },
    floorId: { attribute: false },
    network: { attribute: false },
    rf: { attribute: false },
    editable: { type: Boolean },
    tool: { attribute: false },
    layers: { attribute: false },
    linkMode: { attribute: false },
    selection: { attribute: false },
    placing: { attribute: false },
    imageUrls: { attribute: false },
    site: { attribute: false },
    t: { attribute: false },
    wallMaterial: { attribute: false },
    wallThickness: { attribute: false },
    gridSize: { attribute: false },
    highlight: { attribute: false },
    editHint: { attribute: false },
    _vp: { state: true },
    _preview: { state: true },
    _tick: { state: true },
    _hoverDevice: { state: true },
    _ghost: { state: true },
  };

  declare project: Project;
  declare floorId: string;
  declare network: NetworkState | null;
  declare rf: RfResult | null;
  declare editable: boolean;
  declare tool: ToolId;
  declare layers: Layers;
  declare linkMode: "tree" | "all";
  declare selection: string[];
  declare placing: string | null;
  /** object URLs of background images by image id */
  declare imageUrls: Record<string, string>;
  declare site: SiteView | null;
  declare t: Translate;
  declare wallMaterial: MaterialId;
  declare wallThickness: number;
  declare gridSize: number;
  declare highlight: string | null;
  /** user could edit but is in view mode: hint when they try to drag */
  declare editHint: boolean;
  declare _vp: Viewport;
  declare _preview: Project | null;
  declare _tick: number;
  declare _hoverDevice: string | null;
  declare _ghost: Pt | null;

  private toolImpl: Tool = createTool("select");
  private readonly viewports = new Map<string, Viewport>();
  private readonly pointers = new Map<number, Pt>();
  private pan: { x: number; y: number; vp: Viewport; onItem?: boolean } | null = null;
  /** view-mode press on a device: a click opens it, a drag hints at edit mode */
  private viewPress: { ieee: string; x: number; y: number; hinted: boolean } | null = null;
  private labelPress = false;
  private pinch: { d: number; mid: Pt; vp: Viewport } | null = null;
  private spaceDown = false;
  private size = { w: 0, h: 0 };
  private ro?: ResizeObserver;
  private heatBitmaps = new Map<unknown, ImageBitmap>();
  private buildingDrag: { id: string; start: Pt; origin: Pt; moved: boolean; screen: Pt } | null = null;
  private rafId = 0;
  private needsFit = true;
  /** set once the user pans/zooms; until then resizes re-fit the content */
  private userMoved = false;
  private colorProbe?: HTMLElement;

  constructor() {
    super();
    this.network = null;
    this.rf = null;
    this.editable = false;
    this.tool = "select";
    this.layers = DEFAULT_LAYERS;
    this.linkMode = "tree";
    this.selection = [];
    this.placing = null;
    this.imageUrls = {};
    this.site = null;
    this.t = (k: I18nKey) => k;
    this.wallMaterial = "brick";
    this.wallThickness = 0.15;
    this.gridSize = 0.25;
    this.highlight = null;
    this.editHint = false;
    this._vp = { scale: 40, tx: 0, ty: 0 };
    this._preview = null;
    this._tick = 0;
    this._hoverDevice = null;
    this._ghost = null;
  }

  // ---------- derived ----------

  private get shown(): Project {
    return this._preview ?? this.project;
  }

  get floor(): Floor | undefined {
    return this.shown?.floors.find((f) => f.id === this.floorId);
  }

  /** Floors drawn in this view with their offsets into view coordinates. */
  viewLayers(): ViewLayer[] {
    const p = this.shown;
    if (!p) return [];
    if (!this.site) {
      const f = this.floor;
      const b = f && p.buildings.find((x) => x.id === f.buildingId);
      return f && b ? [{ floor: f, building: b, dx: 0, dy: 0 }] : [];
    }
    const out: ViewLayer[] = [];
    for (const b of p.buildings) {
      if (!b.visible) continue;
      const f = floorsOf(p, b.id).find((fl) => fl.level === this.site!.level);
      if (f) out.push({ floor: f, building: b, dx: b.x, dy: b.y });
    }
    return out;
  }

  /** Translation from site coordinates (RF results) into view coordinates. */
  private siteShift(): Pt {
    if (this.site) return { x: 0, y: 0 };
    const b = this.shown?.buildings.find((x) => x.id === this.floor?.buildingId);
    return b ? { x: -b.x, y: -b.y } : { x: 0, y: 0 };
  }

  /** View-coordinate positions of devices placed on displayed floors. */
  private viewPositions(): Map<string, { pt: Pt; floorId: string }> {
    const layers = new Map(this.viewLayers().map((l) => [l.floor.id, l]));
    const out = new Map<string, { pt: Pt; floorId: string }>();
    for (const [ieee, pl] of Object.entries(this.shown?.placements ?? {})) {
      const l = layers.get(pl.floorId);
      if (l) out.set(ieee, { pt: { x: pl.x + l.dx, y: pl.y + l.dy }, floorId: pl.floorId });
    }
    return out;
  }

  /** Visible buildings' footprints in view coordinates (site view only). */
  private footprints(): { building: Building; box: { minX: number; minY: number; maxX: number; maxY: number }; hasLevel: boolean }[] {
    if (!this.site) return [];
    const p = this.shown;
    const shownIds = new Set(this.viewLayers().map((l) => l.building.id));
    return p.buildings
      .filter((b) => b.visible)
      .map((b) => {
        const local = buildingExtent(p, b.id) ?? { minX: 0, minY: 0, maxX: 6, maxY: 4 };
        return {
          building: b,
          hasLevel: shownIds.has(b.id),
          box: {
            minX: local.minX + b.x - BUILDING_PAD,
            minY: local.minY + b.y - BUILDING_PAD,
            maxX: local.maxX + b.x + BUILDING_PAD,
            maxY: local.maxY + b.y + BUILDING_PAD,
          },
        };
      });
  }

  private viewKey(): string {
    return this.site ? `site:${this.site.level}` : this.floorId;
  }

  private deviceMap(): Map<string, ZDevice> {
    return new Map((this.network?.devices ?? []).map((d) => [d.ieee, d]));
  }

  // ---------- public API ----------

  fit(animate = true): void {
    this.userMoved = false;
    const box = this.contentBox();
    const target = fitViewport(box, this.size.w, this.size.h, 56);
    this.animateTo(animate ? target : null, target);
  }

  zoomBy(factor: number): void {
    this.userMoved = true;
    this.animateTo({ ...zoomAt(this._vp, { x: this.size.w / 2, y: this.size.h / 2 }, factor) }, null);
  }

  centerOn(pt: Pt): void {
    this.userMoved = true;
    const scale = Math.max(this._vp.scale, 60);
    this.animateTo({ scale, tx: this.size.w / 2 - pt.x * scale, ty: this.size.h / 2 - pt.y * scale }, null);
  }

  /** Center on a point given in site coordinates (RF results). */
  centerOnSite(pt: Pt): void {
    const shift = this.siteShift();
    this.centerOn({ x: pt.x + shift.x, y: pt.y + shift.y });
  }

  /** Center on a device if it is drawn in this view. */
  centerOnDevice(ieee: string): boolean {
    const pos = this.viewPositions().get(ieee);
    if (pos) this.centerOn(pos.pt);
    return !!pos;
  }

  private animateTo(target: Viewport | null, immediate: Viewport | null): void {
    cancelAnimationFrame(this.rafId);
    if (immediate && !target) {
      this._vp = immediate;
      return;
    }
    if (!target) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      this._vp = target;
      return;
    }
    const from = this._vp;
    const t0 = performance.now();
    const dur = 260;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      // interpolate in log-scale so zoom feels uniform
      const scale = Math.exp(Math.log(from.scale) + (Math.log(target.scale) - Math.log(from.scale)) * e);
      this._vp = {
        scale,
        tx: from.tx + (target.tx - from.tx) * e,
        ty: from.ty + (target.ty - from.ty) * e,
      };
      if (k < 1) this.rafId = requestAnimationFrame(step);
    };
    this.rafId = requestAnimationFrame(step);
  }

  private contentBox() {
    let box: ReturnType<typeof bboxOf> = null;
    for (const { floor: f, dx, dy } of this.viewLayers()) {
      const pts = [...f.walls.flatMap((w) => [w.a, w.b]), ...f.rooms.flatMap((r) => r.points)];
      pts.push(...Object.values(this.shown.placements).filter((p) => p.floorId === f.id));
      if (f.background && this.layers.background && f.background.visible) {
        const bg = f.background;
        pts.push({ x: bg.x, y: bg.y }, { x: bg.x + bg.width * bg.scale, y: bg.y + bg.height * bg.scale });
      }
      box = unionBBox(box, bboxOf(pts.map((p) => ({ x: p.x + dx, y: p.y + dy }))));
    }
    for (const fp of this.footprints()) box = unionBBox(box, fp.box);
    return box;
  }

  // ---------- lifecycle ----------

  connectedCallback(): void {
    super.connectedCallback();
    this.ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const prev = this.size;
      const first = prev.w === 0;
      this.size = { w: width, h: height };
      if (first || this.needsFit || !this.userMoved) {
        this.needsFit = false;
        this.fit(false);
      } else {
        // keep the view centered when side panels open/close
        this._vp = { ...this._vp, tx: this._vp.tx + (width - prev.w) / 2, ty: this._vp.ty + (height - prev.h) / 2 };
      }
      this.drawBase();
      this._tick++;
    });
    this.updateComplete.then(() => {
      const wrap = this.renderRoot.querySelector(".wrap");
      if (wrap) this.ro?.observe(wrap);
    });
    window.addEventListener("keyup", this.onKeyUp);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.ro?.disconnect();
    cancelAnimationFrame(this.rafId);
    window.removeEventListener("keyup", this.onKeyUp);
  }

  protected willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("tool") && this.toolImpl.id !== this.tool) {
      this.toolImpl.cancel(this.host());
      this.toolImpl = createTool(this.tool);
    }
    if (changed.has("floorId") || changed.has("site")) {
      const prevFloor = changed.has("floorId") ? (changed.get("floorId") as string | undefined) : this.floorId;
      const prevSite = changed.has("site") ? (changed.get("site") as SiteView | null | undefined) : this.site;
      const prevKey = prevSite ? `site:${prevSite.level}` : prevFloor;
      if (prevKey && this.size.w) this.viewports.set(prevKey, this._vp);
      const saved = this.viewports.get(this.viewKey());
      this._preview = null;
      this.toolImpl.cancel(this.host());
      if (saved) this._vp = saved;
      else if (this.size.w) this.fit(false);
      else this.needsFit = true;
    }
    if (changed.has("project") && changed.get("project") === undefined && this.size.w) {
      this.fit(false);
    }
  }

  protected updated(changed: PropertyValues<this>): void {
    if (changed.has("rf")) void this.refreshHeat();
    if (
      changed.has("_vp") || changed.has("rf") || changed.has("layers") || changed.has("floorId") ||
      changed.has("gridSize") || changed.has("site") || changed.has("project")
    ) {
      this.drawBase();
    }
  }

  private async refreshHeat(): Promise<void> {
    const heats = this.rf?.heats ?? [];
    const next = new Map<unknown, ImageBitmap>();
    for (const heat of heats) {
      const existing = this.heatBitmaps.get(heat);
      if (existing) {
        next.set(heat, existing);
        continue;
      }
      if (!heat.rgba.length) continue;
      try {
        next.set(heat, await createImageBitmap(new ImageData(new Uint8ClampedArray(heat.rgba), heat.cols, heat.rows)));
      } catch {
        /* skip a raster the browser cannot decode */
      }
    }
    for (const [key, bmp] of this.heatBitmaps) if (!next.has(key)) bmp.close();
    this.heatBitmaps = next;
    this.drawBase();
  }

  // ---------- canvas base layer ----------

  private textRgb(): [number, number, number] {
    const probe = this.colorProbe ?? (this.colorProbe = this.renderRoot.querySelector(".probe") as HTMLElement);
    const m = probe ? getComputedStyle(probe).color.match(/\d+(\.\d+)?/g) : null;
    return m ? [Number(m[0]), Number(m[1]), Number(m[2])] : [30, 30, 30];
  }

  private drawBase(): void {
    const canvas = this.renderRoot.querySelector("canvas");
    if (!canvas || !this.size.w) return;
    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(this.size.w * dpr);
    const h = Math.round(this.size.h * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.size.w, this.size.h);
    const vp = this._vp;
    const [r, g, b] = this.textRgb();

    // grid: minor lines at grid spacing (when legible), majors every meter / 5 m
    const minorStep = [this.gridSize, 0.5, 1, 2, 5, 10].find((s) => s * vp.scale >= 9) ?? 10;
    const majorStep = minorStep < 1 ? 1 : minorStep * 5;
    const tl = toWorld(vp, { x: 0, y: 0 });
    const br = toWorld(vp, { x: this.size.w, y: this.size.h });
    const lines = (step: number, alpha: number) => {
      ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = Math.floor(tl.x / step) * step; x <= br.x; x += step) {
        const sx = Math.round(x * vp.scale + vp.tx) + 0.5;
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, this.size.h);
      }
      for (let y = Math.floor(tl.y / step) * step; y <= br.y; y += step) {
        const sy = Math.round(y * vp.scale + vp.ty) + 0.5;
        ctx.moveTo(0, sy);
        ctx.lineTo(this.size.w, sy);
      }
      ctx.stroke();
    };
    lines(minorStep, 0.05);
    lines(majorStep, 0.1);

    if (this.layers.heatmap) {
      const shown = new Set(this.viewLayers().map((l) => l.floor.id));
      const shift = this.siteShift();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.globalAlpha = 0.9;
      for (const heat of this.rf?.heats ?? []) {
        const bmp = this.heatBitmaps.get(heat);
        if (!bmp || !shown.has(heat.floorId)) continue;
        const o = toScreen(vp, { x: heat.originX + shift.x, y: heat.originY + shift.y });
        ctx.drawImage(bmp, o.x, o.y, heat.cols * heat.cell * vp.scale, heat.rows * heat.cell * vp.scale);
      }
      ctx.globalAlpha = 1;
    }
  }

  // ---------- tool host ----------

  private host(): ToolHost {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return {
      get project() {
        return self.project;
      },
      get floor() {
        return self.project.floors.find((f) => f.id === self.floorId)!;
      },
      get vp() {
        return self._vp;
      },
      get selection() {
        return self.selection;
      },
      get wallMaterial() {
        return self.wallMaterial;
      },
      get wallThickness() {
        return self.wallThickness;
      },
      get gridSize() {
        return self.gridSize;
      },
      world: (ev) => this.eventWorld(ev),
      toScreen: (p) => toScreen(this._vp, p),
      snap: (raw, opts) => this.snap(raw, opts),
      hitTest: (ev) => this.hitTest(ev),
      commit: (fn) => this.emit("zfp-commit", { fn }),
      select: (ids) => {
        this.selection = ids;
        this.emit("zfp-select", { ids });
      },
      setPreview: (p) => {
        this._preview = p;
      },
      redraw: () => {
        this._tick++;
      },
      emit: (name, detail) => this.emit(name, detail),
      t: (key, vars) => this.t(key as I18nKey, vars),
    };
  }

  private emit(name: string, detail?: unknown): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  private eventPoint(ev: { clientX: number; clientY: number }): Pt {
    const rect = this.getBoundingClientRect();
    return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
  }

  private eventWorld(ev: { clientX: number; clientY: number }): Pt {
    return toWorld(this._vp, this.eventPoint(ev));
  }

  private snap(raw: Pt, opts: { anchor?: Pt | null; exclude?: Pt[]; free?: boolean; gridOnly?: boolean } = {}): SnapResult {
    const f = this.floor;
    const vertices = f ? [...f.walls.flatMap((w) => [w.a, w.b]), ...f.rooms.flatMap((r) => r.points)] : [];
    return snapPoint(raw, {
      grid: this.gridSize,
      vertices: opts.gridOnly ? [] : vertices,
      walls: opts.gridOnly ? [] : (f?.walls ?? []),
      tolerance: SNAP_PX / this._vp.scale,
      anchor: opts.anchor ?? null,
      angleStep: 15,
      disabled: opts.free,
      exclude: opts.exclude,
    });
  }

  private hitTest(ev: { clientX: number; clientY: number }, includeGeometry = this.editable): Hit | null {
    const s = this.eventPoint(ev);
    const w = toWorld(this._vp, s);
    let best: { ieee: string; d: number } | null = null;
    for (const [ieee, { pt }] of this.viewPositions()) {
      const d = dist(toScreen(this._vp, pt), s);
      if (d <= DEVICE_R + 4 && (!best || d < best.d)) best = { ieee, d };
    }
    if (best) return { kind: "device", ieee: best.ieee };
    if (this.site) {
      // labels first: they sit above the footprint and open the building
      for (const fp of [...this.footprints()].reverse()) {
        const tl = toScreen(this._vp, { x: fp.box.minX, y: fp.box.minY });
        const w = fp.building.name.length * 7.2 + 28;
        if (s.x >= tl.x && s.x <= tl.x + w && s.y >= tl.y - 26 && s.y <= tl.y) {
          return { kind: "building", id: fp.building.id, label: true };
        }
      }
      for (const fp of [...this.footprints()].reverse()) {
        if (w.x >= fp.box.minX && w.x <= fp.box.maxX && w.y >= fp.box.minY && w.y <= fp.box.maxY) {
          return { kind: "building", id: fp.building.id, label: false };
        }
      }
      return null;
    }
    const f = this.floor;
    if (!f || !includeGeometry) return null;

    const handleTol = 8;
    for (const wall of f.walls) {
      if (!this.selection.includes(wall.id)) continue;
      for (const end of ["a", "b"] as const) {
        if (dist(toScreen(this._vp, wall[end]), s) <= handleTol) {
          return { kind: "vertex", ref: { kind: "wall", id: wall.id, end }, pt: wall[end] };
        }
      }
    }
    for (const room of f.rooms) {
      if (!this.selection.includes(room.id)) continue;
      const i = room.points.findIndex((p) => dist(toScreen(this._vp, p), s) <= handleTol);
      if (i >= 0) return { kind: "vertex", ref: { kind: "room", id: room.id, index: i }, pt: room.points[i] };
    }
    let wallHit: { id: string; d: number } | null = null;
    for (const wall of f.walls) {
      const d = distToSegment(w, wall.a, wall.b);
      const tol = wall.thickness / 2 + HIT_PAD_PX / this._vp.scale;
      if (d <= tol && (!wallHit || d < wallHit.d)) wallHit = { id: wall.id, d };
    }
    if (wallHit) return { kind: "wall", id: wallHit.id };
    // smallest room containing the point wins (nested rooms)
    const rooms = f.rooms.filter((r) => pointInPolygon(w, r.points)).sort((a, b) => polygonArea(a.points) - polygonArea(b.points));
    if (rooms.length) return { kind: "room", id: rooms[0].id };
    return null;
  }

  // ---------- input ----------

  private get activeTool(): Tool | null {
    return this.editable && !this.placing && !this.site ? this.toolImpl : null;
  }

  /** Displayed floor under a view point (site view: the building footprint it falls in). */
  private layerAt(pt: Pt): ViewLayer | null {
    const layers = this.viewLayers();
    if (!this.site) return layers[0] ?? null;
    const fp = this.footprints().find(
      (f) => f.hasLevel && pt.x >= f.box.minX && pt.x <= f.box.maxX && pt.y >= f.box.minY && pt.y <= f.box.maxY,
    );
    return fp ? (layers.find((l) => l.building.id === fp.building.id) ?? null) : null;
  }

  private placeAtView(ieee: string, pt: Pt): boolean {
    const layer = this.layerAt(pt);
    if (!layer) return false;
    const local = { x: pt.x - layer.dx, y: pt.y - layer.dy };
    this.emit("zfp-commit", { fn: (p: Project) => placeAt(p, ieee, layer.floor.id, local) });
    return true;
  }

  private onPointerDown = (ev: PointerEvent): void => {
    if (ev.pointerType === "mouse" && ev.button !== 0 && ev.button !== 1 && ev.button !== 2) return;
    (ev.currentTarget as HTMLElement).setPointerCapture(ev.pointerId);
    (this.renderRoot.querySelector(".wrap") as HTMLElement)?.focus({ preventScroll: true });
    const pt = this.eventPoint(ev);
    this.pointers.set(ev.pointerId, pt);

    if (this.pointers.size === 2) {
      this.toolImpl.cancel(this.host());
      const [a, b] = [...this.pointers.values()];
      this.pinch = { d: dist(a, b), mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, vp: this._vp };
      this.pan = null;
      return;
    }

    if (this.placing && ev.button === 0) {
      const ieee = this.placing;
      if (this.placeAtView(ieee, this.eventWorld(ev))) {
        this.emit("zfp-placed", { ieee });
        this._ghost = null;
      }
      return;
    }

    if (this.site && ev.button === 0) {
      const hit = this.hitTest(ev);
      if (hit?.kind === "device") {
        this.viewPress = { ieee: hit.ieee, x: pt.x, y: pt.y, hinted: false };
        return;
      }
      if (hit?.kind === "building" && (this.editable || hit.label)) {
        const b = this.shown.buildings.find((x) => x.id === hit.id)!;
        this.buildingDrag = { id: hit.id, start: this.eventWorld(ev), origin: { x: b.x, y: b.y }, moved: false, screen: pt };
        this.labelPress = hit.label;
        return;
      }
    }

    const tool = this.activeTool;
    const panGesture =
      ev.button === 1 ||
      this.spaceDown ||
      (tool?.id === "pan") ||
      (!tool && !this.hitTest(ev)) ||
      (tool?.id === "select" && ev.pointerType === "touch" && !this.hitTest(ev));
    if (panGesture) {
      const onItem = !tool && this.editHint && !!this.hitTest(ev, true);
      this.pan = { x: pt.x, y: pt.y, vp: this._vp, onItem };
      this._tick++;
      return;
    }
    if (!tool) {
      const hit = this.hitTest(ev);
      if (hit?.kind === "device") this.viewPress = { ieee: hit.ieee, x: pt.x, y: pt.y, hinted: false };
      return;
    }
    tool.down(ev, this.host());
    this._tick++;
  };

  private onPointerMove = (ev: PointerEvent): void => {
    const pt = this.eventPoint(ev);
    if (this.pointers.has(ev.pointerId)) this.pointers.set(ev.pointerId, pt);

    if (this.pinch && this.pointers.size >= 2) {
      const [a, b] = [...this.pointers.values()];
      const d = dist(a, b);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const base = this.pinch.vp;
      this.userMoved = true;
      const z = zoomAt(base, this.pinch.mid, d / this.pinch.d);
      this._vp = { ...z, tx: z.tx + mid.x - this.pinch.mid.x, ty: z.ty + mid.y - this.pinch.mid.y };
      return;
    }
    if (this.buildingDrag) {
      const d = this.buildingDrag;
      if (!d.moved && Math.hypot(pt.x - d.screen.x, pt.y - d.screen.y) <= 4) return;
      if (!this.editable) return;
      d.moved = true;
      const w = this.eventWorld(ev);
      const snap = (v: number) => Math.round(v * 2) / 2;
      const pos = { x: snap(d.origin.x + w.x - d.start.x), y: snap(d.origin.y + w.y - d.start.y) };
      this._preview = updateBuilding(this.project, d.id, pos);
      return;
    }
    if (this.viewPress) {
      const vp = this.viewPress;
      if (!vp.hinted && Math.hypot(pt.x - vp.x, pt.y - vp.y) > 6) {
        vp.hinted = true;
        if (this.editHint) this.emit("zfp-edit-hint");
      }
      return;
    }
    if (this.pan) {
      if (this.pan.onItem && Math.hypot(pt.x - this.pan.x, pt.y - this.pan.y) > 6) {
        this.pan.onItem = false;
        this.emit("zfp-edit-hint");
      }
      this.userMoved = true;
      this._vp = { ...this.pan.vp, tx: this.pan.vp.tx + pt.x - this.pan.x, ty: this.pan.vp.ty + pt.y - this.pan.y };
      return;
    }
    if (this.placing) {
      this._ghost = this.eventWorld(ev);
      return;
    }
    const tool = this.activeTool;
    if (tool) tool.move(ev, this.host());
    if (ev.pointerType === "mouse" && !this.pointers.size) {
      const hit = this.hitTest(ev);
      const hov = hit?.kind === "device" ? hit.ieee : null;
      if (hov !== this._hoverDevice) this._hoverDevice = hov;
    }
  };

  private onPointerUp = (ev: PointerEvent): void => {
    const wasPinch = !!this.pinch;
    this.pointers.delete(ev.pointerId);
    if (this.pointers.size < 2) this.pinch = null;
    if (wasPinch) {
      if (this.pointers.size === 1) {
        const [p] = [...this.pointers.values()];
        this.pan = { x: p.x, y: p.y, vp: this._vp };
      }
      return;
    }
    if (this.buildingDrag) {
      const d = this.buildingDrag;
      this.buildingDrag = null;
      const preview = this._preview;
      this._preview = null;
      if (d.moved && preview) {
        const b = preview.buildings.find((x) => x.id === d.id)!;
        this.emit("zfp-commit", { fn: (p: Project) => updateBuilding(p, d.id, { x: b.x, y: b.y }) });
      } else if (!d.moved && this.labelPress) {
        this.emit("zfp-open-building", { id: d.id });
      }
      return;
    }
    if (this.viewPress) {
      const press = this.viewPress;
      this.viewPress = null;
      if (!press.hinted) this.emit("zfp-device-click", { ieee: press.ieee });
      return;
    }
    if (this.pan) {
      const moved = Math.hypot(this._vp.tx - this.pan.vp.tx, this._vp.ty - this.pan.vp.ty) > 3;
      this.pan = null;
      this._tick++;
      if (!moved && this.activeTool?.id === "select" && ev.pointerType === "touch") this.host().select([]);
      return;
    }
    const tool = this.activeTool;
    if (tool) {
      tool.up(ev, this.host());
      this._tick++;
    }
  };

  private onDblClick = (ev: MouseEvent): void => {
    this.activeTool?.dblclick?.(ev, this.host());
  };

  private onWheel = (ev: WheelEvent): void => {
    ev.preventDefault();
    this.userMoved = true;
    const pt = this.eventPoint(ev);
    const scaleDelta = ev.deltaMode === 1 ? ev.deltaY * 16 : ev.deltaY;
    if (!ev.ctrlKey && Math.abs(ev.deltaX) > 0.5) {
      this._vp = { ...this._vp, tx: this._vp.tx - ev.deltaX, ty: this._vp.ty - ev.deltaY };
      return;
    }
    const factor = Math.exp(-scaleDelta * (ev.ctrlKey ? 0.01 : 0.0018));
    this._vp = zoomAt(this._vp, pt, factor);
  };

  private onContextMenu = (ev: Event): void => {
    if (this.editable) ev.preventDefault();
  };

  private onKeyUp = (ev: KeyboardEvent): void => {
    if (ev.code === "Space") {
      this.spaceDown = false;
      this._tick++;
    }
  };

  /** Keyboard handling delegated by the host panel. Returns true when consumed. */
  handleKey(ev: KeyboardEvent): boolean {
    if (ev.code === "Space") {
      if (!this.spaceDown) {
        this.spaceDown = true;
        this._tick++;
      }
      return true;
    }
    if (ev.key === "Escape" && this.placing) {
      this.emit("zfp-placed", { ieee: null });
      this._ghost = null;
      return true;
    }
    const tool = this.activeTool;
    return tool ? tool.key(ev, this.host()) : false;
  }

  private onDragOver = (ev: DragEvent): void => {
    if (!this.editable || !ev.dataTransfer?.types.includes(DEVICE_DRAG_TYPE)) return;
    ev.preventDefault();
    ev.dataTransfer.dropEffect = "move";
    this._ghost = this.eventWorld(ev);
  };

  private onDragLeave = (): void => {
    this._ghost = null;
  };

  private onDrop = (ev: DragEvent): void => {
    const ieee = ev.dataTransfer?.getData(DEVICE_DRAG_TYPE);
    this._ghost = null;
    if (!ieee || !this.editable) return;
    ev.preventDefault();
    if (!this.placeAtView(ieee, this.eventWorld(ev))) return;
    this.emit("zfp-placed", { ieee });
    this.emit("zfp-select", { ids: [DEVICE_PREFIX + ieee] });
  };

  // ---------- render ----------

  private cursor(): string {
    if (this.pan || this.pinch) return "grabbing";
    if (this.spaceDown) return "grab";
    if (this.placing) return "copy";
    if (this.buildingDrag?.moved) return "grabbing";
    if (this.site) return this._hoverDevice ? "pointer" : this.editable ? "default" : "grab";
    const tool = this.activeTool;
    if (!tool) return this._hoverDevice ? "pointer" : "grab";
    if (tool.id === "select" && this._hoverDevice) return "pointer";
    return tool.cursor(this.host());
  }

  protected render() {
    const f = this.floor;
    const vp = this._vp;
    const devices = this.deviceMap();
    const layers = this.viewLayers();
    return html`
      <div
        class="wrap"
        tabindex="0"
        style="cursor:${this.cursor()}"
        @pointerdown=${this.onPointerDown}
        @pointermove=${this.onPointerMove}
        @pointerup=${this.onPointerUp}
        @pointercancel=${this.onPointerUp}
        @pointerleave=${() => (this._ghost = this.placing ? null : this._ghost)}
        @dblclick=${this.onDblClick}
        @wheel=${this.onWheel}
        @contextmenu=${this.onContextMenu}
        @dragover=${this.onDragOver}
        @dragleave=${this.onDragLeave}
        @drop=${this.onDrop}
      >
        <span class="probe"></span>
        <canvas></canvas>
        <svg class="layer">
          ${f || this.site
            ? svg`
              <g transform="matrix(${vp.scale} 0 0 ${vp.scale} ${vp.tx} ${vp.ty})">
                ${repeat(
                  layers,
                  (l) => l.floor.id,
                  (l) => svg`<g transform="translate(${l.dx} ${l.dy})">
                    ${this.renderBackground(l.floor)}
                    ${this.renderRooms(l.floor)}
                    ${this.renderWalls(l.floor)}
                  </g>`,
                )}
              </g>
              ${this.renderFootprints()}
              ${this.layers.links ? this.renderLinks(devices) : nothing}
              ${this.layers.labels ? layers.map((l) => this.renderRoomLabels(l.floor, l.dx, l.dy)) : nothing}
              ${f && !this.site ? this.renderSelectionHandles(f) : nothing}
              ${this.layers.suggestions ? this.renderSuggestions() : nothing}
              ${this.renderDevices(devices)}
              ${this.renderGhost(devices)}
              ${this.activeTool ? this.activeTool.overlay(this.host()) : nothing}`
            : nothing}
        </svg>
        <div class="scale-bar">${this.renderScaleBar()}</div>
      </div>
    `;
  }

  private renderBackground(f: Floor) {
    const bg = f.background;
    const url = bg && this.imageUrls[bg.imageId];
    if (!bg || !this.layers.background || !bg.visible || !url) return nothing;
    const w = bg.width * bg.scale;
    const h = bg.height * bg.scale;
    return svg`<image href=${url} x=${bg.x} y=${bg.y} width=${w} height=${h}
      opacity=${bg.opacity} preserveAspectRatio="none"
      transform=${bg.rotation ? `rotate(${bg.rotation} ${bg.x + w / 2} ${bg.y + h / 2})` : ""}
      class=${this.tool === "image" && this.editable ? "bg editing" : "bg"}></image>`;
  }

  private renderRooms(f: Floor) {
    return repeat(
      f.rooms,
      (r) => r.id,
      (r) => svg`<polygon class="room ${this.selection.includes(r.id) ? "selected" : ""}"
        points=${r.points.map((p) => `${p.x},${p.y}`).join(" ")}></polygon>`,
    );
  }

  private renderWalls(f: Floor) {
    const sel = new Set(this.selection);
    const px = 1 / this._vp.scale;
    return svg`
      ${repeat(
        f.walls.filter((w) => sel.has(w.id)),
        (w) => `sel-${w.id}`,
        (w) => svg`<line class="wall-sel" x1=${w.a.x} y1=${w.a.y} x2=${w.b.x} y2=${w.b.y}
          stroke-width=${w.thickness + 6 * px}></line>`,
      )}
      ${repeat(f.walls, (w) => w.id, (w) => {
        const m = MATERIALS[w.material];
        const glass = m.pattern === "glass";
        return svg`<line class="wall" x1=${w.a.x} y1=${w.a.y} x2=${w.b.x} y2=${w.b.y}
            stroke=${m.color} stroke-width=${Math.max(w.thickness, 2 * px)}></line>
          ${glass
            ? svg`<line class="wall-glass" x1=${w.a.x} y1=${w.a.y} x2=${w.b.x} y2=${w.b.y}
                stroke-width=${Math.max(w.thickness * 0.3, px)}></line>`
            : m.pattern === "dense"
              ? svg`<line class="wall-core" x1=${w.a.x} y1=${w.a.y} x2=${w.b.x} y2=${w.b.y}
                  stroke-width=${Math.max(w.thickness * 0.25, px)} stroke-dasharray=${`${4 * px} ${3 * px}`}></line>`
              : nothing}`;
      })}`;
  }

  private renderRoomLabels(f: Floor, dx = 0, dy = 0) {
    if (this._vp.scale < 14) return nothing;
    const at = (p: Pt) => toScreen(this._vp, { x: p.x + dx, y: p.y + dy });
    return repeat(f.rooms, (r) => r.id, (r) => {
      // top-left corner keeps labels clear of devices, which tend to sit mid-room
      const box = bboxOf(r.points)!;
      let anchor = at({ x: box.minX, y: box.minY });
      anchor = { x: anchor.x + 10, y: anchor.y + 18 };
      const local = toWorld(this._vp, anchor);
      if (!pointInPolygon({ x: local.x - dx, y: local.y - dy }, r.points)) anchor = at(polygonCentroid(r.points));
      return svg`<g class="room-label" transform="translate(${anchor.x} ${anchor.y})">
        <text>${r.name}</text>
        <text class="area" dy="14">${polygonArea(r.points).toFixed(1)} m²</text>
      </g>`;
    });
  }

  private renderSelectionHandles(f: Floor) {
    if (!this.editable || this.tool !== "select") return nothing;
    const pts: Pt[] = [];
    for (const w of f.walls) if (this.selection.includes(w.id)) pts.push(w.a, w.b);
    for (const r of f.rooms) if (this.selection.includes(r.id)) pts.push(...r.points);
    return pts.map((p) => {
      const s = toScreen(this._vp, p);
      return svg`<rect class="handle" x=${s.x - 5} y=${s.y - 5} width="10" height="10" rx="2"></rect>`;
    });
  }

  private renderLinks(devices: Map<string, ZDevice>) {
    const topo = getTopology(this.network);
    const links = visibleLinks(this.network?.links ?? [], this.linkMode, topo);
    const placements = this.shown.placements;
    const positions = this.viewPositions();
    const shift = this.siteShift();
    const buildingOf = (floorId: string) => {
      const fl = this.shown.floors.find((x) => x.id === floorId);
      return { floor: fl, building: this.shown.buildings.find((b) => b.id === fl?.buildingId) };
    };
    const candidate = this._hoverDevice ?? this.highlight ?? this.selectedDevice();
    // only focus when the device actually has links to show
    const highlighted = candidate && links.some((l) => l.a === candidate || l.b === candidate) ? candidate : null;
    const out: SVGTemplateResult[] = [];
    const stubs: SVGTemplateResult[] = [];
    for (const link of links) {
      const pa = placements[link.a];
      const pb = placements[link.b];
      if (!pa || !pb || !devices.has(link.a) || !devices.has(link.b)) continue;
      const aHere = positions.has(link.a);
      const bHere = positions.has(link.b);
      if (!aHere && !bHere) continue;
      const focus = highlighted ? link.a === highlighted || link.b === highlighted : true;
      const route = isRoute(topo, link);
      const cls = `link ${route ? "tree" : link.relationship === "tree" ? "tree" : link.relationship} ${focus ? "" : "dim"} ${highlighted && focus ? "focus" : ""}`;
      const color = lqiColor(link.lqi);
      const width = lqiWidth(link.lqi);
      if (aHere && bHere) {
        const sa = toScreen(this._vp, positions.get(link.a)!.pt);
        const sb = toScreen(this._vp, positions.get(link.b)!.pt);
        // dashes flow from the child towards its uplink, i.e. towards the coordinator
        const [from, to] = topo.uplink.get(link.a) === link.b ? [sa, sb] : topo.uplink.get(link.b) === link.a ? [sb, sa] : link.parent === link.a ? [sb, sa] : [sa, sb];
        out.push(svg`<line class=${cls} x1=${from.x} y1=${from.y} x2=${to.x} y2=${to.y}
          stroke=${color} stroke-width=${width}></line>`);
        if (this.layers.labels && link.lqi !== null && (highlighted ? focus : this._vp.scale > 30)) {
          const mx = (sa.x + sb.x) / 2;
          const my = (sa.y + sb.y) / 2;
          out.push(svg`<g class="lqi-tag ${focus ? "" : "dim"}" transform="translate(${mx} ${my})">
            <rect x="-14" y="-9" width="28" height="18" rx="9" fill=${color}></rect>
            <text text-anchor="middle" dy="4">${link.lqi}</text></g>`);
        }
      } else {
        const hereView = positions.get(aHere ? link.a : link.b)!;
        const other = aHere ? pb : pa;
        const hereInfo = buildingOf(hereView.floorId);
        const otherInfo = buildingOf(other.floorId);
        const otherFloor = otherInfo.floor;
        const s = toScreen(this._vp, hereView.pt);
        // direction in site coordinates so stubs point at other buildings too
        const hereSite = { x: hereView.pt.x - shift.x, y: hereView.pt.y - shift.y };
        const otherSite = { x: other.x + (otherInfo.building?.x ?? 0), y: other.y + (otherInfo.building?.y ?? 0) };
        let dx = otherSite.x - hereSite.x;
        let dy = otherSite.y - hereSite.y;
        const len = Math.hypot(dx, dy);
        if (len < 0.3) {
          dx = 0.7;
          dy = -0.7;
        }
        const k = 52 / Math.hypot(dx, dy);
        const ex = s.x + dx * k;
        const ey = s.y + dy * k;
        const sameBuilding = otherInfo.building?.id === hereInfo.building?.id;
        const hereLevel = hereInfo.floor?.level ?? 0;
        const levelTag = otherFloor
          ? otherFloor.level === hereLevel ? "" : `${otherFloor.level > hereLevel ? "↑" : "↓"}${otherFloor.level}`
          : "?";
        const tag = sameBuilding ? levelTag : `${(otherInfo.building?.name ?? "?").slice(0, 10)}${levelTag ? ` ${levelTag}` : ""}`;
        const tagW = Math.max(24, tag.length * 6.5 + 10);
        stubs.push(svg`<g class="stub ${focus ? "" : "dim"}">
          <line class=${cls} x1=${s.x} y1=${s.y} x2=${ex} y2=${ey} stroke=${color} stroke-width=${width}></line>
          <g transform="translate(${ex} ${ey})">
            <rect x=${-tagW / 2} y="-9" width=${tagW} height="18" rx="5"
              style=${!sameBuilding && otherInfo.building ? `stroke:${otherInfo.building.color}` : ""}></rect>
            <text text-anchor="middle" dy="4">${tag}</text>
          </g></g>`);
      }
    }
    return svg`<g class="links">${out}${stubs}</g>`;
  }

  private selectedDevice(): string | null {
    const d = this.selection.find((s) => s.startsWith(DEVICE_PREFIX));
    return d ? d.slice(DEVICE_PREFIX.length) : null;
  }

  private renderDevices(devices: Map<string, ZDevice>) {
    const entries = [...this.viewPositions()].map(([ieee, v]) => [ieee, v.pt] as const);
    // draw routers/coordinator above end devices
    const order = { Coordinator: 3, Router: 2, EndDevice: 1, Unknown: 0 } as const;
    entries.sort(([a], [b]) => order[devices.get(a)?.type ?? "Unknown"] - order[devices.get(b)?.type ?? "Unknown"]);
    const est = this.rf?.deviceRssi ?? {};
    const topo = getTopology(this.network);
    const haveLinks = (this.network?.links.length ?? 0) > 0;
    const showLabels = this.layers.labels && this._vp.scale >= 26;
    return svg`<g class="devices">${repeat(
      entries,
      ([ieee]) => ieee,
      ([ieee, pl]) => {
        const dev = devices.get(ieee);
        const s = toScreen(this._vp, pl);
        const type = dev?.type ?? "Unknown";
        const health = deviceHealth(dev, est[ieee]);
        const selected = this.selection.includes(DEVICE_PREFIX + ieee);
        const hovered = this._hoverDevice === ieee || this.highlight === ieee;
        const lowBattery = dev?.battery !== null && dev?.battery !== undefined && dev.battery <= 15;
        const noLink = !!dev && type !== "Coordinator" && topo.uplink.get(ieee) === null;
        return svg`<g class="device ${type} ${health} ${selected ? "selected" : ""} ${hovered ? "hover" : ""} ${dev ? "" : "missing"} ${noLink ? "nolink" : ""}"
            transform="translate(${s.x} ${s.y})">
          ${this.highlight === ieee ? svg`<circle class="pulse" r=${DEVICE_R}></circle>` : nothing}
          ${selected ? svg`<circle class="sel-ring" r=${DEVICE_R + 5}></circle>` : nothing}
          <circle class="body" r=${DEVICE_R} stroke=${HEALTH_COLOR[health]}></circle>
          <g transform="translate(-10 -10)" fill=${TYPE_COLOR[type]}>
            <path transform="scale(0.8333)" d=${TYPE_ICON[type]}></path>
          </g>
          ${lowBattery
            ? svg`<g class="badge" transform="translate(9 -17)"><circle r="8"></circle>
                <path transform="translate(-6 -6) scale(0.5)" d=${mdiBatteryAlertVariantOutline}></path></g>`
            : nothing}
          ${noLink && haveLinks
            ? svg`<g class="badge nolink-badge" transform="translate(-10 -17)"><title>${this.t("detail.no_link_data")}</title><circle r="8"></circle>
                <path transform="translate(-6 -6) scale(0.5)" d=${mdiHelpCircleOutline}></path></g>`
            : nothing}
          ${showLabels || selected || hovered
            ? svg`<text class="dev-label" text-anchor="middle" y=${DEVICE_R + 15}>${dev?.name ?? ieee}</text>`
            : nothing}
        </g>`;
      },
    )}</g>`;
  }

  private renderSuggestions() {
    const shown = new Set(this.viewLayers().map((l) => l.floor.id));
    const shift = this.siteShift();
    const list: Suggestion[] = (this.rf?.suggestions ?? []).filter((sg) => shown.has(sg.floorId));
    return list.map((sg, i) => {
      const s = toScreen(this._vp, { x: sg.pos.x + shift.x, y: sg.pos.y + shift.y });
      return svg`<g class="suggestion" transform="translate(${s.x} ${s.y})">
        <circle class="halo" r="22"></circle>
        <circle class="core" r="14"></circle>
        <path transform="translate(-9 -9) scale(0.75)" d=${mdiPlus}></path>
        <text class="sugg-label" text-anchor="middle" y="36">${i + 1}. +${Math.round(sg.gainArea)} m²</text>
      </g>`;
    });
  }

  private renderFootprints() {
    if (!this.site) return nothing;
    return this.footprints().map(({ building: b, box, hasLevel }) => {
      const tl = toScreen(this._vp, { x: box.minX, y: box.minY });
      const br = toScreen(this._vp, { x: box.maxX, y: box.maxY });
      const w = b.name.length * 7.2 + 28;
      const dragging = this.buildingDrag?.id === b.id && this.buildingDrag.moved;
      return svg`<g class="footprint ${hasLevel ? "" : "empty"} ${dragging ? "dragging" : ""} ${this.editable ? "movable" : ""}"
          style="--b:${b.color}">
        <rect class="fp-box" x=${tl.x} y=${tl.y} width=${br.x - tl.x} height=${br.y - tl.y} rx="10"></rect>
        <g class="fp-label" transform="translate(${tl.x} ${tl.y - 26})">
          <rect width=${w} height="22" rx="11"></rect>
          <circle cx="12" cy="11" r="4"></circle>
          <text x="22" y="15">${b.name}</text>
        </g>
      </g>`;
    });
  }

  private renderGhost(devices: Map<string, ZDevice>) {
    if (!this._ghost) return nothing;
    const ieee = this.placing;
    const type = (ieee && devices.get(ieee)?.type) || "Router";
    const s = toScreen(this._vp, this._ghost);
    return svg`<g class="device ghost" transform="translate(${s.x} ${s.y})">
      <circle class="body" r=${DEVICE_R}></circle>
      <g transform="translate(-10 -10)" fill=${TYPE_COLOR[type]}><path transform="scale(0.8333)" d=${TYPE_ICON[type]}></path></g>
    </g>`;
  }

  private renderScaleBar() {
    const target = 90 / this._vp.scale;
    const nice = [0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10, 20, 50].find((n) => n >= target) ?? 50;
    const px = nice * this._vp.scale;
    return html`<span class="bar" style="width:${px}px"></span><span>${nice < 1 ? `${nice * 100} cm` : `${nice} m`}</span>`;
  }

  static styles = [
    tokens,
    css`
      :host {
        display: block;
        position: relative;
        overflow: hidden;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
      }
      .wrap {
        position: absolute;
        inset: 0;
        outline: none;
        background:
          radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--zfp-surface) 92%, var(--zfp-accent)), var(--zfp-surface) 70%);
      }
      .probe {
        position: absolute;
        visibility: hidden;
        color: var(--zfp-text);
      }
      canvas,
      svg.layer {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
      }
      svg.layer {
        overflow: visible;
      }
      .bg {
        image-rendering: auto;
      }
      .bg.editing {
        outline: 2px dashed var(--zfp-accent);
      }
      .fp-box {
        fill: color-mix(in srgb, var(--b) 4%, transparent);
        stroke: var(--b);
        stroke-width: 1.5px;
        stroke-dasharray: 6 5;
        opacity: 0.8;
      }
      .footprint.movable .fp-box {
        cursor: move;
      }
      .footprint.dragging .fp-box {
        fill: color-mix(in srgb, var(--b) 12%, transparent);
        stroke-dasharray: none;
      }
      .footprint.empty .fp-box {
        opacity: 0.4;
      }
      .fp-label {
        cursor: pointer;
      }
      .fp-label rect {
        fill: var(--zfp-surface);
        stroke: var(--b);
        stroke-width: 1.5px;
      }
      .fp-label circle {
        fill: var(--b);
      }
      .fp-label text {
        font-size: 12px;
        font-weight: 600;
        fill: var(--zfp-text);
      }
      .footprint.empty .fp-label {
        opacity: 0.6;
      }
      .room {
        fill: color-mix(in srgb, var(--zfp-text) 4%, transparent);
        stroke: color-mix(in srgb, var(--zfp-text) 18%, transparent);
        stroke-width: 1px;
        vector-effect: non-scaling-stroke;
        stroke-dasharray: 4 3;
        transition: fill 0.15s;
      }
      .room.selected {
        fill: var(--zfp-accent-soft);
        stroke: var(--zfp-accent);
        stroke-dasharray: none;
      }
      .wall {
        stroke-linecap: square;
      }
      .wall-sel {
        stroke: var(--zfp-accent);
        stroke-linecap: round;
        opacity: 0.55;
      }
      .wall-glass {
        stroke: color-mix(in srgb, white 85%, transparent);
        stroke-linecap: butt;
      }
      .wall-core {
        stroke: rgba(0, 0, 0, 0.35);
      }
      .room-label text {
        font-size: 12px;
        font-weight: 600;
        fill: var(--zfp-text-2);
        paint-order: stroke;
        stroke: var(--zfp-surface);
        stroke-width: 3px;
      }
      .room-label .area {
        font-size: 10.5px;
        font-weight: 500;
        fill: var(--zfp-text-3);
      }
      .handle {
        fill: var(--zfp-surface);
        stroke: var(--zfp-accent);
        stroke-width: 2px;
        cursor: move;
      }
      .link {
        stroke-linecap: round;
        opacity: 0.9;
        transition: opacity 0.2s;
      }
      .link.tree {
        stroke-dasharray: 10 6;
        animation: flow 1.6s linear infinite;
      }
      .link.sibling,
      .link.other {
        stroke-dasharray: 2 5;
        opacity: 0.55;
      }
      .link.dim,
      .lqi-tag.dim,
      .stub.dim {
        opacity: 0.12;
      }
      .link.focus {
        opacity: 1;
      }
      @keyframes flow {
        to {
          stroke-dashoffset: -32;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .link.tree {
          animation: none;
        }
        .device .pulse,
        .suggestion .halo {
          animation: none !important;
        }
      }
      .lqi-tag text {
        font-size: 10px;
        font-weight: 700;
        fill: #fff;
      }
      .stub rect {
        fill: var(--zfp-surface);
        stroke: var(--zfp-divider);
      }
      .stub text {
        font-size: 10px;
        font-weight: 700;
        fill: var(--zfp-text-2);
      }
      .device .body {
        fill: var(--zfp-surface);
        stroke-width: 3px;
        filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.25));
        transition: r 0.15s var(--zfp-ease);
      }
      .device.hover .body,
      .device.selected .body {
        r: 17px;
      }
      .device.offline {
        opacity: 0.75;
      }
      .device.missing .body {
        stroke-dasharray: 3 3;
      }
      .device .sel-ring {
        fill: none;
        stroke: var(--zfp-accent);
        stroke-width: 2.5px;
      }
      .device .pulse {
        fill: none;
        stroke: var(--zfp-accent);
        stroke-width: 3px;
        animation: pulse 1.2s ease-out infinite;
      }
      @keyframes pulse {
        from {
          r: 16px;
          opacity: 0.9;
        }
        to {
          r: 42px;
          opacity: 0;
        }
      }
      .device .badge circle {
        fill: var(--zfp-error);
      }
      .device .badge path {
        fill: #fff;
      }
      .device .nolink-badge circle {
        fill: var(--zfp-warning);
      }
      .device.nolink .body {
        stroke-dasharray: 5 3;
      }
      .dev-label {
        font-size: 11.5px;
        font-weight: 600;
        fill: var(--zfp-text);
        paint-order: stroke;
        stroke: var(--zfp-surface);
        stroke-width: 3.5px;
        stroke-linejoin: round;
        pointer-events: none;
      }
      .device.ghost {
        opacity: 0.7;
        pointer-events: none;
      }
      .device.ghost .body {
        stroke: var(--zfp-accent);
        stroke-dasharray: 4 3;
      }
      .suggestion .halo {
        fill: var(--zfp-accent-soft);
        stroke: var(--zfp-accent);
        stroke-dasharray: 4 4;
        animation: breathe 2.4s ease-in-out infinite;
      }
      @keyframes breathe {
        50% {
          r: 28px;
          opacity: 0.6;
        }
      }
      .suggestion .core {
        fill: var(--zfp-accent);
      }
      .suggestion path {
        fill: var(--zfp-on-accent);
      }
      .sugg-label {
        font-size: 11px;
        font-weight: 700;
        fill: var(--zfp-accent);
        paint-order: stroke;
        stroke: var(--zfp-surface);
        stroke-width: 3px;
      }
      .rubber {
        stroke: var(--zfp-accent);
        stroke-width: 2px;
        stroke-dasharray: 6 4;
      }
      .rubber.wall-preview {
        stroke-width: 4px;
        stroke-dasharray: none;
        opacity: 0.7;
      }
      .chain-pt {
        fill: var(--zfp-accent);
      }
      .snap {
        fill: none;
        stroke: var(--zfp-accent);
        stroke-width: 2px;
      }
      .snap.grid {
        fill: var(--zfp-accent);
        stroke: none;
        opacity: 0.7;
      }
      .room-preview {
        fill: var(--zfp-accent-soft);
        stroke: var(--zfp-accent);
        stroke-width: 2px;
        stroke-dasharray: 6 4;
      }
      .close-target {
        fill: none;
        stroke: var(--zfp-accent);
        stroke-width: 2px;
      }
      .marquee {
        fill: var(--zfp-accent-soft);
        stroke: var(--zfp-accent);
        stroke-width: 1px;
        stroke-dasharray: 4 3;
      }
      .dim rect {
        fill: var(--zfp-text);
        opacity: 0.85;
      }
      .dim text {
        fill: var(--zfp-surface);
        font-size: 11.5px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }
      .scale-bar {
        position: absolute;
        left: 16px;
        bottom: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 11px;
        font-weight: 600;
        color: var(--zfp-text-2);
        pointer-events: none;
      }
      .scale-bar .bar {
        height: 6px;
        border: 2px solid var(--zfp-text-2);
        border-top: none;
        box-sizing: border-box;
      }
    `,
  ];
}

if (!customElements.get("zfp-canvas")) customElements.define("zfp-canvas", ZfpCanvas);

declare global {
  interface HTMLElementTagNameMap {
    "zfp-canvas": ZfpCanvas;
  }
}

export type { Hit, ToolId, ZLink };
