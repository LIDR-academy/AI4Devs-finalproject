// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect } from "react";
import { API } from "@/App";
import { getAuthHeaders } from "@/lib/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, GitCommit, FileCode, MessageSquare, FolderKanban, TrendingUp, Loader2 } from "lucide-react";


const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  } catch {
    return "—";
  }
};

const initialsOf = (email) => {
  if (!email) return "?";
  const name = email.split("@")[0];
  const parts = name.split(/[._-]/).filter(Boolean);
  return (parts[0]?.[0] || "?" + (parts[1]?.[0] || "")).toUpperCase().slice(0, 2);
};

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4", "#EC4899", "#84CC16"];
const colorFor = (email) => {
  if (!email) return COLORS[0];
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = (hash * 31 + email.charCodeAt(i)) | 0;
  return COLORS[Math.abs(hash) % COLORS.length];
};

const TeamMetricsWidget = ({ days = 30 }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API}/projects/team-metrics?days=${days}`, { headers: getAuthHeaders() });
        if (!res.ok) {
          if (!cancelled) setError("No se pudieron cargar las metricas");
          return;
        }
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) setError("Error cargando metricas");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [days]);

  if (loading) {
    return (
      <div className="border border-zinc-200 p-6 bg-white" data-testid="team-metrics-loading">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando metricas de equipo...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  const totals = data.totals || {};
  const contributors = data.contributors || [];
  const maxScore = contributors.reduce((m, c) => Math.max(m, c.total_contributions || 0), 0) || 1;

  return (
    <div className="border border-zinc-200 bg-white" data-testid="team-metrics-widget">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-zinc-700" />
          <h3 className="text-sm font-bold text-zinc-900" style={{ fontFamily: "'Chivo', sans-serif" }}>
            Metricas de Equipo
          </h3>
          <Badge variant="secondary" className="text-[10px] rounded-lg">
            ULTIMOS {days} DIAS
          </Badge>
        </div>
        <span className="text-[10px] text-zinc-400 uppercase tracking-wider" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          {totals.contributors || 0} CONTRIBUIDOR{totals.contributors === 1 ? "" : "ES"}
        </span>
      </div>

      {/* Totals row */}
      <div className="grid grid-cols-4 border-b border-zinc-200 divide-x divide-zinc-200" data-testid="team-metrics-totals">
        <div className="p-3 flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-lg font-black text-zinc-900 leading-none" style={{ fontFamily: "'Chivo', sans-serif" }}>{totals.versions || 0}</p>
            <p className="text-[10px] text-zinc-400 uppercase mt-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>commits</p>
          </div>
        </div>
        <div className="p-3 flex items-center gap-2">
          <FileCode className="w-4 h-4 text-emerald-600" />
          <div>
            <p className="text-lg font-black text-zinc-900 leading-none" style={{ fontFamily: "'Chivo', sans-serif" }}>{totals.diagrams_created || 0}</p>
            <p className="text-[10px] text-zinc-400 uppercase mt-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>diagramas</p>
          </div>
        </div>
        <div className="p-3 flex items-center gap-2">
          <FolderKanban className="w-4 h-4 text-violet-600" />
          <div>
            <p className="text-lg font-black text-zinc-900 leading-none" style={{ fontFamily: "'Chivo', sans-serif" }}>{totals.projects_created || 0}</p>
            <p className="text-[10px] text-zinc-400 uppercase mt-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>proyectos</p>
          </div>
        </div>
        <div className="p-3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-amber-600" />
          <div>
            <p className="text-lg font-black text-zinc-900 leading-none" style={{ fontFamily: "'Chivo', sans-serif" }}>{totals.comments || 0}</p>
            <p className="text-[10px] text-zinc-400 uppercase mt-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>comentarios</p>
          </div>
        </div>
      </div>

      {/* Contributors leaderboard */}
      <div className="p-4">
        {contributors.length === 0 ? (
          <p className="text-xs text-zinc-500 text-center py-6" data-testid="team-metrics-empty">
            Sin actividad en los ultimos {days} dias.
          </p>
        ) : (
          <div className="space-y-2.5">
            {contributors.slice(0, 8).map((c, idx) => {
              const pct = Math.round(((c.total_contributions || 0) / maxScore) * 100);
              const bg = colorFor(c.user);
              return (
                <div key={c.user || idx} className="flex items-center gap-3" data-testid={`team-contributor-${idx}`}>
                  <span className="text-[10px] font-bold text-zinc-400 w-5 text-right" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    #{idx + 1}
                  </span>
                  <Avatar className="w-7 h-7 flex-shrink-0">
                    <AvatarFallback style={{ backgroundColor: bg, color: "white", fontSize: "10px", fontWeight: 700 }}>
                      {initialsOf(c.user)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-zinc-900 truncate">{c.user}</span>
                      <span className="text-[10px] text-zinc-400 flex-shrink-0" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                        <TrendingUp className="w-2.5 h-2.5 inline mr-1" />
                        {c.total_contributions} pts
                      </span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: bg }}
                      />
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-500" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      <span title="Commits"><GitCommit className="w-2.5 h-2.5 inline mr-0.5" />{c.versions}</span>
                      <span title="Diagramas"><FileCode className="w-2.5 h-2.5 inline mr-0.5" />{c.diagrams_created}</span>
                      <span title="Proyectos"><FolderKanban className="w-2.5 h-2.5 inline mr-0.5" />{c.projects_created}</span>
                      <span title="Comentarios"><MessageSquare className="w-2.5 h-2.5 inline mr-0.5" />{c.comments}</span>
                      <span className="ml-auto">ult: {formatDate(c.last_activity)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMetricsWidget;
