// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect } from "react";
import { API } from "@/App";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight } from "lucide-react";

const CLASS_COLORS = [
  { bg: "#EDE9FE", border: "#C4B5FD", text: "#5B21B6", header: "#7C3AED" },
  { bg: "#DBEAFE", border: "#93C5FD", text: "#1E40AF", header: "#3B82F6" },
  { bg: "#D1FAE5", border: "#6EE7B7", text: "#065F46", header: "#10B981" },
  { bg: "#FEF3C7", border: "#FCD34D", text: "#92400E", header: "#F59E0B" },
  { bg: "#FCE7F3", border: "#F9A8D4", text: "#9D174D", header: "#EC4899" },
  { bg: "#E0E7FF", border: "#A5B4FC", text: "#3730A3", header: "#6366F1" },
];

export const UMLDialog = ({ open, onOpenChange, diagramId, getAuthHeaders }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && diagramId) fetchUML();
  }, [open, diagramId]);

  const fetchUML = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API}/diagrams/${diagramId}/generate-uml`, {
        method: "POST", headers: getAuthHeaders()
      });
      if (resp.ok) setData(await resp.json());
    } catch (_) {}
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <svg className="w-5 h-5 text-violet-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="8" height="6" rx="1" />
              <rect x="14" y="16" width="8" height="6" rx="1" />
              <line x1="6" y1="8" x2="6" y2="14" />
              <line x1="6" y1="14" x2="18" y2="14" />
              <line x1="18" y1="14" x2="18" y2="16" />
            </svg>
            Diagrama UML - {data?.diagram_name || ""}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full" />
          </div>
        ) : data ? (
          <ScrollArea className="max-h-[60vh]">
            {data.classes.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p className="text-lg font-medium mb-2">Sin clases OOP asignadas</p>
                <p className="text-sm">Asigna clases de entrada/salida a los elementos BPMN para generar el diagrama UML</p>
              </div>
            ) : (
              <div className="space-y-6 p-2">
                {/* Classes */}
                <div className="flex flex-wrap gap-4 justify-center">
                  {data.classes.map((cls, i) => {
                    const color = CLASS_COLORS[i % CLASS_COLORS.length];
                    return (
                      <div key={cls.name} className="w-64 rounded-lg border-2 shadow-sm overflow-hidden" style={{ borderColor: color.border }} data-testid={`uml-class-${cls.name}`}>
                        <div className="px-3 py-2 font-bold text-white text-sm" style={{ backgroundColor: color.header }}>
                          {cls.name}
                          <Badge variant="outline" className="ml-2 text-white border-white/40 text-[10px]">{cls.type}</Badge>
                        </div>
                        <div className="px-3 py-2" style={{ backgroundColor: color.bg }}>
                          {cls.properties.length > 0 ? (
                            cls.properties.map((prop) => (
                              <div key={prop.name} className="flex items-center justify-between py-0.5 border-b last:border-0" style={{ borderColor: color.border + "60" }}>
                                <span className="text-xs font-mono" style={{ color: color.text }}>
                                  {prop.required && <span className="text-rose-500">* </span>}
                                  {prop.name}
                                </span>
                                <span className="text-[10px] font-mono opacity-70" style={{ color: color.text }}>{prop.type}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs italic opacity-60" style={{ color: color.text }}>Sin propiedades definidas</p>
                          )}
                          {cls.description && (
                            <p className="text-[10px] mt-1 opacity-50 italic" style={{ color: color.text }}>{cls.description}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Relationships */}
                {data.relationships.length > 0 && (
                  <div className="space-y-2 pt-4 border-t">
                    <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Relaciones</p>
                    {data.relationships.map((rel, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded border" data-testid={`uml-rel-${i}`}>
                        <Badge variant="outline" className="text-xs">{rel.from}</Badge>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                        <Badge variant="outline" className="text-xs">{rel.to}</Badge>
                        <span className="text-xs text-slate-500 ml-auto">{rel.label}</span>
                        <Badge variant="secondary" className="text-[10px]">{rel.type}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
