// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Workflow, Key, Building2, ArrowRight, Loader2 } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { API } from "@/App";
import { toast } from "sonner";

const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const ssoSchema = z.object({ email: z.string().email("Introduce un email valido") });
  const ssoForm = useForm({ resolver: zodResolver(ssoSchema), defaultValues: { email: "" } });
  const [ssoChecking, setSsoChecking] = useState(false);

  // Capture session_token returned by SAML ACS redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("session_token");
    if (token && params.get("sso") === "1") {
      localStorage.setItem("session_token", token);
      toast.success("Sesion SSO iniciada");
      // Strip the token from the URL and send user to dashboard
      window.history.replaceState({}, "", "/dashboard");
      window.location.href = "/dashboard";
    }

    // Capture Google OAuth errors surfaced by /api/auth/google/callback
    const oauthError = params.get("error");
    if (oauthError) {
      const detail = params.get("detail");
      const friendly = {
        access_denied: "Has cancelado el inicio de sesion en Google.",
        redirect_uri_mismatch: "Configuracion incorrecta del redirect_uri en Google Console. Avisa al administrador.",
        blocked: "Tu cuenta ha sido bloqueada. Contacta con un administrador.",
        invalid_state: "La sesion de login expiro. Vuelve a intentarlo.",
        token_exchange_failed: "Google no acepto el codigo. Intenta de nuevo.",
        no_access_token: "Google no devolvio un token. Intenta de nuevo.",
        userinfo_failed: "No se pudo recuperar tu perfil de Google.",
        oauth_exception: "Error inesperado en el login. Intenta de nuevo.",
        missing_params: "Faltan parametros en el callback.",
      }[oauthError] || `Error de Google: ${oauthError}`;
      toast.error(detail ? `${friendly} (${detail})` : friendly, { duration: 8000 });
      // Clean the URL so a refresh doesn't show the toast again
      window.history.replaceState({}, "", "/login");
    }
  }, []);

  // Detect if running on Emergent (production/preview) or self-hosted
  const isEmergentHost = window.location.hostname.includes("emergentagent.com") ||
    window.location.hostname.includes("emergent.host") ||
    window.location.hostname.endsWith("sdd-ia.com");

  const handleGoogleLogin = () => {
    // Direct Google OAuth — backend handles the code exchange and creates the session.
    const returnTo = window.location.pathname.startsWith("/login") ? "/dashboard" : window.location.pathname;
    const url = `${API}/auth/google/login?returnTo=${encodeURIComponent(returnTo)}`;

    // Google blocks OAuth flows inside iframes (X-Frame-Options on accounts.google.com).
    // The Emergent preview embeds the app in an iframe, so we must escape it.
    const inIframe = (() => {
      try { return window.self !== window.top; } catch { return true; }
    })();

    if (inIframe) {
      // Try top-level navigation first (works if same-origin policy permits).
      try {
        if (window.top) {
          window.top.location.href = url;
          return;
        }
      } catch { /* cross-origin → fall back to popup */ }
      // Fallback for cross-origin sandboxed iframe: open a new tab.
      window.open(url, "_blank", "noopener,noreferrer");
      toast.info("Login abierto en una pestana nueva. Una vez completado, vuelve a esta pagina.");
      return;
    }

    window.location.href = url;
  };

  const handleSsoLogin = async (data) => {
    const email = data.email.trim().toLowerCase();
    const m = email.match(/^[\w.+-]+@([\w.-]+\.[a-z]{2,})$/i);
    if (!m) {
      toast.error("Introduce un email valido");
      return;
    }
    const domain = m[1];
    setSsoChecking(true);
    try {
      const r = await fetch(`${API}/sso-configs/public/check?domain=${encodeURIComponent(domain)}`);
      if (!r.ok) {
        toast.error("Error consultando SSO");
        return;
      }
      const info = await r.json();
      if (!info.sso_enabled) {
        toast.error(`Dominio "${domain}" no tiene SSO configurado. Contacta a tu admin.`);
        return;
      }
      // Redirect to SAML SP-initiated flow
      window.location.href = `${API}/auth/saml/login?domain=${encodeURIComponent(domain)}`;
    } catch {
      toast.error("Error de red");
    } finally {
      setSsoChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Texture */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-deep-navy items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1572890017072-df0b2f008fda?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=1000"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-10 p-12 max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-white flex items-center justify-center">
              <Workflow className="w-6 h-6 text-zinc-900" />
            </div>
            <span className="text-xl font-black text-white tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>
              BPMN Modeler
            </span>
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            {t("login.pro_tool")}
          </p>
          <div className="mt-8 flex gap-4 text-xs text-zinc-500 uppercase tracking-[0.15em]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            <span>BPMN 2.0</span>
            <span className="text-zinc-700">/</span>
            <span>OOP</span>
            <span className="text-zinc-700">/</span>
            <span>AI</span>
          </div>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative">
        <div className="absolute top-4 right-4">
          <LanguageSelector variant="full" />
        </div>
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-deep-navy flex items-center justify-center">
              <Workflow className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-zinc-900 tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>
              BPMN Modeler
            </span>
          </div>

          <h1 className="text-3xl font-black text-zinc-900 tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>
            {t("login.title")}
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            {t("login.subtitle")}
          </p>

          <div className="mt-8">
            {isEmergentHost ? (
              <Button
                onClick={handleGoogleLogin}
                data-testid="google-login-btn"
                className="w-full h-12 bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-800 font-medium rounded-lg"
                variant="outline"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {t("login.google_btn")}
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/token-login")}
                data-testid="token-login-btn"
                className="w-full h-12 bg-deep-navy hover:bg-deep-navy/90 text-white font-medium rounded-lg"
              >
                <Key className="w-5 h-5 mr-3" />
                Login por Token
              </Button>
            )}
          </div>

          <p className="text-xs text-zinc-400 mt-6 leading-relaxed">
            {t("login.terms_prefix")}{" "}
            <a href="#" className="text-zinc-600 underline underline-offset-2">{t("login.terms")}</a>
            {" "}{t("login.and")}{" "}
            <a href="#" className="text-zinc-600 underline underline-offset-2">{t("login.privacy")}</a>
          </p>

          {/* Enterprise SSO */}
          <div className="mt-8 pt-6 border-t border-zinc-100">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-3.5 h-3.5 text-zinc-500" strokeWidth={2.5} />
              <span
                className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                Enterprise SSO (SAML 2.0)
              </span>
            </div>
            <Form {...ssoForm}>
            <form onSubmit={ssoForm.handleSubmit(handleSsoLogin)} className="flex gap-2" data-testid="sso-login-form">
              <FormField
                control={ssoForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <input
                        type="email"
                        placeholder="tu@empresa.com"
                        className="flex-1 border border-zinc-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none w-full"
                        data-testid="sso-email-input"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={ssoChecking || !ssoForm.formState.isValid}
                className="bg-deep-navy hover:bg-blue-600 text-white px-4 rounded-lg disabled:opacity-50"
                data-testid="sso-login-btn"
              >
                {ssoChecking ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                )}
              </Button>
            </form>
            </Form>
            <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed">
              Usa tu email corporativo si tu organizacion tiene SSO activado (Okta, Azure AD, Auth0, etc).
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-zinc-500 text-sm font-medium p-0 h-auto hover:text-zinc-900 hover:bg-transparent"
              data-testid="back-to-home-btn"
            >
              {t("login.back_home")}
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/token-login")}
              className="text-zinc-400 text-xs font-medium p-0 h-auto hover:text-zinc-900 hover:bg-transparent"
              data-testid="token-login-link"
            >
              Login por Token
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
