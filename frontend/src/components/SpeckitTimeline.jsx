// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React from "react";
import { CheckCircle2, Loader2, Circle, AlertTriangle } from "lucide-react";

// Backend phases:  queued → planning → generating → post_processing → complete  (or → failed)
const PHASES = [
  { key: "planning", label: "Plan interno", desc: "Construyendo prompt + razonamiento" },
  { key: "generating", label: "Generando", desc: "DeepSeek razonando 9 secciones" },
  { key: "post_processing", label: "Validando", desc: "Mermaid + envoltorios" },
  { key: "complete", label: "Completado", desc: "Speckit listo" },
];

const orderIndex = (phase) => {
  if (!phase) return -1;
  if (phase === "queued") return 0;
  const idx = PHASES.findIndex(p => p.key === phase);
  return idx;
};

export const SpeckitTimeline = ({ phase, status, model, error }) => {
  const isFailed = status === "failed" || phase === "failed";
  const currentIdx = isFailed ? -2 : orderIndex(phase);

  return (
    <div className="mb-4 border border-zinc-200 bg-white p-4" data-testid="speckit-timeline">
      <div className="flex items-center justify-between mb-3">
        <span
          className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-900"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          Generacion en curso · {model || "DeepSeek V4"}
        </span>
        {isFailed && (
          <span className="text-[10px] font-bold uppercase text-red-600 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Fallo
          </span>
        )}
      </div>

      {/* Timeline */}
      <ol className="relative flex items-stretch justify-between">
        {/* connecting line */}
        <div
          className="absolute top-3 left-3 right-3 h-0.5 bg-zinc-200"
          aria-hidden
        />
        <div
          className={`absolute top-3 left-3 h-0.5 transition-all duration-700 ${
            isFailed ? "bg-red-500" : "bg-emerald-500"
          }`}
          style={{
            width:
              currentIdx <= 0
                ? "0%"
                : `calc(${(currentIdx / (PHASES.length - 1)) * 100}% - 0.75rem)`,
          }}
          aria-hidden
        />
        {PHASES.map((p, idx) => {
          const isComplete = !isFailed && currentIdx > idx;
          const isActive = !isFailed && currentIdx === idx;
          const isFinalDone = !isFailed && idx === PHASES.length - 1 && currentIdx === idx;
          return (
            <li
              key={p.key}
              className="relative z-10 flex flex-col items-center text-center w-1/4"
              data-testid={`timeline-phase-${p.key}`}
            >
              <div
                className={`w-6 h-6 flex items-center justify-center border-2 transition-colors ${
                  isComplete || isFinalDone
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : isActive
                    ? "bg-white border-emerald-500 text-emerald-600"
                    : isFailed && idx >= currentIdx
                    ? "bg-white border-red-500 text-red-500"
                    : "bg-white border-zinc-300 text-zinc-400"
                }`}
              >
                {isComplete || isFinalDone ? (
                  <CheckCircle2 className="w-4 h-4" strokeWidth={3} />
                ) : isActive ? (
                  <Loader2 className="w-3 h-3 animate-spin" strokeWidth={3} />
                ) : isFailed && idx >= currentIdx ? (
                  <AlertTriangle className="w-3 h-3" strokeWidth={2.5} />
                ) : (
                  <Circle className="w-2.5 h-2.5" strokeWidth={3} />
                )}
              </div>
              <span
                className={`text-[10px] font-bold mt-2 leading-tight ${
                  isComplete || isFinalDone
                    ? "text-emerald-700"
                    : isActive
                    ? "text-zinc-900"
                    : "text-zinc-400"
                }`}
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {p.label}
              </span>
              <span
                className={`text-[9px] mt-0.5 leading-tight max-w-[110px] ${
                  isActive ? "text-zinc-600" : "text-zinc-400"
                }`}
              >
                {p.desc}
              </span>
            </li>
          );
        })}
      </ol>

      {isFailed && error && (
        <div className="mt-3 px-3 py-2 bg-red-50 border border-red-200 text-[11px] text-red-800 font-mono break-all">
          {error}
        </div>
      )}
    </div>
  );
};

export default SpeckitTimeline;
