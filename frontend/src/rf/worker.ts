import { runRf, type RfRequest } from "./engine";

self.onmessage = (ev: MessageEvent<{ id: number; req: RfRequest }>) => {
  const { id, req } = ev.data;
  try {
    const result = runRf(req);
    const transfer: Transferable[] = result.heats.flatMap((h) => [h.rgba.buffer, h.values.buffer]);
    (self as unknown as Worker).postMessage({ id, result }, transfer);
  } catch (err) {
    (self as unknown as Worker).postMessage({ id, error: String(err) });
  }
};
