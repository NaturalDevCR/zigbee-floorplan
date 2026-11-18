import { add, dist } from "../geometry";
import { isMaterialId } from "../materials";
import { DEFAULT_RF } from "../rf/model";
import type {
  Floor,
  FloorBackground,
  MaterialId,
  Placement,
  Project,
  Pt,
  RfSettings,
  Room,
  Wall,
} from "../types";

export const DEFAULT_FLOOR_HEIGHT = 2.7;
export const DEFAULT_WALL_THICKNESS = 0.15;
const SAME_POINT = 1e-6;

/** Random 12-hex id. Works outside secure contexts (plain-http HA). */
export function newId(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function createProject(): Project {
  return { version: 1, floors: [], placements: {}, settings: cloneSettings(DEFAULT_RF) };
}

function cloneSettings(s: RfSettings): RfSettings {
  return { ...s, defaultTx: { ...s.defaultTx }, materials: { ...s.materials } };
}

const sortFloors = (floors: Floor[]) => [...floors].sort((a, b) => a.level - b.level);

function mapFloor(p: Project, floorId: string, fn: (f: Floor) => Floor): Project {
  return { ...p, floors: p.floors.map((f) => (f.id === floorId ? fn(f) : f)) };
}

export function getFloor(p: Project, floorId: string | null | undefined): Floor | undefined {
  return p.floors.find((f) => f.id === floorId);
}

// ---------- floors ----------

export function addFloor(p: Project, name: string): { project: Project; floorId: string } {
  const top = p.floors[p.floors.length - 1];
  const floor: Floor = {
    id: newId(),
    name,
    level: top ? top.level + 1 : 0,
    elevation: top ? round(top.elevation + top.height) : 0,
    height: DEFAULT_FLOOR_HEIGHT,
    slab: "slab_concrete",
    walls: [],
    rooms: [],
  };
  return { project: { ...p, floors: sortFloors([...p.floors, floor]) }, floorId: floor.id };
}

export function updateFloor(p: Project, floorId: string, patch: Partial<Omit<Floor, "id">>): Project {
  const next = mapFloor(p, floorId, (f) => ({ ...f, ...patch }));
  return { ...next, floors: sortFloors(next.floors) };
}

export function removeFloor(p: Project, floorId: string): Project {
  const placements = Object.fromEntries(
    Object.entries(p.placements).filter(([, pl]) => pl.floorId !== floorId),
  );
  return { ...p, floors: p.floors.filter((f) => f.id !== floorId), placements };
}

export function duplicateFloor(p: Project, floorId: string): { project: Project; floorId: string } {
  const src = getFloor(p, floorId);
  if (!src) return { project: p, floorId };
  const top = p.floors[p.floors.length - 1];
  const copy: Floor = {
    ...src,
    id: newId(),
    name: `${src.name} (2)`,
    level: top.level + 1,
    elevation: round(top.elevation + top.height),
    walls: src.walls.map((w) => ({ ...w, id: newId() })),
    rooms: src.rooms.map((r) => ({ ...r, id: newId(), points: r.points.map((pt) => ({ ...pt })) })),
  };
  return { project: { ...p, floors: sortFloors([...p.floors, copy]) }, floorId: copy.id };
}

export function setBackground(p: Project, floorId: string, bg: FloorBackground | undefined): Project {
  return mapFloor(p, floorId, (f) => {
    const next = { ...f };
    if (bg) next.background = bg;
    else delete next.background;
    return next;
  });
}

// ---------- walls & rooms ----------

export function addWalls(
  p: Project,
  floorId: string,
  walls: Omit<Wall, "id">[],
): { project: Project; ids: string[] } {
  const created = walls
    .filter((w) => dist(w.a, w.b) > SAME_POINT)
    .map((w) => ({ ...w, id: newId() }));
  return {
    project: mapFloor(p, floorId, (f) => ({ ...f, walls: [...f.walls, ...created] })),
    ids: created.map((w) => w.id),
  };
}

export function updateWalls(
  p: Project,
  floorId: string,
  ids: string[],
  patch: Partial<Omit<Wall, "id">>,
): Project {
  const set = new Set(ids);
  return mapFloor(p, floorId, (f) => ({
    ...f,
    walls: f.walls.map((w) => (set.has(w.id) ? { ...w, ...patch } : w)),
  }));
}

export function addRoom(
  p: Project,
  floorId: string,
  name: string,
  points: Pt[],
): { project: Project; id: string } {
  const room: Room = { id: newId(), name, points: points.map((pt) => ({ ...pt })) };
  return { project: mapFloor(p, floorId, (f) => ({ ...f, rooms: [...f.rooms, room] })), id: room.id };
}

export function updateRoom(p: Project, floorId: string, id: string, patch: Partial<Omit<Room, "id">>): Project {
  return mapFloor(p, floorId, (f) => ({
    ...f,
    rooms: f.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)),
  }));
}

export function removeItems(p: Project, floorId: string, ids: string[]): Project {
  const set = new Set(ids);
  return mapFloor(p, floorId, (f) => ({
    ...f,
    walls: f.walls.filter((w) => !set.has(w.id)),
    rooms: f.rooms.filter((r) => !set.has(r.id)),
  }));
}

/**
 * Translate walls/rooms by delta. Endpoints of other walls that coincide with a
 * moved wall's endpoint follow, so connected walls stretch instead of tearing.
 */
export function moveItems(p: Project, floorId: string, ids: string[], delta: Pt): Project {
  const set = new Set(ids);
  return mapFloor(p, floorId, (f) => {
    const anchors = f.walls.filter((w) => set.has(w.id)).flatMap((w) => [w.a, w.b]);
    const follows = (pt: Pt) => anchors.some((a) => dist(a, pt) < SAME_POINT);
    return {
      ...f,
      walls: f.walls.map((w) => {
        if (set.has(w.id)) return { ...w, a: add(w.a, delta), b: add(w.b, delta) };
        const fa = follows(w.a);
        const fb = follows(w.b);
        if (!fa && !fb) return w;
        return { ...w, a: fa ? add(w.a, delta) : w.a, b: fb ? add(w.b, delta) : w.b };
      }),
      rooms: f.rooms.map((r) => (set.has(r.id) ? { ...r, points: r.points.map((pt) => add(pt, delta)) } : r)),
    };
  });
}

export type VertexRef = { kind: "wall"; id: string; end: "a" | "b" } | { kind: "room"; id: string; index: number };

/** Move a single vertex to an absolute position; coincident wall endpoints follow. */
export function moveVertex(p: Project, floorId: string, ref: VertexRef, to: Pt): Project {
  return mapFloor(p, floorId, (f) => {
    if (ref.kind === "room") {
      return {
        ...f,
        rooms: f.rooms.map((r) =>
          r.id === ref.id ? { ...r, points: r.points.map((pt, i) => (i === ref.index ? { ...to } : pt)) } : r,
        ),
      };
    }
    const wall = f.walls.find((w) => w.id === ref.id);
    if (!wall) return f;
    const from = wall[ref.end];
    return {
      ...f,
      walls: f.walls.map((w) => ({
        ...w,
        a: dist(w.a, from) < SAME_POINT ? { ...to } : w.a,
        b: dist(w.b, from) < SAME_POINT ? { ...to } : w.b,
      })).filter((w) => dist(w.a, w.b) > SAME_POINT),
    };
  });
}

// ---------- devices & settings ----------

export function placeDevice(p: Project, ieee: string, placement: Placement): Project {
  return { ...p, placements: { ...p.placements, [ieee]: placement } };
}

export function updatePlacement(p: Project, ieee: string, patch: Partial<Placement>): Project {
  const cur = p.placements[ieee];
  if (!cur) return p;
  return placeDevice(p, ieee, { ...cur, ...patch });
}

export function unplaceDevice(p: Project, ieee: string): Project {
  const placements = { ...p.placements };
  delete placements[ieee];
  return { ...p, placements };
}

export function updateSettings(p: Project, patch: Partial<RfSettings>): Project {
  return { ...p, settings: { ...p.settings, ...patch } };
}

// ---------- normalization ----------

const num = (v: unknown, fallback: number): number =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;
const isPt = (v: unknown): v is Pt =>
  !!v && typeof v === "object" && Number.isFinite((v as Pt).x) && Number.isFinite((v as Pt).y) &&
  typeof (v as Pt).x === "number" && typeof (v as Pt).y === "number";
const str = (v: unknown, fallback: string) => (typeof v === "string" && v ? v : fallback);
const obj = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

function normWall(raw: unknown): Wall | null {
  const w = obj(raw);
  if (!isPt(w.a) || !isPt(w.b) || dist(w.a, w.b) <= SAME_POINT) return null;
  return {
    id: str(w.id, newId()),
    a: { x: w.a.x, y: w.a.y },
    b: { x: w.b.x, y: w.b.y },
    thickness: Math.max(0.02, num(w.thickness, DEFAULT_WALL_THICKNESS)),
    material: isMaterialId(w.material) ? w.material : "drywall",
  };
}

function normRoom(raw: unknown): Room | null {
  const r = obj(raw);
  const points = Array.isArray(r.points) ? r.points.filter(isPt).map((pt) => ({ x: pt.x, y: pt.y })) : [];
  if (points.length < 3) return null;
  return { id: str(r.id, newId()), name: str(r.name, ""), points };
}

function normBackground(raw: unknown): FloorBackground | undefined {
  const b = obj(raw);
  if (typeof b.imageId !== "string" || !/^[0-9a-f]{32}$/.test(b.imageId)) return undefined;
  if (!(num(b.width, 0) > 0) || !(num(b.height, 0) > 0)) return undefined;
  return {
    imageId: b.imageId,
    width: num(b.width, 0),
    height: num(b.height, 0),
    x: num(b.x, 0),
    y: num(b.y, 0),
    scale: num(b.scale, 0.01) > 0 ? num(b.scale, 0.01) : 0.01,
    rotation: num(b.rotation, 0),
    opacity: Math.min(1, Math.max(0, num(b.opacity, 0.5))),
    visible: b.visible !== false,
  };
}

function normFloor(raw: unknown, index: number): Floor | null {
  const f = obj(raw);
  if (typeof f.id !== "string" || !f.id) return null;
  const level = num(f.level, index);
  const floor: Floor = {
    id: f.id,
    name: str(f.name, `Floor ${index + 1}`),
    level,
    elevation: num(f.elevation, level * DEFAULT_FLOOR_HEIGHT),
    height: Math.max(1, num(f.height, DEFAULT_FLOOR_HEIGHT)),
    slab: isMaterialId(f.slab) ? (f.slab as MaterialId) : "slab_concrete",
    walls: Array.isArray(f.walls) ? f.walls.map(normWall).filter((w): w is Wall => !!w) : [],
    rooms: Array.isArray(f.rooms) ? f.rooms.map(normRoom).filter((r): r is Room => !!r) : [],
  };
  const bg = normBackground(f.background);
  if (bg) floor.background = bg;
  return floor;
}

export function normalizeProject(raw: unknown): Project {
  const r = obj(raw);
  const floors = sortFloors(
    (Array.isArray(r.floors) ? r.floors : []).map(normFloor).filter((f): f is Floor => !!f),
  );
  const floorIds = new Set(floors.map((f) => f.id));
  const placements: Record<string, Placement> = {};
  for (const [ieee, value] of Object.entries(obj(r.placements))) {
    const pl = obj(value);
    if (typeof pl.floorId !== "string" || !floorIds.has(pl.floorId)) continue;
    if (!Number.isFinite(pl.x) || !Number.isFinite(pl.y)) continue;
    const placement: Placement = {
      floorId: pl.floorId,
      x: pl.x as number,
      y: pl.y as number,
      height: num(pl.height, 1),
    };
    if (typeof pl.txPower === "number" && Number.isFinite(pl.txPower)) placement.txPower = pl.txPower;
    placements[ieee] = placement;
  }
  const s = obj(r.settings);
  const settings: RfSettings = {
    pathLossExponent: num(s.pathLossExponent, DEFAULT_RF.pathLossExponent),
    refLoss1m: num(s.refLoss1m, DEFAULT_RF.refLoss1m),
    rxSensitivity: num(s.rxSensitivity, DEFAULT_RF.rxSensitivity),
    defaultTx: {
      Coordinator: num(obj(s.defaultTx).Coordinator, DEFAULT_RF.defaultTx.Coordinator),
      Router: num(obj(s.defaultTx).Router, DEFAULT_RF.defaultTx.Router),
      EndDevice: num(obj(s.defaultTx).EndDevice, DEFAULT_RF.defaultTx.EndDevice),
    },
    materials: Object.fromEntries(
      Object.entries(obj(s.materials)).filter(([k, v]) => isMaterialId(k) && typeof v === "number" && Number.isFinite(v)),
    ),
    autoCalibrate: s.autoCalibrate !== false,
  };
  return { version: 1, floors, placements, settings };
}

const round = (v: number) => Math.round(v * 1000) / 1000;
