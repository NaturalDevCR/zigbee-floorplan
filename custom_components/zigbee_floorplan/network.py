"""Pure helpers that turn Zigbee2MQTT payloads into the NetworkState model.

Kept free of Home Assistant imports so a future ZHA adapter can produce the
same shapes.
"""

from __future__ import annotations

from typing import Any, Literal, TypedDict

DeviceType = Literal["Coordinator", "Router", "EndDevice", "Unknown"]
Relationship = Literal["tree", "sibling", "other"]

_TYPE_ORDER = {"Coordinator": 0, "Router": 1, "EndDevice": 2, "Unknown": 3}


class ZDevice(TypedDict):
    ieee: str
    name: str
    type: DeviceType
    model: str | None
    vendor: str | None
    description: str | None
    power_source: str | None
    network_address: int | None
    interview_completed: bool
    supported: bool


class ZLink(TypedDict):
    a: str
    b: str
    lqi: int | None
    lqi_ab: int | None
    lqi_ba: int | None
    relationship: Relationship
    parent: str | None
    depth: int | None


def _str(value: Any) -> str | None:
    return value if isinstance(value, str) and value else None


def _int(value: Any) -> int | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        return int(value)
    return None


def parse_devices(payload: Any) -> dict[str, ZDevice]:
    """Parse a `bridge/devices` payload, skipping disabled or malformed entries."""
    if not isinstance(payload, list):
        return {}
    devices: dict[str, ZDevice] = {}
    for raw in payload:
        if not isinstance(raw, dict) or raw.get("disabled"):
            continue
        ieee = _str(raw.get("ieee_address"))
        if ieee is None:
            continue
        definition = raw.get("definition") if isinstance(raw.get("definition"), dict) else {}
        dtype = raw.get("type")
        devices[ieee] = ZDevice(
            ieee=ieee,
            name=_str(raw.get("friendly_name")) or ieee,
            type=dtype if dtype in _TYPE_ORDER else "Unknown",
            model=_str(definition.get("model")) or _str(raw.get("model_id")),
            vendor=_str(definition.get("vendor")) or _str(raw.get("manufacturer")),
            description=_str(definition.get("description")),
            power_source=_str(raw.get("power_source")),
            network_address=_int(raw.get("network_address")),
            interview_completed=bool(raw.get("interview_completed", True)),
            supported=bool(raw.get("supported", True)),
        )
    return devices


def _endpoint(raw: dict[str, Any], side: str) -> str | None:
    node = raw.get(side)
    if isinstance(node, dict) and _str(node.get("ieeeAddr")):
        return node["ieeeAddr"]
    return _str(raw.get(f"{side}IeeeAddr"))


def normalize_networkmap(value: Any, known: set[str]) -> list[ZLink]:
    """Collapse raw neighbour-table entries into undirected links.

    A raw entry (source=S, target=T, lqi=q, relationship=r) means T's neighbour
    table lists S: T perceives S with quality q, and r is S's role relative to T
    (0 parent, 1 child, 2 sibling, 3 none, 4 previous child).
    """
    if not isinstance(value, dict) or not isinstance(value.get("links"), list):
        return []

    merged: dict[tuple[str, str], ZLink] = {}
    for raw in value["links"]:
        if not isinstance(raw, dict):
            continue
        source, target = _endpoint(raw, "source"), _endpoint(raw, "target")
        if not source or not target or source == target:
            continue
        if source not in known or target not in known:
            continue

        a, b = sorted((source, target))
        link = merged.setdefault(
            (a, b),
            ZLink(
                a=a, b=b, lqi=None, lqi_ab=None, lqi_ba=None,
                relationship="other", parent=None, depth=None,
            ),
        )

        lqi = _int(raw.get("lqi"))
        if lqi is None:
            lqi = _int(raw.get("linkquality"))
        if lqi is not None:
            key = "lqi_ab" if source == a else "lqi_ba"
            link[key] = lqi if link[key] is None else max(link[key], lqi)
            link["lqi"] = lqi if link["lqi"] is None else max(link["lqi"], lqi)

        depth = _int(raw.get("depth"))
        if depth is not None and 0 <= depth < 255:
            link["depth"] = depth if link["depth"] is None else min(link["depth"], depth)

        rel = _int(raw.get("relationship"))
        if rel in (0, 1):
            link["relationship"] = "tree"
            link["parent"] = source if rel == 0 else target
        elif rel == 2 and link["relationship"] == "other":
            link["relationship"] = "sibling"

    return list(merged.values())


def build_state(
    *,
    devices: dict[str, ZDevice],
    runtime: dict[str, dict[str, Any]],
    links: list[ZLink],
    scan: dict[str, Any],
    bridge_online: bool | None,
    ha_ids: dict[str, str],
) -> dict[str, Any]:
    """Assemble the NetworkState pushed to the frontend."""
    # Devices that have not sent a state message since startup have no live LQI;
    # fall back to how their parent hears them in the last network map.
    parent_lqi: dict[str, int] = {}
    for lk in links:
        if lk["relationship"] != "tree" or lk["parent"] is None:
            continue
        child = lk["b"] if lk["parent"] == lk["a"] else lk["a"]
        heard = lk["lqi_ab"] if child == lk["a"] else lk["lqi_ba"]
        value = heard if heard is not None else lk["lqi"]
        if value is not None:
            parent_lqi[child] = value

    out = []
    for dev in sorted(
        devices.values(), key=lambda d: (_TYPE_ORDER[d["type"]], d["name"].lower())
    ):
        rt = runtime.get(dev["ieee"], {})
        out.append(
            {
                **dev,
                "available": rt.get("available"),
                "lqi": rt["lqi"] if rt.get("lqi") is not None else parent_lqi.get(dev["ieee"]),
                "battery": rt.get("battery"),
                "last_seen": rt.get("last_seen"),
                "ha_device_id": ha_ids.get(dev["ieee"]),
            }
        )
    return {
        "bridge_online": bridge_online,
        "devices": out,
        "links": [lk for lk in links if lk["a"] in devices and lk["b"] in devices],
        "scan": dict(scan),
    }
