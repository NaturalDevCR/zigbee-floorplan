import type { NetworkState, ZLink } from "./types";

/**
 * How the mesh connects, inferred from the neighbour links of the last scan.
 *
 * Zigbee2MQTT only labels parent/child for end devices; router-to-router links
 * come back as plain neighbours. Every device still has one route towards the
 * coordinator, so we pick it: the cheapest path over routers (strong links and
 * few hops win), and for end devices their reported parent when there is one.
 */
export interface Topology {
  /** next hop towards the coordinator; null when the device has no usable link */
  uplink: Map<string, string | null>;
  /** hops to the coordinator (coordinator = 0) */
  hops: Map<string, number | null>;
  children: Map<string, string[]>;
  /** links that are some device's chosen route */
  routes: Set<string>;
}

export const linkKey = (a: string, b: string): string => (a < b ? `${a}|${b}` : `${b}|${a}`);

export const isRoute = (topo: Topology, link: ZLink): boolean => topo.routes.has(linkKey(link.a, link.b));

const UNKNOWN_QUALITY = 0.4;
const TREE_BONUS = 0.4;

function edgeCost(link: ZLink): number {
  const q = link.lqi === null ? UNKNOWN_QUALITY : Math.min(1, Math.max(0, link.lqi / 255));
  // quadratic: a hop is cheap on a strong link, but a weak link is worth avoiding for an extra hop
  const cost = 1 + 4 * (1 - q) ** 2 - (link.relationship === "tree" ? TREE_BONUS : 0);
  return Math.max(0.2, cost);
}

const cache = new WeakMap<NetworkState, Topology>();

export function getTopology(network: NetworkState | null): Topology {
  if (!network) return emptyTopology();
  let topo = cache.get(network);
  if (!topo) cache.set(network, (topo = buildTopology(network)));
  return topo;
}

function emptyTopology(): Topology {
  return { uplink: new Map(), hops: new Map(), children: new Map(), routes: new Set() };
}

export function buildTopology(network: NetworkState): Topology {
  const topo = emptyTopology();
  const type = new Map(network.devices.map((d) => [d.ieee, d.type]));
  const forwards = (ieee: string) => type.get(ieee) === "Coordinator" || type.get(ieee) === "Router";
  const coordinator = network.devices.find((d) => d.type === "Coordinator")?.ieee;

  const edges = new Map<string, { other: string; link: ZLink }[]>();
  for (const link of network.links) {
    if (!type.has(link.a) || !type.has(link.b)) continue;
    for (const [from, other] of [[link.a, link.b], [link.b, link.a]] as const) {
      const list = edges.get(from) ?? [];
      list.push({ other, link });
      edges.set(from, list);
    }
  }

  for (const d of network.devices) {
    topo.uplink.set(d.ieee, null);
    topo.hops.set(d.ieee, null);
  }
  if (!coordinator) return topo;

  // Dijkstra over the coordinator and routers: end devices cannot forward traffic.
  const cost = new Map<string, number>([[coordinator, 0]]);
  const via = new Map<string, { parent: string; link: ZLink }>();
  const done = new Set<string>();
  topo.hops.set(coordinator, 0);
  for (;;) {
    let current: string | null = null;
    for (const [ieee, c] of cost) {
      if (!done.has(ieee) && (current === null || c < cost.get(current)!)) current = ieee;
    }
    if (current === null) break;
    done.add(current);
    for (const { other, link } of edges.get(current) ?? []) {
      if (!forwards(other) || done.has(other)) continue;
      const next = cost.get(current)! + edgeCost(link);
      if (next < (cost.get(other) ?? Infinity)) {
        cost.set(other, next);
        via.set(other, { parent: current, link });
      }
    }
  }
  for (const [ieee, { parent, link }] of via) {
    topo.uplink.set(ieee, parent);
    topo.routes.add(linkKey(link.a, link.b));
  }
  // hop counts follow the chosen parents
  const hopsOf = (ieee: string): number | null => {
    if (ieee === coordinator) return 0;
    const seen = new Set<string>();
    let hops = 0;
    for (let cur: string | undefined = ieee; cur && cur !== coordinator; cur = via.get(cur)?.parent) {
      if (seen.has(cur)) return null;
      seen.add(cur);
      hops++;
      if (!via.has(cur)) return null;
    }
    return hops;
  };
  for (const ieee of via.keys()) topo.hops.set(ieee, hopsOf(ieee));

  // End devices attach to their reported parent, otherwise the best reachable router.
  for (const d of network.devices) {
    if (forwards(d.ieee)) continue;
    const candidates = (edges.get(d.ieee) ?? []).filter(({ other }) => forwards(other) && topo.hops.get(other) !== null);
    if (!candidates.length) continue;
    const reported = candidates.find(({ other, link }) => link.relationship === "tree" && link.parent === other);
    const best =
      reported ??
      candidates.reduce((a, b) =>
        (cost.get(a.other) ?? Infinity) + edgeCost(a.link) <= (cost.get(b.other) ?? Infinity) + edgeCost(b.link) ? a : b,
      );
    topo.uplink.set(d.ieee, best.other);
    topo.hops.set(d.ieee, (topo.hops.get(best.other) ?? 0) + 1);
    topo.routes.add(linkKey(d.ieee, best.other));
  }

  for (const [ieee, parent] of topo.uplink) {
    if (!parent) continue;
    const list = topo.children.get(parent) ?? [];
    list.push(ieee);
    topo.children.set(parent, list);
  }
  return topo;
}
