# Development

## Layout

```
custom_components/zigbee_floorplan/   the integration (+ built frontend bundle)
frontend/                             TypeScript sources, tests and a dev harness
tests/                                backend tests
docs/                                 documentation and screenshots
```

## Backend

Needs Python 3.14 (what current Home Assistant requires).

```bash
uv venv -p 3.14 .venv
uv pip install -p .venv -r requirements_test.txt
.venv/bin/pytest
```

## Frontend

Needs Node 24.

```bash
cd frontend
npm ci
npm test            # vitest
npm run typecheck
npm run dev         # dev harness with a simulated Home Assistant
npm run build       # writes custom_components/zigbee_floorplan/frontend/zigbee-floorplan.js
```

**Always run `npm run build` and commit the bundle** when you change anything under `frontend/src`; CI checks it.

### Dev harness

`npm run dev` serves a page with a simulated `hass`, a two‑building sample plan and a mock Zigbee network. Query parameters:

| Parameter | Effect |
|---|---|
| `?view=card` | Show sample Lovelace cards instead of the panel |
| `?dark` | Dark theme |
| `?lang=en` / `?lang=es` | Language |
| `?readonly` | Non‑administrator user |
| `?empty` | No saved plan |
| `?nodata` | No Zigbee2MQTT data |
| `?bundle` | Load the production bundle instead of the sources |
| `?demo=weak` | A layout with weak coverage and suggestions |
| `?demo=unscanned` | Devices missing from the last scan |
| `?tab=coverage&select=Kitchen%20plug` | Open a drawer tab or a device |
| `?prefs=<json>` | Seed the saved UI preferences (view, mode…) |

### Testing in a real Home Assistant

Copy `custom_components/zigbee_floorplan` to your instance, reload the integration (disable and enable it) and hard‑reload the browser.

## Project conventions

- Keep the Z2M‑specific code in `z2m.py` and `network.py`.
- Prefer small, focused modules and add tests next to the change (`tests/` and `frontend/test/`).
- UI strings go through `frontend/src/i18n.ts` with English and Spanish.
- No dependency on Home Assistant's internal web components except `ha-form` in the card editor.

## Releasing

1. Update `version` in `custom_components/zigbee_floorplan/manifest.json` and `VERSION` in `frontend/src/index.ts`, and add an entry to `CHANGELOG.md`.
2. `npm run build`, commit the bundle.
3. Tag `vX.Y.Z` and push the tag; the release workflow creates the GitHub release.
