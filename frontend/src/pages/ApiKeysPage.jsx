// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect, useCallback } from "react";
import AppSidebar from "@/components/AppSidebar";
import { useAuth, API } from "@/App";
import { getAuthHeaders } from "@/lib/api";
import { useI18n } from "@/contexts/I18nContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Key, Plus, Trash2, Copy, Eye, EyeOff, ChevronDown, ChevronRight,
  AlertTriangle, Activity, Clock, Zap,
} from "lucide-react";

const ApiKeysPage = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const { toast } = useToast();

  const [tab, setTab] = useState("keys");
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState(null);
  const [generating, setGenerating] = useState(false);

  // Usage state
  const [usage, setUsage] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [usageLoading, setUsageLoading] = useState(false);
  const [expandedUsage, setExpandedUsage] = useState(null);
  const [usageDetail, setUsageDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api-keys`, { headers: getAuthHeaders() });
      if (res.ok) setKeys(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  const fetchUsage = useCallback(async (page = 1) => {
    setUsageLoading(true);
    try {
      const res = await fetch(`${API}/api-keys/usage?page=${page}&per_page=20`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) setUsage(await res.json());
    } catch { /* ignore */ }
    setUsageLoading(false);
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);
  useEffect(() => { if (tab === "usage") fetchUsage(); }, [tab, fetchUsage]);

  const handleGenerate = async () => {
    if (!newKeyName.trim()) return;
    setGenerating(true);
    try {
      const res = await fetch(`${API}/api-keys`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedKey(data);
        setNewKeyName("");
        fetchKeys();
        toast({ title: t("api_keys.key_generated") });
      } else {
        toast({ title: data.detail || "Error", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
    setGenerating(false);
  };

  const handleRevoke = async (keyId, name) => {
    if (!window.confirm(t("api_keys.revoke_confirm"))) return;
    try {
      const res = await fetch(`${API}/api-keys/${keyId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        fetchKeys();
        toast({ title: `${t("api_keys.revoke")}: ${name}` });
      }
    } catch { /* ignore */ }
  };

  const copyKey = (key) => {
    navigator.clipboard.writeText(key);
    toast({ title: t("api_keys.copied") });
  };

  const toggleUsageDetail = async (usageId) => {
    if (expandedUsage === usageId) {
      setExpandedUsage(null);
      setUsageDetail(null);
      return;
    }
    setExpandedUsage(usageId);
    setDetailLoading(true);
    try {
      const res = await fetch(`${API}/api-keys/usage/${usageId}`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) setUsageDetail(await res.json());
    } catch { /* ignore */ }
    setDetailLoading(false);
  };

  const formatDate = (iso) => {
    if (!iso) return "-";
    try {
      return new Date(iso).toLocaleString("es-CL", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      });
    } catch { return iso; }
  };

  const JsonBlock = ({ data, label }) => (
    <div className="mt-2">
      <p className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 mb-1">{label}</p>
      <pre className="bg-zinc-900 text-zinc-100 text-xs p-3 rounded-lg overflow-x-auto max-h-80 overflow-y-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white">
      <AppSidebar activePath="/api-keys" />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-1">
            <Key className="w-6 h-6 text-zinc-700" />
            <h1 className="text-2xl font-bold text-zinc-900">{t("api_keys.title")}</h1>
          </div>
          <p className="text-sm text-zinc-500 mb-6">{t("api_keys.subtitle")}</p>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-zinc-200">
            {[
              { id: "keys", label: t("api_keys.tab_keys"), icon: Key },
              { id: "usage", label: t("api_keys.tab_usage"), icon: Activity },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  tab === id
                    ? "border-zinc-900 text-zinc-900"
                    : "border-transparent text-zinc-500 hover:text-zinc-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* KEY GENERATION ALERT */}
          {generatedKey && (
            <div className="mb-6 border-2 border-amber-400 bg-amber-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-800 mb-1">
                    {t("api_keys.key_warning")}
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="bg-amber-100 text-amber-900 px-2 py-1 rounded text-xs font-mono break-all">
                      {generatedKey.key}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-shrink-0"
                      onClick={() => copyKey(generatedKey.key)}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setGeneratedKey(null)}
                >
                  {t("common.close")}
                </Button>
              </div>
            </div>
          )}

          {/* TAB: KEYS */}
          {tab === "keys" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-zinc-500">{t("api_keys.max_keys")}</p>
                <Button
                  size="sm"
                  onClick={() => setGenerateOpen(true)}
                  disabled={keys.filter(k => k.is_active).length >= 10}
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  {t("api_keys.generate")}
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-12 text-zinc-400">{t("common.loading")}</div>
              ) : keys.length === 0 ? (
                <div className="text-center py-12">
                  <Key className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                  <p className="text-zinc-500">{t("api_keys.no_keys")}</p>
                </div>
              ) : (
                <div className="border border-zinc-200 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                      <tr>
                        <th className="text-left px-4 py-2.5 font-medium text-zinc-600">{t("api_keys.name")}</th>
                        <th className="text-left px-4 py-2.5 font-medium text-zinc-600">{t("api_keys.prefix")}</th>
                        <th className="text-left px-4 py-2.5 font-medium text-zinc-600">{t("api_keys.status")}</th>
                        <th className="text-left px-4 py-2.5 font-medium text-zinc-600">{t("api_keys.last_used")}</th>
                        <th className="text-left px-4 py-2.5 font-medium text-zinc-600">{t("api_keys.created")}</th>
                        <th className="text-right px-4 py-2.5 font-medium text-zinc-600">{t("api_keys.actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {keys.map((k) => (
                        <tr key={k.key_id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50">
                          <td className="px-4 py-3 font-medium text-zinc-900">{k.name}</td>
                          <td className="px-4 py-3 font-mono text-xs text-zinc-600">{k.key_prefix}...</td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={k.is_active
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                : "bg-zinc-100 text-zinc-500 border-zinc-300"
                              }
                            >
                              {k.is_active ? t("api_keys.active") : t("api_keys.revoked")}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-zinc-500 text-xs">
                            {k.last_used_at ? formatDate(k.last_used_at) : <span className="text-zinc-400">-</span>}
                          </td>
                          <td className="px-4 py-3 text-zinc-500 text-xs">{formatDate(k.created_at)}</td>
                          <td className="px-4 py-3 text-right">
                            {k.is_active && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleRevoke(k.key_id, k.name)}
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-1" />
                                {t("api_keys.revoke")}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: USAGE */}
          {tab === "usage" && (
            <div>
              {usageLoading ? (
                <div className="text-center py-12 text-zinc-400">{t("common.loading")}</div>
              ) : usage.items.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                  <p className="text-zinc-500">{t("api_keys.usage_no_records")}</p>
                </div>
              ) : (
                <>
                  <div className="border border-zinc-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-zinc-50 border-b border-zinc-200">
                        <tr>
                          <th className="text-left px-3 py-2.5 font-medium text-zinc-600 w-8"></th>
                          <th className="text-left px-3 py-2.5 font-medium text-zinc-600">{t("api_keys.usage_date")}</th>
                          <th className="text-left px-3 py-2.5 font-medium text-zinc-600">{t("api_keys.usage_model")}</th>
                          <th className="text-left px-3 py-2.5 font-medium text-zinc-600">{t("api_keys.usage_provider")}</th>
                          <th className="text-right px-3 py-2.5 font-medium text-zinc-600">{t("api_keys.usage_tokens_in")}</th>
                          <th className="text-right px-3 py-2.5 font-medium text-zinc-600">{t("api_keys.usage_tokens_out")}</th>
                          <th className="text-right px-3 py-2.5 font-medium text-zinc-600">{t("api_keys.usage_cost")}</th>
                          <th className="text-right px-3 py-2.5 font-medium text-zinc-600">{t("api_keys.usage_latency")}</th>
                          <th className="text-left px-3 py-2.5 font-medium text-zinc-600">{t("api_keys.usage_status")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usage.items.map((r) => (
                          <React.Fragment key={r.id}>
                            <tr
                              className="border-b border-zinc-100 hover:bg-zinc-50/50 cursor-pointer"
                              onClick={() => toggleUsageDetail(r.id)}
                            >
                              <td className="px-3 py-2.5 text-zinc-400">
                                {expandedUsage === r.id
                                  ? <ChevronDown className="w-4 h-4" />
                                  : <ChevronRight className="w-4 h-4" />
                                }
                              </td>
                              <td className="px-3 py-2.5 text-xs text-zinc-600">{formatDate(r.created_at)}</td>
                              <td className="px-3 py-2.5 font-mono text-xs text-zinc-800">{r.model}</td>
                              <td className="px-3 py-2.5 text-xs text-zinc-600">{r.provider}</td>
                              <td className="px-3 py-2.5 text-right text-xs tabular-nums text-zinc-700">
                                {r.tokens_in?.toLocaleString() || 0}
                              </td>
                              <td className="px-3 py-2.5 text-right text-xs tabular-nums text-zinc-700">
                                {r.tokens_out?.toLocaleString() || 0}
                              </td>
                              <td className="px-3 py-2.5 text-right text-xs tabular-nums text-zinc-700">
                                ${r.cost_usd?.toFixed(4) || "0.0000"}
                              </td>
                              <td className="px-3 py-2.5 text-right text-xs tabular-nums text-zinc-700">
                                {r.latency_ms ? `${r.latency_ms}ms` : "-"}
                              </td>
                              <td className="px-3 py-2.5">
                                <Badge
                                  variant="outline"
                                  className={
                                    r.status === "ok"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px]"
                                      : "bg-red-50 text-red-700 border-red-300 text-[10px]"
                                  }
                                >
                                  {r.status}
                                </Badge>
                              </td>
                            </tr>
                            {expandedUsage === r.id && (
                              <tr>
                                <td colSpan={9} className="px-4 py-4 bg-zinc-50 border-b border-zinc-200">
                                  {detailLoading && !usageDetail ? (
                                    <p className="text-xs text-zinc-400">{t("common.loading")}</p>
                                  ) : usageDetail ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                      <JsonBlock data={usageDetail.request_body} label={t("api_keys.usage_request")} />
                                      <JsonBlock data={usageDetail.response_body} label={t("api_keys.usage_response")} />
                                      {usageDetail.error && (
                                        <div className="lg:col-span-2">
                                          <p className="text-[10px] font-bold tracking-wider uppercase text-red-500 mb-1">Error</p>
                                          <p className="text-xs text-red-700 bg-red-50 p-2 rounded">{usageDetail.error}</p>
                                        </div>
                                      )}
                                    </div>
                                  ) : null}
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {usage.pages > 1 && (
                    <div className="flex items-center justify-between mt-4 text-sm text-zinc-500">
                      <span>{usage.total} {t("api_keys.tab_usage").toLowerCase()}</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={usage.page <= 1}
                          onClick={() => fetchUsage(usage.page - 1)}
                        >
                          {t("common.back")}
                        </Button>
                        <span className="px-3 py-1.5 text-xs">
                          {usage.page} / {usage.pages}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={usage.page >= usage.pages}
                          onClick={() => fetchUsage(usage.page + 1)}
                        >
                          {t("common.next")}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* GENERATE DIALOG */}
          <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
            <DialogContent className="rounded-lg max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  {t("api_keys.generate")}
                </DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                  {t("api_keys.name")}
                </label>
                <Input
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder={t("api_keys.name_placeholder")}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setGenerateOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={!newKeyName.trim() || generating}
                >
                  {generating ? t("common.loading") : t("api_keys.generate")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  );
};

export default ApiKeysPage;
