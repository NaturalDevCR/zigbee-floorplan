"""Zigbee2MQTT adapter: turns MQTT traffic into a NetworkState."""

from __future__ import annotations

from collections.abc import Callable
from datetime import UTC, datetime
import json
import logging
from typing import Any

from homeassistant.components import mqtt
from homeassistant.components.mqtt.models import ReceiveMessage
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers.event import async_call_later
from homeassistant.util import dt as dt_util

from .const import SCAN_TIMEOUT
from .network import ZDevice, ZLink, build_state, normalize_networkmap, parse_devices
from .store import NetworkCache

_LOGGER = logging.getLogger(__name__)

_IGNORED_SUFFIXES = ("/set", "/get")
_IDENT_PREFIX = "zigbee2mqtt_"
_BRIDGE_IDENT_PREFIX = "zigbee2mqtt_bridge_"


class ScanInProgress(Exception):
    """A network map scan is already running."""


def _parse_json(payload: Any) -> Any:
    try:
        return json.loads(payload)
    except (TypeError, ValueError):
        return None


def _online(payload: Any) -> bool | None:
    data = _parse_json(payload)
    state = data.get("state") if isinstance(data, dict) else payload
    if state == "online":
        return True
    if state == "offline":
        return False
    return None


def _last_seen(value: Any) -> str | None:
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return datetime.fromtimestamp(value / 1000, tz=UTC).isoformat()
    if isinstance(value, str) and value:
        return value
    return None


class Z2MAdapter:
    """Subscribe to a Zigbee2MQTT base topic and track the mesh."""

    def __init__(self, hass: HomeAssistant, base_topic: str, cache: NetworkCache) -> None:
        self._hass = hass
        self._base = base_topic
        self._cache = cache
        self._devices: dict[str, ZDevice] = {}
        self._by_name: dict[str, str] = {}
        self._runtime: dict[str, dict[str, Any]] = {}
        self._links: list[ZLink] = []
        self._ha_ids: dict[str, str] = {}
        self._bridge_online: bool | None = None
        self._scan: dict[str, Any] = {"status": "idle", "last_scan": None, "error": None}
        self._listeners: list[Callable[[], None]] = []
        self._unsubs: list[CALLBACK_TYPE] = []
        self._scan_timeout: CALLBACK_TYPE | None = None

    @property
    def base_topic(self) -> str:
        return self._base

    @property
    def state(self) -> dict[str, Any]:
        return build_state(
            devices=self._devices,
            runtime=self._runtime,
            links=self._links,
            scan=self._scan,
            bridge_online=self._bridge_online,
            ha_ids=self._ha_ids,
        )

    @callback
    def add_listener(self, listener: Callable[[], None]) -> Callable[[], None]:
        self._listeners.append(listener)

        @callback
        def remove() -> None:
            if listener in self._listeners:
                self._listeners.remove(listener)

        return remove

    @callback
    def _notify(self) -> None:
        for listener in list(self._listeners):
            listener()

    async def async_start(self) -> None:
        cached = await self._cache.async_load()
        if cached:
            self._links = cached.get("links") or []
            self._scan["last_scan"] = cached.get("last_scan")

        self._unsubs.append(
            await mqtt.async_subscribe(self._hass, f"{self._base}/#", self._on_message)
        )
        self._unsubs.append(
            self._hass.bus.async_listen(
                dr.EVENT_DEVICE_REGISTRY_UPDATED, self._on_registry_updated
            )
        )

    async def async_stop(self) -> None:
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        self._cancel_timeout()
        self._listeners.clear()

    async def async_scan(self) -> None:
        if self._scan["status"] == "scanning":
            raise ScanInProgress
        self._scan = {**self._scan, "status": "scanning", "error": None}
        self._cancel_timeout()
        self._scan_timeout = async_call_later(self._hass, SCAN_TIMEOUT, self._on_timeout)
        self._notify()
        await mqtt.async_publish(
            self._hass,
            f"{self._base}/bridge/request/networkmap",
            json.dumps({"type": "raw", "routes": False}),
        )

    @callback
    def _cancel_timeout(self) -> None:
        if self._scan_timeout:
            self._scan_timeout()
            self._scan_timeout = None

    @callback
    def _on_timeout(self, _now: datetime) -> None:
        self._scan_timeout = None
        if self._scan["status"] == "scanning":
            self._scan = {**self._scan, "status": "error", "error": "timeout"}
            self._notify()

    @callback
    def _on_registry_updated(self, _event: Event) -> None:
        if self._refresh_ha_ids():
            self._notify()

    @callback
    def _refresh_ha_ids(self) -> bool:
        registry = dr.async_get(self._hass)
        ids: dict[str, str] = {}
        for ieee, device in self._devices.items():
            prefix = _BRIDGE_IDENT_PREFIX if device["type"] == "Coordinator" else _IDENT_PREFIX
            entry = registry.async_get_device(identifiers={("mqtt", f"{prefix}{ieee}")})
            if entry:
                ids[ieee] = entry.id
        changed = ids != self._ha_ids
        self._ha_ids = ids
        return changed

    @callback
    def _on_message(self, msg: ReceiveMessage) -> None:
        rest = msg.topic[len(self._base) + 1:]
        if rest.startswith("bridge/"):
            self._on_bridge(rest[7:], msg.payload)
            return
        if rest.endswith(_IGNORED_SUFFIXES):
            return
        if rest.endswith("/availability"):
            ieee = self._by_name.get(rest[: -len("/availability")])
            if ieee:
                self._runtime.setdefault(ieee, {})["available"] = _online(msg.payload)
                self._notify()
            return
        ieee = self._by_name.get(rest)
        if not ieee:
            return
        data = _parse_json(msg.payload)
        if not isinstance(data, dict):
            return
        rt = self._runtime.setdefault(ieee, {})
        if isinstance(data.get("linkquality"), int):
            rt["lqi"] = data["linkquality"]
        if isinstance(data.get("battery"), (int, float)):
            rt["battery"] = round(data["battery"])
        rt["last_seen"] = _last_seen(data.get("last_seen")) or dt_util.utcnow().isoformat()
        self._notify()

    @callback
    def _on_bridge(self, sub: str, payload: Any) -> None:
        if sub == "devices":
            self._devices = parse_devices(_parse_json(payload))
            self._by_name = {d["name"]: ieee for ieee, d in self._devices.items()}
            self._runtime = {k: v for k, v in self._runtime.items() if k in self._devices}
            self._refresh_ha_ids()
            self._notify()
        elif sub == "state":
            self._bridge_online = _online(payload)
            self._notify()
        elif sub == "response/networkmap":
            self._on_networkmap(_parse_json(payload))

    @callback
    def _on_networkmap(self, response: Any) -> None:
        if not isinstance(response, dict):
            return
        data = response.get("data") if isinstance(response.get("data"), dict) else {}
        if response.get("status") != "ok":
            if self._scan["status"] == "scanning":
                self._cancel_timeout()
                self._scan = {
                    **self._scan,
                    "status": "error",
                    "error": str(response.get("error") or "unknown"),
                }
                self._notify()
            return
        if data.get("type") != "raw":
            return
        self._cancel_timeout()
        self._links = normalize_networkmap(data.get("value"), set(self._devices))
        now = dt_util.utcnow().isoformat()
        self._scan = {"status": "idle", "last_scan": now, "error": None}
        self._hass.async_create_task(
            self._cache.async_save({"links": self._links, "last_scan": now}),
            eager_start=True,
        )
        self._notify()
