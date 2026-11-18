# Zigbee Floorplan for Home Assistant — Design

Date: 2026-11-18
Status: approved (decisions delegated to Claude by user)

## Goal

A Home Assistant add-on experience (HACS integration + frontend) that:

1. Reads the live Zigbee2MQTT network (devices, availability, link quality, mesh neighbor links).
2. Lets the user draw multi-floor floor plans over a grid, optionally tracing a calibrated background image.
3. Assigns RF materials to walls and floor slabs.
4. Places Zigbee devices on the plan and draws their real mesh connections.
5. Simulates 2.4 GHz coverage (multi-wall path-loss model) calibrated against real LQI, renders a heatmap, flags weak zones and suggests where to add routers.

Must feel fluid, polished and native to Home Assistant; must be trivial to use from HA.

Out of scope now: ZHA support (a separate version later — the data-source layer is isolated so it can be swapped), 3D rendering, doors/windows as special objects (a short wall segment with a door/glass material covers it), automatic floor plan recognition from images.

## Architecture

```
Zigbee2MQTT ──MQTT──► custom_components/zigbee_floorplan (Python)
                        ├─ z2m.py        Z2M MQTT adapter → NetworkState
                        ├─ store.py      project JSON + network cache (HA Store, .storage/)
                        ├─ images.py     background image upload/serve (auth HTTP views)
                        ├─ websocket_api.py  zigbee_floorplan/* commands + push subscription
                        └─ __init__.py   config entry, panel + card JS registration
                                │ websocket / authenticated HTTP
                                ▼
                     frontend bundle zigbee-floorplan.js (Lit + TypeScript)
                        ├─ <zigbee-floorplan-panel>  sidebar panel: full editor
                        ├─ <zigbee-floorplan-card>   Lovelace card: live view
                        └─ rf.worker (inlined)       heatmap + calibration + suggestions
```

Single integration installs everything: it registers the sidebar panel (`panel_custom`) and loads the card module globally (`frontend.add_extra_js_url`), so no manual Lovelace resource step is needed.

### Why the backend owns MQTT

- Non-admin users can view the card (`mqtt/subscribe` over the websocket is admin-only).
- A network-map scan is slow (30–120 s) and loads the mesh; the backend runs one scan and shares/caches the result for every client and across restarts.
- Swapping to ZHA later means a new adapter producing the same `NetworkState`, with no frontend change.

## Backend (Python, `custom_components/zigbee_floorplan`)

### Config entry

Config flow (single instance) with options:
- `base_topic` (default `zigbee2mqtt`)
- `scan_interval_hours` (0 = manual only; default 0; allowed 0/6/12/24)

Requires `mqtt` integration (`dependencies: ["mqtt", "http", "frontend", "panel_custom", "websocket_api"]`).

### Z2M adapter (`z2m.py`)

Subscribes:
- `{base}/bridge/devices` (retained) → device list: ieee, friendly_name, type (Coordinator/Router/EndDevice), model, vendor, description, power_source, network_address, interview_completed, supported, disabled.
- `{base}/bridge/state` → bridge online/offline.
- `{base}/+` → device state messages; extracts `linkquality`, `last_seen`, `battery`. Ignores `{base}/bridge`.
- `{base}/+/availability` → online/offline (JSON `{"state": ...}` or legacy plain string).
- `{base}/bridge/response/networkmap` → scan result.

Scan: publishes `{base}/bridge/request/networkmap` with `{"type": "raw", "routes": false}`; status `idle | scanning | error`; timeout 180 s; one scan at a time.

Network map normalization: raw links are neighbor-table entries (target = router whose table it is, source = neighbor, `lqi` as perceived by target, `relationship` 0 parent / 1 child / 2 sibling / 3 none / 4 previous child, `depth`). Normalized to undirected links keyed by sorted ieee pair (`a` < `b`), keeping `lqi_ab` (signal from a perceived by b), `lqi_ba`, `lqi` (max of known), `relationship` (`tree` when either side reports parent/child — wins over `sibling` — else `other`) and `parent` (ieee of the parent on tree links). Links to unknown nodes are dropped.

HA device mapping: device registry lookup by identifier `("mqtt", "zigbee2mqtt_<ieee>")` → `ha_device_id` included per device so the UI can deep-link to the HA device page.

State shape pushed to clients (`NetworkState`):
```json
{
  "bridge_online": true,
  "devices": [{"ieee": "0x…", "name": "…", "type": "Router", "model": "…", "vendor": "…",
               "description": "…", "power_source": "Mains (single phase)",
               "available": true, "lqi": 120, "last_seen": "ISO|null", "battery": 87,
               "ha_device_id": "…|null"}],
  "links": [{"a": "0x…", "b": "0x…", "lqi": 140, "lqi_ab": 140, "lqi_ba": 120,
             "relationship": "tree|sibling|other", "parent": "0x…|null", "depth": 1}],
  "scan": {"status": "idle", "last_scan": "ISO|null", "error": null}
}
```
Last network map is persisted (Store key `zigbee_floorplan.network`) so links survive restarts.

### Persistence (`store.py`)

HA `Store` (versioned JSON at `.storage/zigbee_floorplan.project`). Holds `{revision: int, project: {...}}`. Save uses optimistic concurrency: client sends `base_revision`; mismatch → error `revision_conflict` with current revision. Max serialized size 5 MB. Structural validation with voluptuous for top-level shape (floors list, ids, numbers); detailed geometry trusted as data (never executed or rendered as HTML).

### Images (`images.py`)

- `POST /api/zigbee_floorplan/images` (admin, multipart `file`) → `{id}`. Accepts PNG/JPEG/WebP only (sniffed by magic bytes, not just the header); max 15 MB. Stored at `<config>/zigbee_floorplan/images/<uuid>.<ext>`.
- `GET /api/zigbee_floorplan/images/{id}` (authenticated) → file. Id validated against `^[0-9a-f]{32}$`.
- `zigbee_floorplan/image/delete` websocket (admin).
SVG is rejected (script risk).

### Websocket commands

| command | auth | purpose |
|---|---|---|
| `zigbee_floorplan/project/get` | user | `{revision, project}` |
| `zigbee_floorplan/project/save` | admin | `{project, base_revision}` → `{revision}` |
| `zigbee_floorplan/network/subscribe` | user | sends snapshot, then pushes full `NetworkState` (throttled to ≤ 2/s) |
| `zigbee_floorplan/network/scan` | admin | start networkmap scan |
| `zigbee_floorplan/image/delete` | admin | delete image |
| `zigbee_floorplan/info` | user | `{version, is_admin, base_topic}` |

Project changes are also pushed to other subscribers (`zigbee_floorplan/project/subscribe`) so two open editors stay in sync.

## Data model (project)

Units: meters. Coordinates: plan space, x right, y down.

```ts
Project {
  version: 1
  floors: Floor[]                       // ordered by level
  placements: Record<ieee, Placement>
  settings: RfSettings
}
Floor {
  id, name, level: number,              // 0 ground, 1 first, -1 basement
  elevation: number, height: number,    // meters
  slab: MaterialId,                     // floor slab under this floor
  walls: Wall[], rooms: Room[],
  background?: { imageId, x, y, scale /* m per px */, rotation, opacity, visible }
}
Wall { id, a: Pt, b: Pt, thickness: number, material: MaterialId }
Room { id, name, points: Pt[] }         // polygon; defines indoor coverage area
Placement { floorId, x, y, height /*m above floor*/, txPower?: number /*dBm override*/ }
RfSettings { pathLossExponent, refLoss1m, rxSensitivity, defaultTx: {Coordinator, Router, EndDevice},
             calibration: { enabled, offsetDb, exponent, rmse, samples } }
```

Material presets (2.4 GHz, attenuation per crossing, typical values):

| id | name | dB |
|---|---|---|
| drywall | Drywall / plasterboard | 3 |
| wood | Wood / wooden door | 4 |
| glass | Glass | 3 |
| glass_lowe | Low-E / metallized glass | 15 |
| brick | Brick | 8 |
| block | Concrete block | 11 |
| concrete | Concrete | 15 |
| reinforced | Reinforced concrete | 22 |
| metal | Metal / appliance | 30 |
| slab_wood | Wood floor slab | 8 |
| slab_concrete | Concrete floor slab | 20 |

Users can override dB per material in settings (custom values stored in `settings.materials`).

## RF engine (frontend worker)

Multi-wall model (COST 231 MWM style):

```
PL(d) = PL0 + 10·n·log10(max(d, 0.5)) + Σ wall dB crossed + Σ slab dB crossed + offset
RSSI  = Tx − PL
```
Defaults: PL0 = 40 dB (2.4 GHz @1 m), n = 2.2, Tx coordinator/router 5 dBm, end device 3 dBm, sensitivity −100 dBm. Distance is 3D (floor elevation + placement height). Walls counted: those of the receiver's floor and, if different, those of the transmitter's floor, each intersected with the 2D projection of the path (walls on intermediate floors are ignored). Each floor boundary crossed adds the slab dB of the upper floor of that boundary.

Wall crossing uses segment intersection accelerated by a uniform spatial grid over walls.

**Calibration:** for each real link between two placed devices, estimate RSSI from LQI (`rssi ≈ −100 + lqi·60/255`, documented as an approximation; chip-specific) and compute residual against the model. Linear least squares on `y = Tx − rssi_est − walls − slabs` vs `x = 10·log10(d)` gives `PL0'` and `n`; `n` clamped to [1.6, 4.0], offset clamped to ±20 dB. Requires ≥ 3 links; reports RMSE and sample count; user can toggle calibration off.

**Heatmap:** per floor, cell size auto (target ≤ 60 000 cells, min 0.1 m). Each cell = best RSSI over all routers + coordinator (all floors). Coverage area = union of rooms, or wall bounding box + 1 m if no rooms. Rendered to an `ImageBitmap` (smooth colormap, alpha ramp) drawn on a canvas layer under walls. Bands: excellent ≥ −65, good ≥ −75, fair ≥ −85, weak ≥ −95, none < −95 dBm.

**Suggestions:** candidates on a ~1 m sub-grid inside the coverage area whose own best RSSI ≥ −80 dBm (new router can join reliably). Score = weak-cell area that rises above −85 dBm + 10× weak placed end devices fixed. Greedy, up to 3 suggestions, each re-evaluated after adding previous. Also lists real weak links (LQI < 60) and devices with estimated RSSI < −85.

Worker recomputes on debounced (200 ms) changes; results are cached per floor by a hash of inputs.

## Frontend UX

Stack: Lit 3 + TypeScript, Vite library build to a single ES module (worker inlined), `@mdi/js` icons, no dependency on HA-internal elements except `ha-form` in the card editor. Theme from HA CSS variables (light/dark automatic). i18n: English + Spanish from `hass.locale.language`.

### Panel (editor) layout

```
┌ Header: title · floor tabs [+] · mode (View/Edit) · save status · scan button · ⋮ (export/import) ┐
├ Left rail (Edit): tools — Select V, Wall W, Room R, Calibrate C, Pan H, Measure M ─────────────┤
│ Canvas (SVG world + canvas heatmap), zoom/pan, minimap-free, floating zoom controls,          │
│ layer toggles (Background, Heatmap, Links, Labels, Suggestions)                              │
├ Right drawer: Inspector (selection props) · Devices (search, unplaced → drag to place) ·      │
│ Coverage (calibration stats, weak devices, suggestions) · Floor settings                     │
└──────────────────────────────────────────────────────────────────────────────────────────────┘
```

Interaction details:
- Pointer events (mouse, pen, touch). Wheel/pinch zoom around cursor, space-drag / middle-drag / two-finger pan, `F` fit.
- Wall tool: click-click polyline, double-click/Enter/Esc to finish; snaps to grid (0.1/0.25/0.5/1 m), endpoints, wall bodies and 15° angles (Shift disables snap); live length label.
- Room tool: polygon click; closes on first point.
- Select: click/marquee, drag move (walls endpoints shared with connected walls move together), Delete, Ctrl+D duplicate, arrow nudge.
- Calibrate: draw a line over the background image, enter the real length → sets image scale.
- Undo/redo (Ctrl+Z / Ctrl+Shift+Z) via immutable snapshots (capped 200).
- Autosave debounced 800 ms; header shows Saved / Saving / Offline / Conflict (conflict → reload with notification).
- Devices: icon by type (coordinator / router / end device), status ring (green ok, amber weak LQI, red offline, grey unknown), battery badge; hover tooltip; click opens detail with neighbors and "Open in Home Assistant".
- Links: colored/thick by LQI, dashed for sibling/other neighbor links, solid for parent/child; filter "parent/child only" vs "all neighbors"; cross-floor links shown as a short stub with floor badge.
- Animations: 150–200 ms transitions on panels and hover, no jank (requestAnimationFrame-batched rendering, SVG transforms only for pan/zoom).
- Empty state: guided first run ("Create your first floor" → optional upload of image → draw walls).

### Card

`type: custom:zigbee-floorplan-card` — options: `floor` (id, optional), `height` (px, default 420), `layers` (subset of `heatmap, links, labels, background`), `show_floor_tabs` (default true), `links` (`parent` | `all`). View only, same renderer, clicking a device opens detail sheet. Visual editor via `ha-form`. `getStubConfig` returns sensible defaults.

## Error handling

- Z2M not reporting (`bridge/devices` never received): banner "No Zigbee2MQTT data on topic `<base>`" with link to options.
- Bridge offline: banner + all devices shown unknown.
- Scan timeout/error: toast + previous map kept.
- Save conflict: reload latest, notify; local undo stack cleared.
- Non-admin: editor read-only, scan disabled, tooltip explains.
- Placements for devices that no longer exist: shown in Devices drawer as "missing" with remove action.
- Image load failure: placeholder + re-upload action.

## Testing

- Backend: `pytest` + `pytest-homeassistant-custom-component` — config flow, Z2M parsing (devices, availability, state, networkmap normalization), scan lifecycle/timeout, store save/conflict/size limit, image upload validation (type sniffing, size, id), websocket permissions.
- Frontend: `vitest` — geometry (intersection, snapping, spatial grid), RF model (path loss, wall/slab counting, calibration regression, suggestions), network link normalization helpers, project ops + undo.
- Visual: Vite dev harness with a mock `hass` (realistic Z2M fixture, ~25 devices, 2 floors) verified in a browser: drawing, placing, heatmap, card rendering, dark/light, mobile width.

## Repository layout

```
custom_components/zigbee_floorplan/   integration (+ frontend/zigbee-floorplan.js built bundle, committed)
frontend/                             TypeScript source, Vite, vitest, dev harness
tests/                                pytest
hacs.json, README.md
```
