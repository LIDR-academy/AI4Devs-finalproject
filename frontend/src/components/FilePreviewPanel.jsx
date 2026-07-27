// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useRef, useCallback, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  X, FileText, Eye, ChevronDown, ChevronRight,
  Bold, Italic, List, ListOrdered, ListChecks,
  Quote, Heading2, Heading3, Code, Code2, Link, Table2,
  FolderPlus, FilePlus, Check, Loader2, AlertCircle, FolderOpen,
  Sparkles, Save,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import ProjectFileTree from "@/components/ProjectFileTree";
import CreateFileDialog from "@/components/CreateFileDialog";
import CreateFolderDialog from "@/components/CreateFolderDialog";
import { API } from "@/App";
import { getAuthHeaders } from "@/lib/api";

const MIN_WIDTH = 200;
const MAX_WIDTH = 700;
const DEFAULT_WIDTH = 520;
const TREE_WIDTH = 200;


function insertAtCursor(textarea, before, after, placeholder) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  const content = selected || placeholder || "";
  const newText =
    textarea.value.substring(0, start) +
    before + content + after +
    textarea.value.substring(end);

  const nativeSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype, "value"
  ).set;
  nativeSetter.call(textarea, newText);
  textarea.dispatchEvent(new Event("input", { bubbles: true }));

  const newCursor = start + before.length + content.length;
  textarea.selectionStart = textarea.selectionEnd = newCursor;
  textarea.focus();
}

const TEMPLATES = [
  { label: "Descripción general", insert: "## Descripción\n\n" },
  { label: "Objetivo", insert: "## Objetivo\n\n" },
  { label: "Contexto", insert: "## Contexto\n\n" },
  { label: "Requisitos funcionales", insert: "## Requisitos Funcionales\n\n- \n- \n" },
  { label: "Requisitos no funcionales", insert: "## Requisitos No Funcionales\n\n- \n- \n" },
  { label: "Criterios de aceptación", insert: "## Criterios de Aceptación\n\n- [ ] \n- [ ] " },
  { label: "BDD (Given/When/Then)", insert: "**Given** \n**When** \n**Then** " },
  { label: "Tabla de ejemplos", insert: "| Escenario | Entrada | Esperado |\n| --- | --- | --- |\n| | | |" },
];

const MD_TOOLS = [
  { icon: Bold, label: "Negrita", action: (ta) => insertAtCursor(ta, "**", "**", "texto") },
  { icon: Italic, label: "Cursiva", action: (ta) => insertAtCursor(ta, "*", "*", "texto") },
  null,
  { icon: Heading2, label: "H2", action: (ta) => insertAtCursor(ta, "## ", "", "") },
  { icon: Heading3, label: "H3", action: (ta) => insertAtCursor(ta, "### ", "", "") },
  null,
  { icon: List, label: "Lista", action: (ta) => insertAtCursor(ta, "- ", "", "") },
  { icon: ListOrdered, label: "Numerada", action: (ta) => insertAtCursor(ta, "1. ", "", "") },
  { icon: ListChecks, label: "Checklist", action: (ta) => insertAtCursor(ta, "- [ ] ", "", "") },
  null,
  { icon: Quote, label: "Cita", action: (ta) => insertAtCursor(ta, "> ", "", "") },
  { icon: Code, label: "Código", action: (ta) => insertAtCursor(ta, "`", "`", "código") },
  { icon: Code2, label: "Bloque", action: (ta) => insertAtCursor(ta, "```\n", "\n```", "código") },
  null,
  { icon: Link, label: "Enlace", action: (ta) => insertAtCursor(ta, "[", "](url)", "texto") },
  { icon: Table2, label: "Tabla", action: (ta) => insertAtCursor(ta, "| Col 1 | Col 2 |\n| --- | --- |\n| ", " |\n| | |", "celda") },
];

const AI_REWRITE_PROMPTS = [
  {
    label: "Descripción de app",
    description: "Genera una descripción detallada de la aplicación a partir de una idea breve",
    systemPrompt:
      "Actúa como un experto en diseño de productos digitales y desarrollo de aplicaciones. " +
      "A partir de la siguiente pequeña descripción que te doy, genera un texto completo y detallado " +
      "que describa cómo sería la aplicación, especificando todos los apartados (pantallas, secciones " +
      "o módulos) que la compondrían. Para cada apartado, incluye una pequeña descripción de su función " +
      "y qué contenido o acciones principales tendría.\n\n" +
      "IMPORTANTE: Detecta automáticamente el idioma en el que está escrita la descripción del usuario " +
      "(la que aparece entre comillas más abajo). Toda tu respuesta (nombre sugerido, resumen y lista " +
      "de apartados) debe generarse en ESE MISMO IDIOMA. Si la descripción está en español, respondes " +
      "en español; si está en inglés, en inglés; si está en francés, alemán, italiano, portugués, etc., " +
      "respondes en ese idioma.\n\n" +
      "La descripción de mi idea es:\n" +
      '"[CONTENIDO]"\n\n' +
      "Por favor, estructura tu respuesta de la siguiente manera:\n\n" +
      "- **Nombre sugerido para la app** (opcional pero recomendado)\n" +
      "- **Resumen general de la aplicación** (2 o 3 frases)\n" +
      "- **Lista de apartados** (cada apartado con un título y una breve descripción de qué se hace en él)\n\n" +
      "Asegúrate de que los apartados cubran desde la pantalla de inicio hasta las funciones clave, " +
      "pasando si es necesario por perfiles de usuario, configuración, notificaciones, etc. " +
      "Sé claro y práctico.",
  },
];

function FilePreviewPanel({ file, onClose, projectId }) {
  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH);
  const resizing = useRef(false);
  const asideRef = useRef(null);
  const textareaRef = useRef(null);

  const [editContent, setEditContent] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [treeOpen, setTreeOpen] = useState(true);
  const [saveStatus, setSaveStatus] = useState(null); // 'saving' | 'saved' | 'error' | null
  const saveTimer = useRef(null);

  // File tree state
  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [createFileOpen, setCreateFileOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [createInParentId, setCreateInParentId] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleAIRewrite = async (promptDef) => {
    if (!editContent.trim()) return;
    const systemPrompt = promptDef.systemPrompt.replace("[CONTENIDO]", editContent);
    setAiLoading(true);
    try {
      const res = await fetch(`${API}/ai/rewrite-content`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ content: editContent, system_prompt: systemPrompt }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Error al llamar a la IA");
      }
      const data = await res.json();
      handleContentChange(data.content);
      toast.success("Contenido reescrito con IA");
    } catch (err) {
      toast.error(err.message || "Error al reescribir contenido");
    } finally {
      setAiLoading(false);
    }
  };

  const isMd = selectedNode?.name?.endsWith(".md") || file?.name?.endsWith(".md");

  // Determine effective projectId
  const effectiveProjectId = projectId || file?.projectId;

  // Fetch project files
  const fetchFiles = useCallback(async () => {
    if (!effectiveProjectId) return;
    setFilesLoading(true);
    try {
      const res = await fetch(`${API}/projects/${effectiveProjectId}/files`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch {
      // silent
    } finally {
      setFilesLoading(false);
    }
  }, [effectiveProjectId]);

  useEffect(() => {
    if (effectiveProjectId) {
      fetchFiles();
    }
  }, [effectiveProjectId, fetchFiles]);

  // When incoming file changes, try to match it to a project file node
  useEffect(() => {
    if (file?.content != null && file.projectId) {
      setEditContent(file.content || "");
      setPreviewMode(false);
      setTemplatesOpen(false);
      // Try to find the matching node in files
      if (files.length > 0) {
        const match = files.find((f) => f.name === file.name && f.type === "file");
        if (match) setSelectedNode(match);
      }
    }
  }, [file, files]);

  // Load content when selectedNode changes
  useEffect(() => {
    if (selectedNode?.type === "file") {
      setEditContent(selectedNode.content || "");
      setPreviewMode(false);
      setTemplatesOpen(false);
      setSaveStatus(null);
    }
  }, [selectedNode?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save with 2s debounce
  const triggerSave = useCallback((content) => {
    if (!selectedNode || selectedNode.type !== "file" || !effectiveProjectId) return;
    setSaveStatus("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API}/projects/${effectiveProjectId}/files/${selectedNode.id}`,
          { method: "PUT", headers: getAuthHeaders(), body: JSON.stringify({ content }) },
        );
        if (res.ok) {
          setSaveStatus("saved");
          // Update local files cache
          setFiles((prev) =>
            prev.map((f) => (f.id === selectedNode.id ? { ...f, content } : f))
          );
        } else {
          setSaveStatus("error");
          toast.error("Error al guardar");
        }
      } catch {
        setSaveStatus("error");
        toast.error("Error al guardar");
      }
    }, 2000);
  }, [selectedNode, effectiveProjectId]);

  const handleContentChange = (newContent) => {
    setEditContent(newContent);
    setSaveStatus(null);
    triggerSave(newContent);
  };

  // Force save (on file switch or close)
  const forceSave = useCallback(async () => {
    if (!selectedNode || !effectiveProjectId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    try {
      await fetch(
        `${API}/projects/${effectiveProjectId}/files/${selectedNode.id}`,
        { method: "PUT", headers: getAuthHeaders(), body: JSON.stringify({ content: editContent }) },
      );
      setSaveStatus("saved");
    } catch {
      // silent
    }
  }, [selectedNode, effectiveProjectId, editContent]);

  const handleManualSave = useCallback(async () => {
    if (!selectedNode || !effectiveProjectId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    try {
      const res = await fetch(
        `${API}/projects/${effectiveProjectId}/files/${selectedNode.id}`,
        { method: "PUT", headers: getAuthHeaders(), body: JSON.stringify({ content: editContent }) },
      );
      if (res.ok) {
        setSaveStatus("saved");
        setFiles((prev) =>
          prev.map((f) => (f.id === selectedNode.id ? { ...f, content: editContent } : f))
        );
        toast.success("Guardado");
      } else {
        setSaveStatus("error");
        toast.error("Error al guardar");
      }
    } catch {
      setSaveStatus("error");
      toast.error("Error al guardar");
    }
  }, [selectedNode, effectiveProjectId, editContent]);

  const handleSelectNode = useCallback(async (node) => {
    if (node.type === "file") {
      await forceSave();
      setSelectedNode(node);
    }
  }, [forceSave]);

  // CRUD operations
  const handleCreateFile = useCallback(async (data) => {
    if (!effectiveProjectId) return;
    const res = await fetch(`${API}/projects/${effectiveProjectId}/files`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Error al crear archivo");
    }
    const created = await res.json();
    setFiles((prev) => [...prev, created]);
    toast.success("Archivo creado");
  }, [effectiveProjectId]);

  const handleCreateFolder = useCallback(async (data) => {
    if (!effectiveProjectId) return;
    const res = await fetch(`${API}/projects/${effectiveProjectId}/files`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Error al crear carpeta");
    }
    const created = await res.json();
    setFiles((prev) => [...prev, created]);
    toast.success("Carpeta creada");
  }, [effectiveProjectId]);

  const handleDeleteNode = useCallback(async (node) => {
    if (!effectiveProjectId) return;
    const label = node.type === "directory" ? "carpeta" : "archivo";
    setConfirmDelete({ node, label });
  }, [effectiveProjectId]);

  const doDeleteNode = async (node, label) => {
    try {
      const res = await fetch(
        `${API}/projects/${effectiveProjectId}/files/${node.id}`,
        { method: "DELETE", headers: getAuthHeaders() },
      );
      if (res.ok) {
        const { count } = await res.json();
        // Remove node + descendants from local state
        setFiles((prev) => prev.filter((f) => f.id !== node.id));
        if (selectedNode?.id === node.id) setSelectedNode(null);
        toast.success(count > 1 ? `${label} y ${count - 1} contenidos eliminados` : `${label} eliminado`);
      }
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const handleRenameNode = useCallback(async (node) => {
    const newName = window.prompt("Nuevo nombre:", node.name);
    if (!newName || newName === node.name) return;
    try {
      const res = await fetch(
        `${API}/projects/${effectiveProjectId}/files/${node.id}`,
        { method: "PUT", headers: getAuthHeaders(), body: JSON.stringify({ name: newName }) },
      );
      if (res.ok) {
        setFiles((prev) => prev.map((f) => (f.id === node.id ? { ...f, name: newName } : f)));
        if (selectedNode?.id === node.id) setSelectedNode((n) => ({ ...n, name: newName }));
        toast.success("Renombrado");
      }
    } catch {
      toast.error("Error al renombrar");
    }
  }, [effectiveProjectId, selectedNode]);

  // Toolbar actions
  const handleTool = useCallback((tool) => {
    const ta = textareaRef.current;
    if (!ta) return;
    tool.action(ta);
    handleContentChange(ta.value);
  }, [handleContentChange]);

  const handleTemplate = useCallback((tpl) => {
    const ta = textareaRef.current;
    if (!ta) return;
    insertAtCursor(ta, tpl.insert, "", "");
    handleContentChange(ta.value);
    setTemplatesOpen(false);
  }, [handleContentChange]);

  // Resize
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
      const newWidth = rect.right - e.clientX;
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

  const handleClosePanel = useCallback(async () => {
    if (selectedNode && editContent !== selectedNode.content) {
      await forceSave();
    }
    onClose();
  }, [selectedNode, editContent, forceSave, onClose]);

  // Cleanup save timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  // Ctrl+S keyboard shortcut
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleManualSave();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [handleManualSave]);

  // Collapsed state
  if (!file && !effectiveProjectId) {
    return (
      <div className="w-7 border-l border-zinc-200 bg-white flex flex-col items-center pt-2 flex-shrink-0">
        <span
          className="text-[9px] text-zinc-400 font-semibold uppercase mt-2 tracking-wider"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          Preview
        </span>
      </div>
    );
  }

  const btn = "h-5 w-5 p-0 rounded-lg hover:bg-zinc-200 text-zinc-500 transition-colors flex items-center justify-center flex-shrink-0";

  return (
    <>
      <aside
        ref={asideRef}
        className="border-l border-zinc-200 bg-white flex flex-col flex-shrink-0 overflow-hidden relative"
        style={{ width: panelWidth }}
      >
        {/* Header */}
        <div className="border-b border-zinc-200 px-2 py-1.5 flex items-center gap-1 flex-shrink-0 min-h-[32px]">
          <button
            type="button"
            className="p-0.5 hover:bg-zinc-100 flex-shrink-0"
            onClick={() => setTreeOpen((v) => !v)}
            title={treeOpen ? "Ocultar árbol" : "Mostrar árbol"}
          >
            {treeOpen ? (
              <ChevronRight className="w-3 h-3 text-zinc-400" />
            ) : (
              <FolderOpen className="w-3 h-3 text-zinc-400" />
            )}
          </button>

          <FileText className={`w-3.5 h-3.5 flex-shrink-0 ${isMd ? "text-blue-500" : "text-zinc-400"}`} />
          <span
            className="text-xs font-bold text-zinc-700 truncate flex-shrink mr-1"
            style={{ fontFamily: "'Chivo', sans-serif" }}
            title={selectedNode?.name || file?.name || ""}
          >
            {selectedNode?.name || file?.name || ""}
          </span>

          {/* Save status + manual save button */}
          {selectedNode && (
            <>
              {saveStatus === "saving" && <Loader2 className="w-3 h-3 text-zinc-400 animate-spin flex-shrink-0" />}
              {saveStatus === "saved" && <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />}
              {saveStatus === "error" && <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />}
              <button
                type="button"
                className={btn}
                title="Guardar (Ctrl+S)"
                onClick={handleManualSave}
              >
                <Save className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <div className="flex-1" />

          {isMd && (
            <>
              {MD_TOOLS.map((tool, i) => {
                if (!tool) return <div key={`s${i}`} className="w-px h-3 bg-zinc-200 mx-0.5 flex-shrink-0" />;
                return (
                  <button
                    key={tool.label}
                    type="button"
                    className={btn}
                    title={tool.label}
                    onClick={() => handleTool(tool)}
                  >
                    <tool.icon className="w-3 h-3" />
                  </button>
                );
              })}

              <div className="w-px h-4 bg-zinc-200 mx-0.5 flex-shrink-0" />

              {/* Apartados dropdown */}
              <div className="relative flex-shrink-0">
                <button
                  type="button"
                  className={`${btn} gap-0.5 w-auto text-[10px] font-semibold`}
                  onClick={() => setTemplatesOpen((v) => !v)}
                >
                  <ChevronDown className={`w-2.5 h-2.5 transition-transform ${templatesOpen ? "rotate-180" : ""}`} />
                  Apartados
                </button>
                {templatesOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setTemplatesOpen(false)} />
                    <div className="absolute top-full left-0 mt-1 z-40 bg-white border border-zinc-200 shadow min-w-[180px]">
                      {TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.label}
                          type="button"
                          className="block w-full text-left px-3 py-1.5 text-xs hover:bg-zinc-100 text-zinc-700"
                          onClick={() => handleTemplate(tpl)}
                        >
                          {tpl.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="w-px h-4 bg-zinc-200 mx-0.5 flex-shrink-0" />

              {/* AI Rewrite button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={`${btn} gap-0.5 w-auto text-[10px] font-semibold ${aiLoading ? "text-blue-600" : "text-zinc-500 hover:text-blue-600"}`}
                    title="Reescribir con IA"
                    disabled={aiLoading}
                  >
                    {aiLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    IA
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-lg border border-zinc-200 shadow-md min-w-[220px]">
                  <div className="px-3 py-1.5 border-b border-zinc-200">
                    <p className="text-[10px] font-semibold text-zinc-700" style={{ fontFamily: "'Chivo', sans-serif" }}>
                      Reescribir con IA
                    </p>
                    <p className="text-[9px] text-zinc-400">DeepSeek V4 Pro</p>
                  </div>
                  {AI_REWRITE_PROMPTS.map((promptDef) => (
                    <DropdownMenuItem
                      key={promptDef.label}
                      className="rounded-lg text-xs cursor-pointer"
                      onClick={() => handleAIRewrite(promptDef)}
                    >
                      <Sparkles className="w-3 h-3 mr-2 text-blue-500 flex-shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-semibold">{promptDef.label}</span>
                        <span className="text-[9px] text-zinc-400 leading-tight">{promptDef.description}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Preview toggle */}
              <button
                type="button"
                className={`${btn} ${previewMode ? "bg-zinc-200 text-zinc-700" : ""}`}
                title={previewMode ? "Editar" : "Preview"}
                onClick={() => setPreviewMode((v) => !v)}
              >
                <Eye className="w-3 h-3" />
              </button>
            </>
          )}

          <button
            onClick={handleClosePanel}
            className="p-0.5 hover:bg-zinc-100 transition-colors flex-shrink-0"
            title="Cerrar"
          >
            <X className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>

        {/* Body: Tree + Editor */}
        <div className="flex-1 overflow-hidden flex">
          {/* Tree sidebar */}
          {treeOpen && effectiveProjectId && (
            <div
              className="border-r border-zinc-200 flex flex-col flex-shrink-0"
              style={{ width: TREE_WIDTH }}
            >
              <div className="border-b border-zinc-200 px-2 py-1 flex items-center gap-1 flex-shrink-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  Archivos
                </span>
                <div className="flex-1" />
                <button
                  type="button"
                  className="p-0.5 hover:bg-zinc-100"
                  title="Nueva carpeta"
                  onClick={() => { setCreateInParentId(null); setCreateFolderOpen(true); }}
                >
                  <FolderPlus className="w-3 h-3 text-zinc-400" />
                </button>
                <button
                  type="button"
                  className="p-0.5 hover:bg-zinc-100"
                  title="Nuevo archivo"
                  onClick={() => { setCreateInParentId(null); setCreateFileOpen(true); }}
                >
                  <FilePlus className="w-3 h-3 text-zinc-400" />
                </button>
              </div>
              <ScrollArea className="flex-1">
                <div className="py-1">
                  {filesLoading ? (
                    <div className="flex items-center justify-center py-4 gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                      <span className="text-[10px] text-zinc-400">Cargando...</span>
                    </div>
                  ) : (
                    <ProjectFileTree
                      files={files}
                      parentId={null}
                      selectedFileId={selectedNode?.id}
                      onSelect={handleSelectNode}
                      onDelete={handleDeleteNode}
                      onRename={handleRenameNode}
                      onCreateFile={(pid) => { setCreateInParentId(pid); setCreateFileOpen(true); }}
                      onCreateFolder={(pid) => { setCreateInParentId(pid); setCreateFolderOpen(true); }}
                    />
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            {!selectedNode && !file?.content ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <FileText className="w-8 h-8 text-zinc-200 mb-2" />
                <p className="text-xs text-zinc-400 mb-1">Selecciona un archivo</p>
                <p className="text-[10px] text-zinc-300">Usa el árbol de la izquierda o crea uno nuevo</p>
              </div>
            ) : isMd ? (
              <div className="h-full flex flex-col">
                {previewMode ? (
                  <ScrollArea className="h-full">
                    <div className="p-4 text-xs prose prose-sm max-w-none prose-headings:text-zinc-900 prose-p:text-zinc-700 prose-code:text-zinc-600 prose-a:text-blue-600">
                      {editContent?.trim() ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {editContent}
                        </ReactMarkdown>
                      ) : (
                        <p className="text-zinc-300 italic m-0">Sin contenido</p>
                      )}
                    </div>
                  </ScrollArea>
                ) : (
                  <textarea
                    ref={textareaRef}
                    value={editContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="w-full h-full resize-none border-0 rounded-lg font-mono text-xs px-4 py-3 focus:outline-none"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    placeholder="Escribe markdown aquí..."
                  />
                )}
              </div>
            ) : (
              <ScrollArea className="h-full">
                <pre
                  className="p-4 text-xs text-zinc-700 whitespace-pre-wrap font-mono leading-relaxed"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {editContent || ""}
                </pre>
              </ScrollArea>
            )}
          </div>
        </div>

        {/* Resize handle (left edge) */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-blue-400 active:bg-blue-500 transition-colors z-10"
          onMouseDown={startResize}
        />
      </aside>

      {/* Dialogs */}
      <CreateFileDialog
        open={createFileOpen}
        onClose={() => setCreateFileOpen(false)}
        onCreate={handleCreateFile}
        files={files}
        parentId={createInParentId}
      />
      <CreateFolderDialog
        open={createFolderOpen}
        onClose={() => setCreateFolderOpen(false)}
        onCreate={handleCreateFolder}
        files={files}
        parentId={createInParentId}
      />
    <ConfirmDialog
      open={!!confirmDelete}
      onOpenChange={(open) => { if (!open) setConfirmDelete(null); }}
      title={`Eliminar ${confirmDelete?.label || "elemento"}`}
      description={`¿Eliminar ${confirmDelete?.label} "${confirmDelete?.node?.name}"?${confirmDelete?.node?.type === "directory" ? " Se eliminará todo su contenido." : ""}`}
      onConfirm={() => { doDeleteNode(confirmDelete.node, confirmDelete.label); setConfirmDelete(null); }}
    />
    </>
  );
}

export default React.memo(FilePreviewPanel);
