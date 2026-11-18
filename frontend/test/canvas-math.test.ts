import { describe, expect, it } from "vitest";
import { snapPoint } from "../src/canvas/snapping";
import { fitViewport, toScreen, toWorld, zoomAt } from "../src/canvas/viewport";
import type { Wall } from "../src/types";

describe("viewport", () => {
  const v = { scale: 50, tx: 100, ty: 20 };

  it("round-trips world and screen", () => {
    const w = toWorld(v, toScreen(v, { x: 3, y: -2 }));
    expect(w.x).toBeCloseTo(3);
    expect(w.y).toBeCloseTo(-2);
  });

  it("zoomAt keeps the world point under the cursor fixed", () => {
    const cursor = { x: 240, y: 180 };
    const before = toWorld(v, cursor);
    const z = zoomAt(v, cursor, 1.7);
    expect(z.scale).toBeCloseTo(85);
    const after = toWorld(z, cursor);
    expect(after.x).toBeCloseTo(before.x);
    expect(after.y).toBeCloseTo(before.y);
  });

  it("zoom is clamped", () => {
    expect(zoomAt(v, { x: 0, y: 0 }, 1000).scale).toBe(800);
    expect(zoomAt(v, { x: 0, y: 0 }, 0.0001).scale).toBe(4);
  });

  it("fit centers the bounds", () => {
    const f = fitViewport({ minX: 0, minY: 0, maxX: 10, maxY: 5 }, 600, 400, 50);
    const c = toScreen(f, { x: 5, y: 2.5 });
    expect(c.x).toBeCloseTo(300);
    expect(c.y).toBeCloseTo(200);
    expect(f.scale).toBeCloseTo(50);
  });

  it("fit without bounds shows a default area", () => {
    const f = fitViewport(null, 600, 400);
    expect(toScreen(f, { x: 0, y: 0 })).toEqual({ x: 300, y: 200 });
  });
});

describe("snapPoint", () => {
  const walls: Wall[] = [
    { id: "w", a: { x: 0, y: 0 }, b: { x: 10, y: 0 }, thickness: 0.1, material: "brick" },
  ];
  const base = { grid: 0.5, vertices: [{ x: 0, y: 0 }, { x: 10, y: 0 }], walls, tolerance: 0.3 };

  it("prefers vertices", () => {
    expect(snapPoint({ x: 9.85, y: 0.1 }, base)).toMatchObject({ kind: "vertex", pt: { x: 10, y: 0 } });
  });

  it("snaps onto wall bodies", () => {
    expect(snapPoint({ x: 4.33, y: 0.2 }, base)).toMatchObject({ kind: "wall", pt: { x: 4.33, y: 0 } });
  });

  it("falls back to grid", () => {
    expect(snapPoint({ x: 3.2, y: 4.8 }, base)).toMatchObject({ kind: "grid", pt: { x: 3, y: 5 } });
  });

  it("angle snaps relative to the anchor", () => {
    const res = snapPoint({ x: 5.1, y: 5.13 }, { ...base, vertices: [], walls: [], anchor: { x: 5, y: 2 }, angleStep: 15 });
    expect(res.kind).toBe("angle");
    expect(res.pt.x).toBeCloseTo(5);
    expect(res.pt.y).toBeCloseTo(5);
  });

  it("can be disabled", () => {
    expect(snapPoint({ x: 9.9, y: 0.1 }, { ...base, disabled: true })).toMatchObject({ kind: "none", pt: { x: 9.9, y: 0.1 } });
  });

  it("excludes given vertices", () => {
    const res = snapPoint({ x: 0.05, y: 0.05 }, { ...base, walls: [], exclude: [{ x: 0, y: 0 }] });
    expect(res.kind).toBe("grid");
  });
});
