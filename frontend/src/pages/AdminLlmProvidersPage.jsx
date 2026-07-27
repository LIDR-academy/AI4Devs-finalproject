// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect, useCallback } from "react";
import { API } from "@/App";
import ProjectMenuBar from "@/components/ProjectMenuBar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Brain, Plus, Pencil, Trash2, Zap, RefreshCw, Loader2, CheckCircle2,
  XCircle, Activity, DollarSign, AlertTriangle, ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function authHeaders() {
  const tk = localStorage.getItem("session_token") ||
    document.cookie.split("session_token=")[1]?.split(";")[0] || "";
  return tk ? { Authorization: `Bearer ${tk}` } : {};
}

const EMPTY_FORM = {
  label: "", base_url: "", api_key: "", models: "", default_model: "",
  enabled: true, priority: 999, cost_in_per_1m: 0, cost_out_per_1m: 0,
};

const fmtNum = (n) => (n ?? 0).toLocaleString("es-ES");
const fmtCost = (n) => `$${(n ?? 0).toFixed(4)}`;

export default function AdminLlmProvidersPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("providers");

  // Providers state
  const [providers, setProviders] = useState([]);
  const [health, setHealth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editKey, setEditKey] = useState(null);   // null = create (key field editable)
  const [formKey, setFormKey] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteKey, setDeleteKey] = useState(null);
  const [testing, setTesting] = useState({});     // key -> bool
  const [testResults, setTestResults] = useState({}); // key -> {ok, latency_ms, error}

  // Usage state
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const loadProviders = useCallback(async () => {
    setLoading(true);
    try {
      const [rProv, rHealth] = await Promise.all([
        fetch(`${API}/admin/llm/providers`, { headers: authHeaders() }),
        fetch(`${API}/admin/llm/health`, { headers: authHeaders() }),
      ]);
      if (!rProv.ok) throw new Error(`HTTP ${rProv.status}`);
      setProviders(await rProv.json());
      if (rHealth.ok) setHealth(await rHealth.json());
    } catch (e) {
      toast.error(`Error cargando providers: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const r = await fetch(`${API}/admin/llm/usage/stats?days=${days}`, { headers: authHeaders() });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setStats(await r.json());
    } catch (e) {
      toast.error(`Error cargando uso: ${e.message}`);
    } finally {
      setStatsLoading(false);
    }
  }, [days]);

  useEffect(() => { loadProviders(); }, [loadProviders]);
  useEffect(() => { if (tab === "usage") loadStats(); }, [tab, loadStats]);

  const healthOf = (key) => health.find((h) => h.provider === key) || {};

  // ---------------------------------------------------------------------------
  // Provider CRUD
  // ---------------------------------------------------------------------------

  const openCreate = () => {
    setEditKey(null);
    setFormKey("");
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (p) => {
    setEditKey(p.key);
    setFormKey(p.key);
    setForm({
      label: p.label || "",
      base_url: p.base_url || "",
      api_key: "",   // never prefill; empty keeps current key
      models: (p.models || []).join(", "),
      default_model: p.default_model || "",
      enabled: !!p.enabled,
      priority: p.priority ?? 999,
      cost_in_per_1m: p.cost_in_per_1m ?? 0,
      cost_out_per_1m: p.cost_out_per_1m ?? 0,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    setSaving(true);
    const payload = {
      label: form.label.trim() || undefined,
      base_url: form.base_url.trim() || undefined,
      models: form.models ? form.models.split(",").map((m) => m.trim()).filter(Boolean) : undefined,
      default_model: form.default_model.trim() || undefined,
      enabled: form.enabled,
      priority: Number(form.priority),
      cost_in_per_1m: Number(form.cost_in_per_1m) || 0,
      cost_out_per_1m: Number(form.cost_out_per_1m) || 0,
    };
    if (form.api_key) payload.api_key = form.api_key.trim();
    try {
      const isCreate = editKey === null;
      const url = isCreate
        ? `${API}/admin/llm/providers?key=${encodeURIComponent(formKey.trim())}`
        : `${API}/admin/llm/providers/${encodeURIComponent(editKey)}`;
      const r = await fetch(url, {
        method: isCreate ? "POST" : "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${r.status}`);
      }
      toast.success(isCreate ? "Provider creado" : "Provider actualizado");
      setDialogOpen(false);
      loadProviders();
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleEnabled = async (p, enabled) => {
    try {
      const r = await fetch(`${API}/admin/llm/providers/${encodeURIComponent(p.key)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ enabled }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setProviders((prev) => prev.map((x) => (x.key === p.key ? { ...x, enabled } : x)));
      toast.success(`${p.label} ${enabled ? "activado" : "desactivado"}`);
    } catch (e) {
      toast.error(`No se pudo cambiar el estado: ${e.message}`);
    }
  };

  const doDelete = async () => {
    try {
      const r = await fetch(`${API}/admin/llm/providers/${encodeURIComponent(deleteKey)}`, {
        method: "DELETE", headers: authHeaders(),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      toast.success("Provider eliminado");
      setDeleteKey(null);
      loadProviders();
    } catch (e) {
      toast.error(e.message);
    }
  };

  const testConnection = async (p) => {
    setTesting((t) => ({ ...t, [p.key]: true }));
    setTestResults((r) => ({ ...r, [p.key]: undefined }));
    try {
      const r = await fetch(`${API}/admin/llm/providers/${encodeURIComponent(p.key)}/test`, {
        method: "POST", headers: authHeaders(),
      });
      const data = await r.json();
      setTestResults((prev) => ({ ...prev, [p.key]: data }));
      if (data.ok) toast.success(`${p.label}: OK (${data.latency_ms} ms)`);
      else toast.error(`${p.label}: ${data.error || "fallo de conexión"}`);
    } catch (e) {
      setTestResults((prev) => ({ ...prev, [p.key]: { ok: false, error: e.message } }));
      toast.error(`${p.label}: ${e.message}`);
    } finally {
      setTesting((t) => ({ ...t, [p.key]: false }));
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-background">
      <ProjectMenuBar />
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="px-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Brain className="w-6 h-6 text-violet-600" />
          <div>
            <h1 className="text-xl font-bold">LLM Gateway</h1>
            <p className="text-sm text-muted-foreground">
              Providers, routing por prioridad, salud y consumo de tokens
            </p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={tab === "usage" ? loadStats : loadProviders}>
              <RefreshCw className="w-4 h-4 mr-1" /> Actualizar
            </Button>
            <Button size="sm" onClick={openCreate} data-testid="llm-provider-create">
              <Plus className="w-4 h-4 mr-1" /> Provider
            </Button>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="providers">Providers</TabsTrigger>
            <TabsTrigger value="usage">Uso y costes</TabsTrigger>
          </TabsList>

          {/* ================= PROVIDERS ================= */}
          <TabsContent value="providers">
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : (
              <div className="space-y-3">
                {providers.map((p) => {
                  const h = healthOf(p.key);
                  const test = testResults[p.key];
                  return (
                    <Card key={p.key} data-testid={`llm-provider-${p.key}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="min-w-48">
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{p.label}</span>
                              <Badge variant="outline" className="text-[10px]">{p.key}</Badge>
                              {h.breaker_open ? (
                                <Badge className="bg-red-100 text-red-700 border-red-300 text-[10px]">
                                  <AlertTriangle className="w-3 h-3 mr-1" /> breaker abierto
                                </Badge>
                              ) : (
                                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 text-[10px]">
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> operativo
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 font-mono truncate">
                              {p.base_url || "—"}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              Key: {p.has_api_key ? (p.api_key_masked || "env") : "no configurada"}
                              {" · "}Modelos: {(p.models || []).join(", ") || "—"}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Label className="text-xs text-muted-foreground">Prioridad</Label>
                            <Badge variant="secondary" className="font-mono">{p.priority}</Badge>
                          </div>

                          <div className="flex items-center gap-2">
                            <Switch
                              checked={!!p.enabled}
                              onCheckedChange={(v) => toggleEnabled(p, v)}
                              data-testid={`llm-toggle-${p.key}`}
                            />
                            <Label className="text-xs">{p.enabled ? "Activo" : "Inactivo"}</Label>
                          </div>

                          <div className="ml-auto flex items-center gap-1">
                            {test && (
                              <span className={`text-xs mr-1 ${test.ok ? "text-emerald-600" : "text-red-600"}`}>
                                {test.ok ? `${test.latency_ms} ms` : "fallo"}
                              </span>
                            )}
                            <Button variant="outline" size="sm" disabled={!!testing[p.key]}
                              onClick={() => testConnection(p)} data-testid={`llm-test-${p.key}`}>
                              {testing[p.key] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openEdit(p)} data-testid={`llm-edit-${p.key}`}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700"
                              onClick={() => setDeleteKey(p.key)} data-testid={`llm-delete-${p.key}`}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {providers.length === 0 && (
                  <p className="text-center text-muted-foreground py-12">
                    Sin providers. El seed desde variables de entorno se crea en el primer arranque del backend.
                  </p>
                )}
              </div>
            )}
          </TabsContent>

          {/* ================= USAGE ================= */}
          <TabsContent value="usage">
            <div className="flex items-center gap-2 mb-4">
              {[7, 30, 90].map((d) => (
                <Button key={d} size="sm" variant={days === d ? "default" : "outline"} onClick={() => setDays(d)}>
                  {d}d
                </Button>
              ))}
            </div>

            {statsLoading || !stats ? (
              <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                  <StatCard icon={<Activity className="w-4 h-4" />} label="Llamadas" value={fmtNum(stats.totals.calls)} />
                  <StatCard icon={<Brain className="w-4 h-4" />} label="Tokens in" value={fmtNum(stats.totals.tokens_in)} />
                  <StatCard icon={<Brain className="w-4 h-4" />} label="Tokens out" value={fmtNum(stats.totals.tokens_out)} />
                  <StatCard icon={<DollarSign className="w-4 h-4" />} label="Coste est." value={fmtCost(stats.totals.cost_usd)} />
                  <StatCard icon={<XCircle className="w-4 h-4" />} label="Errores"
                    value={`${fmtNum(stats.totals.errors)} (${stats.totals.calls ? ((stats.totals.errors / stats.totals.calls) * 100).toFixed(1) : 0}%)`} />
                </div>

                <h3 className="font-semibold mb-2 text-sm">Por provider</h3>
                <UsageTable rows={stats.by_provider} showLatency />

                <h3 className="font-semibold mb-2 mt-6 text-sm">Por modelo</h3>
                <UsageTable rows={stats.by_model} showLatency />

                <h3 className="font-semibold mb-2 mt-6 text-sm">Por día</h3>
                <UsageTable rows={[...stats.by_day].reverse()} />
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editKey === null ? "Nuevo provider" : `Editar ${editKey}`}</DialogTitle>
            <DialogDescription>
              La API key se almacena cifrada. Dejar vacía para conservar la actual.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {editKey === null && (
              <div>
                <Label>Key (identificador único, minúsculas)</Label>
                <Input value={formKey} onChange={(e) => setFormKey(e.target.value)} placeholder="mi-provider" />
              </div>
            )}
            <div>
              <Label>Nombre visible</Label>
              <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            </div>
            <div>
              <Label>Base URL</Label>
              <Input value={form.base_url} onChange={(e) => setForm({ ...form, base_url: e.target.value })} placeholder="https://api.ejemplo.com/v1" />
            </div>
            <div>
              <Label>API key {editKey !== null && "(vacío = sin cambios)"}</Label>
              <Input type="password" value={form.api_key} onChange={(e) => setForm({ ...form, api_key: e.target.value })} placeholder="sk-..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Modelos (separados por coma)</Label>
                <Input value={form.models} onChange={(e) => setForm({ ...form, models: e.target.value })} />
              </div>
              <div>
                <Label>Modelo por defecto</Label>
                <Input value={form.default_model} onChange={(e) => setForm({ ...form, default_model: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Prioridad</Label>
                <Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} />
              </div>
              <div>
                <Label>$/1M tok in</Label>
                <Input type="number" step="0.01" value={form.cost_in_per_1m} onChange={(e) => setForm({ ...form, cost_in_per_1m: e.target.value })} />
              </div>
              <div>
                <Label>$/1M tok out</Label>
                <Input type="number" step="0.01" value={form.cost_out_per_1m} onChange={(e) => setForm({ ...form, cost_out_per_1m: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} />
              <Label>Activo</Label>
            </div>
            <Button className="w-full" onClick={save} disabled={saving || (editKey === null && !formKey.trim())} data-testid="llm-provider-save">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteKey} onOpenChange={() => setDeleteKey(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar provider "{deleteKey}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Las llamadas en curso usarán el fallback de variables de entorno. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">{icon} {label}</div>
        <div className="text-lg font-bold font-mono">{value}</div>
      </CardContent>
    </Card>
  );
}

function UsageTable({ rows, showLatency = false }) {
  if (!rows || rows.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">Sin datos en el periodo.</p>;
  }
  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr className="text-left text-xs text-muted-foreground">
            <th className="px-3 py-2">Clave</th>
            <th className="px-3 py-2 text-right">Llamadas</th>
            <th className="px-3 py-2 text-right">Tok in</th>
            <th className="px-3 py-2 text-right">Tok out</th>
            <th className="px-3 py-2 text-right">Coste</th>
            <th className="px-3 py-2 text-right">Errores</th>
            {showLatency && <th className="px-3 py-2 text-right">Latencia media</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key ?? "total"} className="border-t">
              <td className="px-3 py-1.5 font-mono text-xs">{r.key}</td>
              <td className="px-3 py-1.5 text-right">{fmtNum(r.calls)}</td>
              <td className="px-3 py-1.5 text-right">{fmtNum(r.tokens_in)}</td>
              <td className="px-3 py-1.5 text-right">{fmtNum(r.tokens_out)}</td>
              <td className="px-3 py-1.5 text-right">{fmtCost(r.cost_usd)}</td>
              <td className={`px-3 py-1.5 text-right ${r.errors ? "text-red-600" : ""}`}>{fmtNum(r.errors)}</td>
              {showLatency && <td className="px-3 py-1.5 text-right">{r.avg_latency_ms != null ? `${fmtNum(r.avg_latency_ms)} ms` : "—"}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
