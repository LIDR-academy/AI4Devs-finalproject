// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth, API } from "@/App";
import { useI18n } from "@/contexts/I18nContext";
import BranchBadge from "@/components/BranchBadge";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  GitBranch,
  Sparkles,
  Camera,
  RotateCcw,
  GitCompare,
  Eye,
  FileText,
  Workflow,
  Lightbulb,
  Brain,
  CheckCircle2,
  Plus,
  Minus,
  Edit3,
  ChevronDown,
  ChevronRight,
  Loader2,
  Code2,
  AlertTriangle,
} from "lucide-react";

const PHASE_META = {
  descripcion: { label: "Descripcion", color: "indigo", icon: Lightbulb },
  requirements: { label: "Requirements", color: "blue", icon: FileText },
  specification: { label: "Speckit / Spec", color: "violet", icon: Brain },
  bpmn: { label: "BPMN", color: "amber", icon: Workflow },
  code: { label: "Codigo (SDD)", color: "emerald", icon: Code2 },
};

const TRIGGER_META = {
  manual: { label: "Manual", color: "bg-deep-navy text-white" },
  "ai.requirements": { label: "IA · Requirements", color: "bg-blue-600 text-white" },
  "ai.speckit": { label: "IA · Speckit", color: "bg-violet-600 text-white" },
  "ai.bpmn": { label: "IA · BPMN", color: "bg-amber-600 text-white" },
  "ai.code": { label: "IA · Codigo", color: "bg-emerald-600 text-white" },
  "pre-restore": { label: "Pre-restore", color: "bg-zinc-300 text-zinc-700" },
  restore: { label: "Restore", color: "bg-emerald-600 text-white" },
};

const fmtDate = (iso) => {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return iso;
  }
};

function authHeaders() {
  const tk = localStorage.getItem("session_token");
  return tk ? { Authorization: `Bearer ${tk}` } : {};
}

function PhaseSection({ phase, items, onView, onCompare, compareSelection, onSnapshot, canSnapshot, project, projectId }) {
  const meta = PHASE_META[phase];
  const Icon = meta.icon;
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border-2 border-zinc-200 rounded-lg bg-white" data-testid={`phase-section-${phase}`}>
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className={`w-full flex items-center justify-between px-4 py-3 border-b border-zinc-200 bg-${meta.color}-50/40 hover:bg-${meta.color}-50/60 transition-colors`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-4 h-4 text-${meta.color}-700`} />
          <h2 className="text-sm font-bold tracking-tight text-zinc-900">{meta.label}</h2>
          <Badge variant="secondary" className="rounded-lg text-[10px]">{items.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {canSnapshot && phase === "specification" && project?.specSpecId && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-lg h-7 text-[11px]"
              data-testid={`snapshot-${phase}-btn`}
              onClick={(e) => { e.stopPropagation(); onSnapshot(phase, project.specSpecId); }}
            >
              <Camera className="w-3 h-3 mr-1.5" />
              Snapshot manual
            </Button>
          )}
          {expanded ? <ChevronDown className="w-4 h-4 text-zinc-400" /> : <ChevronRight className="w-4 h-4 text-zinc-400" />}
        </div>
      </button>

      {expanded && (
        <div className="p-4 space-y-2">
          {items.length === 0 && (
            <div className="text-xs text-zinc-400 py-6 text-center border border-dashed border-zinc-200">
              Aun no hay versiones registradas en esta fase.
            </div>
          )}

          {phase !== "bpmn" && phase !== "code" && items.map((it) => {
            const trigger = TRIGGER_META[it.trigger] || { label: it.trigger, color: "bg-zinc-200 text-zinc-700" };
            const aSel = compareSelection.a === it.snapshot_id;
            const bSel = compareSelection.b === it.snapshot_id;
            return (
              <div
                key={it.snapshot_id}
                className="flex items-center gap-3 border border-zinc-200 px-3 py-2 hover:border-zinc-400 transition-colors"
                data-testid={`snapshot-row-${phase}-v${it.version}`}
              >
                <div className="w-9 h-9 border border-zinc-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-mono font-bold">v{it.version}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 ${trigger.color}`}>{trigger.label}</span>
                    {it.label && <span className="text-xs text-zinc-700 truncate">{it.label}</span>}
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5 truncate">
                    {it.spec_title || "—"} · {fmtDate(it.created_at)} · {it.created_by}
                    {phase === "requirements" && it.count != null && (
                      <span className="ml-2">· {it.count} reqs ({it.must} must / {it.should} should)</span>
                    )}
                    {phase === "specification" && it.has_speckit && (
                      <span className="ml-2 text-violet-700">· Speckit {it.speckit_chars} chars</span>
                    )}
                    {phase === "descripcion" && it.summary && (
                      <span className="ml-2 italic">"{it.summary.slice(0, 80)}…"</span>
                    )}
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="rounded-lg h-7 px-2" onClick={() => onView(it.snapshot_id)} data-testid={`view-snapshot-btn-${it.snapshot_id}`}>
                  <Eye className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant={aSel ? "default" : "outline"}
                  className={`rounded-lg h-7 text-[10px] ${aSel ? "bg-deep-navy text-white" : ""}`}
                  onClick={() => onCompare("a", it.snapshot_id)}
                >A</Button>
                <Button
                  size="sm"
                  variant={bSel ? "default" : "outline"}
                  className={`rounded-lg h-7 text-[10px] ${bSel ? "bg-deep-navy text-white" : ""}`}
                  onClick={() => onCompare("b", it.snapshot_id)}
                >B</Button>
              </div>
            );
          })}

          {phase === "bpmn" && items.map((diag) => (
            <div key={diag.diagram_id} className="border border-zinc-200" data-testid={`bpmn-diag-${diag.diagram_id}`}>
              <div className="flex items-center justify-between px-3 py-2 bg-amber-50/40 border-b border-zinc-200">
                <div className="flex items-center gap-2 min-w-0">
                  <Workflow className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                  <span className="text-xs font-semibold truncate">{diag.name}</span>
                  {diag.created_by_ai && <Badge className="rounded-lg text-[9px] bg-amber-600">IA · {diag.ai_model}</Badge>}
                  <span className="text-[10px] text-zinc-400">v{diag.current_version}</span>
                </div>
                {canSnapshot && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg h-7 text-[11px]"
                    onClick={() => onSnapshot("bpmn", diag.diagram_id)}
                    data-testid={`snapshot-bpmn-btn-${diag.diagram_id}`}
                  >
                    <Camera className="w-3 h-3 mr-1.5" />
                    Snapshot
                  </Button>
                )}
              </div>
              <div className="p-2 space-y-1">
                {diag.versions.map((v) => {
                  const aSel = compareSelection.a === v.version_id;
                  const bSel = compareSelection.b === v.version_id;
                  return (
                    <div key={v.version_id} className="flex items-center gap-2 px-2 py-1 hover:bg-zinc-50">
                      <div className="w-7 h-7 border border-zinc-900 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-mono font-bold">v{v.version_number}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {v.tags?.length > 0 && v.tags.map(t => (
                            <span key={t} className="text-[9px] font-semibold px-1 py-0 bg-zinc-200 text-zinc-700">{t}</span>
                          ))}
                          <span className="text-[11px] text-zinc-700 truncate">{v.commit_message}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate">{fmtDate(v.created_at)} · {v.created_by}</div>
                      </div>
                      <Button size="sm" variant="ghost" className="rounded-lg h-7 px-2" onClick={() => onView(v.version_id)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant={aSel ? "default" : "outline"}
                        className={`rounded-lg h-7 text-[10px] ${aSel ? "bg-deep-navy text-white" : ""}`}
                        onClick={() => onCompare("a", v.version_id)}
                      >A</Button>
                      <Button
                        size="sm"
                        variant={bSel ? "default" : "outline"}
                        className={`rounded-lg h-7 text-[10px] ${bSel ? "bg-deep-navy text-white" : ""}`}
                        onClick={() => onCompare("b", v.version_id)}
                      >B</Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {phase === "code" && items.map((it) => {
            const trigger = TRIGGER_META[it.trigger] || { label: it.trigger, color: "bg-zinc-200 text-zinc-700" };
            return (
              <div
                key={it.snapshot_id}
                className="flex items-center gap-3 border border-zinc-200 px-3 py-2 hover:border-zinc-400"
                data-testid={`code-snapshot-row-${it.version}`}
              >
                <div className="w-9 h-9 border-2 border-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Code2 className="w-4 h-4 text-emerald-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 ${trigger.color}`}>{trigger.label}</span>
                    <span className="text-xs font-mono">v{it.version}</span>
                    <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700 px-1">{it.target}</span>
                    <span className="text-[10px] text-zinc-500">{it.model}</span>
                  </div>
                  <div className="text-[11px] text-zinc-700 mt-0.5 line-clamp-2">{it.summary || it.label || "—"}</div>
                  <div className="text-[10px] text-zinc-400">{fmtDate(it.created_at)} · {it.created_by} · {it.files_count} archivos</div>
                </div>
                <Link to={`/projects/${projectId}/codegen`}>
                  <Button size="sm" variant="ghost" className="rounded-lg h-7 px-2"><Eye className="w-3.5 h-3.5" /></Button>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ViewPanel({ snapshot }) {
  if (!snapshot) return null;
  if (snapshot.kind === "bpmn") {
    return (
      <div className="space-y-3">
        <div className="text-xs">
          <span className="font-bold">v{snapshot.version_number}</span> · {snapshot.commit_message} · {fmtDate(snapshot.created_at)}
        </div>
        <pre className="text-[10px] bg-zinc-50 border border-zinc-200 p-3 max-h-[60vh] overflow-auto whitespace-pre-wrap">{(snapshot.xml_content || "").slice(0, 8000)}</pre>
      </div>
    );
  }
  const payload = snapshot.payload || {};
  const spec = payload.spec || {};
  const reqs = payload.requirements || [];
  return (
    <div className="space-y-3 text-xs">
      <div className="border border-zinc-200 p-3 bg-zinc-50">
        <div className="font-bold text-sm">{spec.title}</div>
        <div className="text-zinc-600 mt-1">{spec.description}</div>
        <div className="mt-2 text-[10px] text-zinc-500">Modo: {spec.mode} · Status: {spec.status}</div>
      </div>
      {spec.speckit_doc && (
        <details className="border border-violet-200 p-3 bg-violet-50/40">
          <summary className="cursor-pointer font-semibold text-violet-800">Speckit ({spec.speckit_doc.length} chars)</summary>
          <pre className="text-[10px] mt-2 whitespace-pre-wrap max-h-[40vh] overflow-auto">{spec.speckit_doc.slice(0, 6000)}</pre>
        </details>
      )}
      <div className="border border-zinc-200">
        <div className="px-3 py-2 bg-zinc-100 font-bold text-[11px]">Requirements ({reqs.length})</div>
        <div className="divide-y divide-zinc-100 max-h-[40vh] overflow-auto">
          {reqs.map((r, i) => (
            <div key={r.id || i} className="px-3 py-2 flex items-start gap-2">
              <span className="font-mono text-[10px] font-bold w-14 flex-shrink-0">{r.code}</span>
              <span className={`text-[9px] uppercase font-bold px-1 py-0 flex-shrink-0 ${r.moscow === "must" ? "bg-red-100 text-red-700" : r.moscow === "should" ? "bg-amber-100 text-amber-700" : r.moscow === "could" ? "bg-blue-100 text-blue-700" : "bg-zinc-100 text-zinc-600"}`}>{r.moscow}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold">{r.title}</div>
                <div className="text-[10px] text-zinc-500 line-clamp-2">{r.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComparePanel({ diff }) {
  if (!diff) return null;
  if (diff.kind === "bpmn") {
    const xa = diff.a?.xml || "";
    const xb = diff.b?.xml || "";
    return (
      <div className="space-y-3 text-xs">
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="border border-zinc-200 p-2 bg-zinc-50">
            <div className="font-bold">A · v{diff.a.version_number}</div>
            <div className="text-zinc-500">{fmtDate(diff.a.created_at)}</div>
            <div className="mt-1 text-zinc-700">{diff.summary.from_chars} chars</div>
          </div>
          <div className="border border-zinc-200 p-2 bg-zinc-50">
            <div className="font-bold">B · v{diff.b.version_number}</div>
            <div className="text-zinc-500">{fmtDate(diff.b.created_at)}</div>
            <div className="mt-1 text-zinc-700">{diff.summary.to_chars} chars · Δ {diff.summary.delta_chars >= 0 ? "+" : ""}{diff.summary.delta_chars}</div>
          </div>
        </div>
        {!diff.summary.changed && <div className="text-[11px] text-emerald-700 border border-emerald-200 bg-emerald-50 p-2">Sin cambios entre A y B.</div>}
        <div className="grid grid-cols-2 gap-2">
          <pre className="text-[9px] bg-zinc-50 border border-zinc-200 p-2 max-h-[50vh] overflow-auto whitespace-pre-wrap">{xa.slice(0, 4000)}</pre>
          <pre className="text-[9px] bg-zinc-50 border border-zinc-200 p-2 max-h-[50vh] overflow-auto whitespace-pre-wrap">{xb.slice(0, 4000)}</pre>
        </div>
      </div>
    );
  }

  // phase compare
  const sd = diff.spec_diff || {};
  const rd = diff.requirements_diff || {};
  const skd = diff.speckit_diff || {};
  const fieldRow = (key, label) => {
    const changed = sd[key]?.from !== sd[key]?.to;
    return (
      <div key={key} className={`flex items-start gap-2 text-[11px] py-1 px-2 ${changed ? "bg-amber-50" : ""}`}>
        <span className="font-bold w-24 flex-shrink-0">{label}</span>
        {changed ? (
          <span className="flex-1 min-w-0">
            <span className="line-through text-red-600">{String(sd[key]?.from || "—").slice(0, 80)}</span>
            <span className="mx-1 text-zinc-400">→</span>
            <span className="text-emerald-700 font-semibold">{String(sd[key]?.to || "—").slice(0, 80)}</span>
          </span>
        ) : (
          <span className="text-zinc-500 truncate">{String(sd[key]?.from || "—").slice(0, 80)}</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3 text-xs" data-testid="compare-panel">
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="border border-zinc-200 p-2 bg-zinc-50">
          <div className="font-bold">A · v{diff.a.version}</div>
          <div className="text-zinc-500">{fmtDate(diff.a.created_at)}</div>
        </div>
        <div className="border border-zinc-200 p-2 bg-zinc-50">
          <div className="font-bold">B · v{diff.b.version}</div>
          <div className="text-zinc-500">{fmtDate(diff.b.created_at)}</div>
        </div>
      </div>

      <div className="border border-zinc-200">
        <div className="px-2 py-1.5 bg-zinc-100 font-bold text-[11px]">Spec metadata</div>
        {fieldRow("title", "Titulo")}
        {fieldRow("description", "Descripcion")}
        {fieldRow("mode", "Modo")}
        {fieldRow("status", "Status")}
      </div>

      <div className="border border-zinc-200">
        <div className="px-2 py-1.5 bg-zinc-100 font-bold text-[11px] flex items-center justify-between">
          <span>Requirements diff</span>
          <span className="text-[10px] text-zinc-500">+{rd.summary?.added || 0} · −{rd.summary?.removed || 0} · ~{rd.summary?.modified || 0} · ={rd.summary?.unchanged || 0}</span>
        </div>
        <div className="divide-y divide-zinc-100 max-h-[40vh] overflow-auto">
          {(rd.added || []).map(r => (
            <div key={"add-" + r.code} className="px-2 py-1.5 flex items-center gap-2 bg-emerald-50/50">
              <Plus className="w-3 h-3 text-emerald-700 flex-shrink-0" />
              <span className="font-mono text-[10px] font-bold w-14">{r.code}</span>
              <span className="text-[11px] flex-1 truncate">{r.title}</span>
              <span className="text-[9px] uppercase text-zinc-500">{r.moscow}</span>
            </div>
          ))}
          {(rd.removed || []).map(r => (
            <div key={"rm-" + r.code} className="px-2 py-1.5 flex items-center gap-2 bg-red-50/50">
              <Minus className="w-3 h-3 text-red-700 flex-shrink-0" />
              <span className="font-mono text-[10px] font-bold w-14 line-through">{r.code}</span>
              <span className="text-[11px] flex-1 truncate line-through">{r.title}</span>
              <span className="text-[9px] uppercase text-zinc-500">{r.moscow}</span>
            </div>
          ))}
          {(rd.modified || []).map(r => (
            <div key={"mod-" + r.code} className="px-2 py-1.5 bg-amber-50/40">
              <div className="flex items-center gap-2">
                <Edit3 className="w-3 h-3 text-amber-700 flex-shrink-0" />
                <span className="font-mono text-[10px] font-bold w-14">{r.code}</span>
                <span className="text-[11px] flex-1 truncate">{r.title}</span>
              </div>
              <div className="ml-7 mt-1 text-[10px] space-y-0.5">
                {Object.entries(r.changes || {}).map(([k, v]) => (
                  <div key={k} className="flex gap-1">
                    <span className="font-bold">{k}:</span>
                    <span className="line-through text-red-600 max-w-[200px] truncate">{String(typeof v.from === "object" ? JSON.stringify(v.from) : (v.from || "—")).slice(0, 60)}</span>
                    <span className="text-zinc-400">→</span>
                    <span className="text-emerald-700 max-w-[200px] truncate">{String(typeof v.to === "object" ? JSON.stringify(v.to) : (v.to || "—")).slice(0, 60)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {(rd.summary?.added === 0 && rd.summary?.removed === 0 && rd.summary?.modified === 0) && (
            <div className="px-2 py-3 text-center text-[11px] text-emerald-700">Requirements identicos.</div>
          )}
        </div>
      </div>

      {skd.changed && (
        <div className="border border-violet-200">
          <div className="px-2 py-1.5 bg-violet-100 font-bold text-[11px]">Speckit diff · {skd.from_chars} → {skd.to_chars} chars</div>
          <div className="grid grid-cols-2 gap-1 p-2">
            <pre className="text-[9px] whitespace-pre-wrap max-h-[30vh] overflow-auto">{skd.from_text}</pre>
            <pre className="text-[9px] whitespace-pre-wrap max-h-[30vh] overflow-auto">{skd.to_text}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectTreePage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();

  const [tree, setTree] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeSnapshot, setActiveSnapshot] = useState(null);
  const [activeSnapshotMeta, setActiveSnapshotMeta] = useState(null); // { phase, version, ... }
  const [activeTab, setActiveTab] = useState("view");
  const [compare, setCompare] = useState({ a: null, b: null });
  const [diff, setDiff] = useState(null);
  const [diffLoading, setDiffLoading] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [versionLabel, setVersionLabel] = useState("");
  const [creatingVersion, setCreatingVersion] = useState(false);

  const canEdit = !!isAuthenticated;

  const loadTree = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/projects/${projectId}/tree`, { headers: authHeaders() });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setTree(data);
    } catch (e) {
      toast.error(`No se pudo cargar el arbol: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { loadTree(); }, [loadTree]);

  const projectMeta = useMemo(() => {
    if (!tree) return null;
    const specs = tree.phases?.specification || [];
    return { specSpecId: specs[0]?.spec_id || null };
  }, [tree]);

  const handleView = async (id) => {
    setActiveTab("view");
    setSheetOpen(true);
    setActiveSnapshot(null);
    try {
      const r = await fetch(`${API}/projects/snapshots/${id}`, { headers: authHeaders() });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const snap = await r.json();
      setActiveSnapshot(snap);
      setActiveSnapshotMeta({ id, kind: snap.kind, version: snap.version || snap.version_number });
    } catch (e) {
      toast.error(`Error abriendo snapshot: ${e.message}`);
    }
  };

  const handleSnapshot = async (phase, resourceId) => {
    try {
      const r = await fetch(`${API}/projects/${projectId}/snapshots`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ phase, resource_id: resourceId, label: `Manual · ${new Date().toLocaleString("es-ES")}` }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${r.status}`);
      }
      toast.success("Snapshot creado");
      loadTree();
    } catch (e) {
      toast.error(`Error: ${e.message}`);
    }
  };

  const handleCreateVersion = async () => {
    setCreatingVersion(true);
    try {
      const r = await fetch(`${API}/projects/${projectId}/version`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ label: versionLabel.trim() || null }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${r.status}`);
      }
      const data = await r.json();
      toast.success(t("proj.tree_version_created") + ` · ${data.total_snapshots} snapshots`);
      setVersionDialogOpen(false);
      setVersionLabel("");
      loadTree();
    } catch (e) {
      toast.error(`${t("proj.tree_version_error")}: ${e.message}`);
    } finally {
      setCreatingVersion(false);
    }
  };

  const handleCompareSelect = (slot, id) => {
    setCompare(prev => {
      const next = { ...prev, [slot]: prev[slot] === id ? null : id };
      return next;
    });
  };

  useEffect(() => {
    if (!compare.a || !compare.b) {
      setDiff(null);
      return;
    }
    setDiffLoading(true);
    fetch(`${API}/projects/snapshots/compare?a=${compare.a}&b=${compare.b}`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : r.json().then(j => Promise.reject(new Error(j.detail || `HTTP ${r.status}`))))
      .then(d => {
        setDiff(d);
        setActiveTab("compare");
        setSheetOpen(true);
      })
      .catch(e => toast.error(`Error comparando: ${e.message}`))
      .finally(() => setDiffLoading(false));
  }, [compare.a, compare.b]);

  const handleRestore = async () => {
    if (!activeSnapshotMeta?.id) return;
    setRestoring(true);
    try {
      const r = await fetch(`${API}/projects/snapshots/${activeSnapshotMeta.id}/restore`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${r.status}`);
      }
      const data = await r.json();
      toast.success(`Restaurado · ${data.kind === "bpmn" ? `nueva v${data.new_version}` : `${data.requirements_restored} reqs`}`);
      setRestoreOpen(false);
      setSheetOpen(false);
      loadTree();
    } catch (e) {
      toast.error(`Error restaurando: ${e.message}`);
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    );
  }
  if (!tree) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-sm text-zinc-500">Proyecto no encontrado.</div>
      </div>
    );
  }

  const phases = tree.phases || {};

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-30 bg-white border-b border-zinc-200 h-14 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link to={`/projects/${projectId}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" data-testid="tree-back-btn"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div className="w-8 h-8 border border-zinc-200 flex items-center justify-center flex-shrink-0">
            <GitBranch className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-900 tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>
              Arbol del proyecto · {tree.project?.name}
            </h1>
            <p className="text-[11px] text-zinc-400">Descripcion → Requirements → Speckit → BPMN. Versiones, comparar y restaurar.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BranchBadge projectId={projectId} />
          <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs" onClick={loadTree}>
            Refrescar
          </Button>
          <Button
            variant="default"
            size="sm"
            className="rounded-lg h-8 text-xs bg-deep-navy hover:bg-deep-navy/90 text-white"
            onClick={() => setVersionDialogOpen(true)}
            data-testid="create-version-btn"
          >
            <Camera className="w-3.5 h-3.5 mr-1.5" />
            {t("proj.tree_new_version")}
          </Button>
          {compare.a && compare.b && (
            <Badge className="rounded-lg bg-amber-600 text-white">
              <GitCompare className="w-3 h-3 mr-1" /> Comparando A↔B
            </Badge>
          )}
          {(compare.a || compare.b) && (
            <Button variant="ghost" size="sm" className="rounded-lg h-8 text-xs" onClick={() => setCompare({ a: null, b: null })}>
              Limpiar comparacion
            </Button>
          )}
        </div>
      </header>

      <div className="bg-amber-50 border-b-2 border-amber-200 px-6 py-2.5 flex items-center gap-3 text-sm">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span className="text-amber-800 text-xs">
          <strong>Legado:</strong> Esta vista de snapshots por fase es la version anterior.
        </span>
        <Link
          to={`/projects/${projectId}/versions`}
          className="ml-auto text-xs font-bold text-amber-700 hover:text-amber-900 underline flex items-center gap-1"
        >
          Ir al nuevo sistema de versiones <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="p-6 space-y-4 max-w-6xl mx-auto" data-testid="project-tree-root">
        <PhaseSection phase="descripcion" items={phases.descripcion || []} onView={handleView} onCompare={handleCompareSelect} compareSelection={compare} onSnapshot={handleSnapshot} canSnapshot={canEdit} project={projectMeta} projectId={projectId} />
        <PhaseSection phase="requirements" items={phases.requirements || []} onView={handleView} onCompare={handleCompareSelect} compareSelection={compare} onSnapshot={handleSnapshot} canSnapshot={canEdit} project={projectMeta} projectId={projectId} />
        <PhaseSection phase="specification" items={phases.specification || []} onView={handleView} onCompare={handleCompareSelect} compareSelection={compare} onSnapshot={handleSnapshot} canSnapshot={canEdit} project={projectMeta} projectId={projectId} />
        <PhaseSection phase="bpmn" items={phases.bpmn || []} onView={handleView} onCompare={handleCompareSelect} compareSelection={compare} onSnapshot={handleSnapshot} canSnapshot={canEdit} project={projectMeta} projectId={projectId} />
        <PhaseSection phase="code" items={phases.code || []} onView={handleView} onCompare={handleCompareSelect} compareSelection={compare} onSnapshot={handleSnapshot} canSnapshot={canEdit} project={projectMeta} projectId={projectId} />
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="sm:max-w-2xl w-full p-0 overflow-hidden">
          <SheetHeader className="px-5 py-4 border-b border-zinc-200">
            <SheetTitle className="text-sm font-bold tracking-tight">Detalle del snapshot</SheetTitle>
            <SheetDescription className="text-xs">Ver, comparar o restaurar.</SheetDescription>
          </SheetHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="px-5 py-3">
            <TabsList className="rounded-lg bg-zinc-100">
              <TabsTrigger value="view" className="rounded-lg text-[11px]"><Eye className="w-3 h-3 mr-1.5" />Ver</TabsTrigger>
              <TabsTrigger value="compare" className="rounded-lg text-[11px]" disabled={!diff && !diffLoading}><GitCompare className="w-3 h-3 mr-1.5" />Comparar</TabsTrigger>
              <TabsTrigger value="restore" className="rounded-lg text-[11px]" disabled={!canEdit}><RotateCcw className="w-3 h-3 mr-1.5" />Restaurar</TabsTrigger>
            </TabsList>
            <TabsContent value="view" className="mt-3">
              <ViewPanel snapshot={activeSnapshot} />
            </TabsContent>
            <TabsContent value="compare" className="mt-3">
              {diffLoading ? (
                <div className="flex items-center gap-2 text-xs text-zinc-500"><Loader2 className="w-4 h-4 animate-spin" /> Calculando diff...</div>
              ) : (
                <ComparePanel diff={diff} />
              )}
            </TabsContent>
            <TabsContent value="restore" className="mt-3">
              {!activeSnapshotMeta ? (
                <div className="text-xs text-zinc-500">Selecciona "Ver" en una version para activar Restaurar.</div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="border-2 border-amber-300 bg-amber-50 p-3">
                    <div className="font-bold text-amber-900 mb-1">Vas a sobrescribir el estado actual.</div>
                    <div className="text-amber-800">Antes de aplicar, se guardara automaticamente un snapshot del estado actual con tag <code className="bg-amber-100 px-1">pre-restore</code> para que puedas deshacerlo.</div>
                  </div>
                  <Button
                    onClick={() => setRestoreOpen(true)}
                    className="w-full bg-deep-navy hover:bg-deep-navy/90 text-white rounded-lg h-9 text-xs font-semibold"
                    data-testid="restore-snapshot-btn"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-2" />
                    Restaurar v{activeSnapshotMeta.version}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

      <AlertDialog open={restoreOpen} onOpenChange={setRestoreOpen}>
        <AlertDialogContent className="rounded-lg border border-zinc-200">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar restauracion</AlertDialogTitle>
            <AlertDialogDescription>
              Se sobrescribira el estado actual con la version v{activeSnapshotMeta?.version}. Se creara un snapshot de seguridad antes de aplicar los cambios.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestore}
              disabled={restoring}
              className="rounded-lg bg-deep-navy hover:bg-deep-navy/90 text-white"
              data-testid="confirm-restore-btn"
            >
              {restoring ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Restaurando...</> : <>Restaurar</>}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={versionDialogOpen} onOpenChange={setVersionDialogOpen}>
        <AlertDialogContent className="rounded-lg border border-zinc-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold">
              {t("proj.tree_create_version")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Se creara una version completa del proyecto con snapshots de todas las fases (descripcion, requirements, specification, BPMN, codigo). Todos los snapshots compartiran la misma etiqueta para identificarlos como parte de esta version.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Input
              placeholder={t("proj.tree_version_label")}
              value={versionLabel}
              onChange={(e) => setVersionLabel(e.target.value)}
              className="rounded-lg h-9 text-sm"
              maxLength={200}
              onKeyDown={(e) => { if (e.key === "Enter" && !creatingVersion) handleCreateVersion(); }}
              data-testid="version-label-input"
            />
            <p className="text-[10px] text-zinc-400 mt-1.5">
              {t("common.optional")} · max 200 caracteres
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg" disabled={creatingVersion}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCreateVersion}
              disabled={creatingVersion}
              className="rounded-lg bg-deep-navy hover:bg-deep-navy/90 text-white"
              data-testid="confirm-create-version-btn"
            >
              {creatingVersion ? (
                <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> {t("common.creating")}</>
              ) : (
                <><Camera className="w-3.5 h-3.5 mr-2" /> {t("proj.tree_create_version")}</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
