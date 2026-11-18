# Zigbee Floorplan para Home Assistant

Visualiza tu red **Zigbee2MQTT** sobre planos interactivos de tu casa: varios pisos, paredes con materiales reales, enlaces del mesh en vivo y un mapa de cobertura estimada que se calibra con la calidad de enlace (LQI) real de tus dispositivos.

- **Varios edificios o zonas** (casa, taller, oficinas…), cada uno con sus pisos. Ábrelos por separado o júntalos en la vista **Todo el sitio**, donde se ocultan/muestran y se arrastran para ubicarlos entre sí.
- **Editor de planos** con grid, ajuste a vértices/paredes/ángulos, cotas en vivo, deshacer/rehacer y autoguardado.
- **Imagen de fondo** (foto o plano) con escala calibrable: dibuja una línea sobre una medida conocida.
- **Materiales** por pared (drywall, madera, vidrio, Low‑E, ladrillo, bloque, concreto, concreto armado, metal) y losa por piso, con atenuación en dB editable.
- **Dispositivos** arrastrables desde la lista; estado en vivo (online, LQI, batería), detalle con vecinos y acceso directo al dispositivo en HA.
- **Enlaces reales** del network map de Zigbee2MQTT (rutas o todos los vecinos), coloreados por LQI, incluso entre pisos.
- **Cobertura RF**: heatmap por piso (modelo multi‑pared), calibrado automáticamente con tus enlaces reales; dispositivos y enlaces débiles; **sugerencias de dónde poner un router**.
- **Panel lateral** para editar + **tarjeta Lovelace** para dashboards. Tema claro/oscuro de HA, móvil, español e inglés.

## Requisitos

- Home Assistant 2025.8 o superior.
- Integración **MQTT** configurada y **Zigbee2MQTT** publicando en ese broker.

## Instalación

### HACS (repositorio personalizado)

1. HACS → ⋮ → *Repositorios personalizados* → agrega la URL de este repositorio como tipo **Integración**.
2. Instala **Zigbee Floorplan** y reinicia Home Assistant.

### Manual

Copia `custom_components/zigbee_floorplan` a `/config/custom_components/` y reinicia.

### Configuración

*Ajustes → Dispositivos y servicios → Agregar integración → Zigbee Floorplan*. Indica el `base_topic` de Zigbee2MQTT (normalmente `zigbee2mqtt`). En *Opciones* puedes activar un escaneo automático del mapa de red cada 6/12/24 h.

La integración registra el panel **Zigbee Floorplan** en la barra lateral y carga la tarjeta automáticamente (no hace falta agregar recursos a Lovelace).

## Uso rápido

1. Abre **Zigbee Floorplan** en la barra lateral y pulsa **Crear el primer piso**.
2. (Opcional) En la pestaña **Piso**, sube una imagen del plano y usa **Fijar escala** sobre una medida conocida.
3. Dibuja paredes (**W**) eligiendo material y grosor; marca habitaciones (**R**) para delimitar el área de cobertura.
4. En **Dispositivos**, arrastra cada dispositivo al plano (o toca **Ubicar**). Ajusta su altura en **Detalles**.
5. Pulsa **Escanear red** para obtener los enlaces reales. La pestaña **Cobertura** muestra la calibración, zonas y dispositivos débiles y sugerencias de routers.

Solo administradores pueden editar; los demás usuarios ven el plano en modo lectura.

### Edificios y sitio

- El selector junto al título cambia entre **Todo el sitio** y cada edificio, y permite **Agregar edificio**.
- En un edificio, las pestañas son sus pisos; ahí se dibujan paredes, habitaciones y dispositivos.
- En **Todo el sitio**, las pestañas son niveles (0, 1, 2…) y se muestra ese piso de cada edificio visible. En modo Editar, arrastra un edificio para posicionarlo; clic en su nombre para abrirlo. La pestaña **Edificios** permite ocultar/mostrar, ajustar posición y color.
- La cobertura entre edificios suma las paredes exteriores de ambos; las losas solo cuentan dentro del mismo edificio. Los enlaces hacia otro edificio aparecen como un trazo corto con su nombre.

### Atajos

| Tecla | Acción |
|---|---|
| V / W / R / M / C / H | Seleccionar / Paredes / Habitaciones / Medir / Escalar imagen / Mover |
| Shift (mientras dibujas) | Desactiva el ajuste |
| Enter · Esc · doble clic | Termina la pared o habitación |
| Supr / Retroceso | Elimina la selección (los dispositivos se quitan del plano) |
| Flechas (+Shift) | Desplaza la selección un paso de grid (×10) |
| Ctrl/Cmd+D | Duplica paredes seleccionadas |
| Ctrl/Cmd+Z · Ctrl/Cmd+Shift+Z | Deshacer · Rehacer |
| F · + · − · Espacio+arrastrar | Ajustar vista · Zoom · Mover vista |

## Tarjeta Lovelace

```yaml
type: custom:zigbee-floorplan-card
title: Red Zigbee
floor: ""            # id de piso; vacío = primero
height: 420
links: tree          # tree (rutas) | all (todos los vecinos)
show_floor_tabs: true
building: site       # opcional: "site" (todo el sitio) o id de edificio
layers: [heatmap, links, labels, background]   # también: suggestions
```

También tiene editor visual.

## Cómo se estima la cobertura

Modelo multi‑pared (estilo COST 231):

```
RSSI = Tx − PL0 − 10·n·log10(d) − Σ paredes cruzadas (dB) − Σ losas cruzadas (dB)
```

- Valores iniciales: PL0 = 40 dB a 1 m (2.4 GHz), n = 2.2, Tx 5 dBm (coordinador/router), 3 dBm (dispositivo final). La potencia se puede ajustar por dispositivo.
- **Calibración**: con al menos 3 mediciones reales entre dispositivos ubicados, se ajustan `n` y un offset por mínimos cuadrados (n limitado a 1.6–4.0). La conversión LQI→RSSI (`−100 + LQI·60/255`) es aproximada y varía según el chip, por lo que el mapa es una estimación para comparar ubicaciones, no una medición.
- Las sugerencias de router buscan puntos con buena señal del mesh existente (≥ −80 dBm) que más área débil (< −85 dBm) y dispositivos débiles mejoran.

## Datos y privacidad

- Plano: `/config/.storage/zigbee_floorplan.project`; último mapa de red: `/config/.storage/zigbee_floorplan.network`.
- Imágenes: `/config/zigbee_floorplan/images/` (solo PNG/JPEG/WebP, máx. 15 MB, servidas solo a usuarios autenticados).
- Exporta/importa el plano en JSON desde el menú ⋮ del panel.

## Desarrollo

```bash
uv venv -p 3.14 .venv && uv pip install -p .venv -r requirements_test.txt
.venv/bin/pytest
cd frontend && npm install
npm test            # vitest
npm run typecheck
npm run dev         # harness con hass simulado: ?view=card, ?dark, ?empty, ?readonly, ?nodata, ?lang=en, ?bundle
npm run build       # genera custom_components/zigbee_floorplan/frontend/zigbee-floorplan.js
```

El adaptador de datos (`z2m.py`) está aislado: una versión para ZHA solo necesita producir el mismo `NetworkState`.
