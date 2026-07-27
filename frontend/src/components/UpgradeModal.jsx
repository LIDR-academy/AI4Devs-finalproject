// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/contexts/I18nContext";
import { Lock, Zap, FileCode, Sparkles, Code2, Puzzle, Download } from "lucide-react";

const LIMIT_ICONS = {
  diagrams: FileCode,
  ai: Sparkles,
  oop: Code2,
  components: Puzzle,
  export: Download,
};

const LIMIT_COLORS = {
  diagrams: "text-blue-600 bg-blue-100",
  ai: "text-amber-600 bg-amber-100",
  oop: "text-violet-600 bg-violet-100",
  components: "text-emerald-600 bg-emerald-100",
  export: "text-rose-600 bg-rose-100",
};

export const UpgradeModal = ({ open, onClose, limitType, limitMax, limitCurrent }) => {
  const { t } = useI18n();
  const Icon = LIMIT_ICONS[limitType] || Lock;
  const colorClass = LIMIT_COLORS[limitType] || "text-zinc-600 bg-zinc-100";

  const getMessage = () => {
    const key = `limits.${limitType}`;
    const raw = t(key);
    return raw.replace("{max}", limitMax || "");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="upgrade-modal">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className={`w-16 h-16 flex items-center justify-center ${colorClass}`}>
              <Icon className="w-8 h-8" />
            </div>
          </div>
          <DialogTitle className="text-center text-lg">
            {t("limits.upgrade_title")}
          </DialogTitle>
          <DialogDescription className="text-center text-sm mt-2 leading-relaxed">
            {getMessage()}
          </DialogDescription>
        </DialogHeader>

        {limitType !== "export" && limitMax && (
          <div className="mx-auto w-full max-w-xs">
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              <span>{limitCurrent || 0} / {limitMax}</span>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 rounded-lg border-red-300 text-red-600 font-bold">
                MAX
              </Badge>
            </div>
            <div className="w-full h-2 bg-zinc-100 overflow-hidden">
              <div
                className="h-full bg-red-500 transition-all"
                style={{ width: `${Math.min(100, ((limitCurrent || 0) / (limitMax || 1)) * 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="bg-zinc-50 border border-zinc-200 p-4 space-y-2 mt-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
            <Zap className="w-4 h-4 text-amber-500" />
            Plan Suscripcion
          </div>
          <ul className="text-xs text-zinc-600 space-y-1 ml-6 list-disc">
            <li>Diagrams: Unlimited</li>
            <li>AI: Unlimited</li>
            <li>OOP Classes: Unlimited</li>
            <li>Components: Unlimited</li>
            <li>Export: Full access</li>
          </ul>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={onClose} variant="outline" className="rounded-lg w-full" data-testid="upgrade-close-btn">
            {t("common.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
