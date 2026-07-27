// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GitBranch, GitMerge, Plus } from "lucide-react";

export const BranchManagementDialog = ({
  open,
  onOpenChange,
  isAuthenticated,
  branches,
  newBranchName,
  setNewBranchName,
  onCreateBranch,
  onPreviewMerge,
  t,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-blue-600" />
            {t("editor.branch_mgmt")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isAuthenticated && (
            <div className="flex gap-2">
              <Input
                value={newBranchName}
                onChange={(e) => setNewBranchName(e.target.value)}
                placeholder={t("editor.new_branch_name")}
                data-testid="new-branch-name"
              />
              <Button onClick={onCreateBranch} data-testid="create-branch-btn">
                <Plus className="w-4 h-4 mr-2" />
                {t("editor.create")}
              </Button>
            </div>
          )}
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            <Label>{t("editor.existing_branches")}</Label>
            {branches.length === 0 ? (
              <p className="text-sm text-zinc-500">{t("editor.no_branches")}</p>
            ) : (
              branches.map((branch) => (
                <div key={branch.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-zinc-50 transition-colors">
                  <div className="flex items-center gap-2 flex-1">
                    <GitBranch className="w-4 h-4 text-zinc-500" />
                    <div>
                      <span className="font-medium text-sm">{branch.name}</span>
                      {branch.description && <p className="text-xs text-zinc-500">{branch.description}</p>}
                    </div>
                    {branch.is_merged && <Badge variant="secondary" className="ml-2">merged</Badge>}
                    {branch.status === "active" && <Badge className="ml-2 bg-emerald-100 text-emerald-700">{t("editor.active")}</Badge>}
                  </div>
                  {isAuthenticated && !branch.is_merged && branch.status === "active" && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPreviewMerge(branch)}
                        data-testid={`merge-preview-${branch.id}`}
                      >
                        <GitMerge className="w-3.5 h-3.5 mr-1" />
                        Merge
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
