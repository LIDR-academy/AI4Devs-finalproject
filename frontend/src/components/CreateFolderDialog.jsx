// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/I18nContext";

function getDirPath(files, dirId) {
  if (!dirId) return "Raíz";
  const parts = [];
  let current = dirId;
  while (current) {
    const dir = files.find((f) => f.id === current);
    if (!dir) break;
    parts.unshift(dir.name);
    current = dir.parent_id || null;
  }
  return parts.join(" / ") || "Raíz";
}

export default function CreateFolderDialog({ open, onClose, onCreate, files, parentId }) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCreating(true);
    try {
      await onCreate({
        parent_id: parentId || null,
        type: "directory",
        name: trimmed,
      });
      onClose();
      setName("");
    } catch {
      // handled by parent
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="rounded-lg border border-zinc-200 shadow-lg max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm font-bold" style={{ fontFamily: "'Chivo', sans-serif" }}>
            Nueva carpeta
          </DialogTitle>
          <DialogDescription className="text-[11px] text-zinc-500">
            {parentId
              ? `Se creará dentro de ${getDirPath(files, parentId)}`
              : "Se creará en la raíz del proyecto"}
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label className="text-[11px] font-semibold text-zinc-600">Nombre de la carpeta</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ej. Documentación"
            className="rounded-lg text-xs h-8 mt-1"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-lg text-[10px] h-7"
          >
            {t("common.cancel")}
          </Button>
          <Button
            size="sm"
            onClick={handleCreate}
            disabled={!name.trim() || creating}
            className="rounded-lg text-[10px] h-7 bg-deep-navy hover:bg-deep-navy/90"
          >
            {creating ? t("common.creating") : t("common.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
