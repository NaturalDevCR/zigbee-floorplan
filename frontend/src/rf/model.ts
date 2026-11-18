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
  buildingId: string;
  /** offset from the floor's local coordinates to site coordinates */
  offset: Pt;
}

const shift = (p: Pt, o: Pt): Pt => ({ x: p.x + o.x, y: p.y + o.y });

/** Copy of a floor with its geometry moved into site coordinates. */
function toSite(floor: Floor, o: Pt): Floor {
  if (!o.x && !o.y) return floor;
  return {
    ...floor,
    walls: floor.walls.map((w) => ({ ...w, a: shift(w.a, o), b: shift(w.b, o) })),
    rooms: floor.rooms.map((r) => ({ ...r, points: r.points.map((pt) => shift(pt, o)) })),
  };
}

/**
 * Everything is computed in site coordinates: each building's floors are
 * offset by the building position, so buildings shadow each other through
 * their exterior walls. Slabs only attenuate between floors of the same
 * building.
 */
export class RfScene {
  readonly floors = new Map<string, FloorInfo>();
  /** floors of each building, lowest level first */
  private readonly stacks = new Map<string, Floor[]>();
  /** every placed device that exists in the network */
  readonly nodes = new Map<string, Node3>();
  /** routers + coordinator */
  readonly emitters: Node3[] = [];
  readonly settings: RfSettings;

  constructor(project: Project, deviceTypes: Map<string, DeviceType>) {
    this.settings = project.settings;
    const offsets = new Map((project.buildings ?? []).map((b) => [b.id, { x: b.x, y: b.y }]));
    for (const floor of [...project.floors].sort((a, b) => a.level - b.level)) {
      const stack = this.stacks.get(floor.buildingId) ?? [];
      stack.push(floor);
      this.stacks.set(floor.buildingId, stack);
    }
    for (const [buildingId, stack] of this.stacks) {
      const offset = offsets.get(buildingId) ?? { x: 0, y: 0 };
      stack.forEach((raw, order) => {
        const floor = toSite(raw, offset);
        this.floors.set(raw.id, { floor, order, grid: new WallGrid(floor.walls, 1), buildingId, offset });
      });
    }
    for (const [ieee, pl] of Object.entries(project.placements)) {
      const type = deviceTypes.get(ieee);
      const info = this.floors.get(pl.floorId);
      if (!type || !info) continue;
      const node: Node3 = {
        ieee,
        type,
        floorId: pl.floorId,
        pos: shift(pl, info.offset),
        height: pl.height ?? RX_HEIGHT,
        tx: pl.txPower ?? txDefault(this.settings, type),
      };
      this.nodes.set(ieee, node);
      if (type === "Coordinator" || type === "Router") this.emitters.push(node);
    }
  }

  /** Offset that turns a floor's local coordinates into site coordinates. */
  offsetOf(floorId: string): Pt {
    return this.floors.get(floorId)?.offset ?? { x: 0, y: 0 };
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
      if (a.buildingId === b.buildingId) {
        const stack = this.stacks.get(a.buildingId)!;
        const lo = Math.min(a.order, b.order);
        const hi = Math.max(a.order, b.order);
        for (let i = lo + 1; i <= hi; i++) loss += materialDb(this.settings, stack[i].slab);
      }
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
