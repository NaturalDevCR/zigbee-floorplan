import { bboxOf, segIntersect } from "./geometry";
import type { Pt, Wall } from "./types";

/**
 * Uniform grid over wall segments for fast "which walls does this ray cross"
 * queries. Walls are inserted into every cell their bounding box covers; rays
 * are traversed with a conservative DDA, then confirmed exactly.
 */
export class WallGrid {
  private readonly cells = new Map<number, number[]>();
  private readonly stamp: Uint32Array;
  private query = 0;
  private readonly minX: number;
  private readonly minY: number;
  private readonly cols: number;
  private readonly rows: number;

  constructor(
    readonly walls: Wall[],
    readonly cell = 1,
  ) {
    this.stamp = new Uint32Array(walls.length);
    const box = bboxOf(walls.flatMap((w) => [w.a, w.b]));
    this.minX = box ? box.minX : 0;
    this.minY = box ? box.minY : 0;
    this.cols = box ? Math.max(1, Math.floor((box.maxX - box.minX) / cell) + 1) : 0;
    this.rows = box ? Math.max(1, Math.floor((box.maxY - box.minY) / cell) + 1) : 0;
    walls.forEach((w, i) => {
      const c0 = this.col(Math.min(w.a.x, w.b.x));
      const c1 = this.col(Math.max(w.a.x, w.b.x));
      const r0 = this.row(Math.min(w.a.y, w.b.y));
      const r1 = this.row(Math.max(w.a.y, w.b.y));
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const key = r * this.cols + c;
          let list = this.cells.get(key);
          if (!list) this.cells.set(key, (list = []));
          list.push(i);
        }
      }
    });
  }

  private col(x: number) {
    return Math.min(this.cols - 1, Math.max(0, Math.floor((x - this.minX) / this.cell)));
  }

  private row(y: number) {
    return Math.min(this.rows - 1, Math.max(0, Math.floor((y - this.minY) / this.cell)));
  }

  /** Walls whose segment touches or crosses the segment a→b. */
  crossed(a: Pt, b: Pt): Wall[] {
    if (!this.walls.length) return [];
    if (++this.query === 0xffffffff) {
      this.stamp.fill(0);
      this.query = 1;
    }
    const out: Wall[] = [];
    const q = this.query;
    const visit = (c: number, r: number) => {
      if (c < 0 || r < 0 || c >= this.cols || r >= this.rows) return;
      const list = this.cells.get(r * this.cols + c);
      if (!list) return;
      for (const i of list) {
        if (this.stamp[i] === q) continue;
        this.stamp[i] = q;
        const w = this.walls[i];
        if (segIntersect(a, b, w.a, w.b)) out.push(w);
      }
    };

    // Clip the ray to the grid extent so the DDA starts inside.
    const ext = {
      x0: this.minX,
      y0: this.minY,
      x1: this.minX + this.cols * this.cell,
      y1: this.minY + this.rows * this.cell,
    };
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    let t0 = 0;
    let t1 = 1;
    const clip = (p: number, q2: number) => {
      if (Math.abs(p) < 1e-12) return q2 >= 0;
      const t = q2 / p;
      if (p < 0) {
        if (t > t1) return false;
        if (t > t0) t0 = t;
      } else {
        if (t < t0) return false;
        if (t < t1) t1 = t;
      }
      return true;
    };
    const tol = 1e-9;
    if (
      !clip(-dx, a.x - ext.x0 + tol) ||
      !clip(dx, ext.x1 - a.x + tol) ||
      !clip(-dy, a.y - ext.y0 + tol) ||
      !clip(dy, ext.y1 - a.y + tol)
    ) {
      return out;
    }

    const sx = a.x + dx * t0;
    const sy = a.y + dy * t0;
    const ex = a.x + dx * t1;
    const ey = a.y + dy * t1;
    let c = Math.floor((sx - this.minX) / this.cell);
    let r = Math.floor((sy - this.minY) / this.cell);
    const cEnd = Math.floor((ex - this.minX) / this.cell);
    const rEnd = Math.floor((ey - this.minY) / this.cell);
    const stepC = dx > 0 ? 1 : dx < 0 ? -1 : 0;
    const stepR = dy > 0 ? 1 : dy < 0 ? -1 : 0;
    const len = (t1 - t0) || 1;
    const tDeltaX = stepC ? this.cell / Math.abs(dx * len) : Infinity;
    const tDeltaY = stepR ? this.cell / Math.abs(dy * len) : Infinity;
    const fx = (sx - this.minX) / this.cell - c;
    const fy = (sy - this.minY) / this.cell - r;
    let tMaxX = stepC > 0 ? (1 - fx) * tDeltaX : stepC < 0 ? fx * tDeltaX : Infinity;
    let tMaxY = stepR > 0 ? (1 - fy) * tDeltaY : stepR < 0 ? fy * tDeltaY : Infinity;

    // Visit the 3x3 neighbourhood on each step: walls touching cell borders and
    // floating point drift at corners are then always covered.
    const visitAround = (cc: number, rr: number) => {
      for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) visit(cc + i, rr + j);
    };
    const maxSteps = this.cols + this.rows + 4;
    for (let n = 0; n < maxSteps; n++) {
      visitAround(c, r);
      if (c === cEnd && r === rEnd) break;
      if (tMaxX < tMaxY) {
        c += stepC;
        tMaxX += tDeltaX;
      } else {
        r += stepR;
        tMaxY += tDeltaY;
      }
      if (tMaxX > 1 + tDeltaX && tMaxY > 1 + tDeltaY) {
        visitAround(c, r);
        break;
      }
    }
    return out;
  }
}
