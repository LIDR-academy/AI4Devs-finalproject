// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  History,
  GitBranch,
  CheckCircle,
  AlertTriangle,
  ArrowRightLeft,
  RotateCcw,
  Loader2,
} from "lucide-react";

export const HistorySheet = ({
  open,
  onOpenChange,
  historyTab,
  setHistoryTab,
  versions,
  versionTree,
  diffVersionA,
  setDiffVersionA,
  diffVersionB,
  setDiffVersionB,
  loadingDiff,
  fetchDiff,
  revertToVersion,
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[420px] p-0 flex flex-col">
        <SheetHeader className="p-4 pb-2 border-b">
          <SheetTitle className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            Historial de Versiones
          </SheetTitle>
          <SheetDescription>
            Arbol de versiones, comparacion y reversion
          </SheetDescription>
        </SheetHeader>

        {/* Tabs: Tree / List */}
        <div className="flex gap-1 px-4 pt-3 pb-1">
          <button
            onClick={() => setHistoryTab("tree")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${historyTab === "tree" ? "bg-blue-100 text-blue-700" : "text-zinc-500 hover:bg-zinc-100"}`}
            data-testid="history-tab-tree"
          >
            Arbol
          </button>
          <button
            onClick={() => setHistoryTab("list")}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${historyTab === "list" ? "bg-blue-100 text-blue-700" : "text-zinc-500 hover:bg-zinc-100"}`}
            data-testid="history-tab-list"
          >
            Lista
          </button>
        </div>

        {/* Diff Selector */}
        {versions.length >= 2 && (
          <div className="px-4 py-2 border-b bg-zinc-50">
            <p className="text-xs font-medium text-zinc-600 mb-2">Comparar versiones</p>
            <div className="flex items-center gap-2">
              <select
                value={diffVersionA || ""}
                onChange={(e) => setDiffVersionA(Number(e.target.value) || null)}
                className="flex-1 h-8 text-xs border border-zinc-200 rounded-lg px-2 bg-white"
                data-testid="diff-version-a"
              >
                <option value="">Desde...</option>
                {versions.map((v) => (
                  <option key={v.version_number} value={v.version_number}>v{v.version_number}</option>
                ))}
              </select>
              <ArrowRightLeft className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <select
                value={diffVersionB || ""}
                onChange={(e) => setDiffVersionB(Number(e.target.value) || null)}
                className="flex-1 h-8 text-xs border border-zinc-200 rounded-lg px-2 bg-white"
                data-testid="diff-version-b"
              >
                <option value="">Hasta...</option>
                {versions.map((v) => (
                  <option key={v.version_number} value={v.version_number}>v{v.version_number}</option>
                ))}
              </select>
              <Button
                size="sm"
                variant="outline"
                disabled={!diffVersionA || !diffVersionB || diffVersionA === diffVersionB || loadingDiff}
                onClick={() => fetchDiff(diffVersionA, diffVersionB)}
                className="h-8 text-xs"
                data-testid="compare-versions-btn"
              >
                {loadingDiff ? <Loader2 className="w-3 h-3 animate-spin" /> : "Comparar"}
              </Button>
            </div>
          </div>
        )}

        <ScrollArea className="flex-1">
          {historyTab === "tree" ? (
            <div className="p-4 space-y-0" data-testid="version-tree">
              {versionTree?.nodes?.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-zinc-200" />
                  {versionTree.nodes.map((node) => (
                    <div key={node.id} className="relative flex items-start gap-3 pb-4" data-testid={`tree-node-v${node.version_number}`}>
                      <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                        node.is_current
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                          : "bg-white text-zinc-600 border-zinc-300"
                      }`}>
                        v{node.version_number}
                      </div>
                      <div className={`flex-1 p-2.5 rounded-lg border transition-colors ${
                        node.is_current
                          ? "border-blue-300 bg-blue-50"
                          : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-zinc-900">
                            {node.commit_message || "Sin mensaje"}
                          </span>
                          <div className="flex items-center gap-1">
                            {node.is_current && (
                              <Badge className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0">actual</Badge>
                            )}
                            <Badge
                              variant={node.validation_status === "valid" ? "outline" : "destructive"}
                              className={`text-[10px] px-1.5 py-0 ${
                                node.validation_status === "valid" ? "border-emerald-300 text-emerald-600" : ""
                              }`}
                            >
                              {node.validation_status === "valid" ? (
                                <CheckCircle className="w-2.5 h-2.5 mr-0.5" />
                              ) : (
                                <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                              )}
                              {node.validation_status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-zinc-500">
                          <span>{new Date(node.created_at).toLocaleString("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                          {node.created_by && <span>{node.created_by}</span>}
                        </div>
                        {node.tags?.length > 0 && (
                          <div className="flex gap-1 mt-1.5">
                            {node.tags.map((tg) => (
                              <Badge key={tg} variant="secondary" className="text-[10px] px-1.5 py-0">{tg}</Badge>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-1 mt-2">
                          {!node.is_current && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs px-2"
                              onClick={() => revertToVersion(node.version_number)}
                              data-testid={`revert-to-v${node.version_number}`}
                            >
                              <RotateCcw className="w-3 h-3 mr-1" />Revertir
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs px-2"
                            onClick={() => {
                              const a = node.version_number > 1 ? node.version_number - 1 : 1;
                              setDiffVersionA(a);
                              setDiffVersionB(node.version_number);
                              fetchDiff(a, node.version_number);
                            }}
                            disabled={node.version_number <= 1}
                            data-testid={`diff-from-v${node.version_number}`}
                          >
                            <ArrowRightLeft className="w-3 h-3 mr-1" />Diff
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-zinc-500 py-8">Sin versiones guardadas</p>
              )}

              {/* Branch list */}
              {versionTree?.branches?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-zinc-200">
                  <p className="text-xs font-semibold text-zinc-600 mb-2">Ramas</p>
                  {versionTree.branches.map((b) => (
                    <div key={b.id} className="flex items-center gap-2 p-2 rounded-lg border border-zinc-200 mb-1.5">
                      <GitBranch className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-medium flex-1">{b.name}</span>
                      <Badge variant={b.status === "active" ? "default" : "secondary"} className="text-[10px]">
                        {b.is_merged ? "merged" : b.status}
                      </Badge>
                      <span className="text-[10px] text-zinc-400">desde v{b.base_version}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* List View */
            <div className="p-4 space-y-3">
              {versions.map((version) => (
                <div key={version.id} className="p-3 border border-zinc-200 rounded-lg" data-testid={`version-list-v${version.version_number}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Version {version.version_number}</span>
                    <Badge
                      variant={version.validation_status === "valid" ? "default" : "destructive"}
                      className={version.validation_status === "valid" ? "bg-emerald-100 text-emerald-700" : ""}
                    >
                      {version.validation_status === "valid" ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 mr-1" />
                      )}
                      {version.validation_status}
                    </Badge>
                  </div>
                  <p className="text-sm text-zinc-600 mb-2">
                    {version.commit_message || "Sin mensaje"}
                  </p>
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>{new Date(version.created_at).toLocaleString()}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => revertToVersion(version.version_number)}
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Revertir
                    </Button>
                  </div>
                </div>
              ))}
              {versions.length === 0 && (
                <p className="text-center text-zinc-500 py-8">Sin versiones guardadas</p>
              )}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
