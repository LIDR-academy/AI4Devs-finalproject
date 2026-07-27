// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/I18nContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { track } from "@/lib/landingTracker";
import {
  ArrowRight,
  Zap,
  Check,
  X,
  Sparkles,
  GitBranch,
  FileText,
  ListChecks,
  Workflow,
  Code2,
  BarChart3,
  Rocket,
  Send,
  Play,
  ShieldCheck,
  Star,
} from "lucide-react";

// ----- ROI Calculator -----

const fmtNum = (n) =>
  n.toLocaleString("es-ES", { maximumFractionDigits: 0 });

const Slider = ({ id, label, value, min, max, step = 1, onChange, suffix, dark }) => (
  <div className="space-y-2">
    <div className="flex items-baseline justify-between">
      <label
        htmlFor={id}
        className={`text-[11px] font-bold uppercase tracking-[0.15em] ${dark ? "text-zinc-300" : "text-zinc-500"}`}
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        {label}
      </label>
      <span
        className={`text-lg font-black tabular-nums ${dark ? "text-white" : "text-zinc-900"}`}
        style={{ fontFamily: "'Chivo', sans-serif" }}
      >
        {fmtNum(value)}
        <span className="text-xs font-bold ml-1 text-zinc-400">{suffix}</span>
      </span>
    </div>
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className={`w-full h-2 rounded-lg appearance-none cursor-pointer accent-electric-cyan ${dark ? "bg-white/20" : "bg-zinc-200"}`}
      data-testid={`roi-input-${id}`}
    />
    <div
      className={`flex justify-between text-[9px] tracking-wider ${dark ? "text-zinc-500" : "text-zinc-400"}`}
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      <span>{min}</span>
      <span>{max}</span>
    </div>
  </div>
);

const RoiCalculator = ({ t }) => {
  const [team, setTeam] = React.useState(50);
  const [cycleWeeks, setCycleWeeks] = React.useState(2);

  const EFFICIENCY_GAIN = 0.15;
  const BUG_REDUCTION = 0.4;
  const COST_PER_BUG = 5000;
  const BUGS_PER_YEAR_BASE = 12;

  const savings = React.useMemo(() => {
    const efficiencySavings = team * 80000 * EFFICIENCY_GAIN;
    const bugSavings = team * BUGS_PER_YEAR_BASE * BUG_REDUCTION * COST_PER_BUG;
    const cycleBonus = (4 / Math.max(cycleWeeks, 1)) * 0.1;
    return Math.round((efficiencySavings + bugSavings) * (1 + cycleBonus));
  }, [team, cycleWeeks]);

  const fmtSavings = (n) =>
    n.toLocaleString("es-ES", { maximumFractionDigits: 0 }) + "€";

  const barData = [
    { h: 40, active: false },
    { h: 60, active: false },
    { h: 50, active: false },
    { h: 95, active: true },
    { h: 55, active: false },
  ];

  return (
    <section
      id="roi-calculator"
      className="py-24 bg-deep-navy text-white relative overflow-hidden"
      data-testid="roi-calculator-section"
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background:
            "radial-gradient(circle at 20% 50%, #00E5FF 0%, transparent 50%)",
        }}
      />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left: headline + sliders */}
        <div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black mb-6 tracking-tighter"
            style={{ fontFamily: "'Chivo', sans-serif" }}
          >
            {t("landing.roi_title_simple")}
          </h2>
          <p className="text-lg text-zinc-400 mb-12 max-w-lg">
            {t("landing.roi_subtitle")}
          </p>

          <div className="space-y-8 max-w-md">
            <Slider
              id="team"
              label={t("landing.roi_input_team")}
              value={team}
              min={5}
              max={200}
              onChange={setTeam}
              suffix={t("landing.roi_input_team_suffix")}
              dark
            />
            <Slider
              id="cycle"
              label={t("landing.roi_input_cycle")}
              value={cycleWeeks}
              min={1}
              max={8}
              onChange={setCycleWeeks}
              suffix={t("landing.roi_input_cycle_suffix")}
              dark
            />
          </div>
        </div>

        {/* Right: savings card */}
        <div className="p-10 rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-xl text-center">
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em] text-electric-cyan mb-4"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {t("landing.roi_estimated_label")}
          </p>
          <div
            className="text-5xl sm:text-6xl font-black text-white mb-4"
            style={{ fontFamily: "'Chivo', sans-serif" }}
            data-testid="roi-annual-savings"
          >
            {fmtSavings(savings)}
          </div>
          <p className="text-sm text-zinc-400 mb-8">
            {t("landing.roi_savings_caption")}
          </p>

          {/* Bar chart */}
          <div className="w-full h-40 flex items-end justify-center gap-4 mb-8">
            {barData.map((bar, i) => (
              <div
                key={i}
                className={`w-12 rounded-t-lg transition-all duration-500 ${
                  bar.active
                    ? "bg-electric-cyan shadow-[0_0_30px_rgba(0,229,255,0.4)]"
                    : "bg-white/10"
                }`}
                style={{ height: `${bar.h}%` }}
              />
            ))}
          </div>

          <Link to="/login">
            <Button className="bg-electric-cyan text-deep-navy px-10 py-4 rounded-xl font-bold shadow-xl hover:bg-white transition-all">
              {t("landing.roi_cta_report")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

// ======================================================================
// MAIN LANDING PAGE
// ======================================================================

const LandingPage = () => {
  const { t, lang } = useI18n();

  React.useEffect(() => {
    track("page_view");
  }, []);

  return (
    <div className="min-h-screen bg-white text-zinc-900 overflow-x-hidden">
      {/* ========== TOP NAV BAR ========== */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/70 border-b border-zinc-200/50 shadow-sm">
        <div className="flex justify-between items-center h-20 px-6 lg:px-16 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-deep-navy rounded-lg flex items-center justify-center">
              <span
                className="text-white font-black text-sm"
                style={{ fontFamily: "'Chivo', sans-serif" }}
              >
                SDD
              </span>
            </div>
            <span
              className="font-black text-xl text-deep-navy"
              style={{ fontFamily: "'Chivo', sans-serif" }}
            >
              SDD-IA
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#roi-calculator"
              className="text-sm font-semibold text-deep-navy border-b-2 border-deep-navy pb-1"
            >
              {t("landing.v2.footer_product")}
            </a>
            <a
              href="#pillars"
              className="text-sm text-zinc-500 hover:text-deep-navy transition-colors"
            >
              {t("landing.v2.pillars_explore")}
            </a>
            <a
              href="#pricing"
              className="text-sm text-zinc-500 hover:text-deep-navy transition-colors"
            >
              {t("landing.roi_cta_pricing")}
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Link
              to="/login"
              className="hidden lg:block text-deep-navy text-sm font-semibold hover:opacity-80 transition-all"
            >
              {t("nav.login")}
            </Link>
            <Link to="/login">
              <Button className="bg-gradient-to-r from-deep-navy to-primary text-white px-6 py-3 rounded-lg text-sm font-semibold shadow-lg">
                {t("landing.get_started")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-20">
        {/* ========== HERO SECTION ========== */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-tech-pattern">
          {/* Decorative glows */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-electric-cyan/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />

          <div className="max-w-[1440px] mx-auto px-6 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 px-4 py-2 rounded-full">
                <Zap className="w-4 h-4 text-primary" />
                <span
                  className="text-xs font-semibold uppercase tracking-wider text-primary"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {t("landing.v2.hero_badge")}
                </span>
              </div>

              {/* Headline */}
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-deep-navy leading-tight tracking-tighter"
                style={{ fontFamily: "'Chivo', sans-serif" }}
              >
                <span className="block">{t("landing.v2.hero_h1_line1")}</span>
                <span className="gradient-text">
                  {t("landing.v2.hero_h1_line2")}
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg text-zinc-500 max-w-xl leading-relaxed">
                {t("landing.v2.hero_subtitle")}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to="/login">
                  <Button className="bg-deep-navy text-white px-8 py-4 rounded-xl text-sm font-semibold flex items-center gap-3 shadow-xl hover:shadow-primary/20 transition-all">
                    {t("landing.v2.hero_cta_demo")}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <a href="#roi-calculator">
                  <Button
                    variant="outline"
                    className="border-2 border-deep-navy text-deep-navy px-8 py-4 rounded-xl text-sm font-semibold flex items-center gap-3 hover:bg-deep-navy hover:text-white transition-all"
                  >
                    <Play className="w-4 h-4" />
                    {t("landing.v2.hero_cta_video")}
                  </Button>
                </a>
              </div>
            </div>

            {/* Hero glass card */}
            <div className="relative hidden lg:block">
              <div className="relative z-10 glass-card p-4 rounded-3xl border border-white/50 ai-glow overflow-hidden">
                {/* Mock dashboard */}
                <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-deep-navy to-primary/80 flex items-center justify-center p-6">
                  <div className="w-full space-y-4">
                    {/* Top bar */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                      <div className="flex-1 h-6 bg-white/10 rounded-md ml-4" />
                    </div>
                    {/* Cards row */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-white/10 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded bg-electric-cyan/40" />
                          <div className="h-2 flex-1 bg-white/20 rounded" />
                        </div>
                        <div className="h-2 w-3/4 bg-white/10 rounded" />
                        <div className="text-lg font-black text-electric-cyan" style={{ fontFamily: "'Chivo', sans-serif" }}>24</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded bg-emerald-400/40" />
                          <div className="h-2 flex-1 bg-white/20 rounded" />
                        </div>
                        <div className="h-2 w-2/3 bg-white/10 rounded" />
                        <div className="text-lg font-black text-emerald-400" style={{ fontFamily: "'Chivo', sans-serif" }}>98%</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded bg-amber-400/40" />
                          <div className="h-2 flex-1 bg-white/20 rounded" />
                        </div>
                        <div className="h-2 w-1/2 bg-white/10 rounded" />
                        <div className="text-lg font-black text-amber-400" style={{ fontFamily: "'Chivo', sans-serif" }}>3</div>
                      </div>
                    </div>
                    {/* Chart area */}
                    <div className="bg-white/10 rounded-lg p-4">
                      <div className="flex items-end gap-2 h-20">
                        <div className="flex-1 bg-electric-cyan/50 rounded-t" style={{ height: "40%" }} />
                        <div className="flex-1 bg-electric-cyan/50 rounded-t" style={{ height: "65%" }} />
                        <div className="flex-1 bg-electric-cyan/50 rounded-t" style={{ height: "50%" }} />
                        <div className="flex-1 bg-electric-cyan rounded-t" style={{ height: "90%" }} />
                        <div className="flex-1 bg-electric-cyan/50 rounded-t" style={{ height: "70%" }} />
                        <div className="flex-1 bg-electric-cyan/50 rounded-t" style={{ height: "55%" }} />
                        <div className="flex-1 bg-electric-cyan/50 rounded-t" style={{ height: "80%" }} />
                      </div>
                    </div>
                    {/* Bottom row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/10 rounded-lg p-3 space-y-1.5">
                        <div className="h-2 w-12 bg-white/20 rounded" />
                        <div className="flex gap-1">
                          <div className="h-4 flex-1 bg-emerald-400/40 rounded" />
                          <div className="h-4 flex-1 bg-electric-cyan/30 rounded" />
                          <div className="h-4 w-6 bg-red-400/30 rounded" />
                        </div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-3 space-y-1.5">
                        <div className="h-2 w-16 bg-white/20 rounded" />
                        <div className="flex gap-1">
                          <div className="h-4 flex-1 bg-electric-cyan/40 rounded" />
                          <div className="h-4 flex-1 bg-emerald-400/30 rounded" />
                          <div className="h-4 flex-1 bg-amber-400/30 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Verified badge */}
                <div className="absolute bottom-4 left-4 right-4 glass-card p-4 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-electric-cyan/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-electric-cyan" />
                  </div>
                  <div>
                    <p
                      className="text-xs font-bold text-deep-navy"
                      style={{ fontFamily: "'Chivo', sans-serif" }}
                    >
                      {t("landing.v2.hero_ai_check")}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      {t("landing.v2.hero_ai_verified")}
                    </p>
                  </div>
                  <div className="ml-auto bg-electric-cyan text-white px-3 py-1 rounded-full text-[10px] font-bold">
                    {t("landing.v2.hero_ai_badge")}
                  </div>
                </div>
              </div>
              {/* Spinning border */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-primary/5 rounded-full animate-[spin_60s_linear_infinite]" />
            </div>
          </div>
        </section>

        {/* ========== FROM CHAOS TO CLARITY ========== */}
        <section className="py-24 bg-white">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
            <div className="text-center mb-16 space-y-4">
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-deep-navy tracking-tighter"
                style={{ fontFamily: "'Chivo', sans-serif" }}
              >
                {t("landing.v2.chaos_label")}
              </h2>
              <p className="text-base text-zinc-500 max-w-2xl mx-auto">
                {t("landing.v2.chaos_subtitle")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* The Mess */}
              <div className="p-10 rounded-3xl bg-zinc-50 border border-zinc-200 relative overflow-hidden">
                <div className="mb-6 flex items-center justify-between">
                  <h3
                    className="text-xl font-black text-deep-navy opacity-60"
                    style={{ fontFamily: "'Chivo', sans-serif" }}
                  >
                    {t("landing.v2.chaos_mess_title")}
                  </h3>
                  <X className="w-8 h-8 text-red-400 opacity-40" />
                </div>
                <ul className="space-y-4">
                  {[
                    {
                      title: t("landing.v2.chaos_mess_1_title"),
                      desc: t("landing.v2.chaos_mess_1_desc"),
                    },
                    {
                      title: t("landing.v2.chaos_mess_2_title"),
                      desc: t("landing.v2.chaos_mess_2_desc"),
                    },
                    {
                      title: t("landing.v2.chaos_mess_3_title"),
                      desc: t("landing.v2.chaos_mess_3_desc"),
                    },
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-4 p-4 rounded-xl bg-white/50 border border-transparent"
                    >
                      <X className="w-4 h-4 text-red-400 mt-1 flex-shrink-0" />
                      <div>
                        <p
                          className="text-sm font-bold text-deep-navy"
                          style={{ fontFamily: "'Chivo', sans-serif" }}
                        >
                          {item.title}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {item.desc}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* The SDD-IA Way */}
              <div className="p-10 rounded-3xl glass-card border-2 border-electric-cyan/20 relative overflow-hidden ai-glow">
                <div className="absolute top-4 right-4">
                  <div className="bg-electric-cyan/10 text-deep-navy px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />{" "}
                    {t("landing.v2.chaos_way_badge")}
                  </div>
                </div>
                <div className="mb-6 flex items-center justify-between">
                  <h3
                    className="text-xl font-black text-deep-navy"
                    style={{ fontFamily: "'Chivo', sans-serif" }}
                  >
                    {t("landing.v2.chaos_way_title")}
                  </h3>
                  <GitBranch className="w-8 h-8 text-electric-cyan" />
                </div>
                <ul className="space-y-4">
                  {[
                    {
                      title: t("landing.v2.chaos_way_1_title"),
                      desc: t("landing.v2.chaos_way_1_desc"),
                    },
                    {
                      title: t("landing.v2.chaos_way_2_title"),
                      desc: t("landing.v2.chaos_way_2_desc"),
                    },
                    {
                      title: t("landing.v2.chaos_way_3_title"),
                      desc: t("landing.v2.chaos_way_3_desc"),
                    },
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10"
                    >
                      <Check className="w-4 h-4 text-electric-cyan mt-1 flex-shrink-0" />
                      <div>
                        <p
                          className="text-sm font-bold text-deep-navy"
                          style={{ fontFamily: "'Chivo', sans-serif" }}
                        >
                          {item.title}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {item.desc}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ========== THREE PILLARS ========== */}
        <section id="pillars" className="py-24">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
              <div className="max-w-xl">
                <h2
                  className="text-3xl sm:text-4xl lg:text-5xl font-black text-deep-navy tracking-tighter"
                  style={{ fontFamily: "'Chivo', sans-serif" }}
                >
                  {t("landing.v2.pillars_title")}
                </h2>
                <p className="text-base text-zinc-500 mt-4">
                  {t("landing.v2.pillars_subtitle")}
                </p>
              </div>
              <a
                href="#features"
                className="text-primary text-sm font-semibold flex items-center gap-2 hover:underline"
              >
                {t("landing.v2.pillars_explore")}{" "}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ModulOW */}
              <div className="group relative p-10 rounded-3xl glass-card hover:bg-white transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <ListChecks className="w-8 h-8 text-primary" />
                </div>
                <h3
                  className="text-xl font-black text-deep-navy mb-4"
                  style={{ fontFamily: "'Chivo', sans-serif" }}
                >
                  {t("landing.v2.pillar_ow_title")}
                </h3>
                <p className="text-base text-zinc-500 mb-8">
                  {t("landing.v2.pillar_ow_desc")}
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Star className="w-3 h-3 text-electric-cyan" />{" "}
                    {t("landing.v2.pillar_ow_feat1")}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Star className="w-3 h-3 text-electric-cyan" />{" "}
                    {t("landing.v2.pillar_ow_feat2")}
                  </div>
                </div>
              </div>

              {/* BPMN */}
              <div className="group relative p-10 rounded-3xl glass-card border-2 border-primary/10 hover:bg-white transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                <div className="w-16 h-16 bg-electric-cyan/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Workflow className="w-8 h-8 text-electric-cyan" />
                </div>
                <h3
                  className="text-xl font-black text-deep-navy mb-4"
                  style={{ fontFamily: "'Chivo', sans-serif" }}
                >
                  {t("landing.v2.pillar_bpmn_title")}
                </h3>
                <p className="text-base text-zinc-500 mb-8">
                  {t("landing.v2.pillar_bpmn_desc")}
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Star className="w-3 h-3 text-electric-cyan" />{" "}
                    {t("landing.v2.pillar_bpmn_feat1")}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Star className="w-3 h-3 text-electric-cyan" />{" "}
                    {t("landing.v2.pillar_bpmn_feat2")}
                  </div>
                </div>
              </div>

              {/* Technical Space */}
              <div className="group relative p-10 rounded-3xl glass-card hover:bg-white transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 bg-deep-navy rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Code2 className="w-8 h-8 text-white" />
                </div>
                <h3
                  className="text-xl font-black text-deep-navy mb-4"
                  style={{ fontFamily: "'Chivo', sans-serif" }}
                >
                  {t("landing.v2.pillar_tech_title")}
                </h3>
                <p className="text-base text-zinc-500 mb-8">
                  {t("landing.v2.pillar_tech_desc")}
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Star className="w-3 h-3 text-electric-cyan" />{" "}
                    {t("landing.v2.pillar_tech_feat1")}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Star className="w-3 h-3 text-electric-cyan" />{" "}
                    {t("landing.v2.pillar_tech_feat2")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== ROI CALCULATOR ========== */}
        <RoiCalculator t={t} />

        {/* ========== PRICING ========== */}
        <section id="pricing" className="py-24 bg-white">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
            <div className="text-center mb-16 space-y-4">
              <p
                className="text-[10px] font-bold tracking-[0.25em] uppercase text-electric-cyan mb-3"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                Planes y Precios
              </p>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-deep-navy tracking-tighter"
                style={{ fontFamily: "'Chivo', sans-serif" }}
              >
                Elige tu plan
              </h2>
              <p className="text-base text-zinc-500 max-w-2xl mx-auto">
                Desde estudiantes hasta grandes empresas. Empieza gratis, escala cuando quieras.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  name: "Free",
                  tagline: "Exploración",
                  price: "0",
                  period: "/ siempre",
                  desc: "Para estudiantes y demos.",
                  features: ["1 proyecto activo", "3 diagramas BPMN", "IA básica", "MoSCoW básico", "Solo lectura"],
                  cta: "Comenzar gratis",
                  link: "/login",
                  highlight: false,
                },
                {
                  name: "Pro",
                  tagline: "Individual",
                  price: "19",
                  period: "/ mes",
                  desc: "Para profesionales individuales.",
                  features: ["Proyectos ilimitados", "Diagramas ilimitados", "IA full (DeepSeek + MiniMax + MiMo)", "OpenSpec / Speckit", "1 branch Git"],
                  cta: "Empezar Pro",
                  link: "/login?plan=pro",
                  highlight: false,
                },
                {
                  name: "Team",
                  tagline: "El Sweet Spot",
                  price: "49",
                  period: "/ mes",
                  desc: "Para equipos que colaboran en tiempo real.",
                  features: ["Todo lo de Pro, más:", "IA con prioridad", "Trazabilidad 360°", "Colaboración WebSocket", "Sync GitHub completa"],
                  cta: "Empezar Team",
                  link: "/login?plan=team",
                  highlight: true,
                  badge: "Más popular",
                },
                {
                  name: "Enterprise",
                  tagline: "Custom",
                  price: "Custom",
                  period: "",
                  desc: "Para organizaciones con compliance y SLA.",
                  features: ["Todo lo de Team, más:", "BYOK + sin límites IA", "Audit Logs + SSO", "On-premise / GitLab", "Account Manager"],
                  cta: "Contactar ventas",
                  link: "/pricing",
                  highlight: false,
                },
              ].map((tier) => (
                <div
                  key={tier.name}
                  className={`relative rounded-2xl border p-8 flex flex-col transition-all hover:-translate-y-1 ${
                    tier.highlight
                      ? "border-electric-cyan/40 glass-card ai-glow shadow-xl"
                      : "border-zinc-200 bg-white hover:shadow-lg"
                  }`}
                >
                  {tier.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-electric-cyan text-deep-navy text-[10px] font-bold px-3 py-1 rounded-full">
                      {tier.badge}
                    </div>
                  )}
                  <div className="mb-6">
                    <p
                      className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      {tier.tagline}
                    </p>
                    <h3
                      className="text-2xl font-black text-deep-navy"
                      style={{ fontFamily: "'Chivo', sans-serif" }}
                    >
                      {tier.name}
                    </h3>
                  </div>
                  <div className="mb-4">
                    {tier.price === "Custom" ? (
                      <span
                        className="text-3xl font-black text-deep-navy"
                        style={{ fontFamily: "'Chivo', sans-serif" }}
                      >
                        Custom
                      </span>
                    ) : (
                      <>
                        <span
                          className="text-4xl font-black text-deep-navy"
                          style={{ fontFamily: "'Chivo', sans-serif" }}
                        >
                          {tier.price === "0" ? "Gratis" : `€${tier.price}`}
                        </span>
                        {tier.period && (
                          <span className="text-sm text-zinc-400 ml-1">{tier.period}</span>
                        )}
                      </>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mb-6">{tier.desc}</p>
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-zinc-600">
                        <Check className="w-3.5 h-3.5 text-electric-cyan mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to={tier.link}>
                    <Button
                      className={`w-full text-sm font-semibold rounded-lg ${
                        tier.highlight
                          ? "bg-deep-navy text-white hover:bg-primary"
                          : "bg-zinc-100 text-deep-navy hover:bg-zinc-200"
                      }`}
                    >
                      {tier.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== TRUST SECTION ========== */}
        <section className="py-16 border-b border-zinc-200/50">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-16 text-center">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500 mb-10"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              {t("landing.v2.trust_label")}
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all">
              {["Jira", "GitHub", "Azure", "AWS", "Figma"].map((name) => (
                <span
                  key={name}
                  className="text-3xl sm:text-4xl font-black text-deep-navy"
                  style={{ fontFamily: "'Chivo', sans-serif" }}
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ========== FINAL CTA ========== */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-tech-pattern opacity-50" />
          <div className="max-w-3xl mx-auto px-6 text-center">
            <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Rocket className="w-10 h-10 text-primary" />
            </div>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-deep-navy tracking-tighter mb-6"
              style={{ fontFamily: "'Chivo', sans-serif" }}
            >
              {t("landing.v2.cta_title")}
            </h2>
            <p className="text-lg text-zinc-500 mb-12">
              {t("landing.v2.cta_subtitle")}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/login">
                <Button className="bg-deep-navy text-white px-10 py-5 rounded-2xl text-sm font-semibold shadow-2xl hover:scale-105 transition-all">
                  {t("landing.v2.cta_pilot")}
                </Button>
              </Link>
              <a href="#pricing">
                <Button
                  variant="outline"
                  className="bg-white border-2 border-primary/10 text-deep-navy px-10 py-5 rounded-2xl text-sm font-semibold hover:bg-primary/5 transition-all"
                >
                  {t("landing.v2.cta_sales")}
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ========== FOOTER ========== */}
      <footer className="w-full py-16 border-t border-zinc-200/50 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-6 lg:px-16 max-w-[1440px] mx-auto">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-deep-navy rounded-lg flex items-center justify-center">
                <span
                  className="text-white font-black text-xs"
                  style={{ fontFamily: "'Chivo', sans-serif" }}
                >
                  SDD
                </span>
              </div>
              <span
                className="font-black text-lg text-deep-navy"
                style={{ fontFamily: "'Chivo', sans-serif" }}
              >
                SDD-IA
              </span>
            </div>
            <p className="text-xs text-zinc-500">
              {t("landing.v2.footer_desc")}
            </p>
          </div>
          <div>
            <h4
              className="text-sm font-bold text-deep-navy mb-4"
              style={{ fontFamily: "'Chivo', sans-serif" }}
            >
              {t("landing.v2.footer_product")}
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#pillars"
                  className="text-xs text-zinc-500 hover:text-primary transition-colors"
                >
                  {t("landing.v2.footer_product")}
                </a>
              </li>
              <li>
                <a
                  href="#roi-calculator"
                  className="text-xs text-zinc-500 hover:text-primary transition-colors"
                >
                  {t("landing.roi_cta_pricing")}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4
              className="text-sm font-bold text-deep-navy mb-4"
              style={{ fontFamily: "'Chivo', sans-serif" }}
            >
              {t("landing.v2.footer_company")}
            </h4>
            <ul className="space-y-3">
              <li>
                <span className="text-xs text-zinc-500">
                  {t("landing.v2.footer_contact")}
                </span>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-xs text-zinc-500 hover:text-primary transition-colors"
                >
                  {t("landing.v2.footer_privacy")}
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-xs text-zinc-500 hover:text-primary transition-colors"
                >
                  {t("landing.v2.footer_terms")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4
              className="text-sm font-bold text-deep-navy mb-4"
              style={{ fontFamily: "'Chivo', sans-serif" }}
            >
              {t("landing.v2.footer_newsletter")}
            </h4>
            <p className="text-xs text-zinc-500 mb-3">
              {t("landing.v2.footer_newsletter_desc")}
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder={t("landing.v2.footer_email_placeholder")}
                className="flex-1 px-3 py-2 text-xs border border-zinc-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
              <button className="bg-deep-navy text-white p-2 rounded-lg hover:bg-primary transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16 mt-12 pt-6 border-t border-zinc-100 text-center">
          <p className="text-xs text-zinc-400">
            {t("landing.v2.footer_rights")}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
