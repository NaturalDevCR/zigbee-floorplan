# Architecture

```
Zigbee2MQTT ──MQTT──► custom_components/zigbee_floorplan (Python)
                        ├─ z2m.py            Z2MAdapter: subscriptions, state, scan lifecycle
                        ├─ network.py        pure parsing of devices and network map links
                        ├─ store.py          project storage (revision + validation), scan cache
                        ├─ images.py         authenticated image upload and download
                        ├─ websocket_api.py  zigbee_floorplan/* commands and subscriptions
                        ├─ panel.py          static files, sidebar panel, card script
                        └─ __init__.py       config entry wiring
                                 │ websocket + authenticated HTTP
                                 ▼
                      frontend/zigbee-floorplan.js  (Lit + TypeScript)
                        ├─ <zigbee-floorplan-panel>  full editor
                        ├─ <zigbee-floorplan-card>   Lovelace card
                        └─ RF worker (inlined)       coverage, calibration, suggestions
```

## Why the backend owns MQTT

- Non‑admin users can use the panel and card; subscribing to MQTT from the browser is admin only.
- A network scan is slow and loads the mesh, so one scan is shared by every client and cached across restarts.
- A different source (for example ZHA) only needs another adapter that produces the same `NetworkState`; the frontend does not change.

## Data flow

1. `Z2MAdapter` subscribes to `<base>/#` and keeps devices, availability, link quality, battery and the last normalized network map.
2. Clients call `zigbee_floorplan/network/subscribe` and receive a full `NetworkState` (throttled to two per second), including the home‑assistant device id of each device for deep links.
3. The project (buildings, floors, walls, rooms, placements, settings) is a JSON document stored through Home Assistant's `Store`. Saves use optimistic concurrency: a client saves against the revision it loaded, and a stale save is rejected so the client reloads. Other open clients receive the new revision through `zigbee_floorplan/project/subscribe`.
4. Background images are saved under `<config>/zigbee_floorplan/images/` and served by an authenticated view.

## Websocket commands

| Command | Auth | Purpose |
|---|---|---|
| `zigbee_floorplan/info` | user | Version, admin flag, base topic, served bundle hash |
| `zigbee_floorplan/project/get` | user | `{revision, project}` |
| `zigbee_floorplan/project/save` | admin | Save with `base_revision`; errors `revision_conflict`, `too_large`, `invalid_project` |
| `zigbee_floorplan/project/subscribe` | user | Pushes project changes |
| `zigbee_floorplan/network/subscribe` | user | Snapshot then updates |
| `zigbee_floorplan/network/scan` | admin | Requests a network map |
| `zigbee_floorplan/image/delete` | admin | Deletes an uploaded image |

HTTP: `POST /api/zigbee_floorplan/images` (admin, multipart) and `GET /api/zigbee_floorplan/images/{id}` (authenticated). Uploads are sniffed by magic bytes and limited to PNG, JPEG and WebP.

## Network map normalization

Zigbee2MQTT returns neighbour‑table entries per router. They are merged into undirected links with the LQI observed in each direction. The frontend then infers each device's route to the coordinator (`topology.ts`): a Dijkstra search over the coordinator and routers with a cost that rewards strong links, plus the reported parent for end devices.

## Frontend

- `types.ts`, `project/ops.ts` — immutable data model and operations; `normalizeProject` migrates and sanitizes saved data.
- `data/controller.ts` — shared controller: undo history, debounced autosave, conflict handling.
- `canvas/` — the plan view: SVG for geometry and devices, canvas for grid and heatmap, tools for drawing.
- `rf/` — the coverage engine; runs in a Web Worker so the UI stays fluid.
- `panel/`, `card/`, `ui/` — the components.

The built bundle is committed at `custom_components/zigbee_floorplan/frontend/zigbee-floorplan.js` so HACS and manual installs need no build step. CI fails if it is out of date.
