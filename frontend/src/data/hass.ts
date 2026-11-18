/** The subset of Home Assistant's frontend `hass` object this app relies on. */
export interface HassConnection {
  subscribeMessage<T>(callback: (msg: T) => void, msg: Record<string, unknown>): Promise<() => Promise<void>>;
}

export interface HomeAssistant {
  connection: HassConnection;
  callWS<T>(msg: Record<string, unknown>): Promise<T>;
  fetchWithAuth(path: string, init?: RequestInit): Promise<Response>;
  user?: { is_admin: boolean; name?: string };
  language?: string;
  locale?: { language: string };
  themes?: { darkMode?: boolean };
}

export interface WsError {
  code: string;
  message: string;
}

export const isWsError = (err: unknown): err is WsError =>
  !!err && typeof err === "object" && typeof (err as WsError).code === "string";
