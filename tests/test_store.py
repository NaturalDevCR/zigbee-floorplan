"""Project store tests."""

from typing import Any

import pytest
import voluptuous as vol

from homeassistant.core import HomeAssistant

from custom_components.zigbee_floorplan import store as store_mod
from custom_components.zigbee_floorplan.store import (
    NetworkCache,
    ProjectStore,
    ProjectTooLarge,
    RevisionConflict,
)


def project(**extra: Any) -> dict[str, Any]:
    return {
        "version": 1,
        "floors": [
            {
                "id": "f1",
                "name": "Ground",
                "level": 0,
                "elevation": 0,
                "height": 2.7,
                "slab": "slab_concrete",
                "walls": [
                    {"id": "w1", "a": {"x": 0, "y": 0}, "b": {"x": 4, "y": 0},
                     "thickness": 0.15, "material": "brick"}
                ],
                "rooms": [],
            }
        ],
        "placements": {"0x01": {"floorId": "f1", "x": 1, "y": 2, "height": 1}},
        "settings": {},
        **extra,
    }


async def test_default_project(hass: HomeAssistant) -> None:
    st = ProjectStore(hass)
    await st.async_load()
    assert st.data["revision"] == 0
    assert st.data["project"]["floors"] == []


async def test_save_and_reload(hass: HomeAssistant, hass_storage) -> None:
    st = ProjectStore(hass)
    await st.async_load()
    rev = await st.async_save(project(), base_revision=0)
    assert rev == 1
    st2 = ProjectStore(hass)
    await st2.async_load()
    assert st2.data["revision"] == 1
    assert st2.data["project"]["floors"][0]["walls"][0]["material"] == "brick"


async def test_conflict(hass: HomeAssistant) -> None:
    st = ProjectStore(hass)
    await st.async_load()
    await st.async_save(project(), base_revision=0)
    with pytest.raises(RevisionConflict) as err:
        await st.async_save(project(), base_revision=0)
    assert err.value.current == 1


async def test_too_large(hass: HomeAssistant, monkeypatch) -> None:
    monkeypatch.setattr(store_mod, "MAX_PROJECT_BYTES", 200)
    st = ProjectStore(hass)
    await st.async_load()
    with pytest.raises(ProjectTooLarge):
        await st.async_save(project(), base_revision=0)


@pytest.mark.parametrize(
    "bad",
    [
        {"version": 1, "floors": [{"name": "x", "level": 0}]},
        {"version": 1, "floors": "nope"},
        {"version": 1, "floors": [], "placements": {"0x1": {"floorId": "f", "x": "a", "y": 1}}},
        {"version": 1, "floors": [{"id": "f", "name": "x", "level": 0,
                                   "walls": [{"id": "w", "a": {"x": 0}, "b": {"x": 1, "y": 1}}]}]},
    ],
)
async def test_invalid(hass: HomeAssistant, bad: dict) -> None:
    st = ProjectStore(hass)
    await st.async_load()
    with pytest.raises(vol.Invalid):
        await st.async_save(bad, base_revision=0)


async def test_listeners(hass: HomeAssistant) -> None:
    st = ProjectStore(hass)
    await st.async_load()
    seen: list[dict] = []
    unsub = st.add_listener(seen.append)
    await st.async_save(project(), base_revision=0)
    unsub()
    await st.async_save(project(), base_revision=1)
    assert len(seen) == 1
    assert seen[0]["revision"] == 1


async def test_network_cache(hass: HomeAssistant) -> None:
    cache = NetworkCache(hass)
    assert await cache.async_load() is None
    await cache.async_save({"links": [], "last_scan": "2026-11-18T00:00:00+00:00"})
    assert (await NetworkCache(hass).async_load())["last_scan"].startswith("2026")
