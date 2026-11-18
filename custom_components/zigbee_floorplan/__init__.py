"""Zigbee Floorplan integration."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta
import logging

from homeassistant.components import mqtt
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.exceptions import ConfigEntryNotReady
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import async_track_time_interval
from homeassistant.helpers.typing import ConfigType

from .const import (
    CONF_BASE_TOPIC,
    CONF_SCAN_INTERVAL,
    DOMAIN,
    SIGNAL_NETWORK,
    SIGNAL_PROJECT,
)
from .images import async_register_image_views
from .panel import async_register_frontend, async_unregister_frontend
from .store import NetworkCache, ProjectStore
from .websocket_api import async_register_websocket_commands
from .z2m import ScanInProgress, Z2MAdapter

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


@dataclass
class FloorplanData:
    adapter: Z2MAdapter
    store: ProjectStore


type FloorplanConfigEntry = ConfigEntry[FloorplanData]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    async_register_websocket_commands(hass)
    async_register_image_views(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: FloorplanConfigEntry) -> bool:
    if not await mqtt.async_wait_for_mqtt_client(hass):
        raise ConfigEntryNotReady("MQTT is not available")

    base_topic = entry.options.get(CONF_BASE_TOPIC, entry.data[CONF_BASE_TOPIC])
    store = ProjectStore(hass)
    await store.async_load()
    adapter = Z2MAdapter(hass, base_topic, NetworkCache(hass))
    await adapter.async_start()

    entry.async_on_unload(
        adapter.add_listener(lambda: async_dispatcher_send(hass, SIGNAL_NETWORK))
    )
    entry.async_on_unload(
        store.add_listener(lambda data: async_dispatcher_send(hass, SIGNAL_PROJECT, data))
    )

    if hours := entry.options.get(CONF_SCAN_INTERVAL, 0):

        @callback
        def _periodic_scan(_now) -> None:
            hass.async_create_task(_safe_scan(adapter), eager_start=True)

        entry.async_on_unload(
            async_track_time_interval(hass, _periodic_scan, timedelta(hours=hours))
        )

    entry.runtime_data = FloorplanData(adapter=adapter, store=store)
    await async_register_frontend(hass)
    async_dispatcher_send(hass, SIGNAL_NETWORK)
    return True


async def _safe_scan(adapter: Z2MAdapter) -> None:
    try:
        await adapter.async_scan()
    except ScanInProgress:
        _LOGGER.debug("Skipping scheduled scan: one is already running")


async def async_unload_entry(hass: HomeAssistant, entry: FloorplanConfigEntry) -> bool:
    await entry.runtime_data.adapter.async_stop()
    async_unregister_frontend(hass)
    return True
