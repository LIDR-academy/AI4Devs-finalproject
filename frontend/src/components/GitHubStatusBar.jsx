// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth, API } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Github,
  CheckCircle2,
  Unlink,
  Settings,
  Loader2,
  XCircle,
} from "lucide-react";

export default function GitHubStatusBar() {
  const { user, setUser } = useAuth();
  const isConnected = !!user?.github_login;

  const [connectOpen, setConnectOpen] = useState(false);
  const [ghLogin, setGhLogin] = useState("");
  const [ghToken, setGhToken] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const handleConnect = async () => {
    if (!ghLogin.trim() || !ghToken.trim()) return;
    setConnecting(true);
    try {
      const token = localStorage.getItem("session_token") || "";
      const res = await fetch(`${API}/auth/me/github`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          github_login: ghLogin.trim(),
          github_access_token: ghToken.trim(),
        }),
      });
      if (res.ok) {
        toast.success("GitHub conectado");
        setGhLogin("");
        setGhToken("");
        setConnectOpen(false);
        if (setUser) setUser(prev => ({ ...prev, github_login: ghLogin.trim() }));
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Error al conectar GitHub");
      }
    } catch {
      toast.error("Error de red");
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      const token = localStorage.getItem("session_token") || "";
      const res = await fetch(`${API}/auth/me/github`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("GitHub desconectado");
        if (setUser) setUser(prev => ({ ...prev, github_login: null }));
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Error al desconectar");
      }
    } catch {
      toast.error("Error de red");
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-3 left-3 z-50">
        <div className="border border-zinc-300 bg-white shadow-lg px-3 py-2 flex items-center gap-2.5">
          {isConnected ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <Github className="w-4 h-4 text-zinc-700 flex-shrink-0" />
              <span className="text-xs font-semibold text-zinc-800">
                @{user.github_login}
              </span>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="p-1 hover:bg-red-50 transition-colors flex-shrink-0"
                title="Desconectar GitHub"
              >
                {disconnecting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                ) : (
                  <Unlink className="w-3.5 h-3.5 text-zinc-400 hover:text-red-500" />
                )}
              </button>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-zinc-400 flex-shrink-0" />
              <span className="text-xs text-zinc-500">GitHub sin conectar</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConnectOpen(true)}
                className="h-7 text-xs rounded-lg"
              >
                <Github className="w-3.5 h-3.5 mr-1.5" />
                Conectar
              </Button>
            </>
          )}
          <Link
            to="/my-permissions"
            className="p-1 hover:bg-zinc-100 transition-colors flex-shrink-0"
            title="Configurar permisos"
          >
            <Settings className="w-3.5 h-3.5 text-zinc-400 hover:text-zinc-600" />
          </Link>
        </div>
      </div>

      <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
        <DialogContent className="rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Github className="w-5 h-5" />
              Conectar cuenta GitHub
            </DialogTitle>
            <DialogDescription>
              Conecta tu cuenta GitHub para sincronizar diagramas con repositorios.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="gh-login">Usuario de GitHub</Label>
              <Input
                id="gh-login"
                placeholder="tu-usuario"
                value={ghLogin}
                onChange={(e) => setGhLogin(e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gh-token">Token de acceso (PAT)</Label>
              <Input
                id="gh-token"
                type="password"
                placeholder="ghp_..."
                value={ghToken}
                onChange={(e) => setGhToken(e.target.value)}
                className="rounded-lg"
              />
              <p className="text-xs text-zinc-400 mt-1">
                <a
                  href="https://github.com/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-zinc-600"
                >
                  Crear token en GitHub &rarr;
                </a>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConnectOpen(false)} className="rounded-lg">
              Cancelar
            </Button>
            <Button
              onClick={handleConnect}
              disabled={connecting || !ghLogin.trim() || !ghToken.trim()}
              className="rounded-lg bg-deep-navy hover:bg-deep-navy/90"
            >
              {connecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Github className="w-4 h-4 mr-2" />}
              {connecting ? "Conectando..." : "Conectar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
