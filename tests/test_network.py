"""Tests for pure Zigbee2MQTT network parsing."""

from custom_components.zigbee_floorplan.network import (
    build_state,
    normalize_networkmap,
    parse_devices,
)

COORD = "0x00124b0000000001"
ROUTER = "0x00124b0000000002"
SENSOR = "0x00124b0000000003"
GHOST = "0x00124b00000000ff"

DEVICES_PAYLOAD = [
    {
        "ieee_address": COORD,
        "type": "Coordinator",
        "network_address": 0,
        "friendly_name": "Coordinator",
        "supported": True,
        "disabled": False,
        "interview_completed": True,
        "definition": None,
    },
    {
        "ieee_address": ROUTER,
        "type": "Router",
        "network_address": 1234,
        "friendly_name": "Kitchen plug",
        "supported": True,
        "disabled": False,
        "interview_completed": True,
        "power_source": "Mains (single phase)",
        "definition": {
            "model": "ZBMINI",
            "vendor": "SONOFF",
            "description": "Zigbee two way smart switch",
        },
    },
    {
        "ieee_address": SENSOR,
        "type": "EndDevice",
        "network_address": 4321,
        "friendly_name": "Bedroom/Temp",
        "supported": True,
        "interview_completed": True,
        "power_source": "Battery",
        "definition": {"model": "WSDCGQ11LM", "vendor": "Aqara", "description": "T/H"},
    },
    {
        "ieee_address": "0x00124b0000000004",
        "type": "Router",
        "friendly_name": "Disabled one",
        "disabled": True,
        "definition": None,
    },
    {"type": "Router", "friendly_name": "broken, no ieee"},
]


def link(source, target, lqi, relationship, depth=1):
    return {
        "source": {"ieeeAddr": source, "networkAddress": 1},
        "target": {"ieeeAddr": target, "networkAddress": 2},
        "lqi": lqi,
        "linkquality": lqi,
        "relationship": relationship,
        "depth": depth,
    }


def test_parse_devices_fields_and_filtering() -> None:
    devices = parse_devices(DEVICES_PAYLOAD)
    assert set(devices) == {COORD, ROUTER, SENSOR}
    assert devices[COORD]["type"] == "Coordinator"
    assert devices[COORD]["model"] is None
    assert devices[ROUTER] == {
        "ieee": ROUTER,
        "name": "Kitchen plug",
        "type": "Router",
        "model": "ZBMINI",
        "vendor": "SONOFF",
        "description": "Zigbee two way smart switch",
        "power_source": "Mains (single phase)",
        "network_address": 1234,
        "interview_completed": True,
        "supported": True,
    }
    assert devices[SENSOR]["name"] == "Bedroom/Temp"


def test_parse_devices_rejects_non_list() -> None:
    assert parse_devices({"oops": 1}) == {}


def test_normalize_merges_directions() -> None:
    known = {COORD, ROUTER, SENSOR}
    links = normalize_networkmap(
        {
            "links": [
                link(ROUTER, COORD, 140, 1),
                link(COORD, ROUTER, 120, 0),
            ]
        },
        known,
    )
    assert len(links) == 1
    lk = links[0]
    assert (lk["a"], lk["b"]) == (COORD, ROUTER)
    assert lk["lqi"] == 140
    # lqi_xy = signal from x as perceived by y (y's neighbour table lists x)
    assert lk["lqi_ba"] == 140
    assert lk["lqi_ab"] == 120
    assert lk["relationship"] == "tree"
    assert lk["parent"] == COORD


def test_normalize_relationship_priority() -> None:
    known = {COORD, ROUTER}
    links = normalize_networkmap(
        {"links": [link(ROUTER, COORD, 90, 2), link(COORD, ROUTER, 80, 1)]}, known
    )
    assert links[0]["relationship"] == "tree"
    # relationship 1: source (COORD) is child of target (ROUTER) => ROUTER is parent
    assert links[0]["parent"] == ROUTER


def test_normalize_sibling_and_other() -> None:
    known = {COORD, ROUTER, SENSOR}
    links = normalize_networkmap(
        {"links": [link(ROUTER, COORD, 90, 2), link(SENSOR, ROUTER, 30, 4)]}, known
    )
    by_pair = {frozenset((lk["a"], lk["b"])): lk for lk in links}
    assert by_pair[frozenset((COORD, ROUTER))]["relationship"] == "sibling"
    assert by_pair[frozenset((COORD, ROUTER))]["parent"] is None
    assert by_pair[frozenset((SENSOR, ROUTER))]["relationship"] == "other"


def test_normalize_drops_unknown_self_and_malformed() -> None:
    known = {COORD, ROUTER}
    links = normalize_networkmap(
        {
            "links": [
                link(GHOST, COORD, 100, 1),
                link(COORD, COORD, 100, 1),
                {"source": None, "target": {"ieeeAddr": COORD}},
                "garbage",
            ]
        },
        known,
    )
    assert links == []
    assert normalize_networkmap(None, known) == []


def test_normalize_uses_flat_ieee_fields_and_linkquality() -> None:
    known = {COORD, ROUTER}
    links = normalize_networkmap(
        {
            "links": [
                {
                    "sourceIeeeAddr": ROUTER,
                    "targetIeeeAddr": COORD,
                    "linkquality": 77,
                    "relationship": 1,
                }
            ]
        },
        known,
    )
    assert links[0]["lqi"] == 77
    assert links[0]["depth"] is None


def test_build_state_merges_runtime_info() -> None:
    devices = parse_devices(DEVICES_PAYLOAD)
    state = build_state(
        devices=devices,
        runtime={
            ROUTER: {"lqi": 120, "available": True, "last_seen": "2026-11-18T10:00:00Z"},
            SENSOR: {"battery": 55, "available": False},
        },
        links=[],
        scan={"status": "idle", "last_scan": None, "error": None},
        bridge_online=True,
        ha_ids={ROUTER: "dev123"},
    )
    by_ieee = {d["ieee"]: d for d in state["devices"]}
    assert state["bridge_online"] is True
    assert by_ieee[ROUTER]["lqi"] == 120
    assert by_ieee[ROUTER]["ha_device_id"] == "dev123"
    assert by_ieee[ROUTER]["battery"] is None
    assert by_ieee[SENSOR]["available"] is False
    assert by_ieee[SENSOR]["battery"] == 55
    assert by_ieee[COORD]["available"] is None
    assert [d["type"] for d in state["devices"]][0] == "Coordinator"
