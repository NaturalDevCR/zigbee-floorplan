"""Config flow for Zigbee Floorplan."""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant.config_entries import (
    ConfigFlow,
    ConfigFlowResult,
    OptionsFlowWithReload,
)
from homeassistant.core import callback
from homeassistant.helpers.selector import (
    SelectSelector,
    SelectSelectorConfig,
    SelectSelectorMode,
    TextSelector,
)

from .const import (
    CONF_BASE_TOPIC,
    CONF_SCAN_INTERVAL,
    DEFAULT_BASE_TOPIC,
    DEFAULT_SCAN_INTERVAL,
    DOMAIN,
    SCAN_INTERVAL_CHOICES,
    TITLE,
)


def valid_base_topic(topic: str) -> bool:
    """Return True for a concrete MQTT topic usable as Zigbee2MQTT base."""
    return (
        bool(topic)
        and not topic.startswith("/")
        and not topic.endswith("/")
        and "#" not in topic
        and "+" not in topic
        and "//" not in topic
    )


class ZigbeeFloorplanConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle the initial setup."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        if user_input is not None:
            topic = user_input[CONF_BASE_TOPIC].strip()
            if valid_base_topic(topic):
                return self.async_create_entry(
                    title=TITLE, data={CONF_BASE_TOPIC: topic}
                )
            errors[CONF_BASE_TOPIC] = "invalid_topic"

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_BASE_TOPIC, default=DEFAULT_BASE_TOPIC
                    ): TextSelector()
                }
            ),
            errors=errors,
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry) -> ZigbeeFloorplanOptionsFlow:
        return ZigbeeFloorplanOptionsFlow()


class ZigbeeFloorplanOptionsFlow(OptionsFlowWithReload):
    """Options: base topic and automatic network scan interval."""

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        errors: dict[str, str] = {}
        current_topic = self.config_entry.options.get(
            CONF_BASE_TOPIC, self.config_entry.data[CONF_BASE_TOPIC]
        )
        current_interval = self.config_entry.options.get(
            CONF_SCAN_INTERVAL, DEFAULT_SCAN_INTERVAL
        )
        if user_input is not None:
            topic = user_input[CONF_BASE_TOPIC].strip()
            if valid_base_topic(topic):
                return self.async_create_entry(
                    data={
                        CONF_BASE_TOPIC: topic,
                        CONF_SCAN_INTERVAL: int(user_input[CONF_SCAN_INTERVAL]),
                    }
                )
            errors[CONF_BASE_TOPIC] = "invalid_topic"

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Required(CONF_BASE_TOPIC, default=current_topic): TextSelector(),
                    vol.Required(
                        CONF_SCAN_INTERVAL, default=str(current_interval)
                    ): SelectSelector(
                        SelectSelectorConfig(
                            options=[str(v) for v in SCAN_INTERVAL_CHOICES],
                            mode=SelectSelectorMode.DROPDOWN,
                            translation_key="scan_interval",
                        )
                    ),
                }
            ),
            errors=errors,
        )
