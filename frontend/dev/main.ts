import { buildFixture } from "./fixture";
import { createMockHass } from "./mock-hass";

const params = new URLSearchParams(location.search);
// ?bundle exercises the production build that Home Assistant serves
// @ts-expect-error the built bundle ships without type declarations
if (params.has("bundle")) await import("../../custom_components/zigbee_floorplan/frontend/zigbee-floorplan.js");
else await import("../src/index");
const dark = params.has("dark");
// ?prefs=<json> seeds the saved UI preferences (view, tab...) for reproducible screenshots
if (params.has("prefs")) localStorage.setItem("zigbee-floorplan:prefs", params.get("prefs")!);
const { project, network } = buildFixture();
if (params.get("demo") === "weak") {
  // a layout with weak spots: fewer routers and heavier interior walls
  const drop = new Set(network.devices.filter((d) => ["Living room plug", "Dining light", "Garage repeater"].includes(d.name)).map((d) => d.ieee));
  for (const ieee of drop) delete project.placements[ieee];
  for (const f of project.floors) {
    if (f.id !== "ground") continue;
    f.walls = f.walls.map((w) => (w.material === "drywall" ? { ...w, material: "reinforced", thickness: 0.25 } : w));
  }
}
const hass = createMockHass({
  project: params.has("empty") ? null : project,
  network: params.has("nodata") ? { bridge_online: null, devices: [], links: [], scan: { status: "idle", last_scan: null, error: null } } : network,
  admin: !params.has("readonly"),
  language: params.get("lang") ?? "es",
  dark,
});

document.documentElement.classList.toggle("dark", dark);
const view = params.get("view") ?? "panel";
const root = document.getElementById("root")!;

if (view === "card") {
  root.className = "cards";
  for (const cfg of [
    { type: "custom:zigbee-floorplan-card", title: "Red Zigbee", height: 420 },
    { type: "custom:zigbee-floorplan-card", title: "Sitio", building: "site", height: 360 },
    { type: "custom:zigbee-floorplan-card", floor: "upper", height: 320, layers: ["links", "labels"], show_floor_tabs: false },
  ]) {
    const card = document.createElement("zigbee-floorplan-card") as HTMLElement & { setConfig(c: unknown): void; hass: unknown };
    card.setConfig(cfg);
    card.hass = hass;
    root.appendChild(card);
  }
} else {
  const panel = document.createElement("zigbee-floorplan-panel") as HTMLElement & { hass: unknown; narrow: boolean };
  panel.hass = hass;
  const mq = window.matchMedia("(max-width: 870px)");
  panel.narrow = mq.matches;
  mq.addEventListener("change", () => (panel.narrow = mq.matches));
  root.appendChild(panel);
}
