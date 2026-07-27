// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth, API } from "@/App";
import ProjectMenuBar from "@/components/ProjectMenuBar";
import { toast } from "sonner";
import {
  FileClock,
  RefreshCcw,
  Download,
  Search,
  Filter,
  X,
  Loader2,
  Database,
  AlertCircle,
} from "lucide-react";
import { downloadBlob, downloadFromUrl } from "@/lib/downloadFile";

const authHeaders = () => {
  const t = localStorage.getItem("session_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString("es-ES", { hour12: false }) : "—");

const ACTION_COLORS = [
  { test: /^auth\./, c: "text-blue-700 bg-blue-50 border-blue-300" },
  { test: /^issue\./, c: "text-amber-700 bg-amber-50 border-amber-300" },
  { test: /^custom_schema\./, c: "text-purple-700 bg-purple-50 border-purple-300" },
  { test: /\.deleted$/, c: "text-red-700 bg-red-50 border-red-300" },
];

const actionStyle = (action) => {
  for (const rule of ACTION_COLORS) if (rule.test.test(action)) return rule.c;
  return "text-zinc-700 bg-zinc-100 border-zinc-300";
};

const StatBox = ({ label, value, testid, c = "text-zinc-900" }) => (
  <div className="border border-zinc-200 bg-white p-4" data-testid={testid}>
    <div
      className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 mb-1"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      {label}
    </div>
    <div className={`text-2xl font-black ${c}`} style={{ fontFamily: "'Chivo', sans-serif" }}>
      {value}
    </div>
  </div>
);

const AdminAuditPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({ action: "", resource_type: "", actor_email: "", q: "" });
  const [expanded, setExpanded] = useState(null);

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) p.set(k, v); });
    return p.toString();
  }, [filters]);

  const loadAll = useCallback(async () => {
    setRefreshing(true);
    try {
      const [lr, sr, ar] = await Promise.all([
        fetch(`${API}/audit-logs?limit=300&${queryString}`, { headers: authHeaders(), credentials: "include" }),
        fetch(`${API}/audit-logs/stats`, { headers: authHeaders(), credentials: "include" }),
        fetch(`${API}/audit-logs/actions`, { headers: authHeaders(), credentials: "include" }),
      ]);
      if (lr.ok) setItems(await lr.json());
      if (sr.ok) setStats(await sr.json());
      if (ar.ok) setActions(await ar.json());
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [queryString]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const exportCsv = async () => {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const url = `${API}/audit-logs/export?limit=10000&${queryString}`;
    downloadFromUrl(url, `audit-logs-${stamp}.csv`);
    toast.success("Descarga iniciada");
  };

  const clearFilters = () => setFilters({ action: "", resource_type: "", actor_email: "", q: "" });
  const hasFilters = Object.values(filters).some(Boolean);

  if (user && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <ProjectMenuBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <p className="text-sm font-bold">Acceso restringido</p>
            <Link to="/dashboard" className="text-xs font-bold text-blue-600 hover:underline mt-2 inline-block">
              Volver al dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <ProjectMenuBar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" data-testid="admin-audit-page">
      <ProjectMenuBar />
      <div className="flex-1 overflow-y-auto flex flex-col">
        <header className="sticky top-0 z-30 bg-white border-b border-zinc-200 h-14 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-deep-navy flex items-center justify-center flex-shrink-0">
              <FileClock className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>ADMIN · AUDITORIA</p>
              <h1 className="text-base font-bold text-zinc-900 tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>Audit Logs</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCsv}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              data-testid="audit-export-csv-btn"
            >
              <Download className="w-4 h-4" strokeWidth={2.5} />
              <span
                className="text-[10px] font-bold tracking-[0.15em] uppercase"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                Export CSV
              </span>
            </button>
            <button
              onClick={loadAll}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 border border-zinc-200 text-zinc-900 hover:bg-deep-navy hover:text-white transition-colors disabled:opacity-50"
              data-testid="audit-refresh-btn"
            >
              <RefreshCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span
                className="text-[10px] font-bold tracking-[0.15em] uppercase"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {refreshing ? "..." : "Refrescar"}
              </span>
            </button>
          </div>
        </header>
        <div className="p-6">
          <p className="text-sm text-zinc-500 mb-6">Trazabilidad de acciones criticas: login, cambios de estado, CRUD admin.</p>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <StatBox testid="audit-stat-total" label="TOTAL EVENTOS" value={stats.total} />
            <StatBox
              testid="audit-stat-top"
              label="ACCION TOP"
              value={Object.keys(stats.top_actions || {})[0] || "—"}
              c="text-blue-700"
            />
            <StatBox
              testid="audit-stat-top-count"
              label="Nº TOP"
              value={Object.values(stats.top_actions || {})[0] || 0}
              c="text-amber-700"
            />
            <StatBox
              testid="audit-stat-last"
              label="ULTIMO EVENTO"
              value={stats.last_ts ? fmtDate(stats.last_ts).slice(0, 16) : "—"}
              c="text-emerald-700"
            />
          </div>
        )}

        {/* Filters */}
        <div className="border border-zinc-200 bg-white p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-zinc-500" />
            <span
              className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-700"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Filtros
            </span>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase text-red-600 hover:text-red-800"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                data-testid="audit-clear-filters"
              >
                <X className="w-3 h-3" strokeWidth={3} />
                Limpiar
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <select
              value={filters.action}
              onChange={(e) => setFilters((prev) => ({ ...prev, action: e.target.value }))}
              className="border border-zinc-200 px-2 py-1.5 text-xs focus:border-blue-600 focus:outline-none"
              data-testid="audit-filter-action"
            >
              <option value="">Accion: todas</option>
              {actions.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <input
              type="text"
              value={filters.resource_type}
              onChange={(e) => setFilters((prev) => ({ ...prev, resource_type: e.target.value }))}
              placeholder="Tipo recurso (ej: issue, user)"
              className="border border-zinc-200 px-2 py-1.5 text-xs focus:border-blue-600 focus:outline-none"
              data-testid="audit-filter-resource-type"
            />
            <input
              type="email"
              value={filters.actor_email}
              onChange={(e) => setFilters((prev) => ({ ...prev, actor_email: e.target.value }))}
              placeholder="Email del actor"
              className="border border-zinc-200 px-2 py-1.5 text-xs focus:border-blue-600 focus:outline-none"
              data-testid="audit-filter-actor"
            />
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                value={filters.q}
                onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
                placeholder="Buscar (accion/email/recurso)"
                className="w-full border border-zinc-200 pl-7 pr-2 py-1.5 text-xs focus:border-blue-600 focus:outline-none"
                data-testid="audit-filter-search"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="border border-zinc-200 bg-white">
          <div
            className="grid grid-cols-[160px_1fr_130px_1fr_100px] gap-3 px-4 py-2 border-b border-zinc-200 bg-deep-navy text-white text-[10px] font-bold tracking-[0.15em] uppercase"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            <span>Timestamp</span>
            <span>Actor</span>
            <span>Accion</span>
            <span>Recurso · Detalles</span>
            <span>IP</span>
          </div>
          {items.length === 0 ? (
            <div className="p-10 text-center text-sm text-zinc-500" data-testid="audit-empty">
              <FileClock className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
              Sin eventos con los filtros actuales.
            </div>
          ) : (
            items.map((it) => (
              <div key={it.id}>
                <button
                  onClick={() => setExpanded(expanded === it.id ? null : it.id)}
                  className="w-full text-left grid grid-cols-[160px_1fr_130px_1fr_100px] gap-3 px-4 py-2.5 border-b border-zinc-200 hover:bg-zinc-50 items-center text-sm"
                  data-testid={`audit-row-${it.id}`}
                >
                  <span className="text-[11px] text-zinc-500 font-mono">{fmtDate(it.ts)}</span>
                  <span className="text-xs text-zinc-700 truncate">
                    <span className="font-semibold text-zinc-900">{it.actor_email || "(anon)"}</span>
                    {it.actor_role && (
                      <span
                        className="ml-1.5 text-[9px] font-bold tracking-wider uppercase text-zinc-500"
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      >
                        · {it.actor_role}
                      </span>
                    )}
                  </span>
                  <span
                    className={`inline-block self-start text-[10px] font-bold tracking-wider px-1.5 py-0.5 border ${actionStyle(it.action)}`}
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {it.action}
                  </span>
                  <span className="text-xs text-zinc-600 truncate font-mono">
                    {it.resource_type ? `${it.resource_type}:${it.resource_id || "—"}` : "—"}
                    {it.details && Object.keys(it.details).length > 0 && (
                      <span className="text-zinc-400"> · {Object.keys(it.details).length} keys</span>
                    )}
                  </span>
                  <span className="text-[11px] text-zinc-500 font-mono truncate">{it.ip || "—"}</span>
                </button>
                {expanded === it.id && (
                  <div className="bg-zinc-50 border-b border-zinc-200 px-6 py-3" data-testid={`audit-detail-${it.id}`}>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <div
                          className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-500 mb-1"
                          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                        >
                          Detalles
                        </div>
                        <pre className="bg-white border border-zinc-200 p-2 text-[11px] overflow-x-auto font-mono">
                          {JSON.stringify(it.details || {}, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <div
                          className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-500 mb-1"
                          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                        >
                          Contexto
                        </div>
                        <div className="bg-white border border-zinc-200 p-2 space-y-1 text-[11px]">
                          <div><strong>id:</strong> <span className="font-mono text-zinc-600">{it.id}</span></div>
                          <div><strong>user_id:</strong> <span className="font-mono text-zinc-600">{it.actor_user_id || "—"}</span></div>
                          <div><strong>user_agent:</strong> <span className="font-mono text-zinc-600 break-all">{(it.user_agent || "—").slice(0, 160)}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Cache backend badge (informational) */}
        <CacheBadge />
        </div>
      </div>
    </div>
  );
};

const CacheBadge = () => {
  const [h, setH] = useState(null);
  useEffect(() => {
    fetch(`${API}/health/cache`, { headers: authHeaders(), credentials: "include" })
      .then((r) => r.json())
      .then(setH)
      .catch(() => {});
  }, []);
  if (!h) return null;
  const isRedis = h.backend === "redis";
  return (
    <div
      className={`mt-6 inline-flex items-center gap-2 px-3 py-1.5 border-2 ${
        isRedis ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-amber-600 bg-amber-50 text-amber-800"
      }`}
      data-testid="cache-backend-badge"
    >
      <Database className="w-3.5 h-3.5" strokeWidth={2.5} />
      <span
        className="text-[10px] font-bold tracking-[0.2em] uppercase"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        CACHE: {h.backend.toUpperCase()} · {h.in_memory_keys} keys (L1)
      </span>
    </div>
  );
};

export default AdminAuditPage;
