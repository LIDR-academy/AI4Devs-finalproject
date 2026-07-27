// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect } from "react";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, AlertTriangle, XCircle, Info, Shield } from "lucide-react";

export const ValidationDialog = ({ open, onOpenChange, diagramId, getAuthHeaders }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && diagramId) {
      runValidation();
    }
  }, [open, diagramId]);

  const runValidation = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API}/diagrams/${diagramId}/validate`, {
        method: "POST", headers: getAuthHeaders()
      });
      if (resp.ok) setResult(await resp.json());
    } catch (_) {}
    setLoading(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 50) return "text-amber-600";
    return "text-rose-600";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-violet-600" />
            Validacion BPMN 2.0
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full" />
          </div>
        ) : result ? (
          <div className="space-y-4">
            {/* Score */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
              <div>
                <p className="text-sm text-slate-500">Puntuacion</p>
                <p className={`text-3xl font-bold ${getScoreColor(result.score)}`}>{result.score}/100</p>
              </div>
              <Badge variant={result.valid ? "default" : "destructive"} className={result.valid ? "bg-emerald-600" : ""}>
                {result.valid ? "Valido" : "Con errores"}
              </Badge>
            </div>

            <ScrollArea className="max-h-[300px]">
              <div className="space-y-2">
                {result.errors.map((e, i) => (
                  <div key={`e-${i}`} className="flex items-start gap-2 p-2 bg-rose-50 border border-rose-200 rounded-lg" data-testid={`validation-error-${i}`}>
                    <XCircle className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-rose-800">{e.message}</p>
                      {e.element && <p className="text-xs text-rose-500 font-mono">{e.element}</p>}
                    </div>
                  </div>
                ))}
                {result.warnings.map((w, i) => (
                  <div key={`w-${i}`} className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg" data-testid={`validation-warning-${i}`}>
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-amber-800">{w.message}</p>
                      {w.element && <p className="text-xs text-amber-500 font-mono">{w.element}</p>}
                    </div>
                  </div>
                ))}
                {result.info.map((inf, i) => (
                  <div key={`i-${i}`} className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800">{inf.message}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {result.errors.length === 0 && result.warnings.length === 0 && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <p className="text-sm font-medium text-emerald-800">Diagrama valido sin problemas detectados</p>
              </div>
            )}
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
          <Button onClick={runValidation} disabled={loading} className="bg-violet-600 hover:bg-violet-700">
            Re-validar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
