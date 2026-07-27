// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth, API } from "@/App";
import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Workflow, ArrowLeft, Send, Loader2, Sparkles, Bot,
  ShieldCheck, TestTube, TrendingUp, Search, Cpu, Copy, Check, Trash2,
  Lightbulb,
} from "lucide-react";
import { suggestDeepseekVariant, NUDGE_COPY } from "@/lib/deepseekHeuristic";
import { useLlmModels } from "@/hooks/useLlmModels";

const MODES = [
  { key: "general", label: "Asistente General", desc: "Preguntas sobre BPMN, procesos, desarrollo", icon: Bot, color: "bg-blue-100 text-blue-700 border-blue-200" },
  { key: "optimize", label: "Optimizar Procesos", desc: "Detectar cuellos de botella y mejoras", icon: TrendingUp, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { key: "analyze", label: "Analisis Profundo", desc: "KPIs, flujo paso a paso, decisiones", icon: Search, color: "bg-violet-100 text-violet-700 border-violet-200" },
  { key: "security", label: "Seguridad y Compliance", desc: "GDPR, ISO, riesgos, vulnerabilidades", icon: ShieldCheck, color: "bg-amber-100 text-amber-700 border-amber-200" },
  { key: "test", label: "Generar Tests", desc: "Casos de prueba, edge-cases, datos", icon: TestTube, color: "bg-rose-100 text-rose-700 border-rose-200" },
];

// Backend exposes /api/ai/minimax/chat, /api/ai/mimo/chat, /api/ai/deepseek/chat,
// /api/ai/opencode/chat and /api/ai/opencode-go/chat
// with identical request/response shapes. Modes not supported by a given model
// fall back to the model's own "general" system prompt server-side.
const MODELS = [
  {
    key: "deepseek",
    label: "DeepSeek V4-Pro",
    badge: "1M ctx",
    badgeColor: "border-emerald-300 text-emerald-600",
    accent: "text-emerald-600",
    endpoint: "deepseek",
    backendName: "DEEPSEEK V4-PRO",
    fullName: "DeepSeek V4-Pro",
    subtitle: "Razonamiento + codigo · 1M tokens · Engram memory",
    footer: "DeepSeek V4-Pro via OpenAI-compatible API",
  },
  {
    key: "minimax",
    label: "MiniMax M3",
    badge: "1M ctx",
    badgeColor: "border-blue-300 text-blue-600",
    accent: "text-blue-600",
    endpoint: "minimax",
    backendName: "MINIMAX M3",
    fullName: "MiniMax M3",
    subtitle: "Modelo IA de 1M contexto",
    footer: "MiniMax M3 (1M ctx) via Anthropic API",
  },
  {
    key: "mimo",
    label: "MiMo-V2-Pro",
    badge: "1M ctx",
    badgeColor: "border-orange-300 text-orange-600",
    accent: "text-orange-600",
    endpoint: "mimo",
    backendName: "MIMO V2-PRO",
    fullName: "Xiaomi MiMo-V2-Pro",
    subtitle: "Razonamiento profundo · 1M tokens de contexto",
    footer: "Xiaomi MiMo-V2-Pro via OpenAI-compatible API",
  },
  {
    key: "opencode",
    label: "OpenCode Zen",
    badge: "Gateway",
    badgeColor: "border-violet-300 text-violet-600",
    accent: "text-violet-600",
    endpoint: "opencode",
    backendName: "OPENCODE ZEN",
    fullName: "OpenCode Zen",
    subtitle: "Gateway multi-modelo · pay-as-you-go",
    footer: "OpenCode Zen via OpenAI-compatible API",
  },
  {
    key: "opencode-go",
    label: "OpenCode Go",
    badge: "Sub",
    badgeColor: "border-teal-300 text-teal-600",
    accent: "text-teal-600",
    endpoint: "opencode-go",
    backendName: "OPENCODE GO",
    fullName: "OpenCode Go",
    subtitle: "Suscripcion · modelos open coding",
    footer: "OpenCode Go via OpenAI-compatible API",
  },
];

const QUICK_PROMPTS = [
  "Explica las mejores practicas para modelar procesos BPMN 2.0",
  "Como puedo optimizar un proceso de aprobacion de compras?",
  "Genera un checklist de seguridad para procesos financieros",
  "Que KPIs deberia monitorear en un proceso de onboarding?",
  "Crea casos de prueba para un flujo de solicitud de vacaciones",
];

// DeepSeek V4 variants — only relevant when modelKey === "deepseek".
// "pro" = deepseek-v4-pro (best quality). "flash" = deepseek-v4-flash (faster/cheaper).
const DEEPSEEK_VARIANTS = [
  { key: "pro", label: "Pro", model: "deepseek-v4-pro", desc: "Calidad maxima · razonamiento profundo" },
  { key: "flash", label: "Flash", model: "deepseek-v4-flash", desc: "Rapido y mas economico · 1M ctx" },
];

// OpenCode providers that support dynamic model listing
const OPENCODE_PROVIDERS = ["opencode", "opencode-go"];

// Heuristic moved to /lib/deepseekHeuristic.js so it can be shared across
// AI Assistant, ProjectDetailPage and SummaryLlmDialog.

const MiniMaxAssistant = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [mode, setMode] = useState("general");
  const [modelKey, setModelKey] = useState(() => localStorage.getItem("ai_assistant_model") || "deepseek");
  const [deepseekVariant, setDeepseekVariant] = useState(
    () => localStorage.getItem("ai_assistant_deepseek_variant") || "pro"
  );
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // OpenCode dynamic model selection
  const [opencodeModels, setOpencodeModels] = useState({});  // { "opencode": [...], "opencode-go": [...] }
  const [opencodeModel, setOpencodeModel] = useState(
    () => localStorage.getItem("ai_assistant_opencode_model") || ""
  );
  const [opencodeGoModel, setOpencodeGoModel] = useState(
    () => localStorage.getItem("ai_assistant_opencode_go_model") || ""
  );
  const [loadingModels, setLoadingModels] = useState(false);

  // Providers enabled server-side (LLM gateway). Falls back to all MODELS
  // when the catalog endpoint is unavailable.
  const { providers: backendProviders } = useLlmModels();
  const availableModels = MODELS.filter((m) => backendProviders.some((p) => p.key === m.key));

  useEffect(() => {
    if (availableModels.length > 0 && !availableModels.some((m) => m.key === modelKey)) {
      setModelKey(availableModels[0].key);
    }
  }, [availableModels, modelKey]);

  const currentModel = MODELS.find(m => m.key === modelKey) || availableModels[0] || MODELS[0];
  const currentVariant = DEEPSEEK_VARIANTS.find(v => v.key === deepseekVariant) || DEEPSEEK_VARIANTS[0];
  const isDeepseek = modelKey === "deepseek";
  const isOpencode = OPENCODE_PROVIDERS.includes(modelKey);
  const currentOpencodeModel = modelKey === "opencode-go" ? opencodeGoModel : opencodeModel;
  const setCurrentOpencodeModel = modelKey === "opencode-go" ? setOpencodeGoModel : setOpencodeModel;

  useEffect(() => {
    localStorage.setItem("ai_assistant_model", modelKey);
  }, [modelKey]);

  useEffect(() => {
    localStorage.setItem("ai_assistant_deepseek_variant", deepseekVariant);
  }, [deepseekVariant]);

  useEffect(() => {
    localStorage.setItem("ai_assistant_opencode_model", opencodeModel);
  }, [opencodeModel]);

  useEffect(() => {
    localStorage.setItem("ai_assistant_opencode_go_model", opencodeGoModel);
  }, [opencodeGoModel]);

  // Fetch available models from OpenCode when provider is selected
  useEffect(() => {
    if (!isOpencode) return;
    if (opencodeModels[modelKey]?.length) return; // already cached
    let cancelled = false;
    const fetchModels = async () => {
      setLoadingModels(true);
      try {
        const res = await fetch(`${API}/ai/${currentModel.endpoint}/models`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (res.ok && !cancelled) {
          const data = await res.json();
          setOpencodeModels(prev => ({ ...prev, [modelKey]: data.models || [] }));
          // Set default if none selected
          const models = data.models || [];
          if (models.length > 0) {
            const defaultModel = data.default || models[0].id;
            if (modelKey === "opencode-go" && !opencodeGoModel) {
              setOpencodeGoModel(defaultModel);
            } else if (modelKey === "opencode" && !opencodeModel) {
              setOpencodeModel(defaultModel);
            }
          }
        }
      } catch {
        // silent fail
      } finally {
        if (!cancelled) setLoadingModels(false);
      }
    };
    fetchModels();
    return () => { cancelled = true; };
  }, [isOpencode, modelKey]);

  const token = document.cookie.split("session_token=")[1]?.split(";")[0] || localStorage.getItem("session_token") || "";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text = null) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${token}` };
      // Pass DeepSeek variant via X-DeepSeek-Model header (server validates it).
      if (isDeepseek) {
        headers["X-DeepSeek-Model"] = currentVariant.model;
      }
      const body = { message: msg, mode };
      // Pass selected OpenCode model
      if (isOpencode && currentOpencodeModel) {
        body.model = currentOpencodeModel;
      }
      const res = await fetch(`${API}/ai/${currentModel.endpoint}/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: "assistant", content: data.response, mode: data.mode, model: data.model || currentModel.fullName, modelKey: currentModel.key }]);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || `Error al conectar con ${currentModel.label}`);
        setMessages(prev => [...prev, { role: "assistant", content: `Error: ${err.detail || "No se pudo conectar"}`, error: true }]);
      }
    } catch {
      toast.error("Error de red");
      setMessages(prev => [...prev, { role: "assistant", content: `Error de red al conectar con ${currentModel.label}`, error: true }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const copyMessage = (content, idx) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const currentMode = MODES.find(m => m.key === mode);

  return (
    <div className="min-h-screen bg-white flex flex-col" data-testid="minimax-assistant-page">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-7 h-7 bg-deep-navy flex items-center justify-center">
                  <Workflow className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-zinc-900 tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>
                  BPMN Modeler
                </span>
              </Link>
              <div className="w-px h-6 bg-zinc-200" />
              <div className="flex items-center gap-2">
                <Cpu className={`w-4 h-4 ${currentModel.accent}`} />
                <h1 className="text-sm font-bold text-zinc-900" style={{ fontFamily: "'Chivo', sans-serif" }}>
                  AI Assistant
                </h1>
                <Badge variant="outline" className={`text-[9px] px-1.5 py-0 rounded-lg font-bold ${currentModel.badgeColor}`}>
                  {isDeepseek
                    ? `DeepSeek V4-${currentVariant.label}`
                    : isOpencode && currentOpencodeModel
                      ? currentOpencodeModel.split("/").pop()
                      : currentModel.label}
                </Badge>
              </div>
              {/* Model toggle */}
              <div className="flex items-center bg-zinc-100 p-0.5 ml-2" data-testid="model-selector">
                {availableModels.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setModelKey(m.key)}
                    className={`text-[10px] font-bold tracking-[0.1em] uppercase px-2.5 py-1 transition-colors ${
                      modelKey === m.key
                        ? "bg-deep-navy text-white"
                        : "text-zinc-500 hover:text-zinc-900"
                    }`}
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    data-testid={`select-model-${m.key}`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              {/* DeepSeek variant sub-toggle (Pro / Flash) — only when DeepSeek is active */}
              {isDeepseek && (
                <div
                  className="flex items-center border border-emerald-300 bg-white p-0.5 ml-1"
                  data-testid="deepseek-variant-toggle"
                  title="Variante DeepSeek V4: Pro (calidad) o Flash (velocidad/coste)"
                >
                  {DEEPSEEK_VARIANTS.map((v) => (
                    <button
                      key={v.key}
                      onClick={() => setDeepseekVariant(v.key)}
                      className={`text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-1 transition-colors ${
                        deepseekVariant === v.key
                          ? "bg-emerald-600 text-white"
                          : "text-emerald-700 hover:bg-emerald-50"
                      }`}
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      data-testid={`select-deepseek-variant-${v.key}`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              )}
              {/* OpenCode model selector — only when an OpenCode provider is active */}
              {isOpencode && (opencodeModels[modelKey]?.length > 0 || loadingModels) && (
                <select
                  value={currentOpencodeModel}
                  onChange={(e) => setCurrentOpencodeModel(e.target.value)}
                  disabled={loadingModels}
                  className={`text-[10px] font-bold tracking-wide uppercase px-2 py-1 ml-1 border bg-white outline-none ${
                    modelKey === "opencode-go" ? "border-teal-300 text-teal-700" : "border-violet-300 text-violet-700"
                  }`}
                  style={{ fontFamily: "'IBM Plex Mono', monospace", maxWidth: 160 }}
                  data-testid="opencode-model-select"
                  title={`Modelo ${currentModel.label}`}
                >
                  {loadingModels ? (
                    <option>Cargando...</option>
                  ) : (
                    (opencodeModels[modelKey] || []).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.id.split("/").pop()}
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearChat} className="rounded-lg h-8 text-xs" data-testid="clear-chat-btn">
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Limpiar
                </Button>
              )}
              <Link to="/dashboard">
                <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs" data-testid="back-btn">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  {t("common.back")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Sidebar - Modes */}
        <aside className="w-64 border-r border-zinc-200 p-4 space-y-3 flex-shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            MODO IA
          </p>
          {MODES.map(m => {
            const Icon = m.icon;
            const isActive = mode === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setMode(m.key)}
                className={`w-full text-left p-3 border transition-all ${isActive ? `${m.color} border-current` : "border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50"}`}
                data-testid={`mode-${m.key}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-bold">{m.label}</span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight">{m.desc}</p>
              </button>
            );
          })}

          <div className="pt-3 border-t border-zinc-200">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              CAPACIDADES
            </p>
            <ul className="text-[10px] text-zinc-500 space-y-1.5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              <li className="flex items-center gap-1.5"><span className="w-1 h-1 bg-blue-500 rounded-full" />Analisis BPMN 2.0</li>
              <li className="flex items-center gap-1.5"><span className="w-1 h-1 bg-emerald-500 rounded-full" />Generacion de codigo</li>
              <li className="flex items-center gap-1.5"><span className="w-1 h-1 bg-violet-500 rounded-full" />Documentacion tecnica</li>
              <li className="flex items-center gap-1.5"><span className="w-1 h-1 bg-amber-500 rounded-full" />Auditoria seguridad</li>
              <li className="flex items-center gap-1.5"><span className="w-1 h-1 bg-rose-500 rounded-full" />Tests automaticos</li>
              <li className="flex items-center gap-1.5"><span className="w-1 h-1 bg-cyan-500 rounded-full" />Optimizacion procesos</li>
              <li className="flex items-center gap-1.5"><span className="w-1 h-1 bg-pink-500 rounded-full" />Contexto largo (1M tokens)</li>
            </ul>
          </div>
        </aside>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 p-6" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <div className="w-16 h-16 bg-deep-navy flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-zinc-900 mb-2" style={{ fontFamily: "'Chivo', sans-serif" }}>
                  {isDeepseek ? `DeepSeek V4-${currentVariant.label}` : currentModel.fullName}
                </h2>
                <p className="text-sm text-zinc-500 mb-1">
                  {isDeepseek ? currentVariant.desc : currentModel.subtitle}
                </p>
                <p className="text-xs text-zinc-400 mb-6 max-w-md text-center">
                  Asistente especializado en procesos BPMN. Analiza, optimiza, genera codigo, documenta y audita tus procesos de negocio.
                </p>
                <div className="flex items-center gap-2 mb-6">
                  <Badge className={currentMode?.color}>{currentMode?.label}</Badge>
                </div>
                <div className="grid grid-cols-1 gap-2 w-full max-w-lg">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    SUGERENCIAS RAPIDAS
                  </p>
                  {QUICK_PROMPTS.map((prompt, i) => (
                    <button
                      key={`qp-${i}`}
                      onClick={() => sendMessage(prompt)}
                      className="text-left text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 p-3 border border-zinc-200 transition-colors"
                      data-testid={`quick-prompt-${i}`}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((msg, idx) => (
                  <div key={`msg-${idx}`} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] ${msg.role === "user" ? "bg-deep-navy text-white p-3" : msg.error ? "bg-red-50 border border-red-200 p-4" : "bg-zinc-50 border border-zinc-200 p-4"}`}>
                      {msg.role === "assistant" && (
                        <div className="flex items-center gap-2 mb-2">
                          <Cpu className={`w-3.5 h-3.5 ${MODELS.find(mm => mm.key === msg.modelKey)?.accent || "text-blue-600"}`} />
                          <span className={`text-[10px] font-bold ${MODELS.find(mm => mm.key === msg.modelKey)?.accent || "text-blue-600"}`} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                            {MODELS.find(mm => mm.key === msg.modelKey)?.backendName || "MINIMAX M3"}
                          </span>
                          {msg.mode && <Badge variant="outline" className="text-[8px] px-1 py-0 rounded-lg">{msg.mode}</Badge>}
                        </div>
                      )}
                      <div className={`text-sm whitespace-pre-wrap leading-relaxed ${msg.role === "user" ? "text-white" : msg.error ? "text-red-700" : "text-zinc-800"}`}>
                        {msg.content}
                      </div>
                      {msg.role === "assistant" && !msg.error && (
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={() => copyMessage(msg.content, idx)}
                            className="text-zinc-400 hover:text-zinc-600 p-1"
                            data-testid={`copy-msg-${idx}`}
                          >
                            {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-50 border border-zinc-200 p-4 flex items-center gap-2">
                      <Loader2 className={`w-4 h-4 animate-spin ${currentModel.accent}`} />
                      <span className="text-xs text-zinc-500">{isDeepseek ? `DeepSeek V4-${currentVariant.label}` : currentModel.fullName} pensando...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="border-t border-zinc-200 p-4">
            {/* Variant nudge — only when DeepSeek is active and heuristic disagrees with the user's choice */}
            {isDeepseek && (() => {
              const suggestion = suggestDeepseekVariant(input);
              if (!suggestion || suggestion === deepseekVariant) return null;
              const targetLabel = suggestion === "flash" ? "Flash" : "Pro";
              const tip = NUDGE_COPY[suggestion];
              return (
                <div
                  className="max-w-3xl mx-auto mb-2 px-3 py-2 border border-emerald-300 bg-emerald-50/50 flex items-center gap-2"
                  data-testid="variant-nudge"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" strokeWidth={2.5} />
                  <span
                    className="text-[10px] tracking-wide text-emerald-900 flex-1"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    Sugerencia: usa <strong>{targetLabel}</strong> para esta consulta · {tip}
                  </span>
                  <button
                    onClick={() => setDeepseekVariant(suggestion)}
                    className="text-[10px] font-bold uppercase px-2 py-1 bg-emerald-600 text-white hover:bg-emerald-700"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    data-testid="variant-nudge-apply"
                  >
                    Cambiar
                  </button>
                </div>
              );
            })()}
            <div className="max-w-3xl mx-auto flex gap-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Pregunta al asistente (modo: ${currentMode?.label})...`}
                className="rounded-lg resize-none min-h-[44px] max-h-[120px] text-sm flex-1"
                rows={1}
                data-testid="chat-input"
              />
              <Button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="bg-deep-navy hover:bg-deep-navy/90 text-white rounded-lg h-11 px-4"
                data-testid="send-btn"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-center text-[10px] text-zinc-400 mt-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {isDeepseek ? `DeepSeek V4-${currentVariant.label} (${currentVariant.model}) via OpenAI-compatible API` : currentModel.footer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MiniMaxAssistant;
