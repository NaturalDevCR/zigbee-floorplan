import { DEFAULT_RF, modelParams, RfScene, rssiToLqi } from "../src/rf/model";
import type { DeviceType, Floor, MaterialId, NetworkState, Project, Wall, ZDevice, ZLink } from "../src/types";

let seq = 0;
const id = () => (++seq).toString(16).padStart(12, "0");

function chain(points: [number, number][], material: MaterialId, thickness: number, closed = false): Wall[] {
  const walls: Wall[] = [];
  const pts = closed ? [...points, points[0]] : points;
  for (let i = 0; i < pts.length - 1; i++) {
    walls.push({ id: id(), a: { x: pts[i][0], y: pts[i][1] }, b: { x: pts[i + 1][0], y: pts[i + 1][1] }, thickness, material });
  }
  return walls;
}

const room = (name: string, pts: [number, number][]) => ({ id: id(), name, points: pts.map(([x, y]) => ({ x, y })) });

const ground: Floor = {
  id: "ground",
  name: "Planta baja",
  level: 0,
  elevation: 0,
  height: 2.7,
  slab: "slab_concrete",
  walls: [
    ...chain([[0, 0], [14, 0], [14, 10], [0, 10]], "brick", 0.25, true),
    ...chain([[6, 0], [6, 4]], "drywall", 0.12),
    ...chain([[6, 5.2], [6, 10]], "drywall", 0.12),
    ...chain([[0, 6], [3.5, 6]], "drywall", 0.12),
    ...chain([[4.6, 6], [6, 6]], "drywall", 0.12),
    ...chain([[10, 0], [10, 4.5]], "concrete", 0.2),
    ...chain([[10, 4.5], [14, 4.5]], "concrete", 0.2),
    ...chain([[8, 10], [12, 10]], "glass", 0.08),
    ...chain([[11, 2], [11.8, 2]], "metal", 0.6),
  ],
  rooms: [
    room("Sala", [[6, 4.5], [14, 4.5], [14, 10], [6, 10]]),
    room("Cocina", [[10, 0], [14, 0], [14, 4.5], [10, 4.5]]),
    room("Comedor", [[6, 0], [10, 0], [10, 4.5], [6, 4.5]]),
    room("Estudio", [[0, 0], [6, 0], [6, 6], [0, 6]]),
    room("Garaje", [[0, 6], [6, 6], [6, 10], [0, 10]]),
  ],
};

const upper: Floor = {
  id: "upper",
  name: "Segundo piso",
  level: 1,
  elevation: 2.95,
  height: 2.6,
  slab: "slab_concrete",
  walls: [
    ...chain([[0, 0], [14, 0], [14, 10], [0, 10]], "brick", 0.25, true),
    ...chain([[7, 0], [7, 10]], "block", 0.15),
    ...chain([[0, 5], [3, 5]], "drywall", 0.1),
    ...chain([[4.2, 5], [7, 5]], "drywall", 0.1),
    ...chain([[7, 6], [10, 6]], "drywall", 0.1),
    ...chain([[11, 6], [14, 6]], "drywall", 0.1),
    ...chain([[10, 6], [10, 10]], "wood", 0.1),
  ],
  rooms: [
    room("Habitación principal", [[0, 0], [7, 0], [7, 5], [0, 5]]),
    room("Baño", [[0, 5], [7, 5], [7, 10], [0, 10]]),
    room("Habitación niños", [[7, 0], [14, 0], [14, 6], [7, 6]]),
    room("Oficina", [[7, 6], [14, 6], [14, 10], [7, 10]]),
  ],
};

type Spec = [name: string, type: DeviceType, floor: string | null, x: number, y: number, model: string, vendor: string, battery?: number];

const SPECS: Spec[] = [
  ["Coordinator", "Coordinator", "ground", 3, 3, "SLZB-06", "SMLIGHT"],
  ["Enchufe sala", "Router", "ground", 9, 7.5, "ZBMINI-L2", "SONOFF"],
  ["Foco comedor", "Router", "ground", 8, 2.2, "LED1836G9", "IKEA"],
  ["Enchufe cocina", "Router", "ground", 12.5, 3.5, "TS011F", "Tuya"],
  ["Repetidor garaje", "Router", "ground", 2, 8.5, "E1746", "IKEA"],
  ["Foco pasillo arriba", "Router", "upper", 6, 5.5, "LED2003G10", "IKEA"],
  ["Enchufe oficina", "Router", "upper", 12, 8.5, "SA-003-Zigbee", "eWeLink"],
  ["Sensor puerta principal", "EndDevice", "ground", 6.5, 9.7, "MCCGQ11LM", "Aqara", 82],
  ["Temp sala", "EndDevice", "ground", 13, 9, "WSDCGQ11LM", "Aqara", 64],
  ["Movimiento cocina", "EndDevice", "ground", 13.4, 0.6, "RTCGQ11LM", "Aqara", 12],
  ["Fuga lavadora", "EndDevice", "ground", 0.6, 9.4, "SJCGQ11LM", "Aqara", 91],
  ["Botón estudio", "EndDevice", "ground", 5, 1, "WXKG01LM", "Aqara", 55],
  ["Temp garaje", "EndDevice", "ground", 4.5, 7, "SNZB-02", "SONOFF", 40],
  ["Temp principal", "EndDevice", "upper", 2, 2, "WSDCGQ11LM", "Aqara", 77],
  ["Sensor ventana baño", "EndDevice", "upper", 0.4, 8, "MCCGQ11LM", "Aqara", 68],
  ["Movimiento niños", "EndDevice", "upper", 13, 1, "RTCGQ11LM", "Aqara", 33],
  ["Vibración cuna", "EndDevice", "upper", 10, 3, "DJT11LM", "Aqara", 88],
  ["Persiana oficina", "EndDevice", "upper", 13.5, 9.6, "TS130F", "Tuya", 70],
  ["Temp ático", "EndDevice", null, 0, 0, "SNZB-02", "SONOFF", 95],
  ["Botón mesa noche", "EndDevice", null, 0, 0, "WXKG11LM", "Aqara", 100],
];

function ieeeOf(i: number) {
  return `0x00158d000${(0x4a1000 + i * 7919).toString(16).padStart(7, "0")}`;
}

export function buildFixture(): { project: Project; network: NetworkState } {
  const floors = [ground, upper];
  const placements: Project["placements"] = {};
  const devices: ZDevice[] = SPECS.map(([name, type, floor, x, y, model, vendor, battery], i) => {
    const ieee = ieeeOf(i);
    if (floor) placements[ieee] = { floorId: floor, x, y, height: type === "EndDevice" ? 1.2 : 0.4 };
    return {
      ieee,
      name,
      type,
      model,
      vendor,
      description: null,
      power_source: type === "EndDevice" ? "Battery" : "Mains (single phase)",
      network_address: i === 0 ? 0 : 0x1000 + i * 37,
      interview_completed: true,
      supported: true,
      available: name === "Temp ático" ? false : true,
      lqi: null,
      battery: battery ?? null,
      last_seen: new Date(Date.now() - (i % 7) * 4 * 60000).toISOString(),
      ha_device_id: `ha_${i}`,
    };
  });

  const project: Project = { version: 1, floors, placements, settings: { ...DEFAULT_RF } };

  // Ground truth model with hidden parameters, used to synthesize realistic LQI.
  const truth = new RfScene(
    { ...project, settings: { ...DEFAULT_RF, pathLossExponent: 2.6, refLoss1m: 44 } },
    new Map(devices.map((d) => [d.ieee, d.type])),
  );
  const p = modelParams(truth.settings, null);
  let noise = 7;
  const rand = () => {
    noise = (noise * 9301 + 49297) % 233280;
    return noise / 233280 - 0.5;
  };
  const rssiBetween = (a: string, b: string) => {
    const na = truth.nodes.get(a)!;
    const nb = truth.nodes.get(b)!;
    return truth.rssi(na, nb.floorId, nb.pos, nb.height, p) + rand() * 6;
  };
  const lqiOf = (rssi: number) => Math.max(1, Math.min(255, Math.round(rssiToLqi(rssi))));

  const placed = devices.filter((d) => placements[d.ieee]);
  const routers = placed.filter((d) => d.type !== "EndDevice");
  const links: ZLink[] = [];
  // router mesh: every router pair that can hear each other
  for (let i = 0; i < routers.length; i++) {
    for (let j = i + 1; j < routers.length; j++) {
      const a = routers[i].ieee;
      const b = routers[j].ieee;
      const ab = rssiBetween(a, b);
      const ba = rssiBetween(b, a);
      if (Math.max(ab, ba) < -92) continue;
      const [x, y] = a < b ? [a, b] : [b, a];
      links.push({
        a: x,
        b: y,
        lqi_ab: lqiOf(x === a ? ab : ba),
        lqi_ba: lqiOf(x === a ? ba : ab),
        lqi: lqiOf(Math.max(ab, ba)),
        relationship: "sibling",
        parent: null,
        depth: 1,
      });
    }
  }
  // end devices attach to their strongest router
  for (const d of placed.filter((x) => x.type === "EndDevice")) {
    let best: { r: ZDevice; v: number } | null = null;
    for (const r of routers) {
      const v = rssiBetween(r.ieee, d.ieee);
      if (!best || v > best.v) best = { r, v };
    }
    if (!best) continue;
    const up = rssiBetween(d.ieee, best.r.ieee);
    const [x, y] = d.ieee < best.r.ieee ? [d.ieee, best.r.ieee] : [best.r.ieee, d.ieee];
    links.push({
      a: x,
      b: y,
      lqi_ab: lqiOf(x === d.ieee ? up : best.v),
      lqi_ba: lqiOf(x === d.ieee ? best.v : up),
      lqi: lqiOf(Math.max(up, best.v)),
      relationship: "tree",
      parent: best.r.ieee,
      depth: 2,
    });
    d.lqi = lqiOf(up);
  }
  // routers: tree link toward coordinator via the strongest path (simplified: strongest neighbour closer to coordinator)
  const coord = routers.find((r) => r.type === "Coordinator")!;
  coord.lqi = null;
  for (const r of routers) {
    if (r === coord) continue;
    const direct = links.find((l) => (l.a === r.ieee && l.b === coord.ieee) || (l.b === r.ieee && l.a === coord.ieee));
    let parentLink = direct && (direct.lqi ?? 0) > 70 ? direct : null;
    if (!parentLink) {
      parentLink =
        links
          .filter((l) => l.relationship === "sibling" && (l.a === r.ieee || l.b === r.ieee))
          .sort((x, y) => (y.lqi ?? 0) - (x.lqi ?? 0))[0] ?? null;
    }
    if (parentLink) {
      parentLink.relationship = "tree";
      parentLink.parent = parentLink.a === r.ieee ? parentLink.b : parentLink.a;
      r.lqi = parentLink.lqi;
    }
  }

  return {
    project,
    network: {
      bridge_online: true,
      devices,
      links,
      scan: { status: "idle", last_scan: new Date(Date.now() - 3600_000).toISOString(), error: null },
    },
  };
}
