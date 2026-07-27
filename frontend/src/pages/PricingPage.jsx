// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/I18nContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useAuth, API } from "@/App";
import { getAuthHeaders } from "@/lib/api";
import {
  Workflow,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  Cpu,
  Sparkles,
  Crown,
  Bell,
  Star,
  Users2,
  GraduationCap,
  Briefcase,
  Building2,
  Gift,
} from "lucide-react";

// SDD-IA pricing strategy: Free / Pro / Team / Enterprise
const TIERS = [
  {
    id: "free",
    name: "Free",
    tagline: "Exploración",
    price: "0",
    currency: "€",
    period: "/ siempre",
    audienceIcon: GraduationCap,
    audience: "Estudiantes / Demos",
    description: "Para estudiantes y demos. Conoce la plataforma sin compromiso.",
    highlight: false,
    features: [
      { text: "1 proyecto activo", included: true },
      { text: "Hasta 3 diagramas BPMN por proyecto", included: true },
      { text: "IA básica (DeepSeek V4-Flash)", included: true },
      { text: "MoSCoW básico", included: true },
      { text: "Colaboración: solo lectura", included: true },
      { text: "Versionado Git", included: false },
      { text: "Soporte de la comunidad", included: true },
    ],
    cta: "Comenzar gratis",
    ctaLink: "/login",
    ctaTestId: "btn-tier-free",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Individual / Dev",
    price: "19",
    priceFrom: "12",
    currency: "€",
    period: "/ mes",
    audienceIcon: Briefcase,
    audience: "Freelance / Solopreneurs",
    description: "Para profesionales individuales que necesitan potencia completa.",
    highlight: false,
    features: [
      { text: "Proyectos ilimitados", included: true },
      { text: "Diagramas BPMN ilimitados", included: true },
      { text: "IA full (DeepSeek V4-Pro, MiniMax M3, MiMo-V2-Pro)", included: true },
      { text: "Requirements full (OpenSpec / Speckit)", included: true },
      { text: "Colaboración: viewer compartido", included: true },
      { text: "Historial local + 1 branch Git", included: true },
      { text: "Soporte por email (48 h)", included: true },
    ],
    cta: "Empezar Pro",
    ctaLink: "/login?plan=pro",
    ctaTestId: "btn-tier-pro",
    trial: true,
  },
  {
    id: "team",
    name: "Team",
    tagline: "El Sweet Spot",
    badge: "Más popular",
    price: "49",
    priceFrom: "39",
    currency: "€",
    period: "/ mes",
    audienceIcon: Users2,
    audience: "Consultoras / Células Dev",
    description: "Diseñado para equipos que colaboran en tiempo real con gobernanza completa.",
    highlight: true,
    features: [
      { text: "Todo lo de Pro, más:", included: true, bold: true },
      { text: "IA con prioridad y alta cuota", included: true },
      { text: "Trazabilidad 360° de requirements", included: true },
      { text: "Colaboración en tiempo real (WebSockets)", included: true },
      { text: "Sincronización completa con GitHub", included: true },
      { text: "Comentarios inter-departamentales", included: true },
      { text: "Soporte por email 24 h + chat", included: true },
    ],
    cta: "Empezar Team",
    ctaLink: "/login?plan=team",
    ctaTestId: "btn-tier-team",
    trial: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Custom",
    price: "Custom",
    currency: "",
    period: "",
    audienceIcon: Building2,
    audience: "Grandes empresas",
    description: "Para organizaciones que necesitan compliance, on-premise y SLA garantizado.",
    highlight: false,
    features: [
      { text: "Todo lo de Team, más:", included: true, bold: true },
      { text: "BYOK (Bring Your Own Key) + sin límites IA", included: true },
      { text: "Custom Schemas para requirements", included: true },
      { text: "Audit Logs + SSO (SAML / OIDC)", included: true },
      { text: "On-premise / GitLab / Bitbucket", included: true },
      { text: "Account Manager dedicado", included: true },
      { text: "SLA garantizado", included: true },
    ],
    cta: "Contactar con ventas",
    ctaLink: null,
    ctaTestId: "btn-tier-enterprise",
  },
];

// Comparison rows: each is [feature, free, pro, team, enterprise]
const COMPARISON_ROWS = [
  ["Proyectos", "1 activo", "Ilimitados", "Ilimitados", "Ilimitados"],
  ["Diagramas BPMN", "3 / proyecto", "Ilimitados", "Ilimitados", "Ilimitados"],
  ["Capacidades IA", "Básica (DeepSeek V4-Flash)", "Full (DeepSeek + MiniMax + MiMo)", "Prioridad + alta cuota", "Sin límites / BYOK"],
  ["Requirements", "MoSCoW básico", "Full (OpenSpec)", "Trazabilidad 360°", "Custom Schemas"],
  ["Colaboración", "Solo lectura", "Viewer compartido", "Tiempo real (WebSockets)", "Audit Logs + SSO"],
  ["Versionado Git", "—", "Historial local + 1 branch", "Sincronización GitHub completa", "On-premise / GitLab"],
  ["Soporte", "Comunidad", "Email 48 h", "Email 24 h + chat", "Account Manager"],
  ["SLA", "—", "—", "99,5 %", "Garantizado custom"],
];

const AI_MODELS = [
  { name: "DeepSeek V4-Pro", provider: "DeepSeek", params: "1M ctx" },
  { name: "DeepSeek V4-Flash", provider: "DeepSeek", params: "Real-time" },
  { name: "MiniMax M3", provider: "MiniMax", params: "1M ctx" },
  { name: "MiMo-V2-Pro", provider: "Xiaomi", params: "1M ctx" },
];

const FAQ = [
  {
    q: "¿Qué es BYOK (Bring Your Own Key)?",
    a: "En el plan Enterprise puedes usar tus propias API keys de OpenAI, Anthropic o Google. Así desacoplas el coste de los modelos del coste de la plataforma — ideal para corporaciones con contratos directos con los proveedores de IA.",
  },
  {
    q: "¿Puedo cambiar de plan en cualquier momento?",
    a: "Sí. Sube de plan al instante con prorrateo. Bajar de plan se aplica al siguiente ciclo de facturación. Tus datos siempre se preservan.",
  },
  {
    q: "¿Hay descuento si pago anualmente?",
    a: "Sí: 2 meses gratis al pagar anualmente (equivalente a −16 %) en planes Pro y Team. Habla con ventas para descuentos volumétricos en Enterprise.",
  },
  {
    q: "¿Puedo auto-hospedar la plataforma?",
    a: "Sí, en el plan Enterprise. Te entregamos imagen Docker / Helm chart + scripts de despliegue + documentación. Soportamos AWS, GCP, Azure y on-premise (RHEL/Ubuntu).",
  },
  {
    q: "¿Qué pasa con mis diagramas si cancelo?",
    a: "Conservas acceso de solo lectura durante 90 días. Puedes exportar todos tus proyectos en formato BPMN 2.0 + JSON antes de borrar la cuenta.",
  },
];

const PricingPage = () => {
  useI18n();
  const { isAuthenticated } = useAuth();
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

  const waitlistSchema = z.object({ email: z.string().email("Introduce un email valido") });
  const waitlistForm = useForm({ resolver: zodResolver(waitlistSchema), defaultValues: { email: "" } });
  const [checkoutLoading, setCheckoutLoading] = useState(null);

  const startCheckout = async (planId) => {
    // Check if we have a session token (faster than waiting for auth context to load)
    const hasToken =
      localStorage.getItem("session_token") ||
      document.cookie.split("; ").some((c) => c.startsWith("session_token="));
    if (!hasToken && !isAuthenticated) {
      window.location.href = `/login?next=/pricing&plan=${planId}`;
      return;
    }
    setCheckoutLoading(planId);
    try {
      const res = await fetch(`${API}/payments/checkout/session`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ plan_id: planId, origin_url: window.location.origin }),
      });
      if (!res.ok) {
        toast.error("No se pudo iniciar el pago. Intenta de nuevo.");
        return;
      }
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Stripe no devolvió URL de checkout.");
      }
    } catch (e) {
      toast.error("Error al iniciar checkout.");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleWaitlist = (data) => {
    setWaitlistSubmitted(true);
    setTimeout(() => setWaitlistSubmitted(false), 4000);
    waitlistForm.reset();
  };

  return (
    <div className="min-h-screen bg-white" data-testid="pricing-page">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-zinc-200/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-deep-navy flex items-center justify-center">
              <Workflow className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-black text-zinc-900 tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>
              SDD-IA
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSelector variant="full" />
            <Link to="/login">
              <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs font-bold border border-zinc-200" data-testid="nav-login">
                Acceder
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-zinc-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-electric-cyan/10 rounded-full blur-[120px] -translate-y-16 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/5 rounded-full blur-[150px] translate-y-16 -translate-x-16" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-electric-cyan mb-6" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            Estrategia de pricing
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-deep-navy tracking-tighter uppercase leading-none mb-6" style={{ fontFamily: "'Chivo', sans-serif" }}>
            Modela.<br />
            <span className="gradient-text">Versiona. Colabora.</span>
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: "'Work Sans', sans-serif" }}>
            Cuatro planes claros. Sin sorpresas. Basados en volumen de proyectos y gobernanza, no en commodity por tokens.
          </p>
        </div>
      </section>

      {/* Pricing Grid (4 tiers) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
          {TIERS.map((tier) => {
            const AudienceIcon = tier.audienceIcon;
            return (
              <div
                key={tier.id}
                className={`flex flex-col p-6 border rounded-2xl transition-all duration-300 ${
                  tier.highlight
                    ? "glass-card ai-glow border-electric-cyan/40 text-deep-navy xl:-translate-y-3 hover:translate-y-[-14px]"
                    : "glass-card hover:bg-white text-zinc-900 border-zinc-200 hover:-translate-y-1"
                }`}
                data-testid={`tier-card-${tier.id}`}
              >
                {/* Header */}
                <div className="mb-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>
                        {tier.name}
                      </h3>
                      <p
                        className={`text-[10px] font-bold tracking-[0.2em] uppercase mt-0.5 ${
                          tier.highlight ? "text-blue-400" : "text-blue-600"
                        }`}
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      >
                        {tier.tagline}
                      </p>
                    </div>
                    {tier.badge && (
                      <span
                        className="text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-1 bg-blue-600 text-white inline-flex items-center gap-1 whitespace-nowrap"
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      >
                        <Star className="w-2.5 h-2.5" strokeWidth={3} />
                        {tier.badge}
                      </span>
                    )}
                  </div>

                  {/* Audience pill */}
                  <div
                    className={`inline-flex items-center gap-1.5 px-2 py-1 mb-4 ${
                      tier.highlight ? "bg-electric-cyan/10 text-deep-navy" : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    <AudienceIcon className="w-3 h-3" />
                    <span className="text-[10px] tracking-wider" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      {tier.audience}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-3 min-h-[60px]">
                    {tier.price === "Custom" ? (
                      <span className="text-3xl font-black tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>
                        Custom
                      </span>
                    ) : (
                      <>
                        <span className="text-sm font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                          {tier.currency}
                        </span>
                        {tier.priceFrom && (
                          <span className={`text-xs font-bold mr-1 ${tier.highlight ? "text-zinc-500" : "text-zinc-400"}`} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                            {tier.priceFrom}—
                          </span>
                        )}
                        <span className="text-5xl font-black tracking-tighter" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                          {tier.price}
                        </span>
                      </>
                    )}
                    {tier.period && (
                      <span className={`text-xs font-bold tracking-wider ${tier.highlight ? "text-zinc-400" : "text-zinc-500"}`} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                        {tier.period}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed ${tier.highlight ? "text-zinc-400" : "text-zinc-600"}`} style={{ fontFamily: "'Work Sans', sans-serif" }}>
                    {tier.description}
                  </p>
                </div>

                {/* Trial banner (Pro / Team) */}
                {tier.trial && (
                  <div
                    className={`mb-4 px-3 py-2.5 border-2 flex items-start gap-2 ${
                      tier.highlight
                        ? "bg-blue-500/10 border-blue-400/60 text-blue-100"
                        : "bg-blue-50 border-blue-600 text-blue-900"
                    }`}
                    data-testid={`trial-banner-${tier.id}`}
                  >
                    <Gift
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${tier.highlight ? "text-blue-300" : "text-blue-600"}`}
                      strokeWidth={2.5}
                    />
                    <div className="flex flex-col leading-tight">
                      <span
                        className="text-[11px] font-black uppercase tracking-[0.12em]"
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      >
                        Prueba gratis 14 días
                      </span>
                      <span
                        className={`text-[10px] mt-0.5 ${tier.highlight ? "text-blue-200/90" : "text-blue-800/80"}`}
                        style={{ fontFamily: "'Work Sans', sans-serif" }}
                      >
                        Sin tarjeta requerida. Cancela cuando quieras.
                      </span>
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div className={`h-0.5 mb-5 ${tier.highlight ? "bg-zinc-700" : "bg-zinc-200"}`} />

                {/* Features */}
                <ul className="space-y-2.5 flex-1 mb-6">
                  {tier.features.map((feat) => (
                    <li key={feat.text} className="flex items-start gap-2">
                      <div className={`w-4 h-4 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                        feat.included
                          ? tier.highlight ? "text-blue-400" : "text-blue-600"
                          : "text-zinc-400"
                      }`}>
                        {feat.included ? <Check className="w-4 h-4" strokeWidth={3} /> : <X className="w-4 h-4" strokeWidth={3} />}
                      </div>
                      <span className={`text-xs leading-relaxed ${
                        feat.included
                          ? tier.highlight ? "text-zinc-200" : "text-zinc-800"
                          : tier.highlight ? "text-zinc-500 line-through" : "text-zinc-400 line-through"
                      } ${feat.bold ? "font-bold" : ""}`} style={{ fontFamily: "'Work Sans', sans-serif" }}>
                        {feat.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {tier.id === "pro" || tier.id === "team" ? (
                  <button
                    onClick={() => startCheckout(tier.id)}
                    disabled={checkoutLoading === tier.id}
                    className={`w-full px-4 py-3 text-xs font-bold tracking-[0.15em] uppercase border rounded-xl transition-all duration-300 ${
                      tier.highlight
                        ? "bg-electric-cyan text-deep-navy border-electric-cyan hover:bg-electric-cyan/90 hover:shadow-lg"
                        : "bg-deep-navy text-white border-deep-navy hover:bg-deep-navy/90 hover:shadow-lg"
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    data-testid={tier.ctaTestId}
                  >
                    {checkoutLoading === tier.id ? "Redirigiendo..." : tier.cta}
                    {checkoutLoading !== tier.id && <ArrowRight className="w-3.5 h-3.5 inline ml-2" />}
                  </button>
                ) : tier.ctaLink ? (
                  <Link to={tier.ctaLink}>
                    <button
                      className={`w-full px-4 py-3 text-xs font-bold tracking-[0.15em] uppercase border rounded-xl transition-all duration-300 ${
                        tier.highlight
                          ? "bg-electric-cyan text-deep-navy border-electric-cyan hover:bg-electric-cyan/90 hover:shadow-lg"
                          : "bg-deep-navy text-white border-deep-navy hover:bg-deep-navy/90 hover:shadow-lg"
                      }`}
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      data-testid={tier.ctaTestId}
                    >
                      {tier.cta}
                      <ArrowRight className="w-3.5 h-3.5 inline ml-2" />
                    </button>
                  </Link>
                ) : (
                  <a href="mailto:oscar.hidalgo.puertas@gmail.com?subject=Consulta%20Enterprise%20SDD-IA">
                    <button
                      className="w-full px-4 py-3 text-xs font-bold tracking-[0.15em] uppercase border-2 bg-blue-600 text-white border-blue-600 hover:bg-white hover:text-blue-600 transition-colors"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      data-testid={tier.ctaTestId}
                    >
                      {tier.cta}
                      <ArrowRight className="w-3.5 h-3.5 inline ml-2" />
                    </button>
                  </a>
                )}
              </div>
            );
          })}
        </div>

        {/* BYOK note */}
        <p className="text-center mt-10 text-xs text-zinc-500 max-w-2xl mx-auto" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          * BYOK = <strong>Bring Your Own Key</strong>. Aporta tus propias API keys de OpenAI, Anthropic o Google y desacopla el coste del modelo del coste de la plataforma.
        </p>
      </section>

      {/* Comparison Table */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-zinc-50/50 border-y border-zinc-200/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-blue-600 mb-3" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              Comparativa detallada
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight uppercase" style={{ fontFamily: "'Chivo', sans-serif" }}>
              Característica por característica
            </h2>
          </div>

          <div className="overflow-x-auto bg-white border border-zinc-200" data-testid="pricing-comparison-table">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-deep-navy text-white">
                  <th className="px-4 py-3 text-left text-xs font-bold tracking-wider uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Característica</th>
                  <th className="px-4 py-3 text-left text-xs font-bold tracking-wider uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Free</th>
                  <th className="px-4 py-3 text-left text-xs font-bold tracking-wider uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Pro</th>
                  <th className="px-4 py-3 text-left text-xs font-bold tracking-wider uppercase bg-blue-600" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    Team
                    <Star className="w-3 h-3 inline ml-1" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold tracking-wider uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr
                    key={row[0]}
                    className={idx % 2 === 0 ? "bg-white" : "bg-zinc-50"}
                    data-testid={`comparison-row-${row[0].toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                  >
                    <td className="px-4 py-3 font-bold text-zinc-900 text-xs tracking-wide" style={{ fontFamily: "'Chivo', sans-serif" }}>{row[0]}</td>
                    <td className="px-4 py-3 text-zinc-600 text-xs">{row[1]}</td>
                    <td className="px-4 py-3 text-zinc-700 text-xs">{row[2]}</td>
                    <td className="px-4 py-3 text-blue-700 text-xs font-semibold bg-blue-50">{row[3]}</td>
                    <td className="px-4 py-3 text-zinc-700 text-xs">{row[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* AI Models Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-deep-navy">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-blue-400 mb-4" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              Inteligencia artificial
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase mb-4" style={{ fontFamily: "'Chivo', sans-serif" }}>
              Modelos integrados por nivel
            </h2>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto" style={{ fontFamily: "'Work Sans', sans-serif" }}>
              Empieza con DeepSeek V4-Flash gratis. Escala a DeepSeek V4-Pro + MiniMax + MiMo en Pro y Team. Ilimitado o BYOK en Enterprise.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {AI_MODELS.map((model) => (
              <div
                key={model.name}
                className="border border-white/10 p-6 rounded-xl hover:border-electric-cyan/40 hover:bg-white/5 transition-all duration-300 group"
                data-testid={`ai-model-${model.name.replace(/\s/g, "-").toLowerCase()}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Cpu className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500 group-hover:text-zinc-400" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    {model.provider}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-blue-400 transition-colors" style={{ fontFamily: "'Chivo', sans-serif" }}>
                  {model.name}
                </h3>
                <span className="text-xs text-zinc-500" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  {model.params}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" data-testid="pricing-faq">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-blue-600 mb-3" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              Preguntas frecuentes
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight uppercase" style={{ fontFamily: "'Chivo', sans-serif" }}>
              Antes de decidir
            </h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <details
                key={item.q}
                className="group border border-zinc-200 bg-white px-5 py-4 rounded-xl cursor-pointer hover:bg-zinc-50 transition-colors"
                data-testid={`faq-item-${i}`}
              >
                <summary className="flex items-center justify-between font-bold text-sm text-zinc-900 list-none" style={{ fontFamily: "'Chivo', sans-serif" }}>
                  {item.q}
                  <ArrowRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                </summary>
                <p className="mt-3 text-sm text-zinc-600 leading-relaxed" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA strip */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-deep-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-tech-pattern opacity-30" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <Crown className="w-10 h-10 text-electric-cyan mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mb-4" style={{ fontFamily: "'Chivo', sans-serif" }}>
            ¿Listo para empezar?
          </h2>
          <p className="text-sm text-zinc-400 mb-8 max-w-xl mx-auto" style={{ fontFamily: "'Work Sans', sans-serif" }}>
            Crea tu cuenta gratuita en 30 segundos. Si necesitas más, sube de plan al instante.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link to="/login">
              <button
                className="px-8 py-4 text-xs font-bold tracking-[0.15em] uppercase border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all duration-300"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                data-testid="btn-cta-bottom-free"
              >
                Empezar gratis
                <Sparkles className="w-3.5 h-3.5 inline ml-2" />
              </button>
            </Link>
            <a href="mailto:oscar.hidalgo.puertas@gmail.com?subject=Demo%20Team%20SDD-IA">
              <button
                className="px-8 py-4 text-xs font-bold tracking-[0.15em] uppercase border border-electric-cyan bg-electric-cyan text-deep-navy rounded-xl hover:bg-electric-cyan/90 hover:shadow-lg transition-all duration-300"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                data-testid="btn-cta-bottom-team"
              >
                Solicitar demo Team
                <ArrowRight className="w-3.5 h-3.5 inline ml-2" />
              </button>
            </a>
          </div>

          {/* Tiny waitlist */}
          <Form {...waitlistForm}>
          <form onSubmit={waitlistForm.handleSubmit(handleWaitlist)} className="mt-10 max-w-md mx-auto" data-testid="newsletter-form">
            <div className="flex border border-white/10">
              <FormField
                control={waitlistForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <input
                        type="email"
                        placeholder="Suscríbete a las actualizaciones"
                        className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none w-full"
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                        data-testid="newsletter-email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs px-4 pb-1" />
                  </FormItem>
                )}
              />
              <button
                type="submit"
                className="px-4 bg-blue-600 text-white border-l-2 border-zinc-700 hover:bg-blue-500 transition-colors"
                data-testid="newsletter-submit"
              >
                <Bell className="w-4 h-4" />
              </button>
            </div>
            {waitlistSubmitted && (
              <p className="mt-2 text-xs text-blue-400 tracking-wider" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                ¡Gracias! Te avisaremos.
              </p>
            )}
          </form>
          </Form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t-2 border-zinc-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-deep-navy flex items-center justify-center">
              <Workflow className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-bold text-zinc-400" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              SDD-IA · 2026
            </span>
          </div>
          <Link to="/" className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            <ArrowLeft className="w-3 h-3" /> Volver al inicio
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
