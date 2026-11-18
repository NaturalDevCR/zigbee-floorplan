import { describe, expect, it } from "vitest";
import { calibrate } from "../src/rf/calibrate";
import { BANDS, band, colorFor } from "../src/rf/colormap";
import { computeHeatmap } from "../src/rf/heatmap";
import { DEFAULT_RF, lqiToRssi, modelParams, RfScene, rssiToLqi } from "../src/rf/model";
import { suggestRouters } from "../src/rf/suggest";
import type { DeviceType, Floor, Placement, Project, Wall, ZLink } from "../src/types";

const wall = (id: string, ax: number, ay: number, bx: number, by: number, material: Wall["material"] = "concrete"): Wall => ({
  id, a: { x: ax, y: ay }, b: { x: bx, y: by }, thickness: 0.2, material,
});

const floor = (id: string, level: number, walls: Wall[] = [], extra: Partial<Floor> = {}): Floor => ({
  id, buildingId: "b", name: id, level, elevation: level * 3, height: 2.7, slab: "slab_concrete", walls, rooms: [], ...extra,
});

function project(floors: Floor[], placements: Record<string, Placement>, settings = {}): Project {
  return {
    version: 1,
    buildings: [{ id: "b", name: "B", color: "#7c3aed", x: 0, y: 0, visible: true }],
    floors,
    placements,
    settings: { ...DEFAULT_RF, ...settings },
  };
}

const types = (m: Record<string, DeviceType>) => new Map(Object.entries(m));
const at = (floorId: string, x: number, y: number, height = 1): Placement => ({ floorId, x, y, height });

describe("model", () => {
  it("lqi/rssi mapping is monotonic and invertible", () => {
    expect(lqiToRssi(0)).toBe(-100);
    expect(lqiToRssi(255)).toBe(-40);
    expect(rssiToLqi(lqiToRssi(128))).toBeCloseTo(128);
  });

  it("free space at 1 m equals tx minus reference loss", () => {
    const scene = new RfScene(project([floor("g", 0)], { c: at("g", 0, 0) }), types({ c: "Coordinator" }));
    const e = scene.emitters[0];
    const p = modelParams(DEFAULT_RF, null);
    expect(scene.rssi(e, "g", { x: 1, y: 0 }, 1, p)).toBeCloseTo(5 - 40);
  });

  it("each crossed wall adds its material loss", () => {
    const scene = new RfScene(
      project([floor("g", 0, [wall("w", 2, -5, 2, 5), wall("w2", 3, -5, 3, 5, "drywall")])], { c: at("g", 0, 0) }),
      types({ c: "Coordinator" }),
    );
    const e = scene.emitters[0];
    const p = modelParams(DEFAULT_RF, null);
    const free = 5 - 40 - 10 * 2.2 * Math.log10(4);
    expect(scene.rssi(e, "g", { x: 4, y: 0 }, 1, p)).toBeCloseTo(free - 15 - 3);
  });

  it("custom material overrides apply", () => {
    const scene = new RfScene(
      project([floor("g", 0, [wall("w", 2, -5, 2, 5)])], { c: at("g", 0, 0) }, { materials: { concrete: 5 } }),
      types({ c: "Coordinator" }),
    );
    const p = modelParams(scene.settings, null);
    const free = 5 - 40 - 10 * 2.2 * Math.log10(4);
    expect(scene.rssi(scene.emitters[0], "g", { x: 4, y: 0 }, 1, p)).toBeCloseTo(free - 5);
  });

  it("floors crossed add slab loss of the upper floor", () => {
    const floors = [floor("g", 0), floor("f1", 1, [], { slab: "slab_wood" }), floor("f2", 2)];
    const scene = new RfScene(project(floors, { c: at("g", 0, 0) }), types({ c: "Coordinator" }));
    const p = modelParams(DEFAULT_RF, null);
    const e = scene.emitters[0];
    const d = 6; // straight up two floors, same height above floor
    const free = 5 - 40 - 10 * 2.2 * Math.log10(d);
    expect(scene.rssi(e, "f2", { x: 0, y: 0 }, 1, p)).toBeCloseTo(free - 8 - 20);
  });

  it("only routers and coordinators emit; end devices are receivers", () => {
    const scene = new RfScene(
      project([floor("g", 0)], { c: at("g", 0, 0), r: at("g", 1, 1), e: at("g", 2, 2), ghost: at("g", 3, 3), lost: at("nofloor", 0, 0) }),
      types({ c: "Coordinator", r: "Router", e: "EndDevice" }),
    );
    expect(scene.emitters.map((e) => e.ieee).sort()).toEqual(["c", "r"]);
    expect([...scene.nodes.keys()].sort()).toEqual(["c", "e", "r"]);
  });
});

describe("calibrate", () => {
  function synthetic(n: number, offset: number) {
    const placements: Record<string, Placement> = { c: at("g", 0, 0) };
    const t: Record<string, DeviceType> = { c: "Coordinator" };
    const links: ZLink[] = [];
    const distances = [1.5, 3, 5, 8, 12, 18];
    distances.forEach((d, i) => {
      placements[`r${i}`] = at("g", d, 0);
      t[`r${i}`] = "Router";
    });
    const proj = project([floor("g", 0, [wall("w", 2, -1, 2, 1, "brick")])], placements);
    const scene = new RfScene(proj, types(t));
    const truth = { n, refLoss: 40 + offset };
    distances.forEach((d, i) => {
      const walls = d > 2 ? 8 : 0;
      const rssi = 5 - truth.refLoss - 10 * n * Math.log10(d) - walls;
      const lqi = rssiToLqi(rssi);
      links.push({ a: "c", b: `r${i}`, lqi, lqi_ab: lqi, lqi_ba: lqi, relationship: "tree", parent: "c", depth: 1 });
    });
    return { scene, links };
  }

  it("recovers exponent and offset from synthetic links", () => {
    const { scene, links } = synthetic(2.8, 6);
    const cal = calibrate(scene, links);
    expect(cal.applied).toBe(true);
    expect(cal.exponent).toBeCloseTo(2.8, 1);
    expect(cal.offsetDb).toBeCloseTo(6, 0);
    expect(cal.rmse!).toBeLessThan(0.5);
    expect(cal.samples).toBe(12);
  });

  it("clamps exponent to physical range", () => {
    const { scene, links } = synthetic(6, 0);
    const cal = calibrate(scene, links);
    expect(cal.exponent).toBe(4);
  });

  it("needs at least three samples", () => {
    const { scene, links } = synthetic(2.2, 0);
    const cal = calibrate(scene, [{ ...links[1], lqi_ba: null }, { ...links[2], lqi_ba: null }]);
    expect(cal.applied).toBe(false);
    expect(cal.samples).toBe(2);
  });

  it("ignores links with unplaced devices and saturated lqi", () => {
    const { scene, links } = synthetic(2.2, 0);
    const extra: ZLink = { ...links[0], b: "nowhere" };
    const sat: ZLink = { ...links[1], lqi_ab: 255, lqi_ba: 255 };
    expect(calibrate(scene, [extra, sat]).samples).toBe(0);
  });
});

describe("heatmap", () => {
  const rooms = [{ id: "r", name: "R", points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 6 }, { x: 0, y: 6 }] }];
  const proj = project(
    [floor("g", 0, [wall("w", 5, 0, 5, 6, "reinforced")], { rooms })],
    { c: at("g", 1, 3) },
  );
  const scene = new RfScene(proj, types({ c: "Coordinator" }));
  const params = modelParams(proj.settings, null);

  it("is stronger near the emitter and attenuated behind the wall", () => {
    const heat = computeHeatmap(scene, "g", params)!;
    expect(heat).not.toBeNull();
    expect(heat.cols * heat.rows).toBeLessThanOrEqual(40000);
    const sample = (x: number, y: number) => {
      const c = Math.floor((x - heat.originX) / heat.cell);
      const r = Math.floor((y - heat.originY) / heat.cell);
      return heat.values[r * heat.cols + c];
    };
    expect(sample(1.5, 3)).toBeGreaterThan(sample(4.5, 3));
    expect(sample(4.5, 3) - sample(5.5, 3)).toBeGreaterThan(20);
  });

  it("masks cells outside rooms", () => {
    const heat = computeHeatmap(scene, "g", params)!;
    const inside = heat.mask.reduce((s, v) => s + v, 0) * heat.cell * heat.cell;
    expect(inside).toBeGreaterThan(55);
    expect(inside).toBeLessThan(66);
  });

  it("returns null for an empty floor", () => {
    const empty = new RfScene(project([floor("g", 0)], {}), types({}));
    expect(computeHeatmap(empty, "g", params)).toBeNull();
  });
});

describe("suggestRouters", () => {
  it("places a router where it improves weak coverage", () => {
    const rooms = [{ id: "r", name: "R", points: [{ x: 0, y: 0 }, { x: 24, y: 0 }, { x: 24, y: 6 }, { x: 0, y: 6 }] }];
    const walls = [wall("w1", 6, 0, 6, 6, "reinforced"), wall("w2", 12, 0, 12, 6, "reinforced"), wall("w3", 18, 0, 18, 6, "reinforced")];
    const proj = project([floor("g", 0, walls, { rooms })], { c: at("g", 1, 3), s: at("g", 22, 3) });
    const scene = new RfScene(proj, types({ c: "Coordinator", s: "EndDevice" }));
    const params = modelParams(proj.settings, null);
    const heat = computeHeatmap(scene, "g", params)!;
    const sugg = suggestRouters(scene, "g", heat, params);
    expect(sugg.length).toBeGreaterThan(0);
    const first = sugg[0];
    expect(first.pos.x).toBeGreaterThan(4);
    expect(first.pos.x).toBeLessThan(18);
    expect(first.gainArea).toBeGreaterThan(0);
    expect(first.rssiFromMesh).toBeGreaterThanOrEqual(-80);
  });

  it("suggests nothing when coverage is already good", () => {
    const rooms = [{ id: "r", name: "R", points: [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 }] }];
    const proj = project([floor("g", 0, [], { rooms })], { c: at("g", 2, 2) });
    const scene = new RfScene(proj, types({ c: "Coordinator" }));
    const params = modelParams(proj.settings, null);
    expect(suggestRouters(scene, "g", computeHeatmap(scene, "g", params)!, params)).toEqual([]);
  });
});

describe("colormap", () => {
  it("bands", () => {
    expect(band(-60)).toBe("excellent");
    expect(band(-70)).toBe("good");
    expect(band(-80)).toBe("fair");
    expect(band(-90)).toBe("weak");
    expect(band(-99)).toBe("none");
    expect(BANDS.map((b) => b.id)).toEqual(["excellent", "good", "fair", "weak", "none"]);
  });
  it("colors are rgba bytes", () => {
    const c = colorFor(-70);
    expect(c).toHaveLength(4);
    c.forEach((v) => expect(v).toBeGreaterThanOrEqual(0));
    expect(colorFor(-50)).toEqual(colorFor(-55));
  });
});

describe("runRf", () => {
  it("produces rgba heat, calibration and device estimates", async () => {
    const { runRf } = await import("../src/rf/engine");
    const rooms = [{ id: "r", name: "R", points: [{ x: 0, y: 0 }, { x: 8, y: 0 }, { x: 8, y: 5 }, { x: 0, y: 5 }] }];
    const proj = project([floor("g", 0, [], { rooms })], { c: at("g", 1, 1), s: at("g", 7, 4) });
    const res = runRf({
      project: proj,
      devices: [{ ieee: "c", type: "Coordinator" }, { ieee: "s", type: "EndDevice" }],
      links: [],
      floorIds: ["g"],
      suggest: true,
    });
    expect(res.heats).toHaveLength(1);
    expect(res.heats[0].rgba.length).toBe(res.heats[0].cols * res.heats[0].rows * 4);
    expect(res.calibration.applied).toBe(false);
    expect(res.deviceRssi.s).toBeLessThan(-40);
    expect(res.deviceRssi.c).toBeUndefined();
  });
});

describe("multiple buildings", () => {
  const box = (w: number, h: number, material: Wall["material"]) => [
    wall("n", 0, 0, w, 0, material), wall("e", w, 0, w, h, material),
    wall("s", w, h, 0, h, material), wall("w", 0, h, 0, 0, material),
  ];

  function site(gap: number) {
    const proj: Project = {
      version: 1,
      buildings: [
        { id: "A", name: "A", color: "#000000", x: 0, y: 0, visible: true },
        { id: "B", name: "B", color: "#000000", x: 10 + gap, y: 0, visible: true },
      ],
      floors: [
        { ...floor("a0", 0, box(10, 6, "brick")), buildingId: "A" },
        { ...floor("a1", 1, box(10, 6, "brick")), buildingId: "A" },
        { ...floor("b0", 0, box(8, 6, "concrete")), buildingId: "B" },
      ],
      placements: { c: at("a0", 5, 3), s: at("b0", 4, 3) },
      settings: { ...DEFAULT_RF },
    };
    return new RfScene(proj, types({ c: "Coordinator", s: "EndDevice" }));
  }

  it("places building floors in site coordinates", () => {
    const scene = site(6);
    expect(scene.nodes.get("s")!.pos).toEqual({ x: 20, y: 3 });
    expect(scene.offsetOf("b0")).toEqual({ x: 16, y: 0 });
  });

  it("crosses both buildings' exterior walls and no slab between buildings", () => {
    const scene = site(6);
    const p = modelParams(DEFAULT_RF, null);
    const c = scene.emitters[0];
    const rx = { x: 20, y: 3 };
    const free = 5 - 40 - 10 * 2.2 * Math.log10(15);
    // brick wall of A (8 dB) + concrete wall of B (15 dB)
    expect(scene.rssi(c, "b0", rx, 1, p)).toBeCloseTo(free - 8 - 15);
  });

  it("only counts slabs inside the same building", () => {
    const scene = site(6);
    expect(scene.obstruction("a0", { x: 5, y: 3 }, "a1", { x: 5, y: 3 })).toBe(20);
  });

  it("farther buildings get weaker signal", () => {
    const p = modelParams(DEFAULT_RF, null);
    const near = site(2);
    const far = site(30);
    const v = (sc: RfScene) => sc.bestRssi("b0", sc.nodes.get("s")!.pos, 1, p);
    expect(v(near)).toBeGreaterThan(v(far));
  });
});
