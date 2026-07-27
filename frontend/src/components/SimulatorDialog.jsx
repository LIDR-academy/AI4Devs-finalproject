// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect, useRef } from "react";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, SkipForward, RotateCcw, CheckCircle } from "lucide-react";

const STEP_COLORS = {
  event: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-800", icon: "bg-blue-500" },
  task: { bg: "bg-violet-50", border: "border-violet-300", text: "text-violet-800", icon: "bg-violet-500" },
  gateway: { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-800", icon: "bg-amber-500" },
};

export const SimulatorDialog = ({ open, onOpenChange, diagramId, getAuthHeaders, modelerRef }) => {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (open && diagramId) fetchSimulation();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [open, diagramId]);

  useEffect(() => {
    if (playing && currentStep < steps.length - 1) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setPlaying(false);
            clearInterval(intervalRef.current);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [playing, steps.length]);

  // Highlight element on canvas when step changes
  useEffect(() => {
    if (!modelerRef?.current || currentStep < 0 || !steps[currentStep]) return;
    try {
      const canvas = modelerRef.current.get("canvas");
      const registry = modelerRef.current.get("elementRegistry");
      // Remove previous highlights
      registry.forEach(el => {
        try { canvas.removeMarker(el.id, "highlight"); } catch (_) {}
        try { canvas.removeMarker(el.id, "highlight-active"); } catch (_) {}
      });
      // Highlight visited steps
      for (let i = 0; i <= currentStep; i++) {
        const el = registry.get(steps[i].element_id);
        if (el) canvas.addMarker(el.id, i === currentStep ? "highlight-active" : "highlight");
      }
    } catch (_) {}
  }, [currentStep, steps, modelerRef]);

  const fetchSimulation = async () => {
    setLoading(true);
    setCurrentStep(-1);
    setPlaying(false);
    try {
      const resp = await fetch(`${API}/diagrams/${diagramId}/simulate`, {
        method: "POST", headers: getAuthHeaders()
      });
      if (resp.ok) {
        const data = await resp.json();
        setSteps(data.steps || []);
      }
    } catch (_) {}
    setLoading(false);
  };

  const reset = () => {
    setCurrentStep(-1);
    setPlaying(false);
    // Remove all markers
    if (modelerRef?.current) {
      try {
        const canvas = modelerRef.current.get("canvas");
        const registry = modelerRef.current.get("elementRegistry");
        registry.forEach(el => {
          try { canvas.removeMarker(el.id, "highlight"); } catch (_) {}
          try { canvas.removeMarker(el.id, "highlight-active"); } catch (_) {}
        });
      } catch (_) {}
    }
  };

  const handleClose = (val) => {
    reset();
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="w-5 h-5 text-emerald-600" />
            Simulador BPMN
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Controls */}
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border">
              <Button
                size="sm"
                variant={playing ? "destructive" : "default"}
                onClick={() => {
                  if (currentStep < 0) setCurrentStep(0);
                  setPlaying(!playing);
                }}
                className={!playing ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                data-testid="sim-play-btn"
              >
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))}
                disabled={currentStep >= steps.length - 1}
                data-testid="sim-next-btn"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={reset} data-testid="sim-reset-btn">
                <RotateCcw className="w-4 h-4" />
              </Button>
              <div className="flex-1 text-right">
                <Badge variant="outline">
                  Paso {Math.max(0, currentStep + 1)} / {steps.length}
                </Badge>
              </div>
            </div>

            {/* Steps list */}
            <ScrollArea className="max-h-[350px]">
              <div className="space-y-1.5 pr-2">
                {steps.map((step, i) => {
                  const colors = STEP_COLORS[step.step_type] || STEP_COLORS.task;
                  const isActive = i === currentStep;
                  const isVisited = i < currentStep;
                  const isFuture = i > currentStep;

                  return (
                    <div
                      key={step.step}
                      className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                        isActive
                          ? `${colors.bg} ${colors.border} ring-2 ring-offset-1 ring-violet-400`
                          : isVisited
                          ? "bg-emerald-50 border-emerald-200 opacity-80"
                          : "bg-white border-slate-200 opacity-50"
                      }`}
                      onClick={() => { setCurrentStep(i); setPlaying(false); }}
                      data-testid={`sim-step-${i}`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                        isVisited ? "bg-emerald-500" : isActive ? colors.icon : "bg-slate-300"
                      }`}>
                        {isVisited ? <CheckCircle className="w-3.5 h-3.5" /> : step.step}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isActive ? colors.text : isVisited ? "text-emerald-700" : "text-slate-500"}`}>
                          {step.element_name}
                        </p>
                        <p className="text-xs text-slate-500">{step.description}</p>
                        {step.next.length > 1 && isActive && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {step.next.map((n, j) => (
                              <Badge key={j} variant="outline" className="text-[10px]">
                                {n.condition || `→ ${n.element_id}`}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-[10px] flex-shrink-0">{step.step_type}</Badge>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {currentStep >= steps.length - 1 && currentStep >= 0 && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <p className="text-sm font-medium text-emerald-800">Simulacion completada</p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
