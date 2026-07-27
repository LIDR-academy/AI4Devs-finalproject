// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect } from "react";
import AppSidebar from "@/components/AppSidebar";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, API } from "@/App";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShareResourceDialog } from "@/components/ShareResourceDialog";
import { useI18n } from "@/contexts/I18nContext";
import {
  Shield, ShieldCheck, User, Crown, Eye, Pencil, Lock, ArrowLeft,
  FolderKanban, FileCode, Globe2, Share2, Users as UsersIcon,
  Newspaper, Github,
} from "lucide-react";

const ROLE_STYLES = {
  admin: { label: "Administrador", icon: Crown, color: "bg-amber-100 text-amber-800 border-amber-300" },
  subscription: { label: "Suscripcion", icon: ShieldCheck, color: "bg-blue-100 text-blue-800 border-blue-300" },
  free: { label: "Free", icon: User, color: "bg-zinc-100 text-zinc-700 border-zinc-300" },
};

const SubscriptionManageBlock = ({ role }) => {
  const [loading, setLoading] = React.useState(false);

  const openPortal = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("session_token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const res = await fetch(`${API}/payments/portal/session`, {
        method: "POST",
        headers,
        body: JSON.stringify({ return_url: window.location.href }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      const detail = data && (data.detail || data);
      if (detail && detail.code === "NO_STRIPE_CUSTOMER") {
        // No active subscription — redirect to pricing
        window.location.href = "/pricing#pro";
        return;
      }
      // eslint-disable-next-line no-alert
      alert(detail?.message || "No se pudo abrir el portal de Stripe.");
    } catch (e) {
      // eslint-disable-next-line no-alert
      alert("Error al abrir el portal de Stripe.");
    } finally {
      setLoading(false);
    }
  };

  if (role === "admin") return null; // admins don't need billing portal

  return (
    <div
      className="mt-5 pt-5 border-t border-zinc-200 flex items-center justify-between gap-4 flex-wrap"
      data-testid="subscription-manage-block"
    >
      <div className="flex items-start gap-3">
        <Crown className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p
            className="text-[10px] font-bold tracking-[0.2em] uppercase text-blue-600 mb-1"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {role === "free" ? "Plan Free" : "Suscripcion activa"}
          </p>
          <p className="text-sm text-zinc-700 leading-relaxed">
            {role === "free"
              ? "Sube a Pro o Team para proyectos y diagramas ilimitados."
              : "Gestiona tu suscripcion (cambiar plan, actualizar tarjeta, descargar facturas, cancelar) en el portal de Stripe."}
          </p>
        </div>
      </div>
      {role === "free" ? (
        <Link to="/pricing#pro">
          <Button
            className="bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold tracking-[0.15em] uppercase border border-electric-cyan"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            data-testid="btn-upgrade-plan"
          >
            Sube a Pro
          </Button>
        </Link>
      ) : (
        <Button
          onClick={openPortal}
          disabled={loading}
          className="bg-deep-navy hover:bg-blue-600 rounded-lg text-xs font-bold tracking-[0.15em] uppercase border border-zinc-200 hover:border-blue-600 transition-colors"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          data-testid="btn-manage-subscription"
        >
          {loading ? "Abriendo..." : "Gestionar Suscripcion"}
        </Button>
      )}
    </div>
  );
};

const GitHubConnectBlock = ({ githubLogin, setUser }) => {
  const { t } = useI18n();
  const [login, setLogin] = useState("");
  const [token, setToken] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [connectedLogin, setConnectedLogin] = useState(githubLogin || null);

  const handleConnect = async () => {
    if (!login.trim() || !token.trim()) return;
    setConnecting(true);
    try {
      const sessionToken = localStorage.getItem("session_token");
      const res = await fetch(`${API}/auth/me/github`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ github_login: login.trim(), github_access_token: token.trim() }),
      });
      if (res.ok) {
        setConnectedLogin(login.trim());
        setLogin("");
        setToken("");
        if (setUser) setUser(prev => ({ ...prev, github_login: login.trim() }));
      }
    } catch {}
    setConnecting(false);
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const sessionToken = localStorage.getItem("session_token");
      const res = await fetch(`${API}/auth/me/github`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (res.ok) {
        setConnectedLogin(null);
        if (setUser) setUser(prev => ({ ...prev, github_login: null }));
      }
    } catch {}
    setDisconnecting(false);
  };

  const isConnected = !!(connectedLogin);

  return (
    <div
      className="mt-5 pt-5 border-t border-zinc-200"
      data-testid="github-connect-block"
    >
      {isConnected ? (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <Github className="w-4 h-4 text-zinc-900 mt-0.5 flex-shrink-0" />
            <div>
              <p
                className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-900 mb-1"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                GitHub
              </p>
              <p className="text-sm text-zinc-700">
                {t("github.connected_as").replace("{login}", connectedLogin)}
              </p>
            </div>
          </div>
          <Button
            onClick={handleDisconnect}
            disabled={disconnecting}
            variant="outline"
            className="rounded-lg text-xs h-8 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
            data-testid="github-disconnect-btn"
          >
            {disconnecting ? "..." : t("github.disconnect")}
          </Button>
        </div>
      ) : (
        <div>
          <div className="flex items-start gap-3 mb-3">
            <Github className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
            <div>
              <p
                className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400 mb-1"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                GitHub
              </p>
              <p className="text-sm text-zinc-500">{t("github.not_connected")}</p>
              <p className="text-xs text-zinc-400 mt-1">
                Conecta tu cuenta para sincronizar proyectos con repositorios GitHub.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            <input
              type="text"
              placeholder="Usuario GitHub (ej: thorpette)"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="border border-zinc-300 px-3 py-2 text-xs rounded-lg font-mono focus:outline-none focus:border-zinc-900"
              data-testid="github-login-input"
            />
            <input
              type="password"
              placeholder="Token (ghp_... o github_pat_...)"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="border border-zinc-300 px-3 py-2 text-xs rounded-lg font-mono focus:outline-none focus:border-zinc-900"
              data-testid="github-token-input"
            />
          </div>
          <Button
            onClick={handleConnect}
            disabled={connecting || !login.trim() || !token.trim()}
            className="bg-deep-navy hover:bg-blue-600 rounded-lg text-xs font-bold tracking-[0.15em] uppercase border border-zinc-200 hover:border-blue-600 transition-colors"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            data-testid="github-connect-btn"
          >
            <Github className="w-3.5 h-3.5 mr-1.5" />
            {connecting ? "Conectando..." : t("github.connect")}
          </Button>
        </div>
      )}
    </div>
  );
};

const MyPermissionsPage = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [shareTarget, setShareTarget] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("session_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${API}/auth/me/permissions`, { headers, credentials: "include" });
        if (!res.ok) {
          setErr(res.status === 401 ? "No autenticado" : `Error ${res.status}`);
          setLoading(false);
          return;
        }
        const json = await res.json();
        setData(json);
      } catch (e) {
        setErr(e.message || "Error de red");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const roleInfo = data ? ROLE_STYLES[data.user.role] || ROLE_STYLES.subscription : null;

  return (
    <div className="min-h-screen bg-zinc-50" data-testid="permissions-page">
      <AppSidebar activePath="/my-permissions" />
      <div className="ml-56">
      {/* Top bar */}
      <header className="border-b border-zinc-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors"
            data-testid="permissions-back-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-mono tracking-tight">Volver</span>
          </button>
          <div className="flex items-center gap-2 text-zinc-900">
            <Shield className="w-5 h-5" strokeWidth={1.5} />
            <h1 className="text-lg font-bold tracking-tight">Mis permisos</h1>
          </div>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {loading && (
          <div className="text-center py-16 text-zinc-500 font-mono text-sm" data-testid="permissions-loading">
            Cargando permisos…
          </div>
        )}

        {err && !loading && (
          <div className="border border-red-200 bg-red-50 p-6 text-red-800" data-testid="permissions-error">
            {err}
            {err === "No autenticado" && (
              <div className="mt-3">
                <Link to="/login"><Button size="sm" data-testid="permissions-login-btn">Iniciar sesión</Button></Link>
              </div>
            )}
          </div>
        )}

        {data && !loading && (
          <>
            {/* Identity card */}
            <Card className="p-6 rounded-lg border border-zinc-200 bg-white" data-testid="permissions-identity">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-deep-navy text-white flex items-center justify-center text-xl font-bold">
                    {data.user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-zinc-900">{data.user.name}</div>
                    <div className="text-xs text-zinc-500 font-mono">{data.user.email}</div>
                  </div>
                </div>
                <Badge className={`${roleInfo.color} rounded-lg border-2 px-3 py-1.5 text-sm font-bold gap-1.5`} data-testid="permissions-role-badge">
                  <roleInfo.icon className="w-4 h-4" />
                  {roleInfo.label}
                </Badge>
              </div>
              {/* Noticias IA toggle */}
              <div className="mt-5 pt-5 border-t border-zinc-200 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3">
                  <Newspaper className="w-4 h-4 text-zinc-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-zinc-900">Noticias de IA</p>
                    <p className="text-xs text-zinc-500">Recibe por email las novedades sobre inteligencia artificial.</p>
                  </div>
                </div>
                <Switch
                  checked={!!(user?.noticias ?? data.user.noticias)}
                  onCheckedChange={async (v) => {
                    const token = localStorage.getItem("session_token");
                    try {
                      const res = await fetch(`${API}/auth/me`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify({ noticias: v }),
                      });
                      if (res.ok) {
                        const updated = await res.json();
                        setUser(updated);
                        setData(prev => prev ? { ...prev, user: { ...prev.user, noticias: v } } : prev);
                      }
                    } catch {}
                  }}
                  data-testid="noticias-toggle"
                />
              </div>

              {/* GitHub connection */}
              <GitHubConnectBlock githubLogin={user?.github_login ?? data.user?.github_login} setUser={setUser} />

              {/* Subscription management */}
              <SubscriptionManageBlock role={data.user.role} />
            </Card>

            {/* Rules */}
            <Card className="p-6 rounded-lg border border-zinc-200 bg-white" data-testid="permissions-rules">
              <h2 className="text-sm font-bold tracking-wide text-zinc-900 uppercase mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4" /> Reglas de seguridad (RLS)
              </h2>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div className="flex gap-3">
                  <Eye className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-zinc-900">Lectura</div>
                    <p className="text-zinc-600 mt-1 leading-relaxed">{data.rules.read}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Pencil className="w-5 h-5 text-zinc-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-zinc-900">Escritura</div>
                    <p className="text-zinc-600 mt-1 leading-relaxed">{data.rules.write}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Counts grid */}
            <div className="grid md:grid-cols-3 gap-4">
              <StatBlock
                icon={FolderKanban}
                label="Proyectos propios"
                value={data.owned.projects_count}
                hint="Tuyos (editar/eliminar)"
                testId="permissions-owned-projects"
              />
              <StatBlock
                icon={FileCode}
                label="Diagramas propios"
                value={data.owned.diagrams_count}
                hint="Tuyos (editar/eliminar)"
                testId="permissions-owned-diagrams"
              />
              <StatBlock
                icon={Globe2}
                label="Públicos (solo lectura)"
                value={data.shared_public.projects_count + data.shared_public.diagrams_count}
                hint={`${data.shared_public.projects_count} proyectos · ${data.shared_public.diagrams_count} diagramas seed`}
                testId="permissions-public-resources"
              />
            </div>

            {/* Admin-only extra stats */}
            {data.admin_only && (
              <Card className="p-6 rounded-lg border-2 border-amber-300 bg-amber-50" data-testid="permissions-admin-block">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-5 h-5 text-amber-700" />
                  <h2 className="text-sm font-bold tracking-wide text-amber-900 uppercase">Visión admin</h2>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-2xl font-bold text-amber-900">{data.admin_only.other_users_projects}</div>
                    <div className="text-amber-800">proyectos de otros usuarios</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-900">{data.admin_only.other_users_diagrams}</div>
                    <div className="text-amber-800">diagramas de otros usuarios</div>
                  </div>
                </div>
                <p className="text-xs text-amber-800 mt-3 font-mono">Como administrador puedes leer y modificar cualquier recurso.</p>
              </Card>
            )}

            {/* Owned projects list */}
            <Section
              title="Mis proyectos"
              count={data.owned.projects_count}
              emptyMsg="Aún no has creado proyectos."
              testId="permissions-projects-list"
            >
              {data.owned.projects.map((p) => (
                <OwnedRow
                  key={p.id}
                  icon={FolderKanban}
                  to={`/projects/${p.id}`}
                  name={p.name}
                  date={p.updated_at}
                  onShare={() => setShareTarget({ id: p.id, name: p.name, type: "project" })}
                  testId={`permissions-project-${p.id}`}
                />
              ))}
            </Section>

            {/* Owned diagrams list */}
            <Section
              title="Mis diagramas"
              count={data.owned.diagrams_count}
              emptyMsg="Aún no has creado diagramas."
              testId="permissions-diagrams-list"
            >
              {data.owned.diagrams.slice(0, 50).map((d) => (
                <OwnedRow
                  key={d.id}
                  icon={FileCode}
                  to={`/editor/${d.id}`}
                  name={d.name}
                  date={d.updated_at}
                  onShare={() => setShareTarget({ id: d.id, name: d.name, type: "diagram" })}
                  testId={`permissions-diagram-${d.id}`}
                />
              ))}
              {data.owned.diagrams.length > 50 && (
                <p className="text-xs text-zinc-500 font-mono px-4 py-2">
                  Mostrando 50 de {data.owned.diagrams.length} diagramas.
                </p>
              )}
            </Section>

            {/* Shared with me */}
            {data.shared_with_me && data.shared_with_me.count > 0 && (
              <Section
                title="Compartidos conmigo"
                count={data.shared_with_me.count}
                emptyMsg=""
                testId="permissions-shared-with-me"
              >
                {data.shared_with_me.items.map((s) => (
                  <Link
                    key={s.id}
                    to={s.resource_type === "project" ? `/projects/${s.resource_id}` : `/editor/${s.resource_id}`}
                    className="flex items-center justify-between px-4 py-3 border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 transition-colors"
                    data-testid={`permissions-shared-${s.id}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {s.resource_type === "project" ? (
                        <FolderKanban className="w-4 h-4 text-zinc-500" />
                      ) : (
                        <FileCode className="w-4 h-4 text-zinc-500" />
                      )}
                      <div className="min-w-0">
                        <div className="font-medium text-zinc-900 truncate">{s.resource_name || s.resource_id}</div>
                        <div className="text-xs text-zinc-500 font-mono truncate">de {s.owner_email}</div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`rounded-lg font-mono text-xs ${s.role === "editor" ? "border-blue-400 text-blue-700" : "border-zinc-400 text-zinc-700"}`}
                    >
                      {s.role}
                    </Badge>
                  </Link>
                ))}
              </Section>
            )}

            {/* Public shared resources */}
            {(data.shared_public.projects_count + data.shared_public.diagrams_count) > 0 && (
              <Section
                title="Recursos públicos (solo lectura)"
                count={data.shared_public.projects_count + data.shared_public.diagrams_count}
                emptyMsg=""
                testId="permissions-public-list"
              >
                {data.shared_public.projects.map((p) => (
                  <ResourceRow key={`pp-${p.id}`} icon={FolderKanban} name={p.name} owner={p.created_by || "system"} />
                ))}
                {data.shared_public.diagrams.slice(0, 20).map((d) => (
                  <ResourceRow key={`pd-${d.id}`} icon={FileCode} name={d.name} owner={d.created_by || "system"} />
                ))}
              </Section>
            )}
          </>
        )}
      </main>

      <ShareResourceDialog
        open={!!shareTarget}
        onOpenChange={(v) => { if (!v) setShareTarget(null); }}
        resource={shareTarget}
      />
      </div>
    </div>
  );
};

const OwnedRow = ({ icon: Icon, to, name, date, onShare, testId }) => (
  <div
    className="flex items-center justify-between px-4 py-3 border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 transition-colors group"
    data-testid={testId}
  >
    <Link to={to} className="flex items-center gap-3 flex-1 min-w-0" data-testid={`${testId}-link`}>
      <Icon className="w-4 h-4 text-zinc-500" />
      <span className="font-medium text-zinc-900 truncate">{name}</span>
    </Link>
    <div className="flex items-center gap-3">
      <span className="text-xs text-zinc-500 font-mono hidden sm:inline">
        {new Date(date).toLocaleDateString()}
      </span>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onShare(); }}
        className="rounded-lg border-zinc-300 hover:border-zinc-900 hover:bg-deep-navy hover:text-white gap-1.5 h-8"
        data-testid={`${testId}-share-btn`}
      >
        <Share2 className="w-3.5 h-3.5" />
        <span className="text-xs">Compartir</span>
      </Button>
    </div>
  </div>
);

const StatBlock = ({ icon: Icon, label, value, hint, testId }) => (
  <Card className="p-5 rounded-lg border border-zinc-200 bg-white" data-testid={testId}>
    <div className="flex items-start justify-between">
      <div>
        <div className="text-xs font-mono tracking-wide text-zinc-500 uppercase">{label}</div>
        <div className="text-4xl font-bold text-zinc-900 mt-2 tabular-nums">{value}</div>
        <div className="text-xs text-zinc-500 mt-1">{hint}</div>
      </div>
      <Icon className="w-6 h-6 text-zinc-400" strokeWidth={1.5} />
    </div>
  </Card>
);

const Section = ({ title, count, emptyMsg, children, testId }) => (
  <section data-testid={testId}>
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-bold tracking-wide text-zinc-900 uppercase">{title}</h2>
      <span className="text-xs font-mono text-zinc-500">{count} items</span>
    </div>
    <ScrollArea className="max-h-80">
      <div className="space-y-2">
        {count === 0 ? (
          <div className="text-sm text-zinc-500 italic py-4 px-4 border border-dashed border-zinc-300">
            {emptyMsg}
          </div>
        ) : (
          children
        )}
      </div>
    </ScrollArea>
  </section>
);

const ResourceRow = ({ icon: Icon, name, owner }) => (
  <div className="flex items-center justify-between px-4 py-3 border border-zinc-200 bg-zinc-50">
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-zinc-500" />
      <span className="font-medium text-zinc-900">{name}</span>
    </div>
    <Badge variant="outline" className="rounded-lg font-mono text-xs">
      {owner}
    </Badge>
  </div>
);

export default MyPermissionsPage;
