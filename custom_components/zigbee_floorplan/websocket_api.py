"""Websocket commands for the Zigbee Floorplan frontend."""

from __future__ import annotations

from typing import TYPE_CHECKING, Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import CALLBACK_TYPE, HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect
from homeassistant.helpers.event import async_call_later
from homeassistant.loader import async_get_integration

from .const import DOMAIN, SIGNAL_NETWORK, SIGNAL_PROJECT, STATE_PUSH_INTERVAL
from .images import async_delete_image
from .panel import frontend_hash
from .store import ProjectTooLarge, RevisionConflict
from .z2m import ScanInProgress

if TYPE_CHECKING:
    from . import FloorplanData


def _data(hass: HomeAssistant) -> FloorplanData | None:
    entries = hass.config_entries.async_loaded_entries(DOMAIN)
    return entries[0].runtime_data if entries else None


def _not_loaded(connection: websocket_api.ActiveConnection, msg_id: int) -> None:
    connection.send_error(msg_id, "not_loaded", "Zigbee Floorplan is not loaded")


@callback
def async_register_websocket_commands(hass: HomeAssistant) -> None:
    for handler in (
        ws_info,
        ws_project_get,
        ws_project_save,
        ws_project_subscribe,
        ws_network_subscribe,
        ws_network_scan,
        ws_image_delete,
    ):
        websocket_api.async_register_command(hass, handler)


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/info"})
@websocket_api.async_response
async def ws_info(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    data = _data(hass)
    integration = await async_get_integration(hass, DOMAIN)
    connection.send_result(
        msg["id"],
        {
            "version": str(integration.version),
            "is_admin": connection.user.is_admin,
            "base_topic": data.adapter.base_topic if data else None,
            "loaded": data is not None,
            "frontend_hash": frontend_hash(hass),
        },
    )


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/project/get"})
@callback
def ws_project_get(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    if (data := _data(hass)) is None:
        _not_loaded(connection, msg["id"])
        return
    connection.send_result(msg["id"], data.store.data)


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/project/save",
        vol.Required("project"): dict,
        vol.Required("base_revision"): int,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_project_save(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    if (data := _data(hass)) is None:
        _not_loaded(connection, msg["id"])
        return
    try:
        revision = await data.store.async_save(msg["project"], msg["base_revision"])
    except RevisionConflict as err:
        connection.send_error(msg["id"], "revision_conflict", str(err))
    except ProjectTooLarge:
        connection.send_error(msg["id"], "too_large", "Project is too large")
    except vol.Invalid as err:
        connection.send_error(msg["id"], "invalid_project", str(err))
    else:
        connection.send_result(msg["id"], {"revision": revision})


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/project/subscribe"})
@callback
def ws_project_subscribe(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    @callback
    def forward(payload: dict[str, Any]) -> None:
        connection.send_message(
            websocket_api.event_message(msg["id"], {"kind": "project", **payload})
        )

    connection.subscriptions[msg["id"]] = async_dispatcher_connect(
        hass, SIGNAL_PROJECT, forward
    )
    connection.send_result(msg["id"])


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/network/subscribe"})
@callback
def ws_network_subscribe(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    pending: CALLBACK_TYPE | None = None

    @callback
    def send(_now: Any = None) -> None:
        nonlocal pending
        pending = None
        data = _data(hass)
        state = data.adapter.state if data else None
        connection.send_message(
            websocket_api.event_message(msg["id"], {"kind": "network", "state": state})
        )

    @callback
    def schedule() -> None:
        nonlocal pending
        if pending is None:
            pending = async_call_later(hass, STATE_PUSH_INTERVAL, send)

    unsub_signal = async_dispatcher_connect(hass, SIGNAL_NETWORK, schedule)

    @callback
    def unsubscribe() -> None:
        unsub_signal()
        if pending:
            pending()

    connection.subscriptions[msg["id"]] = unsubscribe
    connection.send_result(msg["id"])
    send()


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/network/scan"})
@websocket_api.require_admin
@websocket_api.async_response
async def ws_network_scan(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    if (data := _data(hass)) is None:
        _not_loaded(connection, msg["id"])
        return
    try:
        await data.adapter.async_scan()
    except ScanInProgress:
        connection.send_error(msg["id"], "scan_in_progress", "A scan is already running")
        return
    connection.send_result(msg["id"])


@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/image/delete",
        vol.Required("image_id"): str,
    }
)
@websocket_api.require_admin
@websocket_api.async_response
async def ws_image_delete(hass: HomeAssistant, connection, msg: dict[str, Any]) -> None:
    connection.send_result(
        msg["id"], {"deleted": await async_delete_image(hass, msg["image_id"])}
    )
