# Troubleshooting

## The panel shows "No Zigbee2MQTT data on topic …"

The integration has not received `bridge/devices` from Zigbee2MQTT.

- Check the **base topic** in the integration options matches `base_topic` in Zigbee2MQTT.
- Check the **MQTT** integration is connected and Zigbee2MQTT is running.
- In **Settings → Devices & services → MQTT → Configure**, listen to `<base_topic>/bridge/devices`; it is a retained message and should appear immediately.

## Some devices have no links, or a banner says "devices have no link data"

Links come from the network map of the last scan.

- Press **Scan network** (administrators). A scan can take up to a minute on large networks.
- Devices added after the last scan are not in it, and sleeping battery devices may not be listed until they talk to their router. Scan again later.
- In **Routes** mode only each device's route to the coordinator is drawn. Switch the **Layers** menu to **All neighbors** to see every link.

## The scan finishes with an error

- `timeout`: Zigbee2MQTT did not answer within 3 minutes. Check the bridge is online and try again.
- `scan_in_progress`: a scan is already running.
- Make sure Zigbee2MQTT is not restarting and that the `bridge/response/networkmap` topic is not blocked by an MQTT ACL.

## I cannot drag or draw anything

Editing needs an **administrator** and the **Edit** switch (top right). In View mode, dragging shows a hint. Non‑administrators always get the read‑only view.

## The panel is cut short or shows the wrong version after an update

Reload the page (Ctrl/Cmd + Shift + R). The panel prompts for it when it detects a newer version is installed. Browsers and the Home Assistant app can cache the previous script; restarting Home Assistant and reloading the page clears it.

## The card does not appear in the card picker

Reload the browser tab after installing. The integration registers the card script automatically; there is nothing to add under Lovelace resources. If you use YAML dashboards, `type: custom:zigbee-floorplan-card` works as well.

## Coverage looks wrong

- Place the coordinator and routers, and draw rooms: coverage is only computed inside rooms (or inside the walls' bounding box when there are none).
- Check the wall materials and the scale of the plan; a floor drawn at the wrong scale changes distances.
- Open **Coverage** and check the calibration. With fewer than 3 real measurements the default model is used; a large fit error suggests walls or distances are off.
- Remember the map is an estimate. See the [coverage model](coverage-model.md).

## Uploading an image fails

Only PNG, JPEG and WebP up to 15 MB are accepted. SVG is rejected on purpose.

## Saving fails with "Project is too large"

The plan is limited to 3 MB of JSON. Background images are stored separately and do not count; very detailed plans with tens of thousands of walls might.

## Reporting a problem

Open an issue with your Home Assistant version, the integration version, what you did and any message from **Settings → System → Logs** filtered by `zigbee_floorplan`.
