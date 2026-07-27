// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect, useCallback } from "react";
import { useUpgradeModal } from "@/contexts/UpgradeModalContext";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, API } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Workflow,
  Plus,
  Search,
  FolderOpen,
  Folder,
  Briefcase,
  Building2,
  Rocket,
  Zap,
  Target,
  Globe,
  Layers,
  FileCode,
  MoreVertical,
  Edit,
  Trash2,
  LayoutDashboard,
  Library,
  Code2,
  Puzzle,
  LogOut,
  Settings,
  FolderKanban,
  Clock,
  Upload,
  Sparkles,
  Loader2,
  Cpu,
  Check,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { getAuthHeaders } from "@/lib/api";
import ProjectMenuBar from "@/components/ProjectMenuBar";
import ProjectTree from "@/components/ProjectTree";
import FilePreviewPanel from "@/components/FilePreviewPanel";
import AiLoadingOverlay from "@/components/AiLoadingOverlay";
import FreePlanBanner from "@/components/FreePlanBanner";

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

const COLOR_OPTIONS = [
  "#7C3AED", "#2563EB", "#059669", "#D97706",
  "#DC2626", "#DB2777", "#4F46E5", "#0891B2",
];

const ICON_OPTIONS = ["folder", "briefcase", "building", "rocket", "zap", "target", "globe", "layers"];

const ProjectsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { handleResponse: handleUpgradeResponse } = useUpgradeModal();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [deleteProject, setDeleteProject] = useState(null);

  // Sidebar tree state
  const [treeOpen, setTreeOpen] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const handleFileSelect = async ({ name, path, content, projectId, _projectFileId }) => {
    let fileContent = content || "";
    let fileId = _projectFileId || null;

    // If content is empty (e.g. user-created files or GitHub-synced files), fetch from API
    if (!fileContent && fileId) {
      try {
        const res = await fetch(`${API}/projects/${projectId}/files/${fileId}`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const fileData = await res.json();
          fileContent = fileData.content || "";
        }
      } catch { /* fallback to empty */ }
    }
    if (!fileContent && !fileId && projectId) {
      // Fallback: find by name in project_files
      try {
        const res = await fetch(`${API}/projects/${projectId}/files`, {
          headers: getAuthHeaders(),
        });
        if (res.ok) {
          const projectFiles = await res.json();
          const match = projectFiles.find((f) => f.name === name && f.type === "file");
          if (match) {
            fileId = match.id;
            fileContent = match.content || "";
          }
        }
      } catch { /* fallback to empty */ }
    }
    setSelectedFile({ name, path, content: fileContent, projectId, id: fileId });
  };
  const handleCloseFile = () => setSelectedFile(null);
  const handleFileDelete = async (node, projectId) => {
    setConfirmDelete({ node, projectId });
  };

  const confirmDeleteFile = async () => {
    const { node, projectId } = confirmDelete;
    setConfirmDelete(null);
    try {
      await fetch(`${API}/projects/${projectId}/files/${node._projectFileId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      setSelectedFile(null);
    } catch { /* silent */ }
  };

  // Form state
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formColor, setFormColor] = useState(COLOR_OPTIONS[0]);
  const [formIcon, setFormIcon] = useState("folder");
  const [formTags, setFormTags] = useState("");
  // AI brief: free-text description that the system can convert into MoSCoW + RACI requirements
  const [formBrief, setFormBrief] = useState("");
  const [formAiModel, setFormAiModel] = useState("deepseek-pro");
  // Generation phase tracking for the inline stepper
  const [aiPhase, setAiPhase] = useState(null); // null | "creating" | "requirements" | "done"
  const [aiResultSummary, setAiResultSummary] = useState(null);

  // AI Project state
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiProvider, setAiProvider] = useState("minimax");
  const [aiStep, setAiStep] = useState("prompt"); // prompt | planning | review | generating | done
  const [aiPlan, setAiPlan] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [aiProgress, setAiProgress] = useState(0);

  // Templates state
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [instantiatingId, setInstantiatingId] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch(`${API}/projects`, { headers: getAuthHeaders() });
      if (res.ok) setProjects(await res.json());
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetForm = () => {
    setFormName("");
    setFormDesc("");
    setFormColor(COLOR_OPTIONS[0]);
    setFormIcon("folder");
    setFormTags("");
    setFormBrief("");
    setFormAiModel("deepseek-pro");
    setAiPhase(null);
    setAiResultSummary(null);
  };

  const openCreate = () => {
    resetForm();
    setEditProject(null);
    setCreateOpen(true);
  };

  const openEdit = (project) => {
    setFormName(project.name);
    setFormDesc(project.description || "");
    setFormColor(project.color || COLOR_OPTIONS[0]);
    setFormIcon(project.icon || "folder");
    setFormTags((project.tags || []).join(", "));
    setEditProject(project);
    setCreateOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error(t("projects.name_required"));
      return;
    }
    const tgs = formTags.split(",").map(s => s.trim()).filter(Boolean);
    const body = { name: formName, description: formDesc, color: formColor, icon: formIcon, tags: tgs };

    try {
      if (editProject) {
        const res = await fetch(`${API}/projects/${editProject.id}`, {
          method: "PUT", headers: getAuthHeaders(), body: JSON.stringify(body),
        });
        if (res.ok) {
          toast.success(t("projects.updated"));
          fetchProjects();
        }
      } else {
        const res = await fetch(`${API}/projects`, {
          method: "POST", headers: getAuthHeaders(), body: JSON.stringify(body),
        });
        if (res.ok) {
          const created = await res.json();
          const briefTrimmed = formBrief.trim();
          // Optional: if the user provided a free-text brief, fire AI requirement generation.
          if (briefTrimmed.length >= 30) {
            setAiPhase("requirements");
            try {
              const aiRes = await fetch(
                `${API}/ai-projects/${created.id}/generate-requirements`,
                {
                  method: "POST",
                  headers: getAuthHeaders(),
                  body: JSON.stringify({
                    brief: briefTrimmed,
                    model: formAiModel,
                    target_count: 10,
                  }),
                },
              );
              if (aiRes.ok) {
                const data = await aiRes.json();
                setAiPhase("done");
                setAiResultSummary({
                  count: data.requirements_created,
                  spec_id: data.spec_id,
                  summary: data.summary,
                });
                toast.success(
                  `${t("projects.created")} · ${data.requirements_created} requirements generados con IA`,
                );
                fetchProjects();
                // Keep the dialog open briefly so the user sees the result then auto-close
                setTimeout(() => {
                  setCreateOpen(false);
                  resetForm();
                  navigate(`/projects/${created.id}`);
                }, 2200);
                return;
              } else {
                const err = await aiRes.json().catch(() => ({}));
                toast.error(
                  err.detail ||
                    "El proyecto se creo pero la generacion IA fallo. Puedes reintentar dentro del proyecto.",
                );
                setAiPhase(null);
              }
            } catch {
              toast.error(
                "El proyecto se creo pero la generacion IA fallo. Reintenta dentro del proyecto.",
              );
              setAiPhase(null);
            }
          } else {
            toast.success(t("projects.created"));
          }
          fetchProjects();
        } else {
          let parsed = null;
          try { parsed = await res.json(); } catch {}
          // Close the create dialog before showing upgrade modal so it doesn't intercept clicks
          setCreateOpen(false);
          resetForm();
          const handled = await handleUpgradeResponse({
            status: res.status,
            data: parsed,
            type: "projects",
            message: "Has alcanzado el limite del plan Free (1 proyecto). Sube a Pro para proyectos ilimitados.",
            upgrade_url: "/pricing#pro",
          });
          if (!handled) toast.error(t("projects.err_save"));
          return;
        }
      }
      setCreateOpen(false);
      resetForm();
    } catch (err) {
      toast.error(t("projects.err_save"));
    }
  };

  const handleDelete = async () => {
    if (!deleteProject) return;
    try {
      await fetch(`${API}/projects/${deleteProject.id}`, {
        method: "DELETE", headers: getAuthHeaders(),
      });
      toast.success(t("projects.deleted"));
      setDeleteProject(null);
      fetchProjects();
    } catch (err) {
      toast.error(t("projects.err_delete"));
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API}/auth/logout`, { method: "POST", headers: getAuthHeaders() });
      document.cookie = "session_token=; path=/; max-age=0";
      localStorage.removeItem("session_token");
      navigate("/login");
    } catch (_) {}
  };

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleImportProject = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const isZip = /\.zip$/i.test(file.name) || file.type === "application/zip";
    try {
      let res;
      if (isZip) {
        res = await fetch(`${API}/projects/import`, {
          method: "POST",
          headers: { ...getAuthHeaders(), "Content-Type": "application/zip" },
          body: file,
        });
      } else {
        const text = await file.text();
        try {
          const data = JSON.parse(text);
          if (data.format !== "bpmn-modeler-export" && data.format !== "bpmn-modeler-zip-export") {
            toast.error(t("projects.invalid_file"));
            return;
          }
        } catch {
          toast.error(t("projects.invalid_json"));
          return;
        }
        res = await fetch(`${API}/projects/import`, {
          method: "POST",
          headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
          body: text,
        });
      }
      if (res.ok) {
        const result = await res.json();
        const fmt = result.source_format ? ` [${result.source_format.toUpperCase()}]` : "";
        const extras = [];
        if (result.imported_specifications) extras.push(`${result.imported_specifications} specs`);
        if (result.imported_requirements) extras.push(`${result.imported_requirements} reqs`);
        if (result.imported_element_links) extras.push(`${result.imported_element_links} links`);
        const suffix = extras.length ? ` · ${extras.join(" · ")}` : "";
        toast.success(
          `${t("projects.imported_ok")}${fmt}: ${result.imported_diagrams} ${t("projects.imported_diags")}${suffix}`
        );
        if (Array.isArray(result.warnings) && result.warnings.length) {
          result.warnings.forEach((w) => toast.warning(w));
        }
        fetchProjects();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || t("projects.err_import"));
      }
    } catch (err) {
      toast.error(t("projects.invalid_json"));
    }
    event.target.value = "";
  };

  const openTemplates = async () => {
    setTemplatesOpen(true);
    if (templates.length > 0) return;
    try {
      const res = await fetch(`${API}/projects/templates/list`, { headers: getAuthHeaders() });
      if (res.ok) {
        setTemplates(await res.json());
      } else {
        toast.error("No se pudieron cargar las plantillas");
      }
    } catch (err) {
      toast.error("Error cargando plantillas");
    }
  };

  const handleUseTemplate = async (templateId) => {
    setInstantiatingId(templateId);
    try {
      const res = await fetch(`${API}/projects/templates/${templateId}/instantiate`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const result = await res.json();
        toast.success(`Proyecto creado: ${result.project_name}`);
        setTemplatesOpen(false);
        fetchProjects();
        navigate(`/projects/${result.project_id}`);
      } else {
        let parsed = null;
        try { parsed = await res.json(); } catch {}
        const handled = await handleUpgradeResponse({
          status: res.status,
          data: parsed,
          type: "projects",
          message: "Has alcanzado el limite del plan Free (1 proyecto). Sube a Pro para crear proyectos desde plantillas.",
          upgrade_url: "/pricing#pro",
        });
        if (!handled) toast.error("No se pudo crear el proyecto desde la plantilla");
      }
    } catch (err) {
      toast.error("Error instanciando plantilla");
    } finally {
      setInstantiatingId(null);
    }
  };

  const handleAiPlan = async () => {
    if (!aiPrompt.trim()) return;
    setAiStep("planning");
    try {
      const res = await fetch(`${API}/ai/generate-project`, {
        method: "POST",
        headers: getAuthHeaders(),
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
    setAiProgress(0);
    try {
      const res = await fetch(`${API}/ai/generate-project-diagrams`, {
        method: "POST",
        headers: getAuthHeaders(),
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
        fetchProjects();
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

  const resetAi = () => {
    setAiOpen(false);
    setAiPrompt("");
    setAiPlan(null);
    setAiResult(null);
    setAiStep("prompt");
    setAiProgress(0);
  };


  const navItems = [
    { label: t("nav.dashboard"), icon: <LayoutDashboard className="w-4 h-4" />, path: "/dashboard" },
    { label: t("nav.projects"), icon: <FolderKanban className="w-4 h-4" />, path: "/projects", active: true },
    { label: t("nav.library"), icon: <Library className="w-4 h-4" />, path: "/library" },
    { label: t("nav.oop_classes"), icon: <Code2 className="w-4 h-4" />, path: "/oop-classes" },
    { label: t("nav.components"), icon: <Puzzle className="w-4 h-4" />, path: "/components" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col" data-testid="projects-loading">
        <ProjectMenuBar />
        <div className="flex flex-1">
          <div className="w-56 border-r border-zinc-200 p-3 space-y-2">
            <div className="animate-pulse h-4 bg-zinc-100 w-3/4" />
            <div className="animate-pulse h-3 bg-zinc-50 w-1/2" />
            <div className="animate-pulse h-3 bg-zinc-50 w-2/3" />
          </div>
          <main className="flex-1 p-6 space-y-4">
            <div className="animate-pulse h-8 bg-zinc-100 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-zinc-200 p-4 space-y-3">
                  <div className="animate-pulse h-4 bg-zinc-100 w-3/4" />
                  <div className="animate-pulse h-3 bg-zinc-50 w-full" />
                  <div className="animate-pulse h-3 bg-zinc-50 w-1/2" />
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  const hasNoProjects = !loading && projects.length === 0;

  return (
    <>
    <div className="min-h-screen bg-white flex flex-col" data-testid="projects-page">
      <ProjectMenuBar />
      <div className="flex flex-1 overflow-hidden">

      <ProjectTree
        isOpen={treeOpen}
        onToggle={() => setTreeOpen(v => !v)}
        projects={projects}
        loading={loading}
        onFileSelect={handleFileSelect}
        onFileDelete={handleFileDelete}
      />

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <FreePlanBanner />
        {hasNoProjects ? (
          <div className="flex items-center justify-center py-20 px-6">
            <div className="max-w-md w-full text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-blue-50 flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-zinc-900" style={{ fontFamily: "'Chivo', sans-serif" }}>
                  Sin proyectos aun
                </h2>
                <p className="text-sm text-zinc-500">
                  Crea tu primer proyecto o usa una plantilla para empezar rapidamente.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Button onClick={openCreate} data-testid="empty-create-project" className="bg-deep-navy hover:bg-deep-navy/90 text-white font-semibold rounded-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear proyecto
                </Button>
                <Button variant="outline" onClick={openTemplates} className="rounded-lg">
                  <Library className="w-4 h-4 mr-2" />
                  Ver plantillas
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
        <header className="sticky top-0 z-30 bg-white border-b border-zinc-200 h-14 flex items-center justify-between px-6">
            <h1 className="text-base font-bold text-zinc-900 tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>{t("projects.title")}</h1>
            <div className="flex items-center gap-2">
              {isAuthenticated && (
              <>
                <Button variant="outline" size="sm" onClick={openTemplates} data-testid="templates-btn" className="rounded-lg h-8 text-xs">
                  <Library className="w-3.5 h-3.5 mr-1.5" />
                  Plantillas
                </Button>
                <Button variant="outline" size="sm" asChild className="rounded-lg h-8 text-xs" data-testid="import-project-btn">
                  <label className="cursor-pointer">
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Importar
                    <input type="file" accept=".json,.zip,application/json,application/zip" onChange={handleImportProject} className="hidden" />
                  </label>
                </Button>
                <Button onClick={openCreate} data-testid="create-project-btn" size="sm" className="bg-deep-navy hover:bg-deep-navy/90 text-white rounded-lg h-8 text-xs font-semibold">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Nuevo Proyecto
                </Button>
                <Button onClick={() => setAiOpen(true)} data-testid="ai-project-btn" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-8 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Proyecto con IA
                </Button>
              </>
              )}
              {!isAuthenticated && (
                <Button onClick={() => navigate("/login")} data-testid="login-btn" variant="outline" size="sm" className="rounded-lg h-8 text-xs">
                  Iniciar Sesion
                </Button>
              )}
            </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("projects.search_placeholder")}
              className="pl-9 rounded-lg h-9 text-sm"
              data-testid="search-projects-input"
            />
          </div>

          {/* Projects Grid */}
          {loading ? (
            <p className="text-sm text-zinc-400 font-mono py-16 text-center">Cargando proyectos...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <FolderOpen className="w-8 h-8 text-zinc-200 mx-auto mb-4" />
              <h3 className="text-sm font-semibold text-zinc-900 mb-2">
                {search ? t("common.no_results") : t("projects.no_projects")}
              </h3>
              <p className="text-xs text-zinc-400 mb-4">
                {search ? "" : t("projects.no_projects_sub")}
              </p>
              {!search && isAuthenticated && (
                <Button onClick={openCreate} size="sm" className="bg-deep-navy hover:bg-deep-navy/90 rounded-lg text-xs">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Crear Proyecto
                </Button>
              )}
            </div>
          ) : (
            <div className="bento-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border border-zinc-200">
              {filtered.map((project) => {
                const IconComp = ICON_MAP[project.icon] || Folder;
                return (
                  <div
                    key={project.id}
                    className="group hover:bg-zinc-50 transition-colors"
                    data-testid={`project-card-${project.id}`}
                  >
                    <Link to={`/projects/${project.id}`} className="block p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-8 h-8 border border-zinc-200 flex items-center justify-center flex-shrink-0">
                          <IconComp className="w-4 h-4 text-zinc-600" />
                        </div>
                        {isAuthenticated && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                              onClick={(e) => e.preventDefault()}
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-lg">
                            <DropdownMenuItem onClick={(e) => { e.preventDefault(); openEdit(project); }} className="rounded-lg text-xs">
                              <Edit className="w-3.5 h-3.5 mr-2" />Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => { e.preventDefault(); setDeleteProject(project); }} className="text-red-600 rounded-lg text-xs">
                              <Trash2 className="w-3.5 h-3.5 mr-2" />Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-zinc-900 mb-1">{project.name}</h3>
                      {project.description && (
                        <p className="text-xs text-zinc-400 mb-3 line-clamp-2">{project.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                          {project.diagram_count || 0} diagramas
                        </p>
                        {project.tags?.length > 0 && (
                          <div className="flex gap-1">
                            {project.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="text-[10px] px-1.5 py-0.5 border border-zinc-200 text-zinc-500" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
          </>
        )}
      </main>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editProject ? t("projects.edit_title") : t("projects.new_project")}</DialogTitle>
            <DialogDescription>
              {editProject ? "Modifica los datos del proyecto" : "Crea un proyecto para agrupar diagramas BPMN"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ej: Sistema de Ventas"
                data-testid="project-name-input"
              />
            </div>
            <div>
              <Label>Descripcion</Label>
              <Textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Describe el proyecto..."
                rows={3}
              />
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex gap-2 mt-1.5">
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c}
                    onClick={() => setFormColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${formColor === c ? "ring-2 ring-offset-2 ring-zinc-400 scale-110" : "hover:scale-105"}`}
                    style={{ backgroundColor: c }}
                    data-testid={`color-option-${c}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label>Icono</Label>
              <div className="flex gap-2 mt-1.5">
                {ICON_OPTIONS.map(icon => {
                  const IC = ICON_MAP[icon] || Folder;
                  return (
                    <button
                      key={icon}
                      onClick={() => setFormIcon(icon)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                        formIcon === icon ? "bg-blue-100 text-blue-700 ring-2 ring-blue-300" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                      }`}
                    >
                      <IC className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <Label>Tags (separados por coma)</Label>
              <Input
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="ventas, ecommerce, produccion"
              />
            </div>

            {!editProject && (
              <div className="border-t border-zinc-200 pt-4 mt-2 space-y-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <Label
                      className="text-[11px] uppercase tracking-[0.15em] font-bold text-zinc-700"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      Generar requirements con IA <span className="text-zinc-400 normal-case font-normal">(opcional)</span>
                    </Label>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Describe lo que quieres construir y la IA generara los requirements MoSCoW + RACI automaticamente.
                    </p>
                  </div>
                </div>
                <Textarea
                  value={formBrief}
                  onChange={(e) => setFormBrief(e.target.value)}
                  placeholder="Ej: Quiero una plataforma de onboarding de candidatos. Reclutadores suben CVs PDF, el sistema valida y extrae datos con IA, notifica al hiring manager. Debe cumplir GDPR..."
                  rows={4}
                  maxLength={4000}
                  disabled={aiPhase !== null && aiPhase !== "done"}
                  className="rounded-lg text-sm"
                  data-testid="ai-brief-textarea"
                />
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] text-zinc-500 uppercase tracking-wider"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      Modelo IA
                    </span>
                    <Select value={formAiModel} onValueChange={setFormAiModel} disabled={aiPhase !== null && aiPhase !== "done"}>
                      <SelectTrigger className="h-8 rounded-lg text-xs w-40" data-testid="ai-model-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                        <SelectItem value="deepseek-pro" className="text-xs">DeepSeek V4-Pro (1M ctx)</SelectItem>
                        <SelectItem value="deepseek-flash" className="text-xs">DeepSeek V4-Flash</SelectItem>
                        <SelectItem value="minimax" className="text-xs">MiniMax M3</SelectItem>
                        <SelectItem value="mimo" className="text-xs">MiMo-V2-Pro (1M ctx)</SelectItem>
                        <SelectItem value="opencode" className="text-xs">OpenCode Zen</SelectItem>
                        <SelectItem value="opencode-go" className="text-xs">OpenCode Go</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <span
                    className={`text-[10px] tracking-wider tabular-nums ${
                      formBrief.length >= 30 ? "text-emerald-700" : "text-zinc-400"
                    }`}
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {formBrief.length}/4000 {formBrief.length >= 30 ? "✓" : "(min 30)"}
                  </span>
                </div>

                {/* Phase indicator */}
                {aiPhase && (
                  <div
                    className="border border-blue-200 bg-blue-50 p-3 flex items-center gap-3"
                    data-testid="ai-phase-indicator"
                  >
                    {aiPhase === "requirements" && (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
                        <div className="flex-1">
                          <div className="text-xs font-bold text-blue-900">Generando requirements...</div>
                          <div className="text-[10px] text-blue-700 mt-0.5">
                            Esto puede tardar 15-45s. La IA analiza tu descripcion y genera MoSCoW + RACI.
                          </div>
                        </div>
                      </>
                    )}
                    {aiPhase === "done" && aiResultSummary && (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div className="flex-1">
                          <div className="text-xs font-bold text-emerald-900" data-testid="ai-result-summary">
                            ✓ {aiResultSummary.count} requirements generados
                          </div>
                          <div className="text-[10px] text-emerald-700 mt-0.5 line-clamp-2">
                            {aiResultSummary.summary}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} data-testid="save-project-btn" className="bg-blue-600 hover:bg-blue-700">
              {editProject ? t("common.save") : t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProject} onOpenChange={(open) => !open && setDeleteProject(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar proyecto</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminara el proyecto "{deleteProject?.name}". Los diagramas NO se eliminaran.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700" data-testid="confirm-delete-project">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Templates Dialog */}
      <Dialog open={templatesOpen} onOpenChange={setTemplatesOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col" data-testid="templates-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Library className="w-5 h-5 text-blue-600" />
              Plantillas de Proyecto
            </DialogTitle>
            <DialogDescription>
              Empieza con un proyecto preconfigurado: cada plantilla incluye diagramas BPMN listos para usar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-y-auto py-2" data-testid="templates-grid">
            {templates.length === 0 && (
              <div className="col-span-2 flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
              </div>
            )}
            {templates.map((tpl) => {
              const Icon = ICON_MAP[tpl.icon] || Folder;
              const isLoading = instantiatingId === tpl.id;
              return (
                <div
                  key={tpl.id}
                  className="border-2 border-zinc-200 hover:border-blue-500 transition-colors p-4 flex flex-col gap-2"
                  data-testid={`template-card-${tpl.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-lg flex-shrink-0"
                      style={{ backgroundColor: `${tpl.color}20`, color: tpl.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-zinc-900">{tpl.name}</h3>
                      <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{tpl.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(tpl.tags || []).slice(0, 4).map((tg) => (
                      <Badge key={tg} variant="secondary" className="text-[10px] rounded-lg">{tg}</Badge>
                    ))}
                  </div>
                  <p className="text-[11px] text-zinc-400" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    {tpl.diagrams_count} DIAGRAMA{tpl.diagrams_count === 1 ? "" : "S"}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => handleUseTemplate(tpl.id)}
                    disabled={isLoading || instantiatingId !== null}
                    className="bg-deep-navy hover:bg-deep-navy/90 text-white rounded-lg h-8 text-xs mt-auto"
                    data-testid={`use-template-${tpl.id}-btn`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Usar plantilla
                  </Button>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplatesOpen(false)} className="rounded-lg">Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Project Dialog */}
      <Dialog open={aiOpen} onOpenChange={(v) => { if (!v) resetAi(); }}>
        <DialogContent className="max-w-2xl" data-testid="ai-project-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Generar Proyecto con IA
            </DialogTitle>
            <DialogDescription>
              Describe tu proyecto o negocio y la IA generara todos los diagramas BPMN necesarios.
            </DialogDescription>
          </DialogHeader>

          {aiStep === "prompt" && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold mb-2 block">Describe tu proyecto</Label>
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Ej: Sistema de gestion de pedidos online con registro de clientes, catalogo de productos, carrito de compras, proceso de pago, gestion de envios y atencion al cliente..."
                  className="rounded-lg min-h-[120px] text-sm"
                  data-testid="ai-project-prompt"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>MODELO IA</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
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
                      data-testid={`ai-model-${m.value}`}
                    >
                      <span className="text-xs font-bold block">{m.label}</span>
                      <span className="text-[10px] text-zinc-400" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetAi} className="rounded-lg">Cancelar</Button>
                <Button onClick={handleAiPlan} disabled={!aiPrompt.trim()} className="bg-blue-600 hover:bg-blue-700 rounded-lg" data-testid="ai-plan-btn">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Planificar Diagramas
                </Button>
              </DialogFooter>
            </div>
          )}

          {aiStep === "planning" && (
            <div className="flex flex-col items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
              <p className="text-sm font-semibold text-zinc-900">Analizando tu proyecto...</p>
              <p className="text-xs text-zinc-400 mt-1">La IA esta determinando que diagramas BPMN necesitas</p>
            </div>
          )}

          {aiStep === "review" && aiPlan && (
            <div className="space-y-4">
              <div className="bg-zinc-50 border border-zinc-200 p-4">
                <p className="text-sm font-bold text-zinc-900">{aiPlan.project_name}</p>
                <p className="text-xs text-zinc-500 mt-1">{aiPlan.project_description}</p>
              </div>
              <div>
                <Label className="text-sm font-semibold mb-2 block" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  {aiPlan.diagrams?.length || 0} DIAGRAMAS A GENERAR
                </Label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {aiPlan.diagrams?.map((d, i) => (
                    <div key={`plan-${i}`} className="border border-zinc-200 p-3 flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">{d.name}</p>
                        <p className="text-xs text-zinc-500">{d.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAiStep("prompt")} className="rounded-lg">Volver</Button>
                <Button onClick={handleAiGenerate} className="bg-blue-600 hover:bg-blue-700 rounded-lg" data-testid="ai-generate-btn">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generar {aiPlan.diagrams?.length} Diagramas
                </Button>
              </DialogFooter>
            </div>
          )}

          {aiStep === "generating" && (
            <div className="flex flex-col items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
              <p className="text-sm font-semibold text-zinc-900">Generando diagramas BPMN...</p>
              <p className="text-xs text-zinc-400 mt-1">Esto puede tardar 30-60 segundos</p>
            </div>
          )}

          {aiStep === "done" && aiResult && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 p-4 text-center">
                <Check className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-emerald-900">Proyecto creado</p>
                <p className="text-xs text-emerald-700 mt-1">"{aiResult.project_name}"</p>
              </div>
              <div className="space-y-1.5">
                {aiResult.diagrams?.map((d, i) => (
                  <div key={`res-${i}`} className="flex items-center gap-2 text-sm">
                    {d.status === "ok" ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className={d.status === "ok" ? "text-zinc-800" : "text-red-600"}>{d.name}</span>
                    {d.status === "error" && <span className="text-[10px] text-red-400">{d.error}</span>}
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetAi} className="rounded-lg">Cerrar</Button>
                <Button onClick={() => { resetAi(); navigate(`/projects/${aiResult.project_id}`); }} className="bg-blue-600 hover:bg-blue-700 rounded-lg" data-testid="ai-open-project-btn">
                  Abrir Proyecto
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <FilePreviewPanel file={selectedFile} onClose={handleCloseFile} projectId={selectedFile?.projectId} />

      <AiLoadingOverlay
        show={aiStep === "generating"}
        statusText="Generando diagramas BPMN..."
        subText="DeepSeek V4 esta creando los diagramas. Esto puede tardar 30-60 segundos."
      />
    </div>
    <ConfirmDialog
      open={!!confirmDelete}
      onOpenChange={(open) => { if (!open) setConfirmDelete(null); }}
      title="Eliminar archivo"
      description={`¿Eliminar "${confirmDelete?.node?.name}"?`}
      onConfirm={confirmDeleteFile}
    />
    </>
  );
};

export default ProjectsPage;
