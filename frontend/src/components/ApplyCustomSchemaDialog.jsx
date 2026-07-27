// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { API } from "@/App";
import { toast } from "sonner";
import { useI18n } from "@/contexts/I18nContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database, Loader2, Save, Trash2, AlertTriangle, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const authHeaders = () => {
  const t = localStorage.getItem("session_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

/** Generic field renderer based on JSON Schema property definition. */
const SchemaField = ({ keyName, def, value, required, onChange, error }) => {
  const t = def.type || "string";
  const enumVals = Array.isArray(def.enum) ? def.enum : null;

  const baseInputCls =
    "w-full border-2 px-3 py-2 text-sm focus:outline-none transition-colors " +
    (error ? "border-red-400 focus:border-red-600" : "border-zinc-300 focus:border-blue-600");

  const renderInput = () => {
    if (enumVals) {
      return (
        <Select value={String(value ?? "")} onValueChange={(v) => onChange(v)}>
          <SelectTrigger className="h-9 rounded-lg" data-testid={`apply-field-${keyName}`}>
            <SelectValue placeholder="— elige —" />
          </SelectTrigger>
          <SelectContent>
            {enumVals.map((v) => (
              <SelectItem key={v} value={String(v)}>{String(v)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    if (t === "boolean") {
      return (
        <select
          value={value === true ? "true" : value === false ? "false" : ""}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === "" ? null : v === "true");
          }}
          className={baseInputCls}
          data-testid={`apply-field-${keyName}`}
        >
          <option value="">— elige —</option>
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      );
    }
    if (t === "number" || t === "integer") {
      return (
        <input
          type="number"
          step={t === "integer" ? "1" : "any"}
          value={value ?? ""}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "") return onChange(null);
            const n = t === "integer" ? parseInt(raw, 10) : parseFloat(raw);
            onChange(Number.isNaN(n) ? raw : n);
          }}
          className={baseInputCls}
          data-testid={`apply-field-${keyName}`}
        />
      );
    }
    if (t === "array") {
      return (
        <input
          type="text"
          value={Array.isArray(value) ? value.join(", ") : (value ?? "")}
          onChange={(e) => {
            const arr = e.target.value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            onChange(arr);
          }}
          placeholder="valor1, valor2, valor3"
          className={baseInputCls}
          data-testid={`apply-field-${keyName}`}
        />
      );
    }
    if (t === "object") {
      // Free-form JSON
      return (
        <textarea
          rows={3}
          value={typeof value === "string" ? value : JSON.stringify(value || {}, null, 2)}
          onChange={(e) => {
            const raw = e.target.value;
            try {
              onChange(JSON.parse(raw));
            } catch {
              onChange(raw); // store raw string; validation will catch
            }
          }}
          placeholder='{"key": "value"}'
          className={`${baseInputCls} font-mono text-xs resize-none`}
          data-testid={`apply-field-${keyName}`}
        />
      );
    }
    // string default
    return (
      <input
        type="text"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={baseInputCls}
        data-testid={`apply-field-${keyName}`}
      />
    );
  };

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between">
        <Label
          className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-700"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {keyName}
          {required && <span className="text-red-500 ml-1">*</span>}
          <span className="ml-2 text-zinc-400 font-normal normal-case tracking-normal">{t}</span>
        </Label>
      </div>
      {def.description && <p className="text-[11px] text-zinc-500">{def.description}</p>}
      {renderInput()}
      {error && <p className="text-[11px] text-red-600">{error}</p>}
    </div>
  );
};

/** Validate metadata locally before POST (matches backend `_coerce_and_validate`). */
const localValidate = (schema, metadata) => {
  const errors = {};
  const props = schema?.properties || {};
  const required = schema?.required || [];
  for (const r of required) {
    if (metadata[r] == null || metadata[r] === "") errors[r] = "Campo requerido";
  }
  for (const [k, v] of Object.entries(metadata)) {
    const spec = props[k];
    if (!spec || v == null || v === "") continue;
    const t = spec.type;
    if (t === "string" && typeof v !== "string") errors[k] = "Debe ser texto";
    else if (t === "number" && typeof v !== "number") errors[k] = "Debe ser numero";
    else if (t === "integer" && (!Number.isInteger(v))) errors[k] = "Debe ser entero";
    else if (t === "boolean" && typeof v !== "boolean") errors[k] = "Debe ser booleano";
    else if (t === "array" && !Array.isArray(v)) errors[k] = "Debe ser array";
    else if (t === "object" && (typeof v !== "object" || Array.isArray(v))) errors[k] = "Debe ser objeto JSON valido";
    if (Array.isArray(spec.enum) && !spec.enum.includes(v)) errors[k] = `Debe ser uno de: ${spec.enum.join(", ")}`;
  }
  return errors;
};

const ApplyCustomSchemaDialog = ({ open, onOpenChange, oopClass, isEnterprise, onApplied }) => {
  const { t } = useI18n();
  const [schemas, setSchemas] = useState([]);
  const [loadingSchemas, setLoadingSchemas] = useState(false);
  const [selectedSchemaId, setSelectedSchemaId] = useState("");
  const [selectedSchema, setSelectedSchema] = useState(null);
  const [metadata, setMetadata] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Fetch enterprise schemas (oop_class scope)
  const loadSchemas = useCallback(async () => {
    if (!open || !isEnterprise) return;
    setLoadingSchemas(true);
    try {
      const r = await fetch(`${API}/custom-schemas?scope=oop_class`, {
        headers: authHeaders(),
        credentials: "include",
      });
      if (r.ok) setSchemas(await r.json());
    } finally {
      setLoadingSchemas(false);
    }
  }, [open, isEnterprise]);

  useEffect(() => { loadSchemas(); }, [loadSchemas]);

  // Reset state on dialog open and when oop class changes
  useEffect(() => {
    if (!open) return;
    setSelectedSchemaId("");
    setSelectedSchema(null);
    setMetadata({});
    setErrors({});
  }, [open, oopClass?.id]);

  // When a schema is selected: fetch its full definition + pre-fill with existing metadata
  useEffect(() => {
    if (!selectedSchemaId) {
      setSelectedSchema(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const r = await fetch(`${API}/custom-schemas/${selectedSchemaId}`, {
        headers: authHeaders(),
        credentials: "include",
      });
      if (!r.ok || cancelled) return;
      const doc = await r.json();
      if (cancelled) return;
      setSelectedSchema(doc);
      // Pre-fill from oopClass.custom_metadata if exists
      const existing = oopClass?.custom_metadata?.[selectedSchemaId]?.data || {};
      setMetadata(existing);
      setErrors({});
    })();
    return () => { cancelled = true; };
  }, [selectedSchemaId, oopClass]);

  const appliedSchemaIds = useMemo(
    () => Object.keys(oopClass?.custom_metadata || {}),
    [oopClass],
  );

  const handleSave = async () => {
    if (!selectedSchema) return;
    const localErr = localValidate(selectedSchema.schema, metadata);
    if (Object.keys(localErr).length > 0) {
      setErrors(localErr);
      toast.error("Corrige los errores antes de guardar");
      return;
    }
    setSaving(true);
    try {
      const r = await fetch(`${API}/oop-classes/${oopClass.id}/apply-custom-schema`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ schema_id: selectedSchemaId, metadata }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        const detail = err?.detail?.errors?.join("; ") || err?.detail || "fallo al aplicar";
        toast.error(`Error: ${detail}`);
        return;
      }
      toast.success("Metadata aplicada correctamente");
      const data = await r.json();
      onApplied?.(data.custom_metadata);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  // Enterprise lock view
  if (open && !isEnterprise) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md rounded-lg border-2 border-amber-400" data-testid="apply-schema-locked-dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-900">
              <Lock className="w-5 h-5" strokeWidth={2.5} />
              Funcion Enterprise
            </DialogTitle>
          </DialogHeader>
          <div className="text-sm text-amber-900 space-y-3">
            <p>Aplicar Custom Schemas a clases OOP requiere el plan <strong>Enterprise</strong>.</p>
            <Link
              to="/pricing"
              className="inline-block px-4 py-2 bg-amber-900 text-amber-50 hover:bg-amber-800 text-[11px] font-bold tracking-wider uppercase"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Ver planes
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl rounded-lg border border-zinc-200" data-testid="apply-schema-dialog">
        <DialogHeader className="border-b border-zinc-200 -mx-6 -mt-6 px-6 py-4 bg-deep-navy text-white">
          <DialogTitle
            className="flex items-center gap-2 text-[11px] font-bold tracking-[0.2em] uppercase"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            <Database className="w-4 h-4" strokeWidth={2.5} />
            Aplicar Custom Schema · {oopClass?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Selector */}
          <div>
            <Label
              className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-500 mb-1.5 block"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Schema disponible
            </Label>
            {loadingSchemas ? (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Loader2 className="w-4 h-4 animate-spin" /> Cargando schemas...
              </div>
            ) : schemas.length === 0 ? (
              <div className="border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900" data-testid="no-schemas-msg">
                <div className="flex items-center gap-2 font-semibold mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2.5} />
                  No hay schemas con scope &quot;oop_class&quot;
                </div>
                <p>
                  Ve a{" "}
                  <Link to="/custom-schemas" className="underline font-bold">
                    /custom-schemas
                  </Link>{" "}
                  y crea uno con scope &quot;OOP Class&quot;.
                </p>
              </div>
            ) : (
              <Select value={selectedSchemaId} onValueChange={setSelectedSchemaId}>
                <SelectTrigger className="h-10 rounded-lg border-2" data-testid="apply-schema-select">
                  <SelectValue placeholder="Elige un schema" />
                </SelectTrigger>
                <SelectContent>
                  {schemas.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                      {appliedSchemaIds.includes(s.id) && (
                        <span className="ml-2 text-emerald-600 text-[10px] font-bold">· APLICADO</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Form fields based on selected schema */}
          {selectedSchema && (
            <div className="space-y-4 border-t border-zinc-200 pt-4" data-testid="apply-schema-fields">
              {selectedSchema.description && (
                <p className="text-xs text-zinc-500 italic">{selectedSchema.description}</p>
              )}
              {Object.entries(selectedSchema.schema?.properties || {}).length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-4">
                  Este schema no tiene campos definidos.
                </p>
              ) : (
                Object.entries(selectedSchema.schema.properties).map(([k, def]) => (
                  <SchemaField
                    key={k}
                    keyName={k}
                    def={def}
                    value={metadata[k]}
                    required={(selectedSchema.schema.required || []).includes(k)}
                    onChange={(v) => {
                      setMetadata((prev) => ({ ...prev, [k]: v }));
                      setErrors((prev) => {
                        const c = { ...prev };
                        delete c[k];
                        return c;
                      });
                    }}
                    error={errors[k]}
                  />
                ))
              )}
            </div>
          )}

          {/* Already applied schemas summary */}
          {appliedSchemaIds.length > 0 && !selectedSchemaId && (
            <div className="border-t border-zinc-200 pt-4" data-testid="applied-schemas-summary">
              <div
                className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-500 mb-2"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                Schemas aplicados ({appliedSchemaIds.length})
              </div>
              <ul className="space-y-1">
                {Object.entries(oopClass?.custom_metadata || {}).map(([sid, info]) => (
                  <li
                    key={sid}
                    className="flex items-center justify-between text-xs bg-zinc-50 border border-zinc-200 px-3 py-2"
                  >
                    <span className="font-semibold text-zinc-900">{info.schema_name}</span>
                    <button
                      onClick={() => setSelectedSchemaId(sid)}
                      className="text-blue-600 hover:underline text-[11px]"
                      data-testid={`load-applied-${sid}`}
                    >
                      Editar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="border-t-2 border-zinc-200 -mx-6 -mb-6 px-6 py-3 bg-zinc-50">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-lg"
            data-testid="apply-schema-cancel"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedSchema || saving || schemas.length === 0}
            className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
            data-testid="apply-schema-save"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" strokeWidth={2.5} />
            )}
            <span
              className="text-[11px] font-bold tracking-[0.15em] uppercase"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              {saving ? t("common.saving") : t("admin.apply_metadata")}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApplyCustomSchemaDialog;
