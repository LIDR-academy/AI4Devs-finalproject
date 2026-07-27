// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Workflow, Key, Loader2, ArrowLeft } from "lucide-react";
import { API } from "@/App";
import { toast } from "sonner";

const TokenLoginPage = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!token.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/token-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("session_token", data.session_token);
        document.cookie = `session_token=${data.session_token}; path=/; max-age=${7*24*60*60}; SameSite=Lax`;
        window.location.href = "/dashboard";
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Token invalido o expirado");
      }
    } catch {
      toast.error("Error de conexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-8" data-testid="token-login-page">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-deep-navy flex items-center justify-center">
            <Workflow className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-zinc-900 tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>
            BPMN Modeler
          </span>
        </div>

        <h1 className="text-2xl font-black text-zinc-900 tracking-tight mb-2" style={{ fontFamily: "'Chivo', sans-serif" }}>
          Login por Token
        </h1>
        <p className="text-sm text-zinc-500 mb-8">
          Pega tu session_token de produccion para autenticarte en este servidor.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label className="text-xs text-zinc-500 mb-1 block" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>SESSION TOKEN</Label>
            <Input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              className="rounded-lg h-11 font-mono text-sm"
              data-testid="token-input"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !token.trim()}
            className="w-full h-11 bg-deep-navy hover:bg-deep-navy/90 text-white rounded-lg font-semibold text-sm"
            data-testid="token-login-btn"
          >
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Key className="w-4 h-4 mr-2" />}
            Autenticar
          </Button>
        </form>

        <div className="mt-6 p-4 bg-zinc-50 border border-zinc-200">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            Como obtener tu token
          </p>
          <ol className="text-xs text-zinc-600 space-y-1.5 list-decimal list-inside">
            <li>Inicia sesion en produccion (sdd-ia.com)</li>
            <li>Abre DevTools (F12) → Application → Cookies</li>
            <li>Copia el valor de <code className="bg-zinc-200 px-1">session_token</code></li>
            <li>Pegalo aqui</li>
          </ol>
        </div>

        <div className="mt-6">
          <Button variant="ghost" onClick={() => navigate("/login")} className="text-zinc-500 text-sm p-0 h-auto hover:text-zinc-900 hover:bg-transparent">
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Volver al login normal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TokenLoginPage;
