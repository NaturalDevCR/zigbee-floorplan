import type { Calibration, DeviceType, Project, ZLink } from "../types";
import { calibrate } from "./calibrate";
import { colorFor } from "./colormap";
import { computeHeatmap } from "./heatmap";
import { modelParams, RfScene } from "./model";
import { suggestRouters, type Suggestion } from "./suggest";

export interface RfRequest {
  project: Project;
  devices: { ieee: string; type: DeviceType }[];
  links: ZLink[];
  floorId: string;
  suggest: boolean;
}

export interface RfHeat {
  floorId: string;
  originX: number;
  originY: number;
  cell: number;
  cols: number;
  rows: number;
  rgba: Uint8ClampedArray;
  values: Float32Array;
}

export interface RfResult {
  floorId: string;
  heat: RfHeat | null;
  calibration: Calibration;
  suggestions: Suggestion[];
  /** estimated best RSSI at each placed device from the rest of the mesh */
  deviceRssi: Record<string, number>;
  elapsedMs: number;
}

export function runRf(req: RfRequest): RfResult {
  const t0 = performance.now();
  const types = new Map(req.devices.map((d) => [d.ieee, d.type]));
  const scene = new RfScene(req.project, types);
  const calibration = calibrate(scene, req.links);
  const params = modelParams(req.project.settings, calibration);

  const deviceRssi: Record<string, number> = {};
  for (const node of scene.nodes.values()) {
    const v = scene.bestRssi(node.floorId, node.pos, node.height, params, node.ieee);
    if (Number.isFinite(v)) deviceRssi[node.ieee] = Math.round(v);
  }

  const heatmap = computeHeatmap(scene, req.floorId, params);
  let heat: RfHeat | null = null;
  let suggestions: Suggestion[] = [];
  if (heatmap) {
    const rgba = new Uint8ClampedArray(heatmap.cols * heatmap.rows * 4);
    for (let i = 0; i < heatmap.values.length; i++) {
      if (!heatmap.mask[i]) continue;
      const c = colorFor(heatmap.values[i]);
      rgba.set(c, i * 4);
    }
    heat = {
      floorId: heatmap.floorId,
      originX: heatmap.originX,
      originY: heatmap.originY,
      cell: heatmap.cell,
      cols: heatmap.cols,
      rows: heatmap.rows,
      rgba,
      values: heatmap.values,
    };
    if (req.suggest) suggestions = suggestRouters(scene, req.floorId, heatmap, params);
  }

  return {
    floorId: req.floorId,
    heat,
    calibration,
    suggestions,
    deviceRssi,
    elapsedMs: Math.round(performance.now() - t0),
  };
}
