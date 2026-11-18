import "./panel/zfp-panel";
import "./card/zfp-card";
import "./card/card-editor";

declare global {
  interface Window {
    customCards?: { type: string; name: string; description: string; preview?: boolean }[];
  }
}

const VERSION = "0.1.0";

window.customCards = window.customCards ?? [];
if (!window.customCards.some((c) => c.type === "zigbee-floorplan-card")) {
  window.customCards.push({
    type: "zigbee-floorplan-card",
    name: "Zigbee Floorplan",
    description: "Zigbee2MQTT mesh, devices and estimated coverage on your floor plan.",
    preview: true,
  });
}

console.info(
  `%c ZIGBEE-FLOORPLAN %c ${VERSION} `,
  "color:#fff;background:#7c3aed;font-weight:700;border-radius:4px 0 0 4px;padding:2px 4px",
  "color:#7c3aed;background:#ede9fe;border-radius:0 4px 4px 0;padding:2px 4px",
);
