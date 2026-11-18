import { dist, projectOnSegment } from "../geometry";
import type { Pt, Wall } from "../types";

export interface SnapContext {
  grid: number;
  vertices: Pt[];
  walls: Wall[];
  /** world-space distance considered "close" */
  tolerance: number;
  anchor?: Pt | null;
  /** degrees */
  angleStep?: number;
  disabled?: boolean;
  /** vertices to ignore (e.g. the one being dragged) */
  exclude?: Pt[];
}

export type SnapKind = "none" | "grid" | "vertex" | "wall" | "angle";

export interface SnapResult {
  pt: Pt;
  kind: SnapKind;
}

const roundTo = (v: number, step: number) => Math.round(v / step) * step;
const clean = (v: number) => Math.round(v * 1e6) / 1e6;

/** Snap priority: vertex > wall body > angle from anchor > grid. */
export function snapPoint(raw: Pt, ctx: SnapContext): SnapResult {
  if (ctx.disabled) return { pt: raw, kind: "none" };
  const excluded = (p: Pt) => ctx.exclude?.some((e) => dist(e, p) < 1e-6) ?? false;

  let best: Pt | null = null;
  let bestD = ctx.tolerance;
  for (const v of ctx.vertices) {
    if (excluded(v)) continue;
    const d = dist(v, raw);
    if (d <= bestD) {
      best = v;
      bestD = d;
    }
  }
  if (best) return { pt: { x: best.x, y: best.y }, kind: "vertex" };

  let wallHit: Pt | null = null;
  bestD = ctx.tolerance;
  for (const w of ctx.walls) {
    const p = projectOnSegment(raw, w.a, w.b);
    const d = dist(p, raw);
    if (d <= bestD) {
      wallHit = { x: clean(p.x), y: clean(p.y) };
      bestD = d;
    }
  }
  if (wallHit) return { pt: wallHit, kind: "wall" };

  if (ctx.anchor && ctx.angleStep) {
    const a = ctx.anchor;
    const len = dist(a, raw);
    if (len > ctx.tolerance) {
      const step = (ctx.angleStep * Math.PI) / 180;
      const ang = roundTo(Math.atan2(raw.y - a.y, raw.x - a.x), step);
      const snappedLen = Math.max(ctx.grid, roundTo(len, ctx.grid));
      const p = { x: clean(a.x + Math.cos(ang) * snappedLen), y: clean(a.y + Math.sin(ang) * snappedLen) };
      const onRay = { x: a.x + Math.cos(ang) * len, y: a.y + Math.sin(ang) * len };
      if (dist(onRay, raw) <= ctx.tolerance) return { pt: p, kind: "angle" };
    }
  }

  return { pt: { x: clean(roundTo(raw.x, ctx.grid)), y: clean(roundTo(raw.y, ctx.grid)) }, kind: "grid" };
}
