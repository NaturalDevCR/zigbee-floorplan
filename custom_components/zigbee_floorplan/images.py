"""Background images: authenticated upload and download."""

from __future__ import annotations

from http import HTTPStatus
from pathlib import Path
import re
import uuid

from aiohttp import web

from homeassistant.components.http import KEY_HASS, HomeAssistantView, require_admin
from homeassistant.core import HomeAssistant, callback

from .const import IMAGES_DIR, MAX_IMAGE_BYTES

_ID_RE = re.compile(r"^[0-9a-f]{32}$")
_CONTENT_TYPES = {"png": "image/png", "jpeg": "image/jpeg", "webp": "image/webp"}


def sniff_image(data: bytes) -> str | None:
    """Detect PNG/JPEG/WebP by magic bytes; everything else is rejected."""
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if data.startswith(b"\xff\xd8\xff"):
        return "jpeg"
    if len(data) >= 12 and data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "webp"
    return None


def images_dir(hass: HomeAssistant) -> Path:
    return Path(hass.config.path(IMAGES_DIR))


def _find(hass: HomeAssistant, image_id: str) -> Path | None:
    if not _ID_RE.match(image_id):
        return None
    for ext in _CONTENT_TYPES:
        path = images_dir(hass) / f"{image_id}.{ext}"
        if path.is_file():
            return path
    return None


def _write(path: Path, data: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


async def async_delete_image(hass: HomeAssistant, image_id: str) -> bool:
    def _delete() -> bool:
        path = _find(hass, image_id)
        if path is None:
            return False
        path.unlink()
        return True

    return await hass.async_add_executor_job(_delete)


class ImageUploadView(HomeAssistantView):
    url = "/api/zigbee_floorplan/images"
    name = "api:zigbee_floorplan:images"

    @require_admin
    async def post(self, request: web.Request) -> web.Response:
        hass = request.app[KEY_HASS]
        if not request.content_type.startswith("multipart/"):
            return self.json_message("Expected multipart upload", HTTPStatus.BAD_REQUEST)
        reader = await request.multipart()
        data: bytes | None = None
        while (part := await reader.next()) is not None:
            if getattr(part, "name", None) != "file":
                continue
            chunks = bytearray()
            while chunk := await part.read_chunk():
                chunks.extend(chunk)
                if len(chunks) > MAX_IMAGE_BYTES:
                    return self.json_message(
                        "Image too large", HTTPStatus.REQUEST_ENTITY_TOO_LARGE
                    )
            data = bytes(chunks)
            break
        if data is None:
            return self.json_message("Missing file", HTTPStatus.BAD_REQUEST)
        kind = sniff_image(data)
        if kind is None:
            return self.json_message(
                "Only PNG, JPEG and WebP images are supported", HTTPStatus.BAD_REQUEST
            )
        image_id = uuid.uuid4().hex
        await hass.async_add_executor_job(
            _write, images_dir(hass) / f"{image_id}.{kind}", data
        )
        return self.json({"id": image_id})


class ImageView(HomeAssistantView):
    url = "/api/zigbee_floorplan/images/{image_id}"
    name = "api:zigbee_floorplan:image"

    async def get(self, request: web.Request, image_id: str) -> web.StreamResponse:
        hass = request.app[KEY_HASS]
        path = await hass.async_add_executor_job(_find, hass, image_id)
        if path is None:
            return self.json_message("Not found", HTTPStatus.NOT_FOUND)
        return web.FileResponse(
            path,
            headers={
                "Content-Type": _CONTENT_TYPES[path.suffix[1:]],
                "Cache-Control": "private, max-age=31536000, immutable",
            },
        )


@callback
def async_register_image_views(hass: HomeAssistant) -> None:
    hass.http.register_view(ImageUploadView())
    hass.http.register_view(ImageView())
