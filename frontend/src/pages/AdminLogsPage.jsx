// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth, API } from "@/App";
import ProjectMenuBar from "@/components/ProjectMenuBar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Terminal,
  Download,
  RefreshCw,
  AlertCircle,
  AlertTriangle,
  Info,
  XCircle,
  Loader2,
} from "lucide-react";

const LEVELS = [
  { v: "", l: "Todos", color: "zinc" },
  { v: "ERROR", l: "ERROR", color: "red", icon: XCircle },
  { v: "WARNING", l: "WARNING", color: "amber", icon: AlertTriangle },
  { v: "INFO", l: "INFO", color: "blue", icon: Info },
];

const LINE_OPTIONS = [100, 200, 500, 1000, 5000];

function authHeaders() {
  const tk = localStorage.getItem("session_token") ||
    document.cookie.split("session_token=")[1]?.split(";")[0] || "";
  return tk ? { Authorization: `Bearer ${tk}` } : {};
}

export default function AdminLogsPage() {
  const { user } = useAuth();
  const [logLines, setLogLines] = useState([]);
  const [total, setTotal] = useState(0);
  const [showing, setShowing] = useState(0);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState("");
  const [search, setSearch] = useState("");
  const [lines, setLines] = useState(200);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const intervalRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams({ lines: String(lines) });
      if (level) params.set("level", level);
      if (search.trim()) params.set("search", search.trim());
      const r = await fetch(`${API}/admin/logs?${params}`, { headers: authHeaders() });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${r.status}`);
      }
      const data = await r.json();
      setLogLines(data.lines || []);
      setTotal(data.total || 0);
      setShowing(data.showing || 0);
    } catch (e) {
      toast.error(`Error cargando logs: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, [level, search, lines]);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(load, 10000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh, load]);

  const handleDownload = async () => {
    try {
      const params = new URLSearchParams({ download: "true", lines: "0" });
      const r = await fetch(`${API}/admin/logs?${params}`, { headers: authHeaders() });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "app.log";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(`Error descargando: ${e.message}`);
    }
  };

  const levelColor = (line) => {
    if (line.includes(" - ERROR - ")) return "text-red-700 bg-red-50 border-l-2 border-red-400";
    if (line.includes(" - WARNING - ")) return "text-amber-700 bg-amber-50 border-l-2 border-amber-400";
    if (line.includes(" - CRITICAL - ")) return "text-red-900 bg-red-100 border-l-2 border-red-600";
    return "text-zinc-700";
  };

  if (user && user.role !== "admin") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <ProjectMenuBar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <p className="text-sm font-bold">Solo administradores</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ProjectMenuBar />
      <div className="flex-1 overflow-y-auto flex flex-col">
        <header className="sticky top-0 z-30 bg-white border-b border-zinc-200 h-14 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border border-zinc-200 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-zinc-700" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-zinc-900 tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>
                Logs de la aplicacion (admin)
              </h1>
              <p className="text-[11px] text-zinc-400">Consulta los logs del backend en tiempo real.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className={`rounded-lg h-8 text-xs ${autoRefresh ? "border-emerald-400 text-emerald-700 bg-emerald-50" : ""}`}
              onClick={() => setAutoRefresh(r => !r)}
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${autoRefresh ? "animate-spin" : ""}`} />
              {autoRefresh ? "Auto (10s)" : "Manual"}
            </Button>
            <Button size="sm" variant="outline" className="rounded-lg h-8 text-xs" onClick={handleDownload} data-testid="logs-download-btn">
              <Download className="w-3.5 h-3.5 mr-1.5" /> Descargar
            </Button>
          </div>
        </header>

        <div className="p-4 max-w-[1600px] mx-auto w-full space-y-3">
          {/* Filters */}
          <Card className="rounded-lg border-2 border-zinc-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Level filter */}
                <div className="flex items-center gap-1">
                  {LEVELS.map((lv) => {
                    const LIcon = lv.icon;
                    const sel = level === lv.v;
                    return (
                      <button
                        key={lv.v}
                        type="button"
                        onClick={() => setLevel(lv.v)}
                        className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider border-2 transition-colors ${
                          sel ? `border-${lv.color}-500 bg-${lv.color}-50 text-${lv.color}-800` : "border-zinc-200 hover:border-zinc-400 text-zinc-500"
                        }`}
                      >
                        {LIcon && <LIcon className="w-3 h-3" />}
                        {lv.l}
                      </button>
                    );
                  })}
                </div>

                {/* Search */}
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="rounded-lg text-xs w-48 h-7"
                  placeholder="Buscar en logs..."
                />

                {/* Lines */}
                <select
                  value={lines}
                  onChange={e => setLines(Number(e.target.value))}
                  className="border border-zinc-300 rounded-lg px-2 h-7 text-[10px] font-mono"
                >
                  {LINE_OPTIONS.map(n => <option key={n} value={n}>Ultimas {n} lineas</option>)}
                </select>

                <Button variant="ghost" size="sm" className="rounded-lg h-7 text-[10px]" onClick={load} disabled={loading}>
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                </Button>

                <span className="text-[10px] text-zinc-400 font-mono ml-auto">
                  {showing}/{total} lineas
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Log output */}
          <Card className="rounded-lg border-2 border-zinc-200">
            <CardContent className="p-0">
              {loading ? (
                <div className="text-[11px] text-zinc-400 flex items-center gap-2 p-6">
                  <Loader2 className="w-3 h-3 animate-spin" /> Cargando logs...
                </div>
              ) : logLines.length === 0 ? (
                <div className="text-[11px] text-zinc-400 text-center py-12">
                  Sin resultados{search ? ` para "${search}"` : ""}{level ? ` con nivel ${level}` : ""}.
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-230px)]">
                  <div className="font-mono text-[11px] leading-relaxed" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    {logLines.map((line, i) => (
                      <div key={i} className={`px-4 py-0.5 whitespace-pre-wrap break-all ${levelColor(line)}`}>
                        {line}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
