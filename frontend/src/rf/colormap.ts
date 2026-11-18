export type BandId = "excellent" | "good" | "fair" | "weak" | "none";

export interface Band {
  id: BandId;
  min: number;
  color: string;
}

export const BANDS: Band[] = [
  { id: "excellent", min: -65, color: "#16a34a" },
  { id: "good", min: -75, color: "#65a30d" },
  { id: "fair", min: -85, color: "#ca8a04" },
  { id: "weak", min: -95, color: "#ea580c" },
  { id: "none", min: -Infinity, color: "#dc2626" },
];

export const WEAK_THRESHOLD = -85;

export function band(rssi: number): BandId {
  return (BANDS.find((b) => rssi >= b.min) ?? BANDS[BANDS.length - 1]).id;
}

// Smooth ramp; stops at dBm with [r,g,b,a].
// Strong signal is a light tint so weak zones stand out and the plan stays legible.
const STOPS: [number, [number, number, number, number]][] = [
  [-100, [220, 38, 38, 170]],
  [-92, [234, 88, 12, 150]],
  [-84, [234, 179, 8, 125]],
  [-74, [132, 204, 22, 85]],
  [-62, [34, 197, 94, 50]],
  [-55, [16, 185, 129, 34]],
];

export function colorFor(rssi: number): [number, number, number, number] {
  if (rssi <= STOPS[0][0]) return [...STOPS[0][1]];
  const last = STOPS[STOPS.length - 1];
  if (rssi >= last[0]) return [...last[1]];
  for (let i = 1; i < STOPS.length; i++) {
    const [v1, c1] = STOPS[i];
    if (rssi <= v1) {
      const [v0, c0] = STOPS[i - 1];
      const t = (rssi - v0) / (v1 - v0);
      return [0, 1, 2, 3].map((k) => Math.round(c0[k] + (c1[k] - c0[k]) * t)) as [number, number, number, number];
    }
  }
  return [...last[1]];
}
