"""Zigbee2MQTT adapter tests."""

from datetime import timedelta
import json

import pytest

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry as dr
from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_mqtt_message,
    async_fire_time_changed,
)

from custom_components.zigbee_floorplan.store import NetworkCache
from custom_components.zigbee_floorplan.z2m import ScanInProgress, Z2MAdapter

from .test_network import COORD, DEVICES_PAYLOAD, ROUTER, SENSOR, link

BASE = "zigbee2mqtt"

# The mocked MQTT client leaves its own periodic timer running.
pytestmark = pytest.mark.parametrize("expected_lingering_timers", [True])


@pytest.fixture
async def adapter(hass: HomeAssistant, mqtt_mock):
    ad = Z2MAdapter(hass, BASE, NetworkCache(hass))
    await ad.async_start()
    async_fire_mqtt_message(hass, f"{BASE}/bridge/devices", json.dumps(DEVICES_PAYLOAD))
    await hass.async_block_till_done()
    yield ad
    await ad.async_stop()


def dev(ad: Z2MAdapter, ieee: str) -> dict:
    return next(d for d in ad.state["devices"] if d["ieee"] == ieee)


async def test_devices_loaded(adapter: Z2MAdapter) -> None:
    assert {d["ieee"] for d in adapter.state["devices"]} == {COORD, ROUTER, SENSOR}


async def test_state_message_updates_runtime(hass: HomeAssistant, adapter) -> None:
    async_fire_mqtt_message(
        hass, f"{BASE}/Kitchen plug", json.dumps({"linkquality": 88, "state": "ON"})
    )
    async_fire_mqtt_message(
        hass, f"{BASE}/Bedroom/Temp",
        json.dumps({"linkquality": 40, "battery": 50, "last_seen": 1763460000000}),
    )
    await hass.async_block_till_done()
    assert dev(adapter, ROUTER)["lqi"] == 88
    assert dev(adapter, ROUTER)["last_seen"] is not None
    assert dev(adapter, SENSOR)["battery"] == 50
    assert dev(adapter, SENSOR)["last_seen"].startswith("2025-11-18")


async def test_ignores_unknown_and_set_topics(hass: HomeAssistant, adapter) -> None:
    async_fire_mqtt_message(hass, f"{BASE}/Kitchen plug/set", json.dumps({"linkquality": 1}))
    async_fire_mqtt_message(hass, f"{BASE}/Nobody", "not json")
    async_fire_mqtt_message(hass, f"{BASE}/Kitchen plug", "not json")
    await hass.async_block_till_done()
    assert dev(adapter, ROUTER)["lqi"] is None


async def test_availability(hass: HomeAssistant, adapter) -> None:
    async_fire_mqtt_message(hass, f"{BASE}/Kitchen plug/availability", '{"state":"offline"}')
    async_fire_mqtt_message(hass, f"{BASE}/Bedroom/Temp/availability", "online")
    await hass.async_block_till_done()
    assert dev(adapter, ROUTER)["available"] is False
    assert dev(adapter, SENSOR)["available"] is True


async def test_bridge_state(hass: HomeAssistant, adapter) -> None:
    async_fire_mqtt_message(hass, f"{BASE}/bridge/state", '{"state":"offline"}')
    await hass.async_block_till_done()
    assert adapter.state["bridge_online"] is False
    async_fire_mqtt_message(hass, f"{BASE}/bridge/state", "online")
    await hass.async_block_till_done()
    assert adapter.state["bridge_online"] is True


async def test_scan_lifecycle(hass: HomeAssistant, adapter, mqtt_mock) -> None:
    calls = []
    unsub = adapter.add_listener(lambda: calls.append(1))
    await adapter.async_scan()
    assert adapter.state["scan"]["status"] == "scanning"
    topic, payload = mqtt_mock.async_publish.call_args.args[:2]
    assert topic == f"{BASE}/bridge/request/networkmap"
    assert json.loads(payload) == {"type": "raw", "routes": False}
    with pytest.raises(ScanInProgress):
        await adapter.async_scan()

    response = {
        "data": {
            "type": "raw",
            "routes": False,
            "value": {"nodes": [], "links": [link(ROUTER, COORD, 150, 1), link(SENSOR, ROUTER, 60, 1)]},
        },
        "status": "ok",
    }
    async_fire_mqtt_message(hass, f"{BASE}/bridge/response/networkmap", json.dumps(response))
    await hass.async_block_till_done()
    scan = adapter.state["scan"]
    assert scan["status"] == "idle"
    assert scan["last_scan"] is not None
    assert len(adapter.state["links"]) == 2
    assert calls
    unsub()

    cached = await NetworkCache(hass).async_load()
    assert len(cached["links"]) == 2

    # timeout after a completed scan must not flip the status
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=200))
    await hass.async_block_till_done()
    assert adapter.state["scan"]["status"] == "idle"


async def test_scan_error_response(hass: HomeAssistant, adapter) -> None:
    await adapter.async_scan()
    async_fire_mqtt_message(
        hass, f"{BASE}/bridge/response/networkmap",
        json.dumps({"data": {}, "status": "error", "error": "busy"}),
    )
    await hass.async_block_till_done()
    assert adapter.state["scan"] == {
        "status": "error", "last_scan": None, "error": "busy",
    }


async def test_scan_timeout(hass: HomeAssistant, adapter) -> None:
    await adapter.async_scan()
    async_fire_time_changed(hass, dt_util.utcnow() + timedelta(seconds=181))
    await hass.async_block_till_done()
    assert adapter.state["scan"]["status"] == "error"
    assert adapter.state["scan"]["error"] == "timeout"


async def test_links_restored_from_cache(hass: HomeAssistant, mqtt_mock) -> None:
    cache = NetworkCache(hass)
    await cache.async_save(
        {
            "links": [{"a": COORD, "b": ROUTER, "lqi": 100, "lqi_ab": 100, "lqi_ba": None,
                       "relationship": "tree", "parent": COORD, "depth": 1}],
            "last_scan": "2026-11-18T00:00:00+00:00",
        }
    )
    ad = Z2MAdapter(hass, BASE, cache)
    await ad.async_start()
    async_fire_mqtt_message(hass, f"{BASE}/bridge/devices", json.dumps(DEVICES_PAYLOAD))
    await hass.async_block_till_done()
    assert len(ad.state["links"]) == 1
    assert ad.state["scan"]["last_scan"] == "2026-11-18T00:00:00+00:00"
    await ad.async_stop()


async def test_ha_device_ids(hass: HomeAssistant, mqtt_mock) -> None:
    entry = MockConfigEntry(domain="mqtt")
    entry.add_to_hass(hass)
    reg = dr.async_get(hass)
    plug = reg.async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={("mqtt", f"zigbee2mqtt_{ROUTER}")}
    )
    bridge = reg.async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={("mqtt", f"zigbee2mqtt_bridge_{COORD}")}
    )
    ad = Z2MAdapter(hass, BASE, NetworkCache(hass))
    await ad.async_start()
    async_fire_mqtt_message(hass, f"{BASE}/bridge/devices", json.dumps(DEVICES_PAYLOAD))
    await hass.async_block_till_done()
    assert dev(ad, ROUTER)["ha_device_id"] == plug.id
    assert dev(ad, COORD)["ha_device_id"] == bridge.id
    assert dev(ad, SENSOR)["ha_device_id"] is None
    await ad.async_stop()


async def test_stop_unsubscribes(hass: HomeAssistant, mqtt_mock) -> None:
    ad = Z2MAdapter(hass, BASE, NetworkCache(hass))
    await ad.async_start()
    await ad.async_stop()
    async_fire_mqtt_message(hass, f"{BASE}/bridge/devices", json.dumps(DEVICES_PAYLOAD))
    await hass.async_block_till_done()
    assert ad.state["devices"] == []
