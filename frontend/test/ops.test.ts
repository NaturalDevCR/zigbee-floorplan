import { describe, expect, it } from "vitest";
import { History } from "../src/project/history";
import {
  addFloor,
  addRoom,
  addWalls,
  createProject,
  duplicateFloor,
  moveItems,
  newId,
  normalizeProject,
  placeDevice,
  removeFloor,
  removeItems,
  unplaceDevice,
  updateFloor,
  updateWalls,
} from "../src/project/ops";

const p = (x: number, y: number) => ({ x, y });

function withFloor() {
  const { project, floorId } = addFloor(createProject(), "Ground");
  return { project, floorId };
}

describe("ids", () => {
  it("are unique hex strings", () => {
    const ids = new Set(Array.from({ length: 500 }, newId));
    expect(ids.size).toBe(500);
    for (const id of ids) expect(id).toMatch(/^[0-9a-f]{12}$/);
  });
});

describe("floors", () => {
  it("stacks new floors above existing ones", () => {
    let { project } = withFloor();
    const second = addFloor(project, "First");
    project = second.project;
    expect(project.floors.map((f) => [f.name, f.level, f.elevation])).toEqual([
      ["Ground", 0, 0],
      ["First", 1, 2.7],
    ]);
  });

  it("keeps floors sorted by level after update", () => {
    let { project, floorId } = withFloor();
    project = addFloor(project, "First").project;
    project = updateFloor(project, floorId, { level: 5 });
    expect(project.floors.map((f) => f.name)).toEqual(["First", "Ground"]);
  });

  it("removing a floor removes its placements", () => {
    let { project, floorId } = withFloor();
    project = placeDevice(project, "0x1", { floorId, x: 1, y: 1, height: 1 });
    project = removeFloor(project, floorId);
    expect(project.floors).toEqual([]);
    expect(project.placements).toEqual({});
  });

  it("duplicates geometry with fresh ids", () => {
    let { project, floorId } = withFloor();
    project = addWalls(project, floorId, [{ a: p(0, 0), b: p(1, 0), thickness: 0.1, material: "brick" }]).project;
    const dup = duplicateFloor(project, floorId);
    const [a, b] = dup.project.floors;
    expect(b.walls).toHaveLength(1);
    expect(b.walls[0].id).not.toBe(a.walls[0].id);
    expect(b.level).toBe(1);
    expect(dup.floorId).toBe(b.id);
  });
});

describe("walls and rooms", () => {
  it("adds, updates and removes", () => {
    let { project, floorId } = withFloor();
    const res = addWalls(project, floorId, [
      { a: p(0, 0), b: p(4, 0), thickness: 0.1, material: "brick" },
      { a: p(4, 0), b: p(4, 3), thickness: 0.1, material: "brick" },
    ]);
    project = updateWalls(res.project, floorId, [res.ids[0]], { material: "concrete" });
    expect(project.floors[0].walls.map((w) => w.material)).toEqual(["concrete", "brick"]);
    const room = addRoom(project, floorId, "Kitchen", [p(0, 0), p(4, 0), p(4, 3)]);
    project = removeItems(room.project, floorId, [res.ids[1], room.id]);
    expect(project.floors[0].walls).toHaveLength(1);
    expect(project.floors[0].rooms).toHaveLength(0);
  });

  it("moving a wall drags connected wall endpoints along", () => {
    let { project, floorId } = withFloor();
    const res = addWalls(project, floorId, [
      { a: p(0, 0), b: p(4, 0), thickness: 0.1, material: "brick" },
      { a: p(4, 0), b: p(4, 3), thickness: 0.1, material: "brick" },
      { a: p(10, 10), b: p(11, 10), thickness: 0.1, material: "brick" },
    ]);
    project = moveItems(res.project, floorId, [res.ids[0]], p(0, 1));
    const [w0, w1, w2] = project.floors[0].walls;
    expect(w0.a).toEqual(p(0, 1));
    expect(w0.b).toEqual(p(4, 1));
    expect(w1.a).toEqual(p(4, 1));
    expect(w1.b).toEqual(p(4, 3));
    expect(w2.a).toEqual(p(10, 10));
  });

  it("moves rooms and placements on the floor", () => {
    let { project, floorId } = withFloor();
    const room = addRoom(project, floorId, "R", [p(0, 0), p(1, 0), p(1, 1)]);
    project = moveItems(room.project, floorId, [room.id], p(2, 2));
    expect(project.floors[0].rooms[0].points[0]).toEqual(p(2, 2));
  });
});

describe("placements", () => {
  it("places and unplaces", () => {
    let { project, floorId } = withFloor();
    project = placeDevice(project, "0x1", { floorId, x: 1, y: 2, height: 1 });
    expect(project.placements["0x1"].x).toBe(1);
    project = unplaceDevice(project, "0x1");
    expect(project.placements).toEqual({});
  });
});

describe("normalizeProject", () => {
  it("fills defaults and drops invalid data", () => {
    const project = normalizeProject({
      version: 1,
      floors: [
        {
          id: "f",
          name: "Up",
          level: 1,
          walls: [
            { id: "ok", a: p(0, 0), b: p(1, 0), material: "unobtanium" },
            { id: "zero", a: p(1, 1), b: p(1, 1) },
            { id: "nan", a: { x: "1", y: 0 }, b: p(2, 2) },
          ],
          rooms: [{ id: "r", points: [p(0, 0), p(1, 1)] }],
        },
        { id: "g", name: "Ground", level: 0 },
      ],
      placements: { a: { floorId: "f", x: 1, y: 1 }, b: { floorId: "gone", x: 0, y: 0 } },
      settings: { pathLossExponent: 3 },
    });
    expect(project.floors.map((f) => f.id)).toEqual(["g", "f"]);
    const up = project.floors[1];
    expect(up.walls.map((w) => w.id)).toEqual(["ok"]);
    expect(up.walls[0].material).toBe("drywall");
    expect(up.walls[0].thickness).toBeGreaterThan(0);
    expect(up.rooms).toEqual([]);
    expect(up.height).toBe(2.7);
    expect(up.slab).toBe("slab_concrete");
    expect(Object.keys(project.placements)).toEqual(["a"]);
    expect(project.placements.a.height).toBe(1);
    expect(project.settings.pathLossExponent).toBe(3);
    expect(project.settings.refLoss1m).toBe(40);
  });

  it("returns an empty project for garbage", () => {
    expect(normalizeProject(null).floors).toEqual([]);
    expect(normalizeProject({ floors: 3 }).floors).toEqual([]);
  });
});

describe("History", () => {
  it("undo/redo", () => {
    const h = new History<number>(0);
    h.push(1);
    h.push(2);
    expect(h.undo()).toBe(1);
    expect(h.undo()).toBe(0);
    expect(h.canUndo).toBe(false);
    expect(h.redo()).toBe(1);
    h.push(5);
    expect(h.canRedo).toBe(false);
    expect(h.present).toBe(5);
  });

  it("limits stack size", () => {
    const h = new History<number>(0, 3);
    for (let i = 1; i <= 10; i++) h.push(i);
    expect(h.undo()).toBe(9);
    expect(h.undo()).toBe(8);
    expect(h.undo()).toBe(7);
    expect(h.canUndo).toBe(false);
  });

  it("reset clears stacks", () => {
    const h = new History<number>(0);
    h.push(1);
    h.reset(9);
    expect(h.present).toBe(9);
    expect(h.canUndo).toBe(false);
  });
});
