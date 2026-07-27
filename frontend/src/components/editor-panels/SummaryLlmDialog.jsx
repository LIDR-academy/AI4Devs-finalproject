// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect } from "react";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Check, Copy, Download, Loader2, Lightbulb } from "lucide-react";
import { suggestDeepseekVariant, NUDGE_COPY } from "@/lib/deepseekHeuristic";

// Tips rotated while waiting on the LLM — softens perceived latency.
const PHASE_TIPS = [
  "Construyendo contexto del diagrama BPMN...",
  "Analizando elementos y conexiones...",
  "DeepSeek razonando sobre el flujo...",
  "Generando descripcion en espanol...",
  "Casi listo — finalizando formato Markdown...",
];

const InlineProgress = ({ active, label, expectedMin = 25, expectedMax = 40 }) => {
  const [elapsed, setElapsed] = React.useState(0);
  React.useEffect(() => {
    if (!active) { setElapsed(0); return; }
    const start = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(id);
  }, [active]);
  if (!active) return null;
  const tipIdx = Math.min(PHASE_TIPS.length - 1, Math.floor(elapsed / Math.max(1, Math.round(expectedMin / PHASE_TIPS.length))));
  const overrun = elapsed > expectedMax;
  return (
    <div
      className={`mt-3 px-3 py-3 border-2 ${overrun ? "border-amber-400 bg-amber-50" : "border-blue-300 bg-blue-50/70"}`}
      data-testid="inline-progress"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 mb-2">
        <Loader2 className={`w-4 h-4 animate-spin ${overrun ? "text-amber-700" : "text-blue-700"}`} strokeWidth={2.5} />
        <span
          className={`text-[10px] font-bold tracking-[0.15em] uppercase ${overrun ? "text-amber-900" : "text-blue-900"}`}
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {label} · {elapsed}s {overrun ? `(esperado ${expectedMin}-${expectedMax}s)` : `/ ~${expectedMax}s`}
        </span>
      </div>
      <p
        className={`text-[11px] mb-2 ${overrun ? "text-amber-800" : "text-blue-800"}`}
        style={{ fontFamily: "'Work Sans', sans-serif" }}
      >
        {overrun
          ? "Tarda mas de lo habitual. La peticion sigue activa — DeepSeek esta pensando, dale unos segundos mas."
          : PHASE_TIPS[tipIdx]}
      </p>
      {/* Indeterminate progress bar */}
      <div className="h-1 bg-white border border-zinc-200 overflow-hidden">
        <div
          className={`h-full ${overrun ? "bg-amber-500" : "bg-blue-600"}`}
          style={{
            width: "30%",
            animation: "inlineProgressSlide 1.6s ease-in-out infinite",
          }}
        />
      </div>
      <style>{`@keyframes inlineProgressSlide {
        0%   { transform: translateX(-100%); }
        100% { transform: translateX(450%); }
      }`}</style>
    </div>
  );
};

const PROVIDER_LABELS = {
  deepseek: "DeepSeek V4-Pro",
  "deepseek-flash": "DeepSeek V4-Flash",
  minimax: "MiniMax M3",
  mimo: "MiMo-V2-Pro",
  opencode: "OpenCode Zen",
  "opencode-go": "OpenCode Go",
};

const STEPS = [
  { key: "config", label: "Opciones" },
  { key: "prompt", label: "Prompt" },
  { key: "result", label: "Resultado" },
];

export const SummaryLlmDialog = ({
  open,
  onOpenChange,
  diagram,
  step,
  setStep,
  includeXml,
  setIncludeXml,
  includeOop,
  setIncludeOop,
  context,
  setContext,
  summary,
  setSummary,
  copiedSummary,
  copySummary,
  downloadSummary,
  generating,
  onGenerateSummary,
  llmProvider,
  setLlmProvider,
  opencodeModel = "",
  setOpencodeModel,
  llmOutputType,
  setLlmOutputType,
  llmLanguage,
  setLlmLanguage,
  processing,
  onProcessWithLlm,
  result,
  setResult,
  copiedResult,
  copyResult,
  downloadResult,
}) => {
  const stepIdx = ["config", "prompt", "result"].indexOf(step);
  const providerLabel = PROVIDER_LABELS[llmProvider] || llmProvider;
  const isOpencodeProvider = llmProvider === "opencode" || llmProvider === "opencode-go";

  // Fetch OpenCode models when provider changes
  const [opencodeModels, setOpencodeModels] = useState([]);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    if (!isOpencodeProvider) { setOpencodeModels([]); return; }
    let cancelled = false;
    const fetchModels = async () => {
      setLoadingModels(true);
      try {
        const endpoint = llmProvider === "opencode-go" ? "opencode-go" : "opencode";
        const token = document.cookie.split("session_token=")[1]?.split(";")[0] || localStorage.getItem("session_token") || "";
        const res = await fetch(`${API}/ai/${endpoint}/models`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (res.ok && !cancelled) {
          const data = await res.json();
          setOpencodeModels(data.models || []);
          if (!opencodeModel && data.models?.length > 0 && setOpencodeModel) {
            setOpencodeModel(data.default || data.models[0].id);
          }
        }
      } catch { /* silent */ }
      finally { if (!cancelled) setLoadingModels(false); }
    };
    fetchModels();
    return () => { cancelled = true; };
  }, [llmProvider]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Generar Prompt del Diagrama
          </DialogTitle>
          <DialogDescription>
            Genera un resumen con IA y envialo a un LLM para obtener codigo o documentacion
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 px-1">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.key}>
              {i > 0 && <div className="flex-1 h-px bg-zinc-200" />}
              <div
                className={`px-3 py-1 text-xs font-semibold transition-colors ${
                  step === s.key
                    ? "bg-blue-100 text-blue-700"
                    : stepIdx > i
                    ? "bg-zinc-100 text-zinc-600"
                    : "text-zinc-400"
                }`}
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {s.label}
              </div>
            </React.Fragment>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Step 1: Config */}
          {step === "config" && (
            <div className="space-y-4 p-1">
              <div className="space-y-3">
                <Label className="text-sm font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>OPCIONES</Label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={includeXml} onChange={(e) => setIncludeXml(e.target.checked)} className="rounded border-zinc-300" data-testid="editor-summary-include-xml" />
                    <span className="text-sm">Incluir XML completo del diagrama</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={includeOop} onChange={(e) => setIncludeOop(e.target.checked)} className="rounded border-zinc-300" data-testid="editor-summary-include-oop" />
                    <span className="text-sm">Incluir clases OOP asociadas</span>
                  </label>
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>CONTEXTO ADICIONAL</Label>
                <Textarea value={context} onChange={(e) => setContext(e.target.value)} placeholder="Opcional: contexto sobre el proceso, industria, requisitos..." rows={3} className="rounded-lg text-sm" data-testid="editor-summary-context" />
              </div>
              <div className="bg-zinc-50 border border-zinc-200 p-3">
                <p className="text-xs text-zinc-500" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  Se analizara &quot;{diagram?.name || 'diagrama'}&quot; usando IA
                </p>
              </div>
              <InlineProgress active={generating} label="GENERANDO RESUMEN" expectedMin={25} expectedMax={40} />
            </div>
          )}

          {/* Step 2: Prompt + LLM options */}
          {step === "prompt" && (
            <div className="space-y-4 p-1">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>PROMPT GENERADO</Label>
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" onClick={copySummary} data-testid="copy-editor-summary-btn" className="rounded-lg h-7 text-xs">
                    {copiedSummary ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    {copiedSummary ? "Copiado" : "Copiar"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadSummary} data-testid="download-editor-summary-btn" className="rounded-lg h-7 text-xs">
                    <Download className="w-3.5 h-3.5 mr-1" />
                    .md
                  </Button>
                </div>
              </div>
              <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} className="font-mono text-xs min-h-[180px] max-h-[220px] resize-none rounded-lg" data-testid="editor-summary-output" />

              <div className="border border-zinc-200 p-4 space-y-3 bg-zinc-50">
                <Label className="text-sm font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>ENVIAR A LLM</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-zinc-500 mb-1.5 block">Modelo</Label>
                    <div className="flex gap-2">
                      {[
                        { value: "deepseek", label: "DeepSeek V4-Pro" },
                        { value: "minimax", label: "MiniMax M3" },
                        { value: "mimo", label: "MiMo-V2-Pro" },
                        { value: "opencode", label: "OpenCode Zen" },
                        { value: "opencode-go", label: "OpenCode Go" },
                      ].map((m) => {
                        const active = llmProvider === m.value || (m.value === "deepseek" && llmProvider === "deepseek-flash");
                        return (
                          <button
                            key={m.value}
                            onClick={() => setLlmProvider(m.value)}
                            data-testid={`editor-llm-provider-${m.value}`}
                            className={`flex-1 px-3 py-2 text-xs font-medium border transition-all ${
                              active ? "border-blue-400 bg-blue-50 text-blue-700" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                            }`}
                          >
                            {m.label}
                          </button>
                        );
                      })}
                    </div>
                    {(llmProvider === "deepseek" || llmProvider === "deepseek-flash") && (
                      <div className="flex items-center gap-1 mt-2">
                        {[
                          { v: "deepseek", label: "Pro" },
                          { v: "deepseek-flash", label: "Flash" },
                        ].map((x) => (
                          <button
                            key={x.v}
                            onClick={() => setLlmProvider(x.v)}
                            data-testid={`editor-deepseek-variant-${x.label.toLowerCase()}`}
                            className={`text-[10px] font-bold tracking-wider uppercase px-2 py-1 border transition-colors ${
                              llmProvider === x.v
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                            }`}
                            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                          >
                            {x.label}
                          </button>
                        ))}
                        {(() => {
                          const sug = suggestDeepseekVariant(summary);
                          if (!sug) return null;
                          const sugProvider = sug === "flash" ? "deepseek-flash" : "deepseek";
                          if (sugProvider === llmProvider) return null;
                          return (
                            <button
                              onClick={() => setLlmProvider(sugProvider)}
                              className="ml-auto flex items-center gap-1 text-[9px] font-bold tracking-wide uppercase px-2 py-1 border border-emerald-300 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100"
                              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                              title={NUDGE_COPY[sug]}
                              data-testid="editor-variant-nudge"
                            >
                              <Lightbulb className="w-3 h-3" strokeWidth={2.5} />
                              Sug: {sug === "flash" ? "Flash" : "Pro"}
                            </button>
                          );
                        })()}
                      </div>
                    )}
                    {/* OpenCode model selector */}
                    {isOpencodeProvider && (opencodeModels.length > 0 || loadingModels) && (
                      <select
                        value={opencodeModel}
                        onChange={(e) => setOpencodeModel && setOpencodeModel(e.target.value)}
                        disabled={loadingModels}
                        className={`text-[10px] font-bold tracking-wide uppercase px-2 py-1 mt-2 border bg-white outline-none ${
                          llmProvider === "opencode-go" ? "border-teal-300 text-teal-700" : "border-violet-300 text-violet-700"
                        }`}
                        style={{ fontFamily: "'IBM Plex Mono', monospace", maxWidth: 180 }}
                        data-testid="editor-opencode-model-select"
                      >
                        {loadingModels ? (
                          <option>Cargando...</option>
                        ) : (
                          opencodeModels.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.id.split("/").pop()}
                            </option>
                          ))
                        )}
                      </select>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-zinc-500 mb-1.5 block">Tipo de salida</Label>
                    <div className="flex gap-2">
                      {[
                        { value: "code", label: "Codigo" },
                        { value: "docs", label: "Documentacion" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setLlmOutputType(opt.value)}
                          data-testid={`editor-llm-output-${opt.value}`}
                          className={`flex-1 px-3 py-2 text-xs font-medium border transition-all ${
                            llmOutputType === opt.value ? "border-blue-400 bg-blue-50 text-blue-700" : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {llmOutputType === "code" && (
                  <div>
                    <Label className="text-xs text-zinc-500 mb-1.5 block">Lenguaje</Label>
                    <Select value={llmLanguage} onValueChange={setLlmLanguage}>
                      <SelectTrigger className="h-8 rounded-lg text-xs" data-testid="editor-llm-language-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sudolang">SudoLang (Principal)</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="nodejs">Node.js (TypeScript)</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="csharp">C#</SelectItem>
                        <SelectItem value="go">Go</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <InlineProgress active={processing} label={`PROCESANDO CON ${providerLabel.toUpperCase()}`} expectedMin={25} expectedMax={45} />
            </div>
          )}

          {/* Step 3: Result */}
          {step === "result" && (
            <div className="flex-1 overflow-hidden flex flex-col space-y-3 p-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-semibold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    {llmOutputType === "code" ? "CODIGO GENERADO" : "DOCUMENTACION"}
                  </Label>
                  <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-[10px] font-mono">{providerLabel}</span>
                </div>
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" onClick={copyResult} data-testid="copy-editor-llm-result-btn" className="rounded-lg h-7 text-xs">
                    {copiedResult ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                    {copiedResult ? "Copiado" : "Copiar"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadResult} data-testid="download-editor-llm-result-btn" className="rounded-lg h-7 text-xs">
                    <Download className="w-3.5 h-3.5 mr-1" />
                    Descargar
                  </Button>
                </div>
              </div>
              <ScrollArea className="flex-1 min-h-0 max-h-[50vh]">
                {llmOutputType === "code" ? (
                  <pre className="bg-deep-navy text-zinc-100 p-4 overflow-auto text-sm font-mono" data-testid="editor-llm-result-output">
                    <code>{result}</code>
                  </pre>
                ) : (
                  <pre className="whitespace-pre-wrap text-sm text-zinc-800 leading-relaxed font-sans p-2" data-testid="editor-llm-result-output">
                    {result}
                  </pre>
                )}
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2 border-t">
          {step === "config" && (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg">Cancelar</Button>
              <Button onClick={onGenerateSummary} disabled={generating} className="bg-blue-600 hover:bg-blue-700 rounded-lg" data-testid="editor-generate-summary-action">
                {generating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {generating ? "Generando..." : "Generar Prompt"}
              </Button>
            </>
          )}
          {step === "prompt" && (
            <>
              <Button variant="outline" onClick={() => { setStep("config"); setSummary(""); }} className="rounded-lg">Atras</Button>
              <Button onClick={onProcessWithLlm} disabled={processing || !summary.trim()} className="bg-blue-600 hover:bg-blue-700 rounded-lg" data-testid="editor-send-to-llm-btn">
                {processing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {processing ? "Procesando..." : `Enviar a ${providerLabel}`}
              </Button>
            </>
          )}
          {step === "result" && (
            <>
              <Button variant="outline" onClick={() => { setStep("prompt"); setResult(""); }} className="rounded-lg">Ver Prompt</Button>
              <Button variant="outline" onClick={() => { setStep("config"); setSummary(""); setResult(""); }} className="rounded-lg">Nueva Generacion</Button>
              <Button onClick={() => onOpenChange(false)} className="bg-blue-600 hover:bg-blue-700 rounded-lg">Cerrar</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
