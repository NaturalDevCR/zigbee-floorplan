export interface Pt {
  x: number;
  y: number;
}

export type MaterialId =
  | "drywall"
  | "wood"
  | "glass"
  | "glass_lowe"
  | "brick"
  | "block"
  | "concrete"
  | "reinforced"
  | "metal"
  | "slab_wood"
  | "slab_concrete";

export interface Wall {
  id: string;
  a: Pt;
  b: Pt;
  thickness: number;
  material: MaterialId;
}

export interface Room {
  id: string;
  name: string;
  points: Pt[];
}

export interface FloorBackground {
  imageId: string;
  x: number;
  y: number;
  /** meters per image pixel */
  scale: number;
  rotation: number;
  opacity: number;
  visible: boolean;
}

export interface Floor {
  id: string;
  name: string;
  level: number;
  elevation: number;
  height: number;
  slab: MaterialId;
  walls: Wall[];
  rooms: Room[];
  background?: FloorBackground;
}

export interface Placement {
  floorId: string;
  x: number;
  y: number;
  /** meters above the floor */
  height: number;
  /** dBm override */
  txPower?: number;
}

export interface Calibration {
  enabled: boolean;
  offsetDb: number;
  exponent: number;
  rmse: number | null;
  samples: number;
}

export interface RfSettings {
  pathLossExponent: number;
  refLoss1m: number;
  rxSensitivity: number;
  defaultTx: { Coordinator: number; Router: number; EndDevice: number };
  materials: Partial<Record<MaterialId, number>>;
  calibration: Calibration;
}

export interface Project {
  version: 1;
  floors: Floor[];
  placements: Record<string, Placement>;
  settings: RfSettings;
}

export type DeviceType = "Coordinator" | "Router" | "EndDevice" | "Unknown";

export interface ZDevice {
  ieee: string;
  name: string;
  type: DeviceType;
  model: string | null;
  vendor: string | null;
  description: string | null;
  power_source: string | null;
  network_address: number | null;
  interview_completed: boolean;
  supported: boolean;
  available: boolean | null;
  lqi: number | null;
  battery: number | null;
  last_seen: string | null;
  ha_device_id: string | null;
}

export interface ZLink {
  a: string;
  b: string;
  lqi: number | null;
  lqi_ab: number | null;
  lqi_ba: number | null;
  relationship: "tree" | "sibling" | "other";
  parent: string | null;
  depth: number | null;
}

export interface ScanState {
  status: "idle" | "scanning" | "error";
  last_scan: string | null;
  error: string | null;
}

export interface NetworkState {
  bridge_online: boolean | null;
  devices: ZDevice[];
  links: ZLink[];
  scan: ScanState;
}
