"""Constants for Zigbee Floorplan."""

from typing import Final

DOMAIN: Final = "zigbee_floorplan"
TITLE: Final = "Zigbee Floorplan"

CONF_BASE_TOPIC: Final = "base_topic"
CONF_SCAN_INTERVAL: Final = "scan_interval_hours"

DEFAULT_BASE_TOPIC: Final = "zigbee2mqtt"
DEFAULT_SCAN_INTERVAL: Final = 0
SCAN_INTERVAL_CHOICES: Final = (0, 6, 12, 24)

SCAN_TIMEOUT: Final = 180
STATE_PUSH_INTERVAL: Final = 0.5

# HA's websocket accepts at most 4 MB per message (aiohttp default).
MAX_PROJECT_BYTES: Final = 3 * 1024 * 1024
MAX_IMAGE_BYTES: Final = 15 * 1024 * 1024

PANEL_URL: Final = "zigbee-floorplan"
PANEL_COMPONENT: Final = "zigbee-floorplan-panel"
STATIC_URL: Final = "/zigbee_floorplan_static"
FRONTEND_FILE: Final = "zigbee-floorplan.js"
IMAGES_DIR: Final = "zigbee_floorplan/images"

SIGNAL_NETWORK: Final = f"{DOMAIN}_network_updated"
SIGNAL_PROJECT: Final = f"{DOMAIN}_project_updated"
