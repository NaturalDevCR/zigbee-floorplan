"""Websocket API and setup wiring tests."""

import json

import pytest

from homeassistant.components import frontend
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    async_fire_mqtt_message,
    async_fire_time_changed,
)

from custom_components.zigbee_floorplan.const import CONF_BASE_TOPIC, DOMAIN, PANEL_URL

from .test_network import COORD, DEVICES_PAYLOAD, ROUTER, link
from .test_store import project

pytestmark = pytest.mark.parametrize("expected_lingering_timers", [True])


@pytest.fixture
async def entry(hass: HomeAssistant, mqtt_mock) -> MockConfigEntry:
    entry = MockConfigEntry(domain=DOMAIN, data={CONF_BASE_TOPIC: "zigbee2mqtt"})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    async_fire_mqtt_message(hass, "zigbee2mqtt/bridge/devices", json.dumps(DEVICES_PAYLOAD))
    await hass.async_block_till_done()
    return entry


async def test_info(hass: HomeAssistant, entry, hass_ws_client) -> None:
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({"type": "zigbee_floorplan/info"})
    msg = await ws.receive_json()
    assert msg["success"]
    assert msg["result"]["is_admin"] is True
    assert msg["result"]["base_topic"] == "zigbee2mqtt"
    assert msg["result"]["loaded"] is True
    # lets an open browser tab detect it runs an outdated bundle
    assert isinstance(msg["result"]["frontend_hash"], str)
    assert msg["result"]["frontend_hash"]


async def test_project_roundtrip(hass: HomeAssistant, entry, hass_ws_client) -> None:
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({"type": "zigbee_floorplan/project/get"})
    msg = await ws.receive_json()
    assert msg["result"]["revision"] == 0

    await ws.send_json_auto_id(
        {"type": "zigbee_floorplan/project/save", "project": project(), "base_revision": 0}
    )
    msg = await ws.receive_json()
    assert msg["result"] == {"revision": 1}

    await ws.send_json_auto_id(
        {"type": "zigbee_floorplan/project/save", "project": project(), "base_revision": 0}
    )
    msg = await ws.receive_json()
    assert msg["error"]["code"] == "revision_conflict"

    await ws.send_json_auto_id(
        {"type": "zigbee_floorplan/project/save", "project": {"version": 1, "floors": 3},
         "base_revision": 1}
    )
    msg = await ws.receive_json()
    assert msg["error"]["code"] == "invalid_project"


async def test_save_requires_admin(
    hass: HomeAssistant, entry, hass_ws_client, hass_read_only_access_token
) -> None:
    ws = await hass_ws_client(hass, hass_read_only_access_token)
    await ws.send_json_auto_id(
        {"type": "zigbee_floorplan/project/save", "project": project(), "base_revision": 0}
    )
    msg = await ws.receive_json()
    assert msg["error"]["code"] == "unauthorized"
    await ws.send_json_auto_id({"type": "zigbee_floorplan/network/scan"})
    msg = await ws.receive_json()
    assert msg["error"]["code"] == "unauthorized"
    await ws.send_json_auto_id({"type": "zigbee_floorplan/project/get"})
    msg = await ws.receive_json()
    assert msg["success"]


async def test_project_subscription(hass: HomeAssistant, entry, hass_ws_client) -> None:
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({"type": "zigbee_floorplan/project/subscribe"})
    sub = await ws.receive_json()
    assert sub["success"]
    await ws.send_json_auto_id(
        {"type": "zigbee_floorplan/project/save", "project": project(), "base_revision": 0}
    )
    first = await ws.receive_json()
    second = await ws.receive_json()
    event = next(m for m in (first, second) if m["type"] == "event")
    assert event["id"] == sub["id"]
    assert event["event"]["kind"] == "project"
    assert event["event"]["revision"] == 1


async def test_network_subscription_and_scan(
    hass: HomeAssistant, entry, hass_ws_client, freezer
) -> None:
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({"type": "zigbee_floorplan/network/subscribe"})
    assert (await ws.receive_json())["success"]
    snap = await ws.receive_json()
    assert snap["event"]["kind"] == "network"
    assert len(snap["event"]["state"]["devices"]) == 3

    await ws.send_json_auto_id({"type": "zigbee_floorplan/network/scan"})
    assert (await ws.receive_json())["success"]
    await ws.send_json_auto_id({"type": "zigbee_floorplan/network/scan"})
    assert (await ws.receive_json())["error"]["code"] == "scan_in_progress"

    async_fire_mqtt_message(
        hass,
        "zigbee2mqtt/bridge/response/networkmap",
        json.dumps({"status": "ok", "data": {"type": "raw", "value": {
            "links": [link(ROUTER, COORD, 150, 1)]}}}),
    )
    await hass.async_block_till_done()
    freezer.tick(1)
    async_fire_time_changed(hass)
    await hass.async_block_till_done()
    update = await ws.receive_json()
    assert update["event"]["state"]["scan"]["status"] == "idle"
    assert len(update["event"]["state"]["links"]) == 1


async def test_panel_registered_and_removed(hass: HomeAssistant, entry) -> None:
    assert PANEL_URL in hass.data[frontend.DATA_PANELS]
    await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    assert PANEL_URL not in hass.data[frontend.DATA_PANELS]

    # reload works (static path registered only once)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert PANEL_URL in hass.data[frontend.DATA_PANELS]


async def test_not_loaded(hass: HomeAssistant, entry, hass_ws_client) -> None:
    await hass.config_entries.async_unload(entry.entry_id)
    await hass.async_block_till_done()
    ws = await hass_ws_client(hass)
    await ws.send_json_auto_id({"type": "zigbee_floorplan/project/get"})
    assert (await ws.receive_json())["error"]["code"] == "not_loaded"
