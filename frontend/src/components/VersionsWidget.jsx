// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API } from "@/App";
import { Badge } from "@/components/ui/badge";
import {
  GitBranch,
  Workflow,
  FileText,
  Brain,
  Lightbulb,
  Code2,
  ArrowUpRight,
  History,
  Loader2,
} from "lucide-react";

const PHASE_META = {
  descripcion: { label: "Descripcion", color: "indigo", icon: Lightbulb },
  requirements: { label: "Reqs", color: "blue", icon: FileText },
  specification: { label: "Speckit", color: "violet", icon: Brain },
  bpmn: { label: "BPMN", color: "amber", icon: Workflow },
  code: { label: "Codigo", color: "emerald", icon: Code2 },
};

function timeAgo(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "ahora";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(iso).toLocaleDateString("es-ES");
}

function authHeaders() {
  const tk = localStorage.getItem("session_token") ||
    document.cookie.split("session_token=")[1]?.split(";")[0] || "";
  return tk ? { Authorization: `Bearer ${tk}` } : {};
}

export default function VersionsWidget() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API}/projects/_versions/overview`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(d => { if (!cancelled) setData(d); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="border border-zinc-200 p-6 flex items-center gap-2 text-zinc-400 text-xs">
        <Loader2 className="w-4 h-4 animate-spin" /> Cargando versiones...
      </div>
    );
  }

  const totals = data?.totals || { projects: 0, snapshots: 0 };
  const items = (data?.items || []).slice(0, 4);
  const activity = (data?.recent_activity || []).slice(0, 5);

  if (totals.projects === 0) return null;

  return (
    <div data-testid="dashboard-versions-widget">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2" style={{ fontFamily: "'Chivo', sans-serif" }}>
          <GitBranch className="w-4 h-4 text-amber-700" />
          Versiones del proyecto
          <Badge variant="secondary" className="rounded-lg text-[10px]">{totals.snapshots} snapshots</Badge>
        </h2>
        <Link to="/versions" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
          Ver todas <ArrowUpRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid lg:grid-cols-5 gap-3">
        {/* Top 4 projects */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {items.map((p) => (
            <Link
              key={p.id}
              to={`/projects/${p.id}/tree`}
              className="border-2 border-zinc-200 hover:border-zinc-900 p-3 transition-colors group"
              data-testid={`widget-project-${p.id}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold truncate" style={{ fontFamily: "'Chivo', sans-serif" }}>{p.name}</div>
                <ArrowUpRight className="w-3 h-3 text-zinc-300 group-hover:text-zinc-900 flex-shrink-0" />
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                {Object.entries(p.phases).map(([phase, count]) => {
                  const meta = PHASE_META[phase];
                  if (!meta) return null;
                  return (
                    <div
                      key={phase}
                      className={`flex items-center gap-0.5 text-[10px] font-bold ${count > 0 ? `text-${meta.color}-700` : "text-zinc-300"}`}
                      title={`${meta.label}: ${count}`}
                    >
                      <meta.icon className="w-2.5 h-2.5" />
                      <span>{count}</span>
                    </div>
                  );
                })}
              </div>
              <div className="text-[10px] text-zinc-400">{p.last_at ? `actualizado hace ${timeAgo(p.last_at)}` : "sin actividad"}</div>
            </Link>
          ))}
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-2 border border-zinc-200">
          <div className="px-3 py-2 border-b border-zinc-200 bg-zinc-50 flex items-center gap-2">
            <History className="w-3 h-3 text-zinc-600" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-700">Actividad</span>
          </div>
          {activity.length === 0 ? (
            <div className="text-[11px] text-zinc-400 text-center py-6">Sin actividad reciente</div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {activity.map((a, i) => {
                const meta = PHASE_META[a.phase] || PHASE_META.specification;
                const Icon = meta.icon;
                return (
                  <Link
                    key={i}
                    to={`/projects/${a.project_id}/tree`}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-50"
                    data-testid={`widget-activity-${i}`}
                  >
                    <Icon className={`w-3 h-3 text-${meta.color}-700 flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] truncate font-semibold">{a.project_name}</div>
                      <div className="text-[10px] text-zinc-500 truncate">{meta.label} · {a.kind === "bpmn" ? `v${a.version_number}` : `v${a.version}`} · hace {timeAgo(a.created_at)}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
