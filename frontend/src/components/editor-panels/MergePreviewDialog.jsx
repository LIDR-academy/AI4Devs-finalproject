// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GitMerge } from "lucide-react";

const ChangesGroup = ({ items, label, color, prefix }) => {
  if (!items || items.length === 0) return null;
  const palette = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
    rose: "bg-rose-50 border-rose-200 text-rose-700",
  };
  const itemColor = {
    emerald: "text-emerald-600",
    blue: "text-blue-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
  };
  return (
    <div className={`p-2 rounded border ${palette[color]}`}>
      <p className={`text-xs font-semibold mb-1`}>{label}</p>
      {items.map((e) => (
        <p key={e.id} className={`text-xs ${itemColor[color]}`}>
          {prefix} {e.name || e.id}{e.tag ? ` (${e.tag})` : ""}
        </p>
      ))}
    </div>
  );
};

export const MergePreviewDialog = ({
  open,
  onOpenChange,
  mergePreview,
  mergeResolutions,
  setMergeResolutions,
  onConfirmMerge,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-emerald-600" />
            Merge: {mergePreview?.branchName} → main
          </DialogTitle>
        </DialogHeader>
        {mergePreview && (
          <div className="space-y-4">
            <div className={`p-3 rounded-lg border ${mergePreview.has_conflicts ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"}`}>
              <p className={`text-sm font-medium ${mergePreview.has_conflicts ? "text-amber-800" : "text-emerald-800"}`}>
                {mergePreview.has_conflicts
                  ? `${mergePreview.conflicts.length} conflicto(s) detectado(s) - Requiere resolucion manual`
                  : "Sin conflictos - Merge automatico disponible"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ChangesGroup items={mergePreview.summary.added_branch} label="Anadidos (rama)" color="emerald" prefix="+" />
              <ChangesGroup items={mergePreview.summary.added_main} label="Anadidos (main)" color="blue" prefix="+" />
              <ChangesGroup items={mergePreview.summary.modified_branch} label="Modificados (rama)" color="amber" prefix="~" />
              <ChangesGroup items={mergePreview.summary.modified_main} label="Modificados (main)" color="blue" prefix="~" />
              <ChangesGroup items={mergePreview.summary.removed_branch} label="Eliminados (rama)" color="rose" prefix="-" />
              <ChangesGroup items={mergePreview.summary.removed_main} label="Eliminados (main)" color="rose" prefix="-" />
            </div>

            {mergePreview.conflicts.length > 0 && (
              <div className="space-y-2">
                <Label className="text-amber-700">Conflictos - Elige que version mantener</Label>
                {mergePreview.conflicts.map((conflict) => (
                  <div key={conflict.id} className="p-3 border border-amber-300 bg-amber-50 rounded-lg">
                    <p className="text-sm font-medium mb-2">{conflict.name || conflict.id} ({conflict.tag})</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={mergeResolutions[conflict.id] === "main" ? "default" : "outline"}
                        onClick={() => setMergeResolutions((prev) => ({ ...prev, [conflict.id]: "main" }))}
                        className={mergeResolutions[conflict.id] === "main" ? "bg-blue-600" : ""}
                      >
                        Usar Main
                      </Button>
                      <Button
                        size="sm"
                        variant={mergeResolutions[conflict.id] === "branch" ? "default" : "outline"}
                        onClick={() => setMergeResolutions((prev) => ({ ...prev, [conflict.id]: "branch" }))}
                        className={mergeResolutions[conflict.id] === "branch" ? "bg-emerald-600" : ""}
                      >
                        Usar Rama
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button
                onClick={onConfirmMerge}
                disabled={mergePreview.has_conflicts && Object.keys(mergeResolutions).length < mergePreview.conflicts.length}
                className="bg-emerald-600 hover:bg-emerald-700"
                data-testid="confirm-merge-btn"
              >
                <GitMerge className="w-4 h-4 mr-2" />
                {mergePreview.has_conflicts ? "Merge con resolucion" : "Auto-Merge"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
