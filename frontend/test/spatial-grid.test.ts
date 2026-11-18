import { describe, expect, it } from "vitest";
import { segIntersect } from "../src/geometry";
import { WallGrid } from "../src/spatial-grid";
import type { Wall } from "../src/types";

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

function wall(id: string, ax: number, ay: number, bx: number, by: number): Wall {
  return { id, a: { x: ax, y: ay }, b: { x: bx, y: by }, thickness: 0.1, material: "brick" };
}

describe("WallGrid", () => {
  it("matches brute force on random segments", () => {
    const r = rng(42);
    const walls: Wall[] = [];
    for (let i = 0; i < 150; i++) {
      const x = r() * 30 - 5;
      const y = r() * 20 - 5;
      walls.push(wall(`w${i}`, x, y, x + (r() - 0.5) * 8, y + (r() - 0.5) * 8));
    }
    // include grid-aligned walls
    walls.push(wall("h", 0, 2, 20, 2), wall("v", 4, -3, 4, 15));
    const grid = new WallGrid(walls, 1);
    for (let i = 0; i < 400; i++) {
      const a = { x: r() * 40 - 10, y: r() * 30 - 10 };
      const b = i % 5 === 0 ? { x: a.x, y: r() * 30 - 10 } : { x: r() * 40 - 10, y: r() * 30 - 10 };
      const expected = walls.filter((w) => segIntersect(a, b, w.a, w.b)).map((w) => w.id).sort();
      const got = grid.crossed(a, b).map((w) => w.id).sort();
      expect(got).toEqual(expected);
    }
  });

  it("passes exactly through cell corners", () => {
    const walls = [wall("a", 1.5, 0.5, 1.5, 1.5), wall("b", 0.5, 1.5, 1.5, 1.5)];
    const grid = new WallGrid(walls, 1);
    expect(grid.crossed({ x: 0, y: 0 }, { x: 2, y: 2 }).map((w) => w.id).sort()).toEqual(["a", "b"]);
  });

  it("handles empty grid and zero-length rays", () => {
    expect(new WallGrid([], 1).crossed({ x: 0, y: 0 }, { x: 5, y: 5 })).toEqual([]);
    const grid = new WallGrid([wall("a", 0, 0, 2, 0)], 1);
    expect(grid.crossed({ x: 1, y: 0 }, { x: 1, y: 0 }).map((w) => w.id)).toEqual(["a"]);
  });
});
