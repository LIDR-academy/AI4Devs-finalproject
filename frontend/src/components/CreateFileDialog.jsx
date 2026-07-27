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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useI18n } from "@/contexts/I18nContext";

const TEMPLATES = [
  { label: "Descripción general", insert: "## Descripción\n\n" },
  { label: "Objetivo", insert: "## Objetivo\n\n" },
  { label: "Contexto", insert: "## Contexto\n\n" },
  { label: "Requisitos funcionales", insert: "## Requisitos Funcionales\n\n- \n- \n" },
  { label: "Requisitos no funcionales", insert: "## Requisitos No Funcionales\n\n- \n- \n" },
  { label: "Criterios de aceptación", insert: "## Criterios de Aceptación\n\n- [ ] \n- [ ] " },
  { label: "BDD (Given/When/Then)", insert: "**Given** \n**When** \n**Then** " },
  { label: "Tabla de ejemplos", insert: "| Escenario | Entrada | Esperado |\n| --- | --- | --- |\n| | | |" },
  { label: "Vacío", insert: "" },
];

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

export default function CreateFileDialog({ open, onClose, onCreate, files, parentId, parentPath }) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [templateIndex, setTemplateIndex] = useState(0);
  const [creating, setCreating] = useState(false);

  const dirs = files.filter((f) => f.type === "directory");

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const finalName = trimmed.endsWith(".md") ? trimmed : `${trimmed}.md`;
    const tpl = TEMPLATES[templateIndex];
    setCreating(true);
    try {
      await onCreate({
        parent_id: parentId || null,
        type: "file",
        name: finalName,
        content: tpl.insert,
        template: tpl.label !== "Vacío" ? tpl.label : null,
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
            Nuevo archivo
          </DialogTitle>
          <DialogDescription className="text-[11px] text-zinc-500">
            {parentPath
              ? `Se creará dentro de ${parentPath}`
              : parentId
                ? `Se creará dentro de ${getDirPath(files, parentId)}`
                : "Se creará en la raíz del proyecto"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-[11px] font-semibold text-zinc-600">Nombre</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej. Descripcion general"
              className="rounded-lg text-xs h-8 mt-1"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
            <p className="text-[9px] text-zinc-400 mt-0.5">Se añade .md automáticamente si no lo incluyes</p>
          </div>
          <div>
            <Label className="text-[11px] font-semibold text-zinc-600">Plantilla (apartado)</Label>
            <ScrollArea className="h-36 border border-zinc-200 mt-1">
              {TEMPLATES.map((tpl, i) => (
                <button
                  key={tpl.label}
                  type="button"
                  className={`block w-full text-left px-3 py-1.5 text-[11px] hover:bg-zinc-100 transition-colors ${
                    i === templateIndex ? "bg-deep-navy text-white hover:bg-zinc-800" : "text-zinc-700"
                  }`}
                  onClick={() => setTemplateIndex(i)}
                >
                  {tpl.label}
                </button>
              ))}
            </ScrollArea>
          </div>
          {dirs.length > 0 && (
            <div>
              <Label className="text-[11px] font-semibold text-zinc-600">Carpeta destino</Label>
              <p className="text-[10px] text-zinc-500">{parentPath || getDirPath(files, parentId) || "Raíz"}</p>
            </div>
          )}
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
