# Coverage model

The coverage map is an **estimate** to help you compare placements. It is not a measurement.

## Path loss

A multi‑wall model in the style of COST 231, computed in 3D:

```
RSSI = Tx − PL0 − 10 · n · log10(d) − Σ walls crossed (dB) − Σ slabs crossed (dB)
```

| Term | Default | Meaning |
|---|---|---|
| Tx | 5 dBm coordinator and routers, 3 dBm end devices | Transmit power (adjustable per device) |
| PL0 | 40 dB | Loss at 1 m at 2.4 GHz |
| n | 2.2 | Path‑loss exponent |
| d | | 3D distance in meters (minimum 0.5 m), including floor elevation and the height of each device |

Walls are the wall segments the straight path between transmitter and receiver crosses (on both floors when they differ). Slabs are counted only between floors of the **same building**. Different buildings simply shadow each other through their exterior walls, using their positions on the site.

## Materials

| Material | dB per crossing |
|---|---|
| Drywall | 3 |
| Wood / door | 4 |
| Glass | 3 |
| Low‑E glass | 15 |
| Brick | 8 |
| Concrete block | 11 |
| Concrete | 15 |
| Reinforced concrete | 22 |
| Metal | 30 |
| Wood floor (slab) | 8 |
| Concrete slab | 20 |

These are typical values for 2.4 GHz. Edit them in the project settings if your construction differs.

## Calibration

Real links tell the model how your building behaves. For every link between two placed devices, the LQI each side reports is converted to an RSSI and compared with the model. With at least **3** measurements the exponent `n` (limited to 1.6–4.0) and an offset (limited to ±20 dB) are fitted by least squares. The **Coverage** tab shows how many measurements were used and the fit error. Calibration can be switched off.

LQI to RSSI uses `RSSI ≈ −100 + LQI · 60 / 255`. The real relation depends on the radio chip, so treat results as relative. LQI values at or above 250 are ignored because they saturate and carry no distance information.

## Heatmap

For every floor the map shows the best signal from any router or the coordinator (on any floor) at a height of 1 m.

- The area is the union of the floor's **rooms**; without rooms it is the bounding box of walls and devices plus 1 m.
- The cell size is chosen automatically (at most 40 000 cells).
- Bands: excellent ≥ −65 dBm, good ≥ −75, fair ≥ −85, weak ≥ −95, no signal below.

## Router suggestions

Candidates are points on a coarse grid inside the coverage area that already receive at least −80 dBm from the mesh (so a router there could join reliably). Each candidate is scored by the area it lifts above −85 dBm plus ten points per weak placed end device it fixes. The best is picked, added to the model, and the process repeats for up to three suggestions. Suggestions with a gain below 2 m² are dropped.

## Weak devices and links

A placed device is weak when its estimated signal from the rest of the mesh is below −85 dBm. A link is weak when its LQI is below 60. The coordinator is never listed as weak.

## Limits

- Doors and windows are not separate objects; draw a short wall segment with a door or glass material.
- No reflections, interference or antenna patterns are modelled.
- The 5 GHz band and Wi‑Fi coexistence are out of scope.
