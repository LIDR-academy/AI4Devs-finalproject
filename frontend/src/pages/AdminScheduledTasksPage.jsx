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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  Plus,
  Trash2,
  Play,
  History,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Calendar,
  Brain,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

function authHeaders() {
  const tk = localStorage.getItem("session_token") ||
    document.cookie.split("session_token=")[1]?.split(";")[0] || "";
  return tk ? { Authorization: `Bearer ${tk}` } : {};
}

function fmtDate(iso) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" }); } catch { return iso; }
}

function toDatetimeLocal(iso) {
  const d = new Date(iso);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const EMPTY_FORM = {
  name: "",
  prompt: "",
  system_prompt: "Eres un asistente util.",
  cron_expression: "",
  run_at: "",
  model: "deepseek-v4-pro",
  max_tokens: 4096,
  enabled: true,
};

export default function AdminScheduledTasksPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [execTask, setExecTask] = useState(null);    // task whose history we're viewing
  const [executions, setExecutions] = useState([]);
  const [execLoading, setExecLoading] = useState(false);
  const [execOpen, setExecOpen] = useState(false);   // dialog for viewing a single execution
  const [selectedExec, setSelectedExec] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/admin/scheduled-tasks`, { headers: authHeaders() });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setTasks(data.tasks || []);
    } catch (e) {
      toast.error(`Error cargando tareas: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (task) => {
    setEditId(task.id);
    setForm({
      name: task.name || "",
      prompt: task.prompt || "",
      system_prompt: task.system_prompt || "Eres un asistente util.",
      cron_expression: task.cron_expression || "",
      run_at: task.run_at ? toDatetimeLocal(task.run_at) : "",
      model: task.model || "deepseek-v4-pro",
      max_tokens: task.max_tokens || 4096,
      enabled: task.enabled !== false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.prompt.trim()) {
      toast.error("Nombre y prompt son obligatorios"); return;
    }
    setSaving(true);
    try {
      const url = editId
        ? `${API}/admin/scheduled-tasks/${editId}`
        : `${API}/admin/scheduled-tasks`;
      const method = editId ? "PUT" : "POST";
      const body = { ...form };
      if (body.run_at) body.run_at = new Date(body.run_at).toISOString();
      else delete body.run_at;
      if (body.cron_expression === undefined) delete body.cron_expression;

      const r = await fetch(url, {
        method,
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${r.status}`);
      }
      toast.success(editId ? "Tarea actualizada" : "Tarea creada");
      setDialogOpen(false);
      load();
    } catch (e) {
      toast.error(`Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const r = await fetch(`${API}/admin/scheduled-tasks/${deleteId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || `HTTP ${r.status}`);
      toast.success("Tarea eliminada");
      if (execTask?.id === deleteId) { setExecTask(null); setExecutions([]); }
      load();
    } catch (e) {
      toast.error(`Error: ${e.message}`);
    } finally {
      setDeleteId(null);
    }
  };

  const handleRunNow = async (taskId) => {
    try {
      const r = await fetch(`${API}/admin/scheduled-tasks/${taskId}/run`, {
        method: "POST",
        headers: authHeaders(),
      });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || `HTTP ${r.status}`);
      toast.success("Tarea en cola para ejecucion inmediata");
      load();
    } catch (e) {
      toast.error(`Error: ${e.message}`);
    }
  };

  const viewHistory = async (task) => {
    setExecTask(task);
    setExecLoading(true);
    try {
      const r = await fetch(`${API}/admin/scheduled-tasks/${task.id}/executions`, {
        headers: authHeaders(),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setExecutions(data.executions || []);
    } catch (e) {
      toast.error(`Error cargando historial: ${e.message}`);
    } finally {
      setExecLoading(false);
    }
  };

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
              <Clock className="w-4 h-4 text-zinc-700" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-zinc-900 tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>
                Tareas programadas (admin)
              </h1>
              <p className="text-[11px] text-zinc-400">Ejecuta prompts de DeepSeek V4-Pro de forma programada.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {execTask && (
              <Button size="sm" variant="outline" className="rounded-lg h-8 text-xs" onClick={() => { setExecTask(null); setExecutions([]); }}>
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Volver a tareas
              </Button>
            )}
            <Button size="sm" variant="outline" className="rounded-lg h-8 text-xs" onClick={load}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refrescar
            </Button>
            <Button onClick={openCreate} size="sm" className="rounded-lg h-8 text-xs bg-deep-navy hover:bg-deep-navy/90 text-white" data-testid="st-new-btn">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Nueva tarea
            </Button>
          </div>
        </header>

        <div className="p-4 max-w-[1600px] mx-auto w-full space-y-4" data-testid="admin-scheduled-tasks-root">
          {/* Execution history view */}
          {execTask ? (
            <div className="space-y-4">
              <Card className="rounded-lg border-2 border-zinc-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold" style={{ fontFamily: "'Chivo', sans-serif" }}>{execTask.name}</h2>
                      <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">{execTask.id}</p>
                    </div>
                    <Badge className={`rounded-lg text-[10px] ${execTask.last_status === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-300" : execTask.last_status === "error" ? "bg-red-50 text-red-700 border-red-300" : "bg-zinc-50 text-zinc-500"}`}>
                      {execTask.last_status || "sin ejecutar"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {execLoading ? (
                <div className="text-center py-12 text-zinc-400"><Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" /> Cargando historial...</div>
              ) : executions.length === 0 ? (
                <div className="text-center py-12 text-zinc-400">Sin ejecuciones registradas.</div>
              ) : (
                <div className="space-y-2">
                  {executions.map(ex => (
                    <Card key={ex.id} className="rounded-lg border border-zinc-200 hover:border-zinc-400 cursor-pointer" onClick={() => { setSelectedExec(ex); setExecOpen(true); }}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {ex.status === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-500" />}
                            <span className="text-xs font-mono">{fmtDate(ex.started_at)}</span>
                            <Badge className={`rounded-lg text-[10px] ${ex.status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                              {ex.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-400">{ex.duration_ms}ms</span>
                            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                          </div>
                        </div>
                        {ex.status === "error" && ex.error_message && (
                          <p className="text-[10px] text-red-600 mt-1 truncate">{ex.error_message}</p>
                        )}
                        {ex.status === "success" && ex.response && (
                          <p className="text-[10px] text-zinc-600 mt-1 line-clamp-2">{ex.response.slice(0, 200)}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Task list */
            <>
              {loading ? (
                <div className="text-center py-12 text-zinc-400"><Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" /> Cargando tareas...</div>
              ) : tasks.length === 0 ? (
                <Card className="rounded-lg border-2 border-zinc-200">
                  <CardContent className="p-6 text-center">
                    <Clock className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500">No hay tareas programadas.</p>
                    <p className="text-[11px] text-zinc-400 mt-1">Crea una tarea para ejecutar prompts de DeepSeek automaticamente.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-1">
                  {/* Table header */}
                  <div className="grid grid-cols-12 gap-0 bg-zinc-50 border border-zinc-200 text-xs font-bold text-zinc-500 uppercase tracking-wider"
                       style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    <div className="col-span-3 px-4 py-3 border-r border-zinc-200">Nombre</div>
                    <div className="col-span-2 px-4 py-3 border-r border-zinc-200">Programacion</div>
                    <div className="col-span-2 px-4 py-3 border-r border-zinc-200">Prox. ejecucion</div>
                    <div className="col-span-1 px-4 py-3 border-r border-zinc-200 text-center">Estado</div>
                    <div className="col-span-2 px-4 py-3 border-r border-zinc-200">Ultima ejecucion</div>
                    <div className="col-span-2 px-4 py-3">Acciones</div>
                  </div>

                  <ScrollArea className="max-h-[calc(100vh-200px)]">
                    {tasks.map(task => (
                      <div key={task.id} className="grid grid-cols-12 gap-0 border-b border-x border-zinc-100 hover:bg-zinc-50 transition-colors">
                        <div className="col-span-3 px-4 py-3 border-r border-zinc-100">
                          <div className="text-xs font-bold">{task.name}</div>
                          <div className="text-[10px] text-zinc-400 font-mono truncate mt-0.5">{task.prompt.slice(0, 60)}</div>
                        </div>
                        <div className="col-span-2 px-4 py-3 border-r border-zinc-100 text-xs">
                          {task.cron_expression ? (
                            <Badge className="rounded-lg text-[10px] bg-blue-50 text-blue-700 border-blue-300 font-mono">{task.cron_expression}</Badge>
                          ) : (
                            <span className="text-[10px] text-zinc-400">Puntual</span>
                          )}
                        </div>
                        <div className="col-span-2 px-4 py-3 border-r border-zinc-100 text-[10px] font-mono">
                          {fmtDate(task.run_at)}
                        </div>
                        <div className="col-span-1 px-4 py-3 border-r border-zinc-100 text-center">
                          <div className={`w-2 h-2 rounded-full mx-auto ${
                            task.status === "running" ? "bg-amber-500 animate-pulse" :
                            task.enabled ? "bg-emerald-500" : "bg-zinc-300"
                          }`} title={task.status === "running" ? "Ejecutando" : task.enabled ? "Activo" : "Inactivo"} />
                        </div>
                        <div className="col-span-2 px-4 py-3 border-r border-zinc-100">
                          {task.last_run_at ? (
                            <div>
                              <div className="text-[10px] font-mono">{fmtDate(task.last_run_at)}</div>
                              <Badge className={`rounded-lg text-[8px] mt-0.5 ${task.last_status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                                {task.last_status}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-[10px] text-zinc-400">—</span>
                          )}
                        </div>
                        <div className="col-span-2 px-4 py-3 flex items-center gap-1">
                          <Button size="sm" variant="outline" className="rounded-lg h-6 text-[10px]" onClick={() => handleRunNow(task.id)} title={t("admin.run_now")}>
                            <Play className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-lg h-6 text-[10px]" onClick={() => viewHistory(task)} title={t("admin.history")}>
                            <History className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-lg h-6 text-[10px]" onClick={() => openEdit(task)} title={t("common.edit")}>
                            <Calendar className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="rounded-lg h-6 text-[10px] border-red-300 text-red-700 hover:bg-red-50" onClick={() => setDeleteId(task.id)} title={t("common.delete")}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-lg border border-zinc-200 max-w-xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <Brain className="w-4 h-4" />
              {editId ? t("admin.edit_task") : t("admin.new_task")}
            </DialogTitle>
            <DialogDescription className="text-[11px] text-zinc-400">
              Programa un prompt para que DeepSeek lo ejecute automaticamente en la fecha y hora indicadas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-[10px] font-bold uppercase tracking-wider">Nombre *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="rounded-lg mt-1 text-xs" placeholder="Ej: Resumen diario de noticias IA" maxLength={120} />
            </div>
            <div>
              <Label className="text-[10px] font-bold uppercase tracking-wider">Prompt *</Label>
              <Textarea value={form.prompt} onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))} className="rounded-lg mt-1 text-xs font-mono h-24" placeholder="Instrucciones para DeepSeek..." />
            </div>
            <div>
              <Label className="text-[10px] font-bold uppercase tracking-wider">System prompt</Label>
              <Input value={form.system_prompt} onChange={e => setForm(f => ({ ...f, system_prompt: e.target.value }))} className="rounded-lg mt-1 text-xs" placeholder="Eres un asistente util." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-wider">Cron (5 campos)</Label>
                <Input value={form.cron_expression} onChange={e => setForm(f => ({ ...f, cron_expression: e.target.value }))} className="rounded-lg mt-1 text-xs font-mono" placeholder="0 9 * * *" />
                <p className="text-[9px] text-zinc-400 mt-0.5">min hora dia mes dia-semana</p>
              </div>
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-wider">O fecha puntual</Label>
                <Input type="datetime-local" value={form.run_at} onChange={e => setForm(f => ({ ...f, run_at: e.target.value }))} className="rounded-lg mt-1 text-xs" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-wider">Modelo</Label>
                <select value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} className="w-full border border-zinc-300 rounded-lg px-2 h-8 text-xs mt-1">
                  <option value="deepseek-v4-pro">DeepSeek V4-Pro</option>
                  <option value="deepseek-v4-flash">DeepSeek V4-Flash</option>
                </select>
              </div>
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-wider">Max tokens</Label>
                <Input type="number" value={form.max_tokens} onChange={e => setForm(f => ({ ...f, max_tokens: Number(e.target.value) }))} className="rounded-lg mt-1 text-xs font-mono" min={256} max={8192} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.enabled} onCheckedChange={v => setForm(f => ({ ...f, enabled: v }))} />
              <Label className="text-xs">Activado</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200">
              <Button variant="outline" size="sm" className="rounded-lg h-9 text-xs" onClick={() => setDialogOpen(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleSave} disabled={saving} className="rounded-lg h-9 text-xs bg-deep-navy hover:bg-deep-navy/90 text-white px-6">
                {saving ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> {t("common.saving")}</> : (editId ? t("common.update") : t("common.create"))}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Execution detail dialog */}
      <Dialog open={execOpen} onOpenChange={setExecOpen}>
        <DialogContent className="rounded-lg border border-zinc-200 max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              {selectedExec?.status === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-500" />}
              Ejecucion — {fmtDate(selectedExec?.started_at)}
            </DialogTitle>
            <DialogDescription className="text-[11px] text-zinc-400">
              Prompt enviado y respuesta de {selectedExec?.model || "DeepSeek"}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div><span className="text-zinc-400">Modelo:</span> <span className="font-mono">{selectedExec?.model}</span></div>
              <div><span className="text-zinc-400">Duracion:</span> <span className="font-mono">{selectedExec?.duration_ms}ms</span></div>
              <div><span className="text-zinc-400">Estado:</span> <Badge className={`rounded-lg text-[10px] ${selectedExec?.status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{selectedExec?.status}</Badge></div>
            </div>
            <div>
              <Label className="text-[10px] font-bold uppercase tracking-wider">Prompt enviado</Label>
              <div className="border border-zinc-200 p-3 bg-zinc-50 text-xs font-mono whitespace-pre-wrap mt-1 max-h-32 overflow-auto">{selectedExec?.prompt}</div>
            </div>
            {selectedExec?.status === "success" && (
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-wider">Respuesta de DeepSeek</Label>
                <div className="border border-zinc-200 p-3 bg-white text-xs whitespace-pre-wrap mt-1 max-h-64 overflow-auto">{selectedExec?.response}</div>
              </div>
            )}
            {selectedExec?.status === "error" && (
              <div>
                <Label className="text-[10px] font-bold uppercase tracking-wider text-red-600">Error</Label>
                <div className="border border-red-200 p-3 bg-red-50 text-xs text-red-700 whitespace-pre-wrap mt-1 max-h-32 overflow-auto">{selectedExec?.error_message}</div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent className="rounded-lg border border-zinc-200">
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.delete_task")}</AlertDialogTitle>
            <AlertDialogDescription>
              Se borrara la tarea y todo su historial de ejecucion. Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-lg bg-red-600 hover:bg-red-700 text-white">{t("common.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
