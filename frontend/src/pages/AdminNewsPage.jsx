// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect, useCallback } from "react";
import { useAuth, API } from "@/App";
import ProjectMenuBar from "@/components/ProjectMenuBar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
  Newspaper,
  Plus,
  Trash2,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Download,
} from "lucide-react";

const EMPTY_FORM = { subject: "", html: "" };

function authHeaders() {
  const tk = localStorage.getItem("session_token") ||
    document.cookie.split("session_token=")[1]?.split(";")[0] || "";
  return tk ? { Authorization: `Bearer ${tk}` } : {};
}

function fmtDate(iso) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" }); } catch { return iso; }
}

const STATUS_META = {
  sending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-300", label: "Enviando" },
  sent: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-300", label: "Enviado" },
  skipped: { icon: AlertCircle, color: "text-zinc-500", bg: "bg-zinc-50", border: "border-zinc-300", label: "Omitido" },
};

export default function AdminNewsPage() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [sending, setSending] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/news`, { headers: authHeaders() });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      setList(data.posts || []);
      setTotal(data.total || 0);
    } catch (e) {
      toast.error(`Error cargando historial: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const startNew = () => {
    setActiveId(null);
    setForm(EMPTY_FORM);
    setSelectedNews(null);
  };

  const startEdit = (news) => {
    setActiveId(news.id);
    setForm({
      subject: news.subject || "",
      html: news.html || "",
    });
    setSelectedNews(news);
  };

  const handleSend = async () => {
    if (!form.subject.trim() || !form.html.trim()) {
      toast.error("Asunto y contenido HTML son obligatorios"); return;
    }
    setSending(true);
    try {
      const r = await fetch(`${API}/news`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ subject: form.subject.trim(), html: form.html }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${r.status}`);
      }
      const saved = await r.json();
      toast.success("Noticia enviada a difusion");
      setActiveId(saved.id);
      load();
    } catch (e) {
      toast.error(`Error enviando: ${e.message}`);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const r = await fetch(`${API}/news/${deleteId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP ${r.status}`);
      }
      toast.success("Noticia eliminada");
      if (activeId === deleteId) startNew();
      load();
    } catch (e) {
      toast.error(`Error: ${e.message}`);
    } finally {
      setDeleteId(null);
    }
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
              <Newspaper className="w-4 h-4 text-zinc-700" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-zinc-900 tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>
                Noticias de IA (admin)
              </h1>
              <p className="text-[11px] text-zinc-400">Redacta y difunde noticias de IA por email a usuarios suscritos.</p>
            </div>
          </div>
          <Button onClick={startNew} size="sm" className="rounded-lg h-8 text-xs bg-deep-navy hover:bg-deep-navy/90 text-white" data-testid="news-new-btn">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Nueva noticia
          </Button>
        </header>

        <div className="grid grid-cols-12 gap-4 p-4 max-w-[1500px] mx-auto w-full" data-testid="admin-news-root">
          {/* List */}
          <aside className="col-span-12 lg:col-span-4 space-y-2">
            <Card className="rounded-lg border-2 border-zinc-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-[10px] font-bold uppercase tracking-wider">Historial ({total})</h2>
                  <Button variant="ghost" size="sm" className="rounded-lg h-6 text-[10px]" onClick={load}>Refrescar</Button>
                </div>
                {loading ? (
                  <div className="text-[11px] text-zinc-400 flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Cargando...</div>
                ) : list.length === 0 ? (
                  <div className="text-[11px] text-zinc-400 text-center py-6">No hay noticias. Redacta la primera.</div>
                ) : (
                  <div className="space-y-1">
                    {list.map(news => {
                      const sm = STATUS_META[news.status] || STATUS_META.skipped;
                      const SmIcon = sm.icon;
                      const sel = activeId === news.id;
                      return (
                        <div
                          key={news.id}
                          className={`border-2 ${sel ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-400"} p-2`}
                          data-testid={`news-list-${news.id}`}
                        >
                          <button
                            type="button"
                            onClick={() => startEdit(news)}
                            className="w-full text-left"
                          >
                            <div className="flex items-start gap-2">
                              <SmIcon className={`w-3.5 h-3.5 ${sm.color} flex-shrink-0 mt-0.5`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1 flex-wrap">
                                  <span className="text-xs font-bold truncate">{news.subject}</span>
                                  <Badge className={`rounded-lg text-[8px] ${sm.bg} ${sm.color} border ${sm.border}`}>{sm.label}</Badge>
                                </div>
                                <div className="text-[10px] text-zinc-500 line-clamp-2 mt-0.5" dangerouslySetInnerHTML={{ __html: news.html?.replace(/<[^>]+>/g, "").slice(0, 120) || "" }} />
                                <div className="text-[10px] text-zinc-400 mt-0.5">
                                  {news.sent_count}/{news.total_recipients || 0} emails · {fmtDate(news.created_at)}
                                </div>
                              </div>
                            </div>
                          </button>
                          <div className="flex items-center gap-1 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-lg h-6 text-[10px] flex-1"
                              onClick={() => setPreviewOpen(news)}
                              data-testid={`news-preview-${news.id}`}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />Ver HTML
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-lg h-6 text-[10px] border-red-300 text-red-700 hover:bg-red-50"
                              onClick={() => setDeleteId(news.id)}
                              data-testid={`news-delete-${news.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Editor */}
          <section className="col-span-12 lg:col-span-8" data-testid="news-editor">
            <Card className="rounded-lg border-2 border-zinc-200">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>
                    {activeId ? "Ver noticia" : "Nueva noticia"}
                  </h2>
                  {activeId && <span className="text-[10px] font-mono text-zinc-400">{activeId}</span>}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label className="text-[10px] font-bold uppercase tracking-wider">Asunto *</Label>
                    <Input
                      value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      className="rounded-lg mt-1 text-xs"
                      placeholder="Ej: Nuevos modelos de IA disponibles"
                      maxLength={200}
                      data-testid="news-subject-input"
                      disabled={!!activeId}
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold uppercase tracking-wider">Contenido HTML *</Label>
                    <Textarea
                      value={form.html}
                      onChange={e => setForm(f => ({ ...f, html: e.target.value }))}
                      className="rounded-lg mt-1 text-xs font-mono h-64"
                      placeholder="<h2>Noticias de IA</h2><p>...</p>"
                      data-testid="news-html-input"
                      disabled={!!activeId}
                    />
                    <div className="text-[10px] text-zinc-400 mt-1">{form.html.length} caracteres</div>
                  </div>
                </div>

                {/* HTML Preview */}
                {form.html && (
                  <div className="border-t border-zinc-200 pt-3">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Vista previa del HTML</div>
                    <div className="border-2 border-zinc-200 p-4 bg-white max-h-96 overflow-auto">
                      <div dangerouslySetInnerHTML={{ __html: form.html }} />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 border-t border-zinc-200 pt-3">
                  {activeId && (
                    <Button variant="outline" size="sm" className="rounded-lg h-9 text-xs" onClick={startNew}>
                      Nueva noticia
                    </Button>
                  )}
                  {!activeId && (
                    <Button
                      onClick={handleSend}
                      disabled={sending}
                      className="rounded-lg h-9 text-xs bg-deep-navy hover:bg-deep-navy/90 text-white px-6"
                      data-testid="news-send-btn"
                    >
                      {sending ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Enviando...</> : <><Send className="w-3.5 h-3.5 mr-2" /> Enviar y difundir</>}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Recipients table (only for past news with recipients) */}
          {selectedNews && selectedNews.recipients && selectedNews.recipients.length > 0 && (
            <section className="col-span-12" data-testid="news-recipients">
              <Card className="rounded-lg border-2 border-zinc-200">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-bold tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>
                        Destinatarios ({selectedNews.recipients.length})
                      </h2>
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        Enviados: {selectedNews.sent_count} · Fallidos: {selectedNews.recipients.length - (selectedNews.sent_count || 0)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg h-8 text-xs"
                      onClick={() => {
                        const header = "email,name,enviado";
                        const rows = selectedNews.recipients.map(r =>
                          `"${r.email}","${r.name || ""}","${r.sent ? "Si" : "No"}"`
                        );
                        const csv = [header, ...rows].join("\n");
                        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `destinatarios-${selectedNews.id.slice(0, 8)}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      data-testid="news-download-csv"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" /> Descargar CSV
                    </Button>
                  </div>

                  {/* Table header */}
                  <div className="grid grid-cols-12 gap-0 bg-zinc-50 border-b border-zinc-200 text-xs font-bold text-zinc-500 uppercase tracking-wider"
                       style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    <div className="col-span-5 px-4 py-3 border-r border-zinc-200">Email</div>
                    <div className="col-span-5 px-4 py-3 border-r border-zinc-200">Nombre</div>
                    <div className="col-span-2 px-4 py-3">Enviado</div>
                  </div>

                  <div className="max-h-96 overflow-auto">
                    {selectedNews.recipients.map((r, i) => (
                      <div key={i} className="grid grid-cols-12 gap-0 border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                        <div className="col-span-5 px-4 py-2 border-r border-zinc-100 text-xs font-mono truncate">{r.email}</div>
                        <div className="col-span-5 px-4 py-2 border-r border-zinc-100 text-xs truncate">{r.name || "—"}</div>
                        <div className="col-span-2 px-4 py-2">
                          <Badge className={`rounded-lg text-[10px] ${r.sent ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-red-50 text-red-700 border-red-300"}`}>
                            {r.sent ? "Si" : "No"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      </div>

      {/* Preview HTML dialog */}
      <AlertDialog open={!!previewOpen} onOpenChange={(v) => !v && setPreviewOpen(null)}>
        <AlertDialogContent className="rounded-lg border border-zinc-200 max-w-2xl max-h-[80vh] overflow-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm flex items-center justify-between">
              <span>{previewOpen?.subject || "Noticia"}</span>
              <span className="text-[10px] font-mono text-zinc-400 font-normal">{previewOpen?.id}</span>
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="border border-zinc-200 p-4 mt-2 bg-white max-h-[50vh] overflow-auto">
                <div dangerouslySetInnerHTML={{ __html: previewOpen?.html || "" }} />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cerrar</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent className="rounded-lg border border-zinc-200">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar noticia</AlertDialogTitle>
            <AlertDialogDescription>
              Se borrara la noticia del historial. Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="rounded-lg bg-red-600 hover:bg-red-700 text-white" data-testid="news-confirm-delete">Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
