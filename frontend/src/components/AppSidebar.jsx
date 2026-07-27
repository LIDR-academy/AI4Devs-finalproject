// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth, API } from "@/App";
import { useI18n } from "@/contexts/I18nContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  Library,
  Code2,
  Puzzle,
  Cpu,
  FileText,
  Languages,
  Users,
  Shield,
  Settings,
  LogOut,
  Sparkles,
  DollarSign,
  Database,
  LifeBuoy,
  FileClock,
  BarChart3,
  Building2,
  GitBranch,
  Megaphone,
  Newspaper,
  Terminal,
  Clock,
  Brain,
  ChevronDown,
  ChevronRight,
  Moon,
  Sun,
  Key,
} from "lucide-react";

/**
 * Shared sidebar used across all authenticated pages.
 *
 * Pass `activePath` (string) to highlight the current section. If omitted,
 * we infer it from the current router pathname.
 */
const AppSidebar = ({ activePath }) => {
  const { user } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const currentPath = activePath || location.pathname;

  const isAdmin = user?.role === "admin";
  const isFree = user?.role === "free";
  const isEnterprise = isAdmin || user?.plan === "enterprise";
  const [adminOpen, setAdminOpen] = useState(true);

  // Dark mode
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  // Trial-days countdown — only fetched for paid/subscription users.
  const [trialInfo, setTrialInfo] = useState(null);
  useEffect(() => {
    if (!user || isFree) return;
    let cancelled = false;
    const fetchTrial = async () => {
      try {
        const t = localStorage.getItem("session_token");
        const r = await fetch(`${API}/payments/trial-status`, {
          headers: t ? { Authorization: `Bearer ${t}` } : {},
          credentials: "include",
        });
        if (!r.ok) return;
        const d = await r.json();
        if (!cancelled) setTrialInfo(d);
      } catch {
        /* silent */
      }
    };
    fetchTrial();
    // refresh once per hour while sidebar is mounted
    const id = setInterval(fetchTrial, 60 * 60 * 1000);
    return () => { cancelled = true; clearInterval(id); };
  }, [user, isFree]);

  const navItems = [
    { label: t("nav.dashboard"), icon: <LayoutDashboard className="w-4 h-4" />, path: "/dashboard" },
    { label: t("nav.projects"), icon: <FolderKanban className="w-4 h-4" />, path: "/projects" },
    { label: t("nav.versions"), icon: <GitBranch className="w-4 h-4" />, path: "/versions" },
    { label: t("nav.library"), icon: <Library className="w-4 h-4" />, path: "/library" },
    { label: t("nav.oop_classes"), icon: <Code2 className="w-4 h-4" />, path: "/oop-classes" },
    { label: t("nav.components"), icon: <Puzzle className="w-4 h-4" />, path: "/components" },
    { label: t("nav.specs"), icon: <FileText className="w-4 h-4" />, path: "/specs" },
    { label: t("nav.ai_assistant"), icon: <Cpu className="w-4 h-4" />, path: "/ai-assistant" },
  ];

  const adminItems = [
    { label: t("admin.users"), icon: <Users className="w-4 h-4" />, path: "/admin/users" },
    { label: t("nav.translations"), icon: <Languages className="w-4 h-4" />, path: "/translations" },
    { label: t("nav.billing_admin"), icon: <DollarSign className="w-4 h-4" />, path: "/admin/billing" },
    { label: t("nav.issues_admin"), icon: <LifeBuoy className="w-4 h-4" />, path: "/admin/issues" },
    { label: t("nav.audit_admin"), icon: <FileClock className="w-4 h-4" />, path: "/admin/audit" },
    { label: t("nav.announcements_admin"), icon: <Megaphone className="w-4 h-4" />, path: "/admin/announcements" },
    { label: t("nav.news_admin"), icon: <Newspaper className="w-4 h-4" />, path: "/admin/news" },
    { label: t("nav.logs_admin"), icon: <Terminal className="w-4 h-4" />, path: "/admin/logs" },
    { label: t("nav.scheduled_tasks_admin"), icon: <Clock className="w-4 h-4" />, path: "/admin/scheduled-tasks" },
    { label: t("nav.llm_admin"), icon: <Brain className="w-4 h-4" />, path: "/admin/llm" },
    { label: t("nav.landing_stats_admin"), icon: <BarChart3 className="w-4 h-4" />, path: "/admin/landing-stats" },
    ...(isEnterprise ? [{ label: t("nav.custom_schemas"), icon: <Database className="w-4 h-4" />, path: "/custom-schemas" }] : []),
    ...(isEnterprise ? [{ label: t("nav.sso"), icon: <Building2 className="w-4 h-4" />, path: "/admin/sso" }] : []),
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
      // eslint-disable-next-line no-console
      console.error("Logout error:", e);
    }
  };

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-56 bg-white border-r border-zinc-200 z-40 flex flex-col"
      data-testid="app-sidebar"
    >
      <div className="p-4 h-14 flex items-center border-b border-zinc-200">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src="/logotransperente.png" alt="SDD-IA" className="h-8 w-auto" />
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = currentPath === item.path || currentPath.startsWith(`${item.path}/`);
          return (
            <Link
              key={item.path}
              to={item.path}
              data-testid={`nav-${item.path.replace(/\//g, "-").replace(/^-/, "")}`}
              className={`flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                active
                  ? "border-l-[3px] border-blue-600 bg-zinc-50 text-zinc-900 font-semibold -ml-px"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-zinc-200">
        {trialInfo?.has_trial && trialInfo.days_left > 0 && (
          <Link
            to="/my-permissions"
            className={`mb-3 block px-3 py-2.5 border-2 transition-colors ${
              trialInfo.days_left <= 3
                ? "border-amber-500 bg-amber-50 hover:bg-amber-100"
                : "border-emerald-500 bg-emerald-50 hover:bg-emerald-100"
            }`}
            data-testid="sidebar-trial-counter"
            title={`Trial ends ${trialInfo.trial_end_iso?.slice(0, 10)}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles
                className={`w-3.5 h-3.5 ${
                  trialInfo.days_left <= 3 ? "text-amber-700" : "text-emerald-700"
                }`}
                strokeWidth={2.5}
              />
              <span
                className={`text-[10px] font-black tracking-[0.12em] uppercase ${
                  trialInfo.days_left <= 3 ? "text-amber-900" : "text-emerald-900"
                }`}
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                Trial {trialInfo.plan?.toUpperCase() || ""}
              </span>
            </div>
            <div
              className={`text-xs font-bold ${
                trialInfo.days_left <= 3 ? "text-amber-800" : "text-emerald-800"
              }`}
            >
              {trialInfo.days_left === 1
                ? "Queda 1 dia"
                : `Quedan ${trialInfo.days_left} dias`}
            </div>
          </Link>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-zinc-50 transition-colors rounded-lg"
              data-testid="sidebar-user-menu"
            >
              <Avatar className="w-7 h-7">
                <AvatarImage src={user?.picture} />
                <AvatarFallback className="bg-zinc-200 text-zinc-700 text-xs font-bold">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-zinc-900 truncate">{user?.name}</p>
                  {isAdmin && (
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 py-0 rounded-lg border-blue-300 text-blue-600 font-bold"
                      data-testid="admin-badge"
                    >
                      ADMIN
                    </Badge>
                  )}
                  {isFree && (
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 py-0 rounded-lg border-zinc-300 text-zinc-500 font-bold"
                      data-testid="free-badge"
                    >
                      FREE
                    </Badge>
                  )}
                </div>
                <p
                  className="text-zinc-400 truncate"
                  style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px" }}
                >
                  {user?.email}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-lg">
            <Link to="/my-permissions">
              <DropdownMenuItem className="rounded-lg cursor-pointer" data-testid="nav-my-permissions">
                <Shield className="w-4 h-4 mr-2" />
                Mis permisos
              </DropdownMenuItem>
            </Link>
            <Link to="/api-keys">
              <DropdownMenuItem className="rounded-lg cursor-pointer" data-testid="nav-api-keys">
                <Key className="w-4 h-4 mr-2" />
                API Keys
              </DropdownMenuItem>
            </Link>
            <Link to="/pricing">
              <DropdownMenuItem className="rounded-lg cursor-pointer" data-testid="nav-pricing">
                <Settings className="w-4 h-4 mr-2" />
                Planes y facturacion
              </DropdownMenuItem>
            </Link>
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="rounded-lg cursor-pointer text-[10px] font-bold text-zinc-400 uppercase tracking-wider"
                  onClick={(e) => { e.preventDefault(); setAdminOpen(v => !v); }}
                  data-testid="nav-admin-toggle"
                >
                  {adminOpen ? <ChevronDown className="w-3.5 h-3.5 mr-2" /> : <ChevronRight className="w-3.5 h-3.5 mr-2" />}
                  {t("nav.admin")}
                </DropdownMenuItem>
                {adminOpen && adminItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <DropdownMenuItem className="rounded-lg cursor-pointer pl-8" data-testid={`nav-${item.path.replace(/\//g, "-").replace(/^-/, "")}`}>
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                    </DropdownMenuItem>
                  </Link>
                ))}
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 rounded-lg">
              <LogOut className="w-4 h-4 mr-2" />
              {t("nav.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="px-3 pb-2 flex items-center justify-between">
        <p
          className="text-[9px] text-zinc-300"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          &copy; 2026 sdd-ia, LLC
        </p>
        <button
          onClick={() => setDark((v) => !v)}
          className="p-1 text-zinc-400 hover:text-zinc-600 transition-colors"
          aria-label={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          data-testid="dark-mode-toggle"
        >
          {dark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
