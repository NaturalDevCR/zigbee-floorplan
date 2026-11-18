import { materialDb } from "../materials";
import { WallGrid } from "../spatial-grid";
import type { Calibration, DeviceType, Floor, Project, Pt, RfSettings } from "../types";

export const DEFAULT_RF: RfSettings = {
  pathLossExponent: 2.2,
  refLoss1m: 40,
  rxSensitivity: -100,
  defaultTx: { Coordinator: 5, Router: 5, EndDevice: 3 },
  materials: {},
  autoCalibrate: true,
};

/** Receiver height used for coverage maps, meters above the floor. */
export const RX_HEIGHT = 1;
const MIN_DISTANCE = 0.5;

/** Approximate LQI → RSSI mapping (chip specific in reality). */
export const lqiToRssi = (lqi: number): number => -100 + (lqi * 60) / 255;
export const rssiToLqi = (rssi: number): number => ((rssi + 100) * 255) / 60;

export interface ModelParams {
  exponent: number;
  /** total loss at 1 m including calibration offset */
  refLoss: number;
}

export function modelParams(settings: RfSettings, cal: Calibration | null): ModelParams {
  if (cal?.applied && settings.autoCalibrate) {
    return { exponent: cal.exponent, refLoss: settings.refLoss1m + cal.offsetDb };
  }
  return { exponent: settings.pathLossExponent, refLoss: settings.refLoss1m };
}

export interface Node3 {
  ieee: string;
  type: DeviceType;
  floorId: string;
  pos: Pt;
  /** height above the floor, meters */
  height: number;
  tx: number;
}

interface FloorInfo {
  floor: Floor;
  order: number;
  grid: WallGrid;
}

export class RfScene {
  readonly floors = new Map<string, FloorInfo>();
  readonly sorted: Floor[];
  /** every placed device that exists in the network */
  readonly nodes = new Map<string, Node3>();
  /** routers + coordinator */
  readonly emitters: Node3[] = [];
  readonly settings: RfSettings;

  constructor(project: Project, deviceTypes: Map<string, DeviceType>) {
    this.settings = project.settings;
    this.sorted = [...project.floors].sort((a, b) => a.level - b.level);
    this.sorted.forEach((floor, order) => {
      this.floors.set(floor.id, { floor, order, grid: new WallGrid(floor.walls, 1) });
    });
    for (const [ieee, pl] of Object.entries(project.placements)) {
      const type = deviceTypes.get(ieee);
      if (!type || !this.floors.has(pl.floorId)) continue;
      const node: Node3 = {
        ieee,
        type,
        floorId: pl.floorId,
        pos: { x: pl.x, y: pl.y },
        height: pl.height ?? RX_HEIGHT,
        tx: pl.txPower ?? txDefault(this.settings, type),
      };
      this.nodes.set(ieee, node);
      if (type === "Coordinator" || type === "Router") this.emitters.push(node);
    }
  }

  absZ(floorId: string, height: number): number {
    return (this.floors.get(floorId)?.floor.elevation ?? 0) + height;
  }

  /** Wall + slab attenuation between two points (dB). */
  obstruction(fromFloor: string, from: Pt, toFloor: string, to: Pt): number {
    const a = this.floors.get(fromFloor);
    const b = this.floors.get(toFloor);
    if (!a || !b) return 0;
    let loss = 0;
    for (const w of b.grid.crossed(from, to)) loss += materialDb(this.settings, w.material);
    if (a !== b) {
      for (const w of a.grid.crossed(from, to)) loss += materialDb(this.settings, w.material);
      const lo = Math.min(a.order, b.order);
      const hi = Math.max(a.order, b.order);
      for (let i = lo + 1; i <= hi; i++) loss += materialDb(this.settings, this.sorted[i].slab);
    }
    return loss;
  }

  distance(fromFloor: string, from: Pt, fromH: number, toFloor: string, to: Pt, toH: number): number {
    const dz = this.absZ(toFloor, toH) - this.absZ(fromFloor, fromH);
    return Math.max(MIN_DISTANCE, Math.hypot(to.x - from.x, to.y - from.y, dz));
  }

  /** Estimated RSSI (dBm) at a point from an emitter. */
  rssi(e: Node3, floorId: string, pt: Pt, height: number, p: ModelParams): number {
    const d = this.distance(e.floorId, e.pos, e.height, floorId, pt, height);
    return e.tx - p.refLoss - 10 * p.exponent * Math.log10(d) - this.obstruction(e.floorId, e.pos, floorId, pt);
  }

  /** Free-space upper bound, used to prune expensive wall checks. */
  rssiUpperBound(e: Node3, floorId: string, pt: Pt, height: number, p: ModelParams): number {
    const d = this.distance(e.floorId, e.pos, e.height, floorId, pt, height);
    return e.tx - p.refLoss - 10 * p.exponent * Math.log10(d);
  }

  bestRssi(floorId: string, pt: Pt, height: number, p: ModelParams, exclude?: string): number {
    let best = -Infinity;
    for (const e of this.emitters) {
      if (e.ieee === exclude) continue;
      if (this.rssiUpperBound(e, floorId, pt, height, p) <= best) continue;
      const v = this.rssi(e, floorId, pt, height, p);
      if (v > best) best = v;
    }
    return best;
  }
}

export function txDefault(settings: RfSettings, type: DeviceType): number {
  if (type === "Unknown") return settings.defaultTx.EndDevice;
  return settings.defaultTx[type];
}
