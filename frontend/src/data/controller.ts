import { History } from "../project/history";
import { createProject, normalizeProject } from "../project/ops";
import type { NetworkState, Project } from "../types";
import { FloorplanApi, type InfoResult } from "./api";
import { isWsError, type HomeAssistant } from "./hass";

export type SaveState = "idle" | "dirty" | "saving" | "saved" | "error" | "conflict";

export type Notice =
  | { kind: "conflict" }
  | { kind: "save_error"; message: string }
  | { kind: "scan_error"; message: string }
  | { kind: "remote_update" };

export interface ApiLike {
  info: FloorplanApi["info"];
  getProject: FloorplanApi["getProject"];
  saveProject: FloorplanApi["saveProject"];
  subscribeNetwork: FloorplanApi["subscribeNetwork"];
  subscribeProject: FloorplanApi["subscribeProject"];
  scan: FloorplanApi["scan"];
  imageUrl: FloorplanApi["imageUrl"];
  uploadImage: FloorplanApi["uploadImage"];
}

const DETACH_GRACE_MS = 5000;

/**
 * Shared state for every panel/card on the page: project (with undo history
 * and debounced autosave), live network state, and backend info.
 */
export class FloorplanController {
  private static readonly instances = new WeakMap<object, FloorplanController>();

  static for(hass: HomeAssistant): FloorplanController {
    let ctrl = this.instances.get(hass.connection);
    if (!ctrl) {
      let current = hass;
      const api = new FloorplanApi(() => current);
      ctrl = new FloorplanController(api);
      ctrl.hassSetter = (h) => (current = h);
      this.instances.set(hass.connection, ctrl);
    }
    ctrl.setHass(hass);
    return ctrl;
  }

  ready = false;
  loadError: string | null = null;
  network: NetworkState | null = null;
  info: InfoResult | null = null;
  revision = 0;
  saveState: SaveState = "idle";

  private hassSetter: (h: HomeAssistant) => void = () => {};
  private readonly history = new History<Project>(createProject());
  private readonly listeners = new Set<() => void>();
  private readonly noticeListeners = new Set<(n: Notice) => void>();
  private unsubs: (() => Promise<void>)[] = [];
  private connecting: Promise<void> | null = null;
  private detachTimer: ReturnType<typeof setTimeout> | undefined;
  private saveTimer: ReturnType<typeof setTimeout> | undefined;
  private saving: Promise<void> | null = null;
  /** project snapshot last persisted (or loaded) */
  private persisted: Project | null = null;

  constructor(
    readonly api: ApiLike,
    private readonly saveDelayMs = 800,
  ) {}

  setHass(hass: HomeAssistant): void {
    this.hassSetter(hass);
  }

  get project(): Project {
    return this.history.present;
  }

  get canUndo(): boolean {
    return this.history.canUndo;
  }

  get canRedo(): boolean {
    return this.history.canRedo;
  }

  get canEdit(): boolean {
    return !!this.info?.is_admin && this.ready;
  }

  get dirty(): boolean {
    return this.persisted !== this.project;
  }

  attach(listener: () => void): () => void {
    clearTimeout(this.detachTimer);
    this.listeners.add(listener);
    if (!this.connecting) this.connecting = this.connect();
    return () => {
      this.listeners.delete(listener);
      if (!this.listeners.size) {
        this.detachTimer = setTimeout(() => this.disconnect(), DETACH_GRACE_MS);
      }
    };
  }

  onNotice(listener: (n: Notice) => void): () => void {
    this.noticeListeners.add(listener);
    return () => this.noticeListeners.delete(listener);
  }

  private emit(): void {
    for (const l of [...this.listeners]) l();
  }

  private notice(n: Notice): void {
    for (const l of [...this.noticeListeners]) l(n);
  }

  async connect(): Promise<void> {
    try {
      this.info = await this.api.info();
      const stored = await this.api.getProject();
      this.adopt(stored.revision, stored.project);
      this.unsubs.push(
        await this.api.subscribeNetwork((state) => {
          this.network = state;
          this.emit();
        }),
        await this.api.subscribeProject((revision, project) => this.onRemoteProject(revision, project)),
      );
      this.ready = true;
      this.loadError = null;
    } catch (err) {
      this.loadError = isWsError(err) ? err.message : String(err);
      this.connecting = null;
    }
    this.emit();
  }

  private disconnect(): void {
    const unsubs = this.unsubs;
    this.unsubs = [];
    this.connecting = null;
    this.ready = false;
    for (const u of unsubs) u().catch(() => undefined);
  }

  private adopt(revision: number, raw: unknown): void {
    const project = normalizeProject(raw);
    this.revision = revision;
    this.history.reset(project);
    this.persisted = project;
    this.saveState = "idle";
  }

  private onRemoteProject(revision: number, raw: unknown): void {
    if (revision <= this.revision) return;
    if (this.dirty || this.saving) return; // our save will hit a conflict and reload
    this.adopt(revision, raw);
    this.notice({ kind: "remote_update" });
    this.emit();
  }

  /** Apply an edit. Each call is one undo step. */
  apply(fn: (p: Project) => Project): void {
    if (!this.canEdit) return;
    const next = fn(this.project);
    if (next === this.project) return;
    this.history.push(next);
    this.markDirty();
  }

  undo(): void {
    if (!this.canEdit || !this.history.canUndo) return;
    this.history.undo();
    this.markDirty();
  }

  redo(): void {
    if (!this.canEdit || !this.history.canRedo) return;
    this.history.redo();
    this.markDirty();
  }

  /** Replace the whole project (import). Undoable. */
  replace(raw: unknown): void {
    this.apply(() => normalizeProject(raw));
  }

  private markDirty(): void {
    this.saveState = this.dirty ? "dirty" : "saved";
    clearTimeout(this.saveTimer);
    if (this.dirty) this.saveTimer = setTimeout(() => void this.flush(), this.saveDelayMs);
    this.emit();
  }

  /** Persist now if there are unsaved changes. */
  async flush(): Promise<void> {
    clearTimeout(this.saveTimer);
    if (this.saving) {
      await this.saving;
      if (this.dirty) return this.flush();
      return;
    }
    if (!this.dirty) return;
    const snapshot = this.project;
    this.saveState = "saving";
    this.emit();
    this.saving = (async () => {
      try {
        this.revision = await this.api.saveProject(snapshot, this.revision);
        this.persisted = snapshot;
        this.saveState = this.dirty ? "dirty" : "saved";
      } catch (err) {
        if (isWsError(err) && err.code === "revision_conflict") {
          this.saveState = "conflict";
          const stored = await this.api.getProject();
          this.adopt(stored.revision, stored.project);
          this.notice({ kind: "conflict" });
        } else {
          this.saveState = "error";
          this.notice({ kind: "save_error", message: isWsError(err) ? err.message : String(err) });
        }
      } finally {
        this.saving = null;
        this.emit();
      }
    })();
    await this.saving;
    if (this.dirty && (this.saveState as SaveState) === "dirty") this.saveTimer = setTimeout(() => void this.flush(), this.saveDelayMs);
  }

  async scan(): Promise<void> {
    try {
      await this.api.scan();
    } catch (err) {
      this.notice({ kind: "scan_error", message: isWsError(err) ? err.message : String(err) });
    }
  }
}
