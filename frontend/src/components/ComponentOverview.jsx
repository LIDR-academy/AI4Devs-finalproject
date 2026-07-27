// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "@/App";
import { getAuthHeaders } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  FileText, ListChecks, BookOpen, Workflow, Code2, FolderTree,
  Boxes, Puzzle, Link2, GitBranch, Loader2, ArrowRight, Plus,
} from "lucide-react";

const CATEGORY_DEFS = {
  descripcion: {
    icon: FileText,
    label: "Descripcion",
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50",
    textColor: "text-violet-700",
    borderColor: "border-violet-200",
  },
  requirements: {
    icon: ListChecks,
    label: "Requisitos",
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
  },
  specification: {
    icon: BookOpen,
    label: "Especificaciones",
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    createAction: "spec",
  },
  bpmn: {
    icon: Workflow,
    label: "Diagramas BPMN",
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    createAction: "diagram",
  },
  code: {
    icon: Code2,
    label: "Codigo",
    color: "from-slate-600 to-zinc-700",
    bgColor: "bg-zinc-50",
    textColor: "text-zinc-700",
    borderColor: "border-zinc-200",
  },
  files: {
    icon: FolderTree,
    label: "Archivos",
    color: "from-rose-500 to-pink-600",
    bgColor: "bg-rose-50",
    textColor: "text-rose-700",
    borderColor: "border-rose-200",
  },
  oop_classes: {
    icon: Boxes,
    label: "Clases OOP",
    color: "from-cyan-500 to-sky-600",
    bgColor: "bg-cyan-50",
    textColor: "text-cyan-700",
    borderColor: "border-cyan-200",
    createAction: "oop_class",
  },
  bpmn_components: {
    icon: Puzzle,
    label: "Componentes BPMN",
    color: "from-lime-500 to-green-600",
    bgColor: "bg-lime-50",
    textColor: "text-lime-700",
    borderColor: "border-lime-200",
    createAction: "component",
  },
  element_links: {
    icon: Link2,
    label: "Vinculos E-R",
    color: "from-fuchsia-500 to-pink-600",
    bgColor: "bg-fuchsia-50",
    textColor: "text-fuchsia-700",
    borderColor: "border-fuchsia-200",
  },
};

const SKELETON_KEYS = Object.keys(CATEGORY_DEFS);

function SkeletonCard() {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 animate-pulse" data-testid="overview-skeleton">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-md bg-zinc-100" />
        <div className="h-4 bg-zinc-100 rounded w-24" />
        <div className="ml-auto h-5 w-8 bg-zinc-100 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-zinc-100 rounded w-full" />
        <div className="h-3 bg-zinc-100 rounded w-3/4" />
      </div>
    </div>
  );
}

function getDetailLink(cat, data) {
  switch (cat) {
    case "descripcion":
      return data.spec_id ? `/specs/${data.spec_id}` : null;
    case "requirements":
      return data.specs?.[0]?.spec_id ? `/specs/${data.specs[0].spec_id}` : null;
    case "specification":
      return data.items?.[0]?.spec_id ? `/specs/${data.items[0].spec_id}` : null;
    case "bpmn":
      return null;
    case "code":
      return null;
    case "oop_classes":
      return "/oop-classes";
    case "bpmn_components":
      return "/editor?tab=components";
    default:
      return null;
  }
}

/* ---------- Quick-create dialogs ---------- */

function CreateDiagramDialog({ open, onClose, projectId, onCreated }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/diagrams`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: name.trim(),
          project_id: projectId,
          xml: '<?xml version="1.0" encoding="UTF-8"?><bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" id="Definitions_1"><bpmn:process id="Process_1" isExecutable="false"></bpmn:process></bpmn:definitions>',
        }),
      });
      if (res.ok) {
        toast.success("Diagrama creado");
        onCreated();
      } else {
        toast.error("Error al crear diagrama");
      }
    } catch {
      toast.error("Error de red");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-lg max-w-md">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "'Chivo', sans-serif" }}>Nuevo Diagrama BPMN</DialogTitle>
          <DialogDescription>Crea un diagrama vacio en este proyecto</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nombre</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Flujo de onboarding"
              className="rounded-lg"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-lg">Cancelar</Button>
          <Button onClick={handleCreate} disabled={saving || !name.trim()} className="bg-deep-navy hover:bg-deep-navy/90 text-white rounded-lg font-semibold">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
            Crear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateSpecDialog({ open, onClose, projectId, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/specs`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          project_id: projectId,
        }),
      });
      if (res.ok) {
        toast.success("Spec creada");
        onCreated();
      } else {
        toast.error("Error al crear spec");
      }
    } catch {
      toast.error("Error de red");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-lg max-w-md">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "'Chivo', sans-serif" }}>Nueva Especificacion</DialogTitle>
          <DialogDescription>Crea una especificacion vacia en este proyecto</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Titulo</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Requisitos de autenticacion"
              className="rounded-lg"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>Descripcion</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe la especificacion..."
              rows={3}
              className="rounded-lg"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-lg">Cancelar</Button>
          <Button onClick={handleCreate} disabled={saving || !title.trim()} className="bg-deep-navy hover:bg-deep-navy/90 text-white rounded-lg font-semibold">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
            Crear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const COMPONENT_CATEGORIES = [
  { value: "subprocess", label: "Subproceso" },
  { value: "event", label: "Evento" },
  { value: "task", label: "Tarea" },
  { value: "gateway", label: "Gateway" },
  { value: "pattern", label: "Patron" },
  { value: "other", label: "Otro" },
];

function CreateComponentDialog({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("other");
  const [description, setDescription] = useState("");
  const [xml, setXml] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !xml.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/components`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: name.trim(),
          category,
          description: description.trim(),
          xml_fragment: xml.trim(),
        }),
      });
      if (res.ok) {
        toast.success("Componente creado");
        onCreated();
      } else {
        toast.error("Error al crear componente");
      }
    } catch {
      toast.error("Error de red");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-lg max-w-lg">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "'Chivo', sans-serif" }}>Nuevo Componente BPMN</DialogTitle>
          <DialogDescription>Crea un componente reutilizable</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Aprobacion gerente" className="rounded-lg" autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent className="rounded-lg">
                  {COMPONENT_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Descripcion</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe el componente..." rows={2} className="rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Label>XML BPMN</Label>
            <Textarea value={xml} onChange={(e) => setXml(e.target.value)} placeholder="<bpmn:task id='...' name='...' />" rows={4} className="font-mono text-sm rounded-lg" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-lg">Cancelar</Button>
          <Button onClick={handleCreate} disabled={saving || !name.trim() || !xml.trim()} className="bg-deep-navy hover:bg-deep-navy/90 text-white rounded-lg font-semibold">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
            Crear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateOOPClassDialog({ open, onClose, projectId, onCreated }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${API}/oop-classes`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: name.trim(),
          project_id: projectId,
          attributes: [],
          methods: [],
        }),
      });
      if (res.ok) {
        toast.success("Clase OOP creada");
        onCreated();
      } else {
        toast.error("Error al crear clase");
      }
    } catch {
      toast.error("Error de red");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-lg max-w-md">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: "'Chivo', sans-serif" }}>Nueva Clase OOP</DialogTitle>
          <DialogDescription>Define una nueva clase para el proyecto</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nombre de la clase</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: UserService"
              className="rounded-lg"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-lg">Cancelar</Button>
          <Button onClick={handleCreate} disabled={saving || !name.trim()} className="bg-deep-navy hover:bg-deep-navy/90 text-white rounded-lg font-semibold">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
            Crear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Main component ---------- */

export default function ComponentOverview({ projectId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Quick-create dialog state
  const [createType, setCreateType] = useState(null); // "diagram" | "spec" | "component" | "oop_class"

  useEffect(() => {
    let cancelled = false;
    async function fetchOverview() {
      setLoading(true);
      try {
        const res = await fetch(
          `${API}/projects/${projectId}/components-overview`,
          { headers: getAuthHeaders() },
        );
        if (res.ok && !cancelled) {
          setData(await res.json());
        }
      } catch { /* silent */ }
      finally { if (!cancelled) setLoading(false); }
    }
    fetchOverview();
    return () => { cancelled = true; };
  }, [projectId]);

  const refetch = () => {
    setLoading(true);
    fetch(`${API}/projects/${projectId}/components-overview`, { headers: getAuthHeaders() })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4" data-testid="overview-loading">
        {SKELETON_KEYS.map((k) => <SkeletonCard key={k} />)}
      </div>
    );
  }

  if (!data?.categories) {
    return (
      <div className="text-center py-12 text-zinc-400" data-testid="overview-empty">
        <FolderTree className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No hay datos disponibles</p>
      </div>
    );
  }

  const { categories, active_branch } = data;

  const orderedCats = [
    "descripcion", "requirements", "specification", "bpmn",
    "code", "files", "oop_classes", "bpmn_components", "element_links",
  ];

  return (
    <div className="p-4 space-y-4" data-testid="overview-root">
      {/* Branch info */}
      {active_branch?.name && (
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
          <GitBranch className="w-3.5 h-3.5" />
          <span>Branch activo:</span>
          <span className="font-medium text-zinc-700" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            {active_branch.name}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {orderedCats.map((cat) => {
          const cdata = categories[cat];
          if (!cdata) return null;
          const def = CATEGORY_DEFS[cat];
          const Icon = def.icon;
          const count = typeof cdata.count === "number" ? cdata.count : 0;
          const detailLink = getDetailLink(cat, cdata);

          return (
            <div
              key={cat}
              className={`rounded-lg border ${def.borderColor} bg-white hover:shadow-md transition-shadow overflow-hidden`}
              data-testid={`overview-card-${cat}`}
            >
              {/* Card header */}
              <div className="flex items-center gap-3 p-4 pb-2">
                <div className={`w-8 h-8 rounded-md bg-gradient-to-br ${def.color} flex items-center justify-center`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className={`text-sm font-semibold ${def.textColor}`}>
                  {def.label}
                </span>
                <span
                  className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {count}
                </span>
              </div>

              {/* Card body */}
              <div className="px-4 pb-3">
                {/* descripcion */}
                {cat === "descripcion" && cdata.summary && (
                  <p className="text-xs text-zinc-500 line-clamp-3 leading-relaxed">
                    {cdata.summary}
                  </p>
                )}

                {/* requirements */}
                {cat === "requirements" && cdata.specs?.length > 0 && (
                  <div className="space-y-1.5">
                    {cdata.specs.slice(0, 2).map((s) => (
                      <Link
                        key={s.spec_id}
                        to={`/specs/${s.spec_id}`}
                        className="block text-xs text-zinc-600 hover:text-blue-600 transition-colors"
                      >
                        <span className="font-medium">{s.title || s.spec_id}</span>
                        {" "}
                        <span className="text-zinc-400">
                          ({s.count} reqs: M{s.must}/S{s.should}/C{s.could})
                        </span>
                      </Link>
                    ))}
                    {cdata.specs.length > 2 && (
                      <p className="text-[10px] text-zinc-400">
                        +{cdata.specs.length - 2} specs mas
                      </p>
                    )}
                  </div>
                )}

                {/* specification */}
                {cat === "specification" && cdata.items?.length > 0 && (
                  <div className="space-y-1.5">
                    {cdata.items.slice(0, 2).map((s) => (
                      <Link
                        key={s.spec_id}
                        to={`/specs/${s.spec_id}`}
                        className="block text-xs text-zinc-600 hover:text-blue-600 transition-colors"
                      >
                        <span className="font-medium">{s.title || s.spec_id}</span>
                        {" "}
                        <span className="text-zinc-400">
                          ({s.mode}{s.has_speckit ? " +speckit" : ""})
                        </span>
                      </Link>
                    ))}
                    {cdata.items.length > 2 && (
                      <p className="text-[10px] text-zinc-400">
                        +{cdata.items.length - 2} specs mas
                      </p>
                    )}
                  </div>
                )}

                {/* bpmn */}
                {cat === "bpmn" && cdata.items?.length > 0 && (
                  <div className="space-y-1.5">
                    {cdata.items.slice(0, 3).map((d) => (
                      <Link
                        key={d.diagram_id}
                        to={`/editor/${d.diagram_id}`}
                        className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-blue-600 transition-colors"
                      >
                        <Workflow className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                        <span className="font-medium truncate">{d.name}</span>
                        <span className="text-zinc-400 flex-shrink-0" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                          v{d.current_version}
                        </span>
                      </Link>
                    ))}
                    {cdata.items.length > 3 && (
                      <p className="text-[10px] text-zinc-400">
                        +{cdata.items.length - 3} diagramas mas
                      </p>
                    )}
                  </div>
                )}

                {/* code */}
                {cat === "code" && cdata.items?.length > 0 && (
                  <div className="space-y-1.5">
                    {cdata.items.slice(0, 2).map((c) => (
                      <div key={c.code_gen_id} className="flex items-center gap-1.5 text-xs text-zinc-600">
                        <span
                          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            c.status === "ready" ? "bg-emerald-500" :
                            c.status === "failed" ? "bg-red-500" : "bg-amber-500"
                          }`}
                        />
                        <span className="font-medium truncate">{c.summary || c.code_gen_id}</span>
                        <span className="text-zinc-400 flex-shrink-0">{c.target}</span>
                      </div>
                    ))}
                    {cdata.items.length > 2 && (
                      <p className="text-[10px] text-zinc-400">
                        +{cdata.items.length - 2} generaciones mas
                      </p>
                    )}
                  </div>
                )}

                {/* files */}
                {cat === "files" && count > 0 && (
                  <p className="text-xs text-zinc-500">
                    {cdata.file_count} archivos, {cdata.dir_count} directorios
                  </p>
                )}

                {/* oop_classes / bpmn_components / element_links (just counts) */}
                {["oop_classes", "bpmn_components", "element_links"].includes(cat) && count > 0 && (
                  <p className="text-xs text-zinc-500">
                    {count} {count === 1 ? "elemento" : "elementos"} {cat === "element_links" ? "vinculados" : "disponibles"}
                  </p>
                )}

                {/* Empty state */}
                {count === 0 && (
                  <p className="text-xs text-zinc-300 italic">Sin elementos</p>
                )}
              </div>

              {/* Card footer */}
              <div className={`border-t ${def.borderColor}`}>
                {detailLink && count > 0 && (
                  <Link
                    to={detailLink}
                    className={`flex items-center justify-center gap-1 py-2 text-xs font-medium ${def.bgColor} ${def.textColor} hover:opacity-80 transition-opacity`}
                  >
                    Ver detalle
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
                {!detailLink && count > 0 && !def.createAction && (
                  <div className="py-2" />
                )}
                {def.createAction && (
                  <button
                    onClick={() => setCreateType(def.createAction)}
                    className={`w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors`}
                    data-testid={`create-${cat}-btn`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Crear {count > 0 ? "nuevo" : ""}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick-create dialogs */}
      <CreateDiagramDialog
        open={createType === "diagram"}
        onClose={() => setCreateType(null)}
        projectId={projectId}
        onCreated={() => { setCreateType(null); refetch(); }}
      />
      <CreateSpecDialog
        open={createType === "spec"}
        onClose={() => setCreateType(null)}
        projectId={projectId}
        onCreated={() => { setCreateType(null); refetch(); }}
      />
      <CreateComponentDialog
        open={createType === "component"}
        onClose={() => setCreateType(null)}
        onCreated={() => { setCreateType(null); refetch(); }}
      />
      <CreateOOPClassDialog
        open={createType === "oop_class"}
        onClose={() => setCreateType(null)}
        projectId={projectId}
        onCreated={() => { setCreateType(null); refetch(); }}
      />
    </div>
  );
}
