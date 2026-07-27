// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { createContext, useCallback, useContext, useState } from "react";
import { Link } from "react-router-dom";
import { Crown, X, ArrowRight, Sparkles, Lock } from "lucide-react";

const UpgradeModalContext = createContext(null);

const TYPE_ICON = {
  projects: Lock,
  diagrams_per_project: Lock,
  diagrams: Lock,
  ai: Sparkles,
  default: Lock,
};

const TYPE_TITLES = {
  projects: "Limite de proyectos alcanzado",
  diagrams_per_project: "Limite de diagramas alcanzado",
  diagrams: "Limite de diagramas alcanzado",
  ai: "Limite de IA alcanzado",
};

export const UpgradeModalProvider = ({ children }) => {
  const [state, setState] = useState({ open: false, payload: null });

  const showUpgradeModal = useCallback((payload) => {
    setState({ open: true, payload: payload || null });
  }, []);

  const close = useCallback(() => setState({ open: false, payload: null }), []);

  /**
   * Inspect a fetch Response. If it is a 403 FREE_PLAN_LIMIT, show modal
   * and return true (caller should NOT continue normal error flow).
   */
  /**
   * Handle a 403 response. Accepts either a fetch Response, or a parsed body, or
   * a hint object { status, type, message }.
   * Returns true if the upgrade modal was shown.
   */
  const handleResponse = useCallback(
    async (responseOrData) => {
      let data = null;
      let status = null;

      if (responseOrData && typeof responseOrData === "object" && "status" in responseOrData && typeof responseOrData.json === "function") {
        // It's a Response
        status = responseOrData.status;
        if (status !== 403) return false;
        try {
          const cloned = responseOrData.clone();
          data = await cloned.json();
        } catch {
          try {
            data = await responseOrData.json();
          } catch {
            // body already consumed — fall through, we'll show modal anyway if hint provided
          }
        }
      } else {
        // Already-parsed payload { status, data, type, message }
        status = responseOrData && responseOrData.status;
        if (status && status !== 403) return false;
        data = (responseOrData && (responseOrData.data || responseOrData)) || null;
      }

      const detail = (data && (data.detail || data)) || null;
      // If we have explicit FREE_PLAN_LIMIT detail → show with full payload
      if (detail && detail.code === "FREE_PLAN_LIMIT") {
        showUpgradeModal(detail);
        return true;
      }
      // Fallback: caller provided a hint type (no body parsed)
      if (responseOrData && responseOrData.type && responseOrData.message) {
        showUpgradeModal({
          code: "FREE_PLAN_LIMIT",
          type: responseOrData.type,
          message: responseOrData.message,
          upgrade_url: responseOrData.upgrade_url || "/pricing#pro",
          limit: responseOrData.limit,
          current: responseOrData.current,
        });
        return true;
      }
      return false;
    },
    [showUpgradeModal]
  );

  const value = { showUpgradeModal, close, handleResponse };

  const payload = state.payload || {};
  const Icon = TYPE_ICON[payload.type] || TYPE_ICON.default;
  const title = TYPE_TITLES[payload.type] || "Limite del plan Free alcanzado";
  const message =
    payload.message ||
    "Has alcanzado el limite del plan Free. Sube a Pro para acceso ilimitado.";

  return (
    <UpgradeModalContext.Provider value={value}>
      {children}
      {state.open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          data-testid="upgrade-modal-overlay"
          onClick={close}
        >
          <div
            className="relative w-full max-w-lg bg-white border-2 border-zinc-900 shadow-[12px_12px_0_0_#2563eb] animate-in"
            onClick={(e) => e.stopPropagation()}
            data-testid="upgrade-modal"
          >
            <button
              onClick={close}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              data-testid="upgrade-modal-close"
              aria-label="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="p-6 pb-4 border-b-2 border-zinc-900 bg-gradient-to-br from-blue-50 to-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-600 flex items-center justify-center text-white">
                  <Icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <span
                  className="text-[10px] font-bold tracking-[0.25em] uppercase text-blue-600"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  Plan Free
                </span>
              </div>
              <h2
                className="text-2xl font-black text-zinc-900 tracking-tight uppercase leading-tight"
                style={{ fontFamily: "'Chivo', sans-serif" }}
              >
                {title}
              </h2>
            </div>

            {/* Body */}
            <div className="p-6">
              <p
                className="text-sm text-zinc-700 leading-relaxed mb-4"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                {message}
              </p>

              {payload.limit !== undefined && payload.current !== undefined && (
                <div
                  className="border-2 border-zinc-200 bg-zinc-50 p-3 mb-5 flex items-center justify-between"
                  data-testid="upgrade-modal-usage"
                >
                  <span
                    className="text-[10px] font-bold tracking-wider uppercase text-zinc-500"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    Uso actual
                  </span>
                  <span
                    className="text-sm font-black text-zinc-900"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {payload.current} / {payload.limit}
                  </span>
                </div>
              )}

              {/* Pro features bullets */}
              <ul className="space-y-2 mb-6">
                {[
                  "Proyectos ilimitados",
                  "Diagramas BPMN ilimitados",
                  "IA full (MiniMax + MiMo)",
                  "Requirements OpenSpec / Speckit completo",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2 text-sm text-zinc-700">
                    <Crown className="w-3.5 h-3.5 mt-0.5 text-blue-600 flex-shrink-0" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <div className="flex gap-2">
                <button
                  onClick={close}
                  className="flex-1 px-4 py-3 text-xs font-bold tracking-[0.15em] uppercase border-2 border-zinc-300 text-zinc-600 hover:border-zinc-900 hover:text-zinc-900 transition-colors"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  data-testid="upgrade-modal-dismiss"
                >
                  Mas tarde
                </button>
                <Link
                  to={payload.upgrade_url || "/pricing#pro"}
                  onClick={close}
                  className="flex-[2]"
                >
                  <button
                    className="w-full px-4 py-3 text-xs font-bold tracking-[0.15em] uppercase border-2 bg-blue-600 text-white border-blue-600 hover:bg-zinc-900 hover:border-zinc-900 transition-colors flex items-center justify-center gap-2"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    data-testid="upgrade-modal-cta"
                  >
                    Ver planes Pro
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </UpgradeModalContext.Provider>
  );
};

export const useUpgradeModal = () => {
  const ctx = useContext(UpgradeModalContext);
  if (!ctx) {
    // graceful fallback if provider not mounted
    return {
      showUpgradeModal: () => {},
      close: () => {},
      handleResponse: async () => false,
    };
  }
  return ctx;
};
