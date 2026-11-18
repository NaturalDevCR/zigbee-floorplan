import type { NetworkState, Project } from "../types";
import type { HomeAssistant } from "./hass";

export interface InfoResult {
  version: string;
  is_admin: boolean;
  base_topic: string | null;
  loaded: boolean;
  frontend_hash?: string | null;
}

export interface StoredProject {
  revision: number;
  project: unknown;
}

type NetworkEvent = { kind: "network"; state: NetworkState | null };
type ProjectEvent = { kind: "project"; revision: number; project: unknown };

const PREFIX = "zigbee_floorplan";
export const MAX_IMAGE_DIM = 4096;

export class FloorplanApi {
  private readonly blobUrls = new Map<string, Promise<string>>();

  constructor(private readonly hass: () => HomeAssistant) {}

  info(): Promise<InfoResult> {
    return this.hass().callWS({ type: `${PREFIX}/info` });
  }

  getProject(): Promise<StoredProject> {
    return this.hass().callWS({ type: `${PREFIX}/project/get` });
  }

  async saveProject(project: Project, baseRevision: number): Promise<number> {
    const res = await this.hass().callWS<{ revision: number }>({
      type: `${PREFIX}/project/save`,
      project,
      base_revision: baseRevision,
    });
    return res.revision;
  }

  subscribeNetwork(cb: (state: NetworkState | null) => void): Promise<() => Promise<void>> {
    return this.hass().connection.subscribeMessage<NetworkEvent>((ev) => cb(ev.state), {
      type: `${PREFIX}/network/subscribe`,
    });
  }

  subscribeProject(cb: (revision: number, project: unknown) => void): Promise<() => Promise<void>> {
    return this.hass().connection.subscribeMessage<ProjectEvent>((ev) => cb(ev.revision, ev.project), {
      type: `${PREFIX}/project/subscribe`,
    });
  }

  scan(): Promise<void> {
    return this.hass().callWS({ type: `${PREFIX}/network/scan` });
  }

  deleteImage(imageId: string): Promise<{ deleted: boolean }> {
    this.blobUrls.delete(imageId);
    return this.hass().callWS({ type: `${PREFIX}/image/delete`, image_id: imageId });
  }

  async uploadImage(blob: Blob, filename: string): Promise<string> {
    const body = new FormData();
    body.append("file", blob, filename);
    const resp = await this.hass().fetchWithAuth(`/api/${PREFIX}/images`, { method: "POST", body });
    if (!resp.ok) {
      let message = `${resp.status}`;
      try {
        message = (await resp.json()).message ?? message;
      } catch {
        /* non-JSON error body */
      }
      throw new Error(message);
    }
    return (await resp.json()).id;
  }

  /** Authenticated image → object URL (cached for the page lifetime). */
  imageUrl(imageId: string): Promise<string> {
    let url = this.blobUrls.get(imageId);
    if (!url) {
      url = this.hass()
        .fetchWithAuth(`/api/${PREFIX}/images/${imageId}`)
        .then(async (resp) => {
          if (!resp.ok) throw new Error(`${resp.status}`);
          return URL.createObjectURL(await resp.blob());
        });
      url.catch(() => this.blobUrls.delete(imageId));
      this.blobUrls.set(imageId, url);
    }
    return url;
  }
}

/** Decode an image file, downscaling very large ones before upload. */
export async function prepareImage(file: File): Promise<{ blob: Blob; width: number; height: number; name: string }> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const factor = Math.min(1, MAX_IMAGE_DIM / Math.max(width, height));
  const supported = ["image/png", "image/jpeg", "image/webp"].includes(file.type);
  if (factor === 1 && supported) {
    bitmap.close();
    return { blob: file, width, height, name: file.name };
  }
  const w = Math.round(width * factor);
  const h = Math.round(height * factor);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/png"),
  );
  return { blob, width: w, height: h, name: file.name.replace(/\.[^.]+$/, "") + ".png" };
}
