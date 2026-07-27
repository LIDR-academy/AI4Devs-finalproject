// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { API } from "@/App";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  ChevronDown, ChevronRight, FileText, ExternalLink, AlertCircle,
  Link2, Trash2, Target, Plus,
} from "lucide-react";
import { toast } from "sonner";

const authHeaders = () => {
  const t = localStorage.getItem("session_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const MOSCOW_COLORS = {
  must:   "bg-red-600 text-white",
  should: "bg-amber-500 text-white",
  could:  "bg-sky-500 text-white",
  wont:   "bg-zinc-500 text-white",
};
const MOSCOW_LABELS = { must: "MUST", should: "SHOULD", could: "COULD", wont: "WON'T" };

/**
 * Widget in the BPMN editor that shows linked requirements (at diagram level)
 * AND element-level links with linking/unlinking actions.
 *
 * Props:
 *   - diagramId: string (required)
 *   - selectedElement: { id, type, businessObject? } | null  -- currently selected element in canvas
 *   - onLinksChange: (elementAggregates) => void   -- called whenever element-level links change
 *                      elementAggregates is {element_id: {highest_moscow, count, requirement_codes[]}}
 *   - collapsed: initial collapsed state
 */
const LinkedRequirementsWidget = ({
  diagramId,
  selectedElement = null,
  onLinksChange,
  collapsed = false,
}) => {
  const [data, setData] = useState(null);
  const [elementData, setElementData] = useState({ links: [], elements: {} });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(!collapsed);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);

  const loadAll = useCallback(async () => {
    if (!diagramId) return;
    setLoading(true);
    try {
      const [byDiagramRes, elementsRes] = await Promise.all([
        fetch(`${API}/specs/requirements/by-diagram/${diagramId}`, {
          headers: authHeaders(), credentials: "include",
        }),
        fetch(`${API}/specs/element-links?diagram_id=${diagramId}`, {
          headers: authHeaders(), credentials: "include",
        }),
      ]);
      if (byDiagramRes.ok) setData(await byDiagramRes.json());
      if (elementsRes.ok) {
        const e = await elementsRes.json();
        setElementData(e);
        onLinksChange?.(e.elements || {});
      }
    } finally {
      setLoading(false);
    }
  }, [diagramId, onLinksChange]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // All requirements in the current diagram (diagram-level) — to pick from when linking
  const availableRequirements = useMemo(() => {
    const out = [];
    (data?.specs || []).forEach((group) => {
      group.requirements.forEach((r) => {
        out.push({ ...r, _specName: group.spec.name });
      });
    });
    return out;
  }, [data]);

  const linksForSelected = useMemo(() => {
    if (!selectedElement) return [];
    return (elementData.links || []).filter((l) => l.element_id === selectedElement.id);
  }, [elementData, selectedElement]);

  const linkToRequirement = async (requirementId) => {
    if (!selectedElement) return;
    const res = await fetch(`${API}/specs/element-links`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      credentials: "include",
      body: JSON.stringify({
        diagram_id: diagramId,
        element_id: selectedElement.id,
        requirement_id: requirementId,
      }),
    });
    if (res.ok) {
      toast.success("Elemento enlazado");
      setLinkDialogOpen(false);
      await loadAll();
    } else {
      const err = await res.json().catch(() => ({}));
      toast.error(err.detail || "No se pudo enlazar");
    }
  };

  const unlinkElement = async (linkId) => {
    const res = await fetch(`${API}/specs/element-links/${linkId}`, {
      method: "DELETE", headers: authHeaders(), credentials: "include",
    });
    if (res.ok) { toast.success("Enlace eliminado"); await loadAll(); }
    else toast.error("No se pudo desenlazar");
  };

  if (loading) {
    return (
      <div className="border border-zinc-200 bg-white p-3 text-xs font-mono text-zinc-400" data-testid="linked-reqs-loading">
        Cargando requirements…
      </div>
    );
  }

  const total = data?.total || 0;

  return (
    <div className="space-y-3" data-testid="linked-reqs-widget">
      {/* ----- Selected element section ----- */}
      {selectedElement && (
        <div className="border border-zinc-200 bg-white" data-testid="selected-element-panel">
          <div className="px-3 py-2 bg-deep-navy text-white flex items-center gap-2">
            <Target className="w-3.5 h-3.5" />
            <span className="text-xs font-bold uppercase tracking-wide">Elemento</span>
            <span className="text-[10px] font-mono opacity-80 truncate">
              {selectedElement.businessObject?.name || selectedElement.id}
            </span>
          </div>
          <div className="p-3 space-y-2">
            {linksForSelected.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">Sin requirements enlazados a este elemento.</p>
            ) : (
              linksForSelected.map((lnk) => (
                <div key={lnk.id} className="flex items-center gap-2 border border-zinc-200 p-1.5" data-testid={`selected-link-${lnk.id}`}>
                  <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold ${MOSCOW_COLORS[lnk.requirement?.moscow] || MOSCOW_COLORS.should}`}>
                    {MOSCOW_LABELS[lnk.requirement?.moscow]}
                  </span>
                  <Link
                    to={`/specs/${lnk.requirement?.spec_id}`}
                    target="_blank"
                    className="flex-1 min-w-0 text-xs text-zinc-900 hover:text-blue-700 truncate"
                  >
                    <span className="font-mono text-[10px] text-zinc-500 mr-1">{lnk.requirement?.code}</span>
                    {lnk.requirement?.title}
                  </Link>
                  <button
                    type="button"
                    onClick={() => unlinkElement(lnk.id)}
                    className="text-red-600 hover:text-red-800 p-0.5"
                    title="Desenlazar"
                    data-testid={`unlink-btn-${lnk.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
            <Button
              size="sm"
              onClick={() => setLinkDialogOpen(true)}
              disabled={availableRequirements.length === 0}
              className="w-full rounded-lg bg-deep-navy hover:bg-deep-navy/90 h-7 text-xs"
              data-testid="link-element-btn"
            >
              <Link2 className="w-3 h-3 mr-1" /> Enlazar a requirement
            </Button>
            {availableRequirements.length === 0 && (
              <p className="text-[10px] text-zinc-400 italic">
                Este diagrama aún no está enlazado a ningún requirement desde una spec.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ----- Diagram-level list ----- */}
      <div className="border border-zinc-200 bg-white">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-50 text-left"
          data-testid="linked-reqs-toggle"
        >
          <div className="flex items-center gap-2">
            {open ? <ChevronDown className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />}
            <FileText className="w-3.5 h-3.5 text-violet-700" />
            <span className="text-xs font-bold text-zinc-900">Requirements</span>
            <Badge variant="outline" className="rounded-lg font-mono text-[10px] h-5">{total}</Badge>
          </div>
        </button>

        {open && (
          <div className="border-t border-zinc-200 max-h-64 overflow-y-auto" data-testid="linked-reqs-body">
            {total === 0 ? (
              <div className="px-3 py-4 text-xs text-zinc-500 italic flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 mt-0.5" />
                <span>
                  Este diagrama no está enlazado a ningún requirement.<br />
                  <Link to="/specs" className="text-blue-700 hover:underline">Ir a Especificaciones</Link>
                </span>
              </div>
            ) : (
              data.specs.map((group) => (
                <div key={group.spec.id} className="border-b border-zinc-200 last:border-b-0">
                  <div className="px-3 py-1.5 bg-zinc-50 flex items-center justify-between">
                    <Link
                      to={`/specs/${group.spec.id}`}
                      target="_blank"
                      className="text-[11px] font-bold text-zinc-700 hover:text-blue-700 truncate flex items-center gap-1"
                    >
                      {group.spec.name}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                    <span className="text-[10px] font-mono text-zinc-500">v{group.spec.version}</span>
                  </div>
                  {group.requirements.map((r) => (
                    <Link
                      key={r.id}
                      to={`/specs/${group.spec.id}`}
                      target="_blank"
                      className="block px-3 py-2 hover:bg-violet-50 border-t border-zinc-100 first:border-t-0"
                      data-testid={`linked-req-${r.id}`}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold ${MOSCOW_COLORS[r.moscow] || MOSCOW_COLORS.should}`}>
                          {MOSCOW_LABELS[r.moscow]}
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">{r.code}</span>
                      </div>
                      <div className="text-xs text-zinc-900 font-medium leading-snug">{r.title}</div>
                    </Link>
                  ))}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Link dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-lg border border-zinc-200 max-h-[80vh] overflow-y-auto" data-testid="link-element-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Link2 className="w-4 h-4" /> Enlazar elemento a requirement
            </DialogTitle>
            <DialogDescription>
              Elemento: <span className="font-mono text-zinc-900">{selectedElement?.businessObject?.name || selectedElement?.id}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1 max-h-96 overflow-y-auto" data-testid="link-element-options">
            {availableRequirements.map((r) => {
              const already = linksForSelected.some((l) => l.requirement_id === r.id);
              return (
                <button
                  key={r.id}
                  type="button"
                  disabled={already}
                  onClick={() => linkToRequirement(r.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 border border-zinc-200 text-left transition-colors ${already ? "opacity-50 cursor-not-allowed bg-zinc-50" : "hover:bg-zinc-50 hover:border-zinc-400"}`}
                  data-testid={`link-option-${r.id}`}
                >
                  <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold ${MOSCOW_COLORS[r.moscow] || MOSCOW_COLORS.should}`}>
                    {MOSCOW_LABELS[r.moscow]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-zinc-900 flex items-center gap-1">
                      <span className="font-mono text-[10px] text-zinc-500">{r.code}</span>
                      {r.title}
                    </div>
                    <div className="text-[10px] text-zinc-500 truncate">{r._specName}</div>
                  </div>
                  {already ? <span className="text-[10px] text-emerald-600 font-mono">ENLAZADO</span> : <Plus className="w-3 h-3 text-zinc-400" />}
                </button>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)} className="rounded-lg">Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LinkedRequirementsWidget;
