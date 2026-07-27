// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { API } from "@/App";
import ConfirmDialog from "@/components/ConfirmDialog";
import { downloadBlob } from "@/lib/downloadFile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MarkdownEditor from "@/components/MarkdownEditor";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  ArrowLeft, Plus, Download, Upload, Sparkles, FileText, ShieldAlert,
  Edit3, Trash2, Save, RefreshCcw, FileJson, FileSpreadsheet, FileCode2,
  Users, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import SpeckitRenderer from "@/components/SpeckitRenderer";
import SpeckitTimeline from "@/components/SpeckitTimeline";
import SpeckitSuggestedActions from "@/components/SpeckitSuggestedActions";
import DiagramLinker from "@/components/DiagramLinker";
import AiLoadingOverlay from "@/components/AiLoadingOverlay";

const authHeaders = () => {
  const t = localStorage.getItem("session_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const MOSCOW_META = {
  must:   { label: "MUST",   color: "bg-red-600 text-white border-red-700" },
  should: { label: "SHOULD", color: "bg-amber-500 text-white border-amber-600" },
  could:  { label: "COULD",  color: "bg-sky-500 text-white border-sky-600" },
  wont:   { label: "WON'T",  color: "bg-zinc-500 text-white border-zinc-600" },
};

const TYPE_META = {
  functional:     { label: "Funcional",    color: "border-emerald-500 text-emerald-700" },
  non_functional: { label: "No funcional", color: "border-violet-500 text-violet-700" },
};

const STATUS_META = {
  draft:        { label: "Borrador",    color: "border-zinc-400 text-zinc-600" },
  approved:     { label: "Aprobado",    color: "border-blue-500 text-blue-700" },
  implemented:  { label: "Implementado", color: "border-emerald-500 text-emerald-700" },
  deprecated:   { label: "Obsoleto",     color: "border-red-500 text-red-700" },
};

// ---------------------- Requirement dialog ----------------------

const emptyReq = () => ({
  id: null,
  code: "",
  title: "",
  description: "",
  type: "functional",
  category: "",
  moscow: "should",
  status: "draft",
  acceptance_criteria: [],
  linked_diagrams: [],
  raci: { responsible: [], accountable: "", consulted: [], informed: [] },
});

const parseList = (v) => v.split(",").map((s) => s.trim()).filter(Boolean);

const RequirementDialog = ({ open, onOpenChange, onSave, initial }) => {
  const [form, setForm] = useState(initial || emptyReq());
  const [raciR, setRaciR] = useState("");
  const [raciC, setRaciC] = useState("");
  const [raciI, setRaciI] = useState("");
  const [acText, setAcText] = useState("");

  useEffect(() => {
    if (open) {
      const f = initial || emptyReq();
      setForm(f);
      setRaciR((f.raci?.responsible || []).join(", "));
      setRaciC((f.raci?.consulted || []).join(", "));
      setRaciI((f.raci?.informed || []).join(", "));
      setAcText((f.acceptance_criteria || []).join("\n"));
    }
  }, [open, initial]);

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      acceptance_criteria: acText.split("\n").map((s) => s.trim()).filter(Boolean),
      linked_diagrams: form.linked_diagrams || [],
      raci: {
        responsible: parseList(raciR),
        accountable: form.raci?.accountable || "",
        consulted: parseList(raciC),
        informed: parseList(raciI),
      },
    };
    if (!payload.code) delete payload.code;
    if (!payload.category) delete payload.category;
    onSave(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-lg border border-zinc-200 max-h-[90vh] overflow-y-auto" data-testid="requirement-dialog">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {form.id ? `Editar ${form.code}` : "Nuevo requirement"}
          </DialogTitle>
          <DialogDescription>OpenSpec + RACI + MoSCoW en un único requirement.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-mono uppercase text-zinc-500">Código</label>
              <Input value={form.code} placeholder="(auto: FR-001)" onChange={(e) => setForm({ ...form, code: e.target.value })} className="rounded-lg" data-testid="req-code-input" />
            </div>
            <div>
              <label className="text-xs font-mono uppercase text-zinc-500">Tipo</label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="rounded-lg" data-testid="req-type-select"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="functional">Funcional</SelectItem>
                  <SelectItem value="non_functional">No funcional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-mono uppercase text-zinc-500">MoSCoW</label>
              <Select value={form.moscow} onValueChange={(v) => setForm({ ...form, moscow: v })}>
                <SelectTrigger className="rounded-lg" data-testid="req-moscow-select"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="must">MUST</SelectItem>
                  <SelectItem value="should">SHOULD</SelectItem>
                  <SelectItem value="could">COULD</SelectItem>
                  <SelectItem value="wont">WON'T</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase text-zinc-500">Título *</label>
            <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-lg" data-testid="req-title-input" />
          </div>

          <div>
            <MarkdownEditor
              label="Descripción"
              rows={8}
              value={form.description}
              onChange={(v) => setForm({ ...form, description: v })}
              dataTestId="req-description-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono uppercase text-zinc-500">Categoría</label>
              <Input value={form.category} placeholder="ej. seguridad, performance" onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-lg" />
            </div>
            <div>
              <label className="text-xs font-mono uppercase text-zinc-500">Estado</label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="approved">Aprobado</SelectItem>
                  <SelectItem value="implemented">Implementado</SelectItem>
                  <SelectItem value="deprecated">Obsoleto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t border-zinc-200 pt-4">
            <h4 className="text-xs font-mono uppercase tracking-wide text-zinc-700 mb-2 flex items-center gap-1">
              <Users className="w-3.5 h-3.5" /> Matriz RACI
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-mono uppercase text-zinc-500">Responsible (coma)</label>
                <Input value={raciR} onChange={(e) => setRaciR(e.target.value)} placeholder="dev-team, alice@x.com" className="rounded-lg" data-testid="req-raci-r" />
              </div>
              <div>
                <label className="text-xs font-mono uppercase text-zinc-500">Accountable (uno)</label>
                <Input value={form.raci?.accountable || ""} onChange={(e) => setForm({ ...form, raci: { ...form.raci, accountable: e.target.value } })} placeholder="oscar@x.com" className="rounded-lg" data-testid="req-raci-a" />
              </div>
              <div>
                <label className="text-xs font-mono uppercase text-zinc-500">Consulted (coma)</label>
                <Input value={raciC} onChange={(e) => setRaciC(e.target.value)} placeholder="security@x.com" className="rounded-lg" data-testid="req-raci-c" />
              </div>
              <div>
                <label className="text-xs font-mono uppercase text-zinc-500">Informed (coma)</label>
                <Input value={raciI} onChange={(e) => setRaciI(e.target.value)} placeholder="qa@x.com" className="rounded-lg" data-testid="req-raci-i" />
              </div>
            </div>
          </div>

          <div>
            <MarkdownEditor
              label="Criterios de aceptación"
              rows={6}
              value={acText}
              onChange={setAcText}
              dataTestId="req-ac-input"
            />
          </div>

          <div className="border-t border-zinc-200 pt-4">
            <label className="text-xs font-mono uppercase text-zinc-500 flex items-center gap-1 mb-2">
              <FileText className="w-3.5 h-3.5" /> Diagramas BPMN enlazados
            </label>
            <DiagramLinker
              value={form.linked_diagrams || []}
              onChange={(ids) => setForm({ ...form, linked_diagrams: ids })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">Cancelar</Button>
            <Button type="submit" className="rounded-lg bg-deep-navy hover:bg-deep-navy/90" data-testid="req-save-btn">
              <Save className="w-4 h-4 mr-1" /> Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ---------------------- Main page ----------------------

const SpecDetailPage = () => {
  const { specId } = useParams();
  const navigate = useNavigate();
  const [spec, setSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterMoscow, setFilterMoscow] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [reqDialogOpen, setReqDialogOpen] = useState(false);
  const [editingReq, setEditingReq] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [bpmnGenerating, setBpmnGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("openspec");

  const generateBpmnFromSpec = async () => {
    if (!spec?.project_id) {
      toast.error("Esta especificación no está asociada a un proyecto");
      return;
    }
    if ((spec.requirements_count || 0) === 0) {
      toast.error("Necesitas requirements (MUST/SHOULD) antes de generar BPMN");
      return;
    }
    setBpmnGenerating(true);
    try {
      const res = await fetch(
        `${API}/ai-projects/${spec.project_id}/generate-bpmn-from-spec`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          credentials: "include",
          body: JSON.stringify({
            spec_id: spec.id,
            model: "deepseek",
            only_must_should: true,
          }),
        },
      );
      if (res.ok) {
        const data = await res.json();
        toast.success(`✨ BPMN generado (${data.requirements_used} reqs, ${data.xml_length} chars)`);
        navigate(`/editor/${data.diagram_id}`);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Error al generar BPMN");
      }
    } catch {
      toast.error("Error al generar BPMN");
    } finally {
      setBpmnGenerating(false);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/specs/specifications/${specId}`, { headers: authHeaders(), credentials: "include" });
      if (!res.ok) {
        if (res.status === 404) {
          toast.error("Especificación no encontrada");
          navigate("/specs");
        }
        return;
      }
      setSpec(await res.json());
    } finally {
      setLoading(false);
    }
  }, [specId, navigate]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (spec?.mode) setActiveTab(spec.mode === "full" ? "openspec" : spec.mode);
  }, [spec?.mode]);

  const filteredReqs = useMemo(() => {
    if (!spec?.requirements) return [];
    return spec.requirements.filter((r) => {
      if (filterMoscow !== "all" && r.moscow !== filterMoscow) return false;
      if (filterType !== "all" && r.type !== filterType) return false;
      return true;
    });
  }, [spec, filterMoscow, filterType]);

  const countsByMoscow = useMemo(() => {
    const c = { must: 0, should: 0, could: 0, wont: 0 };
    (spec?.requirements || []).forEach((r) => {
      const k = String(r.moscow || "").toLowerCase();
      if (k in c) c[k] = c[k] + 1;
    });
    return c;
  }, [spec]);

  const saveRequirement = async (payload) => {
    try {
      if (editingReq?.id) {
        const res = await fetch(`${API}/specs/requirements/${editingReq.id}`, {
          method: "PUT", headers: { "Content-Type": "application/json", ...authHeaders() },
          credentials: "include", body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Error");
        toast.success("Requirement actualizado");
      } else {
        const res = await fetch(`${API}/specs/specifications/${specId}/requirements`, {
          method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() },
          credentials: "include", body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Error");
        toast.success("Requirement creado");
      }
      setReqDialogOpen(false);
      setEditingReq(null);
      await load();
    } catch {
      toast.error("No se pudo guardar");
    }
  };

  const deleteRequirement = async (id) => {
    setConfirmDelete({ id });
  };

  const confirmDeleteReq = async () => {
    const id = confirmDelete?.id;
    setConfirmDelete(null);
    const res = await fetch(`${API}/specs/requirements/${id}`, {
      method: "DELETE", headers: authHeaders(), credentials: "include",
    });
    if (res.ok) { toast.success("Eliminado"); await load(); }
    else toast.error("No se pudo eliminar");
  };

  const download = async (format) => {
    const res = await fetch(`${API}/specs/specifications/${specId}/export?format=${format}&mode=full`, {
      headers: authHeaders(), credentials: "include",
    });
    if (!res.ok) { toast.error("Error al exportar"); return; }
    const blob = format === "json" ? new Blob([JSON.stringify(await res.json(), null, 2)], { type: "application/json" }) : await res.blob();
    downloadBlob(blob, `${spec?.name || "spec"}.${format === "markdown" ? "md" : format}`);
    toast.success(`Exportado como ${format.toUpperCase()}`);
  };

  const importJson = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const data = JSON.parse(await file.text());
        const payload = {
          specification: data.specification,
          requirements: data.requirements || [],
        };
        const res = await fetch(`${API}/specs/specifications/${specId}/import`, {
          method: "POST", headers: { "Content-Type": "application/json", ...authHeaders() },
          credentials: "include", body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error();
        const r = await res.json();
        toast.success(`${r.imported} requirements importados`);
        await load();
      } catch {
        toast.error("Archivo inválido");
      }
    };
    input.click();
  };

  const generateSpeckit = async (variant = "pro") => {
    setGenerating(true);
    try {
      const url = `${API}/specs/specifications/${specId}/generate-speckit?variant=${variant}`;
      const res = await fetch(url, {
        method: "POST", headers: authHeaders(), credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Error");
        setGenerating(false);
        return;
      }
      const startInfo = await res.json().catch(() => ({}));
      const variantLabel = startInfo.variant === "flash" ? "Flash" : "Pro";
      toast.info(`Generando Speckit con DeepSeek V4-${variantLabel}...`);

      // Poll spec until speckit_status flips to ready or failed.
      const startedAt = Date.now();
      const MAX_MS = 5 * 60 * 1000; // 5 min hard cap
      // Eagerly switch to speckit tab so the timeline is visible while polling
      setActiveTab("speckit");
      while (Date.now() - startedAt < MAX_MS) {
        await new Promise(r => setTimeout(r, 3000));
        const sres = await fetch(`${API}/specs/specifications/${specId}`, {
          headers: authHeaders(), credentials: "include",
        });
        if (!sres.ok) continue;
        const sdoc = await sres.json();
        // Live update of spec state so SpeckitTimeline reflects current phase
        setSpec(sdoc);
        if (sdoc.speckit_status === "ready") {
          toast.success(`Speckit generado (${sdoc.speckit_model || "DeepSeek V4"})`);
          return;
        }
        if (sdoc.speckit_status === "failed") {
          toast.error(`Generacion fallo: ${sdoc.speckit_error || "error desconocido"}`);
          return;
        }
      }
      toast.warning("Generacion tarda mas de 5 min. Refresca la pagina mas tarde.");
    } finally {
      setGenerating(false);
    }
  };

  const updateSpecMode = async (newMode) => {
    const res = await fetch(`${API}/specs/specifications/${specId}`, {
      method: "PUT", headers: { "Content-Type": "application/json", ...authHeaders() },
      credentials: "include", body: JSON.stringify({ mode: newMode }),
    });
    if (res.ok) { toast.success("Modo actualizado"); await load(); }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-zinc-500 font-mono">Cargando especificación…</div>;
  }
  if (!spec) return null;

  return (
    <>
    <div className="min-h-screen bg-zinc-50" data-testid="spec-detail-page">
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-zinc-600 hover:text-zinc-900" data-testid="spec-back-btn">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <FileText className="w-5 h-5 text-zinc-900" />
            <div>
              <h1 className="text-lg font-bold text-zinc-900 tracking-tight">{spec.name}</h1>
              <div className="text-xs text-zinc-500 font-mono flex items-center gap-2">
                <span>v{spec.version} · {spec.requirements_count || 0} requirements</span>
                {spec.project_version_label && (
                  <Badge variant="outline" className="rounded-lg text-[10px] border-blue-200 text-blue-700 bg-blue-50">{spec.project_version_label}</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select value={spec.mode} onValueChange={updateSpecMode}>
              <SelectTrigger className="w-40 rounded-lg border-zinc-300 h-9" data-testid="spec-mode-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="openspec">Solo OpenSpec</SelectItem>
                <SelectItem value="speckit">Solo Speckit</SelectItem>
                <SelectItem value="full">Full Integrated</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={importJson} className="rounded-lg" data-testid="spec-import-btn">
              <Upload className="w-4 h-4 mr-1" /> Importar
            </Button>
            <div className="flex rounded-lg border border-zinc-300 overflow-hidden">
              <button onClick={() => download("json")} className="px-2 py-1.5 text-xs font-mono hover:bg-zinc-100 flex items-center gap-1" title="JSON" data-testid="spec-export-json">
                <FileJson className="w-3.5 h-3.5" /> JSON
              </button>
              <button onClick={() => download("markdown")} className="px-2 py-1.5 text-xs font-mono hover:bg-zinc-100 border-l border-zinc-300 flex items-center gap-1" title="Markdown" data-testid="spec-export-md">
                <FileCode2 className="w-3.5 h-3.5" /> MD
              </button>
              <button onClick={() => download("csv")} className="px-2 py-1.5 text-xs font-mono hover:bg-zinc-100 border-l border-zinc-300 flex items-center gap-1" title="CSV" data-testid="spec-export-csv">
                <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
              </button>
            </div>
          </div>
        </div>

        {spec.speckit_outdated && spec.speckit_doc && (
          <div className="bg-amber-50 border-t border-b border-amber-200 px-6 py-2 text-sm text-amber-900 flex items-center gap-2" data-testid="speckit-outdated-banner">
            <ShieldAlert className="w-4 h-4" />
            <span>La documentación Speckit está desactualizada. Algunos requirements cambiaron.</span>
            <Button size="sm" variant="outline" onClick={generateSpeckit} disabled={generating} className="rounded-lg h-7 ml-auto" data-testid="speckit-regenerate-btn">
              <RefreshCcw className={`w-3.5 h-3.5 mr-1 ${generating ? "animate-spin" : ""}`} /> Regenerar
            </Button>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* MoSCoW stats */}
        <div className="grid grid-cols-4 gap-3" data-testid="spec-moscow-stats">
          {["must", "should", "could", "wont"].map((k) => (
            <Card key={k} className={`p-4 rounded-lg border-l-8 bg-white ${k === "must" ? "border-l-red-600" : k === "should" ? "border-l-amber-500" : k === "could" ? "border-l-sky-500" : "border-l-zinc-500"}`}>
              <div className="text-xs font-mono uppercase text-zinc-500">{MOSCOW_META[k].label}</div>
              <div className="text-3xl font-bold text-zinc-900 tabular-nums">{countsByMoscow[k] || 0}</div>
            </Card>
          ))}
        </div>

        {/* AI BPMN generation card — visible from any tab once spec has reqs */}
        {spec.project_id && (spec.requirements_count || 0) > 0 && (
          <Card className="rounded-lg border-2 border-blue-300 bg-blue-50/40 p-5" data-testid="ai-bpmn-card">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-900">
                  Generar BPMN desde esta especificación
                </h3>
                <p className="text-sm text-zinc-600 mt-1">
                  La IA leera los requirements MUST/SHOULD + el speckit doc y generara un diagrama BPMN 2.0 valido.
                  Cada requirement se vinculara automaticamente al nuevo diagrama para mantener la trazabilidad.
                </p>
                <div className="text-[11px] text-zinc-500 mt-2 font-mono">
                  ~25-45s · DeepSeek V4-Flash · {(spec.requirements || []).filter(r => ["must","should"].includes(String(r.moscow||"").toLowerCase())).length} reqs MUST/SHOULD candidatos
                </div>
              </div>
              <Button
                onClick={generateBpmnFromSpec}
                disabled={bpmnGenerating}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
                data-testid="generate-bpmn-from-spec-btn"
              >
                {bpmnGenerating ? (
                  <><RefreshCcw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Generando...</>
                ) : (
                  <><Sparkles className="w-3.5 h-3.5 mr-1.5" /> Generar BPMN</>
                )}
              </Button>
            </div>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 rounded-lg bg-zinc-200 p-1 w-fit">
            <TabsTrigger value="openspec" className="rounded-lg data-[state=active]:bg-white" data-testid="spec-tab-openspec">OpenSpec</TabsTrigger>
            <TabsTrigger value="speckit" className="rounded-lg data-[state=active]:bg-white" data-testid="spec-tab-speckit">Speckit</TabsTrigger>
            <TabsTrigger value="full" className="rounded-lg data-[state=active]:bg-white" data-testid="spec-tab-full">Full Integrated</TabsTrigger>
          </TabsList>

          {/* OPENSPEC TAB */}
          <TabsContent value="openspec" className="mt-4 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Select value={filterMoscow} onValueChange={setFilterMoscow}>
                  <SelectTrigger className="w-36 h-9 rounded-lg" data-testid="spec-filter-moscow"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="all">Todos MoSCoW</SelectItem>
                    <SelectItem value="must">MUST</SelectItem>
                    <SelectItem value="should">SHOULD</SelectItem>
                    <SelectItem value="could">COULD</SelectItem>
                    <SelectItem value="wont">WON'T</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40 h-9 rounded-lg" data-testid="spec-filter-type"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="all">Todos tipos</SelectItem>
                    <SelectItem value="functional">Funcional</SelectItem>
                    <SelectItem value="non_functional">No funcional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => { setEditingReq(null); setReqDialogOpen(true); }} className="rounded-lg bg-deep-navy hover:bg-deep-navy/90" data-testid="spec-add-req-btn">
                <Plus className="w-4 h-4 mr-1" /> Añadir requirement
              </Button>
            </div>

            <Card className="rounded-lg border border-zinc-200 bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-deep-navy text-white">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-mono uppercase">Código</th>
                    <th className="px-3 py-2 text-left text-xs font-mono uppercase">Título</th>
                    <th className="px-3 py-2 text-left text-xs font-mono uppercase">Tipo</th>
                    <th className="px-3 py-2 text-left text-xs font-mono uppercase">MoSCoW</th>
                    <th className="px-3 py-2 text-left text-xs font-mono uppercase">Estado</th>
                    <th className="px-3 py-2 text-left text-xs font-mono uppercase">RACI · A</th>
                    <th className="px-3 py-2 text-left text-xs font-mono uppercase">Diagramas</th>
                    <th className="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReqs.length === 0 && (
                    <tr><td colSpan={8} className="py-8 text-center text-zinc-500 italic">Sin requirements. Crea el primero.</td></tr>
                  )}
                  {filteredReqs.map((r) => (
                    <tr key={r.id} className="border-t border-zinc-200 hover:bg-zinc-50" data-testid={`req-row-${r.id}`}>
                      <td className="px-3 py-2 font-mono text-xs text-zinc-700">{r.code}</td>
                      <td className="px-3 py-2 font-medium text-zinc-900">{r.title}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className={`rounded-lg font-mono text-xs ${TYPE_META[String(r.type || "").toLowerCase()]?.color || "border-zinc-300 text-zinc-600"}`}>{TYPE_META[String(r.type || "").toLowerCase()]?.label || r.type || "—"}</Badge>
                      </td>
                      <td className="px-3 py-2">
                        <Badge className={`rounded-lg font-mono text-xs ${MOSCOW_META[String(r.moscow || "").toLowerCase()]?.color || "bg-zinc-300 text-zinc-700"}`}>{MOSCOW_META[String(r.moscow || "").toLowerCase()]?.label || r.moscow || "—"}</Badge>
                      </td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className={`rounded-lg font-mono text-xs ${STATUS_META[String(r.status || "").toLowerCase()]?.color || "border-zinc-300 text-zinc-600"}`}>{STATUS_META[String(r.status || "").toLowerCase()]?.label || r.status || "—"}</Badge>
                      </td>
                      <td className="px-3 py-2 text-xs text-zinc-600 font-mono">{r.raci?.accountable || "-"}</td>
                      <td className="px-3 py-2">
                        {(r.linked_diagrams || []).length > 0 ? (
                          (r.linked_diagrams || []).length === 1 ? (
                            <Link
                              to={`/editor/${r.linked_diagrams[0]}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-xs font-mono text-blue-700 hover:text-blue-900 hover:underline"
                              data-testid={`req-diagram-link-${r.id}`}
                              title="Abrir diagrama enlazado"
                            >
                              <FileText className="w-3 h-3" /> diagrama
                            </Link>
                          ) : (
                            <span className="text-xs font-mono text-zinc-500" data-testid={`req-diagrams-count-${r.id}`}>
                              {r.linked_diagrams.length} diagramas
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-zinc-300">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button onClick={() => { setEditingReq(r); setReqDialogOpen(true); }} className="text-zinc-600 hover:text-zinc-900 p-1" title="Editar" data-testid={`req-edit-${r.id}`}>
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteRequirement(r.id)} className="text-red-600 hover:text-red-800 p-1 ml-1" title="Eliminar" data-testid={`req-delete-${r.id}`}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>

          {/* SPECKIT TAB */}
          <TabsContent value="speckit" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-zinc-600">
                {spec.speckit_doc
                  ? <>Generada: <span className="font-mono text-zinc-900">{spec.speckit_generated_at?.slice(0, 19).replace("T", " ")}</span></>
                  : "Aún no hay documentación Speckit."}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => generateSpeckit("pro")}
                  disabled={generating || spec.requirements_count === 0}
                  className="rounded-lg bg-deep-navy hover:bg-deep-navy/90"
                  data-testid="spec-generate-speckit"
                  title="DeepSeek V4-Pro · maxima calidad (~60-90s)"
                >
                  <Sparkles className={`w-4 h-4 mr-1 ${generating ? "animate-pulse" : ""}`} />
                  {generating ? "Generando..." : (spec.speckit_doc ? "Regenerar (Pro)" : "Generar con DeepSeek V4-Pro")}
                </Button>
                <Button
                  onClick={() => generateSpeckit("flash")}
                  disabled={generating || spec.requirements_count === 0}
                  variant="outline"
                  className="rounded-lg border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                  data-testid="spec-generate-speckit-flash"
                  title="DeepSeek V4-Flash · mas rapido (~30-50s)"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  Flash
                </Button>
              </div>
            </div>

            {(spec.speckit_status === "processing" || spec.speckit_status === "failed") && (
              <SpeckitTimeline
                phase={spec.speckit_phase}
                status={spec.speckit_status}
                model={spec.speckit_model}
                error={spec.speckit_error}
              />
            )}

            <SpeckitSuggestedActions
              specId={specId}
              onActionDone={load}
            />

            {spec.speckit_doc ? (
              <Card className="rounded-lg border border-zinc-200 bg-white p-6" data-testid="speckit-doc-view">
                <SpeckitRenderer markdown={spec.speckit_doc} />
              </Card>
            ) : (
              <Card className="rounded-lg border-2 border-dashed border-zinc-300 p-12 text-center">
                <Sparkles className="w-10 h-10 mx-auto text-zinc-400 mb-3" />
                <p className="text-zinc-600">Genera documentación automática desde tus requirements OpenSpec.</p>
              </Card>
            )}
          </TabsContent>

          {/* FULL INTEGRATED TAB */}
          <TabsContent value="full" className="mt-4 space-y-4">
            <Card className="rounded-lg border border-zinc-200 bg-white p-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-zinc-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Vista integrada OpenSpec + Speckit
              </h3>
              <p className="text-sm text-zinc-600 mb-4">
                Cambios en MoSCoW, título, descripción o RACI marcan el Speckit como desactualizado. Regenera manualmente cuando quieras sincronizar.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-mono uppercase text-zinc-500 mb-2">Resumen OpenSpec</h4>
                  <ul className="space-y-1.5 text-sm">
                    {Object.entries(countsByMoscow).map(([k, v]) => (
                      <li key={k} className="flex items-center gap-2">
                        <Badge className={`rounded-lg font-mono text-xs ${MOSCOW_META[k].color}`}>{MOSCOW_META[k].label}</Badge>
                        <span className="tabular-nums text-zinc-900">{v}</span> requirements
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-xs font-mono uppercase text-zinc-500 mb-2">Estado Speckit</h4>
                  <div className="text-sm space-y-2">
                    {!spec.speckit_doc ? (
                      <div className="text-zinc-500">Sin generar.</div>
                    ) : spec.speckit_outdated ? (
                      <div className="text-amber-700 flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> Desactualizada</div>
                    ) : (
                      <div className="text-emerald-700 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Sincronizada</div>
                    )}
                    <Button size="sm" onClick={generateSpeckit} disabled={generating || spec.requirements_count === 0} className="rounded-lg" data-testid="full-regenerate-btn">
                      <RefreshCcw className={`w-3.5 h-3.5 mr-1 ${generating ? "animate-spin" : ""}`} /> Sincronizar ahora
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <RequirementDialog
        open={reqDialogOpen}
        onOpenChange={setReqDialogOpen}
        onSave={saveRequirement}
        initial={editingReq}
      />

      <AiLoadingOverlay
        show={bpmnGenerating || generating}
        statusText={bpmnGenerating ? "Generando BPMN..." : "Generando Speckit..."}
        subText={bpmnGenerating ? "DeepSeek V4 esta creando el diagrama BPMN 2.0 desde la especificacion. Esto puede tardar 25-45 segundos." : "DeepSeek V4 esta generando la documentacion Speckit. Esto puede tardar 30-90 segundos."}
      />
    </div>
    <ConfirmDialog
      open={!!confirmDelete}
      onOpenChange={(open) => { if (!open) setConfirmDelete(null); }}
      title="Eliminar requirement"
      description="¿Eliminar este requirement? Esta acción no se puede deshacer."
      onConfirm={confirmDeleteReq}
    />
    </>
  );
};

export default SpecDetailPage;
