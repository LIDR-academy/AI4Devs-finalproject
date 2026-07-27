// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, API } from "@/App";
import { getAuthHeaders } from "@/lib/api";
import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  GraduationCap,
  Briefcase,
  Users,
  FolderKanban,
  Plus,
  Workflow,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Palette,
} from "lucide-react";

const COLOR_OPTIONS = [
  "#7C3AED", "#2563EB", "#059669", "#D97706",
  "#DC2626", "#DB2777", "#4F46E5", "#0891B2",
];

const ICON_OPTIONS = ["folder", "briefcase", "building", "rocket", "zap", "target", "globe", "layers"];

const ICON_COMPONENTS = {
  folder: FolderKanban,
  briefcase: Briefcase,
  building: Briefcase,
  rocket: Sparkles,
  zap: Sparkles,
  target: Sparkles,
  globe: Sparkles,
  layers: Sparkles,
};

const PROFILES = [
  { id: "student", icon: GraduationCap, label: "Estudiante", desc: "Evaluando la plataforma" },
  { id: "developer", icon: Briefcase, label: "Desarrollador", desc: "Arquitecto / Dev individual" },
  { id: "manager", icon: Users, label: "Manager", desc: "Lider de equipo / PM" },
];

export default function OnboardingWizard({ open, onClose, onComplete }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  const [step, setStep] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [projectName, setProjectName] = useState("Mi primer proyecto");
  const [projectDesc, setProjectDesc] = useState("");
  const [projectColor, setProjectColor] = useState(COLOR_OPTIONS[0]);
  const [projectIcon, setProjectIcon] = useState("folder");
  const [loading, setLoading] = useState(false);
  const [createdProjectId, setCreatedProjectId] = useState(null);

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast.error("El nombre del proyecto es obligatorio");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/projects`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: projectName.trim(),
          description: projectDesc.trim(),
          color: projectColor,
          icon: projectIcon,
          tags: [],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCreatedProjectId(data.id);
        toast.success("Proyecto creado");
        setStep(3);
      } else {
        toast.error("Error creando el proyecto");
      }
    } catch {
      toast.error("Error de red");
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = (action) => {
    localStorage.setItem(`onboarding_done_${user?.email}`, "true");
    if (action === "blank") {
      navigate("/editor");
    } else if (action === "template") {
      navigate("/projects");
    } else if (action === "ai") {
      navigate("/editor?ai=1");
    }
    onComplete?.(createdProjectId);
  };

  const handleSkip = () => {
    localStorage.setItem(`onboarding_done_${user?.email}`, "true");
    onClose?.();
  };

  const stepIndicator = (num, label) => {
    const active = step === num;
    const done = step > num;
    return (
      <div className="flex items-center gap-2">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
            done
              ? "bg-electric-cyan text-deep-navy"
              : active
                ? "bg-deep-navy text-white"
                : "bg-zinc-200 text-zinc-500"
          }`}
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {done ? <Check className="w-4 h-4" /> : num}
        </div>
        <span
          className={`text-[11px] font-medium hidden sm:block ${
            active ? "text-zinc-900" : "text-zinc-400"
          }`}
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {label}
        </span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleSkip()}>
      <DialogContent className="glass-card rounded-2xl border border-zinc-200 max-w-lg p-0 overflow-hidden">
        {/* Stepper */}
        <div className="flex items-center justify-center gap-4 pt-6 pb-2 px-6">
          {stepIndicator(1, "Bienvenido")}
          <div className="w-8 h-px bg-zinc-200" />
          {stepIndicator(2, "Proyecto")}
          <div className="w-8 h-px bg-zinc-200" />
          {stepIndicator(3, "Modelar")}
        </div>

        <div className="px-6 pb-6">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="space-y-6 pt-4">
              <DialogHeader>
                <DialogTitle
                  className="text-2xl font-black text-deep-navy tracking-tight"
                  style={{ fontFamily: "'Chivo', sans-serif" }}
                >
                  Hola, {user?.name?.split(" ")[0] || "explorador"}
                </DialogTitle>
                <DialogDescription className="text-sm text-zinc-500">
                  Te ayudamos a crear tu primer proyecto en menos de un minuto.
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-3 gap-3">
                {PROFILES.map((p) => {
                  const Icon = p.icon;
                  const isSelected = selectedProfile === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProfile(p.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                        isSelected
                          ? "border-electric-cyan bg-electric-cyan/10 shadow-md"
                          : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                      }`}
                    >
                      <Icon
                        className={`w-6 h-6 ${isSelected ? "text-electric-cyan" : "text-zinc-400"}`}
                      />
                      <span className="text-xs font-bold text-zinc-900">{p.label}</span>
                      <span className="text-[10px] text-zinc-500">{p.desc}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-zinc-400 text-xs hover:text-zinc-600"
                >
                  Saltar
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!selectedProfile}
                  className="bg-deep-navy hover:bg-deep-navy/90 rounded-xl px-6"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Create Project */}
          {step === 2 && (
            <div className="space-y-5 pt-4">
              <DialogHeader>
                <DialogTitle
                  className="text-2xl font-black text-deep-navy tracking-tight"
                  style={{ fontFamily: "'Chivo', sans-serif" }}
                >
                  Crea tu primer proyecto
                </DialogTitle>
                <DialogDescription className="text-sm text-zinc-500">
                  Dale un nombre a tu proyecto. Puedes cambiarlo despues.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-bold text-zinc-700" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    Nombre del proyecto
                  </Label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="mt-1 rounded-lg"
                    placeholder="Mi primer proyecto"
                    autoFocus
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold text-zinc-700" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    Descripcion (opcional)
                  </Label>
                  <Textarea
                    value={projectDesc}
                    onChange={(e) => setProjectDesc(e.target.value)}
                    className="mt-1 rounded-lg resize-none h-16"
                    placeholder="Describe brevemente tu proyecto..."
                  />
                </div>

                <div>
                  <Label className="text-xs font-bold text-zinc-700 mb-2 block" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    <Palette className="w-3 h-3 inline mr-1" />
                    Color
                  </Label>
                  <div className="flex gap-2">
                    {COLOR_OPTIONS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setProjectColor(c)}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${
                          projectColor === c ? "border-zinc-900 scale-110" : "border-transparent"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="text-zinc-500 text-xs"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Atras
                </Button>
                <Button
                  onClick={handleCreateProject}
                  disabled={loading || !projectName.trim()}
                  className="bg-deep-navy hover:bg-deep-navy/90 rounded-xl px-6"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Crear proyecto
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Start modeling */}
          {step === 3 && (
            <div className="space-y-5 pt-4">
              <DialogHeader>
                <DialogTitle
                  className="text-2xl font-black text-deep-navy tracking-tight"
                  style={{ fontFamily: "'Chivo', sans-serif" }}
                >
                  Listo para modelar
                </DialogTitle>
                <DialogDescription className="text-sm text-zinc-500">
                  Tu proyecto esta creado. Elige como empezar:
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => handleFinish("blank")}
                  className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 hover:border-electric-cyan hover:bg-electric-cyan/5 transition-all duration-200 text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center group-hover:bg-electric-cyan/10 transition-colors">
                    <Workflow className="w-5 h-5 text-zinc-500 group-hover:text-electric-cyan" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Diagrama en blanco</p>
                    <p className="text-xs text-zinc-500">Empieza desde cero con el editor BPMN</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-300 ml-auto" />
                </button>

                <button
                  onClick={() => handleFinish("template")}
                  className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 hover:border-electric-cyan hover:bg-electric-cyan/5 transition-all duration-200 text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center group-hover:bg-electric-cyan/10 transition-colors">
                    <FolderKanban className="w-5 h-5 text-zinc-500 group-hover:text-electric-cyan" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Usar plantilla</p>
                    <p className="text-xs text-zinc-500">Empieza con un proyecto pre-configurado</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-300 ml-auto" />
                </button>

                <button
                  onClick={() => handleFinish("ai")}
                  className="flex items-center gap-4 p-4 rounded-xl border border-zinc-200 hover:border-electric-cyan hover:bg-electric-cyan/5 transition-all duration-200 text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center group-hover:bg-electric-cyan/10 transition-colors">
                    <Sparkles className="w-5 h-5 text-zinc-500 group-hover:text-electric-cyan" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Generar con IA</p>
                    <p className="text-xs text-zinc-500">Describe tu proceso y la IA crea el diagrama</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-300 ml-auto" />
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
