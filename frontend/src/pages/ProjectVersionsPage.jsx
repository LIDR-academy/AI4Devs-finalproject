// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth, API } from "@/App";
import { useI18n } from "@/contexts/I18nContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import ProjectMenuBar from "@/components/ProjectMenuBar";
import BranchCreateDialog from "@/components/BranchCreateDialog";
import ImpactAnalysisPanel from "@/components/ImpactAnalysisPanel";
import {
  ArrowLeft,
  GitBranch,
  Plus,
  GitFork,
  FileText,
  Workflow,
  Brain,
  Code2,
  AlertTriangle,
  Loader2,
  Star,
  Check,
  Search,
  Trash2,
  GitMerge,
  ArrowRight,
  FilePlus,
  FileWarning,
  X,
} from "lucide-react";

const fmtDate = (iso) => {
  if (!iso) return "\u2014";
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-ES", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
};

function authHeaders() {
  const tk = localStorage.getItem("session_token");
  return tk ? { Authorization: `Bearer ${tk}` } : {};
}

export default function ProjectVersionsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();

  const [project, setProject] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(null); // branch id being switched to

  // create branch dialog
  const [createOpen, setCreateOpen] = useState(false);

  // switch confirmation
  const [switchConfirm, setSwitchConfirm] = useState(null); // {branch}

  // delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(null); // {branch}

  // impact analysis
  const [impactBranchId, setImpactBranchId] = useState(null);

  // merge state
  const [mergeBranchId, setMergeBranchId] = useState(null);
  const [mergePreview, setMergePreview] = useState(null);
  const [mergeLoading, setMergeLoading] = useState(false);
  const [mergeExecuting, setMergeExecuting] = useState(false);
  const [conflictResolutions, setConflictResolutions] = useState({});

  const load = useCallback(async () => {
    try {
      const [projR, brR] = await Promise.all([
        fetch(`${API}/projects/${projectId}`, { headers: authHeaders() }),
        fetch(`${API}/projects/${projectId}/branches`, {
          headers: authHeaders(),
        }),
      ]);
      if (projR.ok) setProject(await projR.json());
      if (brR.ok) setBranches(await brR.json());
    } catch (e) {
      toast.error("Error loading branches");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSwitch = async (branchId) => {
    setSwitching(branchId);
    try {
      const r = await fetch(
        `${API}/projects/${projectId}/branches/${branchId}/switch`,
        {
          method: "POST",
          headers: { ...authHeaders(), "Content-Type": "application/json" },
        },
      );
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${r.status}`);
      }
      const data = await r.json();
      toast.success(
        `${t("proj.switched_to_branch") || "Switched to"}: ${data.branch_name || branchId}`,
      );
      load();
    } catch (e) {
      toast.error(`Switch error: ${e.message}`);
    } finally {
      setSwitching(null);
      setSwitchConfirm(null);
    }
  };

  const handleDelete = async (branchId) => {
    try {
      const r = await fetch(
        `${API}/projects/${projectId}/branches/${branchId}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        },
      );
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${r.status}`);
      }
      toast.success(t("proj.branch_deleted") || "Branch deleted");
      load();
    } catch (e) {
      toast.error(`Delete error: ${e.message}`);
    } finally {
      setDeleteConfirm(null);
    }
  };

  const loadMergePreview = useCallback(
    async (sourceBranchId) => {
      if (!sourceBranchId) return;
      setMergeLoading(true);
      try {
        const r = await fetch(
          `${API}/projects/${projectId}/branches/${sourceBranchId}/merge-preview`,
          {
            method: "POST",
            headers: { ...authHeaders(), "Content-Type": "application/json" },
          },
        );
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err.detail || `HTTP ${r.status}`);
        }
        const data = await r.json();
        setMergePreview(data);
        const resolutions = {};
        (data.files_conflict || []).forEach((fc) => {
          const key = `${fc.name}||${fc.parent_id || ""}`;
          resolutions[key] = "target";
        });
        setConflictResolutions(resolutions);
      } catch (e) {
        toast.error(`Merge preview error: ${e.message}`);
        setMergeBranchId(null);
      } finally {
        setMergeLoading(false);
      }
    },
    [projectId],
  );

  const handleMergeExecute = async () => {
    if (!mergeBranchId || !mergePreview) return;
    setMergeExecuting(true);
    try {
      const resolvedFiles = Object.entries(conflictResolutions)
        .filter(([, val]) => val === "source")
        .map(([key]) => {
          const conflict = mergePreview.files_conflict.find(
            (fc) => `${fc.name}||${fc.parent_id || ""}` === key,
          );
          return conflict
            ? { file_id: conflict.source_id, resolution: "source" }
            : null;
        })
        .filter(Boolean);

      const r = await fetch(
        `${API}/projects/${projectId}/branches/${mergeBranchId}/merge`,
        {
          method: "POST",
          headers: { ...authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({ resolved_files: resolvedFiles }),
        },
      );
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${r.status}`);
      }
      const data = await r.json();
      toast.success(data.message || "Merge complete");
      setMergeBranchId(null);
      setMergePreview(null);
      load();
    } catch (e) {
      toast.error(`Merge error: ${e.message}`);
    } finally {
      setMergeExecuting(false);
    }
  };

  const activeBranch = branches.find((b) => b.active);
  const defaultBranch = branches.find((b) => b.is_default);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ProjectMenuBar />

      {/* sticky header */}
      <div className="sticky top-0 z-30 bg-white border-b-2 border-zinc-200">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/projects/${projectId}`)}
            className="p-2 -ml-2 hover:bg-zinc-100 rounded-lg"
            title={t("common.back") || "Back"}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <GitBranch className="w-5 h-5 text-zinc-500" />
          <div>
            <h1 className="text-base font-bold font-title text-zinc-900 leading-none">
              {project?.name || "Project"}
            </h1>
            <p className="text-xs text-zinc-500">
              {t("nav.branches") || "Branches"}
            </p>
          </div>
          <div className="flex-1" />
          {activeBranch && (
            <button
              type="button"
              onClick={() => navigate(`/projects/${projectId}/versions`)}
              title="Ir a versiones"
              className="inline-flex items-center border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent shadow hover:bg-emerald-700 rounded-lg font-mono text-xs bg-emerald-600 text-white cursor-pointer"
            >
              <GitBranch className="w-3 h-3 mr-1" aria-hidden="true" />
              {activeBranch.name}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* toolbar */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1" />
          <Button
            onClick={() => setCreateOpen(true)}
            className="rounded-lg font-bold bg-deep-navy text-white hover:bg-zinc-800 gap-2 h-9 text-xs"
          >
            <Plus className="w-4 h-4" />
            {t("proj.create_branch") || "Create Branch"}
          </Button>
        </div>

        {/* branches list */}
        {branches.length === 0 ? (
          <div className="text-center py-16 text-zinc-400">
            <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-bold uppercase tracking-wide">
              {t("proj.no_branches_yet") || "No branches yet"}
            </p>
            <p className="text-xs mt-1">
              {t("proj.create_first_branch") ||
                "Create your first branch to start versioning your project."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {branches.map((b) => (
              <BranchCard
                key={b.id}
                branch={b}
                projectId={projectId}
                isActive={b.active}
                isDefault={b.is_default}
                switching={switching === b.id}
                onSwitch={() => setSwitchConfirm({ branch: b })}
                onImpact={() => setImpactBranchId(b.id)}
                onDelete={
                  !b.is_default && !b.active && branches.length > 1
                    ? () => setDeleteConfirm({ branch: b })
                    : null
                }
                onMerge={(id) => {
                  setMergeBranchId(id);
                  loadMergePreview(id);
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* create branch dialog */}
      <BranchCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        projectId={projectId}
        branches={branches}
        onCreated={() => {
          setCreateOpen(false);
          load();
        }}
      />

      {/* switch confirmation */}
      <AlertDialog
        open={!!switchConfirm}
        onOpenChange={() => setSwitchConfirm(null)}
      >
        <AlertDialogContent className="rounded-lg border-2 border-zinc-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-title text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              {t("proj.switch_branch") || "Switch branch"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-zinc-600">
              {`Switching from "${activeBranch?.name || "current"}" to "${switchConfirm?.branch?.name}" will update the project's files, diagrams, and specs to match the target branch.`}
              <br />
              <br />
              <strong>{t("common.continue") || "Continue?"}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg border border-zinc-200 font-bold text-xs uppercase">
              {t("common.cancel") || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (switchConfirm) handleSwitch(switchConfirm.branch.id);
              }}
              className="rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase"
            >
              {t("common.switch") || "Switch"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* delete confirmation */}
      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent className="rounded-lg border-2 border-zinc-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-title text-lg flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              {t("proj.delete_branch") || "Delete branch"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-zinc-600">
              {`This will permanently delete branch "${deleteConfirm?.branch?.name}" and all its files. This action cannot be undone.`}
              <br />
              <br />
              <strong>{t("common.continue") || "Continue?"}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg border border-zinc-200 font-bold text-xs uppercase">
              {t("common.cancel") || "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm) handleDelete(deleteConfirm.branch.id);
              }}
              className="rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase"
            >
              {t("common.delete") || "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* impact analysis panel */}
      <Sheet
        open={!!impactBranchId}
        onOpenChange={() => setImpactBranchId(null)}
      >
        <SheetContent
          side="right"
          className="w-[480px] sm:max-w-[480px] rounded-lg border-l-2 border-zinc-200 p-0"
        >
          <ImpactAnalysisPanel
            projectId={projectId}
            versionId={impactBranchId}
            onClose={() => setImpactBranchId(null)}
          />
        </SheetContent>
      </Sheet>

      {/* merge preview sheet */}
      <Sheet
        open={!!mergeBranchId}
        onOpenChange={() => {
          setMergeBranchId(null);
          setMergePreview(null);
        }}
      >
        <SheetContent
          side="right"
          className="w-[560px] sm:max-w-[560px] rounded-lg border-l-2 border-zinc-200 p-0 overflow-y-auto"
        >
          <SheetHeader className="px-5 py-4 border-b-2 border-zinc-200 flex-shrink-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="font-title text-lg flex items-center gap-2">
                <GitMerge className="w-5 h-5" />
                {t("proj.merge_preview") || "Merge Preview"}
              </SheetTitle>
              <button
                type="button"
                onClick={() => {
                  setMergeBranchId(null);
                  setMergePreview(null);
                }}
                className="p-1 hover:bg-zinc-100 rounded-lg"
              >
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>
          </SheetHeader>

          {mergeLoading ? (
            <div className="flex items-center justify-center h-full py-16">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            </div>
          ) : mergePreview ? (
            <div className="p-5 space-y-5">
              {/* Source -> Target indicator */}
              <div className="flex items-center gap-2 text-sm text-zinc-600">
                <Badge className="rounded-lg bg-blue-100 text-blue-800 border-blue-200 font-mono">
                  {mergePreview.source_branch?.name}
                </Badge>
                <ArrowRight className="w-4 h-4" />
                <Badge className="rounded-lg bg-deep-navy text-white font-mono">
                  {mergePreview.target_branch?.name}
                </Badge>
                <span className="text-xs text-zinc-400">(active)</span>
              </div>

              {/* Files to add */}
              {mergePreview.files_to_add?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-1.5 mb-2">
                    <FilePlus className="w-4 h-4 text-emerald-600" />
                    {t("proj.files_to_add") || "Files to add"}:{" "}
                    {mergePreview.files_to_add.length}
                  </h3>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {mergePreview.files_to_add.map((f) => (
                      <div
                        key={f.id}
                        className="text-xs font-mono text-zinc-600 border border-zinc-200 px-2 py-1 rounded-lg flex items-center gap-1.5"
                      >
                        {f.type === "directory" ? (
                          <span className="text-amber-500 font-bold">
                            [dir]
                          </span>
                        ) : null}
                        {f.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conflicted files */}
              {mergePreview.files_conflict?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-1.5 mb-2">
                    <FileWarning className="w-4 h-4 text-amber-600" />
                    {t("proj.files_conflict") || "Conflicts"}:{" "}
                    {mergePreview.files_conflict.length}
                  </h3>
                  <div className="space-y-3">
                    {mergePreview.files_conflict.map((fc) => {
                      const ck = `${fc.name}||${fc.parent_id || ""}`;
                      return (
                      <div
                        key={ck}
                        className="border border-amber-200 rounded-lg p-3 bg-amber-50"
                      >
                        <p className="text-xs font-bold text-amber-800 mb-2 font-mono">
                          {fc.name}
                        </p>
                        <RadioGroup
                          value={conflictResolutions[ck] || "target"}
                          onValueChange={(val) =>
                            setConflictResolutions((prev) => ({
                              ...prev,
                              [ck]: val,
                            }))
                          }
                          className="flex gap-4"
                        >
                          <div className="flex items-center gap-1">
                            <RadioGroupItem
                              value="source"
                              id={`${ck}-source`}
                            />
                            <Label
                              htmlFor={`${ck}-source`}
                              className="text-xs cursor-pointer"
                            >
                              {t("proj.use_source") || "Use source"}
                            </Label>
                          </div>
                          <div className="flex items-center gap-1">
                            <RadioGroupItem
                              value="target"
                              id={`${ck}-target`}
                            />
                            <Label
                              htmlFor={`${ck}-target`}
                              className="text-xs cursor-pointer"
                            >
                              {t("proj.use_target") || "Keep target"}
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Diagrams to add */}
              {mergePreview.diagrams_to_add?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-purple-700 flex items-center gap-1.5">
                    <Workflow className="w-4 h-4" />
                    {t("proj.diagrams") || "Diagrams"}: +
                    {mergePreview.diagrams_to_add.length}
                  </h3>
                </div>
              )}

              {/* Specs to add */}
              {mergePreview.specs_to_add?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-sky-700 flex items-center gap-1.5">
                    <Brain className="w-4 h-4" />
                    {t("proj.specs") || "Specs"}: +
                    {mergePreview.specs_to_add.length}
                  </h3>
                </div>
              )}

              {/* Files unchanged */}
              {mergePreview.files_unchanged?.length > 0 && (
                <p className="text-xs text-zinc-400">
                  {mergePreview.files_unchanged.length}{" "}
                  {t("proj.files_unchanged") || "files unchanged"}
                </p>
              )}

              {/* All clear / nothing to merge */}
              {!mergePreview.files_to_add?.length &&
                !mergePreview.files_conflict?.length &&
                !mergePreview.diagrams_to_add?.length &&
                !mergePreview.specs_to_add?.length && (
                  <p className="text-sm text-zinc-500 text-center py-8">
                    Nothing to merge — branches are identical.
                  </p>
                )}
            </div>
          ) : (
            <div className="p-5 text-center text-zinc-500 text-sm">
              {t("common.no_data") || "No data available"}
            </div>
          )}

          {/* Footer with execute button */}
          {mergePreview && (
            <SheetFooter className="px-5 py-4 border-t-2 border-zinc-200">
              <Button
                variant="outline"
                onClick={() => {
                  setMergeBranchId(null);
                  setMergePreview(null);
                }}
                className="rounded-lg border border-zinc-200 font-bold text-xs uppercase"
              >
                {t("common.cancel") || "Cancel"}
              </Button>
              <Button
                onClick={handleMergeExecute}
                disabled={!mergePreview || mergeExecuting}
                className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase"
              >
                {mergeExecuting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <GitMerge className="w-4 h-4 mr-1" />
                )}
                {t("proj.execute_merge") || "Execute Merge"}
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function BranchCard({
  branch,
  projectId,
  isActive,
  isDefault,
  switching,
  onSwitch,
  onImpact,
  onDelete,
  onMerge,
}) {
  const { t } = useI18n();
  const is = branch.impact_summary || {};

  return (
    <Card
      className={`rounded-lg border-2 transition-colors ${
        isActive ? "border-zinc-900 bg-white" : "border-zinc-200 bg-zinc-50/50"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* branch icon */}
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 ${
              isActive
                ? "bg-emerald-600 text-white border-emerald-700"
                : "bg-zinc-100 text-zinc-400 border-zinc-300"
            }`}
          >
            {isDefault ? (
              <Star className="w-4 h-4" />
            ) : (
              <GitFork className="w-4 h-4" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className={`text-sm font-bold font-title ${
                  isActive ? "text-zinc-900" : "text-zinc-500"
                }`}
              >
                {branch.name}
              </p>
              {isActive && (
                <Badge className="rounded-lg text-xs bg-emerald-600 text-white border-emerald-700">
                  <Check className="w-3 h-3 mr-0.5" />
                  {t("common.active") || "active"}
                </Badge>
              )}
              {isDefault && (
                <Badge className="rounded-lg text-xs bg-zinc-200 text-zinc-600 border-zinc-300">
                  <Star className="w-3 h-3 mr-0.5" />
                  default
                </Badge>
              )}
              {branch.parent_branch_id && (
                <span className="text-xs text-zinc-400 font-mono">
                  {t("proj.from") || "from"}{" "}
                  {branch.parent_branch_id?.substring(0, 8)}...
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {fmtDate(branch.created_at)}
              {branch.created_by && ` \u00b7 ${branch.created_by}`}
            </p>
            {branch.description && (
              <p className="text-xs text-zinc-500 mt-1 italic">
                {branch.description}
              </p>
            )}

            {/* resource count pills */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {(is.files_count || 0) > 0 && (
                <span className="text-xs font-mono text-zinc-700 bg-zinc-50 border border-zinc-200 px-1.5 py-0.5 rounded-lg flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  {is.files_count}
                </span>
              )}
              {(is.diagrams_count || 0) > 0 && (
                <span className="text-xs font-mono text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded-lg flex items-center gap-1">
                  <Workflow className="w-3 h-3" />
                  {is.diagrams_count}
                </span>
              )}
              {(is.specs_count || 0) > 0 && (
                <span className="text-xs font-mono text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded-lg flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  {is.specs_count}
                </span>
              )}
              {(is.code_count || 0) > 0 && (
                <span className="text-xs font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-lg flex items-center gap-1">
                  <Code2 className="w-3 h-3" />
                  {is.code_count}
                </span>
              )}
            </div>
          </div>

          {/* actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {!isActive && (
              <Button
                variant="outline"
                size="sm"
                disabled={switching}
                onClick={onSwitch}
                className="rounded-lg border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-xs h-8"
              >
                {switching ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <GitBranch className="w-3.5 h-3.5 mr-1" />
                )}
                {t("common.switch") || "Switch"}
              </Button>
            )}
            {isActive && (
              <Badge className="rounded-lg text-xs bg-emerald-50 text-emerald-700 border border-emerald-300 px-2 py-1">
                <Check className="w-3 h-3 mr-0.5" />
                {t("common.current") || "Current"}
              </Badge>
            )}
            {!isActive && branch.status !== "merged" && onMerge && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMerge(branch.id)}
                className="rounded-lg border border-electric-cyan text-blue-700 hover:bg-blue-50 font-bold text-xs h-8"
              >
                <GitMerge className="w-3.5 h-3.5 mr-1" />
                {t("proj.merge") || "Merge"}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-zinc-100"
              onClick={onImpact}
              title={t("proj.impact_analysis") || "Impact analysis"}
            >
              <Search className="w-4 h-4 text-zinc-500" />
            </Button>
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-red-50"
                onClick={onDelete}
                title={t("common.delete") || "Delete"}
              >
                <Trash2 className="w-4 h-4 text-zinc-400 hover:text-red-500" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
