import { bboxOf, pointInPolygon, unionBBox } from "../geometry";
import type { Pt } from "../types";
import { RX_HEIGHT, type ModelParams, type RfScene } from "./model";

export interface Heatmap {
  floorId: string;
  originX: number;
  originY: number;
  cell: number;
  cols: number;
  rows: number;
  /** best RSSI per cell (dBm), row-major */
  values: Float32Array;
  /** 1 = inside the coverage area */
  mask: Uint8Array;
}

const MAX_CELLS = 40000;
const MIN_CELL = 0.1;
const MARGIN = 1;
const NICE = [0.1, 0.125, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.75, 1, 1.5, 2];

export function cellCenter(h: Heatmap, c: number, r: number): Pt {
  return { x: h.originX + (c + 0.5) * h.cell, y: h.originY + (r + 0.5) * h.cell };
}

export function computeHeatmap(scene: RfScene, floorId: string, p: ModelParams): Heatmap | null {
  const info = scene.floors.get(floorId);
  if (!info) return null;
  const { floor } = info;
  const rooms = floor.rooms.filter((r) => r.points.length >= 3);
  const nodesHere = [...scene.nodes.values()].filter((n) => n.floorId === floorId).map((n) => n.pos);

  let box = rooms.length
    ? bboxOf(rooms.flatMap((r) => r.points))
    : bboxOf(floor.walls.flatMap((w) => [w.a, w.b]));
  if (!rooms.length) box = unionBBox(box, bboxOf(nodesHere));
  if (!box || !scene.emitters.length) return null;

  const margin = rooms.length ? 0 : MARGIN;
  const minX = box.minX - margin;
  const minY = box.minY - margin;
  const w = Math.max(1, box.maxX - box.minX + 2 * margin);
  const h = Math.max(1, box.maxY - box.minY + 2 * margin);
  const ideal = Math.max(MIN_CELL, Math.sqrt((w * h) / MAX_CELLS));
  const cell = NICE.find((v) => v >= ideal) ?? Math.ceil(ideal);
  const cols = Math.ceil(w / cell);
  const rows = Math.ceil(h / cell);

  const heat: Heatmap = {
    floorId,
    originX: minX,
    originY: minY,
    cell,
    cols,
    rows,
    values: new Float32Array(cols * rows),
    mask: new Uint8Array(cols * rows),
  };

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const pt = cellCenter(heat, c, r);
      const inside = rooms.length ? rooms.some((room) => pointInPolygon(pt, room.points)) : true;
      heat.mask[i] = inside ? 1 : 0;
      heat.values[i] = inside ? scene.bestRssi(floorId, pt, RX_HEIGHT, p) : -Infinity;
    }
  }
  return heat;
}
