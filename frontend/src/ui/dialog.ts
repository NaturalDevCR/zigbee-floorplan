import { css, html, LitElement, nothing } from "lit";
import { controls, tokens } from "./styles";

interface DialogRequest {
  title: string;
  message?: string;
  input?: { label: string; value: string; type: "text" | "number"; min?: number; step?: number };
  confirmText: string;
  cancelText: string;
  danger?: boolean;
  resolve: (value: string | null) => void;
}

/** Promise-based modal built on the native <dialog> element. */
export class ZfpDialog extends LitElement {
  static properties = { _req: { state: true } };
  declare _req: DialogRequest | null;

  constructor() {
    super();
    this._req = null;
  }

  confirm(opts: { title: string; message: string; confirmText: string; cancelText: string; danger?: boolean }): Promise<boolean> {
    return this.open({ ...opts }).then((v) => v !== null);
  }

  prompt(opts: {
    title: string;
    label: string;
    value?: string;
    type?: "text" | "number";
    min?: number;
    step?: number;
    confirmText: string;
    cancelText: string;
  }): Promise<string | null> {
    return this.open({
      title: opts.title,
      confirmText: opts.confirmText,
      cancelText: opts.cancelText,
      input: { label: opts.label, value: opts.value ?? "", type: opts.type ?? "text", min: opts.min, step: opts.step },
    });
  }

  private open(req: Omit<DialogRequest, "resolve">): Promise<string | null> {
    this._req?.resolve(null);
    return new Promise((resolve) => {
      this._req = { ...req, resolve };
      this.updateComplete.then(() => {
        const dlg = this.renderRoot.querySelector("dialog");
        dlg?.showModal();
        const input = this.renderRoot.querySelector("input");
        input?.focus();
        input?.select();
      });
    });
  }

  private finish(ok: boolean): void {
    const req = this._req;
    if (!req) return;
    let value: string | null = ok ? "" : null;
    if (ok && req.input) {
      const input = this.renderRoot.querySelector("input")!;
      if (!input.reportValidity()) return;
      value = input.value;
    }
    this.renderRoot.querySelector("dialog")?.close();
    this._req = null;
    req.resolve(value);
  }

  protected render() {
    const r = this._req;
    if (!r) return nothing;
    return html`<dialog
      @cancel=${(e: Event) => {
        e.preventDefault();
        this.finish(false);
      }}
      @click=${(e: MouseEvent) => {
        if (e.target === e.currentTarget) this.finish(false);
      }}
    >
      <form
        method="dialog"
        @submit=${(e: Event) => {
          e.preventDefault();
          this.finish(true);
        }}
      >
        <h2>${r.title}</h2>
        ${r.message ? html`<p>${r.message}</p>` : nothing}
        ${r.input
          ? html`<label class="field"
              ><span>${r.input.label}</span>
              <input
                .type=${r.input.type}
                .value=${r.input.value}
                min=${r.input.min ?? nothing}
                step=${r.input.step ?? "any"}
                required
            /></label>`
          : nothing}
        <div class="actions">
          <button type="button" class="btn" @click=${() => this.finish(false)}>${r.cancelText}</button>
          <button type="submit" class="btn primary ${r.danger ? "danger-fill" : ""}">${r.confirmText}</button>
        </div>
      </form>
    </dialog>`;
  }

  static styles = [
    tokens,
    controls,
    css`
      dialog {
        border: none;
        border-radius: 20px;
        padding: 0;
        width: min(420px, calc(100vw - 32px));
        background: var(--zfp-surface);
        color: var(--zfp-text);
        box-shadow: var(--zfp-shadow-lg);
      }
      dialog[open] {
        animation: pop 0.18s var(--zfp-ease);
      }
      dialog::backdrop {
        background: rgba(0, 0, 0, 0.35);
        backdrop-filter: blur(2px);
      }
      @keyframes pop {
        from {
          transform: scale(0.96);
          opacity: 0;
        }
      }
      form {
        padding: 24px;
        display: grid;
        gap: 16px;
      }
      h2 {
        margin: 0;
        font-size: 20px;
        font-weight: 500;
      }
      p {
        margin: 0;
        color: var(--zfp-text-2);
        line-height: 1.5;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 4px;
      }
      .danger-fill {
        background: var(--zfp-error);
      }
    `,
  ];
}

if (!customElements.get("zfp-dialog")) customElements.define("zfp-dialog", ZfpDialog);
