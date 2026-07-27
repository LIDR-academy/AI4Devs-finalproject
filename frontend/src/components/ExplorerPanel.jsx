// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useRef, useCallback, useEffect } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  ChevronLeft,
  ChevronRight,
  Github,
  Loader2,
  Upload,
  Download,
  FolderOpen,
  ArrowUpRight,
  GripVertical,
  Plus,
  FileText,
  FolderPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import GitHubFileTree from "@/components/GitHubFileTree";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateFileDialog from "@/components/CreateFileDialog";
import { API } from "@/App";
import { getAuthHeaders } from "@/lib/api";
import { toast } from "sonner";

const MIN_WIDTH = 180;
const MAX_WIDTH = 600;
const DEFAULT_WIDTH = 288; // w-72

function ExplorerPanel({
  isOpen,
  onToggle,
  hasRepo,
  repoUrl,
  defaultBranch,
  syncPath,
  lastSync,
  tree,
  loading,
  pushingAll,
  pullingAll,
  onLinkRepo,
  onUnlinkRepo,
  onPush,
  onPull,
  onFileDoubleClick,
  projectId,
}) {
  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH);
  const resizing = useRef(false);
  const asideRef = useRef(null);
  const [createFileOpen, setCreateFileOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [selectedDir, setSelectedDir] = useState(null); // { node, path }
  const [renamingId, setRenamingId] = useState(null); // node._projectFileId or path of item being renamed

  const handleRenameConfirm = async (node, newName) => {
    setRenamingId(null);
    if (!projectId || !node._projectFileId || newName === node.name) return;
    try {
      await fetch(`${API}/projects/${projectId}/files/${node._projectFileId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: newName }),
      });
      toast.success("Renombrado");
      if (onFileDoubleClick) onFileDoubleClick({ name: newName, path: newName, projectId, _refresh: true });
    } catch {
      toast.error("Error al renombrar");
    }
  };

  const handleCreateFile = async (data) => {
    if (!projectId) return;
    const parentId = selectedDir?.node?._projectFileId || null;
    const parentPath = !parentId && selectedDir?.path ? selectedDir.path : null;
    try {
      const res = await fetch(`${API}/projects/${projectId}/files`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ ...data, parent_id: parentId, parent_path: parentPath }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw { status: res.status, detail: errData.detail };
      }
      const created = await res.json();
      toast.success("Archivo creado");
      if (onFileDoubleClick) onFileDoubleClick({ name: data.name, path: data.name, projectId, _refresh: true });
      // Start inline rename after tree refreshes
      setTimeout(() => setRenamingId(created.id), 300);
    } catch (err) {
      const msg = err?.detail || (err?.status === 409 ? "Ya existe un archivo con ese nombre en esta ubicación" : "Error al crear archivo");
      toast.error(msg);
    }
  };

  const handleContextCreateFile = (dirNode, dirPath) => {
    setSelectedDir(dirNode ? { node: dirNode, path: dirPath } : null);
    setCreateFileOpen(true);
  };

  const handleContextCreateFolder = (dirNode, dirPath) => {
    setSelectedDir(dirNode ? { node: dirNode, path: dirPath } : null);
    setCreatingFolder(true);
    setNewFolderName("");
  };

  const handleContextDelete = async (node) => {
    if (!projectId || !node._projectFileId) return;
    const label = node.type === "directory" ? "carpeta" : "archivo";
    setConfirmDelete({ node, label });
    return;
  };

  const doContextDelete = async (node, label) => {
    try {
      await fetch(`${API}/projects/${projectId}/files/${node._projectFileId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      toast.success(`${label} eliminado`);
      if (onFileDoubleClick) onFileDoubleClick({ name: "", path: "", projectId, _refresh: true });
    } catch {
      toast.error(`Error al eliminar ${label}`);
    }
  };

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name || !projectId) { setCreatingFolder(false); setNewFolderName(""); return; }
    const parentId = selectedDir?.node?._projectFileId || null;
    const parentPath = !parentId && selectedDir?.path ? selectedDir.path : null;
    try {
      const res = await fetch(`${API}/projects/${projectId}/files`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ type: "directory", name, parent_id: parentId, parent_path: parentPath }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw { status: res.status, detail: errData.detail };
      }
      const created = await res.json();
      toast.success("Carpeta creada");
      // Refresh tree
      if (onFileDoubleClick) onFileDoubleClick({ name, path: name, projectId, _refresh: true });
      // Start rename mode after tree refreshes
      setTimeout(() => setRenamingId(created.id), 300);
    } catch (err) {
      const msg = typeof err === "object" && err?.detail
        ? err.detail
        : "Error al crear carpeta";
      toast.error(msg);
    }
    setCreatingFolder(false);
    setNewFolderName("");
  };

  const startResize = useCallback((e) => {
    e.preventDefault();
    resizing.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!resizing.current) return;
      const aside = asideRef.current;
      if (!aside) return;
      const rect = aside.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      setPanelWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, newWidth)));
    };
    const onMouseUp = () => {
      if (resizing.current) {
        resizing.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  if (!isOpen) {
    return (
      <div className="w-7 border-r border-zinc-200 bg-white flex flex-col items-center pt-2 flex-shrink-0">
        <button onClick={onToggle} className="p-1 hover:bg-zinc-100" title="Mostrar explorador">
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        </button>
        <span
          className="text-[9px] text-zinc-400 font-semibold uppercase mt-2 tracking-wider"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          Explorador
        </span>
      </div>
    );
  }

  return (
    <>
      <aside
        ref={asideRef}
        className="border-r border-zinc-200 bg-white flex flex-col flex-shrink-0 overflow-hidden relative"
        style={{ width: panelWidth }}
      >
      <div className="border-b border-zinc-200 px-3 py-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <button onClick={onToggle} className="p-0.5 hover:bg-zinc-100" title="Ocultar explorador">
              <ChevronLeft className="w-3.5 h-3.5 text-zinc-400" />
            </button>
            <span
              className="text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-500"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Explorador
            </span>
          </div>
          <div className="flex items-center gap-0.5">
            {/* Add menu — always visible */}
            {projectId && (
              <>
                {creatingFolder ? (
                  <input
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreateFolder();
                      if (e.key === "Escape") { setCreatingFolder(false); setNewFolderName(""); }
                    }}
                    onBlur={handleCreateFolder}
                    placeholder="carpeta..."
                    className="w-16 text-[9px] px-1 py-0 border-b border-zinc-300 focus:border-zinc-900 outline-none bg-transparent"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    autoFocus
                  />
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="p-1 hover:bg-zinc-100"
                        title="Añadir"
                      >
                        <Plus className="w-3 h-3 text-zinc-500" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="rounded-lg border border-zinc-200 shadow-md min-w-[190px]">
                      {selectedDir && (
                        <div className="px-3 py-1 border-b border-zinc-200">
                          <p className="text-[9px] text-zinc-400 uppercase tracking-wider">En:</p>
                          <p className="text-[10px] font-semibold text-zinc-600 truncate">{selectedDir.path}</p>
                        </div>
                      )}
                      <DropdownMenuItem
                        className="rounded-lg text-xs cursor-pointer"
                        onClick={() => setCreateFileOpen(true)}
                      >
                        <FileText className="w-3.5 h-3.5 mr-2" />
                        Nuevo elemento
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="rounded-lg text-xs cursor-pointer"
                        onClick={() => { setCreatingFolder(true); setNewFolderName(""); }}
                      >
                        <FolderPlus className="w-3.5 h-3.5 mr-2" />
                        Nuevo subdirectorio
                      </DropdownMenuItem>
                      {selectedDir && (
                        <div className="px-3 py-1 border-t border-zinc-200">
                          <button
                            type="button"
                            className="text-[9px] text-zinc-400 hover:text-zinc-600"
                            onClick={(e) => { e.stopPropagation(); setSelectedDir(null); }}
                          >
                            Crear en raíz
                          </button>
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}
            {hasRepo && (
              <>
                <button
                  onClick={onPush}
                  disabled={pushingAll}
                  className="p-1 hover:bg-zinc-100 disabled:opacity-30"
                  title="Push all"
                >
                  {pushingAll ? (
                    <Loader2 className="w-3 h-3 text-zinc-500 animate-spin" />
                  ) : (
                    <Upload className="w-3 h-3 text-zinc-500" />
                  )}
                </button>
                <button
                  onClick={onPull}
                  disabled={pullingAll}
                  className="p-1 hover:bg-zinc-100 disabled:opacity-30"
                  title="Pull all"
                >
                  {pullingAll ? (
                    <Loader2 className="w-3 h-3 text-zinc-500 animate-spin" />
                  ) : (
                    <Download className="w-3 h-3 text-zinc-500" />
                  )}
                </button>
              </>
            )}
          </div>
        </div>
        {hasRepo && repoUrl && (
          <div className="flex items-center gap-1.5">
            <Github className="w-3 h-3 text-zinc-500 flex-shrink-0" />
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-blue-600 hover:text-blue-800 truncate flex items-center gap-0.5"
            >
              {repoUrl.replace("https://github.com/", "")}
              <ArrowUpRight className="w-2 h-2 flex-shrink-0" />
            </a>
            {defaultBranch && (
              <Badge variant="outline" className="text-[8px] px-1 py-0 font-mono ml-auto flex-shrink-0">
                {defaultBranch}
              </Badge>
            )}
          </div>
        )}
        {lastSync && (
          <p className="text-[9px] text-zinc-400 mt-0.5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            Sync: {new Date(lastSync).toLocaleString("es-ES")}
          </p>
        )}
      </div>

      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center h-full gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
            <span className="text-xs text-zinc-400">Cargando...</span>
          </div>
        ) : !tree || !tree.children || tree.children.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center gap-2">
            {!hasRepo && (
              <>
                <FolderOpen className="w-8 h-8 text-zinc-300 mb-1" />
                <p className="text-xs text-zinc-500">Sin repositorio vinculado</p>
                <Button size="sm" variant="outline" onClick={onLinkRepo} className="text-[10px] h-7">
                  <Github className="w-3 h-3 mr-1" />
                  Vincular
                </Button>
              </>
            )}
            <p className="text-xs text-zinc-400 italic">Arbol vacio</p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-2">
              <GitHubFileTree
                tree={tree}
                loading={false}
                maxHeight="none"
                defaultOpen
                onFileDoubleClick={onFileDoubleClick}
                onDirClick={setSelectedDir}
                selectedDirPath={selectedDir?.path}
                onContextCreateFile={handleContextCreateFile}
                onContextCreateFolder={handleContextCreateFolder}
                onContextDelete={handleContextDelete}
                onRenameConfirm={handleRenameConfirm}
                renamingId={renamingId}
                onStartRename={setRenamingId}
              />
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Resize handle */}
      <div
        className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-blue-400 active:bg-blue-500 transition-colors z-10"
        onMouseDown={startResize}
        title="Redimensionar"
      >
        <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1.5 h-8 flex items-center justify-center pointer-events-none">
          <GripVertical className="w-1 h-4 text-zinc-300" />
        </div>
      </div>
    </aside>

      {/* Create File Dialog */}
      <CreateFileDialog
        open={createFileOpen}
        onClose={() => setCreateFileOpen(false)}
        onCreate={handleCreateFile}
        files={[]}
        parentId={selectedDir?.node?._projectFileId || null}
        parentPath={!selectedDir?.node?._projectFileId ? selectedDir?.path : null}
      />
    <ConfirmDialog
      open={!!confirmDelete}
      onOpenChange={(open) => { if (!open) setConfirmDelete(null); }}
      title={`Eliminar ${confirmDelete?.label || "elemento"}`}
      description={`¿Eliminar ${confirmDelete?.label} "${confirmDelete?.node?.name}"?${confirmDelete?.node?.type === "directory" ? " Se eliminará todo su contenido." : ""}`}
      onConfirm={() => { doContextDelete(confirmDelete.node, confirmDelete.label); setConfirmDelete(null); }}
    />
    </>
  );
}

export default React.memo(ExplorerPanel);
