// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth, API } from "@/App";
import { toast } from "sonner";
import { useI18n } from "@/contexts/I18nContext";
import BranchBadge from "@/components/BranchBadge";
import AiLoadingOverlay from "@/components/AiLoadingOverlay";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ArrowLeft,
  Code2,
  Sparkles,
  Download,
  FileCode,
  Folder,
  FolderOpen,
  Loader2,
  Trash2,
  Zap,
  Brain,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  History,
  Rocket,
} from "lucide-react";

const PHASE_LABELS = {
  queued: "En cola",
  generating: "Generando con DeepSeek...",
  post_processing: "Validando archivos...",
  complete: "Completado",
  failed: "Error",
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" }); } catch { return iso; }
};

const fmtBytes = (b) => {
  if (b == null) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
};

function authHeaders() {
  const tk = localStorage.getItem("session_token");
  return tk ? { Authorization: `Bearer ${tk}` } : {};
}

// Build a nested file tree { name, path, children?, file? }
function buildTree(files) {
  const root = { name: "/", path: "", children: {}, isDir: true };
  for (const f of files || []) {
    const parts = f.path.split("/");
    let cur = root;
    let acc = "";
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      acc = acc ? `${acc}/${p}` : p;
      const isLast = i === parts.length - 1;
      if (isLast) {
        cur.children[p] = { name: p, path: acc, file: f, isDir: false };
      } else {
        if (!cur.children[p]) cur.children[p] = { name: p, path: acc, children: {}, isDir: true };
        cur = cur.children[p];
      }
    }
  }
  return root;
}

function TreeNode({ node, depth = 0, selectedPath, onSelect, expanded, onToggle }) {
  const entries = Object.values(node.children || {}).sort((a, b) => {
    if (a.isDir !== b.isDir) return a.isDir ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return (
    <ul className="text-xs">
      {entries.map(child => {
        if (child.isDir) {
          const open = expanded[child.path] !== false;
          return (
            <li key={child.path}>
              <button
                type="button"
                onClick={() => onToggle(child.path, !open)}
                className="flex items-center gap-1.5 w-full hover:bg-zinc-100 px-2 py-1 text-left"
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
              >
                {open ? <FolderOpen className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" /> : <Folder className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />}
                <span className="font-semibold text-zinc-700 truncate">{child.name}</span>
              </button>
              {open && <TreeNode node={child} depth={depth + 1} selectedPath={selectedPath} onSelect={onSelect} expanded={expanded} onToggle={onToggle} />}
            </li>
          );
        }
        const selected = selectedPath === child.file.path;
        return (
          <li key={child.path}>
            <button
              type="button"
              onClick={() => onSelect(child.file)}
              className={`flex items-center gap-1.5 w-full text-left px-2 py-1 ${selected ? "bg-deep-navy text-white" : "hover:bg-zinc-100 text-zinc-700"}`}
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
              data-testid={`codegen-file-${child.file.path}`}
            >
              <FileCode className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{child.name}</span>
              <span className={`ml-auto text-[10px] ${selected ? "text-zinc-300" : "text-zinc-400"}`}>{fmtBytes(child.file.size)}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function CodeViewer({ file }) {
  const [copied, setCopied] = useState(false);
  if (!file) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400 text-xs p-8 text-center">
        Selecciona un archivo del arbol izquierdo para ver su contenido.
      </div>
    );
  }
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(file.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* noop */ }
  };
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-zinc-200 px-3 py-2 bg-zinc-50 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <FileCode className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
          <span className="text-xs font-mono truncate">{file.path}</span>
          <Badge variant="secondary" className="rounded-lg text-[10px]">{file.language}</Badge>
          <span className="text-[10px] text-zinc-400">{fmtBytes(file.size)}</span>
        </div>
        <Button size="sm" variant="ghost" className="rounded-lg h-6 text-[10px]" onClick={onCopy} data-testid="copy-file-btn">
          {copied ? <><Check className="w-3 h-3 mr-1" />Copiado</> : <><Copy className="w-3 h-3 mr-1" />Copiar</>}
        </Button>
      </div>
      <pre className="flex-1 overflow-auto bg-[#0d1117] text-[#e6edf3] text-[11px] font-mono p-4 whitespace-pre">
        {file.content}
      </pre>
    </div>
  );
}

function PhaseTimeline({ phase, error }) {
  const stages = ["queued", "generating", "post_processing", "complete"];
  const idx = stages.indexOf(phase);
  return (
    <div className="border border-zinc-200 p-3 bg-white">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-700">Pipeline</span>
        {phase === "failed" && <span className="text-[10px] font-bold text-red-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Error</span>}
      </div>
      <div className="flex items-center gap-1.5">
        {stages.map((st, i) => {
          const active = phase === st;
          const done = idx > i || phase === "complete";
          return (
            <React.Fragment key={st}>
              <div className={`flex-1 h-7 flex items-center justify-center text-[10px] font-bold border-2 ${
                phase === "failed" && i === idx ? "bg-red-50 border-red-400 text-red-700"
                : done ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                : active ? "bg-blue-50 border-blue-500 text-blue-700"
                : "bg-zinc-50 border-zinc-200 text-zinc-400"
              }`}>
                {active && phase !== "complete" && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                {done && phase === "complete" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                {PHASE_LABELS[st]}
              </div>
              {i < stages.length - 1 && <div className={`h-0.5 w-2 ${done ? "bg-emerald-500" : "bg-zinc-200"}`} />}
            </React.Fragment>
          );
        })}
      </div>
      {error && (
        <div className="mt-2 text-[11px] bg-red-50 border border-red-200 text-red-800 p-2">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}

export default function CodeGenPage() {
  const { t } = useI18n();
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [project, setProject] = useState(null);
  const [specs, setSpecs] = useState([]);

  const [active, setActive] = useState(null); // current code generation full doc
  const [activeId, setActiveId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [expandedDirs, setExpandedDirs] = useState({});

  const [form, setForm] = useState({ spec_id: "", target: "fullstack", variant: "pro", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const pollerRef = useRef(null);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const r = await fetch(`${API}/ai-projects/${projectId}/code-generations`, { headers: authHeaders() });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setHistory(data.items || []);
    } catch (e) {
      toast.error(`Error cargando historial: ${e.message}`);
    } finally {
      setLoadingHistory(false);
    }
  }, [projectId]);

  const loadProject = useCallback(async () => {
    try {
      const [pr, sr] = await Promise.all([
        fetch(`${API}/projects/${projectId}`, { headers: authHeaders() }),
        fetch(`${API}/specs/specifications?project_id=${projectId}`, { headers: authHeaders() }),
      ]);
      if (pr.ok) setProject(await pr.json());
      if (sr.ok) {
        const list = await sr.json();
        setSpecs(list || []);
        if (list?.length && !form.spec_id) {
          setForm(f => ({ ...f, spec_id: list[0].id }));
        }
      }
    } catch (e) {
      // soft fail
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => { loadProject(); loadHistory(); }, [loadProject, loadHistory]);

  // Polling when active is processing
  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const r = await fetch(`${API}/ai-projects/code-generations/${activeId}`, { headers: authHeaders() });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const cg = await r.json();
        if (cancelled) return;
        setActive(cg);
        if (cg.status === "ready" || cg.status === "failed") {
          if (cg.status === "ready") {
            toast.success(`Codigo generado: ${cg.files_count} archivos`);
            // auto-select first file
            if (cg.files?.length) setSelectedFile(cg.files[0]);
          } else if (cg.status === "failed") {
            toast.error(`Generacion fallo: ${cg.error || "error desconocido"}`);
          }
          loadHistory();
          return;
        }
      } catch (e) {
        // silently retry
      }
      if (!cancelled) pollerRef.current = setTimeout(tick, 3000);
    };
    tick();
    return () => { cancelled = true; if (pollerRef.current) clearTimeout(pollerRef.current); };
  }, [activeId, loadHistory]);

  const handleStart = async () => {
    if (!form.spec_id) { toast.error("Selecciona una especificación"); return; }
    setSubmitting(true);
    try {
      const r = await fetch(`${API}/ai-projects/${projectId}/generate-code`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${r.status}`);
      }
      const data = await r.json();
      setActiveId(data.code_gen_id);
      setActive({ id: data.code_gen_id, status: "processing", phase: "queued", model: data.model, target: form.target, files: [] });
      setSelectedFile(null);
      toast.info(`Generacion iniciada con ${data.model}. Esto puede tardar 30-90s.`);
    } catch (e) {
      toast.error(`Error: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpen = async (id) => {
    setActiveId(id);
    setSelectedFile(null);
    try {
      const r = await fetch(`${API}/ai-projects/code-generations/${id}`, { headers: authHeaders() });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const cg = await r.json();
      setActive(cg);
      if (cg.files?.length) setSelectedFile(cg.files[0]);
    } catch (e) {
      toast.error(`Error: ${e.message}`);
    }
  };

  const handleDownload = () => {
    if (!active?.id) return;
    const tk = localStorage.getItem("session_token");
    const url = `${API}/ai-projects/code-generations/${active.id}/download`;
    fetch(url, { headers: { Authorization: `Bearer ${tk}` } })
      .then(r => r.ok ? r.blob() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(blob => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `codegen-${active.id.slice(0, 8)}.zip`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      })
      .catch(e => toast.error(`Error descargando: ${e.message}`));
  };

  const handleDelete = async () => {
    if (!active?.id) return;
    try {
      const r = await fetch(`${API}/ai-projects/code-generations/${active.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${r.status}`);
      }
      toast.success("Generacion eliminada");
      setActive(null); setActiveId(null); setSelectedFile(null);
      loadHistory();
    } catch (e) {
      toast.error(`Error: ${e.message}`);
    } finally {
      setDeleteOpen(false);
    }
  };

  const tree = useMemo(() => buildTree(active?.files || []), [active?.files]);
  const inProgress = active?.status === "processing";

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-30 bg-white border-b border-zinc-200 h-14 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link to={`/projects/${projectId}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" data-testid="codegen-back-btn">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="w-8 h-8 border border-zinc-200 flex items-center justify-center">
            <Code2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-900 tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>
              Generacion de Codigo · {project?.name || "..."}
            </h1>
            <p className="text-[11px] text-zinc-400">FastAPI + React scaffold desde Spec + BPMN via DeepSeek V4</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BranchBadge projectId={projectId} />
          <Link to={`/projects/${projectId}/tree`}>
            <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs">
              <History className="w-3.5 h-3.5 mr-1.5" />
              Arbol del proyecto
            </Button>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-4 p-4 max-w-[1700px] mx-auto" data-testid="codegen-root">
        {/* LEFT — Trigger form + history */}
        <aside className="col-span-12 lg:col-span-3 space-y-3">
          <Card className="rounded-lg border-2 border-zinc-200">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h2 className="text-xs font-bold tracking-wider uppercase">Nueva generacion</h2>
              </div>

              <div>
                <Label className="text-[10px] font-bold uppercase tracking-wider">Especificacion</Label>
                <select
                  className="w-full border border-zinc-300 rounded-lg px-2 h-8 text-xs mt-1"
                  value={form.spec_id}
                  onChange={(e) => setForm(f => ({ ...f, spec_id: e.target.value }))}
                  disabled={!isAuthenticated || inProgress}
                  data-testid="codegen-spec-select"
                >
                  <option value="">— Selecciona una spec —</option>
                  {specs.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </div>

              <div>
                <Label className="text-[10px] font-bold uppercase tracking-wider">Target</Label>
                <div className="grid grid-cols-3 gap-1 mt-1">
                  {[
                    { v: "fullstack", l: "Full Stack" },
                    { v: "backend", l: "Backend" },
                    { v: "frontend", l: "Frontend" },
                  ].map(opt => (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, target: opt.v }))}
                      className={`text-[10px] font-bold py-1.5 border-2 ${form.target === opt.v ? "border-zinc-900 bg-deep-navy text-white" : "border-zinc-200 hover:border-zinc-400"}`}
                      data-testid={`codegen-target-${opt.v}`}
                      disabled={inProgress}
                    >{opt.l}</button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-[10px] font-bold uppercase tracking-wider">Modelo DeepSeek V4</Label>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, variant: "pro" }))}
                    className={`flex items-center justify-center gap-1 text-[10px] font-bold py-1.5 border-2 ${form.variant === "pro" ? "border-violet-600 bg-violet-50 text-violet-800" : "border-zinc-200 hover:border-zinc-400"}`}
                    data-testid="codegen-variant-pro"
                    disabled={inProgress}
                  ><Brain className="w-3 h-3" /> Pro</button>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, variant: "flash" }))}
                    className={`flex items-center justify-center gap-1 text-[10px] font-bold py-1.5 border-2 ${form.variant === "flash" ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-zinc-200 hover:border-zinc-400"}`}
                    data-testid="codegen-variant-flash"
                    disabled={inProgress}
                  ><Zap className="w-3 h-3" /> Flash</button>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">Pro: ~90s, mas calidad. Flash: ~30s, mas rapido.</p>
              </div>

              <div>
                <Label className="text-[10px] font-bold uppercase tracking-wider">Notas (opcional)</Label>
                <Textarea
                  value={form.notes}
                  onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Instrucciones adicionales para la IA..."
                  className="rounded-lg text-xs h-16 mt-1"
                  disabled={inProgress}
                  data-testid="codegen-notes-input"
                />
              </div>

              <Button
                onClick={handleStart}
                disabled={!isAuthenticated || submitting || inProgress || !form.spec_id}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg h-9 text-xs font-bold"
                data-testid="codegen-start-btn"
              >
                {submitting || inProgress ? (
                  <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Generando...</>
                ) : (
                  <><Rocket className="w-3.5 h-3.5 mr-2" /> Generar codigo</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* History */}
          <Card className="rounded-lg border-2 border-zinc-200">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5">
                  <History className="w-3 h-3" />Historial ({history.length})
                </h2>
                <Button variant="ghost" size="sm" className="rounded-lg h-6 text-[10px]" onClick={loadHistory}>
                  Refrescar
                </Button>
              </div>
              {loadingHistory ? (
                <div className="text-[11px] text-zinc-400 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Cargando...</div>
              ) : history.length === 0 ? (
                <div className="text-[11px] text-zinc-400 text-center py-4">Aun no hay generaciones.</div>
              ) : (
                <div className="space-y-1 max-h-[400px] overflow-auto">
                  {history.map(it => {
                    const sel = active?.id === it.id;
                    return (
                      <button
                        key={it.id}
                        onClick={() => handleOpen(it.id)}
                        className={`w-full text-left p-2 border ${sel ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-400"}`}
                        data-testid={`codegen-history-${it.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono">{it.id.slice(0, 8)}</span>
                          <span className={`text-[9px] font-bold px-1 ${
                            it.status === "ready" ? "bg-emerald-100 text-emerald-700"
                            : it.status === "failed" ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                          }`}>{it.status}</span>
                        </div>
                        <div className="text-[10px] text-zinc-600 mt-0.5">{it.target} · {it.model}</div>
                        <div className="text-[10px] text-zinc-400">{fmtDate(it.created_at)} · {it.files_count || 0} files</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </aside>

        {/* RIGHT — Active generation */}
        <main className="col-span-12 lg:col-span-9 space-y-3" data-testid="codegen-active-panel">
          {!active ? (
            <Card className="rounded-lg border border-dashed border-zinc-300">
              <CardContent className="p-12 text-center text-zinc-400">
                <Code2 className="w-10 h-10 mx-auto mb-3 text-zinc-300" />
                <p className="text-sm font-bold mb-1">Aun no has generado codigo</p>
                <p className="text-xs">Configura los parametros y pulsa "Generar codigo" para crear un scaffold completo.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <PhaseTimeline phase={active.phase} error={active.error} />

              <Card className="rounded-lg border-2 border-zinc-200">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={`rounded-lg text-[10px] ${active.variant === "pro" ? "bg-violet-600" : "bg-emerald-600"} text-white`}>
                          {active.model}
                        </Badge>
                        <Badge variant="secondary" className="rounded-lg text-[10px]">{active.target}</Badge>
                        <span className="text-[11px] text-zinc-500">· {active.files_count || 0} archivos · {fmtBytes(active.total_size)}</span>
                      </div>
                      {active.summary && <p className="text-xs text-zinc-700">{active.summary}</p>}
                      {active.next_steps?.length > 0 && (
                        <details className="mt-2">
                          <summary className="text-[11px] font-bold cursor-pointer text-emerald-700">Siguientes pasos ({active.next_steps.length})</summary>
                          <ul className="mt-1 text-[11px] space-y-0.5 list-decimal list-inside text-zinc-600">
                            {active.next_steps.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        </details>
                      )}
                    </div>
                    {active.status === "ready" && (
                      <div className="flex items-center gap-2">
                        <Button onClick={handleDownload} size="sm" className="rounded-lg h-8 text-xs bg-deep-navy hover:bg-deep-navy/90 text-white" data-testid="codegen-download-btn">
                          <Download className="w-3.5 h-3.5 mr-1.5" />Descargar ZIP
                        </Button>
                        <Button onClick={() => setDeleteOpen(true)} variant="outline" size="sm" className="rounded-lg h-8 text-xs border-red-300 text-red-700 hover:bg-red-50" data-testid="codegen-delete-btn">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {active.status === "ready" && active.files?.length > 0 && (
                <Card className="rounded-lg border-2 border-zinc-200 overflow-hidden">
                  <div className="grid grid-cols-12">
                    <div className="col-span-4 lg:col-span-3 border-r border-zinc-200 bg-zinc-50 max-h-[70vh] overflow-auto" data-testid="codegen-file-tree">
                      <div className="px-3 py-2 border-b border-zinc-200 bg-white">
                        <span className="text-[10px] font-bold tracking-wider uppercase">Archivos · {active.files.length}</span>
                      </div>
                      <TreeNode
                        node={tree}
                        selectedPath={selectedFile?.path}
                        onSelect={setSelectedFile}
                        expanded={expandedDirs}
                        onToggle={(path, open) => setExpandedDirs(prev => ({ ...prev, [path]: open }))}
                      />
                    </div>
                    <div className="col-span-8 lg:col-span-9 max-h-[70vh] flex flex-col" data-testid="codegen-file-viewer">
                      <CodeViewer file={selectedFile} />
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </main>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="rounded-lg border border-zinc-200">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar generacion</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. La generacion y todos sus archivos se borraran permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-lg bg-red-600 hover:bg-red-700 text-white" data-testid="codegen-confirm-delete">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AiLoadingOverlay
        show={submitting || inProgress}
        statusText={t("common.generating")}
        subText="DeepSeek V4 esta generando el scaffold completo. Esto puede tardar entre 30 y 90 segundos."
      />
    </div>
  );
}
