// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React from "react";

/**
 * Full-screen overlay with animated SDD-IA logo for AI wait screens.
 *
 * Usage:
 *   <AiLoadingOverlay show={isWaiting} statusText="Consultando DeepSeek..." />
 *
 * Props:
 *   show        — boolean, controls visibility
 *   statusText  — main label (IBM Plex Mono, uppercase)
 *   subText     — optional secondary line below the dots
 *   logoSize    — "sm" | "md" | "lg" (default "md")
 */
export default function AiLoadingOverlay({
  show = false,
  statusText = "Procesando...",
  subText = "",
  logoSize = "md",
}) {
  if (!show) return null;

  const logoDims = { sm: 64, md: 96, lg: 128 };
  const dim = logoDims[logoSize] || 96;
  const ringInset = dim * -0.18;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/85 backdrop-blur-sm"
      data-testid="ai-loading-overlay"
    >
      <div className="rounded-lg border border-zinc-200 bg-white shadow-lg p-10 max-w-sm w-full text-center">
        {/* Animated logo + ring */}
        <div className="relative inline-block" style={{ width: dim, height: dim }}>
          {/* Spinning dashed ring */}
          <div
            className="absolute rounded-full border-[3px] border-dashed border-blue-600"
            style={{
              inset: ringInset,
              animation: "ai-ring-spin 4s linear infinite",
            }}
          />
          {/* Outer pulse ring */}
          <div
            className="absolute inset-[-2px] rounded-full border-2 border-blue-400/30"
            style={{ animation: "ai-outer-pulse 2s ease-in-out infinite" }}
          />
          {/* Logo */}
          <img
            src="/logotransperente.png"
            alt="SDD-IA"
            className="w-full h-full object-contain relative z-10"
            style={{ animation: "ai-logo-breathe 2.5s ease-in-out infinite" }}
          />
        </div>

        {/* Status */}
        <p
          className="mt-6 font-bold text-xs sm:text-sm uppercase tracking-[0.2em] text-zinc-900"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          data-testid="ai-loading-status"
        >
          {statusText}
        </p>

        {/* Animated dots */}
        <div className="flex justify-center gap-1.5 mt-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="inline-block w-2 h-2 bg-blue-600"
              style={{
                animation: `ai-dot-bounce 1.2s ${i * 0.15}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-4 w-full h-1.5 bg-zinc-200 overflow-hidden">
          <div
            className="h-full bg-blue-600"
            style={{ animation: "ai-progress-slide 2s ease-in-out infinite" }}
          />
        </div>

        {/* Optional sub-text */}
        {subText && (
          <p
            className="mt-3 text-[11px] text-zinc-500 leading-relaxed"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            {subText}
          </p>
        )}
      </div>

      {/* Injected keyframes — idempotent */}
      <style>{`
        @keyframes ai-ring-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes ai-outer-pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50%      { opacity: 0.6; transform: scale(1.04); }
        }
        @keyframes ai-logo-breathe {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.04); }
        }
        @keyframes ai-dot-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%           { transform: translateY(-6px); }
        }
        @keyframes ai-progress-slide {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
