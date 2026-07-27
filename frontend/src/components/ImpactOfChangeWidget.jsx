// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { API } from "@/App";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertTriangle, TrendingUp, TrendingDown, Check, Users,
  FileCode, FileText, ArrowRight, Bell,
} from "lucide-react";
import { toast } from "sonner";

const authHeaders = () => {
  const t = localStorage.getItem("session_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const MOSCOW = {
  must:   { label: "MUST",   color: "bg-red-600 text-white" },
  should: { label: "SHOULD", color: "bg-amber-500 text-white" },
  could:  { label: "COULD",  color: "bg-sky-500 text-white" },
  wont:   { label: "WON'T",  color: "bg-zinc-500 text-white" },
};

const formatWhen = (iso) => {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "hace segundos";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  return d.toLocaleDateString();
};

/**
 * Impact-of-change widget.
 * Lists recent MoSCoW priority changes and the RACI actors who should be notified.
 *
 * Props:
 *  - onlyUnacknowledged: bool (default false)
 *  - limit: int (default 10)
 */
const ImpactOfChangeWidget = ({ onlyUnacknowledged = false, limit = 10 }) => {
  const [changes, setChanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChange, setActiveChange] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(limit) });
      if (onlyUnacknowledged) params.set("only_unacknowledged", "true");
      const res = await fetch(`${API}/specs/changes/recent?${params}`, {
        headers: authHeaders(), credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setChanges(data.changes || []);
      }
    } finally {
      setLoading(false);
    }
  }, [onlyUnacknowledged, limit]);

  useEffect(() => { load(); }, [load]);

  const acknowledge = async (changeId) => {
    const res = await fetch(`${API}/specs/changes/${changeId}/acknowledge`, {
      method: "POST", headers: authHeaders(), credentials: "include",
    });
    if (res.ok) {
      toast.success("Confirmado");
      await load();
      setActiveChange(null);
    } else {
      toast.error("No se pudo confirmar");
    }
  };

  return (
    <Card className="rounded-lg border border-zinc-200 bg-white" data-testid="impact-widget">
      <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-bold text-zinc-900 tracking-tight">Impacto de cambio</h3>
          <Badge variant="outline" className="rounded-lg font-mono text-xs">{changes.length}</Badge>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">
          cambios MoSCoW recientes
        </span>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading && (
          <div className="px-4 py-6 text-center text-xs text-zinc-400 italic">Cargando…</div>
        )}
        {!loading && changes.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-zinc-500 italic" data-testid="impact-empty">
            Sin cambios de prioridad recientes.
          </div>
        )}
        {!loading && changes.map((ch) => {
          const promoted = ch.escalation > 0;
          const demoted = ch.escalation < 0;
          const TrendIcon = promoted ? TrendingUp : (demoted ? TrendingDown : ArrowRight);
          const trendColor = promoted ? "text-red-600" : (demoted ? "text-emerald-600" : "text-zinc-500");
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => setActiveChange(ch)}
              className={`w-full text-left px-4 py-3 border-b border-zinc-100 hover:bg-zinc-50 transition-colors flex items-start gap-3 ${ch.acknowledged ? "opacity-60" : ""}`}
              data-testid={`impact-row-${ch.id}`}
            >
              <div className="flex-shrink-0 pt-0.5">
                <TrendIcon className={`w-4 h-4 ${trendColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold ${MOSCOW[ch.from_moscow].color}`}>
                    {MOSCOW[ch.from_moscow].label}
                  </span>
                  <ArrowRight className="w-3 h-3 text-zinc-400" />
                  <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold ${MOSCOW[ch.to_moscow].color}`}>
                    {MOSCOW[ch.to_moscow].label}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 ml-1">{ch.requirement_code}</span>
                </div>
                <div className="text-sm text-zinc-900 font-medium truncate">{ch.requirement_title}</div>
                <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-2 mt-0.5">
                  <span>{ch.changed_by}</span>
                  <span>·</span>
                  <span>{formatWhen(ch.changed_at)}</span>
                  {ch.user_is_raci && !ch.acknowledged_by?.includes?.("") && (
                    <Badge className="bg-amber-500 text-white rounded-lg font-mono text-[9px] h-4 px-1">TE INCUMBE</Badge>
                  )}
                </div>
                <div className="mt-1.5 flex items-center gap-3 text-[10px] text-zinc-600 font-mono">
                  <span className="flex items-center gap-1"><FileCode className="w-3 h-3" /> {ch.affected_elements?.length || 0} elementos</span>
                  <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {ch.affected_diagrams?.length || 0} diagramas</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {ch.raci_notify?.length || 0} RACI</span>
                </div>
              </div>
              {ch.acknowledged && (
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" title="Confirmado por todos los RACI" />
              )}
            </button>
          );
        })}
      </div>

      {/* Detail dialog */}
      <Dialog open={!!activeChange} onOpenChange={(v) => !v && setActiveChange(null)}>
        <DialogContent className="sm:max-w-lg rounded-lg border border-zinc-200 max-h-[85vh] overflow-y-auto" data-testid="impact-detail-dialog">
          {activeChange && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Detalle del cambio
                </DialogTitle>
                <DialogDescription>
                  {activeChange.requirement_code} — {activeChange.requirement_title}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 p-3">
                  <span className={`px-2 py-1 text-xs font-mono font-bold ${MOSCOW[activeChange.from_moscow].color}`}>
                    {MOSCOW[activeChange.from_moscow].label}
                  </span>
                  <ArrowRight className="w-4 h-4 text-zinc-500" />
                  <span className={`px-2 py-1 text-xs font-mono font-bold ${MOSCOW[activeChange.to_moscow].color}`}>
                    {MOSCOW[activeChange.to_moscow].label}
                  </span>
                  <span className="ml-auto text-xs text-zinc-500 font-mono">
                    {activeChange.escalation > 0 ? "Escalado" : activeChange.escalation < 0 ? "Desescalado" : "Cambio lateral"}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-mono uppercase text-zinc-500 mb-2 flex items-center gap-1">
                    <FileCode className="w-3.5 h-3.5" /> Elementos BPMN afectados ({activeChange.affected_elements?.length || 0})
                  </h4>
                  {(!activeChange.affected_elements || activeChange.affected_elements.length === 0) ? (
                    <p className="text-xs text-zinc-400 italic pl-1">Ningún elemento enlazado directamente.</p>
                  ) : (
                    <div className="space-y-1" data-testid="impact-affected-elements">
                      {activeChange.affected_elements.map((el, i) => (
                        <Link
                          key={`${el.diagram_id}-${el.element_id}-${i}`}
                          to={`/editor/${el.diagram_id}`}
                          target="_blank"
                          className="flex items-center gap-2 px-2 py-1.5 border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 transition-colors"
                        >
                          <FileCode className="w-3 h-3 text-zinc-400" />
                          <span className="text-xs font-mono text-zinc-700">{el.element_id}</span>
                          <span className="text-[10px] text-zinc-500 truncate ml-auto">{el.diagram_name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-mono uppercase text-zinc-500 mb-2 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> RACI a notificar ({activeChange.raci_notify?.length || 0})
                  </h4>
                  {(!activeChange.raci_notify || activeChange.raci_notify.length === 0) ? (
                    <p className="text-xs text-zinc-400 italic pl-1">Sin RACI definido.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5" data-testid="impact-raci-list">
                      {activeChange.raci_notify.map((actor) => {
                        const acked = (activeChange.acknowledged_by || []).includes(actor);
                        return (
                          <Badge
                            key={actor}
                            variant="outline"
                            className={`rounded-lg font-mono text-xs gap-1 ${acked ? "border-emerald-500 text-emerald-700 bg-emerald-50" : "border-amber-500 text-amber-900 bg-amber-50"}`}
                          >
                            {acked ? <Check className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
                            {actor}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="border-t border-zinc-200 pt-3 flex items-center justify-between">
                  <Link
                    to={`/specs/${activeChange.spec_id}`}
                    target="_blank"
                    className="text-xs font-mono text-blue-700 hover:underline flex items-center gap-1"
                  >
                    Abrir especificación <ArrowRight className="w-3 h-3" />
                  </Link>
                  {!activeChange.acknowledged_by?.includes?.(localStorage.getItem("user_email") || "") && (
                    <Button
                      size="sm"
                      onClick={() => acknowledge(activeChange.id)}
                      className="rounded-lg bg-deep-navy hover:bg-deep-navy/90"
                      data-testid="impact-ack-btn"
                    >
                      <Check className="w-3 h-3 mr-1" /> Confirmar
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ImpactOfChangeWidget;
