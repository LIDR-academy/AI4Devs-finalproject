// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState } from "react";
import { API } from "@/App";
import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { GitFork, Loader2, ChevronDown } from "lucide-react";

function authHeaders() {
  const tk = localStorage.getItem("session_token");
  return tk ? { Authorization: `Bearer ${tk}` } : {};
}

/**
 * Dialog for creating a new branch from a selected parent branch.
 *
 * Props:
 *   open       — controlled open state
 *   onClose    — () => void
 *   projectId  — string
 *   branches   — current branch list (for parent selector)
 *   onCreated  — () => void (called after successful creation)
 */
export default function BranchCreateDialog({ open, onClose, projectId, branches, onCreated }) {
  const { t } = useI18n();

  const [name, setName] = useState("");
  const [parentBranchId, setParentBranchId] = useState(null);
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const activeBranch = branches.find((b) => b.active);
  const defaultBranch = branches.find((b) => b.is_default);

  // Default parent: active branch, else default branch
  const effectiveParent = parentBranchId
    || activeBranch?.id
    || defaultBranch?.id
    || null;

  const parentBranch = branches.find((b) => b.id === effectiveParent);

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t("proj.branch_name_required") || "Branch name is required");
      return;
    }

    if (branches.some((b) => b.name === trimmed)) {
      setError(t("proj.branch_name_exists") || "A branch with this name already exists");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const body = {
        name: trimmed,
        parent_branch_id: effectiveParent,
        description: description.trim() || "",
      };

      const r = await fetch(`${API}/projects/${projectId}/branches`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${r.status}`);
      }

      setName("");
      setDescription("");
      setParentBranchId(null);
      onCreated();
    } catch (e) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    if (!creating) {
      setName("");
      setDescription("");
      setParentBranchId(null);
      setError("");
      onClose();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleClose}>
      <AlertDialogContent className="rounded-lg border-2 border-zinc-200 max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-title text-lg flex items-center gap-2">
            <GitFork className="w-5 h-5" />
            {t("proj.create_branch") || "Create Branch"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-zinc-600">
            {t("proj.create_branch_desc") || "Create a new branch from an existing branch. Files, diagrams, and specs from the parent branch will be copied to the new branch."}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-2 space-y-3">
          {/* Branch name */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-zinc-600 block mb-1">
              {t("proj.branch_name") || "Branch name"}
            </label>
            <Input
              placeholder={t("proj.branch_name_placeholder") || "e.g. feature/login, fix/bug-123"}
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              className="rounded-lg border border-zinc-200 font-mono text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              disabled={creating}
              autoFocus
            />
          </div>

          {/* Parent branch selector */}
          {branches.length > 0 && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-zinc-600 block mb-1">
                {t("proj.parent_branch") || "Parent branch"}
              </label>
              <div className="relative">
                <select
                  value={effectiveParent || ""}
                  onChange={(e) => setParentBranchId(e.target.value || null)}
                  className="w-full rounded-lg border border-zinc-200 text-sm font-mono px-3 py-2 appearance-none bg-white cursor-pointer"
                  disabled={creating}
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} {b.is_default ? "(default)" : ""} {b.active ? "[active]" : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
              </div>
              {parentBranch && (
                <p className="text-xs text-zinc-400 mt-1">
                  {t("proj.will_copy_from") || "Will copy"}: {parentBranch.impact_summary?.files_count || 0} files, {parentBranch.impact_summary?.diagrams_count || 0} diagrams, {parentBranch.impact_summary?.specs_count || 0} specs
                </p>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-zinc-600 block mb-1">
              {t("proj.description") || "Description"} <span className="font-normal">(optional)</span>
            </label>
            <Input
              placeholder={t("proj.branch_description_placeholder") || "What's this branch for?"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-lg border border-zinc-200 text-sm"
              disabled={creating}
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 font-bold">{error}</p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={creating}
            className="rounded-lg border border-zinc-200 font-bold text-xs uppercase"
          >
            {t("common.cancel") || "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCreate}
            disabled={creating || !name.trim()}
            className="rounded-lg bg-deep-navy text-white hover:bg-zinc-800 font-bold text-xs uppercase disabled:opacity-50"
          >
            {creating ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : (
              <GitFork className="w-4 h-4 mr-1" />
            )}
            {creating
              ? (t("common.creating") || "Creating...")
              : (t("common.create") || "Create")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
