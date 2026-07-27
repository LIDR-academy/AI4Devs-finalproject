// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth, API } from "@/App";
import ProjectMenuBar from "@/components/ProjectMenuBar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  GitBranch,
  Workflow,
  FileText,
  Brain,
  Lightbulb,
  Code2,
  ArrowUpRight,
  Loader2,
  History,
  Folder,
  Clock,
  TrendingUp,
} from "lucide-react";

const PHASE_META = {
  descripcion: { label: "Descripcion", color: "indigo", icon: Lightbulb },
  requirements: { label: "Reqs", color: "blue", icon: FileText },
  specification: { label: "Speckit", color: "violet", icon: Brain },
  bpmn: { label: "BPMN", color: "amber", icon: Workflow },
  code: { label: "Codigo", color: "emerald", icon: Code2 },
};

const TRIGGER_PILL = {
  manual: "bg-deep-navy text-white",
  "ai.requirements": "bg-blue-600 text-white",
  "ai.speckit": "bg-violet-600 text-white",
  "ai.bpmn": "bg-amber-600 text-white",
  "ai.code": "bg-emerald-600 text-white",
  "pre-restore": "bg-zinc-300 text-zinc-700",
  restore: "bg-emerald-600 text-white",
};

function fmtDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
}

function timeAgo(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "ahora mismo";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)}d`;
  return fmtDate(iso);
}

function authHeaders() {
  const tk = localStorage.getItem("session_token") ||
    document.cookie.split("session_token=")[1]?.split(";")[0] || "";
  return tk ? { Authorization: `Bearer ${tk}` } : {};
}

export default function VersionsOverviewPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/projects/_versions/overview`, { headers: authHeaders() });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setData(await r.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const items = data?.items || [];
  const activity = data?.recent_activity || [];
  const totals = data?.totals || { projects: 0, snapshots: 0 };

  return (
    <div className="min-h-screen bg-white">
      <ProjectMenuBar />

      {/* sticky header */}
      <div className="sticky top-0 z-30 bg-white border-b-2 border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-zinc-200 flex items-center justify-center">
            <GitBranch className="w-4 h-4 text-zinc-700" />
          </div>
          <div>
            <h1 className="text-base font-bold font-title text-zinc-900 leading-none">
              Versiones
            </h1>
            <p className="text-xs text-zinc-500">Vista global de snapshots</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6" data-testid="versions-overview-root">
          {/* Totals */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="rounded-lg border-2 border-zinc-200">
              <CardContent className="p-4">
                <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Proyectos</div>
                <div className="text-3xl font-bold mt-1" style={{ fontFamily: "'Chivo', sans-serif" }}>{totals.projects}</div>
                <div className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1"><Folder className="w-3 h-3" /> con versiones</div>
              </CardContent>
            </Card>
            <Card className="rounded-lg border-2 border-zinc-200">
              <CardContent className="p-4">
                <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">Snapshots</div>
                <div className="text-3xl font-bold mt-1" style={{ fontFamily: "'Chivo', sans-serif" }}>{totals.snapshots}</div>
                <div className="text-[10px] text-zinc-400 mt-1 flex items-center gap-1"><History className="w-3 h-3" /> totales</div>
              </CardContent>
            </Card>
            <Card className="rounded-lg border-2 border-zinc-200 col-span-2">
              <CardContent className="p-4">
                <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 mb-1">Cómo funciona</div>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  Cada vez que la IA genera Requirements / Speckit / Código, o que guardas una versión BPMN, se crea un snapshot.
                  Puedes <strong>ver</strong>, <strong>comparar</strong> dos versiones, y <strong>restaurar</strong> cualquiera (con red de seguridad pre-restore).
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Projects grid */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Tus proyectos
            </h2>
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-zinc-500 py-8 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
              </div>
            ) : items.length === 0 ? (
              <Card className="rounded-lg border-2 border-dashed border-zinc-300">
                <CardContent className="p-12 text-center text-zinc-400">
                  <Folder className="w-10 h-10 mx-auto mb-2 text-zinc-300" />
                  <p className="text-sm">Aún no tienes proyectos con versiones registradas.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((p) => (
                  <Link
                    key={p.id}
                    to={`/projects/${p.id}/tree`}
                    className="block group"
                    data-testid={`overview-project-card-${p.id}`}
                  >
                    <Card className="rounded-lg border-2 border-zinc-200 group-hover:border-zinc-900 transition-colors h-full">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: p.color || "#3B82F6" }}
                            >
                              <Folder className="w-4 h-4 text-white" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-zinc-900 truncate" style={{ fontFamily: "'Chivo', sans-serif" }}>{p.name}</div>
                              <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {p.last_at ? timeAgo(p.last_at) : "sin actividad"}
                              </div>
                            </div>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-900 flex-shrink-0" />
                        </div>

                        <div className="grid grid-cols-5 gap-1">
                          {Object.entries(p.phases).map(([phase, count]) => {
                            const meta = PHASE_META[phase];
                            const Icon = meta?.icon || FileText;
                            return (
                              <div
                                key={phase}
                                className={`border-2 ${count > 0 ? `border-${meta.color}-500 bg-${meta.color}-50` : "border-zinc-200 bg-zinc-50"} flex flex-col items-center justify-center py-1.5`}
                                title={`${meta?.label}: ${count}`}
                              >
                                <Icon className={`w-3 h-3 ${count > 0 ? `text-${meta.color}-700` : "text-zinc-300"}`} />
                                <span className={`text-[10px] font-bold mt-0.5 ${count > 0 ? `text-${meta.color}-700` : "text-zinc-300"}`}>{count}</span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-zinc-500">
                          <span><strong className="text-zinc-700">{p.total}</strong> snapshots</span>
                          <span className="text-zinc-900 font-bold group-hover:underline">Ver árbol →</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent activity */}
          {activity.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-700 mb-2 flex items-center gap-2">
                <History className="w-3.5 h-3.5" />
                Actividad reciente
              </h2>
              <Card className="rounded-lg border-2 border-zinc-200">
                <CardContent className="p-0">
                  <div className="divide-y divide-zinc-100">
                    {activity.map((a, i) => {
                      const meta = PHASE_META[a.phase] || PHASE_META.specification;
                      const Icon = meta.icon;
                      const pill = a.kind === "bpmn" ? "bg-amber-600 text-white" : (TRIGGER_PILL[a.trigger] || "bg-zinc-200 text-zinc-700");
                      return (
                        <Link
                          key={i}
                          to={`/projects/${a.project_id}/tree`}
                          className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-50 transition-colors"
                          data-testid={`activity-row-${i}`}
                        >
                          <div className={`w-8 h-8 border-2 border-${meta.color}-500 bg-${meta.color}-50 flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-3.5 h-3.5 text-${meta.color}-700`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-semibold text-zinc-900 truncate">{a.project_name}</span>
                              <span className="text-[10px] text-zinc-400">·</span>
                              <Badge variant="secondary" className="rounded-lg text-[9px] uppercase">{meta.label}</Badge>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 ${pill}`}>
                                {a.kind === "bpmn" ? `BPMN v${a.version_number}` : (a.trigger || "manual")}
                              </span>
                              {a.kind !== "bpmn" && <span className="text-[10px] font-mono text-zinc-500">v{a.version}</span>}
                            </div>
                            <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                              {(a.label || a.commit_message || "—")} · {a.created_by} · {timeAgo(a.created_at)}
                            </div>
                          </div>
                          <ArrowUpRight className="w-3.5 h-3.5 text-zinc-300 flex-shrink-0" />
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
    </div>
  );
}
