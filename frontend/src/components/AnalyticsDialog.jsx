// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect } from "react";
import { API } from "@/App";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BarChart3, AlertTriangle } from "lucide-react";

const LEVEL_COLORS = {
  simple: { bg: "bg-emerald-100", text: "text-emerald-800", label: "Simple" },
  moderate: { bg: "bg-blue-100", text: "text-blue-800", label: "Moderado" },
  complex: { bg: "bg-amber-100", text: "text-amber-800", label: "Complejo" },
  very_complex: { bg: "bg-rose-100", text: "text-rose-800", label: "Muy Complejo" },
};

export const AnalyticsDialog = ({ open, onOpenChange, diagramId, getAuthHeaders }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && diagramId) fetchAnalytics();
  }, [open, diagramId]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API}/diagrams/${diagramId}/analytics`, {
        method: "POST", headers: getAuthHeaders()
      });
      if (resp.ok) setData(await resp.json());
    } catch (_) {}
    setLoading(false);
  };

  const MetricCard = ({ label, value, sub }) => (
    <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-600" />
            Analytics del Diagrama
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full" />
          </div>
        ) : data ? (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 p-1">
              {/* Complexity */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                <div>
                  <p className="text-sm text-slate-500">Complejidad del proceso</p>
                  <p className="text-3xl font-bold text-slate-900">{data.complexity_score}</p>
                </div>
                <Badge className={`${LEVEL_COLORS[data.complexity_level]?.bg} ${LEVEL_COLORS[data.complexity_level]?.text} text-sm px-3 py-1`}>
                  {LEVEL_COLORS[data.complexity_level]?.label || data.complexity_level}
                </Badge>
              </div>

              {/* Element counts */}
              <div className="grid grid-cols-4 gap-2">
                <MetricCard label="Tareas" value={data.tasks} sub={`${data.user_tasks} usuario, ${data.service_tasks} servicio`} />
                <MetricCard label="Decisiones" value={data.gateways} sub={`${data.exclusive_gw} excl, ${data.parallel_gw} par`} />
                <MetricCard label="Eventos" value={data.events} sub={`${data.start_events} inicio, ${data.end_events} fin`} />
                <MetricCard label="Flujos" value={data.flows} />
              </div>

              {/* Paths and history */}
              <div className="grid grid-cols-3 gap-2">
                <MetricCard label="Caminos estimados" value={data.estimated_paths} />
                <MetricCard label="Versiones" value={data.version_count} />
                <MetricCard label="Ramas activas" value={data.active_branches} />
              </div>

              {/* Bottlenecks */}
              {data.bottlenecks.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <p className="text-sm font-semibold text-amber-800">Cuellos de botella detectados</p>
                  </div>
                  {data.bottlenecks.map((b, i) => (
                    <p key={i} className="text-xs text-amber-700 ml-6">
                      Elemento <code className="bg-amber-100 px-1 rounded">{b.element_id}</code> recibe {b.incoming_flows} flujos de entrada
                    </p>
                  ))}
                </div>
              )}

              {/* Warnings */}
              {data.unnamed_elements > 0 && (
                <div className="p-2 bg-slate-50 rounded border text-xs text-slate-500">
                  {data.unnamed_elements} elemento(s) sin nombre asignado
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <MetricCard label="Comentarios" value={data.comment_count} />
                <MetricCard label="Procesos" value={data.process_count} />
              </div>
            </div>
          </ScrollArea>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
