// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth, API } from "@/App";
import ProjectMenuBar from "@/components/ProjectMenuBar";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useI18n } from "@/contexts/I18nContext";
import {
  LifeBuoy,
  Loader2,
  RefreshCcw,
  Filter,
  X,
  CheckCircle2,
  Clock,
  PlayCircle,
  Ban,
  Bug,
  Lightbulb,
  HelpCircle,
  Eye,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

const authHeaders = () => {
  const t = localStorage.getItem("session_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const STATUS_META = {
  open: { label: "Abierta", icon: <Clock className="w-3.5 h-3.5" />, c: "text-blue-700 bg-blue-50 border-blue-300" },
  in_progress: { label: "En progreso", icon: <PlayCircle className="w-3.5 h-3.5" />, c: "text-amber-700 bg-amber-50 border-amber-300" },
  resolved: { label: "Resuelta", icon: <CheckCircle2 className="w-3.5 h-3.5" />, c: "text-emerald-700 bg-emerald-50 border-emerald-300" },
  closed: { label: "Cerrada", icon: <CheckCircle2 className="w-3.5 h-3.5" />, c: "text-zinc-700 bg-zinc-100 border-zinc-300" },
  wontfix: { label: "Won't fix", icon: <Ban className="w-3.5 h-3.5" />, c: "text-red-700 bg-red-50 border-red-300" },
};

const SEV_COLOR = {
  low: "text-emerald-700 bg-emerald-50 border-emerald-300",
  medium: "text-amber-700 bg-amber-50 border-amber-300",
  high: "text-orange-700 bg-orange-50 border-orange-300",
  critical: "text-red-700 bg-red-50 border-red-300",
};

const CAT_ICON = {
  bug: <Bug className="w-3.5 h-3.5" strokeWidth={2.5} />,
  improvement: <Lightbulb className="w-3.5 h-3.5" strokeWidth={2.5} />,
  question: <HelpCircle className="w-3.5 h-3.5" strokeWidth={2.5} />,
};

const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString("es-ES", { hour12: false }) : "—");

const StatBox = ({ label, value, c = "text-zinc-900", testid }) => (
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

const AdminIssuesPage = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({ status_: "", severity: "", category: "" });
  const [selected, setSelected] = useState(null); // full issue incl. screenshot
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const loadAll = useCallback(async () => {
    setRefreshing(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const [ir, sr] = await Promise.all([
        fetch(`${API}/issues?${params.toString()}`, { headers: authHeaders(), credentials: "include" }),
        fetch(`${API}/issues/stats`, { headers: authHeaders(), credentials: "include" }),
      ]);
      if (ir.ok) setItems(await ir.json());
      if (sr.ok) setStats(await sr.json());
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const openDetail = async (id) => {
    setDetailLoading(true);
    try {
      const r = await fetch(`${API}/issues/${id}`, { headers: authHeaders(), credentials: "include" });
      if (r.ok) setSelected(await r.json());
    } finally {
      setDetailLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    const r = await fetch(`${API}/issues/${id}`, {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    if (r.ok) {
      toast.success("Estado actualizado");
      await loadAll();
      if (selected?.id === id) openDetail(id);
    } else {
      toast.error("Error al actualizar");
    }
  };

  const saveNote = async (id, note) => {
    const r = await fetch(`${API}/issues/${id}`, {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ admin_note: note }),
    });
    if (r.ok) {
      toast.success("Nota guardada");
      await loadAll();
    } else {
      toast.error("Error al guardar nota");
    }
  };

  const deleteIssue = async (id) => {
    setConfirmDelete({ id });
  };

  const confirmDeleteIssue = async () => {
    const id = confirmDelete?.id;
    if (!id) return;
    setConfirmDelete(null);
    const r = await fetch(`${API}/issues/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
      credentials: "include",
    });
    if (r.ok) {
      toast.success("Eliminada");
      setSelected(null);
      await loadAll();
    } else {
      toast.error("Error al eliminar");
    }
  };

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
    <>
    <div className="min-h-screen bg-white flex flex-col" data-testid="admin-issues-page">
      <ProjectMenuBar />
      <div className="flex-1 overflow-y-auto flex flex-col">
        <header className="sticky top-0 z-30 bg-white border-b border-zinc-200 h-14 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-deep-navy flex items-center justify-center flex-shrink-0">
              <LifeBuoy className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>ADMIN · INCIDENCIAS</p>
              <h1 className="text-base font-bold text-zinc-900 tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>Gestor de incidencias</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadAll}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 border border-zinc-200 text-zinc-900 hover:bg-deep-navy hover:text-white transition-colors disabled:opacity-50"
              data-testid="refresh-issues-btn"
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
          <p className="text-sm text-zinc-500 mb-6">Reportes de bugs, mejoras y preguntas de usuarios.</p>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <StatBox testid="issue-stat-total" label="TOTAL" value={stats.total} />
            <StatBox testid="issue-stat-open" label="ABIERTAS" value={stats.by_status?.open || 0} c="text-blue-700" />
            <StatBox
              testid="issue-stat-progress"
              label="EN PROGRESO"
              value={stats.by_status?.in_progress || 0}
              c="text-amber-700"
            />
            <StatBox
              testid="issue-stat-resolved"
              label="RESUELTAS"
              value={stats.by_status?.resolved || 0}
              c="text-emerald-700"
            />
            <StatBox
              testid="issue-stat-critical"
              label="CRITICAS"
              value={stats.by_severity?.critical || 0}
              c="text-red-700"
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <Filter className="w-4 h-4 text-zinc-500" />
          {[
            { key: "status_", label: t("common.status"), opts: [["", t("common.all")], ...Object.entries(STATUS_META).map(([k, v]) => [k, t(`admin.issue_status_${k}`) || v.label])] },
            { key: "severity", label: t("common.severity"), opts: [["", t("common.all")], ["low", t("common.low")], ["medium", t("common.medium")], ["high", t("common.high")], ["critical", t("common.critical")]] },
            { key: "category", label: t("common.category"), opts: [["", t("common.all")], ["bug", t("common.bug")], ["improvement", t("common.enhancement")], ["question", t("common.question")]] },
          ].map((f) => (
            <select
              key={f.key}
              value={filters[f.key]}
              onChange={(e) => setFilters((prev) => ({ ...prev, [f.key]: e.target.value }))}
              className="border border-zinc-200 px-2 py-1.5 text-xs focus:border-blue-600 focus:outline-none"
              data-testid={`issues-filter-${f.key}`}
            >
              {f.opts.map(([v, l]) => (
                <option key={v} value={v}>{`${f.label}: ${l}`}</option>
              ))}
            </select>
          ))}
        </div>

        {/* List */}
        <div className="border border-zinc-200 bg-white">
          <div className="grid grid-cols-[1fr_100px_110px_110px_180px_100px] gap-3 px-4 py-2 border-b border-zinc-200 bg-deep-navy text-white text-[10px] font-bold tracking-[0.15em] uppercase"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            <span>Titulo</span>
            <span>{t("common.category")}</span>
            <span>{t("common.severity")}</span>
            <span>{t("common.status")}</span>
            <span>Reporter</span>
            <span>{t("common.actions")}</span>
          </div>
          {items.length === 0 ? (
            <div className="p-10 text-center text-sm text-zinc-500" data-testid="issues-empty">
              <LifeBuoy className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
              No hay incidencias con los filtros actuales.
            </div>
          ) : (
            items.map((it) => {
              const sm = STATUS_META[it.status] || STATUS_META.open;
              return (
                <div
                  key={it.id}
                  className="grid grid-cols-[1fr_100px_110px_110px_180px_100px] gap-3 px-4 py-3 border-b border-zinc-200 last:border-0 hover:bg-zinc-50 items-center"
                  data-testid={`issue-row-${it.id}`}
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-zinc-900 truncate">{it.title}</div>
                    <div className="text-[11px] text-zinc-500">{fmtDate(it.created_at)}</div>
                  </div>
                  <div>
                    <span
                      className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase text-zinc-600"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      {CAT_ICON[it.category]} {it.category}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`inline-block text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 border ${SEV_COLOR[it.severity]}`}
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      {it.severity}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 border ${sm.c}`}
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      {sm.icon} {sm.label}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-zinc-700 truncate">{it.reporter_name}</div>
                    <div className="text-[10px] text-zinc-500 truncate">{it.reporter_email}</div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openDetail(it.id)}
                      className="p-1.5 border border-zinc-300 text-zinc-700 hover:bg-deep-navy hover:text-white hover:border-zinc-900 transition-colors"
                      data-testid={`issue-view-${it.id}`}
                      aria-label="Ver"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteIssue(it.id)}
                      className="p-1.5 border border-red-300 text-red-700 hover:bg-red-50 transition-colors"
                      data-testid={`issue-delete-${it.id}`}
                      aria-label={t("common.delete")}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex justify-end"
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <div className="bg-white border-l-2 border-zinc-900 w-full max-w-xl h-full overflow-y-auto" data-testid="issue-detail-drawer">
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 bg-deep-navy text-white sticky top-0 z-10">
              <span
                className="text-[11px] font-bold tracking-[0.2em] uppercase"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                Incidencia
              </span>
              <button onClick={() => setSelected(null)} className="p-1 hover:bg-white/10">
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>

            {detailLoading ? (
              <div className="p-10 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
              </div>
            ) : (
              <div className="p-5 space-y-5">
                <div>
                  <h2 className="text-xl font-black text-zinc-900" style={{ fontFamily: "'Chivo', sans-serif" }}>
                    {selected.title}
                  </h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span
                      className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 border ${SEV_COLOR[selected.severity]}`}
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      {selected.severity}
                    </span>
                    <span
                      className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 border border-zinc-300 bg-zinc-50 text-zinc-700"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      {selected.category}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-zinc-500 space-y-1">
                  <div>
                    <strong className="text-zinc-700">Reporter:</strong> {selected.reporter_name} · {selected.reporter_email}
                  </div>
                  <div>
                    <strong className="text-zinc-700">Creada:</strong> {fmtDate(selected.created_at)}
                  </div>
                  {selected.resolved_at && (
                    <div>
                      <strong className="text-zinc-700">Resuelta:</strong> {fmtDate(selected.resolved_at)}
                    </div>
                  )}
                  {selected.page_url && (
                    <div className="truncate">
                      <strong className="text-zinc-700">URL:</strong>{" "}
                      <a href={selected.page_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">
                        {selected.page_url}
                      </a>
                    </div>
                  )}
                </div>

                <div>
                  <label
                    className="block text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-500 mb-1"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    Descripcion
                  </label>
                  <div className="text-sm text-zinc-800 whitespace-pre-wrap bg-zinc-50 border border-zinc-200 p-3">
                    {selected.description}
                  </div>
                </div>

                {selected.screenshot && (
                  <div>
                    <label
                      className="block text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-500 mb-1"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      Captura
                    </label>
                    <img
                      src={selected.screenshot}
                      alt="captura"
                      className="w-full max-h-80 object-contain bg-zinc-50 border-2 border-zinc-200"
                      data-testid="issue-detail-screenshot"
                    />
                  </div>
                )}

                {/* Status selector */}
                <div>
                  <label
                    className="block text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-500 mb-2"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    Estado
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(STATUS_META).map(([k, v]) => (
                      <button
                        key={k}
                        onClick={() => updateStatus(selected.id, k)}
                        data-testid={`issue-status-btn-${k}`}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase border-2 transition-colors ${
                          selected.status === k ? v.c : "border-zinc-300 text-zinc-500 hover:border-zinc-900"
                        }`}
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      >
                        {v.icon} {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Admin note */}
                <AdminNoteEditor
                  initial={selected.admin_note || ""}
                  onSave={(note) => saveNote(selected.id, note)}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    <ConfirmDialog
      open={!!confirmDelete}
      onOpenChange={(open) => { if (!open) setConfirmDelete(null); }}
      title="Eliminar incidencia"
      description="¿Eliminar esta incidencia? Esta acción no se puede deshacer."
      onConfirm={confirmDeleteIssue}
    />
    </>
  );
};

const AdminNoteEditor = ({ initial, onSave }) => {
  const [note, setNote] = useState(initial);
  useEffect(() => { setNote(initial); }, [initial]);
  return (
    <div>
      <label
        className="block text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-500 mb-1"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        Nota admin (interna)
      </label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
        placeholder="Comentario interno para el equipo..."
        className="w-full border border-zinc-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none resize-none"
        data-testid="issue-admin-note"
      />
      <div className="flex justify-end mt-2">
        <button
          onClick={() => onSave(note)}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold tracking-[0.15em] uppercase"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          data-testid="issue-save-note-btn"
        >
          Guardar nota
        </button>
      </div>
    </div>
  );
};

export default AdminIssuesPage;
