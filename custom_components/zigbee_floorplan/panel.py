"""Serve the frontend bundle, register the sidebar panel and the card."""

from __future__ import annotations

import hashlib
from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant, callback

from .const import (
    DOMAIN,
    FRONTEND_FILE,
    PANEL_COMPONENT,
    PANEL_URL,
    STATIC_URL,
    TITLE,
)

_FRONTEND_DIR = Path(__file__).parent / "frontend"
_STATIC_REGISTERED = f"{DOMAIN}_static_registered"
_JS_URL = f"{DOMAIN}_js_url"
_JS_HASH = f"{DOMAIN}_js_hash"


def _bundle_hash() -> str:
    try:
        return hashlib.sha256((_FRONTEND_DIR / FRONTEND_FILE).read_bytes()).hexdigest()[:12]
    except FileNotFoundError:
        return "missing"


async def async_register_frontend(hass: HomeAssistant) -> None:
    if not hass.data.get(_STATIC_REGISTERED):
        # aiohttp routes cannot be removed, so the static path lives for the HA run.
        await hass.http.async_register_static_paths(
            [StaticPathConfig(STATIC_URL, str(_FRONTEND_DIR), cache_headers=True)]
        )
        hass.data[_STATIC_REGISTERED] = True

    bundle_hash = await hass.async_add_executor_job(_bundle_hash)
    url = f"{STATIC_URL}/{FRONTEND_FILE}?v={bundle_hash}"
    hass.data[_JS_URL] = url
    hass.data[_JS_HASH] = bundle_hash
    frontend.add_extra_js_url(hass, url)
    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_URL,
        webcomponent_name=PANEL_COMPONENT,
        sidebar_title=TITLE,
        sidebar_icon="mdi:floor-plan",
        module_url=url,
        require_admin=False,
        config={},
    )


@callback
def frontend_hash(hass: HomeAssistant) -> str | None:
    """Hash of the bundle currently served (the `v` query of its URL)."""
    return hass.data.get(_JS_HASH)


@callback
def async_unregister_frontend(hass: HomeAssistant) -> None:
    if url := hass.data.pop(_JS_URL, None):
        frontend.remove_extra_js_url(hass, url)
    frontend.async_remove_panel(hass, PANEL_URL, warn_if_unknown=False)
