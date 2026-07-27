// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/App";
import ProjectMenuBar from "@/components/ProjectMenuBar";
import { BarChart3, Users, Activity, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const API = process.env.REACT_APP_BACKEND_URL;

const STATIC_LEVELS = [
  { key: "initial", label: "Inicial", color: "bg-red-500" },
  { key: "inter", label: "Intermedio", color: "bg-amber-500" },
  { key: "advanced", label: "Avanzado", color: "bg-emerald-500" },
];

const Card = ({ title, children, className = "" }) => (
  <div className={`border border-zinc-200 bg-white p-5 ${className}`}>
    <h3
      className="text-[11px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-4"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      {title}
    </h3>
    {children}
  </div>
);

const BarRow = ({ label, value, max, color = "bg-deep-navy" }) => {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-700">{label}</span>
        <span className="font-bold text-zinc-900 tabular-nums" style={{ fontVariantNumeric: "tabular-nums" }}>
          {value.toLocaleString("es-ES")}
        </span>
      </div>
      <div className="h-2 bg-zinc-100 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

export default function AdminLandingStatsPage() {
  const { user } = useAuth();
  const token =
    localStorage.getItem("session_token") ||
    document.cookie.split("session_token=")[1]?.split(";")[0] ||
    "";
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [funnel, setFunnel] = useState(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  const load = async (d = days) => {
    setLoading(true);
    try {
      const [s, f] = await Promise.all([
        fetch(`${API}/api/landing/events/stats?days=${d}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API}/api/landing/events/funnel?days=${d}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => (r.ok ? r.json() : null)),
      ]);
      setStats(s);
      setFunnel(f);
    } catch (e) {
      toast.error("Error al cargar estadísticas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Block non-admins (defense in depth, AdminRoute should already filter)
  if (user && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <ProjectMenuBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <p className="text-sm font-bold">Acceso restringido</p>
          </div>
        </div>
      </div>
    );
  }

  const maxByType = stats ? Math.max(1, ...stats.by_event_type.map((b) => b.count)) : 1;
  const maxLevel = stats ? Math.max(1, ...(stats.maturity_levels || []).map((b) => b.count)) : 1;
  const maxTab = stats ? Math.max(1, ...(stats.case_tabs || []).map((b) => b.count)) : 1;
  const maxCta = stats ? Math.max(1, ...(stats.top_ctas || []).map((b) => b.count)) : 1;
  const maxLang = stats ? Math.max(1, ...(stats.languages || []).map((b) => b.count)) : 1;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ProjectMenuBar />
      <div className="flex-1 overflow-y-auto flex flex-col">
        <header className="sticky top-0 z-30 bg-white border-b border-zinc-200 h-14 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-deep-navy flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>ADMIN · ANALYTICS</p>
              <h1 className="text-base font-bold text-zinc-900 tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>Analítica de Landing</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={days}
              onChange={(e) => {
                const d = parseInt(e.target.value, 10);
                setDays(d);
                load(d);
              }}
              data-testid="days-filter"
              className="border border-zinc-200 px-3 py-2 text-sm font-bold bg-white"
            >
              {[7, 30, 90, 365].map((d) => (
                <option key={d} value={d}>
                  Últimos {d} días
                </option>
              ))}
            </select>
            <button
              onClick={() => load(days)}
              disabled={loading}
              data-testid="refresh-btn"
              className="border border-zinc-200 px-3 py-2 text-sm font-bold bg-white hover:bg-deep-navy hover:text-white inline-flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Actualizar
            </button>
          </div>
        </header>
        <div className="p-6" data-testid="admin-landing-stats-page">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-xs text-zinc-500 hover:text-zinc-900 inline-flex items-center gap-1 mb-4"
            >
              <ArrowLeft className="w-3 h-3" /> Volver
            </button>
            <p className="text-sm text-zinc-500 mb-6">
              Eventos anónimos del sitio público (TTL 90 días, IP anonimizada).
            </p>

          {!stats ? (
            <div className="text-center py-20 text-zinc-500" data-testid="loading-state">
              {loading ? "Cargando…" : "Sin datos en el período seleccionado."}
            </div>
          ) : (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <Card title="Eventos totales">
                  <div
                    className="text-4xl font-black text-zinc-900 tabular-nums"
                    style={{ fontFamily: "'Chivo', sans-serif", fontVariantNumeric: "tabular-nums" }}
                    data-testid="kpi-total"
                  >
                    {stats.total_events.toLocaleString("es-ES")}
                  </div>
                </Card>
                <Card title="Visitantes únicos">
                  <div
                    className="text-4xl font-black text-zinc-900 tabular-nums flex items-center gap-3"
                    style={{ fontFamily: "'Chivo', sans-serif", fontVariantNumeric: "tabular-nums" }}
                    data-testid="kpi-unique"
                  >
                    <Users className="w-7 h-7 text-blue-600" />
                    {stats.unique_visitors.toLocaleString("es-ES")}
                  </div>
                </Card>
                <Card title="Eventos / visitante">
                  <div
                    className="text-4xl font-black text-zinc-900 tabular-nums flex items-center gap-3"
                    style={{ fontFamily: "'Chivo', sans-serif", fontVariantNumeric: "tabular-nums" }}
                    data-testid="kpi-eps"
                  >
                    <Activity className="w-7 h-7 text-emerald-600" />
                    {stats.unique_visitors
                      ? (stats.total_events / stats.unique_visitors).toFixed(1)
                      : "0.0"}
                  </div>
                </Card>
              </div>

              {/* Funnel */}
              {funnel && funnel.steps && (
                <Card title="Embudo de conversión: Quiz de madurez" className="mb-8">
                  <div className="space-y-4">
                    {funnel.steps.map((s, i) => (
                      <div key={s.label} data-testid={`funnel-step-${i}`}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-zinc-800 font-medium">{s.label}</span>
                          <span className="font-bold text-zinc-900 tabular-nums">
                            {s.count.toLocaleString("es-ES")} · {s.pct}%
                          </span>
                        </div>
                        <div className="h-3 bg-zinc-100 overflow-hidden">
                          <div
                            className={`h-full ${
                              i === 0
                                ? "bg-deep-navy"
                                : i === 1
                                ? "bg-blue-600"
                                : i === 2
                                ? "bg-amber-500"
                                : "bg-emerald-600"
                            }`}
                            style={{ width: `${s.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Events by type */}
                <Card title="Eventos por tipo">
                  <div className="space-y-3">
                    {stats.by_event_type.length === 0 ? (
                      <p className="text-sm text-zinc-500">Sin eventos.</p>
                    ) : (
                      stats.by_event_type.map((b) => (
                        <BarRow
                          key={b.event_type}
                          label={b.event_type}
                          value={b.count}
                          max={maxByType}
                        />
                      ))
                    )}
                  </div>
                </Card>

                {/* Languages */}
                <Card title="Idiomas">
                  <div className="space-y-3">
                    {stats.languages.length === 0 ? (
                      <p className="text-sm text-zinc-500">Sin datos.</p>
                    ) : (
                      stats.languages.map((b) => (
                        <BarRow
                          key={b.lang || "?"}
                          label={(b.lang || "?").toUpperCase()}
                          value={b.count}
                          max={maxLang}
                          color="bg-blue-600"
                        />
                      ))
                    )}
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Maturity levels */}
                <Card title="Niveles del quiz de madurez">
                  {(stats.maturity_levels || []).length === 0 ? (
                    <p className="text-sm text-zinc-500">Sin completados aún.</p>
                  ) : (
                    <div className="space-y-3">
                      {STATIC_LEVELS.map((lvl) => {
                        const found = (stats.maturity_levels || []).find((x) => x.level === lvl.key);
                        const count = found ? found.count : 0;
                        return (
                          <BarRow
                            key={lvl.key}
                            label={lvl.label}
                            value={count}
                            max={maxLevel}
                            color={lvl.color}
                          />
                        );
                      })}
                    </div>
                  )}
                </Card>

                {/* Case study tabs */}
                <Card title="Tabs del case study (clics)">
                  {(stats.case_tabs || []).length === 0 ? (
                    <p className="text-sm text-zinc-500">Sin clics aún.</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.case_tabs.map((t) => (
                        <BarRow
                          key={t.tab || "?"}
                          label={
                            t.tab === "problem"
                              ? "Problema"
                              : t.tab === "solution"
                              ? "Solución"
                              : t.tab === "result"
                              ? "Resultado"
                              : t.tab || "?"
                          }
                          value={t.count}
                          max={maxTab}
                          color={
                            t.tab === "problem"
                              ? "bg-red-500"
                              : t.tab === "solution"
                              ? "bg-blue-500"
                              : "bg-emerald-500"
                          }
                        />
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Top CTAs */}
              <Card title="CTAs más clicados">
                {(stats.top_ctas || []).length === 0 ? (
                  <p className="text-sm text-zinc-500">Sin clics en CTAs aún.</p>
                ) : (
                  <div className="space-y-3">
                    {stats.top_ctas.map((c) => (
                      <BarRow
                        key={c.cta_id || "?"}
                        label={c.cta_id || "?"}
                        value={c.count}
                        max={maxCta}
                        color="bg-deep-navy"
                      />
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
