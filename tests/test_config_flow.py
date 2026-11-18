"""Config flow tests."""

from unittest.mock import patch

import pytest

from homeassistant import config_entries
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.zigbee_floorplan.const import (
    CONF_BASE_TOPIC,
    CONF_SCAN_INTERVAL,
    DOMAIN,
)


@pytest.fixture(autouse=True)
def _no_setup():
    with patch(
        "custom_components.zigbee_floorplan.async_setup_entry", return_value=True
    ):
        yield


async def test_user_flow_creates_entry(hass: HomeAssistant) -> None:
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] is FlowResultType.FORM
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_BASE_TOPIC: "z2m"}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "Zigbee Floorplan"
    assert result["data"] == {CONF_BASE_TOPIC: "z2m"}


@pytest.mark.parametrize("topic", ["z2m/#", "z+m", "z2m/", "", "/z2m"])
async def test_user_flow_rejects_invalid_topic(hass: HomeAssistant, topic: str) -> None:
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {CONF_BASE_TOPIC: topic}
    )
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {CONF_BASE_TOPIC: "invalid_topic"}


async def test_single_instance(hass: HomeAssistant) -> None:
    MockConfigEntry(domain=DOMAIN, data={CONF_BASE_TOPIC: "zigbee2mqtt"}).add_to_hass(
        hass
    )
    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "single_instance_allowed"


async def test_options_flow(hass: HomeAssistant) -> None:
    entry = MockConfigEntry(domain=DOMAIN, data={CONF_BASE_TOPIC: "zigbee2mqtt"})
    entry.add_to_hass(hass)
    result = await hass.config_entries.options.async_init(entry.entry_id)
    assert result["type"] is FlowResultType.FORM
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {CONF_BASE_TOPIC: "zigbee", CONF_SCAN_INTERVAL: "12"}
    )
    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert entry.options == {CONF_BASE_TOPIC: "zigbee", CONF_SCAN_INTERVAL: 12}
