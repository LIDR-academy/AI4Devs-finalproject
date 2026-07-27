// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, API } from "@/App";
import { getAuthHeaders } from "@/lib/api";
import ImpactOfChangeWidget from "@/components/ImpactOfChangeWidget";
import TeamMetricsWidget from "@/components/TeamMetricsWidget";
import VersionsWidget from "@/components/VersionsWidget";
import FreePlanBanner from "@/components/FreePlanBanner";
import OnboardingWizard from "@/components/OnboardingWizard";
import ProjectMenuBar from "@/components/ProjectMenuBar";
import ProjectTree from "@/components/ProjectTree";
import FilePreviewPanel from "@/components/FilePreviewPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Workflow, Plus, Star, StarOff, GitBranch, FileCode,
  Bell, LogOut, Settings, LayoutDashboard, Library, Code2, Puzzle,
  ChevronRight, FolderKanban, Folder, Briefcase, Building2,
  Rocket, Zap, Target, Globe, Layers, ArrowUpRight, Languages, Shield, Users, Cpu, FileText,
} from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { LanguageSelector } from "@/components/LanguageSelector";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [stats, setStats] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [treeOpen, setTreeOpen] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [createDiagramOpen, setCreateDiagramOpen] = useState(false);
  const [createSpecOpen, setCreateSpecOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [newDiagramName, setNewDiagramName] = useState("");
  const [newDiagramDesc, setNewDiagramDesc] = useState("");
  const [newSpecName, setNewSpecName] = useState("");
  const [newSpecDesc, setNewSpecDesc] = useState("");
  const [newSpecProjectId, setNewSpecProjectId] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  useEffect(() => { fetchDashboardData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!loading && projects.length === 0 && !stats?.total_projects) {
      const onboardingDone = localStorage.getItem(`onboarding_done_${user?.email}`);
      if (!onboardingDone) setShowOnboarding(true);
    }
  }, [loading, projects, stats, user?.email]);

  const fetchDashboardData = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      const [statsRes, favoritesRes, notificationsRes, unreadRes] = await Promise.all([
        fetch(`${API}/stats`, { headers }),
        fetch(`${API}/favorites`, { headers }),
        fetch(`${API}/notifications`, { headers }),
        fetch(`${API}/notifications/unread-count`, { headers })
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (favoritesRes.ok) setFavorites(await favoritesRes.json());
      if (notificationsRes.ok) setNotifications(await notificationsRes.json());
      if (unreadRes.ok) { const data = await unreadRes.json(); setUnreadCount(data.count); }
      const projectsRes = await fetch(`${API}/projects`, { headers });
      if (projectsRes.ok) setProjects(await projectsRes.json());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = document.cookie.split("session_token=")[1]?.split(";")[0] || "";
      await fetch(`${API}/auth/logout`, { method: "POST", headers: { "Authorization": `Bearer ${token}` } });
      document.cookie = "session_token=; path=/; max-age=0";
      navigate("/login");
    } catch (error) { console.error("Logout error:", error); }
  };

  const removeFavorite = async (diagramId) => {
    try {
      const token = document.cookie.split("session_token=")[1]?.split(";")[0] || "";
      await fetch(`${API}/favorites/${diagramId}`, { method: "DELETE", headers: { "Authorization": `Bearer ${token}` } });
      setFavorites(favorites.filter(f => f.diagram_id !== diagramId));
      toast.success(t("dash.removed_fav"));
    } catch (error) { toast.error(t("dash.err_remove_fav")); }
  };

  const markNotificationRead = async (notificationId) => {
    try {
      const token = document.cookie.split("session_token=")[1]?.split(";")[0] || "";
      await fetch(`${API}/notifications/${notificationId}/read`, { method: "PUT", headers: { "Authorization": `Bearer ${token}` } });
      setNotifications(notifications.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) { console.error("Error marking notification as read:", error); }
  };

  const handleProjectUpdated = (updatedProject) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const handleProjectDeleted = (projectId) => {
    setProjects(projects.filter(p => p.id !== projectId));
  };

  const handleProjectCreated = (newProject) => {
    setProjects([newProject, ...projects]);
  };

  const handleFileSelect = async ({ name, path, content, projectId, _projectFileId }) => {
    let fileContent = content || "";
    let fileId = _projectFileId || null;
    const token = document.cookie.split("session_token=")[1]?.split(";")[0] || "";
    const headers = { "Authorization": `Bearer ${token}` };

    // If content is empty (e.g. user-created files or GitHub-synced files), fetch from API
    if (!fileContent && fileId) {
      try {
        const res = await fetch(`${API}/projects/${projectId}/files/${fileId}`, { headers });
        if (res.ok) {
          const fileData = await res.json();
          fileContent = fileData.content || "";
        }
      } catch { /* fallback to empty */ }
    }
    if (!fileContent && !fileId && projectId) {
      // Fallback: find by name in project_files
      try {
        const res = await fetch(`${API}/projects/${projectId}/files`, { headers });
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
  const handleCloseFile = () => { setSelectedFile(null); };
  const handleFileDelete = async (node, projectId) => {
    setDeleteConfirm({ node, projectId });
  };

  const confirmDeleteFile = async () => {
    if (!deleteConfirm) return;
    const { node, projectId } = deleteConfirm;
    try {
      await fetch(`${API}/projects/${projectId}/files/${node._projectFileId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      setSelectedFile(null);
      toast.success(`"${node.name}" eliminado`);
    } catch { /* silent */ }
    setDeleteConfirm(null);
  };

  const DEFAULT_BPMN_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                  id="Definitions_1"
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Inicio" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="99" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

  const handleQuickCreateDiagram = async () => {
    if (!newDiagramName.trim()) return;
    setCreateLoading(true);
    try {
      const res = await fetch(`${API}/diagrams`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: newDiagramName.trim(), description: newDiagramDesc.trim(), current_xml: DEFAULT_BPMN_XML }),
      });
      if (res.ok) {
        const diagram = await res.json();
        setCreateDiagramOpen(false);
        setNewDiagramName("");
        setNewDiagramDesc("");
        navigate(`/editor/${diagram.id}`);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || t("dash.err_create_diagram"));
      }
    } catch {
      toast.error(t("dash.err_create_diagram"));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleQuickCreateSpec = async () => {
    if (!newSpecName.trim()) return;
    setCreateLoading(true);
    try {
      const res = await fetch(`${API}/specs/specifications`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: newSpecName.trim(),
          description: newSpecDesc.trim(),
          project_id: newSpecProjectId || null,
        }),
      });
      if (res.ok) {
        const spec = await res.json();
        setCreateSpecOpen(false);
        setNewSpecName("");
        setNewSpecDesc("");
        setNewSpecProjectId("");
        toast.success(t("dash.spec_created"));
        navigate(`/specs/${spec.id}`);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || t("dash.err_create_spec"));
      }
    } catch {
      toast.error(t("dash.err_create_spec"));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleQuickCreateProject = async () => {
    if (!newProjectName.trim()) return;
    setCreateLoading(true);
    try {
      const res = await fetch(`${API}/projects`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: newProjectName.trim(), description: newProjectDesc.trim() }),
      });
      if (res.ok) {
        const created = await res.json();
        handleProjectCreated(created);
        setCreateProjectOpen(false);
        setNewProjectName("");
        setNewProjectDesc("");
        toast.success(t("projects.project_created") || "Proyecto creado");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || t("projects.err_create") || "Error al crear el proyecto");
      }
    } catch {
      toast.error("Error al crear el proyecto");
    } finally {
      setCreateLoading(false);
    }
  };

  const statCards = [
    { label: t("dash.stat_projects"), value: stats?.total_projects || 0, icon: <FolderKanban className="w-4 h-4" /> },
    { label: t("dash.stat_diagrams"), value: stats?.total_diagrams || 0, icon: <FileCode className="w-4 h-4" /> },
    { label: t("dash.stat_versions"), value: stats?.total_versions || 0, icon: <GitBranch className="w-4 h-4" /> },
    { label: t("dash.stat_oop"), value: stats?.total_classes || 0, icon: <Code2 className="w-4 h-4" /> },
  ];

  const navItems = [
    { label: t("nav.dashboard"), icon: <LayoutDashboard className="w-4 h-4" />, path: "/dashboard", active: true },
    { label: t("nav.projects"), icon: <FolderKanban className="w-4 h-4" />, path: "/projects" },
    { label: t("nav.library"), icon: <Library className="w-4 h-4" />, path: "/library" },
    { label: t("nav.oop_classes"), icon: <Code2 className="w-4 h-4" />, path: "/oop-classes" },
    { label: t("nav.components"), icon: <Puzzle className="w-4 h-4" />, path: "/components" },
    { label: "MiniMax AI", icon: <Cpu className="w-4 h-4" />, path: "/ai-assistant" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white" data-testid="dashboard-loading">
        <ProjectMenuBar />
        <div className="flex flex-1">
          <div className="w-56 border-r border-zinc-200 p-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <main className="flex-1 p-6 space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="bento-grid grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-5 border border-zinc-200 space-y-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-12" />
                </div>
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </main>
        </div>
      </div>
    );
  }

  // Empty state: new user with no projects
  const hasNoProjects = !loading && projects.length === 0 && !stats?.total_projects;

  const isAdmin = user?.role === "admin";

  const ICON_MAP_DASH = { folder: Folder, briefcase: Briefcase, building: Building2, rocket: Rocket, zap: Zap, target: Target, globe: Globe, layers: Layers };

  if (hasNoProjects) {
    return (
      <div className="min-h-screen bg-white flex flex-col" data-testid="dashboard-empty">
        <ProjectMenuBar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center space-y-8">
            <div className="mx-auto w-20 h-20 bg-blue-50 flex items-center justify-center rounded-2xl">
              <FolderKanban className="w-10 h-10 text-blue-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-zinc-900" style={{ fontFamily: "'Chivo', sans-serif" }}>
                Bienvenido a BPMN Modeler
              </h2>
              <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                Crea tu primer proyecto para empezar a modelar diagramas BPMN con inteligencia artificial.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/projects" data-testid="empty-create-project">
                <Button className="bg-deep-navy hover:bg-deep-navy/90 text-white font-semibold px-6 rounded-xl">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear proyecto
                </Button>
              </Link>
              <Link to="/editor" data-testid="empty-new-diagram">
                <Button variant="outline" className="font-semibold px-6 rounded-xl">
                  <Workflow className="w-4 h-4 mr-2" />
                  Nuevo diagrama
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <OnboardingWizard
          open={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onComplete={() => {
            setShowOnboarding(false);
            window.location.reload();
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" data-testid="dashboard-page">
      <ProjectMenuBar />

      <div className="flex flex-1 overflow-hidden">
        <ProjectTree
          isOpen={treeOpen}
          onToggle={() => setTreeOpen(v => !v)}
          projects={projects}
          loading={loading}
          onProjectUpdated={handleProjectUpdated}
          onProjectDeleted={handleProjectDeleted}
          onProjectCreated={handleProjectCreated}
          onFileSelect={handleFileSelect}
          onFileDelete={handleFileDelete}
        />

      {/* Main */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <FreePlanBanner />

        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-zinc-200 h-14 flex items-center justify-between px-6">
          <div>
            <h1 className="text-base font-bold text-zinc-900 tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>
              {t("dash.title")}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors" data-testid="notifications-btn">
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 rounded-lg">
                <div className="p-3 border-b border-zinc-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{t("nav.notifications")}</h3>
                </div>
                <ScrollArea className="h-56">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-xs text-zinc-400 text-center">{t("dash.no_notifications")}</p>
                  ) : (
                    notifications.slice(0, 5).map((notif) => (
                      <div key={notif.id} onClick={() => markNotificationRead(notif.id)}
                        className={`p-3 border-b border-zinc-50 cursor-pointer hover:bg-zinc-50 ${!notif.is_read ? "bg-blue-50" : ""}`}>
                        <p className="text-sm text-zinc-900">{notif.message}</p>
                        <p className="text-xs text-zinc-400 mt-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{notif.from_user}</p>
                      </div>
                    ))
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link to="/editor">
              <Button data-testid="new-diagram-btn" size="sm" className="bg-deep-navy hover:bg-deep-navy/90 text-white font-semibold rounded-lg px-4 h-9 text-xs">
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                {t("dash.new_diagram")}
              </Button>
            </Link>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Stats Bento */}
          <div className="bento-grid grid-cols-2 lg:grid-cols-4 border border-zinc-200">
            {statCards.map((stat, index) => (
              <div key={stat.label} className="p-5" data-testid={`stat-card-${index}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-zinc-400">{stat.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    {stat.label}
                  </span>
                </div>
                <p className="text-3xl font-black text-zinc-900 tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Impact of change (MoSCoW) */}
          <ImpactOfChangeWidget limit={8} />

          {/* Team Metrics */}
          <TeamMetricsWidget days={30} />

          {/* Versions overview */}
          <VersionsWidget />

          {/* Projects */}
          {projects.length > 0 && (
            <div data-testid="projects-section">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-zinc-900" style={{ fontFamily: "'Chivo', sans-serif" }}>
                  {t("dash.recent_projects")}
                </h2>
                <Link to="/projects" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                  {t("common.view_all")} <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="bento-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border border-zinc-200">
                {projects.slice(0, 6).map((project) => {
                  const IC = ICON_MAP_DASH[project.icon || "folder"] || Folder;
                  return (
                    <Link key={project.id} to={`/projects/${project.id}`}>
                      <div className="flex items-center gap-3 p-4 hover:bg-zinc-50 transition-colors">
                        <div className="w-8 h-8 border border-zinc-200 flex items-center justify-center flex-shrink-0">
                          <IC className="w-4 h-4 text-zinc-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-zinc-900 truncate">{project.name}</p>
                          <p className="text-xs text-zinc-400" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                            {project.diagram_count || 0} {t("dash.diagrams_count")}
                          </p>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-zinc-300" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-5 gap-6">
            {/* Favorites */}
            <div className="lg:col-span-3 border border-zinc-200" data-testid="favorites-card">
              <div className="flex items-center justify-between p-4 border-b border-zinc-200">
                <h2 className="text-sm font-bold text-zinc-900" style={{ fontFamily: "'Chivo', sans-serif" }}>
                  {t("dash.fav_diagrams")}
                </h2>
                <Star className="w-4 h-4 text-zinc-300" />
              </div>
              <div>
                {favorites.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <Star className="w-8 h-8 text-zinc-200 mx-auto mb-3" />
                    <p className="text-sm text-zinc-400">{t("dash.no_favorites")}</p>
                    <Link to="/library">
                      <Button variant="link" className="text-blue-600 text-xs mt-2 p-0 h-auto">
                        {t("dash.explore_library")}
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div>
                    {favorites.map((fav) => (
                      <div key={fav.id} className="flex items-center justify-between px-4 py-3 border-b border-zinc-50 last:border-b-0 hover:bg-zinc-50 transition-colors">
                        <Link to={`/editor/${fav.diagram_id}`} className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 border border-zinc-200 flex items-center justify-center flex-shrink-0">
                            <FileCode className="w-4 h-4 text-zinc-600" />
                          </div>
                          <span className="text-sm font-medium text-zinc-900 truncate">{fav.diagram_name}</span>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => removeFavorite(fav.diagram_id)} className="text-zinc-300 hover:text-red-500 h-7 w-7">
                          <StarOff className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Activity */}
            <div className="lg:col-span-2 border border-zinc-200" data-testid="activity-card">
              <div className="p-4 border-b border-zinc-200">
                <h2 className="text-sm font-bold text-zinc-900" style={{ fontFamily: "'Chivo', sans-serif" }}>
                  {t("dash.recent_activity")}
                </h2>
              </div>
              <ScrollArea className="h-64">
                {stats?.recent_versions?.length === 0 ? (
                  <p className="p-4 text-xs text-zinc-400 text-center">{t("dash.no_activity")}</p>
                ) : (
                  <div>
                    {stats?.recent_versions?.slice(0, 8).map((version, index) => (
                      <div key={`v-${version.version_number}-${index}`} className="flex items-start gap-3 px-4 py-3 border-b border-zinc-50 last:border-b-0">
                        <div className="w-6 h-6 border border-zinc-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <GitBranch className="w-3 h-3 text-zinc-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-zinc-900">
                            v{version.version_number}
                          </p>
                          <p className="text-xs text-zinc-400 truncate" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                            {version.commit_message || t("dash.no_message")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          {/* Quick Actions */}
          <div data-testid="quick-actions-card">
            <h2 className="text-sm font-bold text-zinc-900 mb-4" style={{ fontFamily: "'Chivo', sans-serif" }}>
              {t("dash.quick_actions")}
            </h2>
            <div className="bento-grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 border border-zinc-200">
              {[
                { to: "/editor", icon: <Plus className="w-5 h-5" />, title: t("dash.qa_new_diagram"), sub: t("dash.qa_new_diagram_sub") },
                { to: "/projects", icon: <FolderKanban className="w-5 h-5" />, title: t("dash.qa_projects"), sub: t("dash.qa_projects_sub") },
                { to: "/library", icon: <Library className="w-5 h-5" />, title: t("dash.qa_library"), sub: t("dash.qa_library_sub") },
                { to: "/oop-classes", icon: <Code2 className="w-5 h-5" />, title: t("dash.qa_oop"), sub: t("dash.qa_oop_sub") },
                { to: "/components", icon: <Puzzle className="w-5 h-5" />, title: t("dash.qa_components"), sub: t("dash.qa_components_sub") },
              ].map((action, i) => (
                <Link key={i} to={action.to} className="block">
                  <div className="p-5 group hover:bg-zinc-50 transition-colors">
                    <div className="text-zinc-400 group-hover:text-zinc-900 transition-colors mb-3">
                      {action.icon}
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-900">{action.title}</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">{action.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

        <FilePreviewPanel file={selectedFile} onClose={handleCloseFile} projectId={selectedFile?.projectId} />
      </div>

      {/* Floating Quick Create Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-12 h-12 bg-deep-navy hover:bg-deep-navy/90 text-white flex items-center justify-center shadow-md transition-colors"
              data-testid="quick-create-btn"
              title={t("dash.create_quick")}
            >
              <Plus className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="rounded-lg border border-zinc-200 shadow-md min-w-[220px]">
            <DropdownMenuItem onClick={() => setCreateDiagramOpen(true)} className="gap-3 py-2.5 cursor-pointer">
              <Workflow className="w-4 h-4 text-zinc-500" />
              <div>
                <p className="text-xs font-semibold">{t("dash.create_diagram")}</p>
                <p className="text-[10px] text-zinc-400">{t("dash.create_diagram_sub")}</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setCreateSpecOpen(true)} className="gap-3 py-2.5 cursor-pointer">
              <FileText className="w-4 h-4 text-zinc-500" />
              <div>
                <p className="text-xs font-semibold">{t("dash.create_spec")}</p>
                <p className="text-[10px] text-zinc-400">{t("dash.create_spec_sub")}</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setCreateProjectOpen(true)} className="gap-3 py-2.5 cursor-pointer">
              <FolderKanban className="w-4 h-4 text-zinc-500" />
              <div>
                <p className="text-xs font-semibold">{t("dash.create_project")}</p>
                <p className="text-[10px] text-zinc-400">{t("dash.create_project_sub")}</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Create Diagram Dialog */}
      <Dialog open={createDiagramOpen} onOpenChange={(open) => { setCreateDiagramOpen(open); if (!open) { setNewDiagramName(""); setNewDiagramDesc(""); } }}>
        <DialogContent className="rounded-lg border border-zinc-200 shadow-lg max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold" style={{ fontFamily: "'Chivo', sans-serif" }}>{t("dash.create_diagram")}</DialogTitle>
            <DialogDescription className="text-[11px] text-zinc-500">{t("dash.create_diagram_sub")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-[11px] font-semibold text-zinc-600">Nombre</Label>
              <Input value={newDiagramName} onChange={(e) => setNewDiagramName(e.target.value)} className="rounded-lg text-xs h-8 mt-1" autoFocus onKeyDown={(e) => e.key === "Enter" && handleQuickCreateDiagram()} />
            </div>
            <div>
              <Label className="text-[11px] font-semibold text-zinc-600">Descripcion</Label>
              <Input value={newDiagramDesc} onChange={(e) => setNewDiagramDesc(e.target.value)} className="rounded-lg text-xs h-8 mt-1" placeholder="(opcional)" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="rounded-lg text-[10px] h-7" onClick={() => setCreateDiagramOpen(false)}>Cancelar</Button>
            <Button size="sm" className="rounded-lg text-[10px] h-7 bg-deep-navy hover:bg-deep-navy/90" onClick={handleQuickCreateDiagram} disabled={!newDiagramName.trim() || createLoading}>
              {createLoading ? "..." : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Spec Dialog */}
      <Dialog open={createSpecOpen} onOpenChange={(open) => { setCreateSpecOpen(open); if (!open) { setNewSpecName(""); setNewSpecDesc(""); setNewSpecProjectId(""); } }}>
        <DialogContent className="rounded-lg border border-zinc-200 shadow-lg max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold" style={{ fontFamily: "'Chivo', sans-serif" }}>{t("dash.create_spec")}</DialogTitle>
            <DialogDescription className="text-[11px] text-zinc-500">{t("dash.create_spec_sub")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-[11px] font-semibold text-zinc-600">Nombre</Label>
              <Input value={newSpecName} onChange={(e) => setNewSpecName(e.target.value)} className="rounded-lg text-xs h-8 mt-1" autoFocus onKeyDown={(e) => e.key === "Enter" && handleQuickCreateSpec()} />
            </div>
            <div>
              <Label className="text-[11px] font-semibold text-zinc-600">Descripcion</Label>
              <Input value={newSpecDesc} onChange={(e) => setNewSpecDesc(e.target.value)} className="rounded-lg text-xs h-8 mt-1" placeholder="(opcional)" />
            </div>
            <div>
              <Label className="text-[11px] font-semibold text-zinc-600">Proyecto</Label>
              <Select value={newSpecProjectId} onValueChange={setNewSpecProjectId}>
                <SelectTrigger className="rounded-lg text-xs h-8 mt-1">
                  <SelectValue placeholder="(opcional)" />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="rounded-lg text-[10px] h-7" onClick={() => setCreateSpecOpen(false)}>Cancelar</Button>
            <Button size="sm" className="rounded-lg text-[10px] h-7 bg-deep-navy hover:bg-deep-navy/90" onClick={handleQuickCreateSpec} disabled={!newSpecName.trim() || createLoading}>
              {createLoading ? "..." : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Project Dialog */}
      <Dialog open={createProjectOpen} onOpenChange={(open) => { setCreateProjectOpen(open); if (!open) { setNewProjectName(""); setNewProjectDesc(""); } }}>
        <DialogContent className="rounded-lg border border-zinc-200 shadow-lg max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold" style={{ fontFamily: "'Chivo', sans-serif" }}>{t("dash.create_project")}</DialogTitle>
            <DialogDescription className="text-[11px] text-zinc-500">{t("dash.create_project_sub")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-[11px] font-semibold text-zinc-600">Nombre</Label>
              <Input value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className="rounded-lg text-xs h-8 mt-1" autoFocus onKeyDown={(e) => e.key === "Enter" && handleQuickCreateProject()} />
            </div>
            <div>
              <Label className="text-[11px] font-semibold text-zinc-600">Descripcion</Label>
              <Input value={newProjectDesc} onChange={(e) => setNewProjectDesc(e.target.value)} className="rounded-lg text-xs h-8 mt-1" placeholder="(opcional)" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" className="rounded-lg text-[10px] h-7" onClick={() => setCreateProjectOpen(false)}>Cancelar</Button>
            <Button size="sm" className="rounded-lg text-[10px] h-7 bg-deep-navy hover:bg-deep-navy/90" onClick={handleQuickCreateProject} disabled={!newProjectName.trim() || createLoading}>
              {createLoading ? "..." : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar archivo</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminara "{deleteConfirm?.node?.name}". Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteFile} className="bg-red-600 hover:bg-red-700" data-testid="confirm-delete-file">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
