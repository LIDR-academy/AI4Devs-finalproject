// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "@/App";
import { getAuthHeaders } from "@/lib/api";
import { toast } from "sonner";
import { useI18n } from "@/contexts/I18nContext";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Briefcase,
  Building2,
  Rocket,
  Zap,
  Target,
  Globe,
  Layers,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
  Download,
  ExternalLink,
  Plus,
  Sparkles,
  FileText,
  ClipboardList,
  FolderPlus,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import CreateFileDialog from "@/components/CreateFileDialog";
import AiLoadingOverlay from "@/components/AiLoadingOverlay";
import { getEditorForFile, registerBpmnAsDiagram } from "@/lib/fileEditors";

const MIN_WIDTH = 180;
const MAX_WIDTH = 400;
const DEFAULT_WIDTH = 224;

const COLOR_OPTIONS = [
  "#7C3AED", "#2563EB", "#059669", "#D97706",
  "#DC2626", "#DB2777", "#4F46E5", "#0891B2",
];

const ICON_OPTIONS = ["folder", "briefcase", "building", "rocket", "zap", "target", "globe", "layers"];

const ICON_MAP = {
  folder: Folder,
  briefcase: Briefcase,
  building: Building2,
  rocket: Rocket,
  zap: Zap,
  target: Target,
  globe: Globe,
  layers: Layers,
};


function ProjectTree({
  isOpen,
  onToggle,
  projects = [],
  loading = false,
  onProjectUpdated,
  onProjectDeleted,
  onProjectCreated,
  onFileSelect,
  onFileDelete,
  autoExpand = false,
  showFiles = false,
}) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [panelWidth, setPanelWidth] = useState(DEFAULT_WIDTH);
  const [rootOpen, setRootOpen] = useState(true);
  const resizing = useRef(false);
  const asideRef = useRef(null);

  // File tree expansion state
  const [fileTrees, setFileTrees] = useState({});
  const [loadingTrees, setLoadingTrees] = useState({});
  const [expandedProjects, setExpandedProjects] = useState({});
  const [projectSpecs, setProjectSpecs] = useState({});
  const [creatingInDir, setCreatingInDir] = useState(null); // { projectId, parentPath }
  const [newFolderName, setNewFolderName] = useState("");
  const newFolderRef = useRef(null);
  const [createFileOpen, setCreateFileOpen] = useState(false);
  const [createFileProjectId, setCreateFileProjectId] = useState(null);

  // Auto-focus new folder input
  useEffect(() => {
    if (creatingInDir && newFolderRef.current) {
      newFolderRef.current.focus();
    }
  }, [creatingInDir]);

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

  const fetchFileTree = async (projectId) => {
    if (fileTrees[projectId] || loadingTrees[projectId]) return;
    setLoadingTrees((prev) => ({ ...prev, [projectId]: true }));
    try {
      const headers = getAuthHeaders();
      const [treeRes, filesRes] = await Promise.all([
        fetch(`${API}/projects/${projectId}/github-tree`, { headers }),
        fetch(`${API}/projects/${projectId}/files`, { headers }),
      ]);

      let treeData = null;

      if (treeRes.ok) {
        treeData = await treeRes.json();
      }

      // Also fetch project_files to inject _projectFileId into the tree
      const projectFiles = filesRes.ok ? await filesRes.json() : [];

      if (treeData) {
        // Inject _projectFileId into the existing files/ subtree
        // (github-tree already includes project_files under files/ — no need to append)
        const filesDir = (treeData.tree.children || []).find(
          (c) => c.name === "files" && c.type === "directory"
        );
        if (projectFiles.length > 0) {
          // Index project files by parent_id for fast lookup (same pattern as ProjectDetailPage)
          const pfByParentId = {};
          for (const pf of projectFiles) {
            const key = pf.parent_id || "__root__";
            (pfByParentId[key] = pfByParentId[key] || []).push(pf);
          }
          // Recursively inject _projectFileId by matching name+type within each parent
          const injectIds = (node, parentId) => {
            const key = parentId || "__root__";
            const pfs = pfByParentId[key] || [];
            if (pfs.length === 0) return;
            const children = node.children || [];
            for (const pf of pfs) {
              const existing = children.find(
                (c) => c.name === pf.name && c.type === pf.type
              );
              if (existing) {
                existing._projectFileId = pf.id;
                if (pf.type === "directory") injectIds(existing, pf.id);
              }
            }
          };
          if (filesDir) {
            injectIds(filesDir, null);
          }
        }
      } else if (projectFiles.length > 0) {
        // No github tree, but we have project_files — build minimal tree
        const projectName = projects.find((p) => p.id === projectId)?.name || projectId;
        treeData = {
          tree: {
            name: projectName.replace(/\s+/g, "-").toLowerCase(),
            type: "directory",
            children: buildTreeFromFlat(projectFiles, null),
          },
          files: {},
        };
      } else {
        // Neither github tree nor project_files — still show an empty tree
        // so the "Nueva carpeta" button is available
        const projectName = projects.find((p) => p.id === projectId)?.name || projectId;
        treeData = {
          tree: {
            name: projectName.replace(/\s+/g, "-").toLowerCase(),
            type: "directory",
            children: [],
          },
          files: {},
        };
      }

      setFileTrees((prev) => ({ ...prev, [projectId]: treeData }));
    } catch { /* silent */ }
    finally { setLoadingTrees((prev) => ({ ...prev, [projectId]: false })); }
  };

  // Build nested tree from flat project_files list
  const buildTreeFromFlat = (flatList, parentId) => {
    return flatList
      .filter((f) => (f.parent_id || null) === (parentId || null))
      .map((f) => ({
        name: f.name,
        type: f.type,
        children: f.type === "directory" ? buildTreeFromFlat(flatList, f.id) : [],
        _projectFileId: f.id, // store for later API calls
      }));
  };

  const handleCreateFile = async (data) => {
    if (!createFileProjectId) return;
    try {
      const headers = getAuthHeaders();
      await fetch(`${API}/projects/${createFileProjectId}/files`, {
        method: "POST",
        headers,
        body: JSON.stringify(data),
      });
      // Reload tree
      setFileTrees((prev) => {
        const next = { ...prev };
        delete next[createFileProjectId];
        return next;
      });
      setExpandedProjects((prev) => {
        const next = { ...prev };
        delete next[createFileProjectId];
        return next;
      });
      setTimeout(() => {
        setExpandedProjects((prev) => ({ ...prev, [createFileProjectId]: true }));
      }, 100);
      toast.success("Archivo creado");
    } catch {
      toast.error("Error al crear archivo");
    }
  };

  const handleCreateFolder = async (projectId, parentNode) => {
    const name = newFolderName.trim();
    if (!name) {
      setCreatingInDir(null);
      setNewFolderName("");
      return;
    }
    // Use _projectFileId as parent_id if the parent is a project_files directory
    const parentId = parentNode?._projectFileId || null;
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API}/projects/${projectId}/files`, {
        method: "POST",
        headers,
        body: JSON.stringify({ type: "directory", name, parent_id: parentId }),
      });
      if (res.ok) {
        const created = await res.json();
        // Reload tree to show new folder in correct location
        setFileTrees((prev) => {
          const next = { ...prev };
          delete next[projectId];
          return next;
        });
        setExpandedProjects((prev) => {
          const next = { ...prev };
          delete next[projectId];
          return next;
        });
        // Re-expand after short delay
        setTimeout(() => {
          setExpandedProjects((prev) => ({ ...prev, [projectId]: true }));
        }, 100);
      }
    } catch { /* silent */ }
    setCreatingInDir(null);
    setNewFolderName("");
  };

  const fetchSpecs = async (projectId) => {
    if (projectSpecs[projectId]) return;
    try {
      const res = await fetch(`${API}/specs/specifications?project_id=${projectId}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const specs = await res.json();
        setProjectSpecs((prev) => ({ ...prev, [projectId]: Array.isArray(specs) ? specs : [] }));
      }
    } catch { /* silent */ }
  };

  const toggleProject = (projectId) => {
    const isOpen = expandedProjects[projectId];
    setExpandedProjects((prev) => ({ ...prev, [projectId]: !isOpen }));
    if (!isOpen) {
      fetchFileTree(projectId);
      fetchSpecs(projectId);
    }
  };

  // Auto-expand single project when autoExpand is set
  useEffect(() => {
    if (autoExpand && isOpen && projects.length === 1 && !loading) {
      const pid = projects[0].id;
      if (!expandedProjects[pid]) {
        toggleProject(pid);
      }
    }
  }, [autoExpand, isOpen, projects, loading]);

  // Helper to render file tree nodes recursively
  const FileTreeNode = ({ node, projectId, depth, parentPath }) => {
    const isDir = node.type === "directory";
    const children = node.children || [];
    const [dirOpen, setDirOpen] = useState(true);
    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;

    if (isDir) {
      const isCreatingHere = creatingInDir?.projectId === projectId && creatingInDir?.dirPath === currentPath;
      return (
        <div>
          <div className="group flex items-center gap-1 py-0.5 px-1 w-full hover:bg-zinc-100 transition-colors"
            style={{ paddingLeft: depth * 12 + 4 }}
          >
            <button
              type="button"
              onClick={() => setDirOpen((v) => !v)}
              className="flex items-center gap-1 flex-1 min-w-0 text-left"
            >
              {dirOpen ? (
                <ChevronDown className="w-3 h-3 text-zinc-400 flex-shrink-0" />
              ) : (
                <ChevronRight className="w-3 h-3 text-zinc-400 flex-shrink-0" />
              )}
              <Folder className="w-3 h-3 text-amber-600 flex-shrink-0" />
              <span className="text-[11px] text-zinc-500 truncate">{node.name}</span>
              {children.length > 0 && (
                <span className="text-[9px] text-zinc-300 flex-shrink-0" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  {children.length}
                </span>
              )}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="p-0.5 hover:bg-zinc-200 flex-shrink-0"
                  title="Opciones"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-3 h-3 text-zinc-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-lg border border-zinc-200 shadow-md min-w-[160px]">
                <DropdownMenuItem
                  className="rounded-lg text-xs cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCreateFileProjectId(projectId);
                    setCreateFileOpen(true);
                  }}
                >
                  <FileText className="w-3.5 h-3.5 mr-2" />
                  Nuevo elemento
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-lg text-xs cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCreatingInDir({ projectId, dirPath: currentPath });
                    setNewFolderName("");
                    setDirOpen(true);
                  }}
                >
                  <FolderPlus className="w-3.5 h-3.5 mr-2" />
                  Nuevo subdirectorio
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {isCreatingHere && (
            <div className="flex items-center gap-1 py-0.5 px-1" style={{ paddingLeft: (depth + 1) * 12 + 4 }}>
              <Folder className="w-3 h-3 text-amber-600 flex-shrink-0" />
              <input
                ref={newFolderRef}
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFolder(projectId, node);
                  if (e.key === "Escape") { setCreatingInDir(null); setNewFolderName(""); }
                }}
                onBlur={() => handleCreateFolder(projectId, node)}
                placeholder="nombre carpeta..."
                className="flex-1 text-[10px] px-1 py-0 border-b border-zinc-300 focus:border-zinc-900 outline-none bg-transparent"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              />
            </div>
          )}
          {dirOpen && children.map((child, i) => (
            <FileTreeNode key={`${child.name}-${i}`} node={child} projectId={projectId} depth={depth + 1} parentPath={currentPath} />
          ))}
        </div>
      );
    }

    const ext = node.name.slice(node.name.lastIndexOf("."));
    const isMd = ext === ".md";
    const treeData = fileTrees[projectId];

    return (
      <div
        className={`group flex items-center gap-1 py-0.5 px-1 w-full transition-colors ${
          isMd ? "hover:bg-blue-50" : "hover:bg-zinc-100"
        }`}
        style={{ paddingLeft: depth * 12 + 4 }}
      >
        <button
          type="button"
          onDoubleClick={async () => {
            const editor = getEditorForFile(node.name);
            if (editor?.type === 'route') {
              let url = editor.getUrl({ name: node.name, diagramId: node.diagramId, _projectFileId: node._projectFileId });
              // Auto-register orphan .bpmn: create diagram + link to project
              if (!url && node.name.endsWith('.bpmn') && projectId) {
                let xmlContent = treeData?.files?.[currentPath] || '';
                // If content not in tree, try fetching from file API
                if (!xmlContent && node._projectFileId) {
                  try {
                    const headers = getAuthHeaders();
                    const res = await fetch(`${API}/projects/${projectId}/files/${node._projectFileId}`, { headers });
                    if (res.ok) {
                      const fileData = await res.json();
                      xmlContent = fileData.content || '';
                    }
                  } catch { /* use empty */ }
                }
                const newId = await registerBpmnAsDiagram(node.name, xmlContent, projectId, API);
                if (newId) url = `/editor/${newId}`;
              }
              if (url) {
                if (editor.newTab) window.open(url, '_blank');
                else navigate(url);
                return;
              }
            }
            // Fallback: inline editor (FilePreviewPanel) for registered inline types
            // and unregistered extensions
            if (onFileSelect) {
              const content = treeData?.files?.[currentPath] || "";
              onFileSelect({ name: node.name, path: currentPath, content, projectId, _projectFileId: node._projectFileId });
            }
          }}
          className="flex-1 min-w-0 text-left"
          title={isMd ? "Doble clic para ver contenido" : node.name}
        >
          <span className={`text-[11px] truncate ${isMd ? "text-blue-700 font-medium" : "text-zinc-600"}`}>
            {node.name}
          </span>
        </button>
        {node._projectFileId && onFileDelete && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="p-0.5 hover:bg-zinc-200 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Opciones"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-3 h-3 text-zinc-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-lg border border-zinc-200 shadow-md min-w-[140px]">
              <DropdownMenuItem
                className="rounded-lg text-xs cursor-pointer text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileDelete(node, projectId);
                }}
              >
                <Trash2 className="w-3.5 h-3.5 mr-2 text-red-500" />
                {t("common.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  };

  // --- Edit dialog state ---
  const [editingProject, setEditingProject] = useState(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formColor, setFormColor] = useState(COLOR_OPTIONS[0]);
  const [formIcon, setFormIcon] = useState("folder");
  const [saving, setSaving] = useState(false);

  const openEdit = (project) => {
    setEditingProject(project);
    setFormName(project.name || "");
    setFormDesc(project.description || "");
    setFormColor(project.color || COLOR_OPTIONS[0]);
    setFormIcon(project.icon || "folder");
  };

  const handleSave = async () => {
    if (!formName.trim() || !editingProject) return;
    setSaving(true);
    try {
      const headers = getAuthHeaders();
      const body = JSON.stringify({
        name: formName.trim(),
        description: formDesc.trim(),
        color: formColor,
        icon: formIcon,
      });
      const res = await fetch(`${API}/projects/${editingProject.id}`, {
        method: "PUT",
        headers,
        body,
      });
      if (res.ok) {
        const updated = { ...editingProject, ...JSON.parse(body) };
        if (onProjectUpdated) onProjectUpdated(updated);
        setEditingProject(null);
        toast.success("Proyecto actualizado");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Error al actualizar el proyecto");
      }
    } catch {
      toast.error("Error al actualizar el proyecto");
    } finally {
      setSaving(false);
    }
  };

  // --- Delete dialog state ---
  const [deletingProject, setDeletingProject] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deletingProject) return;
    setDeleting(true);
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API}/projects/${deletingProject.id}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        if (onProjectDeleted) onProjectDeleted(deletingProject.id);
        toast.success(`Proyecto "${deletingProject.name}" eliminado`);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Error al eliminar el proyecto");
      }
    } catch {
      toast.error("Error al eliminar el proyecto");
    } finally {
      setDeleting(false);
      setDeletingProject(null);
    }
  };

  // --- Export ---
  const handleExport = async (project, format) => {
    try {
      const headers = getAuthHeaders();
      const endpoint = format === "zip"
        ? `${API}/projects/${project.id}/export-zip`
        : `${API}/projects/${project.id}/export`;
      const res = await fetch(endpoint, { headers });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Error al exportar");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = format === "zip"
        ? `${project.name.replace(/\s+/g, "_")}.zip`
        : `${project.name.replace(/\s+/g, "_")}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Exportado correctamente");
    } catch {
      toast.error("Error al exportar");
    }
  };

  // --- Create dialog state ---
  const [creating, setCreating] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createColor, setCreateColor] = useState(COLOR_OPTIONS[0]);
  const [createIcon, setCreateIcon] = useState("folder");
  const [creatingSaving, setCreatingSaving] = useState(false);

  const openCreate = () => {
    setCreating(true);
    setCreateName("");
    setCreateDesc("");
    setCreateColor(COLOR_OPTIONS[0]);
    setCreateIcon("folder");
  };

  const handleCreate = async () => {
    if (!createName.trim()) return;
    setCreatingSaving(true);
    try {
      const headers = getAuthHeaders();
      const body = JSON.stringify({
        name: createName.trim(),
        description: createDesc.trim(),
        color: createColor,
        icon: createIcon,
      });
      const res = await fetch(`${API}/projects`, {
        method: "POST",
        headers,
        body,
      });
      if (res.ok) {
        const created = await res.json();
        if (onProjectCreated) onProjectCreated(created);
        setCreating(false);
        toast.success("Proyecto creado");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Error al crear el proyecto");
      }
    } catch {
      toast.error("Error al crear el proyecto");
    } finally {
      setCreatingSaving(false);
    }
  };

  // --- AI create dialog state ---
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiProvider, setAiProvider] = useState("deepseek-pro");
  const [aiStep, setAiStep] = useState("prompt");
  const [aiPlan, setAiPlan] = useState(null);
  const [aiResult, setAiResult] = useState(null);

  const resetAi = () => {
    setAiPrompt("");
    setAiProvider("deepseek-pro");
    setAiStep("prompt");
    setAiPlan(null);
    setAiResult(null);
    setAiOpen(false);
  };

  const handleAiPlan = async () => {
    if (!aiPrompt.trim()) return;
    setAiStep("planning");
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API}/ai/generate-project`, {
        method: "POST",
        headers,
        body: JSON.stringify({ prompt: aiPrompt, llm_provider: aiProvider }),
      });
      if (res.ok) {
        const plan = await res.json();
        setAiPlan(plan);
        setAiStep("review");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Error al planificar");
        setAiStep("prompt");
      }
    } catch {
      toast.error("Error de red");
      setAiStep("prompt");
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPlan?.diagrams?.length) return;
    setAiStep("generating");
    try {
      const headers = getAuthHeaders();
      const res = await fetch(`${API}/ai/generate-project-diagrams`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          project_name: aiPlan.project_name,
          project_description: aiPlan.project_description,
          diagrams: aiPlan.diagrams,
          llm_provider: aiProvider,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        setAiResult(result);
        setAiStep("done");
        if (onProjectCreated && result.project_id) {
          try {
            const projRes = await fetch(`${API}/projects/${result.project_id}`, { headers });
            if (projRes.ok) {
              const created = await projRes.json();
              if (onProjectCreated) onProjectCreated(created);
            }
          } catch { /* project will appear on next fetch */ }
        }
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Error al generar");
        setAiStep("review");
      }
    } catch {
      toast.error("Error de red");
      setAiStep("review");
    }
  };

  if (!isOpen) {
    return (
      <div className="w-7 border-r border-zinc-200 bg-white flex flex-col items-center pt-2 flex-shrink-0">
        <button onClick={onToggle} className="p-1 hover:bg-zinc-100" title="Mostrar proyectos">
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        </button>
        <span
          className="text-[9px] text-zinc-400 font-semibold uppercase mt-2 tracking-wider"
          style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
        >
          Proyectos
        </span>
      </div>
    );
  }

  return (
    <aside
      ref={asideRef}
      className="border-r border-zinc-200 bg-white flex flex-col flex-shrink-0 overflow-hidden relative"
      style={{ width: panelWidth }}
    >
      {/* Header */}
      <div className="border-b border-zinc-200 px-3 py-2 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <button onClick={onToggle} className="p-0.5 hover:bg-zinc-100" title="Ocultar proyectos">
            <ChevronLeft className="w-3.5 h-3.5 text-zinc-400" />
          </button>
          <span
            className="text-xs font-bold text-zinc-700 tracking-tight"
            style={{ fontFamily: "'Chivo', sans-serif" }}
          >
            Proyectos
          </span>
        </div>
        <button
          onClick={openCreate}
          className="p-0.5 hover:bg-zinc-100 transition-colors"
          title="Nuevo proyecto"
        >
          <Plus className="w-3.5 h-3.5 text-zinc-400" />
        </button>
        <button
          onClick={() => setAiOpen(true)}
          className="p-0.5 hover:bg-zinc-100 transition-colors"
          title="Nuevo proyecto con IA"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center gap-2 py-4 px-3 text-zinc-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Cargando...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-3 text-center">
            <FolderOpen className="w-8 h-8 text-zinc-200 mb-3" />
            <p className="text-xs text-zinc-400 mb-2">No hay proyectos</p>
            <Link
              to="/projects"
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Ir a Proyectos
            </Link>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="p-2">
              <Collapsible open={rootOpen} onOpenChange={setRootOpen}>
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 py-1 px-1 w-full text-left hover:bg-zinc-100 transition-colors"
                  >
                    {rootOpen ? (
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />
                    )}
                    {rootOpen ? (
                      <FolderOpen className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    ) : (
                      <Folder className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-zinc-700 truncate">
                      Proyectos
                    </span>
                    <span
                      className="text-[10px] text-zinc-400 ml-auto flex-shrink-0"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      {projects.length}
                    </span>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="ml-3.5 pl-2 border-l border-zinc-200">
                    {projects.map((project) => {
                      const Icon = ICON_MAP[project.icon || "folder"] || Folder;
                      const isExpanded = expandedProjects[project.id];
                      const isLoadingTree = loadingTrees[project.id];
                      const treeData = fileTrees[project.id];
                      return (
                        <div key={project.id}>
                          <div className="group flex items-center gap-1.5 py-1 px-1 hover:bg-zinc-100 transition-colors">
                            <button
                              onClick={() => toggleProject(project.id)}
                              className="p-0.5 hover:bg-zinc-200 transition-colors flex-shrink-0"
                              title={isExpanded ? "Colapsar" : "Expandir"}
                            >
                              {isLoadingTree ? (
                                <Loader2 className="w-3 h-3 text-zinc-400 animate-spin" />
                              ) : isExpanded ? (
                                <ChevronDown className="w-3 h-3 text-zinc-400" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-zinc-400" />
                              )}
                            </button>
                            <Link
                              to={`/projects/${project.id}`}
                              className="flex items-center gap-1.5 flex-1 min-w-0"
                            >
                              <Icon
                                className="w-3.5 h-3.5 flex-shrink-0"
                                style={{ color: project.color || "#71717a" }}
                              />
                              <span className="text-xs text-zinc-600 truncate">{project.name}</span>
                            </Link>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-zinc-200 transition-all flex-shrink-0"
                                  onClick={(e) => e.preventDefault()}
                                  title="Acciones"
                                >
                                  <MoreHorizontal className="w-3 h-3 text-zinc-400" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="start" className="w-40 rounded-lg">
                                <DropdownMenuItem
                                  onClick={() => window.open(`/projects/${project.id}`, "_blank")}
                                  className="rounded-lg cursor-pointer text-xs"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 mr-2" />
                                  Abrir
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openEdit(project)}
                                  className="rounded-lg cursor-pointer text-xs"
                                >
                                  <Pencil className="w-3.5 h-3.5 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleExport(project, "zip")}
                                  className="rounded-lg cursor-pointer text-xs"
                                >
                                  <Download className="w-3.5 h-3.5 mr-2" />
                                  Exportar ZIP
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleExport(project, "json")}
                                  className="rounded-lg cursor-pointer text-xs"
                                >
                                  <Download className="w-3.5 h-3.5 mr-2" />
                                  Exportar JSON
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setDeletingProject(project)}
                                  className="rounded-lg cursor-pointer text-xs text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                                  {t("common.delete")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          {isExpanded && (
                            <div className="ml-3.5 pl-2 border-l border-zinc-200">
                              {/* Specs / Requirements section */}
                              {projectSpecs[project.id] && projectSpecs[project.id].length > 0 && (
                                <div className="mb-2">
                                  <div className="flex items-center gap-1.5 py-1 px-1">
                                    <ClipboardList className="w-3 h-3 text-violet-500 flex-shrink-0" />
                                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                                      Specs ({projectSpecs[project.id].length})
                                    </span>
                                  </div>
                                  {projectSpecs[project.id].map((spec) => (
                                    <div
                                      key={spec.id}
                                      className="flex flex-col py-0.5 pl-5 pr-1 hover:bg-violet-50/50 transition-colors cursor-pointer group"
                                      onDoubleClick={() => navigate(`/specs/${spec.id}`)}
                                      title={`${spec.title} — doble clic para abrir / specs/${spec.id}`}
                                    >
                                      <div className="flex items-center gap-1.5">
                                        <FileText className="w-3 h-3 text-violet-400 flex-shrink-0" />
                                        <span className="text-[10px] text-zinc-700 truncate font-medium">
                                          {spec.title}
                                        </span>
                                        {spec.requirements_count > 0 && (
                                          <span className="text-[9px] text-zinc-400 ml-auto flex-shrink-0 tabular-nums">
                                            {spec.requirements_count}
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1.5 ml-[18px] text-[9px] text-zinc-400">
                                        <span className="font-mono tracking-tight truncate">{spec.id?.slice(0, 8)}</span>
                                        {spec.project_version_label && (
                                          <span className="text-blue-500 truncate max-w-[80px]" title={spec.project_version_label}>{spec.project_version_label}</span>
                                        )}
                                        {spec.speckit_status === "ready" && (
                                          <span className="text-emerald-500 font-medium flex-shrink-0">Speckit</span>
                                        )}
                                        {spec.created_by_ai && (
                                          <span className="text-blue-400 flex-shrink-0">IA</span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {isLoadingTree ? (
                                <div className="flex items-center gap-1.5 py-2 px-1">
                                  <Loader2 className="w-3 h-3 animate-spin text-zinc-400" />
                                  <span className="text-[10px] text-zinc-400">Cargando...</span>
                                </div>
                              ) : treeData?.tree ? (
                                <>
                                  {treeData.tree.children?.filter(child => showFiles || child.name !== "files").map((child, i) => (
                                    <FileTreeNode key={`${child.name}-${i}`} node={child} projectId={project.id} depth={0} parentPath={treeData.tree.name} />
                                  ))}
                                  {/* Acciones en raíz del proyecto */}
                                  {creatingInDir?.projectId === project.id && creatingInDir?.dirPath === "__root__" ? (
                                    <div className="flex items-center gap-1 py-0.5 px-1" style={{ paddingLeft: 4 }}>
                                      <Folder className="w-3 h-3 text-amber-600 flex-shrink-0" />
                                      <input
                                        ref={newFolderRef}
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === "Enter") handleCreateFolder(project.id, null);
                                          if (e.key === "Escape") { setCreatingInDir(null); setNewFolderName(""); }
                                        }}
                                        onBlur={() => handleCreateFolder(project.id, null)}
                                        placeholder="nombre carpeta..."
                                        className="flex-1 text-[10px] px-1 py-0 border-b border-zinc-300 focus:border-zinc-900 outline-none bg-transparent"
                                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                      />
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-0.5 py-0.5" style={{ paddingLeft: 4 }}>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <button
                                            type="button"
                                            className="flex items-center gap-1 px-1 py-0 text-[10px] text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                                          >
                                            <Plus className="w-2.5 h-2.5" />
                                            Añadir
                                          </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="rounded-lg border border-zinc-200 shadow-md min-w-[160px]">
                                          <DropdownMenuItem
                                            className="rounded-lg text-xs cursor-pointer"
                                            onClick={() => {
                                              setCreateFileProjectId(project.id);
                                              setCreateFileOpen(true);
                                            }}
                                          >
                                            <FileText className="w-3.5 h-3.5 mr-2" />
                                            Nuevo elemento
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            className="rounded-lg text-xs cursor-pointer"
                                            onClick={() => {
                                              setCreatingInDir({ projectId: project.id, dirPath: "__root__" });
                                              setNewFolderName("");
                                            }}
                                          >
                                            <FolderPlus className="w-3.5 h-3.5 mr-2" />
                                            Nuevo subdirectorio
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  )}
                                </>
                              ) : null}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Resize handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-blue-400 active:bg-blue-500 transition-colors z-10"
        onMouseDown={startResize}
      />

      {/* --- Edit Dialog --- */}
      <Dialog open={!!editingProject} onOpenChange={(v) => { if (!v) setEditingProject(null); }}>
        <DialogContent className="sm:max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>
              Editar proyecto
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="rounded-lg mt-1"
              />
            </div>
            <div>
              <Label>Descripcion</Label>
              <Input
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="rounded-lg mt-1"
              />
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex gap-2 mt-1.5">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFormColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${formColor === c ? "ring-2 ring-offset-2 ring-zinc-400 scale-110" : "hover:scale-105"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label>Icono</Label>
              <div className="flex gap-2 mt-1.5">
                {ICON_OPTIONS.map((icon) => {
                  const IC = ICON_MAP[icon] || Folder;
                  return (
                    <button
                      key={icon}
                      onClick={() => setFormIcon(icon)}
                      className={`w-9 h-9 flex items-center justify-center transition-all ${
                        formIcon === icon ? "bg-blue-100 text-blue-700 ring-2 ring-blue-300" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                      }`}
                    >
                      <IC className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditingProject(null)} className="rounded-lg text-xs h-8">
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSave} disabled={saving || !formName.trim()} className="rounded-lg text-xs h-8 bg-deep-navy hover:bg-deep-navy/90">
                {saving ? t("common.saving") : t("common.save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- Delete Confirmation --- */}
      <AlertDialog open={!!deletingProject} onOpenChange={(v) => { if (!v) setDeletingProject(null); }}>
        <AlertDialogContent className="rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm font-bold tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>
              {t("proj.delete_project")}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Se eliminara el proyecto "{deletingProject?.name}". Los diagramas NO se eliminaran.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg text-xs h-8">{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-lg text-xs h-8 bg-red-600 hover:bg-red-700"
            >
              {deleting ? t("common.deleting") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- Create Dialog --- */}
      <Dialog open={creating} onOpenChange={(v) => { if (!v) setCreating(false); }}>
        <DialogContent className="sm:max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>
              Nuevo proyecto
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                className="rounded-lg mt-1"
                placeholder="Nombre del proyecto"
              />
            </div>
            <div>
              <Label>Descripcion</Label>
              <Input
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                className="rounded-lg mt-1"
                placeholder="Descripcion breve"
              />
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex gap-2 mt-1.5">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCreateColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${createColor === c ? "ring-2 ring-offset-2 ring-zinc-400 scale-110" : "hover:scale-105"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label>Icono</Label>
              <div className="flex gap-2 mt-1.5">
                {ICON_OPTIONS.map((icon) => {
                  const IC = ICON_MAP[icon] || Folder;
                  return (
                    <button
                      key={icon}
                      onClick={() => setCreateIcon(icon)}
                      className={`w-9 h-9 flex items-center justify-center transition-all ${
                        createIcon === icon ? "bg-blue-100 text-blue-700 ring-2 ring-blue-300" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                      }`}
                    >
                      <IC className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setCreating(false)} className="rounded-lg text-xs h-8">
                {t("common.cancel")}
              </Button>
              <Button onClick={handleCreate} disabled={creatingSaving || !createName.trim()} className="rounded-lg text-xs h-8 bg-deep-navy hover:bg-deep-navy/90">
                {creatingSaving ? t("common.creating") : t("common.create")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- AI Create Dialog --- */}
      <Dialog open={aiOpen} onOpenChange={(v) => { if (!v) resetAi(); }}>
        <DialogContent className="sm:max-w-lg rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold tracking-tight flex items-center gap-2" style={{ fontFamily: "'Chivo', sans-serif" }}>
              <Sparkles className="w-4 h-4 text-blue-600" />
              Nuevo proyecto con IA
            </DialogTitle>
          </DialogHeader>

          {aiStep === "prompt" && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Describe tu proyecto</Label>
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ej: Sistema de gestion de pedidos online con registro de clientes, catalogo de productos, carrito de compras, proceso de pago..."
                  className="rounded-lg min-h-[100px] text-sm"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>MODELO IA</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "deepseek-pro", label: "DeepSeek V4 Pro", desc: "1M contexto" },
                    { value: "minimax", label: "MiniMax M3", desc: "1M contexto" },
                    { value: "mimo", label: "MiMo-V2-Pro", desc: "1M contexto" },
                    { value: "opencode", label: "OpenCode Zen", desc: "Pay-as-you-go" },
                    { value: "opencode-go", label: "OpenCode Go", desc: "Suscripción" },
                  ].map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setAiProvider(m.value)}
                      className={`text-left p-3 border-2 transition-all ${
                        aiProvider === m.value ? "border-blue-600 bg-blue-50" : "border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      <span className="text-xs font-bold block">{m.label}</span>
                      <span className="text-[10px] text-zinc-400" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={resetAi} className="rounded-lg text-xs h-8">{t("common.cancel")}</Button>
                <Button onClick={handleAiPlan} disabled={!aiPrompt.trim()} className="bg-blue-600 hover:bg-blue-700 rounded-lg text-xs h-8">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Planificar Diagramas
                </Button>
              </div>
            </div>
          )}

          {aiStep === "planning" && (
            <div className="flex flex-col items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
              <p className="text-sm text-zinc-500">Planificando proyecto...</p>
            </div>
          )}

          {aiStep === "review" && aiPlan && (
            <div className="space-y-4">
              <div className="bg-zinc-50 border border-zinc-200 p-4">
                <h3 className="text-sm font-bold text-zinc-900 mb-1" style={{ fontFamily: "'Chivo', sans-serif" }}>
                  {aiPlan.project_name}
                </h3>
                <p className="text-xs text-zinc-500">{aiPlan.project_description}</p>
              </div>
              <div>
                <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  Diagramas ({aiPlan.diagrams?.length || 0})
                </Label>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {aiPlan.diagrams?.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 py-1 px-2 border border-zinc-100 bg-white text-xs text-zinc-700">
                      <span className="text-[10px] font-bold text-zinc-400 w-5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{i + 1}</span>
                      {d.name || d}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setAiStep("prompt")} className="rounded-lg text-xs h-8">Volver</Button>
                <Button onClick={handleAiGenerate} className="bg-blue-600 hover:bg-blue-700 rounded-lg text-xs h-8">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generar {aiPlan.diagrams?.length} Diagramas
                </Button>
              </div>
            </div>
          )}

          {aiStep === "generating" && (
            <div className="flex flex-col items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
              <p className="text-sm text-zinc-500">Generando diagramas...</p>
            </div>
          )}

          {aiStep === "done" && aiResult && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-4 text-center">
                <p className="text-sm font-bold text-emerald-800" style={{ fontFamily: "'Chivo', sans-serif" }}>
                  Proyecto creado
                </p>
                <p className="text-xs text-emerald-600 mt-1">{aiResult.project_name}</p>
              </div>
              {aiResult.diagrams?.length > 0 && (
                <div>
                  <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    Diagramas generados
                  </Label>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {aiResult.diagrams.map((d, i) => (
                      <div key={i} className="flex items-center gap-2 py-1.5 px-2 border border-zinc-100 bg-white text-xs">
                        <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                        <span className="text-zinc-700">{d.name || d}</span>
                        {d.status === "error" && <span className="text-red-500 text-[10px] ml-auto">error</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end pt-2">
                <Button onClick={resetAi} className="rounded-lg text-xs h-8 bg-deep-navy hover:bg-deep-navy/90">
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* --- Create File Dialog --- */}
      <CreateFileDialog
        open={createFileOpen}
        onClose={() => setCreateFileOpen(false)}
        onCreate={handleCreateFile}
        files={[]}
        parentId={null}
      />

      <AiLoadingOverlay
        show={aiStep === "generating"}
        statusText="Generando diagramas BPMN..."
        subText="DeepSeek V4 esta creando los diagramas del proyecto. Esto puede tardar 30-60 segundos."
      />
    </aside>
  );
}

export default React.memo(ProjectTree);
