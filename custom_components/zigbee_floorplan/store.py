"""Persistence for the floor plan project and the cached network map."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

import voluptuous as vol

from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.json import json_bytes
from homeassistant.helpers.storage import Store

from .const import DOMAIN, MAX_PROJECT_BYTES

STORAGE_VERSION = 1

_NUM = vol.Any(int, float)
_PT = vol.Schema({vol.Required("x"): _NUM, vol.Required("y"): _NUM}, extra=vol.ALLOW_EXTRA)

_WALL = vol.Schema(
    {vol.Required("id"): str, vol.Required("a"): _PT, vol.Required("b"): _PT},
    extra=vol.ALLOW_EXTRA,
)
_ROOM = vol.Schema(
    {vol.Required("id"): str, vol.Required("points"): [_PT]}, extra=vol.ALLOW_EXTRA
)
_BUILDING = vol.Schema(
    {
        vol.Required("id"): str,
        vol.Required("name"): str,
        vol.Optional("x"): _NUM,
        vol.Optional("y"): _NUM,
        vol.Optional("visible"): bool,
    },
    extra=vol.ALLOW_EXTRA,
)
_FLOOR = vol.Schema(
    {
        vol.Required("id"): str,
        vol.Optional("buildingId"): str,
        vol.Required("name"): str,
        vol.Required("level"): _NUM,
        vol.Optional("walls", default=list): [_WALL],
        vol.Optional("rooms", default=list): [_ROOM],
    },
    extra=vol.ALLOW_EXTRA,
)
_PLACEMENT = vol.Schema(
    {vol.Required("floorId"): str, vol.Required("x"): _NUM, vol.Required("y"): _NUM},
    extra=vol.ALLOW_EXTRA,
)

PROJECT_SCHEMA = vol.Schema(
    {
        vol.Required("version"): int,
        vol.Optional("buildings", default=list): [_BUILDING],
        vol.Required("floors"): [_FLOOR],
        vol.Optional("placements", default=dict): {str: _PLACEMENT},
        vol.Optional("settings", default=dict): dict,
    },
    extra=vol.ALLOW_EXTRA,
)


def empty_project() -> dict[str, Any]:
    return {"version": 1, "buildings": [], "floors": [], "placements": {}, "settings": {}}


class RevisionConflict(Exception):
    """Client saved against a stale revision."""

    def __init__(self, current: int) -> None:
        super().__init__(f"Project changed (current revision {current})")
        self.current = current


class ProjectTooLarge(Exception):
    """Serialized project exceeds the size limit."""


class ProjectStore:
    """Versioned project document with optimistic concurrency."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(
            hass, STORAGE_VERSION, f"{DOMAIN}.project"
        )
        self._data: dict[str, Any] = {"revision": 0, "project": empty_project()}
        self._listeners: list[Callable[[dict[str, Any]], None]] = []

    @property
    def data(self) -> dict[str, Any]:
        return self._data

    async def async_load(self) -> None:
        stored = await self._store.async_load()
        if stored and isinstance(stored.get("project"), dict):
            self._data = {
                "revision": int(stored.get("revision", 0)),
                "project": stored["project"],
            }

    async def async_save(self, project: dict[str, Any], base_revision: int) -> int:
        if base_revision != self._data["revision"]:
            raise RevisionConflict(self._data["revision"])
        validated = PROJECT_SCHEMA(project)
        if len(json_bytes(validated)) > MAX_PROJECT_BYTES:
            raise ProjectTooLarge
        self._data = {"revision": self._data["revision"] + 1, "project": validated}
        await self._store.async_save(self._data)
        for listener in list(self._listeners):
            listener(self._data)
        return self._data["revision"]

    @callback
    def add_listener(
        self, listener: Callable[[dict[str, Any]], None]
    ) -> Callable[[], None]:
        self._listeners.append(listener)

        @callback
        def remove() -> None:
            if listener in self._listeners:
                self._listeners.remove(listener)

        return remove


class NetworkCache:
    """Last network map scan, so links survive restarts."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store[dict[str, Any]] = Store(
            hass, STORAGE_VERSION, f"{DOMAIN}.network"
        )

    async def async_load(self) -> dict[str, Any] | None:
        return await self._store.async_load()

    async def async_save(self, data: dict[str, Any]) -> None:
        await self._store.async_save(data)
