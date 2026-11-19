import { html, nothing, type TemplateResult } from "lit";
import { DEVICE_DRAG_TYPE } from "../canvas/zfp-canvas";
import { DEVICE_PREFIX } from "../canvas/tools";
import { dist, polygonArea } from "../geometry";
import type { I18nKey, Translate } from "../i18n";
import { MATERIALS, SLAB_MATERIALS, WALL_MATERIALS, materialDb } from "../materials";
import { BANDS } from "../rf/colormap";
import type { RfResult } from "../rf/engine";
import { txDefault } from "../rf/model";
import { BUILDING_COLORS, floorsOf } from "../project/ops";
import { getTopology } from "../topology";
import type { Building, Floor, MaterialId, NetworkState, Placement, Project, RfSettings, Room, Wall, ZDevice } from "../types";
import { deviceHealth, HEALTH_COLOR, isWeakRssi, LQI_WEAK, lqiColor, TYPE_COLOR, TYPE_ICON } from "../ui/device-style";
import {
  icon,
  mdiCloudUploadOutline,
  mdiDeleteOutline,
  mdiImageOutline,
  mdiLightbulbOnOutline,
  mdiMagnify,
  mdiMapMarkerPlusOutline,
  mdiPlus,
  mdiRulerSquareCompass,
} from "../ui/icons";

export interface PaneContext {
  t: Translate;
  project: Project;
  floor: Floor | undefined;
  network: NetworkState | null;
  rf: RfResult | null;
  selection: string[];
  canEdit: boolean;
  /** admin currently in view mode */
  canSwitchToEdit: boolean;
  site: boolean;
  /** floors drawn on the plan right now */
  displayedFloorIds: string[];
  building: Building | undefined;
  editBuilding(id: string, patch: Partial<Building>): void;
  deleteBuilding(id: string): void;
  openBuilding(id: string): void;
  addBuilding(): void;
  search: string;
  /** apply an edit (one undo step) */
  edit(fn: (p: Project) => Project): void;
  editWalls(ids: string[], patch: Partial<Wall>): void;
  editRoom(id: string, patch: Partial<Room>): void;
  editPlacement(ieee: string, patch: Partial<Placement>): void;
  editFloor(patch: Partial<Floor>): void;
  editSettings(patch: Partial<RfSettings>): void;
  setSearch(v: string): void;
  openDevice(ieee: string): void;
  startPlacing(ieee: string): void;
  unplace(ieee: string): void;
  highlight(ieee: string | null): void;
  locateSuggestion(index: number): void;
  uploadImage(): void;
  removeImage(): void;
  setTool(tool: "calibrate" | "image" | "select"): void;
  activeTool: string;
  deleteFloor(): void;
  duplicateFloor(): void;
}

const fmt = (v: number, d = 2) => (Math.round(v * 10 ** d) / 10 ** d).toString();
const matName = (t: Translate, id: MaterialId) => t(`material.${id}` as I18nKey);

function numberField(
  label: string,
  value: number,
  onChange: (v: number) => void,
  opts: { min?: number; max?: number; step?: number; disabled?: boolean; placeholder?: string } = {},
): TemplateResult {
  return html`<label class="field"
    ><span>${label}</span>
    <input
      type="number"
      .value=${Number.isFinite(value) ? String(value) : ""}
      placeholder=${opts.placeholder ?? nothing}
      min=${opts.min ?? nothing}
      max=${opts.max ?? nothing}
      step=${opts.step ?? "any"}
      ?disabled=${opts.disabled}
      @change=${(e: Event) => {
        const v = parseFloat((e.target as HTMLInputElement).value);
        if (Number.isFinite(v)) onChange(opts.min !== undefined ? Math.max(opts.min, v) : v);
      }}
  /></label>`;
}

function materialSelect(
  t: Translate,
  settings: RfSettings,
  value: MaterialId | "",
  list: typeof WALL_MATERIALS,
  onChange: (m: MaterialId) => void,
  disabled = false,
): TemplateResult {
  return html`<select
    ?disabled=${disabled}
    @change=${(e: Event) => onChange((e.target as HTMLSelectElement).value as MaterialId)}
  >
    ${value === "" ? html`<option value="" selected disabled>—</option>` : nothing}
    ${list.map(
      (m) => html`<option value=${m.id} ?selected=${m.id === value}>
        ${matName(t, m.id)} · ${materialDb(settings, m.id)} dB
      </option>`,
    )}
  </select>`;
}

// ---------- inspector ----------

export function renderInspector(ctx: PaneContext): TemplateResult {
  const { t, floor, selection, project } = ctx;
  if (!floor || !selection.length) {
    return html`<div class="empty-pane">${icon(mdiMapMarkerPlusOutline, 32)}<p>${t("inspector.empty")}</p></div>`;
  }
  const deviceIds = selection.filter((s) => s.startsWith(DEVICE_PREFIX)).map((s) => s.slice(DEVICE_PREFIX.length));
  if (deviceIds.length === 1 && selection.length === 1) return renderDeviceInspector(ctx, deviceIds[0]);

  const walls = floor.walls.filter((w) => selection.includes(w.id));
  const rooms = floor.rooms.filter((r) => selection.includes(r.id));
  const parts: TemplateResult[] = [];

  if (walls.length) {
    const mats = new Set(walls.map((w) => w.material));
    const thick = new Set(walls.map((w) => w.thickness));
    const mat = mats.size === 1 ? walls[0].material : "";
    const total = walls.reduce((s, w) => s + dist(w.a, w.b), 0);
    parts.push(html`<section>
      <div class="section-title">${walls.length === 1 ? t("inspector.wall") : t("inspector.walls", { n: walls.length })}</div>
      <label class="field"
        ><span>${t("inspector.material")}</span>
        ${materialSelect(t, project.settings, mat, WALL_MATERIALS, (m) => ctx.editWalls(walls.map((w) => w.id), { material: m }), !ctx.canEdit)}
      </label>
      ${mat ? html`<div class="material-swatch" style="--c:${MATERIALS[mat].color}">
            <span></span>${t("inspector.attenuation", { db: materialDb(project.settings, mat) })}
          </div>` : nothing}
      <div class="row">
        ${numberField(
          t("inspector.thickness"),
          thick.size === 1 ? walls[0].thickness : NaN,
          (v) => ctx.editWalls(walls.map((w) => w.id), { thickness: v }),
          { min: 0.02, step: 0.01, disabled: !ctx.canEdit, placeholder: "—" },
        )}
        <label class="field"><span>${t("inspector.length")}</span><input type="text" readonly .value=${`${fmt(total)} m`} /></label>
      </div>
    </section>`);
  }
  for (const room of rooms) {
    parts.push(html`<section>
      <div class="section-title">${t("inspector.room")}</div>
      <label class="field"
        ><span>${t("inspector.room_name")}</span>
        <input
          type="text"
          .value=${room.name}
          ?disabled=${!ctx.canEdit}
          @change=${(e: Event) => ctx.editRoom(room.id, { name: (e.target as HTMLInputElement).value })}
      /></label>
      <div class="kv"><span>${t("inspector.area")}</span><b>${fmt(polygonArea(room.points), 1)} m²</b></div>
    </section>`);
  }
  if (deviceIds.length) {
    parts.push(html`<section><div class="section-title">${t("tab.devices")}</div>
      ${deviceIds.map((ieee) => deviceRow(ctx, ieee, ctx.network?.devices.find((d) => d.ieee === ieee)))}</section>`);
  }
  return html`${parts}`;
}

function renderDeviceInspector(ctx: PaneContext, ieee: string): TemplateResult {
  const { t, project, network, rf } = ctx;
  const device = network?.devices.find((d) => d.ieee === ieee);
  const placement = project.placements[ieee];
  const type = device?.type ?? "Unknown";
  return html`
    ${device
      ? html`<zfp-device-detail
          .device=${device}
          .placement=${placement}
          .network=${network}
          .floors=${project.floors}
          .rssi=${rf?.deviceRssi[ieee]}
          .t=${t}
          .editable=${ctx.canEdit}
        ></zfp-device-detail>`
      : html`<p class="muted">${ieee} — ${t("devices.missing")}</p>`}
    ${placement && ctx.canEdit
      ? html`<section class="tight">
          <div class="row">
            ${numberField(t("inspector.height"), placement.height, (v) => ctx.editPlacement(ieee, { height: v }), { min: 0, step: 0.1 })}
            ${numberField(
              t("inspector.tx"),
              placement.txPower ?? NaN,
              (v) => ctx.editPlacement(ieee, { txPower: v }),
              { step: 1, placeholder: `${txDefault(project.settings, type)}` },
            )}
          </div>
        </section>`
      : nothing}
  `;
}

// ---------- devices ----------

function deviceRow(ctx: PaneContext, ieee: string, d: ZDevice | undefined, action?: TemplateResult): TemplateResult {
  const { t } = ctx;
  const topo = getTopology(ctx.network);
  const uplinkName = ctx.network?.devices.find((x) => x.ieee === topo.uplink.get(ieee))?.name;
  const unlinked = !!d && d.type !== "Coordinator" && topo.uplink.get(ieee) === null && (ctx.network?.links.length ?? 0) > 0;
  const type = d?.type ?? "Unknown";
  const health = deviceHealth(d, ctx.rf?.deviceRssi[ieee]);
  const draggable = ctx.canEdit && !!d;
  return html`<li
    class="dev-row ${ctx.selection.includes(DEVICE_PREFIX + ieee) ? "selected" : ""}"
    draggable=${draggable ? "true" : "false"}
    @dragstart=${(e: DragEvent) => {
      e.dataTransfer?.setData(DEVICE_DRAG_TYPE, ieee);
      if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
    }}
    @mouseenter=${() => ctx.highlight(ieee)}
    @mouseleave=${() => ctx.highlight(null)}
    @click=${() => ctx.openDevice(ieee)}
  >
    <span class="dev-icon" style="--c:${TYPE_COLOR[type]};--h:${HEALTH_COLOR[health]}">${icon(TYPE_ICON[type], 18)}</span>
    <span class="dev-text">
      <span class="dev-name">${d?.name ?? ieee}</span>
      <span class="dev-sub">
        ${d?.available === false
          ? html`<span class="chip bad">${t("devices.offline")}</span>`
          : d?.lqi !== null && d?.lqi !== undefined
            ? html`<span class="lqi-dot" style="background:${lqiColor(d.lqi)}"></span>LQI ${d.lqi}`
            : t(`type.${type}` as I18nKey)}
        ${d?.battery !== null && d?.battery !== undefined ? html` · ${d.battery}%` : nothing}
        ${uplinkName ? html` · ↑ ${uplinkName}` : unlinked ? html` · <span class="no-link">${t("detail.no_link_data")}</span>` : nothing}
      </span>
    </span>
    ${action ?? nothing}
  </li>`;
}

export function renderDevicesPane(ctx: PaneContext): TemplateResult {
  const { t, project, network, floor } = ctx;
  const devices = network?.devices ?? [];
  const q = ctx.search.trim().toLowerCase();
  const match = (d: ZDevice) =>
    !q || d.name.toLowerCase().includes(q) || d.ieee.includes(q) || (d.model ?? "").toLowerCase().includes(q);
  const known = new Set(devices.map((d) => d.ieee));
  const shown = new Set(ctx.displayedFloorIds);
  const here = devices.filter((d) => match(d) && shown.has(project.placements[d.ieee]?.floorId));
  const elsewhere = devices.filter(
    (d) => match(d) && project.placements[d.ieee] && !shown.has(project.placements[d.ieee].floorId),
  );
  const unplaced = devices.filter((d) => match(d) && !project.placements[d.ieee]);
  const missing = Object.keys(project.placements).filter((ieee) => !known.has(ieee) && (!q || ieee.includes(q)));

  // without any network data every placement would look "missing"; say so instead
  if (!devices.length) {
    return html`<div class="empty-pane">${icon(mdiMagnify, 32)}<p>${t("devices.none")}</p></div>`;
  }
  const group = (title: string, items: TemplateResult[], extra: TemplateResult | typeof nothing = nothing) =>
    items.length
      ? html`<section><div class="section-title">${title} <span class="count">${items.length}</span></div>${extra}
          <ul class="dev-list">${items}</ul></section>`
      : nothing;
  const floorName = (id: string) => {
    const f = project.floors.find((x) => x.id === id);
    if (!f) return "";
    const b = project.buildings.length > 1 ? project.buildings.find((x) => x.id === f.buildingId) : undefined;
    return b ? `${b.name} · ${f.name}` : f.name;
  };

  return html`
    <div class="search">
      ${icon(mdiMagnify, 18)}
      <input type="search" placeholder=${t("devices.search")} .value=${ctx.search}
        @input=${(e: Event) => ctx.setSearch((e.target as HTMLInputElement).value)} />
    </div>
    ${group(
      t("devices.unplaced"),
      unplaced.map((d) =>
        deviceRow(
          ctx,
          d.ieee,
          d,
          ctx.canEdit && (floor || ctx.site)
            ? html`<button class="btn small" @click=${(e: Event) => {
                e.stopPropagation();
                ctx.startPlacing(d.ieee);
              }}>${t("action.place")}</button>`
            : undefined,
        ),
      ),
      ctx.canEdit
        ? html`<p class="hint">${t("devices.drag_hint")}</p>`
        : ctx.canSwitchToEdit
          ? html`<p class="hint">${t("hint.switch_to_edit")}</p>`
          : nothing,
    )}
    ${group(t("devices.placed"), here.map((d) => deviceRow(ctx, d.ieee, d)))}
    ${group(
      t("devices.other_floor"),
      elsewhere.map((d) =>
        deviceRow(ctx, d.ieee, d, html`<span class="chip">${floorName(project.placements[d.ieee].floorId)}</span>`),
      ),
    )}
    ${group(
      t("devices.missing"),
      missing.map((ieee) =>
        deviceRow(
          ctx,
          ieee,
          undefined,
          ctx.canEdit
            ? html`<button class="icon-btn" title=${t("action.remove")} @click=${(e: Event) => {
                e.stopPropagation();
                ctx.unplace(ieee);
              }}>${icon(mdiDeleteOutline, 18)}</button>`
            : undefined,
        ),
      ),
    )}
    ${!unplaced.length && devices.length && !q ? html`<p class="hint ok">${t("devices.all_placed")}</p>` : nothing}
  `;
}

// ---------- coverage ----------

export function renderCoveragePane(ctx: PaneContext): TemplateResult {
  const { t, rf, project, network } = ctx;
  const cal = rf?.calibration;
  const devices = new Map((network?.devices ?? []).map((d) => [d.ieee, d]));
  const weakDevices = Object.entries(rf?.deviceRssi ?? {})
    // the coordinator is the root of the mesh: an estimate towards other routers says nothing about it
    .filter(([ieee, v]) => isWeakRssi(v) && devices.has(ieee) && devices.get(ieee)!.type !== "Coordinator")
    .sort((a, b) => a[1] - b[1]);
  const weakLinks = (network?.links ?? [])
    .filter((l) => l.lqi !== null && l.lqi < LQI_WEAK && project.placements[l.a] && project.placements[l.b])
    .sort((a, b) => (a.lqi ?? 0) - (b.lqi ?? 0))
    .slice(0, 8);
  const suggestions = (rf?.suggestions ?? []).filter((sg) => ctx.displayedFloorIds.includes(sg.floorId));
  const hasEmitter = Object.keys(project.placements).some((i) => {
    const ty = devices.get(i)?.type;
    return ty === "Coordinator" || ty === "Router";
  });

  return html`
    <section>
      <div class="section-title">${t("coverage.legend")}</div>
      <div class="legend">
        ${BANDS.map(
          (b) => html`<div><span class="sw" style="background:${b.color}"></span>${t(`band.${b.id}` as I18nKey)}
            <span class="muted">${Number.isFinite(b.min) ? `≥ ${b.min}` : `< -95`} dBm</span></div>`,
        )}
      </div>
      ${!hasEmitter ? html`<p class="hint">${t("coverage.need_coordinator")}</p>` : nothing}
    </section>

    <section>
      <div class="section-title">${t("coverage.suggestions")}</div>
      ${suggestions.length
        ? html`<ul class="sugg-list">
            ${suggestions.map(
              (s, i) => html`<li @click=${() => ctx.locateSuggestion(i)}>
                <span class="num">${i + 1}</span>
                <span class="dev-text">
                  <span class="dev-name">${t("coverage.suggestion")}</span>
                  <span class="dev-sub">${t("coverage.gain", { area: Math.round(s.gainArea) })}${s.fixedDevices.length
                    ? html` · ${t("coverage.fixes", { n: s.fixedDevices.length })}` : nothing}</span>
                </span>
              </li>`,
            )}
          </ul>`
        : html`<p class="hint ${hasEmitter ? "ok" : ""}">${icon(mdiLightbulbOnOutline, 16)} ${hasEmitter ? t("coverage.no_suggestions") : "—"}</p>`}
    </section>

    <section>
      <div class="section-title">${t("coverage.weak_devices")}</div>
      ${weakDevices.length
        ? html`<ul class="dev-list">${weakDevices.map(([ieee, v]) =>
            deviceRow(ctx, ieee, devices.get(ieee), html`<span class="chip warn">${v} dBm</span>`))}</ul>`
        : html`<p class="hint ok">${t("coverage.none_weak")}</p>`}
    </section>

    <section>
      <div class="section-title">${t("coverage.weak_links")}</div>
      ${weakLinks.length
        ? html`<ul class="link-list">${weakLinks.map(
            (l) => html`<li @mouseenter=${() => ctx.highlight(l.a)} @mouseleave=${() => ctx.highlight(null)}>
              <span>${devices.get(l.a)?.name ?? l.a}</span><span class="muted">↔</span><span>${devices.get(l.b)?.name ?? l.b}</span>
              <span class="lqi" style="background:${lqiColor(l.lqi)}">${l.lqi}</span>
            </li>`,
          )}</ul>`
        : html`<p class="hint ok">${t("coverage.none_weak")}</p>`}
    </section>

    <section>
      <div class="section-title">${t("coverage.calibration")}</div>
      <label class="toggle">
        <input type="checkbox" .checked=${project.settings.autoCalibrate} ?disabled=${!ctx.canEdit}
          @change=${(e: Event) => ctx.editSettings({ autoCalibrate: (e.target as HTMLInputElement).checked })} />
        ${t("coverage.auto_calibrate")}
      </label>
      ${cal?.applied
        ? html`<p class="hint ok">${t("coverage.calibrated", { n: cal.samples })}</p>
            <div class="kv"><span>${t("coverage.exponent")}</span><b>${cal.exponent}</b></div>
            <div class="kv"><span>${t("coverage.offset")}</span><b>${cal.offsetDb > 0 ? "+" : ""}${cal.offsetDb} dB</b></div>
            <div class="kv"><span>${t("coverage.rmse")}</span><b>± ${cal.rmse} dB</b></div>`
        : html`<p class="hint">${t("coverage.not_calibrated")}</p>`}
    </section>
  `;
}

// ---------- floor ----------

export function renderFloorPane(ctx: PaneContext): TemplateResult {
  const { t, floor, project } = ctx;
  if (!floor) return html``;
  const bg = floor.background;
  const disabled = !ctx.canEdit;
  return html`
    ${ctx.building ? renderBuildingSection(ctx, ctx.building) : nothing}
    <section>
      <div class="section-title">${t("floor.settings")}</div>
      <label class="field"><span>${t("floor.name")}</span>
        <input type="text" .value=${floor.name} ?disabled=${disabled}
          @change=${(e: Event) => ctx.editFloor({ name: (e.target as HTMLInputElement).value || floor.name })} /></label>
      <div class="row">
        ${numberField(t("floor.level"), floor.level, (v) => ctx.editFloor({ level: Math.round(v) }), { step: 1, disabled })}
        ${numberField(t("floor.elevation"), floor.elevation, (v) => ctx.editFloor({ elevation: v }), { step: 0.1, disabled })}
      </div>
      <div class="row">
        ${numberField(t("floor.height"), floor.height, (v) => ctx.editFloor({ height: v }), { min: 1, step: 0.1, disabled })}
        <label class="field"><span>${t("floor.slab")}</span>
          ${materialSelect(t, project.settings, floor.slab, SLAB_MATERIALS, (m) => ctx.editFloor({ slab: m }), disabled)}</label>
      </div>
    </section>

    <section>
      <div class="section-title">${t("floor.background")}</div>
      ${bg
        ? html`
            <label class="toggle"><input type="checkbox" .checked=${bg.visible} ?disabled=${disabled}
              @change=${(e: Event) => ctx.editFloor({ background: { ...bg, visible: (e.target as HTMLInputElement).checked } })} />
              ${t("floor.visible")}</label>
            <label class="field"><span>${t("floor.opacity")} · ${Math.round(bg.opacity * 100)}%</span>
              <input type="range" min="0.05" max="1" step="0.05" .value=${String(bg.opacity)} ?disabled=${disabled}
                @change=${(e: Event) => ctx.editFloor({ background: { ...bg, opacity: parseFloat((e.target as HTMLInputElement).value) } })} /></label>
            <p class="hint">${t("floor.scale_hint")}</p>
            ${ctx.canEdit
              ? html`<div class="btn-row">
                  <button class="btn small ${ctx.activeTool === "calibrate" ? "primary" : ""}" @click=${() => ctx.setTool("calibrate")}>
                    ${icon(mdiRulerSquareCompass, 16)} ${t("action.calibrate_image")}</button>
                  <button class="btn small ${ctx.activeTool === "image" ? "primary" : ""}"
                    @click=${() => ctx.setTool(ctx.activeTool === "image" ? "select" : "image")}>
                    ${icon(mdiImageOutline, 16)} ${t("layers.background")} ↔</button>
                  <button class="btn small" @click=${ctx.uploadImage}>${t("action.replace_image")}</button>
                  <button class="btn small danger" @click=${ctx.removeImage}>${t("action.remove")}</button>
                </div>`
              : nothing}`
        : html`<p class="hint">${t("floor.no_background")}</p>
            ${ctx.canEdit ? html`<button class="btn" @click=${ctx.uploadImage}>${icon(mdiCloudUploadOutline, 18)} ${t("action.upload_image")}</button>` : nothing}`}
    </section>

    ${ctx.canEdit
      ? html`<section class="btn-row">
          <button class="btn small" @click=${ctx.duplicateFloor}>${t("action.duplicate")}</button>
          <button class="btn small danger" @click=${ctx.deleteFloor}>${icon(mdiDeleteOutline, 16)} ${t("action.delete")}</button>
        </section>`
      : nothing}
  `;
}

// ---------- buildings ----------

function colorPicker(ctx: PaneContext, b: Building): TemplateResult {
  return html`<div class="swatches" role="radiogroup" aria-label=${ctx.t("building.color")}>
    ${BUILDING_COLORS.map(
      (c) => html`<button role="radio" aria-checked=${c === b.color} class="swatch ${c === b.color ? "on" : ""}"
        style="background:${c}" ?disabled=${!ctx.canEdit}
        @click=${() => ctx.editBuilding(b.id, { color: c })}></button>`,
    )}
  </div>`;
}

function renderBuildingSection(ctx: PaneContext, b: Building): TemplateResult {
  const { t } = ctx;
  const disabled = !ctx.canEdit;
  return html`<section>
    <div class="section-title">${t("building.section")}</div>
    <label class="field"><span>${t("building.name")}</span>
      <input type="text" .value=${b.name} ?disabled=${disabled}
        @change=${(e: Event) => ctx.editBuilding(b.id, { name: (e.target as HTMLInputElement).value || b.name })} /></label>
    <div class="field"><span>${t("building.color")}</span>${colorPicker(ctx, b)}</div>
    ${ctx.canEdit && ctx.project.buildings.length > 1
      ? html`<button class="btn small danger" @click=${() => ctx.deleteBuilding(b.id)}>
          ${icon(mdiDeleteOutline, 16)} ${t("building.delete")}</button>`
      : nothing}
  </section>`;
}

export function renderBuildingsPane(ctx: PaneContext): TemplateResult {
  const { t, project } = ctx;
  return html`
    <p class="hint">${t("site.hint")}</p>
    <ul class="building-list">
      ${project.buildings.map((b) => {
        const floors = floorsOf(project, b.id);
        return html`<li class="building-card ${b.visible ? "" : "hidden"}" style="--b:${b.color}">
          <div class="b-head">
            <span class="b-swatch"></span>
            <span class="dev-text">
              <span class="dev-name">${b.name}</span>
              <span class="dev-sub">${floors.length === 1 ? t("building.floor_one") : t("building.floors", { n: floors.length })}</span>
            </span>
            <label class="toggle" title=${b.visible ? t("site.hide") : t("site.show")}>
              <input type="checkbox" .checked=${b.visible} ?disabled=${!ctx.canEdit && !ctx.canSwitchToEdit}
                @change=${(e: Event) => ctx.editBuilding(b.id, { visible: (e.target as HTMLInputElement).checked })} />
            </label>
            <button class="btn small" @click=${() => ctx.openBuilding(b.id)}>${t("site.open")}</button>
          </div>
          ${ctx.canEdit
            ? html`<div class="row">
                  ${numberField(`X (m)`, b.x, (v) => ctx.editBuilding(b.id, { x: v }), { step: 0.5 })}
                  ${numberField(`Y (m)`, b.y, (v) => ctx.editBuilding(b.id, { y: v }), { step: 0.5 })}
                </div>
                ${colorPicker(ctx, b)}`
            : nothing}
        </li>`;
      })}
    </ul>
    ${ctx.canEdit
      ? html`<button class="btn" @click=${ctx.addBuilding}>${icon(mdiPlus, 18)} ${t("building.add")}</button>`
      : nothing}
  `;
}
