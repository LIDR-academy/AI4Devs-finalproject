// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, API } from "@/App";
import { useI18n } from "@/contexts/I18nContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
} from "@/components/ui/menubar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  FolderKanban,
  Plus,
  FileArchive,
  FileJson,
  LinkIcon,
  FileText,
  Sparkles,
  GitBranch,
  Code2,
  Library,
  Puzzle,
  Cpu,
  Shield,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Users,
  Languages,
  DollarSign,
  Database,
  LifeBuoy,
  FileClock,
  BarChart3,
  Building2,
  Megaphone,
  Newspaper,
  Terminal,
  Clock,
  Brain,
  Loader2,
} from "lucide-react";

export default function ProjectMenuBar({
  projectId,
  explorerOpen,
  onToggleExplorer,
  showFiles,
  onToggleShowFiles,
  onExport,
  onAddDiagram,
  onNewDiagram,
  onGeneratePrompt,
  onGenerateCode,
  onAiRequirements,
  onAIRewriteMd,
  aiRewriteLoading,
}) {
  const { user, isAuthenticated } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const isProject = !!projectId;

  const isAdmin = user?.role === "admin";
  const isFree = user?.role === "free";
  const isEnterprise = isAdmin || user?.plan === "enterprise";
  const [adminOpen, setAdminOpen] = useState(true);

  const [trialInfo, setTrialInfo] = useState(null);
  useEffect(() => {
    if (!user || isFree) return;
    let cancelled = false;
    const fetchTrial = async () => {
      try {
        const tok = localStorage.getItem("session_token");
        const r = await fetch(`${API}/payments/trial-status`, {
          headers: tok ? { Authorization: `Bearer ${tok}` } : {},
          credentials: "include",
        });
        if (!r.ok) return;
        const d = await r.json();
        if (!cancelled) setTrialInfo(d);
      } catch { /* silent */ }
    };
    fetchTrial();
    const id = setInterval(fetchTrial, 60 * 60 * 1000);
    return () => { cancelled = true; clearInterval(id); };
  }, [user, isFree]);

  const adminItems = [
    { label: t("admin.users"), icon: <Users className="w-3.5 h-3.5" />, path: "/admin/users" },
    { label: t("nav.translations"), icon: <Languages className="w-3.5 h-3.5" />, path: "/translations" },
    { label: t("nav.billing_admin"), icon: <DollarSign className="w-3.5 h-3.5" />, path: "/admin/billing" },
    { label: t("nav.issues_admin"), icon: <LifeBuoy className="w-3.5 h-3.5" />, path: "/admin/issues" },
    { label: t("nav.audit_admin"), icon: <FileClock className="w-3.5 h-3.5" />, path: "/admin/audit" },
    { label: t("nav.announcements_admin"), icon: <Megaphone className="w-3.5 h-3.5" />, path: "/admin/announcements" },
    { label: t("nav.news_admin"), icon: <Newspaper className="w-3.5 h-3.5" />, path: "/admin/news" },
    { label: t("nav.logs_admin"), icon: <Terminal className="w-3.5 h-3.5" />, path: "/admin/logs" },
    { label: t("nav.scheduled_tasks_admin"), icon: <Clock className="w-3.5 h-3.5" />, path: "/admin/scheduled-tasks" },
    { label: t("nav.llm_admin"), icon: <Brain className="w-3.5 h-3.5" />, path: "/admin/llm" },
    { label: t("nav.landing_stats_admin"), icon: <BarChart3 className="w-3.5 h-3.5" />, path: "/admin/landing-stats" },
    ...(isEnterprise ? [{ label: t("nav.custom_schemas"), icon: <Database className="w-3.5 h-3.5" />, path: "/custom-schemas" }] : []),
    ...(isEnterprise ? [{ label: t("nav.sso"), icon: <Building2 className="w-3.5 h-3.5" />, path: "/admin/sso" }] : []),
  ];

  const handleLogout = async () => {
    try {
      const token = document.cookie.split("session_token=")[1]?.split(";")[0] || "";
      await fetch(`/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      document.cookie = "session_token=; path=/; max-age=0";
      window.location.href = "/login";
    } catch (e) {
      console.error("Logout error:", e);
    }
  };

  const menuItemClass = "text-xs cursor-pointer";

  return (
    <header className="bg-white border-b border-zinc-200 z-50 flex-shrink-0">
      <div className="h-10 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/dashboard"
            className="flex items-center px-3 h-10 hover:bg-zinc-100"
          >
            <img src="/logotransperente.png" alt="SDD-IA" className="h-6 w-auto" />
          </Link>

          <Menubar className="border-0 shadow-none bg-transparent h-10 p-0 space-x-0 rounded-lg">
            {/* Archivo */}
            <MenubarMenu>
              <MenubarTrigger className="rounded-lg px-3 h-10 text-xs font-medium data-[state=open]:bg-zinc-100" aria-label="Menu Archivo">
                Archivo
              </MenubarTrigger>
              <MenubarContent className="rounded-lg text-xs">
                <MenubarItem className={menuItemClass} onClick={() => navigate("/dashboard")}>
                  <LayoutDashboard className="w-3.5 h-3.5 mr-2" /> Dashboard
                </MenubarItem>
                <MenubarItem className={menuItemClass} onClick={() => navigate("/projects")}>
                  <FolderKanban className="w-3.5 h-3.5 mr-2" /> Proyectos
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem className={menuItemClass} onClick={onNewDiagram || (() => navigate("/editor"))}>
                  <Plus className="w-3.5 h-3.5 mr-2" /> Nuevo diagrama
                </MenubarItem>
                {isProject && onExport && (
                  <>
                    <MenubarSeparator />
                    <MenubarLabel className="text-[10px] text-zinc-400 uppercase">Exportar</MenubarLabel>
                    <MenubarItem className={menuItemClass} onClick={() => onExport("zip")}>
                      <FileArchive className="w-3.5 h-3.5 mr-2" /> ZIP
                    </MenubarItem>
                    <MenubarItem className={menuItemClass} onClick={() => onExport("json")}>
                      <FileJson className="w-3.5 h-3.5 mr-2" /> JSON
                    </MenubarItem>
                  </>
                )}
              </MenubarContent>
            </MenubarMenu>

            {/* Editar */}
            <MenubarMenu>
              <MenubarTrigger className="rounded-lg px-3 h-10 text-xs font-medium data-[state=open]:bg-zinc-100" aria-label="Menu Editar">
                Editar
              </MenubarTrigger>
              <MenubarContent className="rounded-lg text-xs">
                {isProject ? (
                  <>
                    {isAuthenticated ? (
                      <>
                        {onAddDiagram && (
                          <MenubarItem className={menuItemClass} onClick={onAddDiagram}>
                            <LinkIcon className="w-3.5 h-3.5 mr-2" /> Agregar diagrama existente
                          </MenubarItem>
                        )}
                        {onGeneratePrompt && (
                          <MenubarItem className={menuItemClass} onClick={onGeneratePrompt}>
                            <FileText className="w-3.5 h-3.5 mr-2" /> Generar Prompt
                          </MenubarItem>
                        )}
                        {onGenerateCode && (
                          <MenubarItem className={menuItemClass} onClick={onGenerateCode}>
                            <Sparkles className="w-3.5 h-3.5 mr-2" /> Generar Codigo
                          </MenubarItem>
                        )}
                        {onAiRequirements && (
                          <>
                            <MenubarSeparator />
                            <MenubarItem className={menuItemClass} onClick={onAiRequirements}>
                              <Sparkles className="w-3.5 h-3.5 mr-2" /> Requirements IA
                            </MenubarItem>
                          </>
                        )}
                        {onAIRewriteMd && (
                          <>
                            <MenubarSeparator />
                            <MenubarItem className={menuItemClass} onClick={onAIRewriteMd} disabled={aiRewriteLoading}>
                              {aiRewriteLoading ? (
                                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                              ) : (
                                <Sparkles className="w-3.5 h-3.5 mr-2" />
                              )}
                              Reescribir MD con IA
                            </MenubarItem>
                          </>
                        )}
                        {(onAddDiagram || onGeneratePrompt || onGenerateCode || onAiRequirements || onAIRewriteMd) && (
                          <MenubarSeparator />
                        )}
                      </>
                    ) : (
                      <MenubarItem className={menuItemClass} onClick={() => navigate("/login")}>
                        Iniciar sesion para editar
                      </MenubarItem>
                    )}
                    <MenubarItem className={menuItemClass} onClick={() => navigate(`/specs?project_id=${projectId}`)}>
                      <FileText className="w-3.5 h-3.5 mr-2" /> Especificaciones
                    </MenubarItem>
                    <MenubarItem className={menuItemClass} onClick={() => navigate(`/projects/${projectId}/versions`)}>
                      <GitBranch className="w-3.5 h-3.5 mr-2" /> Versiones
                    </MenubarItem>
                    <MenubarItem className={menuItemClass} onClick={() => navigate(`/projects/${projectId}/codegen`)}>
                      <Code2 className="w-3.5 h-3.5 mr-2" /> Codigo SDD
                    </MenubarItem>
                  </>
                ) : (
                  <MenubarItem className={menuItemClass} onClick={() => navigate("/projects")}>
                    <FolderKanban className="w-3.5 h-3.5 mr-2" /> Ver proyectos
                  </MenubarItem>
                )}
              </MenubarContent>
            </MenubarMenu>

            {/* Ver */}
            <MenubarMenu>
              <MenubarTrigger className="rounded-lg px-3 h-10 text-xs font-medium data-[state=open]:bg-zinc-100" aria-label="Menu Ver">
                Ver
              </MenubarTrigger>
              <MenubarContent className="rounded-lg text-xs">
                {isProject && onToggleExplorer && (
                  <>
                    <MenubarCheckboxItem
                      className={menuItemClass}
                      checked={explorerOpen}
                      onCheckedChange={onToggleExplorer}
                    >
                      Explorador de archivos
                    </MenubarCheckboxItem>
                    {isAdmin && onToggleShowFiles && (
                      <MenubarCheckboxItem
                        className={menuItemClass}
                        checked={showFiles}
                        onCheckedChange={onToggleShowFiles}
                      >
                        Archivos del proyecto
                      </MenubarCheckboxItem>
                    )}
                    <MenubarSeparator />
                  </>
                )}
                <MenubarItem className={menuItemClass} onClick={() => navigate("/library")}>
                  <Library className="w-3.5 h-3.5 mr-2" /> Biblioteca
                </MenubarItem>
                <MenubarItem className={menuItemClass} onClick={() => navigate("/oop-classes")}>
                  <Code2 className="w-3.5 h-3.5 mr-2" /> Clases OOP
                </MenubarItem>
                <MenubarItem className={menuItemClass} onClick={() => navigate("/components")}>
                  <Puzzle className="w-3.5 h-3.5 mr-2" /> Componentes
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem className={menuItemClass} onClick={() => navigate("/specs")}>
                  <FileText className="w-3.5 h-3.5 mr-2" /> Specs
                </MenubarItem>
                <MenubarItem className={menuItemClass} onClick={() => navigate("/versions")}>
                  <GitBranch className="w-3.5 h-3.5 mr-2" /> Versiones
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            {/* Herramientas */}
            <MenubarMenu>
              <MenubarTrigger className="rounded-lg px-3 h-10 text-xs font-medium data-[state=open]:bg-zinc-100" aria-label="Menu Herramientas">
                Herramientas
              </MenubarTrigger>
              <MenubarContent className="rounded-lg text-xs">
                <MenubarItem className={menuItemClass} onClick={() => navigate("/ai-assistant")}>
                  <Cpu className="w-3.5 h-3.5 mr-2" /> Asistente IA
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            {/* Ayuda */}
            <MenubarMenu>
              <MenubarTrigger className="rounded-lg px-3 h-10 text-xs font-medium data-[state=open]:bg-zinc-100" aria-label="Menu Ayuda">
                Ayuda
              </MenubarTrigger>
              <MenubarContent className="rounded-lg text-xs">
                <MenubarItem className={menuItemClass} onClick={() => navigate("/my-permissions")}>
                  <Shield className="w-3.5 h-3.5 mr-2" /> Mis permisos
                </MenubarItem>
                <MenubarItem className={menuItemClass} onClick={() => navigate("/pricing")}>
                  <Settings className="w-3.5 h-3.5 mr-2" /> Planes y facturacion
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>

        {/* Right: trial + user */}
        <div className="flex items-center h-full">
          {trialInfo?.has_trial && trialInfo.days_left > 0 && (
            <Link
              to="/my-permissions"
              className={`h-full flex items-center gap-1.5 px-3 text-[10px] font-bold uppercase tracking-wider ${
                trialInfo.days_left <= 3
                  ? "bg-amber-50 text-amber-900 hover:bg-amber-100"
                  : "bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
              }`}
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              title={`Trial ends ${trialInfo.trial_end_iso?.slice(0, 10)}`}
            >
              <Sparkles className={`w-3 h-3 ${trialInfo.days_left <= 3 ? "text-amber-700" : "text-emerald-700"}`} strokeWidth={2.5} />
              {trialInfo.days_left === 1 ? "Queda 1 dia" : `Quedan ${trialInfo.days_left} dias`}
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-3 h-10 hover:bg-zinc-100">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={user?.picture} />
                  <AvatarFallback className="bg-zinc-200 text-zinc-700 text-[10px] font-bold">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-zinc-700 max-w-[100px] truncate hidden sm:inline">
                  {user?.name || "Usuario"}
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-lg">
              <div className="px-3 py-2 border-b border-zinc-100">
                <p className="text-xs font-semibold text-zinc-900">{user?.name}</p>
                <p className="text-[10px] text-zinc-400 font-mono">{user?.email}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  {isAdmin && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0 border-blue-300 text-blue-600 font-bold">
                      ADMIN
                    </Badge>
                  )}
                </div>
              </div>
              <Link to="/my-permissions">
                <DropdownMenuItem className="rounded-lg cursor-pointer">
                  <Shield className="w-3.5 h-3.5 mr-2" />
                  Mis permisos
                </DropdownMenuItem>
              </Link>
              <Link to="/pricing">
                <DropdownMenuItem className="rounded-lg cursor-pointer">
                  <Settings className="w-3.5 h-3.5 mr-2" />
                  Planes y facturacion
                </DropdownMenuItem>
              </Link>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="rounded-lg cursor-pointer text-[10px] font-bold text-zinc-400 uppercase tracking-wider"
                    onClick={(e) => { e.preventDefault(); setAdminOpen(v => !v); }}
                  >
                    {adminOpen ? <ChevronDown className="w-3.5 h-3.5 mr-2" /> : <ChevronRight className="w-3.5 h-3.5 mr-2" />}
                    {t("nav.admin")}
                  </DropdownMenuItem>
                  {adminOpen && adminItems.map((item) => (
                    <Link key={item.path} to={item.path}>
                      <DropdownMenuItem className="rounded-lg cursor-pointer pl-8 text-xs">
                        {item.icon}
                        <span className="ml-2">{item.label}</span>
                      </DropdownMenuItem>
                    </Link>
                  ))}
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 rounded-lg cursor-pointer">
                <LogOut className="w-3.5 h-3.5 mr-2" />
                {t("nav.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
