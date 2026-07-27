// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect } from "react";
import ProjectMenuBar from "@/components/ProjectMenuBar";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Link } from "react-router-dom";
import { useAuth, API } from "@/App";
import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LanguageSelector } from "@/components/LanguageSelector";
import { toast } from "sonner";
import {
  Workflow,
  ArrowLeft,
  Search,
  Shield,
  CreditCard,
  UserX,
  Lock,
  Unlock,
  Eye,
  AlertCircle,
  CheckCircle2,
  XCircle,
  DollarSign,
  LogOut,
  UserPlus,
} from "lucide-react";

const ROLE_CONFIG = {
  admin: { label: "Admin", color: "border-blue-400 text-blue-700 bg-blue-50", icon: Shield },
  subscription: { label: "Suscripcion", color: "border-emerald-400 text-emerald-700 bg-emerald-50", icon: CreditCard },
  free: { label: "Gratuito", color: "border-zinc-300 text-zinc-600 bg-zinc-50", icon: UserX },
};

// ISO 3166 short list — the most relevant for the SDD-IA target audience.
// Sorted ES-first then alpha. Free-text fallback covered with "OTHER".
const COUNTRIES = [
  { code: "ES", label: "España" },
  { code: "MX", label: "México" },
  { code: "AR", label: "Argentina" },
  { code: "CO", label: "Colombia" },
  { code: "CL", label: "Chile" },
  { code: "PE", label: "Perú" },
  { code: "UY", label: "Uruguay" },
  { code: "EC", label: "Ecuador" },
  { code: "PY", label: "Paraguay" },
  { code: "BO", label: "Bolivia" },
  { code: "VE", label: "Venezuela" },
  { code: "DO", label: "República Dominicana" },
  { code: "PA", label: "Panamá" },
  { code: "CR", label: "Costa Rica" },
  { code: "GT", label: "Guatemala" },
  { code: "PT", label: "Portugal" },
  { code: "BR", label: "Brasil" },
  { code: "FR", label: "Francia" },
  { code: "IT", label: "Italia" },
  { code: "DE", label: "Alemania" },
  { code: "GB", label: "Reino Unido" },
  { code: "US", label: "Estados Unidos" },
  { code: "CA", label: "Canadá" },
  { code: "OTHER", label: "Otro" },
];

const EMPTY_NEW_USER = {
  name: "",
  last_name: "",
  email: "",
  country: "ES",
  phone: "",
  document: "",
  role: "subscription",
};

const fmtDate = (d) => {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleString();
  } catch {
    return String(d);
  }
};

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const { t } = useI18n();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | active | blocked
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  // User-detail drawer
  const [detailUserId, setDetailUserId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Create-user dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState(EMPTY_NEW_USER);

  const token =
    document.cookie.split("session_token=")[1]?.split(";")[0] ||
    localStorage.getItem("session_token") ||
    "";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setUsers(await res.json());
      } else {
        toast.error(t("admin.err_load_users"));
      }
    } catch {
      toast.error(t("admin.err_load_users"));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdating(userId);
    try {
      const res = await fetch(`${API}/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers(users.map((u) => (u.user_id === userId ? { ...u, role: newRole } : u)));
        toast.success(t("admin.role_updated"));
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || t("admin.err_update_role"));
      }
    } catch {
      toast.error(t("admin.err_update_role"));
    } finally {
      setUpdating(null);
    }
  };

  const handleStatusToggle = async (u) => {
    const next = !(u.is_active !== false);
    const action = next ? "activar" : "bloquear";
    setConfirmAction({ type: "status", user: u, next, action });
    return;
  };

  const doStatusToggle = async (u, next) => {
    setUpdating(u.user_id);
    try {
      const res = await fetch(`${API}/admin/users/${u.user_id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: next }),
      });
      if (res.ok) {
        setUsers(users.map((x) => (x.user_id === u.user_id ? { ...x, is_active: next } : x)));
        toast.success(next ? "Usuario activado" : "Usuario bloqueado");
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Error al cambiar estado");
      }
    } catch {
      toast.error("Error al cambiar estado");
    } finally {
      setUpdating(null);
    }
  };

  const handleRevokeSessions = async (u) => {
    setConfirmAction({ type: "revoke", user: u });
    return;
  };

  const doRevokeSessions = async (u) => {
    setUpdating(u.user_id);
    try {
      const res = await fetch(`${API}/admin/users/${u.user_id}/revoke-sessions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Sesiones revocadas: ${data.sessions_revoked}`);
        if (detailUserId === u.user_id) {
          openDetail(u.user_id); // refresh drawer counter
        }
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Error al revocar sesiones");
      }
    } catch {
      toast.error("Error al revocar sesiones");
    } finally {
      setUpdating(null);
    }
  };

  const openDetail = async (userId) => {
    setDetailUserId(userId);
    setDetailLoading(true);
    setDetail(null);
    try {
      const res = await fetch(`${API}/admin/users/${userId}/details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setDetail(await res.json());
      } else {
        toast.error("No se pudo cargar el detalle del usuario");
      }
    } catch {
      toast.error("No se pudo cargar el detalle del usuario");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailUserId(null);
    setDetail(null);
  };

  const updateNewField = (field, value) => {
    setNewUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateUser = async () => {
    if (!newUser.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (!newUser.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      toast.error("Email no valido");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(`${API}/admin/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newUser),
      });
      if (res.ok) {
        const created = await res.json();
        setUsers((prev) => [...prev, created]);
        toast.success(`Usuario ${created.email} creado`);
        setNewUser(EMPTY_NEW_USER);
        setCreateOpen(false);
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Error al crear usuario");
      }
    } catch {
      toast.error("Error al crear usuario");
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (statusFilter === "active" && u.is_active === false) return false;
    if (statusFilter === "blocked" && u.is_active !== false) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  const roleCounts = {
    admin: users.filter((u) => u.role === "admin").length,
    subscription: users.filter((u) => u.role === "subscription").length,
    free: users.filter((u) => u.role === "free").length,
  };
  const blockedCount = users.filter((u) => u.is_active === false).length;

  return (
    <div className="min-h-screen bg-white flex flex-col" data-testid="admin-users-page">
      <ProjectMenuBar />
      <div className="flex-1 overflow-y-auto flex flex-col">
        <header className="sticky top-0 z-30 bg-white border-b border-zinc-200 h-14 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-deep-navy flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase">ADMIN</p>
              <h1 className="text-base font-bold text-zinc-900 tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>Usuarios</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => { setCreateOpen(true); setNewUser(EMPTY_NEW_USER); }}
              size="sm"
              className="rounded-lg h-8 text-xs font-bold"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              Nuevo Usuario
            </Button>
          </div>
        </header>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 space-y-6 w-full">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-0 border border-zinc-200">
            {Object.entries(ROLE_CONFIG).map(([role, cfg]) => {
              const Icon = cfg.icon;
              return (
                <div
                  key={role}
                  className="p-5 border-r border-zinc-200 last:border-r-0"
                  data-testid={`stat-${role}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-zinc-400" />
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <p
                    className="text-2xl font-black text-zinc-900"
                    style={{ fontFamily: "'Chivo', sans-serif" }}
                  >
                    {roleCounts[role] || 0}
                  </p>
                </div>
              );
            })}
            <div className="p-5" data-testid="stat-blocked">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-red-400" />
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.15em] text-red-500"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  Bloqueados
                </span>
              </div>
              <p
                className="text-2xl font-black text-red-600"
                style={{ fontFamily: "'Chivo', sans-serif" }}
              >
                {blockedCount}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[260px] max-w-md">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("admin.search_users")}
                className="pl-9 h-9 rounded-lg text-sm"
                data-testid="search-users"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger
                className="h-9 rounded-lg text-xs w-40"
                data-testid="status-filter"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg">
                <SelectItem value="all" className="text-xs">Todos</SelectItem>
                <SelectItem value="active" className="text-xs">Activos</SelectItem>
                <SelectItem value="blocked" className="text-xs">Bloqueados</SelectItem>
              </SelectContent>
            </Select>
            <span
              className="text-xs text-zinc-400"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              {filteredUsers.length} / {users.length} {t("admin.users_count")}
            </span>
            <div className="ml-auto">
              <Button
                size="sm"
                onClick={() => setCreateOpen(true)}
                className="h-9 rounded-lg bg-deep-navy hover:bg-blue-600 text-white text-xs font-bold"
                data-testid="create-user-btn"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                Crear usuario
              </Button>
            </div>
          </div>

          {/* Users Table */}
          <div className="border border-zinc-200">
            <div
              className="grid grid-cols-12 gap-0 bg-zinc-50 border-b border-zinc-200 text-xs font-bold text-zinc-500 uppercase tracking-wider"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              <div className="col-span-3 px-4 py-3 border-r border-zinc-200">{t("admin.col_user")}</div>
              <div className="col-span-3 px-4 py-3 border-r border-zinc-200">{t("admin.col_email")}</div>
              <div className="col-span-1 px-4 py-3 border-r border-zinc-200">Estado</div>
              <div className="col-span-2 px-4 py-3 border-r border-zinc-200">{t("admin.col_role")}</div>
              <div className="col-span-3 px-4 py-3">Acciones</div>
            </div>

            <ScrollArea className="max-h-[60vh]">
              {loading ? (
                <div className="space-y-2 p-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 border border-zinc-100">
                      <div className="animate-pulse w-8 h-8 bg-zinc-100 shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="animate-pulse h-3 bg-zinc-100 w-1/3" />
                        <div className="animate-pulse h-2.5 bg-zinc-50 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12 text-sm text-zinc-400">
                  {t("common.no_results")}
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const cfg = ROLE_CONFIG[u.role] || ROLE_CONFIG.free;
                  const isSelf = u.user_id === currentUser?.user_id;
                  const isActive = u.is_active !== false;
                  return (
                    <div
                      key={u.user_id}
                      className={`grid grid-cols-12 gap-0 border-b border-zinc-100 hover:bg-zinc-50 transition-colors ${
                        !isActive ? "bg-red-50/30" : ""
                      }`}
                      data-testid={`user-row-${u.user_id}`}
                    >
                      <div className="col-span-3 px-4 py-3 border-r border-zinc-100 flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={u.picture} />
                          <AvatarFallback className="bg-zinc-200 text-zinc-700 text-xs font-bold">
                            {u.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-zinc-900 truncate">
                          {u.name}
                        </span>
                        {isSelf && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1 py-0 rounded-lg border-zinc-300 text-zinc-400"
                          >
                            TU
                          </Badge>
                        )}
                      </div>
                      <div className="col-span-3 px-4 py-3 border-r border-zinc-100 flex items-center">
                        <span
                          className="text-xs text-zinc-500 truncate"
                          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                        >
                          {u.email}
                        </span>
                      </div>
                      <div className="col-span-1 px-4 py-3 border-r border-zinc-100 flex items-center">
                        {isActive ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 rounded-lg font-bold border-emerald-400 text-emerald-700 bg-emerald-50"
                            data-testid={`status-${u.user_id}`}
                          >
                            ACTIVO
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 rounded-lg font-bold border-red-400 text-red-700 bg-red-50"
                            data-testid={`status-${u.user_id}`}
                          >
                            BLOQUEADO
                          </Badge>
                        )}
                      </div>
                      <div className="col-span-2 px-4 py-3 border-r border-zinc-100 flex items-center">
                        {isSelf ? (
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 rounded-lg font-bold ${cfg.color}`}
                          >
                            {cfg.label}
                          </Badge>
                        ) : (
                          <Select
                            value={u.role || "subscription"}
                            onValueChange={(val) => handleRoleChange(u.user_id, val)}
                            disabled={updating === u.user_id}
                          >
                            <SelectTrigger
                              className="h-8 rounded-lg text-xs w-full"
                              data-testid={`role-select-${u.user_id}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg">
                              <SelectItem value="free" className="text-xs">
                                Gratuito
                              </SelectItem>
                              <SelectItem value="subscription" className="text-xs">
                                Suscripcion
                              </SelectItem>
                              <SelectItem value="admin" className="text-xs">
                                Admin
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      <div className="col-span-3 px-4 py-3 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDetail(u.user_id)}
                          className="h-7 rounded-lg text-[11px] px-2"
                          data-testid={`details-btn-${u.user_id}`}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" /> Detalles
                        </Button>
                        {!isSelf && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevokeSessions(u)}
                            disabled={updating === u.user_id}
                            className="h-7 rounded-lg text-[11px] px-2 border-amber-400 text-amber-700 hover:bg-amber-50"
                            data-testid={`revoke-sessions-btn-${u.user_id}`}
                            title="Forzar cierre de sesión sin bloquear la cuenta"
                          >
                            <LogOut className="w-3.5 h-3.5 mr-1" /> Cerrar sesión
                          </Button>
                        )}
                        {!isSelf && (
                          <Button
                            variant={isActive ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleStatusToggle(u)}
                            disabled={updating === u.user_id}
                            className={`h-7 rounded-lg text-[11px] px-2 ${
                              isActive
                                ? "border-red-400 text-red-700 hover:bg-red-50"
                                : "bg-emerald-600 hover:bg-emerald-700 text-white"
                            }`}
                            data-testid={`toggle-status-btn-${u.user_id}`}
                          >
                            {isActive ? (
                              <>
                                <Lock className="w-3.5 h-3.5 mr-1" /> Bloquear
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3.5 h-3.5 mr-1" /> Activar
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* User Details Drawer */}
      <Sheet open={!!detailUserId} onOpenChange={(open) => !open && closeDetail()}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl rounded-lg overflow-y-auto"
          data-testid="user-details-drawer"
        >
          <SheetHeader>
            <SheetTitle
              className="text-base font-bold tracking-tight"
              style={{ fontFamily: "'Chivo', sans-serif" }}
            >
              Detalle del Usuario
            </SheetTitle>
            <SheetDescription className="text-xs text-zinc-500">
              Incidencias reportadas y transacciones economicas
            </SheetDescription>
          </SheetHeader>

          {detailLoading ? (
            <div className="text-center py-12 text-sm text-zinc-400">Cargando...</div>
          ) : !detail ? (
            <div className="text-center py-12 text-sm text-zinc-400">Sin datos</div>
          ) : (
            <div className="mt-6 space-y-6">
              {/* User profile mini-card */}
              <div className="border border-zinc-200 p-4 flex items-start gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={detail.user.picture} />
                  <AvatarFallback className="bg-zinc-200 text-zinc-700 text-base font-bold">
                    {detail.user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-zinc-900">{detail.user.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 rounded-lg font-bold ${
                        (ROLE_CONFIG[detail.user.role] || ROLE_CONFIG.free).color
                      }`}
                    >
                      {(ROLE_CONFIG[detail.user.role] || ROLE_CONFIG.free).label}
                    </Badge>
                    {detail.user.is_active === false ? (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 rounded-lg font-bold border-red-400 text-red-700 bg-red-50"
                      >
                        BLOQUEADO
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 rounded-lg font-bold border-emerald-400 text-emerald-700 bg-emerald-50"
                      >
                        ACTIVO
                      </Badge>
                    )}
                  </div>
                  <div
                    className="text-xs text-zinc-500 mt-1"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {detail.user.email}
                  </div>
                  {detail.user.plan && (
                    <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">
                      Plan: <span className="font-bold text-zinc-700">{detail.user.plan}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal data */}
              {(detail.user.last_name ||
                detail.user.country ||
                detail.user.phone ||
                detail.user.document) && (
                <div className="border border-zinc-200 p-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  {detail.user.last_name && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-zinc-400">Apellidos</div>
                      <div className="text-zinc-900 font-medium">{detail.user.last_name}</div>
                    </div>
                  )}
                  {detail.user.country && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-zinc-400">Pais</div>
                      <div className="text-zinc-900 font-medium">{detail.user.country}</div>
                    </div>
                  )}
                  {detail.user.phone && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-zinc-400">Telefono</div>
                      <div className="text-zinc-900 font-medium" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                        {detail.user.phone}
                      </div>
                    </div>
                  )}
                  {detail.user.document && (
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-zinc-400">Documento</div>
                      <div className="text-zinc-900 font-medium" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                        {detail.user.document}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Summary chips */}
              <div className="grid grid-cols-4 gap-0 border border-zinc-200">
                <div className="p-3 border-r border-zinc-200" data-testid="summary-issues-total">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                    Incidencias
                  </div>
                  <div className="text-lg font-black text-zinc-900">
                    {detail.summary.issues_total}
                  </div>
                </div>
                <div className="p-3 border-r border-zinc-200" data-testid="summary-issues-open">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                    Abiertas
                  </div>
                  <div className="text-lg font-black text-amber-700">
                    {detail.summary.issues_open}
                  </div>
                </div>
                <div className="p-3 border-r border-zinc-200" data-testid="summary-tx-total">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                    Transacciones
                  </div>
                  <div className="text-lg font-black text-zinc-900">
                    {detail.summary.transactions_total}
                  </div>
                </div>
                <div className="p-3" data-testid="summary-amount-paid">
                  <div className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
                    Pagado
                  </div>
                  <div className="text-lg font-black text-emerald-700">
                    ${detail.summary.amount_paid_total}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="issues" className="w-full">
                <TabsList className="rounded-lg w-full grid grid-cols-2">
                  <TabsTrigger value="issues" className="rounded-lg text-xs" data-testid="tab-issues">
                    <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                    Incidencias ({detail.summary.issues_total})
                  </TabsTrigger>
                  <TabsTrigger
                    value="transactions"
                    className="rounded-lg text-xs"
                    data-testid="tab-transactions"
                  >
                    <DollarSign className="w-3.5 h-3.5 mr-1.5" />
                    Transacciones ({detail.summary.transactions_total})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="issues" className="mt-4 space-y-2">
                  {detail.issues.length === 0 ? (
                    <div className="text-center py-8 text-xs text-zinc-400 border border-dashed border-zinc-200">
                      Sin incidencias reportadas
                    </div>
                  ) : (
                    detail.issues.map((it) => (
                      <div
                        key={it.id}
                        className="border border-zinc-200 p-3 hover:bg-zinc-50"
                        data-testid={`issue-row-${it.id}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-zinc-900 truncate">
                              {it.title}
                            </div>
                            <div className="text-[11px] text-zinc-500 mt-0.5 line-clamp-2">
                              {it.description}
                            </div>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {it.category && (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] px-1 py-0 rounded-lg border-zinc-300 text-zinc-600"
                                >
                                  {it.category}
                                </Badge>
                              )}
                              {it.severity && (
                                <Badge
                                  variant="outline"
                                  className={`text-[9px] px-1 py-0 rounded-lg font-bold ${
                                    it.severity === "critical"
                                      ? "border-red-400 text-red-700 bg-red-50"
                                      : it.severity === "high"
                                      ? "border-amber-400 text-amber-700 bg-amber-50"
                                      : "border-zinc-300 text-zinc-600"
                                  }`}
                                >
                                  {it.severity}
                                </Badge>
                              )}
                              <Badge
                                variant="outline"
                                className={`text-[9px] px-1 py-0 rounded-lg font-bold ${
                                  it.status === "closed" || it.status === "resolved"
                                    ? "border-emerald-400 text-emerald-700 bg-emerald-50"
                                    : it.status === "in_progress"
                                    ? "border-blue-400 text-blue-700 bg-blue-50"
                                    : "border-amber-400 text-amber-700 bg-amber-50"
                                }`}
                              >
                                {it.status || "open"}
                              </Badge>
                              <span className="text-[10px] text-zinc-400 ml-auto">
                                {fmtDate(it.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="transactions" className="mt-4 space-y-2">
                  {detail.transactions.length === 0 ? (
                    <div className="text-center py-8 text-xs text-zinc-400 border border-dashed border-zinc-200">
                      Sin transacciones registradas
                    </div>
                  ) : (
                    detail.transactions.map((tx, idx) => {
                      const paid = tx.payment_status === "paid";
                      const trial = tx.payment_status === "no_payment_required";
                      return (
                        <div
                          key={tx.session_id || idx}
                          className="border border-zinc-200 p-3 hover:bg-zinc-50"
                          data-testid={`tx-row-${idx}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-zinc-900 uppercase">
                                  {tx.plan_id || "—"}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`text-[9px] px-1 py-0 rounded-lg font-bold ${
                                    paid
                                      ? "border-emerald-400 text-emerald-700 bg-emerald-50"
                                      : trial
                                      ? "border-blue-400 text-blue-700 bg-blue-50"
                                      : tx.payment_status === "initiated"
                                      ? "border-zinc-300 text-zinc-600"
                                      : "border-red-400 text-red-700 bg-red-50"
                                  }`}
                                >
                                  {paid ? (
                                    <CheckCircle2 className="w-2.5 h-2.5 mr-0.5 inline" />
                                  ) : trial ? (
                                    <CheckCircle2 className="w-2.5 h-2.5 mr-0.5 inline" />
                                  ) : (
                                    <XCircle className="w-2.5 h-2.5 mr-0.5 inline" />
                                  )}
                                  {tx.payment_status || "—"}
                                </Badge>
                                {tx.trial_period_days ? (
                                  <Badge
                                    variant="outline"
                                    className="text-[9px] px-1 py-0 rounded-lg border-blue-300 text-blue-700"
                                  >
                                    Trial {tx.trial_period_days}d
                                  </Badge>
                                ) : null}
                              </div>
                              <div
                                className="text-[11px] text-zinc-500 mt-1 truncate"
                                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                              >
                                {tx.session_id}
                              </div>
                              {tx.stripe_subscription_id && (
                                <div
                                  className="text-[10px] text-zinc-400 truncate"
                                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                                >
                                  sub: {tx.stripe_subscription_id}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-black text-zinc-900">
                                {Number(tx.amount || 0).toFixed(2)} €
                              </div>
                              <div className="text-[10px] uppercase text-zinc-400">
                                {tx.currency || "EUR"}
                              </div>
                              <div className="text-[10px] text-zinc-400 mt-1">
                                {fmtDate(tx.created_at)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg rounded-lg" data-testid="create-user-dialog">
          <DialogHeader>
            <DialogTitle
              className="text-base font-bold tracking-tight"
              style={{ fontFamily: "'Chivo', sans-serif" }}
            >
              Crear nuevo usuario
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-500">
              El usuario podra iniciar sesion con su email via Google OAuth o SSO.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3 mt-2">
            <div className="space-y-1">
              <Label htmlFor="nu-name" className="text-[10px] uppercase tracking-wider text-zinc-500">
                Nombre *
              </Label>
              <Input
                id="nu-name"
                value={newUser.name}
                onChange={(e) => updateNewField("name", e.target.value)}
                className="h-9 rounded-lg text-sm"
                data-testid="nu-name-input"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="nu-last" className="text-[10px] uppercase tracking-wider text-zinc-500">
                Apellidos
              </Label>
              <Input
                id="nu-last"
                value={newUser.last_name}
                onChange={(e) => updateNewField("last_name", e.target.value)}
                className="h-9 rounded-lg text-sm"
                data-testid="nu-last-input"
              />
            </div>
            <div className="space-y-1 col-span-2">
              <Label htmlFor="nu-email" className="text-[10px] uppercase tracking-wider text-zinc-500">
                Email *
              </Label>
              <Input
                id="nu-email"
                type="email"
                value={newUser.email}
                onChange={(e) => updateNewField("email", e.target.value)}
                className="h-9 rounded-lg text-sm"
                placeholder="usuario@empresa.com"
                data-testid="nu-email-input"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="nu-country" className="text-[10px] uppercase tracking-wider text-zinc-500">
                Pais
              </Label>
              <Select
                value={newUser.country}
                onValueChange={(v) => updateNewField("country", v)}
              >
                <SelectTrigger
                  id="nu-country"
                  className="h-9 rounded-lg text-sm"
                  data-testid="nu-country-select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg max-h-72">
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code} className="text-sm">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="nu-phone" className="text-[10px] uppercase tracking-wider text-zinc-500">
                Telefono
              </Label>
              <Input
                id="nu-phone"
                value={newUser.phone}
                onChange={(e) => updateNewField("phone", e.target.value)}
                className="h-9 rounded-lg text-sm"
                placeholder="+34 600 000 000"
                data-testid="nu-phone-input"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="nu-doc" className="text-[10px] uppercase tracking-wider text-zinc-500">
                Documento (DNI/NIE/Pasaporte)
              </Label>
              <Input
                id="nu-doc"
                value={newUser.document}
                onChange={(e) => updateNewField("document", e.target.value)}
                className="h-9 rounded-lg text-sm"
                data-testid="nu-document-input"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="nu-role" className="text-[10px] uppercase tracking-wider text-zinc-500">
                Rol
              </Label>
              <Select
                value={newUser.role}
                onValueChange={(v) => updateNewField("role", v)}
              >
                <SelectTrigger
                  id="nu-role"
                  className="h-9 rounded-lg text-sm"
                  data-testid="nu-role-select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-lg">
                  <SelectItem value="free" className="text-sm">Gratuito</SelectItem>
                  <SelectItem value="subscription" className="text-sm">Suscripcion</SelectItem>
                  <SelectItem value="admin" className="text-sm">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setCreateOpen(false)}
              disabled={creating}
              className="rounded-lg h-9 text-xs"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={creating}
              className="rounded-lg h-9 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold"
              data-testid="nu-submit"
            >
              {creating ? t("common.creating") : t("admin.create_user")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    <ConfirmDialog
      open={!!confirmAction}
      onOpenChange={(open) => { if (!open) setConfirmAction(null); }}
      title={confirmAction?.type === "revoke" ? "Revocar sesiones" : confirmAction?.action === "activar" ? "Activar usuario" : "Bloquear usuario"}
      description={confirmAction?.type === "revoke"
        ? `¿Forzar el cierre de sesiones de ${confirmAction?.user?.email}?`
        : `¿Seguro que deseas ${confirmAction?.action} a ${confirmAction?.user?.email}?`}
      onConfirm={() => {
        if (confirmAction?.type === "revoke") doRevokeSessions(confirmAction.user);
        else doStatusToggle(confirmAction.user, confirmAction.next);
        setConfirmAction(null);
      }}
      confirmLabel={confirmAction?.type === "revoke" ? "Revocar" : confirmAction?.action === "activar" ? "Activar" : "Bloquear"}
    />
    </div>
  );
};

export default AdminUsersPage;
