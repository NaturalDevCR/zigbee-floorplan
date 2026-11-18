import type { BBox } from "../geometry";
import type { Pt } from "../types";

/** scale = screen px per meter; tx/ty = screen offset of the world origin. */
export interface Viewport {
  scale: number;
  tx: number;
  ty: number;
}

export const MIN_SCALE = 4;
export const MAX_SCALE = 800;
const DEFAULT_SCALE = 40;

export const toScreen = (v: Viewport, p: Pt): Pt => ({ x: p.x * v.scale + v.tx, y: p.y * v.scale + v.ty });
export const toWorld = (v: Viewport, s: Pt): Pt => ({ x: (s.x - v.tx) / v.scale, y: (s.y - v.ty) / v.scale });

export function zoomAt(v: Viewport, screen: Pt, factor: number): Viewport {
  const scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, v.scale * factor));
  const k = scale / v.scale;
  return { scale, tx: screen.x - (screen.x - v.tx) * k, ty: screen.y - (screen.y - v.ty) * k };
}

export function fitViewport(box: BBox | null, width: number, height: number, padding = 48): Viewport {
  if (!box || width <= 0 || height <= 0) {
    return { scale: DEFAULT_SCALE, tx: width / 2, ty: height / 2 };
  }
  const w = Math.max(box.maxX - box.minX, 1);
  const h = Math.max(box.maxY - box.minY, 1);
  const scale = Math.min(
    MAX_SCALE,
    Math.max(MIN_SCALE, Math.min((width - 2 * padding) / w, (height - 2 * padding) / h)),
  );
  const cx = (box.minX + box.maxX) / 2;
  const cy = (box.minY + box.maxY) / 2;
  return { scale, tx: width / 2 - cx * scale, ty: height / 2 - cy * scale };
}
