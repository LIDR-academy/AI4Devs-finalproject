// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect, useRef, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import { getAuthHeaders, getAuthToken } from "@/lib/api";

// Eagerly loaded pages (critical path)
import Dashboard from "@/pages/Dashboard";
const LandingPage = React.lazy(() => import("@/pages/LandingPage"));
import LoginPage from "@/pages/LoginPage";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import ErrorBoundary from "@/components/ErrorBoundary";

// Lazy-loaded pages (code-split for smaller initial bundle)
const DiagramsLibrary = React.lazy(() => import("@/pages/DiagramsLibrary"));
const BpmnEditorPage = React.lazy(() => import("@/pages/BpmnEditorPage"));
const OOPClassesManager = React.lazy(() => import("@/pages/OOPClassesManager"));
const BpmnComponentsLibrary = React.lazy(() => import("@/pages/BpmnComponentsLibrary"));
const ProjectsPage = React.lazy(() => import("@/pages/ProjectsPage"));
const ProjectDetailPage = React.lazy(() => import("@/pages/ProjectDetailPage"));
const ProjectTreePage = React.lazy(() => import("@/pages/ProjectTreePage"));
const ProjectVersionsPage = React.lazy(() => import("@/pages/ProjectVersionsPage"));
const CodeGenPage = React.lazy(() => import("@/pages/CodeGenPage"));
const VersionsOverviewPage = React.lazy(() => import("@/pages/VersionsOverviewPage"));
const AdminAnnouncementsPage = React.lazy(() => import("@/pages/AdminAnnouncementsPage"));
const AdminNewsPage = React.lazy(() => import("@/pages/AdminNewsPage"));
const AdminLogsPage = React.lazy(() => import("@/pages/AdminLogsPage"));
const AdminScheduledTasksPage = React.lazy(() => import("@/pages/AdminScheduledTasksPage"));
const AdminLandingStatsPage = React.lazy(() => import("@/pages/AdminLandingStatsPage"));
const TranslationsPage = React.lazy(() => import("@/pages/TranslationsPage"));
const AdminUsersPage = React.lazy(() => import("@/pages/AdminUsersPage"));
const MiniMaxAssistant = React.lazy(() => import("@/pages/MiniMaxAssistant"));
const PricingPage = React.lazy(() => import("@/pages/PricingPage"));
const BillingSuccessPage = React.lazy(() => import("@/pages/BillingSuccessPage"));
const TokenLoginPage = React.lazy(() => import("@/pages/TokenLoginPage"));
const TermsPage = React.lazy(() => import("@/pages/TermsPage"));
const MyPermissionsPage = React.lazy(() => import("@/pages/MyPermissionsPage"));
const SpecsListPage = React.lazy(() => import("@/pages/SpecsListPage"));
const SpecDetailPage = React.lazy(() => import("@/pages/SpecDetailPage"));
const AdminBillingPage = React.lazy(() => import("@/pages/AdminBillingPage"));
const CustomSchemasPage = React.lazy(() => import("@/pages/CustomSchemasPage"));
const AdminIssuesPage = React.lazy(() => import("@/pages/AdminIssuesPage"));
const AdminAuditPage = React.lazy(() => import("@/pages/AdminAuditPage"));
const AdminSsoPage = React.lazy(() => import("@/pages/AdminSsoPage"));
const AdminLlmProvidersPage = React.lazy(() => import("@/pages/AdminLlmProvidersPage"));
const ApiKeysPage = React.lazy(() => import("@/pages/ApiKeysPage"));
const IssueReporter = React.lazy(() => import("@/components/IssueReporter"));
import { I18nProvider } from "@/contexts/I18nContext";
import { UpgradeModalProvider } from "@/contexts/UpgradeModalContext";
import { useHeartbeat } from "@/hooks/useHeartbeat";

// Lazy page fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="space-y-4 w-full max-w-md px-6">
      <div className="animate-pulse h-4 bg-zinc-100 w-3/4" />
      <div className="animate-pulse h-3 bg-zinc-50 w-1/2" />
      <div className="animate-pulse h-3 bg-zinc-50 w-2/3" />
    </div>
  </div>
);

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
// Use BACKEND_URL if set (for local dev), otherwise use relative /api (for production same-origin)
export const API = BACKEND_URL ? `${BACKEND_URL}/api` : "/api";

// Re-export centralized auth helpers for backward compatibility
export { getAuthHeaders, getAuthToken } from "@/lib/api";

// Auth Context
export const AuthContext = React.createContext(null);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    return { user: null, setUser: () => {}, isAuthenticated: false };
  }
  return context;
};

// Auth Callback Component - REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const AuthCallback = () => {
  const hasProcessed = useRef(false);
  const [status, setStatus] = useState("Autenticando...");

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      const hash = window.location.hash;
      const sessionIdMatch = hash.match(/session_id=([^&]+)/);

      if (!sessionIdMatch) {
        window.location.href = "/login";
        return;
      }

      const sessionId = sessionIdMatch[1];
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch(`${API}/auth/session`, {
          method: "GET",
          headers: { "X-Session-ID": sessionId },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const userData = await response.json();
          localStorage.setItem("session_token", userData.session_token);
          document.cookie = `session_token=${userData.session_token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
          // Clean hash to avoid re-trigger on back/reload
          window.history.replaceState(null, "", "/dashboard");
          window.location.href = "/dashboard";
          return;
        }

        const errText = await response.text().catch(() => "");
        console.error("Auth session failed:", response.status, errText);
        setStatus("Sesion expirada. Redirigiendo al login...");
      } catch (error) {
        clearTimeout(timeoutId);
        console.error("Auth error:", error);
        setStatus("Error de red al autenticar. Redirigiendo...");
      }

      // Clean hash and bounce to login after 1.5s so user can see the error
      window.history.replaceState(null, "", "/login");
      setTimeout(() => { window.location.href = "/login"; }, 1500);
    };

    processAuth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-lg text-muted-foreground">{status}</div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // If hash has session_id, skip - AppRouter will handle via AuthCallback
    if (window.location.hash?.includes('session_id=')) return;

    // If user came via navigate with state, use that
    if (location.state?.user) {
      setUser(location.state.user);
      setIsAuthenticated(true);
      localStorage.setItem("session_token", location.state.user.session_token || "");
      return;
    }

    // Otherwise check token
    const token = getAuthToken();

    if (!token) {
      setIsAuthenticated(false);
      navigate("/login", { replace: true });
      return;
    }

    fetch(`${API}/auth/me`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then(userData => {
        setUser(userData);
        setIsAuthenticated(true);
      })
      .catch(() => {
        localStorage.removeItem("session_token");
        document.cookie = "session_token=; path=/; max-age=0";
        setIsAuthenticated(false);
        navigate("/login", { replace: true });
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useHeartbeat(isAuthenticated === true);

  const authValue = React.useMemo(() => ({ user, setUser, isAuthenticated }), [user, isAuthenticated]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Admin Route - requires admin role
const AdminRoute = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, user: null });

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = getAuthToken();
        if (!token) throw new Error("No token");
        const response = await fetch(`${API}/auth/me`, {
          credentials: "include",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Not authenticated");
        const userData = await response.json();
        if (userData.role !== "admin") {
          navigate("/dashboard", { replace: true });
          return;
        }
        setState({ loading: false, user: userData });
      } catch {
        navigate("/login", { replace: true });
      }
    };
    checkAdmin();
  }, [navigate]);

  useHeartbeat(!state.loading);

  const adminAuthValue = React.useMemo(() => ({ user: state.user, setUser: () => {}, isAuthenticated: true }), [state.user]);

  if (state.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={adminAuthValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Public Route - auth is optional, user can be null
const PublicRoute = ({ children }) => {
  const location = useLocation();
  const [user, setUser] = useState(location.state?.user || null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (location.state?.user) {
      setUser(location.state.user);
      setChecked(true);
      return;
    }

    const checkAuth = async () => {
      try {
        const token = getAuthToken();
        if (!token) { setChecked(true); return; }
        const response = await fetch(`${API}/auth/me`, {
          credentials: "include",
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          setUser(await response.json());
        }
      } catch (_) {}
      setChecked(true);
    };
    checkAuth();
  }, [location.state]);

  useHeartbeat(!!user);

  const publicAuthValue = React.useMemo(() => ({ user, setUser, isAuthenticated: !!user }), [user]);

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-lg text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={publicAuthValue}>
      {children}
    </AuthContext.Provider>
  );
};

// App Router
function AppRouter() {
  const location = useLocation();

  // Check for session_id in hash - use window.location.hash for reliability across all environments
  if (window.location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }

  return (
    <>
      <AnnouncementBanner />
      <Suspense fallback={<PageLoader />}>
        <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/token-login" element={<TokenLoginPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route
        path="/billing/success"
        element={
          <ProtectedRoute>
            <BillingSuccessPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/library"
        element={
          <PublicRoute>
            <DiagramsLibrary />
          </PublicRoute>
        }
      />
      <Route
        path="/projects"
        element={
          <PublicRoute>
            <ProjectsPage />
          </PublicRoute>
        }
      />
      <Route
        path="/projects/:projectId"
        element={
          <PublicRoute>
            <ProjectDetailPage />
          </PublicRoute>
        }
      />
      <Route
        path="/projects/:projectId/tree"
        element={
          <PublicRoute>
            <ProjectTreePage />
          </PublicRoute>
        }
      />
      <Route
        path="/projects/:projectId/versions"
        element={
          <PublicRoute>
            <ProjectVersionsPage />
          </PublicRoute>
        }
      />
      <Route
        path="/projects/:projectId/codegen"
        element={
          <PublicRoute>
            <CodeGenPage />
          </PublicRoute>
        }
      />
      <Route
        path="/versions"
        element={
          <ProtectedRoute>
            <VersionsOverviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/announcements"
        element={
          <AdminRoute>
            <AdminAnnouncementsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/news"
        element={
          <AdminRoute>
            <AdminNewsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/logs"
        element={
          <AdminRoute>
            <AdminLogsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/scheduled-tasks"
        element={
          <AdminRoute>
            <AdminScheduledTasksPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/landing-stats"
        element={
          <AdminRoute>
            <AdminLandingStatsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/editor"
        element={
          <PublicRoute>
            <BpmnEditorPage />
          </PublicRoute>
        }
      />
      <Route
        path="/editor/:diagramId"
        element={
          <PublicRoute>
            <BpmnEditorPage />
          </PublicRoute>
        }
      />
      <Route
        path="/oop-classes"
        element={
          <ProtectedRoute>
            <OOPClassesManager />
          </ProtectedRoute>
        }
      />
      <Route
        path="/components"
        element={
          <ProtectedRoute>
            <BpmnComponentsLibrary />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
      <Route
        path="/translations"
        element={
          <AdminRoute>
            <TranslationsPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminUsersPage />
          </AdminRoute>
        }
      />
      <Route
        path="/ai-assistant"
        element={
          <ProtectedRoute>
            <MiniMaxAssistant />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-permissions"
        element={
          <ProtectedRoute>
            <MyPermissionsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/api-keys"
        element={
          <ProtectedRoute>
            <ApiKeysPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/specs"
        element={
          <ProtectedRoute>
            <SpecsListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/specs/:specId"
        element={
          <ProtectedRoute>
            <SpecDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/billing"
        element={
          <ProtectedRoute>
            <AdminBillingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/custom-schemas"
        element={
          <ProtectedRoute>
            <CustomSchemasPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/issues"
        element={
          <ProtectedRoute>
            <AdminIssuesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit"
        element={
          <ProtectedRoute>
            <AdminAuditPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/sso"
        element={
          <ProtectedRoute>
            <AdminSsoPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/llm"
        element={
          <ProtectedRoute>
            <AdminLlmProvidersPage />
          </ProtectedRoute>
        }
      />
    </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <I18nProvider>
      <div className="App min-h-screen bg-background">
        <BrowserRouter>
          <UpgradeModalProvider>
            <ErrorBoundary>
              <AppRouter />
            </ErrorBoundary>
            <Suspense fallback={null}>
              <IssueReporter />
            </Suspense>
          </UpgradeModalProvider>
        </BrowserRouter>
        <Toaster position="top-right" richColors />
      </div>
    </I18nProvider>
  );
}

export default App;
