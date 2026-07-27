// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect, useCallback } from "react";
import { useAuth, API } from "@/App";
import ProjectMenuBar from "@/components/ProjectMenuBar";
import { toast } from "sonner";
import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Megaphone,
  Plus,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

const SEVERITIES = [
  { v: "info", l: "Info", icon: Info, color: "blue" },
  { v: "success", l: "Exito", icon: CheckCircle2, color: "emerald" },
  { v: "warning", l: "Aviso", icon: AlertTriangle, color: "amber" },
  { v: "critical", l: "Critico", icon: AlertCircle, color: "red" },
];

const AUDIENCES = [
  { v: "all", l: "Todos los visitantes" },
  { v: "free", l: "Solo plan FREE" },
  { v: "subscription", l: "Solo SUBSCRIPCION" },
  { v: "admin", l: "Solo administradores" },
  { v: "enterprise", l: "Solo enterprise" },
];

const EMPTY_FORM = {
  title: "",
  body: "",
  severity: "info",
  audience: "all",
  active: true,
  dismissible: true,
  cta_label: "",
  cta_url: "",
  starts_at: "",
  ends_at: "",
};

function authHeaders() {
  const tk = localStorage.getItem("session_token") ||
    document.cookie.split("session_token=")[1]?.split(";")[0] || "";
  return tk ? { Authorization: `Bearer ${tk}` } : {};
}

function fmtDate(iso) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" }); } catch { return iso; }
}

export default function AdminAnnouncementsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null); // null = "new"
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [invalidateOnSave, setInvalidateOnSave] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/announcements`, { headers: authHeaders() });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setList(await r.json());
    } catch (e) {
      toast.error(`Error cargando anuncios: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startNew = () => {
    setActiveId(null);
    setForm(EMPTY_FORM);
    setInvalidateOnSave(false);
  };

  const startEdit = (ann) => {
    setActiveId(ann.id);
    setForm({
      title: ann.title || "",
      body: ann.body || "",
      severity: ann.severity || "info",
      audience: ann.audience || "all",
      active: ann.active !== false,
      dismissible: ann.dismissible !== false,
      cta_label: ann.cta_label || "",
      cta_url: ann.cta_url || "",
      starts_at: ann.starts_at || "",
      ends_at: ann.ends_at || "",
    });
    setInvalidateOnSave(false);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Titulo y cuerpo son obligatorios"); return;
    }
    setSaving(true);
    try {
      const url = activeId ? `${API}/announcements/${activeId}` : `${API}/announcements`;
      const method = activeId ? "PUT" : "POST";
      const body = activeId ? { ...form, invalidate_dismissals: invalidateOnSave } : form;
      const r = await fetch(url, {
        method,
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${r.status}`);
      }
      const saved = await r.json();
      toast.success(activeId ? "Anuncio actualizado" : "Anuncio creado");
      setActiveId(saved.id);
      setInvalidateOnSave(false);
      load();
    } catch (e) {
      toast.error(`Error guardando: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const r = await fetch(`${API}/announcements/${deleteId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${r.status}`);
      }
      toast.success("Anuncio eliminado");
      if (activeId === deleteId) startNew();
      load();
    } catch (e) {
      toast.error(`Error: ${e.message}`);
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleActive = async (ann) => {
    try {
      const r = await fetch(`${API}/announcements/${ann.id}`, {
        method: "PUT",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ active: !ann.active }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      toast.success(ann.active ? "Desactivado" : "Activado");
      load();
    } catch (e) {
      toast.error(`Error: ${e.message}`);
    }
  };

  const sevMeta = SEVERITIES.find(s => s.v === form.severity) || SEVERITIES[0];

  if (user && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <ProjectMenuBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <p className="text-sm font-bold">Solo administradores</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ProjectMenuBar />
      <div className="flex-1 overflow-y-auto flex flex-col">
        <header className="sticky top-0 z-30 bg-white border-b border-zinc-200 h-14 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-zinc-200 flex items-center justify-center">
              <Megaphone className="w-4 h-4 text-zinc-700" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-zinc-900 tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>
                Anuncios globales (admin)
              </h1>
              <p className="text-[11px] text-zinc-400">Gestiona los banners que se muestran a los usuarios al entrar.</p>
            </div>
          </div>
          <Button onClick={startNew} size="sm" className="rounded-lg h-8 text-xs bg-deep-navy hover:bg-deep-navy/90 text-white" data-testid="ann-new-btn">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Nuevo anuncio
          </Button>
        </header>

        <div className="grid grid-cols-12 gap-4 p-4 max-w-[1500px] mx-auto w-full" data-testid="admin-announcements-root">
          {/* List */}
          <aside className="col-span-12 lg:col-span-4 space-y-2">
            <Card className="rounded-lg border-2 border-zinc-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-[10px] font-bold uppercase tracking-wider">Anuncios ({list.length})</h2>
                  <Button variant="ghost" size="sm" className="rounded-lg h-6 text-[10px]" onClick={load}>Refrescar</Button>
                </div>
                {loading ? (
                  <div className="text-[11px] text-zinc-400 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Cargando...</div>
                ) : list.length === 0 ? (
                  <div className="text-[11px] text-zinc-400 text-center py-6">No hay anuncios. Crea el primero.</div>
                ) : (
                  <div className="space-y-1">
                    {list.map(ann => {
                      const sm = SEVERITIES.find(s => s.v === ann.severity) || SEVERITIES[0];
                      const SmIcon = sm.icon;
                      const sel = activeId === ann.id;
                      return (
                        <div
                          key={ann.id}
                          className={`border-2 ${sel ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-400"} p-2`}
                          data-testid={`ann-list-${ann.id}`}
                        >
                          <button
                            type="button"
                            onClick={() => startEdit(ann)}
                            className="w-full text-left"
                          >
                            <div className="flex items-start gap-2">
                              <SmIcon className={`w-3.5 h-3.5 text-${sm.color}-600 flex-shrink-0 mt-0.5`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1 flex-wrap">
                                  <span className="text-xs font-bold truncate">{ann.title}</span>
                                  {!ann.active && <Badge variant="secondary" className="rounded-lg text-[8px] bg-zinc-200">INACTIVO</Badge>}
                                </div>
                                <div className="text-[10px] text-zinc-500 line-clamp-2">{ann.body}</div>
                                <div className="text-[10px] text-zinc-400 mt-0.5">
                                  v{ann.version} · {ann.audience} · {fmtDate(ann.updated_at || ann.created_at)}
                                </div>
                              </div>
                            </div>
                          </button>
                          <div className="flex items-center gap-1 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-lg h-6 text-[10px] flex-1"
                              onClick={() => handleToggleActive(ann)}
                              data-testid={`ann-toggle-${ann.id}`}
                            >
                              {ann.active ? <><EyeOff className="w-3 h-3 mr-1" />Desactivar</> : <><Eye className="w-3 h-3 mr-1" />Activar</>}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-lg h-6 text-[10px] border-red-300 text-red-700 hover:bg-red-50"
                              onClick={() => setDeleteId(ann.id)}
                              data-testid={`ann-delete-${ann.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Editor */}
          <section className="col-span-12 lg:col-span-8" data-testid="ann-editor">
            <Card className="rounded-lg border-2 border-zinc-200">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>
                    {activeId ? "Editar anuncio" : "Nuevo anuncio"}
                  </h2>
                  {activeId && <span className="text-[10px] font-mono text-zinc-400">{activeId}</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider">Titulo *</Label>
                    <Input
                      value={form.title}
                      onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      className="rounded-lg mt-1 text-xs"
                      placeholder="Ej: Mantenimiento programado"
                      maxLength={160}
                      data-testid="ann-title-input"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-[10px] font-bold uppercase tracking-wider">Cuerpo del mensaje *</Label>
                    <Textarea
                      value={form.body}
                      onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                      className="rounded-lg mt-1 text-xs h-24"
                      placeholder="Mensaje completo que veran los usuarios..."
                      maxLength={4000}
                      data-testid="ann-body-input"
                    />
                    <div className="text-[10px] text-zinc-400 mt-1">{form.body.length}/4000</div>
                  </div>

                  <div>
                    <Label className="text-[10px] font-bold uppercase tracking-wider">Severidad</Label>
                    <div className="grid grid-cols-4 gap-1 mt-1">
                      {SEVERITIES.map(s => {
                        const SI = s.icon;
                        const sel = form.severity === s.v;
                        return (
                          <button
                            key={s.v}
                            type="button"
                            onClick={() => setForm(f => ({ ...f, severity: s.v }))}
                            className={`flex flex-col items-center gap-0.5 py-1.5 border-2 ${sel ? `border-${s.color}-500 bg-${s.color}-50 text-${s.color}-800` : "border-zinc-200 hover:border-zinc-400"}`}
                            data-testid={`ann-severity-${s.v}`}
                          >
                            <SI className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-bold uppercase">{s.l}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label className="text-[10px] font-bold uppercase tracking-wider">Audiencia</Label>
                    <select
                      value={form.audience}
                      onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}
                      className="w-full border border-zinc-300 rounded-lg px-2 h-8 text-xs mt-1"
                      data-testid="ann-audience-select"
                    >
                      {AUDIENCES.map(a => <option key={a.v} value={a.v}>{a.l}</option>)}
                    </select>
                  </div>

                  <div>
                    <Label className="text-[10px] font-bold uppercase tracking-wider">CTA texto (opcional)</Label>
                    <Input
                      value={form.cta_label}
                      onChange={e => setForm(f => ({ ...f, cta_label: e.target.value }))}
                      className="rounded-lg mt-1 text-xs"
                      placeholder="Ej: Ver planes"
                      maxLength={60}
                      data-testid="ann-cta-label-input"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold uppercase tracking-wider">CTA URL (opcional)</Label>
                    <Input
                      value={form.cta_url}
                      onChange={e => setForm(f => ({ ...f, cta_url: e.target.value }))}
                      className="rounded-lg mt-1 text-xs"
                      placeholder="/pricing o https://..."
                      data-testid="ann-cta-url-input"
                    />
                  </div>

                  <div>
                    <Label className="text-[10px] font-bold uppercase tracking-wider">Inicio (ISO 8601, opcional)</Label>
                    <Input
                      value={form.starts_at || ""}
                      onChange={e => setForm(f => ({ ...f, starts_at: e.target.value }))}
                      className="rounded-lg mt-1 text-xs font-mono"
                      placeholder="2026-05-10T08:00:00Z"
                      data-testid="ann-starts-at-input"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold uppercase tracking-wider">Fin (ISO 8601, opcional)</Label>
                    <Input
                      value={form.ends_at || ""}
                      onChange={e => setForm(f => ({ ...f, ends_at: e.target.value }))}
                      className="rounded-lg mt-1 text-xs font-mono"
                      placeholder="2026-05-15T18:00:00Z"
                      data-testid="ann-ends-at-input"
                    />
                  </div>

                  <div className="flex items-center gap-2 md:col-span-1">
                    <Switch checked={form.active} onCheckedChange={v => setForm(f => ({ ...f, active: v }))} data-testid="ann-active-switch" />
                    <Label className="text-xs">Activo</Label>
                  </div>
                  <div className="flex items-center gap-2 md:col-span-1">
                    <Switch checked={form.dismissible} onCheckedChange={v => setForm(f => ({ ...f, dismissible: v }))} data-testid="ann-dismissible-switch" />
                    <Label className="text-xs">El usuario puede cerrar</Label>
                  </div>

                  {activeId && (
                    <div className="md:col-span-2 border-t border-zinc-200 pt-3 flex items-center gap-2">
                      <Switch checked={invalidateOnSave} onCheckedChange={setInvalidateOnSave} data-testid="ann-invalidate-switch" />
                      <Label className="text-xs flex items-center gap-1">
                        <RotateCcw className="w-3 h-3" />
                        Volver a mostrar a usuarios que ya lo cerraron
                      </Label>
                      <span className="text-[10px] text-zinc-400">(bump version)</span>
                    </div>
                  )}
                </div>

                {/* Preview */}
                <div className="border-t border-zinc-200 pt-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Vista previa</div>
                  <div className={`border-2 border-${sevMeta.color}-400 bg-${sevMeta.color}-50 px-3 py-2 flex items-start gap-2`}>
                    <sevMeta.icon className={`w-4 h-4 text-${sevMeta.color}-700 flex-shrink-0 mt-0.5`} />
                    <div className="flex-1">
                      <div className="text-xs font-bold">{form.title || "Titulo del anuncio"}</div>
                      <div className="text-[11px] mt-0.5">{form.body || "Cuerpo del mensaje..."}</div>
                    </div>
                    {form.cta_label && form.cta_url && (
                      <span className="text-[11px] font-bold underline">{form.cta_label} →</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-zinc-200 pt-3">
                  {activeId && (
                    <Button variant="outline" size="sm" className="rounded-lg h-9 text-xs" onClick={startNew}>
                      Cancelar
                    </Button>
                  )}
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-lg h-9 text-xs bg-deep-navy hover:bg-deep-navy/90 text-white px-6"
                    data-testid="ann-save-btn"
                  >
                    {saving ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> {t("common.saving")}</> : <><Save className="w-3.5 h-3.5 mr-2" /> {activeId ? t("common.update") : t("common.create")}</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent className="rounded-lg border border-zinc-200">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar anuncio</AlertDialogTitle>
            <AlertDialogDescription>
              Se borrara el anuncio y todas las marcas de "cerrado" de los usuarios. Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-lg bg-red-600 hover:bg-red-700 text-white" data-testid="ann-confirm-delete">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
