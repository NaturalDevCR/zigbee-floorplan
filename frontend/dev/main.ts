import "../src/index";
import { buildFixture } from "./fixture";
import { createMockHass } from "./mock-hass";

const params = new URLSearchParams(location.search);
const dark = params.has("dark");
const { project, network } = buildFixture();
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
