// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth, API } from "@/App";
import ProjectMenuBar from "@/components/ProjectMenuBar";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "sonner";
import { useI18n } from "@/contexts/I18nContext";
import {
  Database,
  Plus,
  Trash2,
  Save,
  Loader2,
  Code2,
  Wrench,
  AlertTriangle,
  Lock,
} from "lucide-react";

const authHeaders = () => {
  const t = localStorage.getItem("session_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const FIELD_TYPES = ["string", "number", "integer", "boolean", "array", "object"];

const emptyField = () => ({
  key: "",
  type: "string",
  description: "",
  required: false,
  enumValues: "", // comma separated
});

/** Convert UI builder fields → JSON Schema fragment */
const fieldsToSchema = (fields) => {
  const properties = {};
  const required = [];
  for (const f of fields) {
    if (!f.key.trim()) continue;
    const def = { type: f.type };
    if (f.description?.trim()) def.description = f.description.trim();
    if (f.enumValues?.trim()) {
      def.enum = f.enumValues
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    properties[f.key.trim()] = def;
    if (f.required) required.push(f.key.trim());
  }
  return { type: "object", properties, ...(required.length ? { required } : {}) };
};

/** Best-effort inverse: JSON Schema → UI builder fields */
const schemaToFields = (schema) => {
  if (!schema || typeof schema !== "object" || !schema.properties) return [];
  const required = new Set(schema.required || []);
  return Object.entries(schema.properties).map(([k, def]) => ({
    key: k,
    type: def.type || "string",
    description: def.description || "",
    required: required.has(k),
    enumValues: Array.isArray(def.enum) ? def.enum.join(", ") : "",
  }));
};

const CustomSchemasPage = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isEnterprise = isAdmin || user?.plan === "enterprise";

  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  // Edit form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState("oop_class");
  const [editorMode, setEditorMode] = useState("ui"); // "ui" | "raw"
  const [fields, setFields] = useState([]);
  const [rawJson, setRawJson] = useState("{\n  \"type\": \"object\",\n  \"properties\": {}\n}");
  const [rawError, setRawError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const loadSchemas = useCallback(async () => {
    if (!isEnterprise) return;
    try {
      const r = await fetch(`${API}/custom-schemas`, {
        headers: authHeaders(),
        credentials: "include",
      });
      if (r.ok) setSchemas(await r.json());
    } finally {
      setLoading(false);
    }
  }, [isEnterprise]);

  useEffect(() => { loadSchemas(); }, [loadSchemas]);

  const resetForm = () => {
    setSelectedId(null);
    setName("");
    setDescription("");
    setScope("oop_class");
    setFields([]);
    setRawJson("{\n  \"type\": \"object\",\n  \"properties\": {}\n}");
    setRawError("");
    setEditorMode("ui");
  };

  const openSchema = (s) => {
    setSelectedId(s.id);
    setName(s.name || "");
    setDescription(s.description || "");
    setScope(s.scope || "oop_class");
    setFields(schemaToFields(s.schema || {}));
    setRawJson(JSON.stringify(s.schema || {}, null, 2));
    setRawError("");
  };

  const switchToRaw = () => {
    // when leaving UI, sync UI -> raw
    const built = fieldsToSchema(fields);
    setRawJson(JSON.stringify(built, null, 2));
    setRawError("");
    setEditorMode("raw");
  };

  const switchToUi = () => {
    // when leaving raw, try to parse
    try {
      const parsed = JSON.parse(rawJson || "{}");
      setFields(schemaToFields(parsed));
      setRawError("");
      setEditorMode("ui");
    } catch (e) {
      setRawError(`JSON invalido: ${e.message}`);
    }
  };

  const updateField = (idx, patch) => {
    setFields((prev) => prev.map((f, i) => (i === idx ? { ...f, ...patch } : f)));
  };
  const addField = () => setFields((prev) => [...prev, emptyField()]);
  const removeField = (idx) => setFields((prev) => prev.filter((_, i) => i !== idx));

  const buildPayload = () => {
    let schema;
    if (editorMode === "ui") {
      schema = fieldsToSchema(fields);
    } else {
      try {
        schema = JSON.parse(rawJson || "{}");
      } catch (e) {
        setRawError(`JSON invalido: ${e.message}`);
        return null;
      }
    }
    return { name: name.trim(), description: description.trim(), scope, schema };
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Nombre requerido");
      return;
    }
    const payload = buildPayload();
    if (!payload) return;
    setSaving(true);
    try {
      const url = selectedId
        ? `${API}/custom-schemas/${selectedId}`
        : `${API}/custom-schemas`;
      const method = selectedId ? "PUT" : "POST";
      const r = await fetch(url, {
        method,
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        toast.error(`Error: ${err.detail?.errors?.join("; ") || err.detail || "fallo guardar"}`);
        return;
      }
      const saved = await r.json();
      toast.success(selectedId ? "Schema actualizado" : "Schema creado");
      await loadSchemas();
      openSchema(saved);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;
    setConfirmDelete(true);
  };

  const confirmDeleteSchema = async () => {
    setConfirmDelete(false);
    const r = await fetch(`${API}/custom-schemas/${selectedId}`, {
      method: "DELETE",
      headers: authHeaders(),
      credentials: "include",
    });
    if (r.ok) {
      toast.success("Schema eliminado");
      resetForm();
      await loadSchemas();
    } else {
      toast.error("Error al eliminar");
    }
  };

  // ---------------- Guards ----------------

  if (user && !isEnterprise) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <ProjectMenuBar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl mx-auto border border-amber-400 bg-amber-50 p-8" data-testid="enterprise-locked-card">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-amber-700" strokeWidth={2.5} />
              <h1 className="text-2xl font-black text-amber-900" style={{ fontFamily: "'Chivo', sans-serif" }}>
                Funcion Enterprise
              </h1>
            </div>
            <p className="text-sm text-amber-900 mb-4">
              Custom Schemas permite definir metadatos personalizados (JSON Schema) para tus clases OOP.
              Disponible exclusivamente para el plan <strong>Enterprise</strong>.
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-900 text-amber-50 hover:bg-amber-800 transition-colors"
              data-testid="upgrade-enterprise-link"
            >
              <span className="text-[11px] font-bold tracking-[0.15em] uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                Ver planes
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <ProjectMenuBar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-white flex flex-col" data-testid="custom-schemas-page">
      <ProjectMenuBar />
      <div className="flex-1 overflow-y-auto flex flex-col">
        <header className="sticky top-0 z-30 bg-white border-b border-zinc-200 h-14 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-deep-navy flex items-center justify-center flex-shrink-0">
              <Database className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>ENTERPRISE · CUSTOM SCHEMAS</p>
              <h1 className="text-base font-bold text-zinc-900 tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>Schemas personalizados</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetForm}
              className="flex items-center gap-2 px-4 py-2 border border-zinc-200 text-zinc-900 hover:bg-deep-navy hover:text-white transition-colors"
              data-testid="new-schema-btn"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                Nuevo schema
              </span>
            </button>
          </div>
        </header>
        <div className="p-6">
          <p className="text-sm text-zinc-500 mb-6 max-w-2xl">
            Define metadatos JSON Schema reutilizables para tus clases OOP. Cambia entre el constructor visual y el editor JSON crudo segun necesidad.
          </p>

        <div className="grid grid-cols-12 gap-6">
          {/* List */}
          <div className="col-span-4">
            <div className="border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 px-4 py-2 bg-deep-navy text-white">
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  Schemas ({schemas.length})
                </span>
              </div>
              {schemas.length === 0 ? (
                <div className="p-6 text-center text-sm text-zinc-500" data-testid="schemas-empty">
                  <Database className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                  Sin schemas. Crea el primero con &quot;Nuevo schema&quot;.
                </div>
              ) : (
                <ul>
                  {schemas.map((s) => (
                    <li key={s.id}>
                      <button
                        onClick={() => openSchema(s)}
                        data-testid={`schema-item-${s.id}`}
                        className={`w-full text-left px-4 py-3 border-b border-zinc-200 hover:bg-zinc-50 transition-colors ${
                          selectedId === s.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                        }`}
                      >
                        <div className="font-semibold text-sm text-zinc-900 truncate">{s.name}</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-2">
                          <span className="px-1.5 py-0.5 bg-zinc-100 text-zinc-700 text-[9px] font-bold tracking-wider uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                            {s.scope}
                          </span>
                          {Object.keys(s.schema?.properties || {}).length} campos
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Editor */}
          <div className="col-span-8">
            <div className="border border-zinc-200 bg-white p-6 space-y-5" data-testid="schema-editor">
              {/* Meta */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-500 mb-1.5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    Nombre
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-zinc-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                    placeholder="Ej: Procurement Metadata"
                    data-testid="schema-name-input"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-500 mb-1.5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    Scope
                  </label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="w-full border border-zinc-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                    data-testid="schema-scope-select"
                  >
                    <option value="oop_class">OOP Class</option>
                    <option value="diagram">Diagram</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-500 mb-1.5" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  Descripcion
                </label>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-zinc-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                  placeholder="Para que se usa este schema"
                  data-testid="schema-description-input"
                />
              </div>

              {/* Editor mode toggle */}
              <div className="flex items-center gap-2 border-t border-zinc-200 pt-4">
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-500 mr-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  Modo
                </span>
                <button
                  onClick={editorMode === "ui" ? undefined : switchToUi}
                  data-testid="editor-mode-ui"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-2 transition-colors ${
                    editorMode === "ui"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-zinc-300 text-zinc-600 hover:border-zinc-900"
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" strokeWidth={2.5} />
                  Constructor UI
                </button>
                <button
                  onClick={editorMode === "raw" ? undefined : switchToRaw}
                  data-testid="editor-mode-raw"
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-2 transition-colors ${
                    editorMode === "raw"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-zinc-300 text-zinc-600 hover:border-zinc-900"
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                  JSON Raw
                </button>
              </div>

              {/* UI builder */}
              {editorMode === "ui" && (
                <div className="space-y-3" data-testid="ui-builder">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-700" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      Campos ({fields.length})
                    </span>
                    <button
                      onClick={addField}
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
                      data-testid="add-field-btn"
                    >
                      <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                      Agregar campo
                    </button>
                  </div>
                  {fields.length === 0 ? (
                    <div className="border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500">
                      Sin campos. Pulsa &quot;Agregar campo&quot;.
                    </div>
                  ) : (
                    fields.map((f, idx) => (
                      <div key={idx} className="border border-zinc-200 p-3 space-y-2" data-testid={`field-row-${idx}`}>
                        <div className="grid grid-cols-12 gap-2">
                          <input
                            value={f.key}
                            onChange={(e) => updateField(idx, { key: e.target.value })}
                            placeholder="nombre_campo"
                            className="col-span-4 border border-zinc-300 px-2 py-1 text-sm focus:border-blue-600 focus:outline-none font-mono"
                            data-testid={`field-key-${idx}`}
                          />
                          <select
                            value={f.type}
                            onChange={(e) => updateField(idx, { type: e.target.value })}
                            className="col-span-3 border border-zinc-300 px-2 py-1 text-sm focus:border-blue-600 focus:outline-none"
                            data-testid={`field-type-${idx}`}
                          >
                            {FIELD_TYPES.map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          <label className="col-span-3 flex items-center gap-1 text-xs text-zinc-700">
                            <input
                              type="checkbox"
                              checked={f.required}
                              onChange={(e) => updateField(idx, { required: e.target.checked })}
                              data-testid={`field-required-${idx}`}
                            />
                            requerido
                          </label>
                          <button
                            onClick={() => removeField(idx)}
                            className="col-span-2 flex items-center justify-center text-red-600 hover:bg-red-50 border border-red-300"
                            data-testid={`remove-field-${idx}`}
                            aria-label="eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          value={f.description}
                          onChange={(e) => updateField(idx, { description: e.target.value })}
                          placeholder="Descripcion (opcional)"
                          className="w-full border border-zinc-200 px-2 py-1 text-xs focus:border-blue-600 focus:outline-none"
                          data-testid={`field-desc-${idx}`}
                        />
                        <input
                          value={f.enumValues}
                          onChange={(e) => updateField(idx, { enumValues: e.target.value })}
                          placeholder="Valores enum (separados por coma) - opcional"
                          className="w-full border border-zinc-200 px-2 py-1 text-xs focus:border-blue-600 focus:outline-none"
                          data-testid={`field-enum-${idx}`}
                        />
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Raw JSON */}
              {editorMode === "raw" && (
                <div className="space-y-2" data-testid="raw-editor">
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-700" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    JSON Schema
                  </span>
                  <textarea
                    value={rawJson}
                    onChange={(e) => { setRawJson(e.target.value); setRawError(""); }}
                    className="w-full h-72 border border-zinc-200 p-3 text-xs font-mono focus:border-blue-600 focus:outline-none"
                    spellCheck={false}
                    data-testid="raw-json-textarea"
                  />
                  {rawError && (
                    <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-300 p-2" data-testid="raw-json-error">
                      <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2.5} />
                      {rawError}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-zinc-200">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  data-testid="save-schema-btn"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" strokeWidth={2.5} />}
                  <span className="text-[11px] font-bold tracking-[0.15em] uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    {saving ? t("common.saving") : selectedId ? t("common.update") : t("admin.create_schema")}
                  </span>
                </button>
                {selectedId && (
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50 transition-colors"
                    data-testid="delete-schema-btn"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                    <span className="text-[11px] font-bold tracking-[0.15em] uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      Eliminar
                    </span>
                  </button>
                )}
                <button
                  onClick={resetForm}
                  className="ml-auto text-xs text-zinc-500 hover:text-zinc-900"
                  data-testid="reset-form-btn"
                >
                  Limpiar formulario
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
    <ConfirmDialog
      open={confirmDelete}
      onOpenChange={setConfirmDelete}
      title="Eliminar schema"
      description="¿Eliminar este schema? Esta acción no se puede deshacer."
      onConfirm={confirmDeleteSchema}
    />
    </>
  );
};

export default CustomSchemasPage;
