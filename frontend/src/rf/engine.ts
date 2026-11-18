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
  /** floors to map: one in building view, one per visible building in site view */
  floorIds: string[];
  suggest: boolean;
}

/** Coverage raster in site coordinates. */
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
  floorIds: string[];
  heats: RfHeat[];
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

  const heats: RfHeat[] = [];
  const suggestions: Suggestion[] = [];
  for (const floorId of req.floorIds) {
    const heatmap = computeHeatmap(scene, floorId, params);
    if (!heatmap) continue;
    const rgba = new Uint8ClampedArray(heatmap.cols * heatmap.rows * 4);
    for (let i = 0; i < heatmap.values.length; i++) {
      if (!heatmap.mask[i]) continue;
      rgba.set(colorFor(heatmap.values[i]), i * 4);
    }
    heats.push({
      floorId: heatmap.floorId,
      originX: heatmap.originX,
      originY: heatmap.originY,
      cell: heatmap.cell,
      cols: heatmap.cols,
      rows: heatmap.rows,
      rgba,
      values: heatmap.values,
    });
    if (req.suggest) suggestions.push(...suggestRouters(scene, floorId, heatmap, params));
  }

  return {
    floorIds: req.floorIds,
    heats,
    calibration,
    suggestions,
    deviceRssi,
    elapsedMs: Math.round(performance.now() - t0),
  };
}
