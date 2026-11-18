import type { RfRequest, RfResult } from "./engine";
import RfWorker from "./worker?worker&inline";

type Listener = (result: RfResult) => void;

/**
 * Runs RF computations off the main thread. Requests are coalesced: while one
 * computation runs, only the latest pending request is kept.
 */
export class RfClient {
  private worker: Worker | null = null;
  private seq = 0;
  private busy = false;
  private pending: RfRequest | null = null;
  private lastKey = "";
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly onResult: Listener,
    private readonly onError: (err: string) => void = (e) => console.warn("[zigbee-floorplan] RF", e),
    private readonly debounceMs = 150,
  ) {}

  request(req: RfRequest): void {
    const key = JSON.stringify(req);
    if (key === this.lastKey) return;
    this.lastKey = key;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.pending = req;
      this.pump();
    }, this.debounceMs);
  }

  /** Forget the last request so the next identical one recomputes. */
  invalidate(): void {
    this.lastKey = "";
  }

  dispose(): void {
    clearTimeout(this.timer);
    this.worker?.terminate();
    this.worker = null;
  }

  private ensureWorker(): Worker {
    if (!this.worker) {
      this.worker = new RfWorker();
      this.worker.onmessage = (ev: MessageEvent<{ id: number; result?: RfResult; error?: string }>) => {
        this.busy = false;
        if (ev.data.result) this.onResult(ev.data.result);
        else if (ev.data.error) this.onError(ev.data.error);
        this.pump();
      };
      this.worker.onerror = (ev) => {
        this.busy = false;
        this.onError(ev.message);
        this.pump();
      };
    }
    return this.worker;
  }

  private pump(): void {
    if (this.busy || !this.pending) return;
    const req = this.pending;
    this.pending = null;
    this.busy = true;
    this.ensureWorker().postMessage({ id: ++this.seq, req });
  }
}
