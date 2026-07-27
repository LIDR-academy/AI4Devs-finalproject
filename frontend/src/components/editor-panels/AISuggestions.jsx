// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  Cog,
  GitFork,
  CircleDot,
  Link,
  Zap,
  Layers,
  Sparkles,
  Loader2,
  Play,
} from "lucide-react";

const ACTION_ICONS = {
  add_user_task: UserPlus,
  add_service_task: Cog,
  add_gateway: GitFork,
  add_end: CircleDot,
  connect_existing: Link,
  add_intermediate_event: Zap,
  add_subprocess: Layers,
  optimize_flow: Zap,
  generate_full: Play,
};

export const AISuggestions = ({
  suggestions,
  loading,
  position,
  onApply,
  onDismiss,
  t,
}) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onDismiss?.();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onDismiss]);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onDismiss?.();
      }
    };
    // Delay to avoid closing immediately from the same click that opened
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClick);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [onDismiss]);

  if (!position || (!loading && (!suggestions || suggestions.length === 0))) {
    return null;
  }

  const style = {
    position: "absolute",
    left: `${position.x + 20}px`,
    top: `${position.y - 10}px`,
    zIndex: 50,
  };

  return (
    <div
      ref={ref}
      style={style}
      className="glass-card ai-glow rounded-lg p-2 min-w-[200px] max-w-[280px] animate-in fade-in-0 zoom-in-95 duration-200"
    >
      <div className="flex items-center gap-1.5 px-2 py-1 mb-1">
        <Sparkles className="w-3.5 h-3.5 text-electric-cyan" />
        <span className="text-xs font-medium text-deep-navy">
          {t("editor.ai_suggest.title") || "Sugerencias IA"}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 px-2 py-2">
          <Loader2 className="w-4 h-4 animate-spin text-electric-cyan" />
          <span className="text-xs text-muted-foreground">
            {t("editor.ai_suggest.loading") || "Analizando..."}
          </span>
        </div>
      ) : (
        <div className="space-y-0.5">
          {suggestions.map((s, i) => {
            const Icon = ACTION_ICONS[s.action] || Sparkles;
            return (
              <Button
                key={i}
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 h-8 text-xs font-normal hover:bg-accent-glow hover:text-deep-navy"
                onClick={() => onApply?.(s)}
              >
                <Icon className="w-3.5 h-3.5 text-electric-cyan flex-shrink-0" />
                <span className="truncate">{s.label}</span>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};
