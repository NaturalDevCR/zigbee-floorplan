import { css, html, LitElement } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { icon, mdiAlertCircleOutline, mdiCheckCircleOutline, mdiClose } from "./icons";
import { controls, tokens } from "./styles";

interface Toast {
  id: number;
  message: string;
  kind: "info" | "error";
}

export class ZfpToast extends LitElement {
  static properties = { _items: { state: true } };
  declare _items: Toast[];
  private seq = 0;

  constructor() {
    super();
    this._items = [];
  }

  show(message: string, kind: Toast["kind"] = "info", ms = 4500): void {
    const id = ++this.seq;
    this._items = [...this._items.filter((t) => t.message !== message), { id, message, kind }].slice(-3);
    setTimeout(() => this.dismiss(id), ms);
  }

  private dismiss(id: number): void {
    this._items = this._items.filter((t) => t.id !== id);
  }

  protected render() {
    return html`<div class="stack" role="status" aria-live="polite">
      ${repeat(
        this._items,
        (t) => t.id,
        (t) => html`<div class="toast ${t.kind}">
          ${icon(t.kind === "error" ? mdiAlertCircleOutline : mdiCheckCircleOutline, 18)}
          <span>${t.message}</span>
          <button class="icon-btn" @click=${() => this.dismiss(t.id)} aria-label="close">${icon(mdiClose, 16)}</button>
        </div>`,
      )}
    </div>`;
  }

  static styles = [
    tokens,
    controls,
    css`
      .stack {
        position: absolute;
        left: 50%;
        bottom: 24px;
        transform: translateX(-50%);
        display: grid;
        gap: 8px;
        z-index: 20;
        width: max-content;
        max-width: calc(100% - 32px);
      }
      .toast {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 6px 6px 14px;
        border-radius: 14px;
        background: color-mix(in srgb, var(--zfp-text) 92%, var(--zfp-surface));
        color: var(--zfp-surface);
        font-size: 14px;
        box-shadow: var(--zfp-shadow-lg);
        animation: rise 0.22s var(--zfp-ease);
      }
      .toast.error .icon {
        color: #fca5a5;
      }
      .toast .icon-btn {
        color: inherit;
        width: 28px;
        height: 28px;
      }
      @keyframes rise {
        from {
          transform: translateY(12px);
          opacity: 0;
        }
      }
    `,
  ];
}

if (!customElements.get("zfp-toast")) customElements.define("zfp-toast", ZfpToast);
