// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API } from "@/App";
import { getAuthHeaders } from "@/lib/api";
import { Crown, ArrowRight, X } from "lucide-react";

const CACHE_KEY = "free_plan_usage";
const CACHE_TTL = 60_000; // 60 seconds

const FreePlanBanner = () => {
  const [usage, setUsage] = useState(null);
  const [dismissed, setDismissed] = useState(() => {
    return sessionStorage.getItem("free_banner_dismissed") === "true";
  });

  useEffect(() => {
    let cancelled = false;

    // Check cache first
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < CACHE_TTL) {
          setUsage(data);
          return;
        }
      } catch { /* stale cache, refetch */ }
    }

    (async () => {
      try {
        const res = await fetch(`${API}/projects/usage`, { headers: getAuthHeaders() });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setUsage(data);
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, ts: Date.now() }));
        }
      } catch {
        // silent -- banner just stays hidden
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const dismiss = () => {
    sessionStorage.setItem("free_banner_dismissed", "true");
    setDismissed(true);
  };

  if (!usage || !usage.is_free || dismissed) return null;

  const { usage: u, limits: l } = usage;
  const projectsPct = Math.min(100, Math.round((u.projects / l.max_projects) * 100));
  const diagramsPct = Math.min(100, Math.round((u.diagrams_max_in_project / l.max_diagrams_per_project) * 100));
  const atLimit = u.projects >= l.max_projects || u.diagrams_max_in_project >= l.max_diagrams_per_project;

  return (
    <div
      className={`relative border-l-4 ${
        atLimit ? "border-red-500 bg-red-50/40" : "border-blue-500 bg-blue-50/40"
      } px-4 py-2.5 text-sm flex items-center gap-3 flex-wrap`}
      data-testid="free-plan-banner"
      role="status"
      aria-label="Estado del plan gratuito"
    >
      <Crown
        className={`w-4 h-4 flex-shrink-0 ${atLimit ? "text-red-600" : "text-blue-600"}`}
        strokeWidth={2.5}
        aria-hidden="true"
      />

      <span
        className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-600"
        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
      >
        Plan Free
      </span>

      <div className="flex items-center gap-4 flex-1 min-w-[280px]">
        {/* Projects usage */}
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-semibold text-zinc-700"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            data-testid="banner-usage-projects"
          >
            {u.projects}/{l.max_projects} proyectos
          </span>
          <div className="w-16 h-1 bg-zinc-200" role="progressbar" aria-valuenow={projectsPct} aria-valuemin={0} aria-valuemax={100} aria-label={`${projectsPct}% de proyectos usados`}>
            <div
              className={`h-full transition-all ${
                projectsPct >= 100 ? "bg-red-500" : "bg-blue-500"
              }`}
              style={{ width: `${projectsPct}%` }}
            />
          </div>
        </div>

        {/* Diagrams usage (max in any project) */}
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-semibold text-zinc-700"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            data-testid="banner-usage-diagrams"
          >
            {u.diagrams_max_in_project}/{l.max_diagrams_per_project} diagramas
          </span>
          <div className="w-16 h-1 bg-zinc-200" role="progressbar" aria-valuenow={diagramsPct} aria-valuemin={0} aria-valuemax={100} aria-label={`${diagramsPct}% de diagramas usados`}>
            <div
              className={`h-full transition-all ${
                diagramsPct >= 100 ? "bg-red-500" : "bg-blue-500"
              }`}
              style={{ width: `${diagramsPct}%` }}
            />
          </div>
        </div>
      </div>

      <Link to="/pricing#pro" data-testid="banner-upgrade-link">
        <button
          className={`px-3 py-1 text-[10px] font-bold tracking-[0.15em] uppercase border-2 transition-colors flex items-center gap-1.5 ${
            atLimit
              ? "bg-red-600 text-white border-red-600 hover:bg-deep-navy hover:border-zinc-900"
              : "bg-blue-600 text-white border-blue-600 hover:bg-deep-navy hover:border-zinc-900"
          }`}
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          data-testid="banner-upgrade-btn"
        >
          Sube a Pro
          <ArrowRight className="w-3 h-3" aria-hidden="true" />
        </button>
      </Link>

      <button
        onClick={dismiss}
        className="text-zinc-400 hover:text-zinc-700 transition-colors p-1"
        data-testid="banner-dismiss"
        aria-label="Cerrar banner de plan gratuito"
      >
        <X className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </div>
  );
};

export default FreePlanBanner;
