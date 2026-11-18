import { nothing, svg, type SVGTemplateResult } from "lit";
import { dist, polygonArea, sub } from "../geometry";
import {
  addRoom,
  addWalls,
  moveItems,
  moveVertex,
  placeDevice,
  removeItems,
  unplaceDevice,
  updatePlacement,
  type VertexRef,
} from "../project/ops";
import type { Floor, MaterialId, Project, Pt } from "../types";
import type { SnapResult } from "./snapping";
import type { Viewport } from "./viewport";

export type ToolId = "select" | "wall" | "room" | "calibrate" | "measure" | "pan" | "image";

export type Hit =
  | { kind: "device"; ieee: string }
  | { kind: "vertex"; ref: VertexRef; pt: Pt }
  | { kind: "wall"; id: string }
  | { kind: "room"; id: string }
  | { kind: "building"; id: string; label: boolean };

export const DEVICE_PREFIX = "dev:";

export interface ToolHost {
  readonly project: Project;
  readonly floor: Floor;
  readonly vp: Viewport;
  readonly selection: string[];
  readonly wallMaterial: MaterialId;
  readonly wallThickness: number;
  readonly gridSize: number;
  world(ev: PointerEvent | MouseEvent): Pt;
  toScreen(p: Pt): Pt;
  snap(raw: Pt, opts?: { anchor?: Pt | null; exclude?: Pt[]; free?: boolean; gridOnly?: boolean }): SnapResult;
  hitTest(ev: PointerEvent | MouseEvent): Hit | null;
  commit(fn: (p: Project) => Project): void;
  select(ids: string[]): void;
  setPreview(p: Project | null): void;
  redraw(): void;
  emit(name: string, detail?: unknown): void;
  t(key: string, vars?: Record<string, string | number>): string;
}

export interface Tool {
  readonly id: ToolId;
  cursor(host: ToolHost): string;
  down(ev: PointerEvent, host: ToolHost): void;
  move(ev: PointerEvent, host: ToolHost): void;
  up(ev: PointerEvent, host: ToolHost): void;
  dblclick?(ev: MouseEvent, host: ToolHost): void;
  key(ev: KeyboardEvent, host: ToolHost): boolean;
  cancel(host: ToolHost): void;
  overlay(host: ToolHost): unknown;
}

const DRAG_THRESHOLD_PX = 4;
const fmtM = (v: number) => `${v.toFixed(v < 10 ? 2 : 1)} m`;

// ---------- overlay helpers ----------

export function snapMarker(host: ToolHost, snap: SnapResult | null): SVGTemplateResult | typeof nothing {
  if (!snap) return nothing;
  const s = host.toScreen(snap.pt);
  switch (snap.kind) {
    case "vertex":
      return svg`<rect class="snap vertex" x=${s.x - 6} y=${s.y - 6} width="12" height="12" rx="2"></rect>`;
    case "wall":
      return svg`<path class="snap wall" d="M${s.x} ${s.y - 7}L${s.x + 7} ${s.y}L${s.x} ${s.y + 7}L${s.x - 7} ${s.y}Z"></path>`;
    case "angle":
      return svg`<circle class="snap angle" cx=${s.x} cy=${s.y} r="6"></circle>`;
    default:
      return svg`<circle class="snap grid" cx=${s.x} cy=${s.y} r="3.5"></circle>`;
  }
}

function dimLabel(host: ToolHost, a: Pt, b: Pt, text = fmtM(dist(a, b))): SVGTemplateResult {
  const sa = host.toScreen(a);
  const sb = host.toScreen(b);
  const mx = (sa.x + sb.x) / 2;
  const my = (sa.y + sb.y) / 2;
  const w = text.length * 7 + 14;
  return svg`<g class="dim" transform="translate(${mx} ${my - 16})">
    <rect x=${-w / 2} y="-11" width=${w} height="22" rx="11"></rect>
    <text text-anchor="middle" dy="4">${text}</text>
  </g>`;
}

function rubber(host: ToolHost, a: Pt, b: Pt, cls = "rubber"): SVGTemplateResult {
  const sa = host.toScreen(a);
  const sb = host.toScreen(b);
  return svg`<line class=${cls} x1=${sa.x} y1=${sa.y} x2=${sb.x} y2=${sb.y}></line>`;
}

// ---------- select ----------

type Drag =
  | { kind: "move"; ids: string[]; start: Pt; startScreen: Pt; moved: boolean; anchor: Pt }
  | { kind: "vertex"; ref: VertexRef; start: Pt; startScreen: Pt; moved: boolean }
  | { kind: "device"; ieee: string; startScreen: Pt; moved: boolean; offset: Pt }
  | { kind: "marquee"; start: Pt; startScreen: Pt; current: Pt; additive: boolean };

export class SelectTool implements Tool {
  readonly id = "select" as const;
  private drag: Drag | null = null;
  private snap: SnapResult | null = null;

  cursor(): string {
    return this.drag?.kind === "move" || this.drag?.kind === "device" ? "grabbing" : "default";
  }

  down(ev: PointerEvent, host: ToolHost): void {
    const hit = host.hitTest(ev);
    const world = host.world(ev);
    const screen = { x: ev.clientX, y: ev.clientY };
    const sel = host.selection;

    if (hit?.kind === "device") {
      const id = DEVICE_PREFIX + hit.ieee;
      if (!sel.includes(id)) host.select(ev.shiftKey ? [...sel, id] : [id]);
      const pl = host.project.placements[hit.ieee];
      this.drag = { kind: "device", ieee: hit.ieee, startScreen: screen, moved: false, offset: sub(world, pl) };
      return;
    }
    if (hit?.kind === "vertex") {
      this.drag = { kind: "vertex", ref: hit.ref, start: hit.pt, startScreen: screen, moved: false };
      return;
    }
    if (hit?.kind === "wall" || hit?.kind === "room") {
      let ids = sel;
      if (ev.shiftKey) {
        ids = sel.includes(hit.id) ? sel.filter((s) => s !== hit.id) : [...sel, hit.id];
        host.select(ids);
      } else if (!sel.includes(hit.id)) {
        ids = [hit.id];
        host.select(ids);
      }
      const geom = ids.filter((i) => !i.startsWith(DEVICE_PREFIX));
      if (geom.length) {
        this.drag = { kind: "move", ids: geom, start: world, startScreen: screen, moved: false, anchor: host.snap(world, { gridOnly: true }).pt };
      }
      return;
    }
    this.drag = { kind: "marquee", start: world, startScreen: screen, current: world, additive: ev.shiftKey };
  }

  private moved(ev: PointerEvent, startScreen: Pt): boolean {
    return Math.hypot(ev.clientX - startScreen.x, ev.clientY - startScreen.y) > DRAG_THRESHOLD_PX;
  }

  move(ev: PointerEvent, host: ToolHost): void {
    const d = this.drag;
    if (!d) return;
    const world = host.world(ev);
    if (d.kind === "marquee") {
      d.current = world;
      host.redraw();
      return;
    }
    if (!d.moved && !this.moved(ev, d.startScreen)) return;
    d.moved = true;
    if (d.kind === "move") {
      const target = host.snap(sub(world, sub(d.start, d.anchor)), { free: ev.shiftKey, gridOnly: true }).pt;
      const delta = sub(target, d.anchor);
      host.setPreview(moveItems(host.project, host.floor.id, d.ids, delta));
    } else if (d.kind === "vertex") {
      this.snap = host.snap(world, { exclude: [d.start], free: ev.shiftKey });
      host.setPreview(moveVertex(host.project, host.floor.id, d.ref, this.snap.pt));
    } else if (d.kind === "device") {
      const raw = sub(world, d.offset);
      const pt = ev.shiftKey ? raw : { x: Math.round(raw.x * 20) / 20, y: Math.round(raw.y * 20) / 20 };
      host.setPreview(updatePlacement(host.project, d.ieee, pt));
    }
  }

  up(ev: PointerEvent, host: ToolHost): void {
    const d = this.drag;
    this.drag = null;
    this.snap = null;
    if (!d) return;
    if (d.kind === "marquee") {
      const moved = this.moved(ev, d.startScreen);
      if (!moved) {
        if (!d.additive) host.select([]);
      } else {
        host.select(marqueeSelect(host, d.start, d.current, d.additive ? host.selection : []));
      }
      host.redraw();
      return;
    }
    if (!d.moved) {
      if (d.kind === "device") host.emit("zfp-device-click", { ieee: d.ieee });
      return;
    }
    const world = host.world(ev);
    host.setPreview(null);
    if (d.kind === "move") {
      const target = host.snap(sub(world, sub(d.start, d.anchor)), { free: ev.shiftKey, gridOnly: true }).pt;
      const delta = sub(target, d.anchor);
      if (delta.x || delta.y) host.commit((p) => moveItems(p, host.floor.id, d.ids, delta));
    } else if (d.kind === "vertex") {
      const pt = host.snap(world, { exclude: [d.start], free: ev.shiftKey }).pt;
      host.commit((p) => moveVertex(p, host.floor.id, d.ref, pt));
    } else if (d.kind === "device") {
      const raw = sub(world, d.offset);
      const pt = ev.shiftKey ? raw : { x: Math.round(raw.x * 20) / 20, y: Math.round(raw.y * 20) / 20 };
      host.commit((p) => updatePlacement(p, d.ieee, pt));
    }
  }

  key(ev: KeyboardEvent, host: ToolHost): boolean {
    const sel = host.selection;
    if ((ev.key === "Delete" || ev.key === "Backspace") && sel.length) {
      const devices = sel.filter((s) => s.startsWith(DEVICE_PREFIX)).map((s) => s.slice(DEVICE_PREFIX.length));
      const geom = sel.filter((s) => !s.startsWith(DEVICE_PREFIX));
      host.commit((p) => {
        let next = removeItems(p, host.floor.id, geom);
        for (const ieee of devices) next = unplaceDevice(next, ieee);
        return next;
      });
      host.select([]);
      return true;
    }
    if (ev.key.startsWith("Arrow") && sel.length) {
      const step = host.gridSize * (ev.shiftKey ? 10 : 1);
      const delta = {
        x: ev.key === "ArrowLeft" ? -step : ev.key === "ArrowRight" ? step : 0,
        y: ev.key === "ArrowUp" ? -step : ev.key === "ArrowDown" ? step : 0,
      };
      const geom = sel.filter((s) => !s.startsWith(DEVICE_PREFIX));
      const devices = sel.filter((s) => s.startsWith(DEVICE_PREFIX)).map((s) => s.slice(DEVICE_PREFIX.length));
      host.commit((p) => {
        let next = geom.length ? moveItems(p, host.floor.id, geom, delta) : p;
        for (const ieee of devices) {
          const pl = next.placements[ieee];
          if (pl) next = updatePlacement(next, ieee, { x: pl.x + delta.x, y: pl.y + delta.y });
        }
        return next;
      });
      return true;
    }
    if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "d") {
      const walls = host.floor.walls.filter((w) => sel.includes(w.id));
      if (!walls.length) return false;
      const off = host.gridSize * 2;
      let ids: string[] = [];
      host.commit((p) => {
        const res = addWalls(
          p,
          host.floor.id,
          walls.map((w) => ({ ...w, a: { x: w.a.x + off, y: w.a.y + off }, b: { x: w.b.x + off, y: w.b.y + off } })),
        );
        ids = res.ids;
        return res.project;
      });
      host.select(ids);
      return true;
    }
    if (ev.key === "Escape" && sel.length) {
      host.select([]);
      return true;
    }
    return false;
  }

  cancel(host: ToolHost): void {
    this.drag = null;
    this.snap = null;
    host.setPreview(null);
  }

  overlay(host: ToolHost) {
    const d = this.drag;
    if (d?.kind === "marquee") {
      const a = host.toScreen(d.start);
      const b = host.toScreen(d.current);
      return svg`<rect class="marquee" x=${Math.min(a.x, b.x)} y=${Math.min(a.y, b.y)}
        width=${Math.abs(a.x - b.x)} height=${Math.abs(a.y - b.y)}></rect>`;
    }
    if (d?.kind === "vertex") return snapMarker(host, this.snap);
    return nothing;
  }
}

function marqueeSelect(host: ToolHost, a: Pt, b: Pt, base: string[]): string[] {
  const minX = Math.min(a.x, b.x);
  const maxX = Math.max(a.x, b.x);
  const minY = Math.min(a.y, b.y);
  const maxY = Math.max(a.y, b.y);
  const inside = (p: Pt) => p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY;
  const ids = new Set(base);
  for (const w of host.floor.walls) if (inside(w.a) && inside(w.b)) ids.add(w.id);
  for (const r of host.floor.rooms) if (r.points.every(inside)) ids.add(r.id);
  for (const [ieee, pl] of Object.entries(host.project.placements)) {
    if (pl.floorId === host.floor.id && inside(pl)) ids.add(DEVICE_PREFIX + ieee);
  }
  return [...ids];
}

// ---------- walls ----------

export class WallTool implements Tool {
  readonly id = "wall" as const;
  private chain: Pt[] = [];
  private hover: SnapResult | null = null;

  cursor(): string {
    return "crosshair";
  }

  down(ev: PointerEvent, host: ToolHost): void {
    if (ev.button === 2) {
      this.finish(host);
      return;
    }
    const last = this.chain[this.chain.length - 1] ?? null;
    const pt = host.snap(host.world(ev), { anchor: last, free: ev.shiftKey }).pt;
    if (!last) {
      this.chain = [pt];
      host.redraw();
      return;
    }
    if (dist(pt, last) < 1e-6) return;
    host.commit((p) =>
      addWalls(p, host.floor.id, [{ a: last, b: pt, thickness: host.wallThickness, material: host.wallMaterial }]).project,
    );
    const closed = this.chain.length >= 2 && dist(pt, this.chain[0]) < 1e-6;
    if (closed) this.chain = [];
    else this.chain.push(pt);
  }

  move(ev: PointerEvent, host: ToolHost): void {
    const last = this.chain[this.chain.length - 1] ?? null;
    this.hover = host.snap(host.world(ev), { anchor: last, free: ev.shiftKey });
    host.redraw();
  }

  up(): void {}

  dblclick(_ev: MouseEvent, host: ToolHost): void {
    this.finish(host);
  }

  private finish(host: ToolHost): void {
    this.chain = [];
    host.redraw();
  }

  key(ev: KeyboardEvent, host: ToolHost): boolean {
    if ((ev.key === "Enter" || ev.key === "Escape") && this.chain.length) {
      this.finish(host);
      return true;
    }
    if (ev.key === "Backspace" && this.chain.length) {
      this.chain.pop();
      host.redraw();
      return true;
    }
    return false;
  }

  cancel(host: ToolHost): void {
    this.chain = [];
    this.hover = null;
    host.redraw();
  }

  overlay(host: ToolHost) {
    const last = this.chain[this.chain.length - 1];
    const parts: unknown[] = [];
    if (last && this.hover) {
      parts.push(rubber(host, last, this.hover.pt, "rubber wall-preview"));
      parts.push(dimLabel(host, last, this.hover.pt));
    }
    if (last) {
      const s = host.toScreen(last);
      parts.push(svg`<circle class="chain-pt" cx=${s.x} cy=${s.y} r="4"></circle>`);
    }
    parts.push(snapMarker(host, this.hover));
    return svg`${parts}`;
  }
}

// ---------- rooms ----------

export class RoomTool implements Tool {
  readonly id = "room" as const;
  private pts: Pt[] = [];
  private hover: SnapResult | null = null;

  cursor(): string {
    return "crosshair";
  }

  down(ev: PointerEvent, host: ToolHost): void {
    const pt = host.snap(host.world(ev), { anchor: this.pts[this.pts.length - 1] ?? null, free: ev.shiftKey }).pt;
    const tol = 10 / host.vp.scale;
    if (this.pts.length >= 3 && dist(pt, this.pts[0]) <= tol) {
      this.close(host);
      return;
    }
    if (this.pts.length && dist(pt, this.pts[this.pts.length - 1]) < 1e-6) return;
    this.pts.push(pt);
    host.redraw();
  }

  private close(host: ToolHost): void {
    if (this.pts.length < 3) return;
    const pts = this.pts;
    const n = host.floor.rooms.length + 1;
    let id = "";
    host.commit((p) => {
      const res = addRoom(p, host.floor.id, `${host.t("inspector.room")} ${n}`, pts);
      id = res.id;
      return res.project;
    });
    this.pts = [];
    if (id) host.select([id]);
    host.redraw();
  }

  move(ev: PointerEvent, host: ToolHost): void {
    this.hover = host.snap(host.world(ev), { anchor: this.pts[this.pts.length - 1] ?? null, free: ev.shiftKey });
    host.redraw();
  }

  up(): void {}

  dblclick(_ev: MouseEvent, host: ToolHost): void {
    this.close(host);
  }

  key(ev: KeyboardEvent, host: ToolHost): boolean {
    if (ev.key === "Enter" && this.pts.length >= 3) {
      this.close(host);
      return true;
    }
    if (ev.key === "Escape" && this.pts.length) {
      this.pts = [];
      host.redraw();
      return true;
    }
    if (ev.key === "Backspace" && this.pts.length) {
      this.pts.pop();
      host.redraw();
      return true;
    }
    return false;
  }

  cancel(host: ToolHost): void {
    this.pts = [];
    this.hover = null;
    host.redraw();
  }

  overlay(host: ToolHost) {
    if (!this.pts.length) return snapMarker(host, this.hover);
    const all = this.hover ? [...this.pts, this.hover.pt] : this.pts;
    const pts = all.map((p) => host.toScreen(p));
    const area = all.length >= 3 ? polygonArea(all) : 0;
    const first = pts[0];
    return svg`
      <polygon class="room-preview" points=${pts.map((p) => `${p.x},${p.y}`).join(" ")}></polygon>
      ${this.pts.length >= 3 ? svg`<circle class="close-target" cx=${first.x} cy=${first.y} r="9"></circle>` : nothing}
      ${area > 0 ? dimLabel(host, all[0], all[Math.floor(all.length / 2)], `${area.toFixed(1)} m²`) : nothing}
      ${snapMarker(host, this.hover)}`;
  }
}

// ---------- two-point tools (measure / calibrate) ----------

class TwoPointTool implements Tool {
  protected a: Pt | null = null;
  protected b: Pt | null = null;
  protected hover: SnapResult | null = null;
  protected done = false;

  constructor(readonly id: "measure" | "calibrate") {}

  cursor(): string {
    return "crosshair";
  }

  down(ev: PointerEvent, host: ToolHost): void {
    const pt = host.snap(host.world(ev), { anchor: this.done ? null : this.a, free: ev.shiftKey || this.id === "calibrate" }).pt;
    if (!this.a || this.done) {
      this.a = pt;
      this.b = null;
      this.done = false;
    } else {
      this.b = pt;
      this.done = true;
      this.complete(host);
    }
    host.redraw();
  }

  protected complete(_host: ToolHost): void {}

  move(ev: PointerEvent, host: ToolHost): void {
    this.hover = host.snap(host.world(ev), { anchor: this.done ? null : this.a, free: ev.shiftKey || this.id === "calibrate" });
    host.redraw();
  }

  up(): void {}

  key(ev: KeyboardEvent, host: ToolHost): boolean {
    if (ev.key === "Escape" && this.a) {
      this.cancel(host);
      return true;
    }
    return false;
  }

  cancel(host: ToolHost): void {
    this.a = this.b = null;
    this.hover = null;
    this.done = false;
    host.redraw();
  }

  overlay(host: ToolHost) {
    const end = this.b ?? (this.a && !this.done ? this.hover?.pt : null);
    if (!this.a) return snapMarker(host, this.hover);
    const sa = host.toScreen(this.a);
    return svg`
      ${end ? rubber(host, this.a, end, "rubber measure") : nothing}
      <circle class="chain-pt" cx=${sa.x} cy=${sa.y} r="4"></circle>
      ${end ? svg`<circle class="chain-pt" cx=${host.toScreen(end).x} cy=${host.toScreen(end).y} r="4"></circle>` : nothing}
      ${end ? dimLabel(host, this.a, end) : nothing}
      ${this.done ? nothing : snapMarker(host, this.hover)}`;
  }
}

export class MeasureTool extends TwoPointTool {
  constructor() {
    super("measure");
  }
}

export class CalibrateTool extends TwoPointTool {
  constructor() {
    super("calibrate");
  }

  protected complete(host: ToolHost): void {
    if (this.a && this.b && dist(this.a, this.b) > 1e-3) {
      host.emit("zfp-calibrate", { a: this.a, b: this.b });
    }
  }
}

// ---------- pan / image move ----------

export class PanTool implements Tool {
  readonly id = "pan" as const;
  cursor(): string {
    return "grab";
  }
  down(): void {}
  move(): void {}
  up(): void {}
  key(): boolean {
    return false;
  }
  cancel(): void {}
  overlay() {
    return nothing;
  }
}

export class ImageTool implements Tool {
  readonly id = "image" as const;
  private drag: { start: Pt; origin: Pt } | null = null;

  cursor(): string {
    return this.drag ? "grabbing" : "move";
  }

  down(ev: PointerEvent, host: ToolHost): void {
    const bg = host.floor.background;
    if (!bg) return;
    this.drag = { start: host.world(ev), origin: { x: bg.x, y: bg.y } };
  }

  private target(ev: PointerEvent, host: ToolHost): Pt | null {
    if (!this.drag) return null;
    const w = host.world(ev);
    return { x: this.drag.origin.x + w.x - this.drag.start.x, y: this.drag.origin.y + w.y - this.drag.start.y };
  }

  private withBg(p: Project, host: ToolHost, pos: Pt): Project {
    return {
      ...p,
      floors: p.floors.map((f) =>
        f.id === host.floor.id && f.background ? { ...f, background: { ...f.background, ...pos } } : f,
      ),
    };
  }

  move(ev: PointerEvent, host: ToolHost): void {
    const pos = this.target(ev, host);
    if (pos) host.setPreview(this.withBg(host.project, host, pos));
  }

  up(ev: PointerEvent, host: ToolHost): void {
    const pos = this.target(ev, host);
    this.drag = null;
    host.setPreview(null);
    if (pos) host.commit((p) => this.withBg(p, host, pos));
  }

  key(): boolean {
    return false;
  }

  cancel(host: ToolHost): void {
    this.drag = null;
    host.setPreview(null);
  }

  overlay() {
    return nothing;
  }
}

export function createTool(id: ToolId): Tool {
  switch (id) {
    case "wall":
      return new WallTool();
    case "room":
      return new RoomTool();
    case "measure":
      return new MeasureTool();
    case "calibrate":
      return new CalibrateTool();
    case "pan":
      return new PanTool();
    case "image":
      return new ImageTool();
    default:
      return new SelectTool();
  }
}

/** Place a device at a world point (used by drag-and-drop and place mode). */
export function placeAt(p: Project, ieee: string, floorId: string, pt: Pt): Project {
  const existing = p.placements[ieee];
  return placeDevice(p, ieee, {
    floorId,
    x: Math.round(pt.x * 20) / 20,
    y: Math.round(pt.y * 20) / 20,
    height: existing?.height ?? 1,
    ...(existing?.txPower !== undefined ? { txPower: existing.txPower } : {}),
  });
}
