import { describe, expect, it } from "vitest";
import { buildTopology, isRoute } from "../src/topology";
import type { DeviceType, NetworkState, ZDevice, ZLink } from "../src/types";

const dev = (ieee: string, type: DeviceType): ZDevice => ({
  ieee, name: ieee, type, model: null, vendor: null, description: null, power_source: null,
  network_address: null, interview_completed: true, supported: true, available: true,
  lqi: null, battery: null, last_seen: null, ha_device_id: null,
});

const link = (a: string, b: string, lqi: number, relationship: ZLink["relationship"] = "sibling", parent: string | null = null): ZLink => ({
  a: a < b ? a : b, b: a < b ? b : a, lqi, lqi_ab: lqi, lqi_ba: lqi, relationship, parent, depth: null,
});

const net = (devices: ZDevice[], links: ZLink[]): NetworkState => ({
  bridge_online: true, devices, links, scan: { status: "idle", last_scan: null, error: null },
});

describe("buildTopology", () => {
  const devices = [dev("C", "Coordinator"), dev("R1", "Router"), dev("R2", "Router"), dev("R3", "Router"), dev("S", "EndDevice"), dev("Z", "EndDevice")];

  it("routes routers through the strongest path even when links are only neighbours", () => {
    const links = [
      link("C", "R1", 220), // strong, direct
      link("R1", "R2", 200),
      link("C", "R2", 40), // weak direct link: not worth it
      link("R2", "R3", 190),
    ];
    const t = buildTopology(net(devices, links));
    expect(t.uplink.get("R1")).toBe("C");
    expect(t.uplink.get("R2")).toBe("R1");
    expect(t.uplink.get("R3")).toBe("R2");
    expect([t.hops.get("R1"), t.hops.get("R2"), t.hops.get("R3")]).toEqual([1, 2, 3]);
    expect(t.hops.get("C")).toBe(0);
    expect(t.children.get("R1")).toEqual(["R2"]);
  });

  it("attaches end devices to their reported parent", () => {
    const links = [
      link("C", "R1", 200),
      link("C", "R2", 200),
      link("R1", "S", 100, "tree", "R1"),
      link("R2", "S", 250), // stronger but not the parent
    ];
    const t = buildTopology(net(devices, links));
    expect(t.uplink.get("S")).toBe("R1");
    expect(t.hops.get("S")).toBe(2);
  });

  it("picks the best router for end devices without a reported parent", () => {
    const links = [link("C", "R1", 200), link("R1", "R2", 200), link("R1", "Z", 80), link("R2", "Z", 230)];
    const t = buildTopology(net(devices, links));
    expect(t.uplink.get("Z")).toBe("R2");
  });

  it("does not route through end devices", () => {
    const links = [link("C", "S", 250), link("S", "R3", 250)];
    const t = buildTopology(net(devices, links));
    expect(t.uplink.get("R3")).toBeNull();
    expect(t.hops.get("R3")).toBeNull();
  });

  it("leaves devices without links unlinked", () => {
    const t = buildTopology(net(devices, [link("C", "R1", 200)]));
    expect(t.uplink.get("R2")).toBeNull();
    expect(t.uplink.get("S")).toBeNull();
    expect(t.hops.get("R2")).toBeNull();
  });

  it("marks only the chosen links as routes", () => {
    const links = [link("C", "R1", 220), link("C", "R2", 40), link("R1", "R2", 200)];
    const t = buildTopology(net(devices, links));
    expect(isRoute(t, links[0])).toBe(true);
    expect(isRoute(t, links[1])).toBe(false);
    expect(isRoute(t, links[2])).toBe(true);
  });

  it("handles a network without a coordinator", () => {
    const t = buildTopology(net([dev("R1", "Router")], []));
    expect(t.uplink.get("R1")).toBeNull();
    expect(t.routes.size).toBe(0);
  });
});
