# Contributing

Thanks for helping. Bug reports, ideas and pull requests are welcome.

## Before you start

- Look through the [open issues](https://github.com/NaturalDevCR/zigbee-floorplan/issues) first.
- For a bigger change, open an issue to talk about it before writing code.

## Setting up

The [development guide](docs/development.md) covers the backend tests, the frontend build and the dev harness with a simulated Home Assistant.

```bash
uv venv -p 3.14 .venv && uv pip install -p .venv -r requirements_test.txt
.venv/bin/pytest
cd frontend && npm ci && npm test && npm run typecheck
```

## Pull requests

- Add or update tests for what you change (`tests/` for Python, `frontend/test/` for TypeScript).
- **Rebuild the bundle** with `npm run build` and commit `custom_components/zigbee_floorplan/frontend/zigbee-floorplan.js` when you touch `frontend/src`. CI fails when it is out of date.
- UI text goes through `frontend/src/i18n.ts` in English and Spanish.
- Keep changes focused; avoid unrelated refactoring.
- Describe what changed and why, and how you tested it. Screenshots help for UI changes.

## Reporting bugs

Use the bug report template. Include your Home Assistant and integration versions, what you expected, what happened and relevant log lines (**Settings → System → Logs**, filtered by `zigbee_floorplan`).

## Support for other Zigbee stacks

The Zigbee2MQTT code is isolated in `z2m.py` and `network.py` on purpose. A ZHA adapter that produces the same network state is a welcome contribution.
