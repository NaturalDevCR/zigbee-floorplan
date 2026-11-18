import type { HomeAssistant } from "../src/data/hass";
import type { NetworkState, Project } from "../src/types";

type Sub = { type: string; cb: (msg: unknown) => void };

/** In-memory stand-in for the Home Assistant frontend `hass` object. */
export function createMockHass(opts: {
  project: Project | null;
  network: NetworkState;
  admin: boolean;
  language: string;
  dark: boolean;
}): HomeAssistant & { setNetwork(n: NetworkState): void } {
  let revision = opts.project ? 1 : 0;
  let project: unknown = opts.project ?? { version: 1, floors: [], placements: {}, settings: {} };
  let network = opts.network;
  const subs = new Set<Sub>();
  const images = new Map<string, Blob>();
  const delay = (ms = 60) => new Promise((r) => setTimeout(r, ms));

  const pushNetwork = () => {
    for (const s of subs) if (s.type === "zigbee_floorplan/network/subscribe") s.cb({ kind: "network", state: network });
  };

  // live LQI jitter to mimic device traffic
  setInterval(() => {
    const devices = network.devices.map((d) =>
      d.lqi !== null && Math.random() < 0.25 ? { ...d, lqi: Math.max(1, Math.min(255, d.lqi + Math.round((Math.random() - 0.5) * 12))) } : d,
    );
    network = { ...network, devices };
    pushNetwork();
  }, 5000);

  const hass = {
    language: opts.language,
    locale: { language: opts.language },
    user: { is_admin: opts.admin, name: "Dev" },
    themes: { darkMode: opts.dark },
    connection: {
      async subscribeMessage<T>(cb: (msg: T) => void, msg: Record<string, unknown>) {
        const sub: Sub = { type: msg.type as string, cb: cb as (m: unknown) => void };
        subs.add(sub);
        await delay();
        if (sub.type === "zigbee_floorplan/network/subscribe") sub.cb({ kind: "network", state: network });
        return async () => {
          subs.delete(sub);
        };
      },
    },
    async callWS<T>(msg: Record<string, unknown>): Promise<T> {
      await delay();
      switch (msg.type) {
        case "zigbee_floorplan/info":
          return { version: "dev", is_admin: opts.admin, base_topic: "zigbee2mqtt", loaded: true } as T;
        case "zigbee_floorplan/project/get":
          return { revision, project: structuredClone(project) } as T;
        case "zigbee_floorplan/project/save": {
          if (!opts.admin) throw { code: "unauthorized", message: "Unauthorized" };
          if (msg.base_revision !== revision) throw { code: "revision_conflict", message: "conflict" };
          revision += 1;
          project = structuredClone(msg.project);
          for (const s of subs) {
            if (s.type === "zigbee_floorplan/project/subscribe") s.cb({ kind: "project", revision, project });
          }
          return { revision } as T;
        }
        case "zigbee_floorplan/network/scan": {
          if (network.scan.status === "scanning") throw { code: "scan_in_progress", message: "A scan is already running" };
          network = { ...network, scan: { ...network.scan, status: "scanning" } };
          pushNetwork();
          setTimeout(() => {
            network = { ...network, scan: { status: "idle", last_scan: new Date().toISOString(), error: null } };
            pushNetwork();
          }, 3500);
          return null as T;
        }
        case "zigbee_floorplan/image/delete":
          return { deleted: images.delete(msg.image_id as string) } as T;
      }
      throw { code: "unknown_command", message: String(msg.type) };
    },
    async fetchWithAuth(path: string, init?: RequestInit): Promise<Response> {
      await delay(120);
      if (path === "/api/zigbee_floorplan/images" && init?.method === "POST") {
        const file = (init.body as FormData).get("file") as Blob;
        const imageId = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
        images.set(imageId, file);
        return new Response(JSON.stringify({ id: imageId }), { status: 200 });
      }
      const m = path.match(/^\/api\/zigbee_floorplan\/images\/([0-9a-f]{32})$/);
      if (m && images.has(m[1])) return new Response(images.get(m[1]), { status: 200 });
      return new Response(JSON.stringify({ message: "Not found" }), { status: 404 });
    },
    setNetwork(n: NetworkState) {
      network = n;
      pushNetwork();
    },
  };
  return hass as unknown as HomeAssistant & { setNetwork(n: NetworkState): void };
}
