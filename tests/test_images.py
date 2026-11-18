"""Background image upload/serve tests."""

from http import HTTPStatus

import aiohttp
import pytest

from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component

from custom_components.zigbee_floorplan import images
from custom_components.zigbee_floorplan.images import (
    async_delete_image,
    async_register_image_views,
    sniff_image,
)

PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 64
JPEG = b"\xff\xd8\xff\xe0" + b"\x00" * 64
WEBP = b"RIFF\x00\x00\x00\x00WEBPVP8 " + b"\x00" * 64
SVG = b'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'


@pytest.mark.parametrize(
    ("data", "kind"),
    [(PNG, "png"), (JPEG, "jpeg"), (WEBP, "webp"), (SVG, None), (b"GIF89a", None), (b"", None)],
)
def test_sniff(data: bytes, kind: str | None) -> None:
    assert sniff_image(data) == kind


@pytest.fixture
async def http(hass: HomeAssistant):
    assert await async_setup_component(hass, "http", {})
    async_register_image_views(hass)


def form(data: bytes, name: str = "plan.png") -> aiohttp.FormData:
    fd = aiohttp.FormData()
    fd.add_field("file", data, filename=name, content_type="image/png")
    return fd


async def test_upload_and_get(hass: HomeAssistant, http, hass_client) -> None:
    client = await hass_client()
    resp = await client.post("/api/zigbee_floorplan/images", data=form(PNG))
    assert resp.status == HTTPStatus.OK
    image_id = (await resp.json())["id"]
    assert len(image_id) == 32

    resp = await client.get(f"/api/zigbee_floorplan/images/{image_id}")
    assert resp.status == HTTPStatus.OK
    assert resp.headers["Content-Type"] == "image/png"
    assert await resp.read() == PNG

    assert await async_delete_image(hass, image_id) is True
    resp = await client.get(f"/api/zigbee_floorplan/images/{image_id}")
    assert resp.status == HTTPStatus.NOT_FOUND
    assert await async_delete_image(hass, image_id) is False


async def test_upload_requires_admin(
    hass: HomeAssistant, http, hass_client, hass_read_only_access_token
) -> None:
    client = await hass_client(hass_read_only_access_token)
    resp = await client.post("/api/zigbee_floorplan/images", data=form(PNG))
    assert resp.status == HTTPStatus.UNAUTHORIZED


async def test_get_requires_auth(hass: HomeAssistant, http, hass_client_no_auth) -> None:
    client = await hass_client_no_auth()
    resp = await client.get(f"/api/zigbee_floorplan/images/{'a' * 32}")
    assert resp.status == HTTPStatus.UNAUTHORIZED


async def test_rejects_svg(hass: HomeAssistant, http, hass_client) -> None:
    client = await hass_client()
    resp = await client.post("/api/zigbee_floorplan/images", data=form(SVG, "x.svg"))
    assert resp.status == HTTPStatus.BAD_REQUEST


async def test_rejects_missing_file(hass: HomeAssistant, http, hass_client) -> None:
    client = await hass_client()
    fd = aiohttp.FormData()
    fd.add_field("other", "x")
    resp = await client.post("/api/zigbee_floorplan/images", data=fd)
    assert resp.status == HTTPStatus.BAD_REQUEST


async def test_rejects_too_large(hass: HomeAssistant, http, hass_client, monkeypatch) -> None:
    monkeypatch.setattr(images, "MAX_IMAGE_BYTES", 100)
    client = await hass_client()
    resp = await client.post("/api/zigbee_floorplan/images", data=form(PNG + b"\x00" * 200))
    assert resp.status == HTTPStatus.REQUEST_ENTITY_TOO_LARGE


@pytest.mark.parametrize("bad", ["../../secrets", "ABCDEF" * 6, "a" * 31, "zz" * 16])
async def test_get_rejects_bad_ids(hass: HomeAssistant, http, hass_client, bad: str) -> None:
    client = await hass_client()
    resp = await client.get(f"/api/zigbee_floorplan/images/{bad}")
    assert resp.status == HTTPStatus.NOT_FOUND
    assert await async_delete_image(hass, bad) is False
