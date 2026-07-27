// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useMemo } from "react";
import { Eye, EyeOff, Target, ChevronDown, ChevronUp, RefreshCw, AlertTriangle } from "lucide-react";

const PRIORITIES = [
  { key: "must", label: "MUST", color: "bg-red-600", borderColor: "border-red-600", text: "Crítico — debe estar" },
  { key: "should", label: "SHOULD", color: "bg-amber-500", borderColor: "border-amber-500", text: "Importante — debería estar" },
  { key: "could", label: "COULD", color: "bg-sky-500", borderColor: "border-sky-500", text: "Deseable — podría estar" },
  { key: "wont", label: "WON'T", color: "bg-zinc-500", borderColor: "border-zinc-500", text: "Excluido — no esta vez" },
];

/**
 * Floating overlay shown over the BPMN canvas with:
 *  - MoSCoW legend
 *  - Toggle to show/hide markers
 *  - Coverage stats: total elements vs elements with linked requirements
 *
 * Props:
 *  - moscowElements: aggregates from /specs/element-links
 *  - totalElements: total count of "linkable" canvas elements (tasks, events, gateways…)
 *  - visible: boolean — markers shown or hidden
 *  - onToggle: () => void
 *  - onRefresh: () => void
 *  - collapsed: boolean — overlay collapsed
 *  - onToggleCollapsed: () => void
 */
const MoscowCanvasOverlay = ({
  moscowElements = {},
  totalElements = 0,
  visible = true,
  onToggle,
  onRefresh,
  collapsed = false,
  onToggleCollapsed,
  orphansCount = 0,
  onOrphansClick,
}) => {
  // Per-priority counts for coverage breakdown
  const counts = useMemo(() => {
    const out = { must: 0, should: 0, could: 0, wont: 0 };
    Object.values(moscowElements).forEach((info) => {
      const p = info.highest_moscow;
      if (out[p] !== undefined) out[p] += 1;
    });
    return out;
  }, [moscowElements]);

  const linkedCount = Object.keys(moscowElements).length;
  const coveragePct = totalElements > 0 ? Math.round((linkedCount / totalElements) * 100) : 0;
  const mustCoverage = totalElements > 0 ? Math.round((counts.must / totalElements) * 100) : 0;

  return (
    <div
      className="absolute top-4 right-4 z-20 bg-white border border-zinc-200 shadow-[4px_4px_0_0_rgba(0,0,0,0.08)] text-xs"
      style={{ width: collapsed ? "auto" : "260px", fontFamily: "'Chivo', sans-serif" }}
      data-testid="moscow-canvas-overlay"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200 bg-zinc-50">
        <div className="flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-zinc-700" />
          <span className="font-bold text-[11px] tracking-wide uppercase text-zinc-900">MoSCoW</span>
          {!collapsed && (
            <span
              className="text-[9px] text-zinc-500 font-mono tabular-nums px-1.5 py-0.5 bg-zinc-100 border border-zinc-200"
              data-testid="moscow-coverage-pct"
            >
              {coveragePct}%
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onToggle}
            data-testid="moscow-toggle-visibility"
            className="p-1 hover:bg-zinc-200 transition-colors"
            title={visible ? "Ocultar marcadores" : "Mostrar marcadores"}
          >
            {visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-zinc-400" />}
          </button>
          <button
            onClick={onRefresh}
            data-testid="moscow-refresh"
            className="p-1 hover:bg-zinc-200 transition-colors"
            title="Refrescar"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleCollapsed}
            data-testid="moscow-toggle-collapsed"
            className="p-1 hover:bg-zinc-200 transition-colors"
            title={collapsed ? "Expandir" : "Colapsar"}
          >
            {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Coverage block */}
          <div className="px-3 py-2 border-b border-zinc-200">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-[10px] uppercase tracking-wide text-zinc-500 font-mono">Cobertura</span>
              <span
                className="font-mono tabular-nums text-zinc-900 text-[11px]"
                data-testid="moscow-coverage-fraction"
              >
                {linkedCount} / {totalElements}
              </span>
            </div>
            <div className="h-1.5 bg-zinc-100 overflow-hidden">
              <div
                className={`h-full ${coveragePct >= 75 ? "bg-emerald-500" : coveragePct >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                style={{ width: `${coveragePct}%` }}
              />
            </div>
            {totalElements > 0 && (
              <div className="text-[10px] text-zinc-500 mt-1.5 leading-tight">
                {mustCoverage}% de elementos cubren un requirement <strong className="text-red-700">MUST</strong>.
              </div>
            )}
          </div>

          {/* Legend rows */}
          <div className="px-3 py-2 space-y-1.5">
            {PRIORITIES.map((p) => (
              <div
                key={p.key}
                className="flex items-center gap-2"
                data-testid={`moscow-legend-${p.key}`}
              >
                <div className={`w-2.5 h-2.5 ${p.color} flex-shrink-0`} />
                <span className="font-bold text-[11px] tracking-wide text-zinc-900 w-12">{p.label}</span>
                <span className="text-[10px] text-zinc-500 flex-1 truncate" title={p.text}>{p.text}</span>
                <span
                  className="font-mono tabular-nums text-[11px] text-zinc-700 ml-auto bg-zinc-50 border border-zinc-200 px-1.5 py-0.5"
                  data-testid={`moscow-count-${p.key}`}
                >
                  {counts[p.key]}
                </span>
              </div>
            ))}
          </div>
          {linkedCount === 0 && (
            <div className="px-3 py-2 text-[10px] text-zinc-500 italic border-t border-zinc-200 leading-snug">
              Aún no has enlazado requirements. Selecciona un elemento y abre el panel <strong>Requirements</strong>.
            </div>
          )}

          {orphansCount > 0 && (
            <button
              onClick={onOrphansClick}
              data-testid="moscow-orphans-alert"
              className="w-full px-3 py-2 border-t border-amber-300 bg-amber-50 hover:bg-amber-100 transition-colors flex items-center gap-2 text-left"
              title="Abrir panel de requirements huérfanos"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span className="text-[11px] font-bold text-amber-900 leading-tight flex-1">
                {orphansCount} requirement{orphansCount === 1 ? "" : "s"} huérfano{orphansCount === 1 ? "" : "s"}
              </span>
              <span className="text-[10px] text-amber-700 font-mono underline">Revisar</span>
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default MoscowCanvasOverlay;
