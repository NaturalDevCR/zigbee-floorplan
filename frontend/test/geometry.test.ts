import { describe, expect, it } from "vitest";
import {
  bboxOf,
  distToSegment,
  pointInPolygon,
  polygonArea,
  projectOnSegment,
  segIntersect,
  segIntersectPoint,
} from "../src/geometry";

const p = (x: number, y: number) => ({ x, y });

describe("segIntersect", () => {
  it("detects proper crossings", () => {
    expect(segIntersect(p(0, 0), p(2, 2), p(0, 2), p(2, 0))).toBe(true);
  });
  it("rejects parallel and disjoint segments", () => {
    expect(segIntersect(p(0, 0), p(2, 0), p(0, 1), p(2, 1))).toBe(false);
    expect(segIntersect(p(0, 0), p(1, 1), p(2, 0), p(3, -1))).toBe(false);
  });
  it("counts touching endpoints as intersecting", () => {
    expect(segIntersect(p(0, 0), p(1, 0), p(1, 0), p(1, 1))).toBe(true);
  });
  it("handles collinear overlap", () => {
    expect(segIntersect(p(0, 0), p(2, 0), p(1, 0), p(3, 0))).toBe(true);
    expect(segIntersect(p(0, 0), p(1, 0), p(2, 0), p(3, 0))).toBe(false);
  });
});

describe("segIntersectPoint", () => {
  it("returns the crossing point", () => {
    const hit = segIntersectPoint(p(0, 0), p(2, 2), p(0, 2), p(2, 0));
    expect(hit).toEqual({ x: 1, y: 1, t: 0.5, u: 0.5 });
  });
  it("returns null when parallel", () => {
    expect(segIntersectPoint(p(0, 0), p(1, 0), p(0, 1), p(1, 1))).toBeNull();
  });
});

describe("polygons", () => {
  const concave = [p(0, 0), p(4, 0), p(4, 4), p(2, 2), p(0, 4)];
  it("point in concave polygon", () => {
    expect(pointInPolygon(p(1, 1), concave)).toBe(true);
    expect(pointInPolygon(p(2, 3), concave)).toBe(false);
    expect(pointInPolygon(p(5, 1), concave)).toBe(false);
  });
  it("area is positive regardless of winding", () => {
    expect(polygonArea([p(0, 0), p(2, 0), p(2, 2), p(0, 2)])).toBe(4);
    expect(polygonArea([p(0, 0), p(0, 2), p(2, 2), p(2, 0)])).toBe(4);
  });
});

describe("segments", () => {
  it("distance and projection", () => {
    expect(distToSegment(p(1, 1), p(0, 0), p(2, 0))).toBe(1);
    expect(distToSegment(p(3, 0), p(0, 0), p(2, 0))).toBe(1);
    expect(projectOnSegment(p(1, 5), p(0, 0), p(2, 0))).toEqual({ x: 1, y: 0, t: 0.5 });
  });
  it("bbox", () => {
    expect(bboxOf([p(1, 2), p(-1, 5)])).toEqual({ minX: -1, minY: 2, maxX: 1, maxY: 5 });
    expect(bboxOf([])).toBeNull();
  });
});
