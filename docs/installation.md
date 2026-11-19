# Installation

## Requirements

- Home Assistant **2026.10** or newer (developed and tested on 2026.10 and 2026.11).
- The **MQTT** integration configured and connected to a broker.
- **Zigbee2MQTT** publishing to that broker. The integration only reads what Zigbee2MQTT already publishes; it never changes your Zigbee network, except for requesting a network map when you press **Scan network**.

## Install with HACS

1. Open HACS → ⋮ (top right) → **Custom repositories**.
2. Add `https://github.com/NaturalDevCR/zigbee-floorplan` with type **Integration**.
3. Search for **Zigbee Floorplan**, **Download**, and restart Home Assistant.

## Install manually

1. Download the latest release (or clone this repository).
2. Copy the folder `custom_components/zigbee_floorplan` to `<config>/custom_components/zigbee_floorplan`.
3. Restart Home Assistant.

## Add the integration

**Settings → Devices & services → Add integration → Zigbee Floorplan**

| Field | Meaning |
|---|---|
| Zigbee2MQTT base topic | The `base_topic` of your Zigbee2MQTT configuration (default `zigbee2mqtt`). It must be a plain topic: no `#` or `+`, no leading or trailing `/`. |

Only one entry can exist. Afterwards the **Zigbee Floorplan** panel appears in the sidebar, and the card `custom:zigbee-floorplan-card` is available in dashboards. No Lovelace resource needs to be added.

### Options

Open the integration and press **Configure**:

| Option | Meaning |
|---|---|
| Base topic | Change the Zigbee2MQTT topic. The integration reloads. |
| Automatic network map scan | Manual only (default), or every 6, 12 or 24 hours. A scan briefly loads the mesh, so leave it on manual unless you want links to stay fresh. You can always scan from the panel. |

## Permissions

- Every signed‑in user can open the panel and the card (read only).
- Administrators can edit the plan, upload images and scan the network.

## Upgrading

- **HACS:** update from HACS and restart Home Assistant.
- **Manual:** replace the `zigbee_floorplan` folder and restart.

If a browser tab was open during the upgrade, the panel shows a **Reload** prompt when it detects it is running an older version. Your plan is kept: it lives in `.storage`, not in the integration folder.

## Uninstalling

Remove the integration from **Settings → Devices & services**, then remove it from HACS or delete the folder. To also delete your data, remove `.storage/zigbee_floorplan.project`, `.storage/zigbee_floorplan.network` and the folder `zigbee_floorplan/images/` in your config directory.
