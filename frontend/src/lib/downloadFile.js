// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

/**
 * Sandbox-aware file download helper.
 *
 * When the app runs INSIDE a sandboxed iframe (Emergent preview iframe with
 * `sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"`),
 * the spec dictates that popups initiated from the iframe inherit its sandbox
 * flags. Since `allow-downloads` is missing, ANY programmatic download attempt
 * — `<a download>`, `window.open(blob)`, `window.location.href = ...` — is
 * blocked with:
 *   "Download is disallowed. The frame initiating or instantiating the
 *    download is sandboxed, but the flag 'allow-downloads' is not set."
 *
 * The only reliable escape is a USER-INITIATED click on a regular link with
 * a modifier key (Cmd/Ctrl/middle-mouse) — the browser treats that as a
 * fresh navigation and does NOT inherit sandbox.
 *
 * Strategy:
 *  - Top-level (no iframe): native `<a download>` click — auto-download.
 *  - Iframe + viewable type (text/json/svg/xml): `window.open(blobUrl)` — the
 *    browser renders inline; user does Ctrl/Cmd+S manually.
 *  - Iframe + non-viewable type OR explicit URL: show a modal with the URL
 *    and instruct the user to open it with Cmd/Ctrl+Click (which escapes
 *    the sandbox by being a user gesture).
 *
 * The Object URL is kept alive ~5 min so the user has time to act.
 */
import { toast } from "sonner";
import translations from "@/i18n/translations";

const isInIframe = () => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

const VIEWABLE_RE = /^(text\/|application\/(json|xml|javascript|ld\+json)|image\/(?!vnd\.microsoft)|video\/|audio\/)/i;
const isViewable = (mime) => Boolean(mime) && VIEWABLE_RE.test(mime);

// ---------- Sandbox-aware modal ----------

const MODAL_ID = "__sandbox_download_modal";

const getT = () => {
  const lang = (typeof localStorage !== "undefined" && localStorage.getItem("app_lang")) || "es";
  return (key) => translations[lang]?.[key] || translations["es"]?.[key] || key;
};

const ensureStyles = () => {
  if (document.getElementById("__sandbox_download_styles")) return;
  const style = document.createElement("style");
  style.id = "__sandbox_download_styles";
  style.textContent = `
    .sdd-dl-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(4px); }
    .sdd-dl-card { background: #fff; border: 2px solid #18181b; max-width: 520px; width: 100%; box-shadow: 8px 8px 0 #2563eb; }
    .sdd-dl-head { background: #18181b; color: #fff; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; }
    .sdd-dl-head span { font: 700 11px/1 'IBM Plex Mono', monospace; letter-spacing: .2em; text-transform: uppercase; }
    .sdd-dl-head button { background: transparent; border: 0; color: #fff; cursor: pointer; padding: 4px; }
    .sdd-dl-body { padding: 20px; }
    .sdd-dl-body h2 { font: 900 22px/1.1 'Chivo', sans-serif; color: #18181b; margin: 0 0 8px; letter-spacing: -.02em; }
    .sdd-dl-body p { font: 400 13px/1.5 system-ui, sans-serif; color: #52525b; margin: 0 0 14px; }
    .sdd-dl-fname { font: 600 12px/1 'IBM Plex Mono', monospace; color: #2563eb; word-break: break-all; }
    .sdd-dl-link-row { display: flex; gap: 6px; margin: 14px 0 4px; }
    .sdd-dl-url { flex: 1; padding: 8px 10px; border: 2px solid #d4d4d8; font: 400 11px/1.4 monospace; color: #18181b; background: #fafafa; word-break: break-all; user-select: all; max-height: 80px; overflow: auto; }
    .sdd-dl-btn { padding: 8px 14px; border: 2px solid #18181b; background: #fff; cursor: pointer; font: 700 10px/1 'IBM Plex Mono', monospace; letter-spacing: .15em; text-transform: uppercase; color: #18181b; transition: all .15s; }
    .sdd-dl-btn:hover { background: #18181b; color: #fff; }
    .sdd-dl-btn-primary { background: #2563eb; border-color: #2563eb; color: #fff; }
    .sdd-dl-btn-primary:hover { background: #1d4ed8; border-color: #1d4ed8; }
    .sdd-dl-tip { background: #fefce8; border: 1px solid #fde047; padding: 10px 12px; margin-top: 14px; }
    .sdd-dl-tip p { margin: 0; font: 400 12px/1.4 system-ui, sans-serif; color: #713f12; }
    .sdd-dl-tip kbd { display: inline-block; padding: 2px 6px; background: #18181b; color: #fff; font-size: 10px; border-radius: 2px; margin: 0 2px; }
    .sdd-dl-foot { display: flex; gap: 8px; justify-content: flex-end; padding: 12px 18px; border-top: 1px solid #e4e4e7; background: #fafafa; }
  `;
  document.head.appendChild(style);
};

const closeModal = () => {
  const m = document.getElementById(MODAL_ID);
  if (m) m.remove();
};

const showSandboxModal = (url, filename) => {
  ensureStyles();
  closeModal();

  const overlay = document.createElement("div");
  overlay.id = MODAL_ID;
  overlay.className = "sdd-dl-overlay";
  overlay.setAttribute("data-testid", "sandbox-download-modal");
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });

  const card = document.createElement("div");
  card.className = "sdd-dl-card";

  const tt = getT();
  const msgParts = tt("download.sandboxMessage").split("{filename}");

  card.innerHTML = `
    <div class="sdd-dl-head">
      <span>${tt("download.readyTitle")}</span>
      <button data-testid="sandbox-download-close" aria-label="${tt("common.close")}">✕</button>
    </div>
    <div class="sdd-dl-body">
      <h2>${tt("download.fileReady")}</h2>
      <p>
        ${msgParts[0]}<span class="sdd-dl-fname">${filename}</span>${msgParts[1]}
      </p>
      <div class="sdd-dl-link-row">
        <div class="sdd-dl-url" data-testid="sandbox-download-url">${url}</div>
      </div>
      <a href="${url}" target="_blank" rel="noopener noreferrer" class="sdd-dl-btn sdd-dl-btn-primary" style="display:inline-block;text-decoration:none;margin-top:8px" data-testid="sandbox-download-link">${tt("download.openNewTab")}</a>
      <button class="sdd-dl-btn" data-testid="sandbox-download-copy" style="margin-top:8px;margin-left:6px">${tt("download.copyUrl")}</button>
      <div class="sdd-dl-tip">
        <p>${tt("download.tipTrick")}</p>
      </div>
    </div>
    <div class="sdd-dl-foot">
      <button class="sdd-dl-btn" data-testid="sandbox-download-done">${tt("common.close")}</button>
    </div>
  `;
  overlay.appendChild(card);
  document.body.appendChild(overlay);

  // Close handlers
  card.querySelector('[data-testid="sandbox-download-close"]').addEventListener("click", closeModal);
  card.querySelector('[data-testid="sandbox-download-done"]').addEventListener("click", closeModal);

  // Copy handler
  card.querySelector('[data-testid="sandbox-download-copy"]').addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("URL copiada al portapapeles");
    } catch {
      toast.error("No se pudo copiar (selecciona la URL manualmente)");
    }
  });

  // ESC to close
  const onKey = (e) => {
    if (e.key === "Escape") {
      closeModal();
      window.removeEventListener("keydown", onKey);
    }
  };
  window.addEventListener("keydown", onKey);
};

// ---------- Public API ----------

/** Download a Blob produced client-side (e.g. SVG from canvas, modified XML). */
export function downloadBlob(blob, filename) {
  const inIframe = isInIframe();
  const mime = blob.type || "application/octet-stream";
  const url = URL.createObjectURL(blob);

  if (!inIframe) {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return;
  }

  // Sandboxed iframe
  if (isViewable(mime)) {
    const win = window.open(url, "_blank");
    if (!win || win.closed || typeof win.closed === "undefined") {
      // Popup blocked → fall back to modal
      showSandboxModal(url, filename);
    } else {
      toast.info(
        `Archivo abierto en nueva pestana. Usa Ctrl/Cmd+S para guardarlo como "${filename}".`,
        { duration: 6000 },
      );
    }
  } else {
    // Non-viewable (zip, csv, pdf): blob URL inside sandbox is unusable for
    // download. Show modal with the blob URL — user clicks with modifier key
    // to escape sandbox.
    showSandboxModal(url, filename);
  }

  setTimeout(() => URL.revokeObjectURL(url), 5 * 60_000);
}

/**
 * Download a file by URL (already served by the backend with
 * Content-Disposition: attachment).
 *
 * In sandboxed iframes the new tab opened by the user's modifier-click does
 * NOT carry the Authorization header. To preserve auth, callers MUST include
 * a `session_token` query parameter or rely on cookie auth. This helper
 * automatically appends `session_token` from localStorage when missing.
 */
export function downloadFromUrl(url, filename) {
  let finalUrl = url;
  // Auto-append session_token for sandboxed contexts (cookie may not survive)
  try {
    const token = localStorage.getItem("session_token");
    if (token && !/[?&]session_token=/.test(url)) {
      const sep = url.includes("?") ? "&" : "?";
      finalUrl = `${url}${sep}session_token=${encodeURIComponent(token)}`;
    }
  } catch { /* ignore */ }

  if (!isInIframe()) {
    const a = document.createElement("a");
    a.href = finalUrl;
    a.download = filename;
    a.rel = "noopener";
    a.target = "_self";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }
  showSandboxModal(finalUrl, filename);
}

/** Download a string/text payload (text/plain by default). */
export function downloadText(content, filename, mime = "text/plain") {
  downloadBlob(new Blob([content], { type: mime }), filename);
}

/** Download a JSON payload (pretty-printed). */
export function downloadJson(data, filename) {
  downloadBlob(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    filename,
  );
}
