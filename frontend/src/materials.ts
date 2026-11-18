import type { MaterialId, RfSettings } from "./types";

export interface MaterialDef {
  id: MaterialId;
  db: number;
  /** wall material (true) or floor slab (false) */
  wall: boolean;
  color: string;
  /** stroke pattern hint for rendering */
  pattern: "solid" | "glass" | "hatch" | "dense";
}

export const MATERIALS: Record<MaterialId, MaterialDef> = {
  drywall: { id: "drywall", db: 3, wall: true, color: "#b8bcc6", pattern: "solid" },
  wood: { id: "wood", db: 4, wall: true, color: "#b98a5a", pattern: "solid" },
  glass: { id: "glass", db: 3, wall: true, color: "#7cc4e4", pattern: "glass" },
  glass_lowe: { id: "glass_lowe", db: 15, wall: true, color: "#4f8fb3", pattern: "glass" },
  brick: { id: "brick", db: 8, wall: true, color: "#c0634a", pattern: "hatch" },
  block: { id: "block", db: 11, wall: true, color: "#9a8f84", pattern: "hatch" },
  concrete: { id: "concrete", db: 15, wall: true, color: "#7d838c", pattern: "dense" },
  reinforced: { id: "reinforced", db: 22, wall: true, color: "#555b66", pattern: "dense" },
  metal: { id: "metal", db: 30, wall: true, color: "#3d4450", pattern: "dense" },
  slab_wood: { id: "slab_wood", db: 8, wall: false, color: "#b98a5a", pattern: "solid" },
  slab_concrete: { id: "slab_concrete", db: 20, wall: false, color: "#7d838c", pattern: "dense" },
};

export const WALL_MATERIALS = Object.values(MATERIALS).filter((m) => m.wall);
export const SLAB_MATERIALS = Object.values(MATERIALS).filter((m) => !m.wall);

export function materialDb(settings: Pick<RfSettings, "materials">, id: MaterialId): number {
  return settings.materials[id] ?? MATERIALS[id]?.db ?? 0;
}

export function isMaterialId(value: unknown): value is MaterialId {
  return typeof value === "string" && value in MATERIALS;
}
