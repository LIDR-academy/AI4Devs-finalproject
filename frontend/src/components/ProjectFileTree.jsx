// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
  Plus,
  Trash2,
  Pencil,
  MoreHorizontal,
  File,
} from "lucide-react";

function buildTree(files, parentId) {
  const children = files
    .filter((f) => (f.parent_id || null) === (parentId || null))
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  return children;
}

export default function ProjectFileTree({
  files,
  parentId,
  selectedFileId,
  onSelect,
  onDelete,
  onRename,
  onCreateFile,
  onCreateFolder,
  depth = 0,
}) {
  const children = buildTree(files, parentId);

  if (children.length === 0 && depth === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center">
        <FileText className="w-6 h-6 text-zinc-300 mb-1.5" />
        <p className="text-[10px] text-zinc-400 mb-2">Sin archivos</p>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={onCreateFolder}
            className="text-[10px] px-2 py-1 border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-600 font-semibold transition-colors"
          >
            + Carpeta
          </button>
          <button
            type="button"
            onClick={onCreateFile}
            className="text-[10px] px-2 py-1 border border-zinc-900 bg-deep-navy text-white hover:bg-zinc-800 font-semibold transition-colors"
          >
            + Archivo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="select-none">
      {children.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          files={files}
          selectedFileId={selectedFileId}
          onSelect={onSelect}
          onDelete={onDelete}
          onRename={onRename}
          onCreateFile={onCreateFile}
          onCreateFolder={onCreateFolder}
          depth={depth}
        />
      ))}
    </div>
  );
}

function TreeNode({
  node,
  files,
  selectedFileId,
  onSelect,
  onDelete,
  onRename,
  onCreateFile,
  onCreateFolder,
  depth,
}) {
  const [open, setOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const isDir = node.type === "directory";
  const isSelected = node.id === selectedFileId;
  const children = isDir ? buildTree(files, node.id) : [];

  return (
    <div>
      <div
        className={`flex items-center gap-1 py-1 px-1 w-full text-left hover:bg-zinc-100 transition-colors cursor-pointer group ${
          isSelected
            ? "bg-deep-navy text-white hover:bg-zinc-800"
            : "text-zinc-700"
        }`}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
        onClick={() => {
          if (isDir) {
            setOpen((v) => !v);
          } else {
            onSelect && onSelect(node);
          }
        }}
      >
        {isDir ? (
          <>
            {open ? (
              <ChevronDown className={`w-3 h-3 flex-shrink-0 ${isSelected ? "text-white" : "text-zinc-400"}`} />
            ) : (
              <ChevronRight className={`w-3 h-3 flex-shrink-0 ${isSelected ? "text-white" : "text-zinc-400"}`} />
            )}
            {open ? (
              <FolderOpen className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-white" : "text-amber-600"}`} />
            ) : (
              <Folder className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-white" : "text-amber-600"}`} />
            )}
            <span className={`text-xs font-semibold truncate ${isSelected ? "text-white" : ""}`}>
              {node.name}
            </span>
            {children.length > 0 && (
              <span className={`text-[9px] font-mono ml-auto ${isSelected ? "text-zinc-300" : "text-zinc-400"}`}>
                {children.length}
              </span>
            )}
          </>
        ) : (
          <>
            {node.name.endsWith(".md") ? (
              <FileText className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-white" : "text-blue-500"}`} />
            ) : (
              <File className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-white" : "text-zinc-400"}`} />
            )}
            <span className={`text-xs truncate ${isSelected ? "text-white" : ""}`}>
              {node.name}
            </span>
          </>
        )}

        {/* Action menu */}
        <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {isDir && (
            <>
              <button
                type="button"
                className={`p-0.5 hover:bg-zinc-200 ${isSelected ? "hover:bg-zinc-700" : ""}`}
                title="Nuevo archivo"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateFile && onCreateFile(node.id);
                }}
              >
                <Plus className={`w-2.5 h-2.5 ${isSelected ? "text-white" : "text-zinc-400"}`} />
              </button>
              <button
                type="button"
                className={`p-0.5 hover:bg-zinc-200 ${isSelected ? "hover:bg-zinc-700" : ""}`}
                title="Nueva carpeta"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateFolder && onCreateFolder(node.id);
                }}
              >
                <Folder className={`w-2.5 h-2.5 ${isSelected ? "text-white" : "text-zinc-400"}`} />
              </button>
            </>
          )}
          <div className="relative">
            <button
              type="button"
              className={`p-0.5 hover:bg-zinc-200 ${isSelected ? "hover:bg-zinc-700" : ""}`}
              title="Más"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((v) => !v);
              }}
            >
              <MoreHorizontal className={`w-2.5 h-2.5 ${isSelected ? "text-white" : "text-zinc-400"}`} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-0.5 z-40 bg-white border border-zinc-200 shadow min-w-[110px]">
                  <button
                    type="button"
                    className="block w-full text-left px-2.5 py-1 text-[10px] hover:bg-zinc-100 text-zinc-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onRename && onRename(node);
                    }}
                  >
                    <Pencil className="w-2.5 h-2.5 inline mr-1" />
                    Renombrar
                  </button>
                  <button
                    type="button"
                    className="block w-full text-left px-2.5 py-1 text-[10px] hover:bg-red-50 text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onDelete && onDelete(node);
                    }}
                  >
                    <Trash2 className="w-2.5 h-2.5 inline mr-1" />
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isDir && open && (
        <ProjectFileTree
          files={files}
          parentId={node.id}
          selectedFileId={selectedFileId}
          onSelect={onSelect}
          onDelete={onDelete}
          onRename={onRename}
          onCreateFile={onCreateFile}
          onCreateFolder={onCreateFolder}
          depth={depth + 1}
        />
      )}
    </div>
  );
}
