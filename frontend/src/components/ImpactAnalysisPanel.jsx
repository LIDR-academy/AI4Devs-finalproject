// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect } from "react";
import { API } from "@/App";
import { useI18n } from "@/contexts/I18nContext";
import { Badge } from "@/components/ui/badge";
import {
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  FileText,
  Workflow,
  Brain,
  Code2,
  GitBranch,
  GitFork,
  Loader2,
  X,
} from "lucide-react";

function authHeaders() {
  const tk = localStorage.getItem("session_token");
  return tk ? { Authorization: `Bearer ${tk}` } : {};
}

/**
 * Displays impact/resource summary for a branch.
 *
 * Props:
 *   projectId — string
 *   versionId — string (reused prop name, contains branch ID)
 *   onClose   — () => void
 */
export default function ImpactAnalysisPanel({ projectId, versionId, onClose }) {
  const { t } = useI18n();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!versionId) return;
    setLoading(true);
    fetch(`${API}/projects/${projectId}/branches/${versionId}/impact`, {
      headers: authHeaders(),
    })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [projectId, versionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-zinc-500 text-sm">
        {t("common.no_data") || "No data available"}
      </div>
    );
  }

  const branch = data.branch || {};
  const summary = data.impact_summary || {};

  return (
    <div className="h-full flex flex-col">
      {/* header */}
      <SheetHeader className="px-5 py-4 border-b-2 border-zinc-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <SheetTitle className="font-title text-lg flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            {branch.name || branch.id?.substring(0, 8)}
          </SheetTitle>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-zinc-100 rounded-lg"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>
        <p className="text-xs text-zinc-500 font-mono">
          {t("proj.impact_analysis") || "Impact Analysis"}
        </p>
      </SheetHeader>

      {/* content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* summary grid */}
        <div className="grid grid-cols-2 gap-2">
          <SummaryPill label={t("proj.files") || "Files"} count={summary.files_count || 0} color="zinc" icon={FileText} />
          <SummaryPill label={t("proj.diagrams") || "Diagrams"} count={summary.diagrams_count || 0} color="purple" icon={Workflow} />
          <SummaryPill label={t("proj.specs") || "Specs"} count={summary.specs_count || 0} color="sky" icon={Brain} />
          <SummaryPill label={t("proj.code") || "Code"} count={summary.code_count || 0} color="emerald" icon={Code2} />
        </div>

        {/* branch info */}
        <div className="border border-zinc-200 rounded-lg p-3 space-y-1 text-sm">
          {branch.description && (
            <p className="text-zinc-600">{branch.description}</p>
          )}
          <p className="text-zinc-500 text-xs">
            <span className="font-bold">ID:</span>{" "}
            <span className="font-mono">{branch.id}</span>
          </p>
          {branch.parent_branch_id && (
            <p className="text-zinc-500 text-xs">
              <span className="font-bold">{t("proj.parent_branch") || "Parent"}:</span>{" "}
              <span className="font-mono">{branch.parent_branch_id.substring(0, 12)}...</span>
            </p>
          )}
          {branch.created_by && (
            <p className="text-zinc-500 text-xs">
              <span className="font-bold">{t("common.created_by") || "Created by"}:</span>{" "}
              {branch.created_by}
            </p>
          )}
          {branch.created_at && (
            <p className="text-zinc-500 text-xs">
              <span className="font-bold">{t("common.created") || "Created"}:</span>{" "}
              {new Date(branch.created_at).toLocaleString("es-ES")}
            </p>
          )}
        </div>

        {/* child branches */}
        {data.child_branches && data.child_branches.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-600 mb-2 flex items-center gap-1.5">
              <GitFork className="w-3.5 h-3.5" />
              {t("proj.child_branches") || "Child branches"}
            </h3>
            <div className="space-y-1">
              {data.child_branches.map((cb) => (
                <div key={cb.id} className="flex items-center gap-2 px-2 py-1.5 border border-zinc-200 rounded-lg text-sm">
                  <Badge className="rounded-lg text-xs font-mono bg-deep-navy text-white">
                    <GitFork className="w-3 h-3 mr-0.5" />
                    {cb.name}
                  </Badge>
                  <span className="text-zinc-500 text-xs">
                    {cb.impact_summary?.files_count || 0} files
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* file IDs list (collapsed view) */}
        {data.file_ids && data.file_ids.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wide text-zinc-600 mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              {t("proj.file_count") || "Files"}: {data.file_ids.length}
            </h3>
            <div className="max-h-40 overflow-y-auto border border-zinc-200 rounded-lg p-2 bg-zinc-50">
              {data.file_ids.slice(0, 50).map((fid) => (
                <p key={fid} className="text-xs font-mono text-zinc-500 truncate">
                  {fid}
                </p>
              ))}
              {data.file_ids.length > 50 && (
                <p className="text-xs text-zinc-400 mt-1">
                  ... +{data.file_ids.length - 50} more
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


function SummaryPill({ label, count, color, icon: Icon }) {
  const borders = {
    emerald: "border-emerald-200",
    purple: "border-purple-200",
    sky: "border-sky-200",
    zinc: "border-zinc-200",
  };

  return (
    <div className={`border rounded-lg px-2.5 py-2 ${borders[color] || "border-zinc-200"} bg-white`}>
      <div className="flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-zinc-400" />}
        <span className="text-2xl font-bold font-mono text-zinc-900">{count}</span>
      </div>
      <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
    </div>
  );
}
