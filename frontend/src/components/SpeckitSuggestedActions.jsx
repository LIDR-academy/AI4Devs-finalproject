// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useEffect, useState, useCallback } from "react";
import { Lightbulb, AlertTriangle, Sparkles, Loader2, X, ChevronRight } from "lucide-react";
import { API } from "@/App";

const authHeaders = () => {
  const t = localStorage.getItem("session_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const severityStyles = {
  high: { bar: "bg-red-500", text: "text-red-700", chip: "bg-red-50 border-red-300 text-red-800" },
  medium: { bar: "bg-amber-500", text: "text-amber-700", chip: "bg-amber-50 border-amber-300 text-amber-800" },
  low: { bar: "bg-zinc-400", text: "text-zinc-600", chip: "bg-zinc-50 border-zinc-300 text-zinc-700" },
};

/**
 * Banner contextual con acciones sugeridas para mejorar la calidad del Speckit:
 *   - MUST sin diagrama BPMN enlazado (severity=high)
 *   - FR sin criterios de aceptacion (severity=medium, action: generar con DeepSeek)
 *   - Requirement sin Accountable RACI (severity=medium)
 *   - SHOULD/COULD con descripcion larga → revisar prioridad (severity=low)
 *
 * Props:
 *   specId: string
 *   onActionDone: () => void  // call to reload the parent spec
 *   onLinkDiagram: (requirementId) => void  // open the link-diagram dialog for that req
 */
export const SpeckitSuggestedActions = ({ specId, onActionDone, onLinkDiagram }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/specs/specifications/${specId}/suggested-actions`, {
        headers: authHeaders(), credentials: "include",
      });
      if (r.ok) setData(await r.json());
    } finally {
      setLoading(false);
    }
  }, [specId]);

  useEffect(() => { reload(); }, [reload]);

  const generateCriteria = async (action) => {
    const key = `crit-${action.requirement_id}`;
    setBusyAction(key);
    try {
      const r = await fetch(`${API}/specs/requirements/${action.requirement_id}/generate-criteria`, {
        method: "POST",
        headers: authHeaders(),
        credentials: "include",
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        alert(`Error: ${err.detail || "no se pudo generar"}`);
        return;
      }
      await reload();
      onActionDone?.();
    } finally {
      setBusyAction(null);
    }
  };

  if (loading || !data) return null;
  if (data.summary.total === 0) return null;

  const { summary, actions } = data;

  return (
    <div className="mb-4 border border-zinc-200 bg-white" data-testid="speckit-suggested-actions">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="w-full px-4 py-3 flex items-center justify-between bg-deep-navy text-white hover:bg-zinc-800 transition-colors"
        data-testid="suggested-actions-header"
      >
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-400" strokeWidth={2.5} />
          <span
            className="text-[11px] font-bold tracking-[0.15em] uppercase"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            Acciones sugeridas · {summary.total}
          </span>
          {summary.high > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-500 text-white tracking-wide" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {summary.high} criticas
            </span>
          )}
          {summary.medium > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-400 text-zinc-900 tracking-wide" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {summary.medium} medias
            </span>
          )}
        </div>
        <ChevronRight className={`w-4 h-4 transition-transform ${collapsed ? "" : "rotate-90"}`} />
      </button>

      {!collapsed && (
        <ul className="divide-y divide-zinc-200">
          {actions.map((action, idx) => {
            const styles = severityStyles[action.severity] || severityStyles.low;
            const busyKey = action.kind === "generate_criteria" ? `crit-${action.requirement_id}` : null;
            const isBusy = busyKey && busyAction === busyKey;
            return (
              <li
                key={`${action.kind}-${action.requirement_id}-${idx}`}
                className="px-4 py-3 flex items-start gap-3 hover:bg-zinc-50"
                data-testid={`action-${action.kind}-${action.requirement_code}`}
              >
                <div className={`w-1 self-stretch ${styles.bar}`} aria-hidden />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`inline-block px-1.5 py-0.5 text-[9px] font-bold tracking-wider border ${styles.chip}`}
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      {action.severity.toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-zinc-900">{action.title}</span>
                  </div>
                  <p className="text-xs text-zinc-600">{action.description}</p>
                </div>
                <div className="flex-shrink-0">
                  {action.kind === "generate_criteria" && (
                    <button
                      onClick={() => generateCriteria(action)}
                      disabled={isBusy}
                      className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 flex items-center gap-1.5"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      data-testid={`act-generate-criteria-${action.requirement_code}`}
                    >
                      {isBusy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                      {isBusy ? "Generando..." : action.cta}
                    </button>
                  )}
                  {action.kind === "link_diagram" && onLinkDiagram && (
                    <button
                      onClick={() => onLinkDiagram(action.requirement_id)}
                      className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 bg-deep-navy text-white hover:bg-zinc-800 flex items-center gap-1.5"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      data-testid={`act-link-diagram-${action.requirement_code}`}
                    >
                      <Lightbulb className="w-3 h-3" />
                      {action.cta}
                    </button>
                  )}
                  {(action.kind === "assign_accountable" || action.kind === "review_priority") && (
                    <span
                      className="text-[10px] uppercase tracking-wider text-zinc-400 px-3 py-1.5 inline-flex items-center gap-1"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      title="Edita el requirement para resolver"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      Editar manualmente
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SpeckitSuggestedActions;
