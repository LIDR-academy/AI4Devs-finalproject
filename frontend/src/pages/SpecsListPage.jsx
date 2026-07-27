// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useEffect, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import ProjectMenuBar from "@/components/ProjectMenuBar";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { FileText, Plus, ArrowLeft, FolderKanban, ArrowRight, Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const authHeaders = () => {
  const t = localStorage.getItem("session_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const SPECKIT_BADGE = {
  ready: { color: "border-emerald-400 text-emerald-700 bg-emerald-50", label: "Speckit OK", Icon: CheckCircle2 },
  processing: { color: "border-blue-400 text-blue-700 bg-blue-50", label: "Generando...", Icon: Loader2 },
  failed: { color: "border-red-400 text-red-700 bg-red-50", label: "Speckit fallido", Icon: AlertCircle },
};

const SpecsListPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const projectId = params.get("project_id") || "";
  const standaloneOnly = params.get("standalone") === "1";

  const [specs, setSpecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const specSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    description: z.string().optional(),
    version: z.string().optional(),
    mode: z.string().optional(),
  });
  const specForm = useForm({
    resolver: zodResolver(specSchema),
    defaultValues: { name: "", description: "", version: "1.0.0", mode: "full" },
  });
  const [project, setProject] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (projectId) qs.set("project_id", projectId);
      else if (standaloneOnly) qs.set("standalone", "true");
      const qstr = qs.toString();
      const res = await fetch(`${API}/specs/specifications${qstr ? `?${qstr}` : ""}`, {
        headers: authHeaders(), credentials: "include",
      });
      if (res.ok) setSpecs(await res.json());
    } finally {
      setLoading(false);
    }
  }, [projectId, standaloneOnly]);

  const loadProject = useCallback(async () => {
    if (!projectId) { setProject(null); return; }
    const res = await fetch(`${API}/projects/${projectId}`, { headers: authHeaders(), credentials: "include" });
    if (res.ok) setProject(await res.json());
  }, [projectId]);

  useEffect(() => { load(); loadProject(); }, [load, loadProject]);

  useEffect(() => {
    setForm((f) => ({ ...f, project_id: projectId || null }));
  }, [projectId]);

  const createSpec = async (data) => {
    const payload = { ...data, project_id: projectId || null };
    const res = await fetch(`${API}/specs/specifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) { toast.error("No se pudo crear"); return; }
    const result = await res.json();
    toast.success("Especificación creada");
    setCreateOpen(false);
    specForm.reset();
    navigate(`/specs/${result.id}`);
  };

  // Quick-generate Speckit doc directly from the list (no need to open the spec).
  // Backend returns 202; we just kick it off and show a toast — the user can
  // open the spec to see the rendered doc when ready.
  const [generatingSpecId, setGeneratingSpecId] = useState(null);
  const handleGenerateSpeckit = async (e, spec) => {
    e.preventDefault();
    e.stopPropagation();
    if (!spec.requirements_count) {
      toast.error("Esta especificación no tiene requirements aún");
      return;
    }
    setGeneratingSpecId(spec.id);
    try {
      const res = await fetch(
        `${API}/specs/specifications/${spec.id}/generate-speckit?variant=flash`,
        { method: "POST", headers: authHeaders(), credentials: "include" },
      );
      if (res.ok || res.status === 202) {
        toast.success("✨ Generando Speckit en segundo plano. Abre la especificación para ver el progreso.");
        // optimistic UI: mark as processing locally
        setSpecs((prev) =>
          prev.map((s) => (s.id === spec.id ? { ...s, speckit_status: "processing" } : s)),
        );
        // Open the spec so the user sees the live progress + final doc
        setTimeout(() => navigate(`/specs/${spec.id}`), 600);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Error al iniciar la generación");
      }
    } catch {
      toast.error("Error al iniciar la generación");
    } finally {
      setGeneratingSpecId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" data-testid="specs-list-page">
      <ProjectMenuBar />
      <div className="flex flex-1 overflow-hidden">

      <main className="flex-1 min-w-0 overflow-y-auto">
        <header className="sticky top-0 z-30 bg-white border-b border-zinc-200 h-14 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-zinc-600 hover:text-zinc-900" data-testid="specs-back-btn">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <FileText className="w-5 h-5 text-zinc-900" />
            <div>
              <h1 className="text-base font-bold text-zinc-900 tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>Especificaciones</h1>
              <div className="text-xs text-zinc-500 font-mono">
                {project ? <>Proyecto: <span className="text-zinc-900">{project.name}</span></>
                : standaloneOnly ? "Solo standalone (sin proyecto)" : "OpenSpec + Speckit + RACI + MoSCoW"}
              </div>
            </div>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="rounded-lg h-8 text-xs bg-deep-navy hover:bg-deep-navy/90" data-testid="specs-create-btn">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Nueva especificación
          </Button>
        </header>

        <div className="p-6 space-y-6">
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-zinc-200 p-4 space-y-3">
                <div className="animate-pulse h-4 bg-zinc-100 w-3/4" />
                <div className="animate-pulse h-3 bg-zinc-50 w-full" />
                <div className="animate-pulse h-3 bg-zinc-50 w-1/2" />
              </div>
            ))}
          </div>
        )}

        {!loading && specs.length === 0 && (
          <Card className="rounded-lg border-2 border-dashed border-zinc-300 p-12 text-center" data-testid="specs-empty">
            <FileText className="w-10 h-10 mx-auto text-zinc-400 mb-3" />
            <p className="text-zinc-600 mb-4">Todavía no has creado ninguna especificación.</p>
            <Button onClick={() => setCreateOpen(true)} className="rounded-lg bg-deep-navy hover:bg-deep-navy/90">
              <Plus className="w-4 h-4 mr-1" /> Crear la primera
            </Button>
          </Card>
        )}

        {!loading && specs.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {specs.map((s) => {
              const status = s.speckit_status || (s.speckit_doc ? "ready" : null);
              const badge = status ? SPECKIT_BADGE[status] : null;
              const isGenerating = generatingSpecId === s.id || s.speckit_status === "processing";
              const canGenerate = (s.requirements_count || 0) > 0 && !s.speckit_doc && !isGenerating;
              return (
                <div key={s.id} className="relative group">
                  <Link
                    to={`/specs/${s.id}`}
                    className="block"
                    data-testid={`spec-card-${s.id}`}
                  >
                    <Card className="rounded-lg border-2 border-zinc-200 hover:border-zinc-900 bg-white p-5 transition-colors h-full flex flex-col">
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <h3 className="font-bold text-zinc-900 flex-1 truncate">{s.name}</h3>
                        <Badge variant="outline" className="rounded-lg font-mono text-xs ml-2 shrink-0">{s.mode}</Badge>
                      </div>
                      <p className="text-sm text-zinc-600 line-clamp-2 mb-3 flex-1">{s.description || "—"}</p>

                      {badge && (
                        <Badge
                          variant="outline"
                          className={`rounded-lg font-mono text-[10px] mb-2 self-start ${badge.color}`}
                          data-testid={`speckit-status-${s.id}`}
                        >
                          <badge.Icon className={`w-3 h-3 mr-1 ${status === "processing" ? "animate-spin" : ""}`} />
                          {badge.label}
                        </Badge>
                      )}

                      <div className="flex items-center justify-between text-xs font-mono text-zinc-500 pt-3 border-t border-zinc-200">
                        <span className="flex items-center gap-1">
                          <span>v{s.version} · {s.requirements_count || 0} reqs</span>
                          {s.project_version_label && (
                            <Badge variant="outline" className="rounded-lg font-mono text-[10px] ml-1 border-blue-200 text-blue-700 bg-blue-50">{s.project_version_label}</Badge>
                          )}
                        </span>
                        {s.project_id ? (
                          <span className="flex items-center gap-1"><FolderKanban className="w-3 h-3" /> proyecto</span>
                        ) : (
                          <span>standalone</span>
                        )}
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                      </div>
                      {s.speckit_outdated && s.speckit_doc && (
                        <div className="mt-2 text-[10px] font-mono text-amber-700 uppercase">Speckit outdated</div>
                      )}
                    </Card>
                  </Link>
                  {canGenerate && (
                    <Button
                      size="sm"
                      onClick={(e) => handleGenerateSpeckit(e, s)}
                      className="absolute bottom-3 right-3 h-7 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      data-testid={`quick-generate-speckit-${s.id}`}
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      Generar Speckit
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        </div>
      </main>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md rounded-lg border border-zinc-200" data-testid="specs-create-dialog">
          <DialogHeader>
            <DialogTitle>Nueva especificación</DialogTitle>
          </DialogHeader>
          <Form {...specForm}>
          <form onSubmit={specForm.handleSubmit(createSpec)} className="space-y-3">
            <FormField
              control={specForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-mono uppercase text-zinc-500">Nombre *</FormLabel>
                  <FormControl>
                    <Input className="rounded-lg" data-testid="specs-create-name" {...field} />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={specForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-mono uppercase text-zinc-500">Descripción</FormLabel>
                  <FormControl>
                    <Textarea rows={3} className="rounded-lg font-mono text-sm" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={specForm.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-mono uppercase text-zinc-500">Versión</FormLabel>
                    <FormControl>
                      <Input className="rounded-lg" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Controller
                control={specForm.control}
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-mono uppercase text-zinc-500">Modo</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                      <SelectContent className="rounded-lg">
                        <SelectItem value="openspec">Solo OpenSpec</SelectItem>
                        <SelectItem value="speckit">Solo Speckit</SelectItem>
                        <SelectItem value="full">Full Integrated</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
            {project && (
              <div className="text-xs text-zinc-500 font-mono bg-zinc-100 px-3 py-2 border border-zinc-200">
                Se creará ligada al proyecto <strong>{project.name}</strong>.
                {project.active_branch_id && " Rama activa del proyecto."}
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="rounded-lg">Cancelar</Button>
              <Button type="submit" className="rounded-lg bg-deep-navy hover:bg-deep-navy/90" data-testid="specs-create-submit">Crear</Button>
            </DialogFooter>
          </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SpecsListPage;
