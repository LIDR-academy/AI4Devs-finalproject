// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Trash2, X, Loader2, MousePointerClick } from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/ConfirmDialog";

const PRIORITY_STYLE = {
  must: "bg-red-50 text-red-700 border-red-200",
  should: "bg-amber-50 text-amber-700 border-amber-200",
  could: "bg-sky-50 text-sky-700 border-sky-200",
  wont: "bg-zinc-100 text-zinc-700 border-zinc-300",
};

/**
 * OrphanedLinksDialog — surfaces element-requirement links whose target
 * element_id is no longer present in the current BPMN diagram (e.g. the user
 * deleted a shape without using "Undo"). Allows individual or bulk cleanup.
 *
 * Props:
 *  - open, onOpenChange
 *  - orphans: array of link objects { id, element_id, requirement, ... }
 *  - apiBase, getAuthHeaders
 *  - onDeleted: (deletedIds) => void  // callback to refresh aggregates
 *  - onStartRemap: (link) => void     // close dialog and enter remap mode
 */
const OrphanedLinksDialog = ({
  open,
  onOpenChange,
  orphans = [],
  apiBase,
  getAuthHeaders,
  onDeleted,
  onStartRemap,
}) => {
  const [selected, setSelected] = useState(new Set());
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const toggleSel = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const selectAll = () => setSelected(new Set(orphans.map((o) => o.id)));
  const clearSel = () => setSelected(new Set());

  const deleteOne = async (id) => {
    setConfirmDelete({ type: "one", id });
    return;
  };

  const doDeleteOne = async (id) => {
    setDeleting(true);
    try {
      const r = await fetch(`${apiBase}/specs/element-links/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      toast.success("Link eliminado");
      onDeleted && onDeleted([id]);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (e) {
      toast.error(`Error al eliminar: ${e.message || e}`);
    } finally {
      setDeleting(false);
    }
  };

  const deleteSelected = async () => {
    if (selected.size === 0) return;
    setConfirmDelete({ type: "bulk" });
    return;
  };

  const doDeleteSelected = async () => {
    setDeleting(true);
    try {
      const ids = Array.from(selected);
      const r = await fetch(`${apiBase}/specs/element-links/bulk-delete`, {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      toast.success(`${data.deleted} links eliminados`);
      onDeleted && onDeleted(ids);
      setSelected(new Set());
    } catch (e) {
      toast.error(`Error al eliminar: ${e.message || e}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="orphaned-links-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Requirements huérfanos
            <span
              className="ml-2 text-xs font-mono bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5"
              data-testid="orphans-count"
            >
              {orphans.length}
            </span>
          </DialogTitle>
          <DialogDescription>
            Estos requirements están enlazados a elementos BPMN que ya no existen en el diagrama actual. Puedes re-enlazarlos manualmente seleccionando un nuevo elemento, o eliminarlos.
          </DialogDescription>
        </DialogHeader>

        {orphans.length === 0 ? (
          <div className="py-8 text-center text-sm text-zinc-500" data-testid="orphans-empty">
            No hay requirements huérfanos. ¡Todo está limpio!
          </div>
        ) : (
          <>
            {/* Bulk action bar */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-1">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selected.size === orphans.length ? clearSel : selectAll}
                  data-testid="orphans-select-all"
                  className="h-7 text-xs"
                >
                  {selected.size === orphans.length ? "Desmarcar todos" : "Marcar todos"}
                </Button>
                {selected.size > 0 && (
                  <span className="text-xs text-zinc-500">
                    {selected.size} seleccionado{selected.size === 1 ? "" : "s"}
                  </span>
                )}
              </div>
              <Button
                variant="destructive"
                size="sm"
                disabled={selected.size === 0 || deleting}
                onClick={deleteSelected}
                data-testid="orphans-bulk-delete"
                className="h-7 text-xs"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 mr-1" />}
                Eliminar seleccionados
              </Button>
            </div>

            <ScrollArea className="max-h-80 -mx-2 px-2">
              <ul className="divide-y divide-zinc-200">
                {orphans.map((o) => {
                  const req = o.requirement || {};
                  const moscow = (req.moscow || "should").toLowerCase();
                  const isSel = selected.has(o.id);
                  return (
                    <li
                      key={o.id}
                      className={`py-2.5 px-2 flex items-start gap-3 ${isSel ? "bg-blue-50" : "hover:bg-zinc-50"}`}
                      data-testid={`orphan-row-${o.id}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSel}
                        onChange={() => toggleSel(o.id)}
                        className="mt-1.5 cursor-pointer"
                        data-testid={`orphan-check-${o.id}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="font-mono text-xs font-bold text-zinc-900"
                            data-testid={`orphan-code-${o.id}`}
                          >
                            {req.code || "—"}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 border font-bold uppercase tracking-wide ${PRIORITY_STYLE[moscow] || PRIORITY_STYLE.could}`}
                          >
                            {moscow}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono truncate">
                            ↪ {o.element_id}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-700 mt-1 truncate" title={req.title}>
                          {req.title || "(Sin título)"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deleting}
                        onClick={() => onStartRemap && onStartRemap(o)}
                        data-testid={`orphan-remap-${o.id}`}
                        className="h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex-shrink-0"
                        title="Re-asignar a otro elemento del canvas"
                      >
                        <MousePointerClick className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deleting}
                        onClick={() => deleteOne(o.id)}
                        data-testid={`orphan-delete-${o.id}`}
                        className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                        title="Eliminar este link"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>

            <p className="text-[11px] text-zinc-500 mt-3 leading-snug border-t border-zinc-200 pt-3 space-y-1">
              <span className="block">
                <MousePointerClick className="w-3 h-3 inline mr-1 text-blue-600" />
                <strong>Re-asignar</strong>: pulsa el icono azul y haz click en un elemento del canvas para mantener el link.
              </span>
              <span className="block">
                <X className="w-3 h-3 inline mr-1 text-red-600" />
                <strong>Eliminar</strong>: borra el link. El requirement no se borra, sólo el enlace al elemento.
              </span>
            </p>
          </>
        )}
      </DialogContent>
    <ConfirmDialog
      open={!!confirmDelete}
      onOpenChange={(open) => { if (!open) setConfirmDelete(null); }}
      title={confirmDelete?.type === "one" ? "Eliminar link" : "Eliminar links"}
      description={confirmDelete?.type === "one"
        ? "¿Eliminar este link huérfano?"
        : `¿Eliminar ${selected.size} link${selected.size === 1 ? "" : "s"} huérfano${selected.size === 1 ? "" : "s"}?`}
      onConfirm={() => {
        if (confirmDelete?.type === "one") doDeleteOne(confirmDelete.id);
        else doDeleteSelected();
        setConfirmDelete(null);
      }}
    />
    </Dialog>
  );
};

export default OrphanedLinksDialog;
