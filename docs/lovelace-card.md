# Lovelace card

The card shows one floor, or the whole site, read only, with live link and device state.

```yaml
type: custom:zigbee-floorplan-card
title: Zigbee network
building: site
height: 420
links: tree
layers: [heatmap, links, labels, background]
show_floor_tabs: true
```

There is also a visual editor: add the card from the dashboard editor and pick **Zigbee Floorplan**.

## Options

| Option | Default | Description |
|---|---|---|
| `title` | none | Title shown above the plan. |
| `building` | first building | `site` for all visible buildings (tabs are levels), or the id of one building (tabs are its floors). The visual editor lists them by name. |
| `floor` | first floor | Id of the floor to start on, in a single‑building card. |
| `level` | first level | Level to start on, in a `building: site` card. |
| `height` | `420` | Height of the plan in pixels (minimum 150). |
| `links` | `tree` | `tree` draws each device's route to the coordinator; `all` draws every neighbor link. |
| `layers` | `heatmap, links, labels, background` | Any of `heatmap`, `links`, `labels`, `background`, `suggestions`. |
| `show_floor_tabs` | `true` | Show the floor (or level) tabs when there is more than one. |

Clicking a device opens a sheet with its link quality, estimated signal, route, neighbors and a button to open the device in Home Assistant.

The card uses the same data as the panel, so it updates live. Editing is only done in the panel.
