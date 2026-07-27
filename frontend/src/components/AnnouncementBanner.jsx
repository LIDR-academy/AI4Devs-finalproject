// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { API } from "@/App";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  X,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const SEV_META = {
  info: {
    accent: "border-blue-500",
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
    chip: "bg-blue-600 text-white",
    icon: Info,
    label: "INFO",
  },
  success: {
    accent: "border-emerald-500",
    bg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    chip: "bg-emerald-600 text-white",
    icon: CheckCircle2,
    label: "EXITO",
  },
  warning: {
    accent: "border-amber-500",
    bg: "bg-amber-50",
    iconColor: "text-amber-600",
    chip: "bg-amber-500 text-zinc-900",
    icon: AlertTriangle,
    label: "AVISO",
  },
  critical: {
    accent: "border-red-500",
    bg: "bg-red-50",
    iconColor: "text-red-600",
    chip: "bg-red-600 text-white",
    icon: AlertCircle,
    label: "CRITICO",
  },
};

function authHeaders() {
  const tk = localStorage.getItem("session_token") ||
    document.cookie.split("session_token=")[1]?.split(";")[0] || "";
  return tk ? { Authorization: `Bearer ${tk}` } : {};
}

function getLocalDismissed() {
  try {
    return JSON.parse(sessionStorage.getItem("__ann_dismissed_anon") || "{}");
  } catch { return {}; }
}
function setLocalDismissed(map) {
  try { sessionStorage.setItem("__ann_dismissed_anon", JSON.stringify(map)); } catch { /* noop */ }
}

export default function AnnouncementBanner() {
  const [items, setItems] = useState([]);
  const [hiddenIds, setHiddenIds] = useState(() => new Set(Object.keys(getLocalDismissed())));
  const [index, setIndex] = useState(0);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`${API}/announcements/active`, { headers: authHeaders() });
      if (!r.ok) return;
      const d = await r.json();
      setItems(d.items || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  const visible = items.filter(it => !hiddenIds.has(it.id));
  const current = visible[index] || visible[0] || null;

  const close = useCallback(async (ann) => {
    if (!ann) return;
    setHiddenIds(prev => {
      const next = new Set(prev);
      next.add(ann.id);
      return next;
    });
    setIndex(0);

    const tk = authHeaders().Authorization;
    if (tk) {
      try {
        await fetch(`${API}/announcements/${ann.id}/dismiss`, {
          method: "POST",
          headers: authHeaders(),
        });
      } catch { /* ignore */ }
    } else {
      const map = getLocalDismissed();
      map[ann.id] = ann.version || 1;
      setLocalDismissed(map);
    }
  }, []);

  // ESC to close
  useEffect(() => {
    if (!current) return;
    const onKey = (e) => {
      if (e.key === "Escape" && current.dismissible) close(current);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, close]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (current) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [current]);

  if (!current) return null;

  const meta = SEV_META[current.severity] || SEV_META.info;
  const Icon = meta.icon;
  const total = visible.length;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
      data-testid="announcement-banner-root"
      onClick={(e) => {
        if (e.target === e.currentTarget && current.dismissible) close(current);
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-deep-navy/60 backdrop-blur-sm" aria-hidden="true" />

      {/* Modal card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-title"
        className={`relative w-full max-w-lg bg-white border-2 ${meta.accent} shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-200`}
        data-testid={`announcement-${current.id}`}
      >
        {/* Top bar with severity + close */}
        <div className={`${meta.bg} px-5 py-3 border-b-2 ${meta.accent} flex items-center justify-between`}>
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${meta.iconColor}`} />
            <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 ${meta.chip}`}>{meta.label}</span>
            {total > 1 && (
              <span className="text-[10px] text-zinc-500 ml-2">{index + 1} / {total}</span>
            )}
          </div>
          {current.dismissible && (
            <button
              type="button"
              onClick={() => close(current)}
              className="w-7 h-7 flex items-center justify-center hover:bg-white/60 transition-colors"
              aria-label="Cerrar"
              data-testid={`announcement-dismiss-${current.id}`}
            >
              <X className="w-4 h-4 text-zinc-700" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-3">
          <h2
            id="announcement-title"
            className="text-xl font-bold text-zinc-900 tracking-tight leading-tight"
            style={{ fontFamily: "'Chivo', sans-serif" }}
          >
            {current.title}
          </h2>
          <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line">
            {current.body}
          </p>
        </div>

        {/* Footer with CTA + close + (multi) navigation */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between gap-3 flex-wrap">
          {total > 1 ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIndex(Math.max(0, index - 1))}
                disabled={index === 0}
                className="w-8 h-8 flex items-center justify-center border border-zinc-300 hover:border-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIndex(Math.min(total - 1, index + 1))}
                disabled={index >= total - 1}
                className="w-8 h-8 flex items-center justify-center border border-zinc-300 hover:border-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : <div />}

          <div className="flex items-center gap-2">
            {current.cta_label && current.cta_url && (
              <Link
                to={current.cta_url}
                onClick={() => current.dismissible && close(current)}
                className="px-4 h-9 inline-flex items-center gap-1.5 text-xs font-bold border border-zinc-200 hover:bg-deep-navy hover:text-white transition-colors"
                data-testid={`announcement-cta-${current.id}`}
              >
                {current.cta_label}
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
            {current.dismissible && (
              <button
                type="button"
                onClick={() => close(current)}
                className="px-5 h-9 text-xs font-bold bg-deep-navy text-white hover:bg-zinc-800 transition-colors"
                data-testid={`announcement-ack-${current.id}`}
              >
                Entendido
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
