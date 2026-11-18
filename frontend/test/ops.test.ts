import { describe, expect, it } from "vitest";
import { History } from "../src/project/history";
import {
  addBuilding,
  addFloor,
  buildingExtent,
  DEFAULT_BUILDING_ID,
  floorsOf,
  removeBuilding,
  updateBuilding,
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
  const b = addBuilding(createProject(), "House");
  const { project, floorId } = addFloor(b.project, "Ground", b.buildingId);
  return { project, floorId, buildingId: b.buildingId };
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
    let { project, buildingId } = withFloor();
    const second = addFloor(project, "First", buildingId);
    project = second.project;
    expect(project.floors.map((f) => [f.name, f.level, f.elevation])).toEqual([
      ["Ground", 0, 0],
      ["First", 1, 2.7],
    ]);
  });

  it("keeps floors sorted by level after update", () => {
    let { project, floorId, buildingId } = withFloor();
    project = addFloor(project, "First", buildingId).project;
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

describe("buildings", () => {
  it("stacks levels per building and places new buildings beside the site", () => {
    let { project, buildingId } = withFloor();
    project = addWalls(project, project.floors[0].id, [
      { a: p(0, 0), b: p(10, 0), thickness: 0.2, material: "brick" },
      { a: p(10, 0), b: p(10, 8), thickness: 0.2, material: "brick" },
    ]).project;
    const second = addBuilding(project, "Garage");
    project = second.project;
    const garage = project.buildings[1];
    expect(garage.x).toBe(15);
    expect(garage.color).not.toBe(project.buildings[0].color);
    project = addFloor(project, "Garage ground", second.buildingId).project;
    project = addFloor(project, "House first", buildingId).project;
    expect(floorsOf(project, buildingId).map((f) => [f.name, f.level])).toEqual([
      ["Ground", 0],
      ["House first", 1],
    ]);
    expect(floorsOf(project, second.buildingId).map((f) => f.level)).toEqual([0]);
    expect(buildingExtent(project, buildingId)).toEqual({ minX: 0, minY: 0, maxX: 10, maxY: 8 });
  });

  it("updates and removes a building with its floors and placements", () => {
    let { project, floorId, buildingId } = withFloor();
    project = placeDevice(project, "0x1", { floorId, x: 1, y: 1, height: 1 });
    project = updateBuilding(project, buildingId, { visible: false, x: 3 });
    expect(project.buildings[0]).toMatchObject({ visible: false, x: 3 });
    project = removeBuilding(project, buildingId);
    expect(project.buildings).toEqual([]);
    expect(project.floors).toEqual([]);
    expect(project.placements).toEqual({});
  });

  it("migrates floors without a building into a default one", () => {
    const project = normalizeProject({
      version: 1,
      floors: [{ id: "f", name: "Old", level: 0 }],
      placements: {},
    });
    expect(project.buildings).toHaveLength(1);
    expect(project.buildings[0].id).toBe(DEFAULT_BUILDING_ID);
    expect(project.floors[0].buildingId).toBe(DEFAULT_BUILDING_ID);
  });

  it("assigns orphan floors to the first existing building and drops bad buildings", () => {
    const project = normalizeProject({
      version: 1,
      buildings: [{ id: "b1", name: "A", color: "red", x: "x" }, { id: "b1", name: "dup" }, { name: "no id" }],
      floors: [{ id: "f", name: "x", level: 0, buildingId: "gone" }],
    });
    expect(project.buildings.map((b) => b.id)).toEqual(["b1"]);
    expect(project.buildings[0].x).toBe(0);
    expect(project.buildings[0].color).toMatch(/^#/);
    expect(project.floors[0].buildingId).toBe("b1");
  });
});

describe("site levels", () => {
  it("lists levels and floors of visible buildings", async () => {
    const { floorsAtLevel, siteLevels } = await import("../src/project/ops");
    let { project, buildingId } = withFloor();
    project = addFloor(project, "Up", buildingId).project;
    const g = addBuilding(project, "Garage");
    project = addFloor(g.project, "G0", g.buildingId).project;
    expect(siteLevels(project)).toEqual([0, 1]);
    expect(floorsAtLevel(project, 0).map((f) => f.name)).toEqual(["Ground", "G0"]);
    project = updateBuilding(project, buildingId, { visible: false });
    expect(siteLevels(project)).toEqual([0]);
    expect(floorsAtLevel(project, 1)).toEqual([]);
  });
});

describe("migration naming", () => {
  it("uses the provided default building name", () => {
    const project = normalizeProject({ version: 1, floors: [{ id: "f", name: "x", level: 0 }] }, { defaultBuildingName: "Edificio 1" });
    expect(project.buildings[0].name).toBe("Edificio 1");
  });
});
