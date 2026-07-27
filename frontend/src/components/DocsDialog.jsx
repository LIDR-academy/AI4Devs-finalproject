// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect } from "react";
import { API } from "@/App";
import { downloadText } from "@/lib/downloadFile";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Copy, Download } from "lucide-react";
import { toast } from "sonner";

export const DocsDialog = ({ open, onOpenChange, diagramId, getAuthHeaders }) => {
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && diagramId) fetchDocs();
  }, [open, diagramId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API}/diagrams/${diagramId}/generate-docs`, {
        method: "POST", headers: getAuthHeaders()
      });
      if (resp.ok) {
        const data = await resp.json();
        setMarkdown(data.markdown || "");
      }
    } catch (_) {}
    setLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdown);
    toast.success("Documentacion copiada al portapapeles");
  };

  const downloadMd = () => {
    downloadText(markdown, "bpmn-documentation.md", "text/markdown");
  };

  // Simple markdown renderer (index keys acceptable: list derived from split, never mutated independently)
  const renderMarkdown = (md) => {
    return md.split("\n").map((line, i) => {
      const key = `md-${i}`;
      if (line.startsWith("# ")) return <h1 key={key} className="text-xl font-bold text-slate-900 mb-2">{line.slice(2)}</h1>;
      if (line.startsWith("## ")) return <h2 key={key} className="text-lg font-semibold text-slate-800 mt-4 mb-2">{line.slice(3)}</h2>;
      if (line.startsWith("### ")) return <h3 key={key} className="text-base font-semibold text-slate-700 mt-3 mb-1">{line.slice(4)}</h3>;
      if (line.startsWith("| ")) {
        const cells = line.split("|").filter(c => c.trim());
        if (cells.every(c => /^-+$/.test(c.trim()))) return null;
        return (
          <div key={key} className="flex text-xs font-mono">
            {cells.map((cell, j) => (
              <span key={`${key}-c${j}`} className="flex-1 px-2 py-0.5 border-b border-slate-100">{cell.trim()}</span>
            ))}
          </div>
        );
      }
      if (line.startsWith("- ")) return <li key={key} className="text-sm text-slate-700 ml-4 list-disc">{line.slice(2)}</li>;
      if (line.startsWith("**")) return <p key={key} className="text-sm text-slate-600"><strong>{line.replace(/\*\*/g, "")}</strong></p>;
      if (line.startsWith("---")) return <hr key={key} className="my-3 border-slate-200" />;
      if (line.trim() === "") return <div key={key} className="h-2" />;
      return <p key={key} className="text-sm text-slate-700">{line}</p>;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-violet-600" />
            Documentacion del Diagrama
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <ScrollArea className="max-h-[55vh] pr-2">
            <div className="prose prose-sm max-w-none">
              {renderMarkdown(markdown)}
            </div>
          </ScrollArea>
        )}

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={copyToClipboard} data-testid="docs-copy-btn">
            <Copy className="w-4 h-4 mr-2" />
            Copiar
          </Button>
          <Button variant="outline" size="sm" onClick={downloadMd} data-testid="docs-download-btn">
            <Download className="w-4 h-4 mr-2" />
            Descargar .md
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
