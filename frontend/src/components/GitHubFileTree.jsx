// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useCallback, useEffect, useRef } from "react";
import { getEditorForFile, registerBpmnAsDiagram } from "@/lib/fileEditors";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  File,
  FileCode,
  FileText,
  FileJson,
  Loader2,
  FilePlus,
  FolderPlus,
  Pencil,
  Trash2,
} from "lucide-react";

const FILE_STYLES = {
  ".bpmn": { icon: FileCode, color: "text-rose-500" },
  ".md": { icon: FileText, color: "text-blue-500" },
  ".json": { icon: FileJson, color: "text-amber-600" },
};

function FileIcon({ name }) {
  const ext = name.slice(name.lastIndexOf("."));
  const style = FILE_STYLES[ext] || { icon: File, color: "text-zinc-400" };
  const Icon = style.icon;
  return <Icon className={`w-4 h-4 flex-shrink-0 ${style.color}`} />;
}

function TreeNode({
  node, defaultOpen = false, onFileDoubleClick, onDirClick,
  selectedDirPath, parentPath, onContextCreateFile, onContextCreateFolder,
  onContextRename, onContextDelete, onRenameConfirm,
  renamingId, onStartRename,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [ctxMenu, setCtxMenu] = useState(null);
  const isDir = node.type === "directory";
  const pathParts = parentPath ? parentPath.split("/").filter(Boolean) : [];
  const children = node.children || [];
  const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;
  const isSelected = selectedDirPath === currentPath;
  const indent = pathParts.length * 12 + 4;
  const ctxRef = useRef(null);
  const renameInputRef = useRef(null);
  const isRenaming = renamingId === (node._projectFileId || currentPath);

  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      const dotIdx = node.name.lastIndexOf(".");
      if (dotIdx > 0 && node.type === "file") {
        renameInputRef.current.setSelectionRange(0, dotIdx);
      } else {
        renameInputRef.current.select();
      }
    }
  }, [isRenaming, node.name, node.type]);

  useEffect(() => {
    if (!ctxMenu) return;
    const close = (e) => {
      if (ctxRef.current && !ctxRef.current.contains(e.target)) {
        setCtxMenu(null);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [ctxMenu]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCtxMenu({ x: e.clientX, y: e.clientY });
    if (isDir && onDirClick) onDirClick({ node, path: currentPath });
  };

  const closeCtx = () => setCtxMenu(null);

  const handleRenameKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newName = e.target.value.trim();
      if (newName && newName !== node.name && onRenameConfirm) {
        onRenameConfirm(node, newName);
      } else if (onStartRename) {
        onStartRename(null);
      }
    }
    if (e.key === "Escape") {
      if (onStartRename) onStartRename(null);
    }
  };

  const handleRenameBlur = (e) => {
    const newName = e.target.value.trim();
    if (newName && newName !== node.name && onRenameConfirm) {
      onRenameConfirm(node, newName);
    } else if (onStartRename) {
      onStartRename(null);
    }
  };

  // Determine if node can be renamed (has _projectFileId or is a project_files node)
  const canRename = !!node._projectFileId;

  return (
    <div className="select-none">
      {isRenaming ? (
        <div
          className="flex items-center gap-1.5 py-[3px] px-2"
          style={{ paddingLeft: `${indent + (isDir ? 0 : 20)}px` }}
        >
          {isDir ? (
            <Folder className="w-4 h-4 flex-shrink-0 text-amber-500" />
          ) : (
            <FileIcon name={node.name} />
          )}
          <input
            ref={renameInputRef}
            defaultValue={node.name}
            onKeyDown={handleRenameKey}
            onBlur={handleRenameBlur}
            className="flex-1 text-xs px-1 py-0 border border-blue-400 bg-blue-50 outline-none rounded-lg"
            style={{ fontFamily: "'Work Sans', system-ui, sans-serif" }}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            if (isDir) {
              setOpen((v) => !v);
              if (onDirClick) onDirClick({ node, path: currentPath });
            }
          }}
          onDoubleClick={() => {
            const editor = getEditorForFile(node.name);
            if (editor?.type === 'route' && !isDir) {
              const url = editor.getUrl({ name: node.name, diagramId: node.diagramId, _projectFileId: node._projectFileId });
              if (url) {
                if (editor.newTab) window.open(url, '_blank');
                return;
              }
            }
            // Fallback: delegate to parent callback
            if (!isDir && onFileDoubleClick) {
              onFileDoubleClick({ name: node.name, path: currentPath, diagramId: node.diagramId, _projectFileId: node._projectFileId, content: node.content });
            }
            // Double-click a dir or file with _projectFileId to start rename
            if (canRename && onStartRename) {
              onStartRename(node._projectFileId || currentPath);
            }
          }}
          onContextMenu={handleContextMenu}
          className={`flex items-center gap-1.5 py-[3px] px-2 w-full text-left transition-colors group ${
            isSelected
              ? "bg-blue-100 hover:bg-blue-100"
              : "hover:bg-zinc-100"
          } ${!isDir ? "cursor-pointer" : ""}`}
          style={{ paddingLeft: `${indent}px` }}
        >
          {isDir ? (
            <>
              {open ? (
                <ChevronDown className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-blue-600" : "text-zinc-500"}`} />
              ) : (
                <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-blue-600" : "text-zinc-500"}`} />
              )}
              {open ? (
                <FolderOpen className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-blue-600" : "text-amber-500"}`} />
              ) : (
                <Folder className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-blue-600" : "text-amber-500"}`} />
              )}
              <span className={`text-xs truncate ${isSelected ? "text-blue-800 font-semibold" : "text-zinc-700"}`}>
                {node.name}
              </span>
              {children.length > 0 && (
                <span className="text-[10px] text-zinc-400 ml-auto flex-shrink-0 font-mono">
                  {children.length}
                </span>
              )}
            </>
          ) : (
            <>
              <FileIcon name={node.name} />
              <span className="text-xs text-zinc-700 truncate">{node.name}</span>
            </>
          )}
        </button>
      )}

      {/* Context menu */}
      {ctxMenu && (
        <div
          ref={ctxRef}
          className="fixed z-50 bg-white border border-zinc-200 shadow-lg py-1 min-w-[160px]"
          style={{ left: ctxMenu.x, top: ctxMenu.y }}
        >
          <div className="px-3 py-1">
            <p className="text-[9px] text-zinc-400 uppercase tracking-wider font-semibold mb-0.5">Nuevo</p>
            <button
              type="button"
              className="flex items-center gap-2 w-full text-left px-2 py-1 text-xs hover:bg-zinc-100 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                closeCtx();
                if (onContextCreateFile) onContextCreateFile(node, currentPath);
              }}
            >
              <FilePlus className="w-3.5 h-3.5 text-blue-500" />
              Elemento
            </button>
            {isDir && (
              <button
                type="button"
                className="flex items-center gap-2 w-full text-left px-2 py-1 text-xs hover:bg-zinc-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  closeCtx();
                  if (onContextCreateFolder) onContextCreateFolder(node, currentPath);
                }}
              >
                <FolderPlus className="w-3.5 h-3.5 text-amber-500" />
                Subdirectorio
              </button>
            )}
          </div>
          {canRename && (
            <>
              <div className="border-t border-zinc-100 my-1" />
              <button
                type="button"
                className="flex items-center gap-2 w-full text-left px-3 py-1 text-xs hover:bg-zinc-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  closeCtx();
                  if (onStartRename) onStartRename(node._projectFileId || currentPath);
                }}
              >
                <Pencil className="w-3.5 h-3.5 text-zinc-500" />
                Renombrar
              </button>
              <button
                type="button"
                className="flex items-center gap-2 w-full text-left px-3 py-1 text-xs hover:bg-red-50 text-red-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  closeCtx();
                  if (onContextDelete) onContextDelete(node, currentPath);
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar
              </button>
            </>
          )}
        </div>
      )}

      {isDir && open && (
        <div className="ml-[18px] pl-2 border-l border-zinc-200/80">
          {children.length === 0 && !isRenaming ? (
            <p className="text-[10px] text-zinc-400 italic py-0.5 pl-6">
              Vacía
            </p>
          ) : (
            children.map((child, i) => (
              <TreeNode
                key={`${child.name}-${i}`}
                node={child}
                onFileDoubleClick={onFileDoubleClick}
                onDirClick={onDirClick}
                selectedDirPath={selectedDirPath}
                parentPath={currentPath}
                onContextCreateFile={onContextCreateFile}
                onContextCreateFolder={onContextCreateFolder}
                onContextRename={onContextRename}
                onContextDelete={onContextDelete}
                onRenameConfirm={onRenameConfirm}
                renamingId={renamingId}
                onStartRename={onStartRename}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function GitHubFileTree({
  tree,
  loading = false,
  className = "",
  maxHeight,
  defaultOpen = false,
  onFileDoubleClick,
  onDirClick,
  selectedDirPath,
  onContextCreateFile,
  onContextCreateFolder,
  onContextRename,
  onContextDelete,
  onRenameConfirm,
  renamingId,
  onStartRename,
}) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-zinc-400 px-3">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-xs">Cargando...</span>
      </div>
    );
  }

  if (!tree || !tree.children || tree.children.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-3 text-center">
        <FolderOpen className="w-8 h-8 text-zinc-300 mb-2" />
        <p className="text-xs text-zinc-400">Sin archivos</p>
      </div>
    );
  }

  return (
    <div
      className={`overflow-y-auto px-1 ${className}`}
      style={{
        fontFamily: "'Work Sans', system-ui, sans-serif",
        ...(maxHeight ? { maxHeight } : { maxHeight: "100%" }),
      }}
    >
      {tree.children.map((child, i) => (
        <TreeNode
          key={`${child.name}-${i}`}
          node={child}
          defaultOpen={defaultOpen}
          onFileDoubleClick={onFileDoubleClick}
          onDirClick={onDirClick}
          selectedDirPath={selectedDirPath}
          parentPath=""
          onContextCreateFile={onContextCreateFile}
          onContextCreateFolder={onContextCreateFolder}
          onContextRename={onContextRename}
          onContextDelete={onContextDelete}
          onRenameConfirm={onRenameConfirm}
          renamingId={renamingId}
          onStartRename={onStartRename}
        />
      ))}
    </div>
  );
}
