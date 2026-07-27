// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useMemo } from "react";
import ProjectMenuBar from "@/components/ProjectMenuBar";
import { Link } from "react-router-dom";
import { useI18n } from "@/contexts/I18nContext";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LanguageSelector } from "@/components/LanguageSelector";
import defaultTranslations, { SUPPORTED_LANGUAGES } from "@/i18n/translations";
import { toast } from "sonner";
import { Workflow, Search, Save, Plus, Trash2, Globe, ArrowLeft, Filter } from "lucide-react";

const TranslationsPage = () => {
  const { t, overrides, setOverrides } = useI18n();
  const [search, setSearch] = useState("");
  const [editLang, setEditLang] = useState("es");
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState(false);
  const [filterMissing, setFilterMissing] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [showAddKey, setShowAddKey] = useState(false);

  // Merge all keys from all languages
  const allKeys = useMemo(() => {
    const keys = new Set();
    SUPPORTED_LANGUAGES.forEach((l) => {
      Object.keys(defaultTranslations[l.code] || {}).forEach((k) => keys.add(k));
      Object.keys(overrides[l.code] || {}).forEach((k) => keys.add(k));
    });
    return [...keys].sort();
  }, [overrides]);

  const filteredKeys = useMemo(() => {
    let result = allKeys;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((k) => {
        if (k.toLowerCase().includes(q)) return true;
        const val = overrides[editLang]?.[k] || defaultTranslations[editLang]?.[k] || "";
        return val.toLowerCase().includes(q);
      });
    }
    if (filterMissing) {
      result = result.filter((k) => {
        return !defaultTranslations[editLang]?.[k] && !overrides[editLang]?.[k];
      });
    }
    return result;
  }, [allKeys, search, editLang, filterMissing, overrides]);

  const getValue = (key, lang) => {
    if (edits[`${lang}:${key}`] !== undefined) return edits[`${lang}:${key}`];
    return overrides[lang]?.[key] || defaultTranslations[lang]?.[key] || "";
  };

  const handleEdit = (key, lang, value) => {
    setEdits((prev) => ({ ...prev, [`${lang}:${key}`]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Group edits by language
      const byLang = {};
      for (const [composite, value] of Object.entries(edits)) {
        const [lang, ...keyParts] = composite.split(":");
        const key = keyParts.join(":");
        if (!byLang[lang]) byLang[lang] = { ...(overrides[lang] || {}) };
        byLang[lang][key] = value;
      }
      const res = await fetch(`${API}/i18n/translations/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(byLang),
      });
      if (res.ok) {
        setOverrides((prev) => {
          const next = { ...prev };
          for (const [lang, trans] of Object.entries(byLang)) {
            next[lang] = { ...(next[lang] || {}), ...trans };
          }
          return next;
        });
        setEdits({});
        toast.success(t("i18n.saved"));
      } else {
        toast.error(t("i18n.err_save"));
      }
    } catch {
      toast.error(t("i18n.err_save"));
    } finally {
      setSaving(false);
    }
  };

  const handleAddKey = () => {
    if (!newKey.trim()) return;
    handleEdit(newKey.trim(), editLang, "");
    setNewKey("");
    setShowAddKey(false);
  };

  const missingCount = allKeys.filter(
    (k) => !defaultTranslations[editLang]?.[k] && !overrides[editLang]?.[k]
  ).length;

  const editCount = Object.keys(edits).length;

  return (
    <div className="min-h-screen bg-white flex flex-col" data-testid="translations-page">
      <ProjectMenuBar />
      <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-7 h-7 bg-deep-navy flex items-center justify-center">
                  <Workflow className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-zinc-900 tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>
                  BPMN Modeler
                </span>
              </Link>
              <div className="w-px h-6 bg-zinc-200" />
              <h1 className="text-sm font-bold text-zinc-900" style={{ fontFamily: "'Chivo', sans-serif" }}>
                {t("i18n.title")}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSelector variant="full" />
              <Link to="/dashboard">
                <Button variant="outline" size="sm" className="rounded-lg h-8 text-xs">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  {t("common.back")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Language tabs */}
          <div className="flex border border-zinc-200">
            {SUPPORTED_LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setEditLang(l.code)}
                data-testid={`edit-lang-${l.code}`}
                className={`px-3 py-2 text-xs font-medium transition-colors border-r border-zinc-200 last:border-r-0 ${
                  editLang === l.code ? "bg-blue-50 text-blue-700" : "text-zinc-500 hover:bg-zinc-50"
                }`}
              >
                <span className="mr-1">{l.flag}</span> {l.code.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("i18n.search")}
              className="pl-9 h-9 rounded-lg text-sm"
              data-testid="translations-search"
            />
          </div>

          <Button
            variant={filterMissing ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterMissing(!filterMissing)}
            className="rounded-lg h-9 text-xs"
            data-testid="filter-missing-btn"
          >
            <Filter className="w-3.5 h-3.5 mr-1.5" />
            {filterMissing ? t("i18n.filter_missing") : t("i18n.filter_all")}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddKey(!showAddKey)}
            className="rounded-lg h-9 text-xs"
            data-testid="add-key-btn"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            {t("i18n.add_key")}
          </Button>

          {editCount > 0 && (
            <Button
              onClick={handleSave}
              disabled={saving}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 rounded-lg h-9 text-xs"
              data-testid="save-translations-btn"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {saving ? t("common.processing") : `${t("i18n.save_all")} (${editCount})`}
            </Button>
          )}
        </div>

        {/* Add key row */}
        {showAddKey && (
          <div className="flex items-center gap-2 p-3 bg-zinc-50 border border-zinc-200">
            <Label className="text-xs font-mono text-zinc-500">{t("i18n.add_key")}:</Label>
            <Input
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="section.key_name"
              className="h-8 rounded-lg text-sm flex-1 max-w-md"
              onKeyDown={(e) => e.key === "Enter" && handleAddKey()}
              data-testid="new-key-input"
            />
            <Button size="sm" onClick={handleAddKey} className="rounded-lg h-8 text-xs">
              {t("common.create")}
            </Button>
          </div>
        )}

        {/* Stats bar */}
        <div className="flex items-center gap-4 text-xs" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
          <span className="text-zinc-500">{allKeys.length} {t("i18n.total_keys")}</span>
          {missingCount > 0 && (
            <Badge variant="secondary" className="text-[10px] rounded-lg">
              {missingCount} {t("i18n.missing_count")} ({SUPPORTED_LANGUAGES.find((l) => l.code === editLang)?.label})
            </Badge>
          )}
          <span className="text-zinc-400">{filteredKeys.length} {t("common.no_results") === t("common.no_results") ? "visible" : ""}</span>
        </div>

        {/* Translations table */}
        <div className="border border-zinc-200">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-0 bg-zinc-50 border-b border-zinc-200 text-xs font-bold text-zinc-500 uppercase tracking-wider" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            <div className="col-span-3 px-4 py-3 border-r border-zinc-200">{t("i18n.key")}</div>
            <div className="col-span-4 px-4 py-3 border-r border-zinc-200">
              {SUPPORTED_LANGUAGES.find((l) => l.code === editLang)?.flag} {editLang.toUpperCase()}
            </div>
            <div className="col-span-4 px-4 py-3 border-r border-zinc-200">
              ES (referencia)
            </div>
            <div className="col-span-1 px-2 py-3 text-center">{t("common.actions")}</div>
          </div>

          <ScrollArea className="max-h-[60vh]">
            {filteredKeys.length === 0 ? (
              <div className="text-center py-12 text-sm text-zinc-400">{t("common.no_results")}</div>
            ) : (
              filteredKeys.map((key) => {
                const currentVal = getValue(key, editLang);
                const refVal = defaultTranslations["es"]?.[key] || "";
                const isMissing = !currentVal;
                const isEdited = edits[`${editLang}:${key}`] !== undefined;

                return (
                  <div
                    key={key}
                    className={`grid grid-cols-12 gap-0 border-b border-zinc-100 hover:bg-zinc-50 transition-colors ${
                      isMissing ? "bg-red-50/30" : ""
                    } ${isEdited ? "bg-yellow-50/50" : ""}`}
                  >
                    <div className="col-span-3 px-4 py-2.5 border-r border-zinc-100">
                      <code className="text-xs text-zinc-600 break-all" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                        {key}
                      </code>
                    </div>
                    <div className="col-span-4 px-2 py-1.5 border-r border-zinc-100">
                      <input
                        type="text"
                        value={currentVal}
                        onChange={(e) => handleEdit(key, editLang, e.target.value)}
                        className={`w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                          isMissing ? "border-red-200 bg-red-50" : "border-zinc-200"
                        } ${isEdited ? "border-yellow-400 bg-yellow-50" : ""}`}
                        placeholder={isMissing ? "(missing)" : ""}
                        data-testid={`translation-${editLang}-${key}`}
                      />
                    </div>
                    <div className="col-span-4 px-4 py-2.5 border-r border-zinc-100">
                      <span className="text-xs text-zinc-400">{refVal}</span>
                    </div>
                    <div className="col-span-1 px-2 py-2.5 flex justify-center">
                      {isEdited && (
                        <button
                          onClick={() => {
                            const copy = { ...edits };
                            delete copy[`${editLang}:${key}`];
                            setEdits(copy);
                          }}
                          className="text-zinc-400 hover:text-red-500 transition-colors"
                          title="Revert"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
    </div>
  );
};

export default TranslationsPage;
