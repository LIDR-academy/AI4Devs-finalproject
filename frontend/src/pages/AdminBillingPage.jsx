// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth, API } from "@/App";
import ProjectMenuBar from "@/components/ProjectMenuBar";
import {
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Loader2,
  RefreshCcw,
  Filter,
  AlertCircle,
} from "lucide-react";

const authHeaders = () => {
  const t = localStorage.getItem("session_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const fmtEur = (n) =>
  typeof n === "number"
    ? `${n.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
    : "—";
const fmtPct = (n) => (typeof n === "number" ? `${n.toFixed(1)}%` : "—");
const fmtIso = (s) => (s ? new Date(s).toLocaleString("es-ES", { hour12: false }) : "—");

const StatCard = ({ icon: Icon, label, value, sub, accent = "text-zinc-900", testid }) => (
  <div
    className="border border-zinc-200 bg-white p-5"
    data-testid={testid}
  >
    <div className="flex items-center gap-2 mb-3">
      <Icon className={`w-4 h-4 ${accent}`} strokeWidth={2.5} />
      <span
        className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-500"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        {label}
      </span>
    </div>
    <div className={`text-3xl font-black ${accent}`} style={{ fontFamily: "'Chivo', sans-serif" }}>
      {value}
    </div>
    {sub && <div className="text-[11px] text-zinc-500 mt-1">{sub}</div>}
  </div>
);

const AdminBillingPage = () => {
  const { user } = useAuth();
  const [kpis, setKpis] = useState(null);
  const [tx, setTx] = useState(null);
  const [filters, setFilters] = useState({ status_: "", plan: "", user_email: "" });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = useCallback(async () => {
    setRefreshing(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const [kpisRes, txRes] = await Promise.all([
        fetch(`${API}/admin/billing/kpis`, { headers: authHeaders(), credentials: "include" }),
        fetch(`${API}/admin/billing/transactions?${params.toString()}`, { headers: authHeaders(), credentials: "include" }),
      ]);
      if (kpisRes.ok) setKpis(await kpisRes.json());
      if (txRes.ok) setTx(await txRes.json());
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Guard: only admins
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
    <div className="min-h-screen bg-white flex flex-col" data-testid="admin-billing-page">
      <ProjectMenuBar />
      <div className="flex-1 overflow-y-auto flex flex-col">
        <header className="sticky top-0 z-30 bg-white border-b border-zinc-200 h-14 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-deep-navy flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>ADMIN · BILLING</p>
              <h1 className="text-base font-bold text-zinc-900 tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>Panel de facturacion</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadAll}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 border border-zinc-200 text-zinc-900 hover:bg-deep-navy hover:text-white transition-colors disabled:opacity-50"
              data-testid="refresh-kpis-btn"
            >
              <RefreshCcw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              <span
                className="text-[10px] font-bold tracking-[0.15em] uppercase"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {refreshing ? "Actualizando..." : "Refrescar"}
              </span>
            </button>
          </div>
        </header>
        <div className="p-6">
          <p className="text-sm text-zinc-500 mb-6">
            KPIs en tiempo real desde tus transacciones Stripe (sandbox o produccion segun `STRIPE_API_KEY`).
          </p>

        {/* KPI grid */}
        {kpis && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              testid="kpi-mrr"
              icon={DollarSign}
              accent="text-emerald-600"
              label="MRR · EUR"
              value={fmtEur(kpis.mrr_eur)}
              sub={`ARR ${fmtEur(kpis.arr_eur)}`}
            />
            <StatCard
              testid="kpi-active-subs"
              icon={Users}
              label="Suscripciones activas"
              value={kpis.active_subscriptions}
              sub={Object.entries(kpis.active_by_plan || {}).map(([p, n]) => `${p}: ${n}`).join(" · ") || "—"}
            />
            <StatCard
              testid="kpi-trial-conversion"
              icon={Sparkles}
              accent="text-blue-600"
              label="Conversion trial · 90d"
              value={fmtPct(kpis.trial_conversion_rate_pct)}
              sub={`${kpis.trial_converted_90d} de ${kpis.trial_started_90d} trials → pagado`}
            />
            <StatCard
              testid="kpi-churn"
              icon={TrendingDown}
              accent={kpis.churn_rate_30d_pct > 5 ? "text-red-600" : "text-zinc-900"}
              label="Churn · 30d"
              value={fmtPct(kpis.churn_rate_30d_pct)}
              sub={`${kpis.churned_users_30d} usuarios → free`}
            />
          </div>
        )}

        {/* Revenue by plan */}
        {kpis && Object.keys(kpis.revenue_by_plan || {}).length > 0 && (
          <div className="mb-8 border border-zinc-200 bg-white p-5">
            <span
              className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-500"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Revenue capturado · Por plan
            </span>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(kpis.revenue_by_plan).map(([plan, data]) => (
                <div key={plan} className="border-l-4 border-emerald-500 pl-3">
                  <div
                    className="text-[10px] font-bold uppercase tracking-wider text-zinc-500"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    Plan {plan}
                  </div>
                  <div className="text-xl font-black text-zinc-900" style={{ fontFamily: "'Chivo', sans-serif" }}>
                    {fmtEur(data.total_eur)}
                  </div>
                  <div className="text-[11px] text-zinc-500">{data.tx_count} transacciones</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters + transactions table */}
        <div className="border border-zinc-200 bg-white">
          <div className="p-5 border-b border-zinc-200 flex items-center gap-3 flex-wrap">
            <Filter className="w-4 h-4 text-zinc-700" />
            <span
              className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-700"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Transacciones · {tx?.total ?? 0}
            </span>
            <input
              data-testid="filter-email"
              type="text"
              placeholder="Email"
              value={filters.user_email}
              onChange={(e) => setFilters(f => ({ ...f, user_email: e.target.value }))}
              className="border border-zinc-300 px-2 py-1 text-xs flex-1 min-w-[160px]"
            />
            <select
              data-testid="filter-plan"
              value={filters.plan}
              onChange={(e) => setFilters(f => ({ ...f, plan: e.target.value }))}
              className="border border-zinc-300 px-2 py-1 text-xs"
            >
              <option value="">Cualquier plan</option>
              <option value="pro">Pro</option>
              <option value="team">Team</option>
            </select>
            <select
              data-testid="filter-status"
              value={filters.status_}
              onChange={(e) => setFilters(f => ({ ...f, status_: e.target.value }))}
              className="border border-zinc-300 px-2 py-1 text-xs"
            >
              <option value="">Cualquier estado</option>
              <option value="open">Abierta</option>
              <option value="complete">Completa</option>
              <option value="expired">Expirada</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs" data-testid="tx-table">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="text-left px-4 py-2 font-bold text-zinc-700 uppercase tracking-wider text-[10px]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Fecha</th>
                  <th className="text-left px-4 py-2 font-bold text-zinc-700 uppercase tracking-wider text-[10px]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Email</th>
                  <th className="text-left px-4 py-2 font-bold text-zinc-700 uppercase tracking-wider text-[10px]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Plan</th>
                  <th className="text-right px-4 py-2 font-bold text-zinc-700 uppercase tracking-wider text-[10px]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Importe</th>
                  <th className="text-left px-4 py-2 font-bold text-zinc-700 uppercase tracking-wider text-[10px]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Estado</th>
                  <th className="text-left px-4 py-2 font-bold text-zinc-700 uppercase tracking-wider text-[10px]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Pago</th>
                  <th className="text-left px-4 py-2 font-bold text-zinc-700 uppercase tracking-wider text-[10px]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Aplicado</th>
                </tr>
              </thead>
              <tbody>
                {(tx?.rows || []).map((row, idx) => (
                  <tr
                    key={row.session_id || idx}
                    className="border-b border-zinc-100 hover:bg-zinc-50"
                    data-testid={`tx-row-${idx}`}
                  >
                    <td className="px-4 py-2 text-zinc-700 whitespace-nowrap">{fmtIso(row.created_at)}</td>
                    <td className="px-4 py-2 text-zinc-900 font-medium">{row.user_email || "—"}</td>
                    <td className="px-4 py-2">
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                        row.plan_id === "team"
                          ? "border-purple-300 bg-purple-50 text-purple-800"
                          : "border-emerald-300 bg-emerald-50 text-emerald-800"
                      }`} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                        {row.plan_id || "?"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-zinc-900">
                      {fmtEur(row.amount)}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                        row.status === "complete"
                          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                          : row.status === "expired"
                          ? "border-zinc-300 bg-zinc-50 text-zinc-600"
                          : "border-amber-300 bg-amber-50 text-amber-800"
                      }`} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                        {row.status || "?"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-zinc-700">{row.payment_status || "—"}</td>
                    <td className="px-4 py-2 text-zinc-700">
                      {row.plan_applied
                        ? <TrendingUp className="w-3.5 h-3.5 text-emerald-600 inline" />
                        : <span className="text-zinc-400">—</span>}
                    </td>
                  </tr>
                ))}
                {(!tx?.rows || tx.rows.length === 0) && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-zinc-500 text-xs">
                      No hay transacciones que coincidan con los filtros.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBillingPage;
