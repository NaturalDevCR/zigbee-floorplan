import type { Calibration, ZLink } from "../types";
import { lqiToRssi, type RfScene } from "./model";

const MIN_SAMPLES = 3;
const N_MIN = 1.6;
const N_MAX = 4;
const OFFSET_LIMIT = 20;
/** LQI at or above this is saturated and carries no distance information. */
const LQI_SATURATED = 250;

/**
 * Fit path-loss exponent and offset to real links between placed devices.
 * For each directed observation: y = Tx − RSSI_est − obstruction = PL0' + n·x,
 * with x = 10·log10(d). Linear least squares, clamped to physical ranges.
 */
export function calibrate(scene: RfScene, links: ZLink[]): Calibration {
  const xs: number[] = [];
  const ys: number[] = [];
  const refLoss = scene.settings.refLoss1m;

  const observe = (txIeee: string, rxIeee: string, lqi: number | null) => {
    if (lqi === null || lqi <= 0 || lqi >= LQI_SATURATED) return;
    const tx = scene.nodes.get(txIeee);
    const rx = scene.nodes.get(rxIeee);
    if (!tx || !rx) return;
    const d = scene.distance(tx.floorId, tx.pos, tx.height, rx.floorId, rx.pos, rx.height);
    const obstruction = scene.obstruction(tx.floorId, tx.pos, rx.floorId, rx.pos);
    xs.push(10 * Math.log10(d));
    ys.push(tx.tx - lqiToRssi(lqi) - obstruction);
  };

  for (const link of links) {
    observe(link.a, link.b, link.lqi_ab);
    observe(link.b, link.a, link.lqi_ba);
  }

  const samples = xs.length;
  const fallback: Calibration = {
    applied: false,
    offsetDb: 0,
    exponent: scene.settings.pathLossExponent,
    rmse: null,
    samples,
  };
  if (samples < MIN_SAMPLES) return fallback;

  const mx = mean(xs);
  const my = mean(ys);
  let sxx = 0;
  let sxy = 0;
  for (let i = 0; i < samples; i++) {
    sxx += (xs[i] - mx) ** 2;
    sxy += (xs[i] - mx) * (ys[i] - my);
  }
  // Too little spread in distance: keep the configured exponent, fit offset only.
  let n = sxx > 0.5 ? sxy / sxx : scene.settings.pathLossExponent;
  n = clamp(n, N_MIN, N_MAX);
  const offset = clamp(my - n * mx - refLoss, -OFFSET_LIMIT, OFFSET_LIMIT);

  let sse = 0;
  for (let i = 0; i < samples; i++) sse += (ys[i] - (refLoss + offset + n * xs[i])) ** 2;

  return {
    applied: true,
    offsetDb: round(offset, 1),
    exponent: round(n, 2),
    rmse: round(Math.sqrt(sse / samples), 1),
    samples,
  };
}

const mean = (v: number[]) => v.reduce((s, x) => s + x, 0) / v.length;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const round = (v: number, digits: number) => Math.round(v * 10 ** digits) / 10 ** digits;
