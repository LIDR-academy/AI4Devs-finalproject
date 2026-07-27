// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { API } from "@/App";
import { toast } from "sonner";
import {
  LifeBuoy,
  X,
  Loader2,
  Send,
  ImageIcon,
  AlertTriangle,
  Bug,
  Lightbulb,
  HelpCircle,
  Paperclip,
  Camera,
  RotateCcw,
} from "lucide-react";

const authHeaders = () => {
  const t = localStorage.getItem("session_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const SEVERITY = [
  { value: "low", label: "Baja", c: "text-emerald-700 border-emerald-300 bg-emerald-50" },
  { value: "medium", label: "Media", c: "text-amber-700 border-amber-300 bg-amber-50" },
  { value: "high", label: "Alta", c: "text-orange-700 border-orange-300 bg-orange-50" },
  { value: "critical", label: "Critica", c: "text-red-700 border-red-300 bg-red-50" },
];

const CATEGORY = [
  { value: "bug", label: "Bug", icon: <Bug className="w-3.5 h-3.5" strokeWidth={2.5} /> },
  { value: "improvement", label: "Mejora", icon: <Lightbulb className="w-3.5 h-3.5" strokeWidth={2.5} /> },
  { value: "question", label: "Pregunta", icon: <HelpCircle className="w-3.5 h-3.5" strokeWidth={2.5} /> },
];

const SCREENSHOT_MAX_MB = 2;

/**
 * Floating bug-report button. Fixed to bottom-right corner of the viewport.
 * Only visible when user is authenticated (checked via localStorage session_token).
 */
const IssueReporter = () => {
  const hasSession = typeof window !== "undefined" && !!localStorage.getItem("session_token");
  const [open, setOpen] = useState(false);
  const [autoCapturing, setAutoCapturing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [category, setCategory] = useState("bug");
  const [screenshot, setScreenshot] = useState(null); // data URL
  const [screenshotName, setScreenshotName] = useState("");
  const [screenshotAuto, setScreenshotAuto] = useState(false); // true if captured by html2canvas
  const [sending, setSending] = useState(false);
  const fileRef = useRef(null);

  if (!hasSession) return null;

  const reset = () => {
    setTitle("");
    setDescription("");
    setSeverity("medium");
    setCategory("bug");
    setScreenshot(null);
    setScreenshotName("");
    setScreenshotAuto(false);
  };

  const closeAndReset = () => {
    setOpen(false);
    reset();
  };

  /**
   * Capture the current viewport via html2canvas.
   * Compresses to JPEG @ 0.7 quality and downscales if needed to keep payload
   * under the 2MB server cap. Returns data URL or null on failure.
   */
  const captureViewport = async () => {
    try {
      const canvas = await html2canvas(document.body, {
        backgroundColor: "#ffffff",
        scale: window.devicePixelRatio > 1 ? 1 : 1, // do not double-scale
        windowWidth: document.documentElement.clientWidth,
        windowHeight: document.documentElement.clientHeight,
        x: window.scrollX,
        y: window.scrollY,
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight,
        useCORS: true,
        logging: false,
        ignoreElements: (el) => el.dataset?.testid === "issue-reporter-fab",
      });
      // Downscale if width > 1600 to keep payload small
      const maxW = 1600;
      let out = canvas;
      if (canvas.width > maxW) {
        const ratio = maxW / canvas.width;
        const small = document.createElement("canvas");
        small.width = maxW;
        small.height = Math.round(canvas.height * ratio);
        const ctx = small.getContext("2d");
        ctx.drawImage(canvas, 0, 0, small.width, small.height);
        out = small;
      }
      let dataUrl = out.toDataURL("image/jpeg", 0.7);
      // If still too large, try lower quality
      if (dataUrl.length > 2.6 * 1024 * 1024) {
        dataUrl = out.toDataURL("image/jpeg", 0.5);
      }
      return dataUrl;
    } catch (e) {
      console.warn("auto-screenshot failed", e);
      return null;
    }
  };

  /** Open dialog and capture viewport BEFORE the modal appears. */
  const openWithCapture = async () => {
    setAutoCapturing(true);
    const data = await captureViewport();
    setAutoCapturing(false);
    if (data) {
      setScreenshot(data);
      setScreenshotName("captura-automatica.jpg");
      setScreenshotAuto(true);
    }
    setOpen(true);
  };

  /** Re-capture (e.g. user navigated and wants to refresh the screenshot). */
  const reCapture = async () => {
    // Hide dialog briefly so we don't capture it
    setOpen(false);
    await new Promise((r) => setTimeout(r, 250));
    setAutoCapturing(true);
    const data = await captureViewport();
    setAutoCapturing(false);
    if (data) {
      setScreenshot(data);
      setScreenshotName("captura-automatica.jpg");
      setScreenshotAuto(true);
    }
    setOpen(true);
  };

  const onPickFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se aceptan imagenes");
      return;
    }
    if (file.size > SCREENSHOT_MAX_MB * 1024 * 1024) {
      toast.error(`Imagen demasiado grande (max ${SCREENSHOT_MAX_MB}MB)`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshot(reader.result);
      setScreenshotName(file.name);
      setScreenshotAuto(false);
    };
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Titulo y descripcion obligatorios");
      return;
    }
    setSending(true);
    try {
      const body = {
        title: title.trim(),
        description: description.trim(),
        severity,
        category,
        page_url: window.location.href,
        screenshot,
      };
      const r = await fetch(`${API}/issues`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        const detail =
          err?.detail?.errors?.join("; ") ||
          (typeof err?.detail === "string" ? err.detail : null) ||
          "No se pudo enviar";
        toast.error(`Error: ${detail}`);
        return;
      }
      toast.success("Incidencia reportada — el equipo la revisara");
      closeAndReset();
    } catch {
      toast.error("Error de red");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating launcher */}
      {!open && (
        <button
          onClick={openWithCapture}
          disabled={autoCapturing}
          data-testid="issue-reporter-fab"
          aria-label="Reportar incidencia"
          className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 px-4 py-3 bg-deep-navy hover:bg-blue-600 text-white border border-zinc-200 shadow-[4px_4px_0_rgba(37,99,235,0.9)] hover:shadow-[6px_6px_0_rgba(37,99,235,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all disabled:opacity-80 disabled:cursor-wait"
        >
          {autoCapturing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LifeBuoy className="w-4 h-4" strokeWidth={2.5} />
          )}
          <span
            className="text-[11px] font-bold tracking-[0.15em] uppercase"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {autoCapturing ? "Capturando..." : "Reportar"}
          </span>
        </button>
      )}

      {/* Dialog */}
      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && closeAndReset()}
          data-testid="issue-reporter-dialog"
        >
          <div className="bg-white border border-zinc-200 w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-[8px_8px_0_rgba(37,99,235,1)]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 bg-deep-navy text-white">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-4 h-4" strokeWidth={2.5} />
                <span
                  className="text-[11px] font-bold tracking-[0.2em] uppercase"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  Reportar incidencia
                </span>
              </div>
              <button
                onClick={closeAndReset}
                className="p-1 hover:bg-white/10"
                data-testid="issue-reporter-close"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div>
                <label
                  className="block text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-500 mb-1.5"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  Titulo *
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: No puedo guardar diagrama"
                  maxLength={140}
                  className="w-full border border-zinc-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                  data-testid="issue-title-input"
                />
              </div>

              <div>
                <label
                  className="block text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-500 mb-1.5"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  Descripcion *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Pasos para reproducir, comportamiento esperado vs actual..."
                  maxLength={4000}
                  className="w-full border border-zinc-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none resize-none"
                  data-testid="issue-desc-input"
                />
              </div>

              {/* Category pills */}
              <div>
                <label
                  className="block text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-500 mb-1.5"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  Categoria
                </label>
                <div className="flex gap-2">
                  {CATEGORY.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setCategory(c.value)}
                      data-testid={`issue-cat-${c.value}`}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border-2 transition-colors ${
                        category === c.value
                          ? "border-zinc-900 bg-deep-navy text-white"
                          : "border-zinc-300 text-zinc-700 hover:border-zinc-900"
                      }`}
                    >
                      {c.icon}
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Severity */}
              <div>
                <label
                  className="block text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-500 mb-1.5"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  Severidad
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {SEVERITY.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSeverity(s.value)}
                      data-testid={`issue-sev-${s.value}`}
                      className={`px-2 py-2 text-[11px] font-bold uppercase tracking-wider border-2 transition-colors ${
                        severity === s.value ? s.c : "border-zinc-200 text-zinc-500 hover:border-zinc-400"
                      }`}
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Screenshot */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    className="block text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-500"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    Captura del viewport (auto · max {SCREENSHOT_MAX_MB}MB)
                  </label>
                  {screenshot && (
                    <button
                      onClick={reCapture}
                      className="flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase text-blue-600 hover:text-blue-800"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      data-testid="issue-screenshot-recapture"
                      title="Re-capturar el viewport (cierra y reabre el dialogo)"
                    >
                      <RotateCcw className="w-3 h-3" strokeWidth={2.5} />
                      Recapturar
                    </button>
                  )}
                </div>
                {!screenshot ? (
                  <button
                    onClick={() => fileRef.current?.click()}
                    data-testid="issue-screenshot-btn"
                    className="w-full flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed border-zinc-300 text-zinc-500 hover:border-zinc-900 hover:text-zinc-900 transition-colors"
                  >
                    <Paperclip className="w-4 h-4" strokeWidth={2.5} />
                    <span className="text-xs font-medium">Adjuntar manualmente (auto-captura fallo)</span>
                  </button>
                ) : (
                  <div className="border border-zinc-200 p-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {screenshotAuto ? (
                          <Camera className="w-4 h-4 text-blue-600 flex-shrink-0" strokeWidth={2.5} />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-zinc-600 flex-shrink-0" strokeWidth={2.5} />
                        )}
                        <span className="text-xs text-zinc-700 truncate">{screenshotName}</span>
                        {screenshotAuto && (
                          <span
                            className="ml-1 text-[9px] font-bold tracking-wider uppercase text-blue-700 bg-blue-50 border border-blue-300 px-1 py-0.5 flex-shrink-0"
                            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                          >
                            AUTO
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => fileRef.current?.click()}
                          className="text-[10px] tracking-wider uppercase font-bold text-zinc-500 hover:text-zinc-900"
                          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                          data-testid="issue-screenshot-replace"
                        >
                          Reemplazar
                        </button>
                        <button
                          onClick={() => {
                            setScreenshot(null);
                            setScreenshotName("");
                            setScreenshotAuto(false);
                            if (fileRef.current) fileRef.current.value = "";
                          }}
                          className="text-xs text-red-600 hover:text-red-800 font-bold"
                          data-testid="issue-screenshot-remove"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                    <img
                      src={screenshot}
                      alt="preview"
                      className="w-full max-h-48 object-contain bg-zinc-50 border border-zinc-200"
                    />
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onPickFile}
                  className="hidden"
                  data-testid="issue-screenshot-input"
                />
              </div>

              {/* URL footer (informational) */}
              <div className="flex items-start gap-2 text-[11px] text-zinc-500 border-t border-zinc-200 pt-3">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
                <span>
                  Se enviara la URL actual automaticamente:{" "}
                  <span className="font-mono text-zinc-700 break-all">{typeof window !== "undefined" ? window.location.pathname : ""}</span>
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end gap-2">
              <button
                onClick={closeAndReset}
                className="px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-200"
                data-testid="issue-cancel-btn"
              >
                Cancelar
              </button>
              <button
                onClick={submit}
                disabled={sending || !title.trim() || !description.trim()}
                data-testid="issue-submit-btn"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold tracking-[0.15em] uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" strokeWidth={2.5} />}
                {sending ? "Enviando..." : "Enviar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default IssueReporter;
