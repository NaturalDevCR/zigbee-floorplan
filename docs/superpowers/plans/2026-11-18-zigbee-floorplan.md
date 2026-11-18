# Zigbee Floorplan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** HACS integration + Lit panel/card that maps a Zigbee2MQTT mesh onto multi-floor plans with wall materials, simulated RF coverage and router suggestions.

**Architecture:** Python integration owns MQTT (Z2M adapter → `NetworkState`), persistence (HA `Store`) and image storage, exposed via `zigbee_floorplan/*` websocket commands. A single Vite-built Lit bundle registers `<zigbee-floorplan-panel>` (editor) and `<zigbee-floorplan-card>` (view); RF heatmap/calibration/suggestions run in an inlined Web Worker.

**Tech Stack:** Python 3.13, Home Assistant ≥ 2025.1, pytest-homeassistant-custom-component; TypeScript 5, Lit 3, Vite 6, vitest, @mdi/js.

Execution note: user delegated decisions and asked to proceed; tasks specify files, interfaces and concrete test cases, and code is written TDD-style during execution (inline, this session).

## Global Constraints

- Domain `zigbee_floorplan`; websocket prefix `zigbee_floorplan/`; panel URL `/zigbee-floorplan`; static URL `/zigbee_floorplan_static`.
- Units meters; plan coordinates x right, y down.
- Images: PNG/JPEG/WebP only, sniffed by magic bytes, max 15 MB, id `^[0-9a-f]{32}$`.
- Project JSON max 5 MB; save requires admin and `base_revision`.
- RF defaults: PL0 40 dB, n 2.2, Tx 5 dBm (coordinator/router), 3 dBm (end device), sensitivity −100 dBm; bands ≥−65 / ≥−75 / ≥−85 / ≥−95 / below.
- LQI→RSSI: `−100 + lqi·60/255`.
- No dependency on HA-internal web components except `ha-form` in card editor.
- UI strings in English + Spanish.

---

## File Structure

```
custom_components/zigbee_floorplan/
  __init__.py          setup/unload entry, wires adapter, store, ws, http, frontend
  manifest.json, hacs.json(root), strings.json, translations/{en,es}.json
  const.py             DOMAIN, defaults, limits
  config_flow.py       single-instance flow + options (base_topic, scan_interval_hours)
  network.py           pure: parse devices, normalize networkmap, build NetworkState
  z2m.py               Z2MAdapter: MQTT subs, state, scan lifecycle, listeners
  store.py             ProjectStore (revision, conflict, size), NetworkCache
  images.py            ImageUploadView, ImageView, sniff/validate helpers
  websocket_api.py     command handlers
  frontend.py          static path, panel, extra js url
  frontend/zigbee-floorplan.js   built bundle (committed)
tests/  conftest.py test_network.py test_z2m.py test_store.py test_images.py test_websocket.py test_config_flow.py
frontend/
  package.json tsconfig.json vite.config.ts index.html(dev)
  src/index.ts types.ts materials.ts geometry.ts spatial-grid.ts i18n.ts
  src/rf/{model,calibrate,heatmap,suggest,colormap,worker,client}.ts
  src/project/{ops,history}.ts
  src/data/{api,controller}.ts
  src/ui/{styles,icons,dialogs,toast}.ts
  src/canvas/{viewport,snapping,layers,zfp-canvas}.ts  src/canvas/tools/{tool,select,wall,room,calibrate,measure}.ts
  src/panel/{zfp-panel,floor-tabs,toolbar,inspector,devices-pane,coverage-pane,device-detail,empty-state}.ts
  src/card/{zfp-card,card-editor}.ts
  dev/{mock-hass,fixture}.ts
  test/*.test.ts
```

## Task 1: Backend scaffold, config flow, test environment

**Files:** Create `custom_components/zigbee_floorplan/{__init__,const,config_flow}.py`, `manifest.json`, `strings.json`, `translations/en.json`, `translations/es.json`, `hacs.json`, `pyproject.toml` (pytest config), `requirements_test.txt`, `tests/conftest.py`, `tests/test_config_flow.py`.

**Interfaces:** Produces `DOMAIN`, `CONF_BASE_TOPIC`, `CONF_SCAN_INTERVAL`, `DEFAULT_BASE_TOPIC="zigbee2mqtt"`, `SCAN_INTERVAL_CHOICES=[0,6,12,24]`.

- [ ] venv via `uv venv -p 3.13 .venv && uv pip install -r requirements_test.txt`
- [ ] Tests: user step creates entry titled "Zigbee Floorplan" with base_topic; second flow aborts `single_instance_allowed`; base_topic with `#`/`+`/trailing `/` → error `invalid_topic`; options flow stores scan interval.
- [ ] Implement, `pytest tests/test_config_flow.py` passes, commit.

## Task 2: Network normalization (pure)

**Files:** `network.py`, `tests/test_network.py`.

**Interfaces:** `parse_devices(payload: list) -> dict[str, ZDevice]`; `normalize_networkmap(value: dict, known: set[str]) -> list[ZLink]`; `build_state(devices, extras, links, scan, bridge_online, ha_ids) -> dict` (shape from spec `NetworkState`). `ZDevice`/`ZLink` are TypedDicts.

- [ ] Tests: coordinator/router/end device parsed with model/vendor from `definition`, missing definition tolerated; disabled devices excluded; two directed links A→B (lqi 140) and B→A (lqi 120) collapse to one with `lqi_ab`,`lqi_ba`,`lqi=140`; relationship parent beats sibling; links to unknown ieee dropped; self-links dropped; relationship ints 0/1/2/4 map to parent/child/sibling/other.
- [ ] Implement, pass, commit.

## Task 3: Z2M adapter

**Files:** `z2m.py`, `tests/test_z2m.py`.

**Interfaces:** `class Z2MAdapter(hass, base_topic, store_cache)` with `async_start()`, `async_stop()`, `async_scan() -> None` (raises `ScanInProgress`), `state -> dict`, `add_listener(cb) -> Callable[[], None]`. Scan timeout `SCAN_TIMEOUT = 180`.

- [ ] Tests (using `async_fire_mqtt_message` + `mqtt_mock`): bridge/devices populates devices; `{base}/kitchen` with `{"linkquality":88,"battery":50}` updates lqi/battery of matching friendly name; availability JSON and plain string; bridge/state offline; scan publishes request payload `{"type":"raw","routes":false}`, status scanning, response sets links + last_scan + idle + persisted; response `status: error` → status error; second scan while scanning raises; timeout → error; listeners notified; ha_device_id resolved from device registry identifier `zigbee2mqtt_<ieee>`.
- [ ] Implement, pass, commit.

## Task 4: Project store

**Files:** `store.py`, `tests/test_store.py`.

**Interfaces:** `class ProjectStore(hass)`: `async_load()`, `data -> {"revision": int, "project": dict}`, `async_save(project, base_revision) -> int` raises `RevisionConflict(current)`/`ProjectTooLarge`/`vol.Invalid`; `add_listener(cb)`. `class NetworkCache(hass)`: `async_load() -> dict|None`, `async_save(data)`. `PROJECT_SCHEMA` (voluptuous, extra allowed in nested objects).

- [ ] Tests: default empty project revision 0; save with base 0 → 1 and persisted after reload; stale base → conflict; >5 MB → too large; floors missing id → invalid; listeners called with new data.
- [ ] Implement, pass, commit.

## Task 5: Images

**Files:** `images.py`, `tests/test_images.py`.

**Interfaces:** `sniff_image(data: bytes) -> str|None` (`png|jpeg|webp`), `ImageUploadView` (`POST /api/zigbee_floorplan/images`, admin), `ImageView` (`GET /api/zigbee_floorplan/images/{image_id}`), `async_delete_image(hass, image_id) -> bool`, `images_dir(hass) -> Path`.

- [ ] Tests: sniff png/jpeg/webp/svg/garbage; upload png as admin → 200 `{id}` file exists; non-admin → 401; svg → 400; >15 MB → 413; GET returns bytes with content-type; bad id → 404; delete removes.
- [ ] Implement, pass, commit.

## Task 6: Websocket API, frontend registration, setup wiring

**Files:** `websocket_api.py`, `frontend.py`, `__init__.py` (modify), `tests/test_websocket.py`, `tests/test_init.py`.

**Interfaces:** commands per spec table; subscription messages `{"type":"event","event":{"kind":"network","state":...}}` and `{"kind":"project","revision":..,"project":..}`; errors `revision_conflict`, `too_large`, `invalid_project`, `scan_in_progress`, `unauthorized`.

- [ ] Tests: info returns version/is_admin; project get/save roundtrip; non-admin save → unauthorized; conflict error code; network subscribe gets snapshot then update after MQTT message; scan as non-admin unauthorized; project subscribe gets push after save; entry setup registers panel `zigbee-floorplan`, unload removes it.
- [ ] Implement, pass, commit.

## Task 7: Frontend scaffold + core geometry

**Files:** `frontend/package.json`, `tsconfig.json`, `vite.config.ts`, `src/types.ts`, `src/materials.ts`, `src/geometry.ts`, `src/spatial-grid.ts`, `test/geometry.test.ts`, `test/spatial-grid.test.ts`.

**Interfaces:** types `Pt, Wall, Room, Floor, Placement, RfSettings, Project, ZDevice, ZLink, NetworkState, MaterialId`; `MATERIALS: Record<MaterialId, {db, color, wall:boolean}>`, `materialDb(settings, id)`; geometry `dist, sub, add, scale, segIntersect(a,b,c,d): boolean, segIntersectPoint, pointInPolygon, distToSegment, projectOnSegment, polygonArea, bboxOf(points)`; `class WallGrid(walls, cell)` with `crossed(a: Pt, b: Pt): Wall[]` (dedup).

- [ ] Tests: intersect crossing/parallel/touching endpoints/collinear; point in concave polygon; WallGrid crossed equals brute force on 200 random segments.
- [ ] Implement, `npx vitest run` passes, commit.

## Task 8: RF engine + worker

**Files:** `src/rf/{model,calibrate,heatmap,suggest,colormap,worker,client}.ts`, `test/rf.test.ts`.

**Interfaces:** `lqiToRssi(lqi)`, `txFor(device, placement, settings)`, `pathLoss(d, n, pl0)`, `class RfScene(project, devices)` building per-floor WallGrids, `scene.rssiFrom(tx: Emitter, floorId, pt, height) -> number`; `calibrate(scene, links) -> Calibration`; `computeHeatmap(scene, floorId, settings) -> {cols, rows, cell, origin, values: Float32Array, mask: Uint8Array}`; `suggestRouters(scene, floorId, heat, max=3) -> Suggestion[]`; `band(rssi)`, `colorFor(rssi) -> [r,g,b,a]`; `RfClient.request(floorId) -> Promise<RfResult>` (debounced, latest-wins).

- [ ] Tests: free path at 1 m = Tx−40; one concrete wall adds 15 dB; two floors apart adds slab; calibration recovers n=2.8 and offset from synthetic links within 0.05/0.5 dB; <3 links → disabled; heatmap stronger near router; mask respects rooms; suggestion lands in weak area and improves coverage.
- [ ] Implement, pass, commit.

## Task 9: Project ops + history

**Files:** `src/project/ops.ts`, `src/project/history.ts`, `test/ops.test.ts`.

**Interfaces:** `createProject()`, `normalizeProject(raw)`, `addFloor(p, name)`, `updateFloor(p, id, patch)`, `removeFloor`, `duplicateFloor`, `addWalls(p, floorId, walls)`, `updateWall`, `removeItems(p, floorId, ids)`, `moveVertices(p, floorId, refs, delta)`, `addRoom`, `updateRoom`, `placeDevice(p, ieee, placement)`, `unplaceDevice`, `updateSettings`; `newId()`. `class History<T>(limit=200)`: `push, undo, redo, canUndo, canRedo, clear`.

- [ ] Tests: floor ordering by level; removing floor removes its placements; moveVertices moves shared endpoints; normalize fills defaults and drops invalid walls; history undo/redo/limit.
- [ ] Implement, pass, commit.

## Task 10: Data layer, i18n, dev harness

**Files:** `src/data/api.ts`, `src/data/controller.ts`, `src/i18n.ts`, `dev/mock-hass.ts`, `dev/fixture.ts`, `index.html`.

**Interfaces:** `FloorplanApi(hass)` methods mirror websocket commands + `uploadImage(file)`, `imageUrl(id) -> Promise<string>` (blob URL cache); `FloorplanController` (`project, network, revision, saveState, canEdit, history`, `apply(fn)`, `undo/redo`, `subscribe(cb)`, autosave 800 ms, conflict reload); `t(lang, key, vars?)`. Mock hass implements `connection.subscribeMessage`, `callWS`, `fetchWithAuth`, user admin flag, themes, locale.

- [ ] Controller tests with fake api: apply → debounced save once; conflict → reload + history cleared.
- [ ] `npm run dev` serves harness, commit.

## Task 11: Canvas + tools

**Files:** `src/canvas/*`, `src/canvas/tools/*`, `test/snapping.test.ts`, `test/viewport.test.ts`.

**Interfaces:** `Viewport {scale, tx, ty}`, `toWorld/toScreen/zoomAt/fit`; `snapPoint(pt, ctx{grid, vertices, walls, anchor, angleStep, disabled}) -> {pt, kind}`; `<zfp-canvas>` props `project, floorId, network, rf, mode, tool, layers, selection, imageUrls`, events `zfp-change(fn)`, `zfp-select(ids)`, `zfp-device-click(ieee)`, `zfp-calibrate(px,len)`.

- [ ] Tests: zoomAt keeps cursor world point fixed; fit centers bounds; snapping priority vertex > wall > grid, angle snap 15°.
- [ ] Implement tools; verify in harness; commit.

## Task 12: Panel UI

**Files:** `src/panel/*`, `src/ui/*`, `src/index.ts`.

- [ ] Header (floor tabs, mode, save state, scan), left tool rail, right drawer tabs (Inspector, Devices, Coverage, Floor), device detail sheet, empty state, dialogs, toasts, keyboard shortcuts, layer toggles, export/import JSON.
- [ ] Verify in harness light/dark/mobile; commit.

## Task 13: Card + editor

**Files:** `src/card/zfp-card.ts`, `src/card/card-editor.ts`.

- [ ] `setConfig` validation, `getCardSize`, `getStubConfig`, `getConfigElement`, `window.customCards` registration; harness card page; commit.

## Task 14: Build, docs, final verification

- [ ] `npm run build` writes `custom_components/zigbee_floorplan/frontend/zigbee-floorplan.js`; full pytest + vitest green; README (install via HACS, usage, model notes); commit.
