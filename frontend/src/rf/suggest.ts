import type { Pt } from "../types";
import { WEAK_THRESHOLD } from "./colormap";
import { cellCenter, type Heatmap } from "./heatmap";
import { RX_HEIGHT, txDefault, type ModelParams, type Node3, type RfScene } from "./model";

export interface Suggestion {
  pos: Pt;
  floorId: string;
  /** m² of weak area brought above the weak threshold */
  gainArea: number;
  /** placed devices whose estimate rises above the weak threshold */
  fixedDevices: string[];
  /** expected signal of the new router from the existing mesh */
  rssiFromMesh: number;
}

const JOIN_THRESHOLD = -80;
const MAX_CANDIDATES = 400;
const MAX_EVAL = 2500;
const DEVICE_WEIGHT_M2 = 10;
const MIN_GAIN_M2 = 2;

/**
 * Greedy router placement: candidates on a coarse grid inside the coverage
 * area that can join the mesh reliably; pick the one that lifts the most weak
 * area (and weak devices), repeat with the new router included.
 */
export function suggestRouters(
  scene: RfScene,
  floorId: string,
  heat: Heatmap,
  p: ModelParams,
  max = 3,
): Suggestion[] {
  const inside: number[] = [];
  for (let i = 0; i < heat.mask.length; i++) if (heat.mask[i]) inside.push(i);
  if (!inside.length) return [];

  const cellArea = heat.cell * heat.cell;
  const evalStride = Math.max(1, Math.ceil(Math.sqrt(inside.length / MAX_EVAL)));
  const candStride = Math.max(
    Math.max(1, Math.round(1 / heat.cell)),
    Math.ceil(Math.sqrt(inside.length / MAX_CANDIDATES)),
  );

  type EvalPt = { pt: Pt; value: number; weight: number };
  const evalPts: EvalPt[] = [];
  const candidates: EvalPt[] = [];
  for (const i of inside) {
    const c = i % heat.cols;
    const r = Math.floor(i / heat.cols);
    if (c % evalStride === 0 && r % evalStride === 0) {
      evalPts.push({ pt: cellCenter(heat, c, r), value: heat.values[i], weight: cellArea * evalStride * evalStride });
    }
    if (c % candStride === Math.floor(candStride / 2) && r % candStride === Math.floor(candStride / 2)) {
      candidates.push({ pt: cellCenter(heat, c, r), value: heat.values[i], weight: 0 });
    }
  }

  // Placed end devices on any floor, with their current best estimate.
  const devices = [...scene.nodes.values()]
    .filter((n) => n.type === "EndDevice" || n.type === "Unknown")
    .map((n) => ({ node: n, value: scene.bestRssi(n.floorId, n.pos, n.height, p) }));

  const routerTx = txDefault(scene.settings, "Router");
  const virtual: Node3[] = [];
  const out: Suggestion[] = [];

  for (let k = 0; k < max; k++) {
    let best: { cand: EvalPt; score: number; area: number; fixed: string[] } | null = null;
    for (const cand of candidates) {
      if (cand.value < JOIN_THRESHOLD) continue;
      const router: Node3 = {
        ieee: `__suggest_${k}`,
        type: "Router",
        floorId,
        pos: cand.pt,
        height: RX_HEIGHT,
        tx: routerTx,
      };
      let area = 0;
      for (const e of evalPts) {
        if (e.value >= WEAK_THRESHOLD) continue;
        if (scene.rssiUpperBound(router, floorId, e.pt, RX_HEIGHT, p) < WEAK_THRESHOLD) continue;
        if (scene.rssi(router, floorId, e.pt, RX_HEIGHT, p) >= WEAK_THRESHOLD) area += e.weight;
      }
      const fixed: string[] = [];
      for (const d of devices) {
        if (d.value >= WEAK_THRESHOLD) continue;
        if (scene.rssi(router, d.node.floorId, d.node.pos, d.node.height, p) >= WEAK_THRESHOLD) {
          fixed.push(d.node.ieee);
        }
      }
      const score = area + fixed.length * DEVICE_WEIGHT_M2;
      if (!best || score > best.score) best = { cand, score, area, fixed };
    }
    if (!best || best.score < MIN_GAIN_M2) break;

    const router: Node3 = {
      ieee: `__suggest_${k}`,
      type: "Router",
      floorId,
      pos: best.cand.pt,
      height: RX_HEIGHT,
      tx: routerTx,
    };
    virtual.push(router);
    out.push({
      pos: best.cand.pt,
      floorId,
      gainArea: Math.round(best.area * 10) / 10,
      fixedDevices: best.fixed,
      rssiFromMesh: Math.round(best.cand.value),
    });

    // Fold the new router into coverage for the next round.
    const lift = (pt: Pt, fId: string, h: number, v: number) =>
      Math.max(v, scene.rssi(router, fId, pt, h, p));
    for (const e of evalPts) e.value = lift(e.pt, floorId, RX_HEIGHT, e.value);
    for (const c of candidates) c.value = lift(c.pt, floorId, RX_HEIGHT, c.value);
    for (const d of devices) d.value = lift(d.node.pos, d.node.floorId, d.node.height, d.value);
  }
  return out;
}
