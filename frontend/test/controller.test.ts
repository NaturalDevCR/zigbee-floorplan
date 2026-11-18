import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FloorplanController, type ApiLike } from "../src/data/controller";
import { addFloor } from "../src/project/ops";
import type { NetworkState } from "../src/types";

function fakeApi(opts: { admin?: boolean } = {}) {
  let revision = 0;
  let stored: unknown = { version: 1, floors: [], placements: {}, settings: {} };
  let networkCb: ((s: NetworkState | null) => void) | null = null;
  let projectCb: ((r: number, p: unknown) => void) | null = null;
  const api = {
    saves: 0,
    failNext: null as null | { code: string; message: string },
    info: vi.fn(async () => ({ version: "0.1.0", is_admin: opts.admin ?? true, base_topic: "z", loaded: true })),
    getProject: vi.fn(async () => ({ revision, project: stored })),
    saveProject: vi.fn(async (project: unknown, base: number) => {
      api.saves++;
      if (api.failNext) {
        const e = api.failNext;
        api.failNext = null;
        throw e;
      }
      if (base !== revision) throw { code: "revision_conflict", message: "conflict" };
      revision += 1;
      stored = project;
      return revision;
    }),
    subscribeNetwork: vi.fn(async (cb: (s: NetworkState | null) => void) => {
      networkCb = cb;
      return async () => undefined;
    }),
    subscribeProject: vi.fn(async (cb: (r: number, p: unknown) => void) => {
      projectCb = cb;
      return async () => undefined;
    }),
    scan: vi.fn(async () => undefined),
    remoteSave(project: unknown) {
      revision += 1;
      stored = project;
      projectCb?.(revision, project);
    },
    pushNetwork(s: NetworkState) {
      networkCb?.(s);
    },
  };
  return api;
}

async function ready(api: ReturnType<typeof fakeApi>) {
  const ctrl = new FloorplanController(api as unknown as ApiLike, 800);
  const listener = vi.fn();
  ctrl.attach(listener);
  await vi.waitFor(() => expect(ctrl.ready).toBe(true));
  return { ctrl, listener };
}

describe("FloorplanController", () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it("debounces saves into one request", async () => {
    const api = fakeApi();
    const { ctrl } = await ready(api);
    ctrl.apply((p) => addFloor(p, "A", "b").project);
    ctrl.apply((p) => addFloor(p, "B", "b").project);
    expect(ctrl.saveState).toBe("dirty");
    await vi.advanceTimersByTimeAsync(900);
    expect(api.saves).toBe(1);
    expect(ctrl.saveState).toBe("saved");
    expect(ctrl.revision).toBe(1);
  });

  it("undo back to persisted state needs no save", async () => {
    const api = fakeApi();
    const { ctrl } = await ready(api);
    ctrl.apply((p) => addFloor(p, "A", "b").project);
    ctrl.undo();
    expect(ctrl.dirty).toBe(false);
    await vi.advanceTimersByTimeAsync(900);
    expect(api.saves).toBe(0);
  });

  it("reloads on conflict and notifies", async () => {
    const api = fakeApi();
    const { ctrl } = await ready(api);
    const notices: string[] = [];
    ctrl.onNotice((n) => notices.push(n.kind));
    ctrl.apply((p) => addFloor(p, "Mine", "b").project);
    // another client saves while we have unsaved edits: ignored until our save
    api.remoteSave({ version: 1, floors: [{ id: "x", name: "Theirs", level: 0 }], placements: {}, settings: {} });
    expect(ctrl.project.floors[0].name).toBe("Mine");
    await vi.advanceTimersByTimeAsync(900);
    expect(notices).toContain("conflict");
    expect(ctrl.project.floors[0].name).toBe("Theirs");
    expect(ctrl.canUndo).toBe(false);
    expect(ctrl.revision).toBe(1);
  });

  it("adopts remote updates when clean", async () => {
    const api = fakeApi();
    const { ctrl, listener } = await ready(api);
    listener.mockClear();
    api.remoteSave({ version: 1, floors: [{ id: "x", name: "Remote", level: 0 }], placements: {}, settings: {} });
    expect(ctrl.project.floors[0].name).toBe("Remote");
    expect(listener).toHaveBeenCalled();
  });

  it("reports save errors", async () => {
    const api = fakeApi();
    const { ctrl } = await ready(api);
    const notices: string[] = [];
    ctrl.onNotice((n) => notices.push(n.kind));
    api.failNext = { code: "too_large", message: "big" };
    ctrl.apply((p) => addFloor(p, "A", "b").project);
    await vi.advanceTimersByTimeAsync(900);
    expect(ctrl.saveState).toBe("error");
    expect(notices).toEqual(["save_error"]);
  });

  it("read-only users cannot edit", async () => {
    const api = fakeApi({ admin: false });
    const { ctrl } = await ready(api);
    ctrl.apply((p) => addFloor(p, "A", "b").project);
    expect(ctrl.project.floors).toEqual([]);
  });

  it("forwards network state", async () => {
    const api = fakeApi();
    const { ctrl } = await ready(api);
    api.pushNetwork({ bridge_online: true, devices: [], links: [], scan: { status: "idle", last_scan: null, error: null } });
    expect(ctrl.network?.bridge_online).toBe(true);
  });
});
