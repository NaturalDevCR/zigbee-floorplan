import { band, WEAK_THRESHOLD } from "../rf/colormap";
import type { DeviceType, ZDevice, ZLink } from "../types";
import { mdiAccessPoint, mdiRouterWireless, mdiZigbee, mdiHelpCircleOutline } from "./icons";

export const TYPE_COLOR: Record<DeviceType, string> = {
  Coordinator: "#7c3aed",
  Router: "#0284c7",
  EndDevice: "#0d9488",
  Unknown: "#64748b",
};

export const TYPE_ICON: Record<DeviceType, string> = {
  Coordinator: mdiZigbee,
  Router: mdiRouterWireless,
  EndDevice: mdiAccessPoint,
  Unknown: mdiHelpCircleOutline,
};

export type Health = "ok" | "warn" | "bad" | "offline" | "unknown";

export const HEALTH_COLOR: Record<Health, string> = {
  ok: "#16a34a",
  warn: "#d97706",
  bad: "#ea580c",
  offline: "#dc2626",
  unknown: "#94a3b8",
};

export const LQI_GOOD = 100;
export const LQI_WEAK = 60;

export function deviceHealth(d: ZDevice | undefined, estimatedRssi?: number): Health {
  if (!d) return "unknown";
  if (d.available === false) return "offline";
  if (d.type === "Coordinator") return "ok";
  if (d.lqi !== null) return d.lqi >= LQI_GOOD ? "ok" : d.lqi >= LQI_WEAK ? "warn" : "bad";
  if (estimatedRssi !== undefined) {
    const b = band(estimatedRssi);
    return b === "excellent" || b === "good" ? "ok" : b === "fair" ? "warn" : "bad";
  }
  return d.available === true ? "ok" : "unknown";
}

export function lqiColor(lqi: number | null): string {
  if (lqi === null) return "#94a3b8";
  if (lqi >= 150) return "#16a34a";
  if (lqi >= LQI_GOOD) return "#65a30d";
  if (lqi >= LQI_WEAK) return "#d97706";
  return "#dc2626";
}

export function lqiWidth(lqi: number | null): number {
  if (lqi === null) return 1.5;
  return 1.5 + Math.min(1, lqi / 255) * 2.5;
}

export const isWeakRssi = (rssi: number | undefined) => rssi !== undefined && rssi < WEAK_THRESHOLD;

export function visibleLinks(links: ZLink[], mode: "tree" | "all"): ZLink[] {
  return mode === "all" ? links : links.filter((l) => l.relationship === "tree");
}
