// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Loader2 } from "lucide-react";

export const AIGeneratorDialog = ({
  open,
  onOpenChange,
  aiPrompt,
  setAIPrompt,
  generating,
  onGenerate,
  t,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("editor.ai_dialog_title")}</DialogTitle>
          <DialogDescription>{t("editor.ai_dialog_desc")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={aiPrompt}
            onChange={(e) => setAIPrompt(e.target.value)}
            placeholder="Ej: Proceso de aprobacion de vacaciones con revision del manager y notificacion por email..."
            rows={5}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={onGenerate} disabled={generating} className="bg-blue-600 hover:bg-blue-700">
            {generating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            {t("editor.generate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
