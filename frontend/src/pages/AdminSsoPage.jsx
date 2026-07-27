// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth, API } from "@/App";
import ProjectMenuBar from "@/components/ProjectMenuBar";
import ConfirmDialog from "@/components/ConfirmDialog";
import { toast } from "sonner";
import { useI18n } from "@/contexts/I18nContext";
import {
  Building2,
  Plus,
  Trash2,
  Save,
  Loader2,
  Download,
  KeyRound,
  Link as LinkIcon,
  Lock,
} from "lucide-react";
import { downloadFromUrl } from "@/lib/downloadFile";

const authHeaders = () => {
  const t = localStorage.getItem("session_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
};

const empty = () => ({
  email_domain: "",
  organization_name: "",
  idp_entity_id: "",
  idp_sso_url: "",
  idp_slo_url: "",
  x509_cert: "",
  name_id_format: "urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress",
});

const Field = ({ label, children, hint }) => (
  <div>
    <label
      className="block text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-500 mb-1.5"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      {label}
    </label>
    {children}
    {hint && <p className="text-[11px] text-zinc-400 mt-1">{hint}</p>}
  </div>
);

const AdminSsoPage = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isEnterprise = isAdmin || user?.plan === "enterprise";

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty());
  const [editingDomain, setEditingDomain] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    if (!isEnterprise) return;
    try {
      const r = await fetch(`${API}/sso-configs`, { headers: authHeaders(), credentials: "include" });
      if (r.ok) setItems(await r.json());
    } finally {
      setLoading(false);
    }
  }, [isEnterprise]);

  useEffect(() => { load(); }, [load]);

  const openConfig = async (domain) => {
    const r = await fetch(`${API}/sso-configs/${encodeURIComponent(domain)}`, {
      headers: authHeaders(), credentials: "include",
    });
    if (r.ok) {
      const d = await r.json();
      setForm({
        email_domain: d.email_domain,
        organization_name: d.organization_name || "",
        idp_entity_id: d.idp_entity_id || "",
        idp_sso_url: d.idp_sso_url || "",
        idp_slo_url: d.idp_slo_url || "",
        x509_cert: d.x509_cert || "",
        name_id_format: d.name_id_format || empty().name_id_format,
      });
      setEditingDomain(domain);
    }
  };

  const resetForm = () => {
    setForm(empty());
    setEditingDomain(null);
  };

  const save = async () => {
    if (!form.email_domain.trim() || !form.idp_sso_url.trim() || !form.x509_cert.trim()) {
      toast.error("Dominio, SSO URL y certificado IdP son obligatorios");
      return;
    }
    setSaving(true);
    try {
      const url = editingDomain
        ? `${API}/sso-configs/${encodeURIComponent(editingDomain)}`
        : `${API}/sso-configs`;
      const method = editingDomain ? "PUT" : "POST";
      const r = await fetch(url, {
        method,
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        toast.error(`Error: ${err.detail || r.status}`);
        return;
      }
      toast.success(editingDomain ? "SSO actualizado" : "SSO creado");
      await load();
      if (!editingDomain) resetForm();
    } finally {
      setSaving(false);
    }
  };

  const del = async () => {
    if (!editingDomain) return;
    setConfirmDelete(true);
  };

  const confirmDel = async () => {
    setConfirmDelete(false);
    const r = await fetch(`${API}/sso-configs/${encodeURIComponent(editingDomain)}`, {
      method: "DELETE", headers: authHeaders(), credentials: "include",
    });
    if (r.ok) {
      toast.success("SSO eliminado");
      resetForm();
      await load();
    } else {
      toast.error("Error al eliminar");
    }
  };

  const downloadMetadata = async () => {
    if (!editingDomain && !form.email_domain) {
      toast.error("Guarda la configuracion primero");
      return;
    }
    const domain = editingDomain || form.email_domain;
    downloadFromUrl(
      `${API}/auth/saml/metadata?domain=${encodeURIComponent(domain)}`,
      `sp-metadata-${domain}.xml`,
    );
    toast.success("Descarga iniciada");
  };

  // ---------- Guards ----------

  if (user && !isEnterprise) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <ProjectMenuBar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl mx-auto border border-amber-400 bg-amber-50 p-8" data-testid="sso-locked-card">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-amber-700" strokeWidth={2.5} />
              <h1 className="text-2xl font-black text-amber-900" style={{ fontFamily: "'Chivo', sans-serif" }}>
                Funcion Enterprise
              </h1>
            </div>
            <p className="text-sm text-amber-900">
              SSO con SAML 2.0 solo esta disponible para el plan <strong>Enterprise</strong>.
            </p>
            <Link to="/pricing" className="inline-block mt-4 px-4 py-2 bg-amber-900 text-amber-50 hover:bg-amber-800 text-[11px] font-bold tracking-wider uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              Ver planes
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
    <div className="min-h-screen bg-white flex flex-col" data-testid="admin-sso-page">
      <ProjectMenuBar />
      <div className="flex-1 overflow-y-auto flex flex-col">
        <header className="sticky top-0 z-30 bg-white border-b border-zinc-200 h-14 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-deep-navy flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-zinc-400 tracking-widest uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>ENTERPRISE · SAML 2.0</p>
              <h1 className="text-base font-bold text-zinc-900 tracking-tight" style={{ fontFamily: "'Chivo', sans-serif" }}>SSO (Single Sign-On)</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetForm}
              className="flex items-center gap-2 px-4 py-2 border border-zinc-200 text-zinc-900 hover:bg-deep-navy hover:text-white transition-colors"
              data-testid="new-sso-btn"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                Nueva config
              </span>
            </button>
          </div>
        </header>
        <div className="p-6">
          <p className="text-sm text-zinc-500 mb-6 max-w-2xl">
            Configura tu Identity Provider (Okta, Azure AD, Auth0, etc). Los usuarios con email del dominio registrado
            podran iniciar sesion sin password.
          </p>

        <div className="grid grid-cols-12 gap-6">
          {/* List */}
          <div className="col-span-4">
            <div className="border border-zinc-200 bg-white">
              <div className="border-b border-zinc-200 px-4 py-2 bg-deep-navy text-white">
                <span className="text-[10px] font-bold tracking-[0.15em] uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  Dominios ({items.length})
                </span>
              </div>
              {items.length === 0 ? (
                <div className="p-6 text-center text-sm text-zinc-500" data-testid="sso-empty">
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
                  Sin configuraciones SSO.
                </div>
              ) : (
                <ul>
                  {items.map((it) => (
                    <li key={it.email_domain}>
                      <button
                        onClick={() => openConfig(it.email_domain)}
                        className={`w-full text-left px-4 py-3 border-b border-zinc-200 last:border-b-0 hover:bg-zinc-50 transition-colors ${
                          editingDomain === it.email_domain ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                        }`}
                        data-testid={`sso-item-${it.email_domain}`}
                      >
                        <div className="font-semibold text-sm text-zinc-900">{it.email_domain}</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">{it.organization_name}</div>
                        <div className="text-[10px] text-zinc-400 mt-1 font-mono truncate">{it.idp_sso_url}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="col-span-8">
            <div className="border border-zinc-200 bg-white p-6 space-y-4" data-testid="sso-form">
              <div className="flex items-center justify-between">
                <div
                  className="text-[11px] font-bold tracking-[0.2em] uppercase text-zinc-500"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {editingDomain ? `Editando: ${editingDomain}` : "Nueva configuracion SSO"}
                </div>
                {editingDomain && (
                  <button
                    onClick={downloadMetadata}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-300 text-blue-700 hover:bg-blue-50 text-[10px] font-bold tracking-wider uppercase"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    data-testid="download-metadata-btn"
                  >
                    <Download className="w-3.5 h-3.5" strokeWidth={2.5} />
                    Metadata SP (XML)
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Dominio email" hint='Ej: "acme.com" — usuarios con email @acme.com usaran este SSO'>
                  <input
                    value={form.email_domain}
                    onChange={(e) => setForm({ ...form, email_domain: e.target.value.toLowerCase() })}
                    placeholder="acme.com"
                    disabled={!!editingDomain}
                    className="w-full border border-zinc-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none disabled:bg-zinc-100"
                    data-testid="sso-domain-input"
                  />
                </Field>
                <Field label="Organizacion">
                  <input
                    value={form.organization_name}
                    onChange={(e) => setForm({ ...form, organization_name: e.target.value })}
                    placeholder="ACME Corp"
                    className="w-full border border-zinc-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                    data-testid="sso-org-input"
                  />
                </Field>
              </div>

              <Field label="IdP Entity ID" hint='El "Issuer" / "Entity ID" que expone tu IdP'>
                <input
                  value={form.idp_entity_id}
                  onChange={(e) => setForm({ ...form, idp_entity_id: e.target.value })}
                  placeholder="http://idp.acme.com/exk..."
                  className="w-full border border-zinc-200 px-3 py-2 text-sm font-mono focus:border-blue-600 focus:outline-none"
                  data-testid="sso-idp-entity-input"
                />
              </Field>

              <Field label="IdP SSO URL" hint="Endpoint HTTP-Redirect al que enviamos AuthnRequest">
                <input
                  value={form.idp_sso_url}
                  onChange={(e) => setForm({ ...form, idp_sso_url: e.target.value })}
                  placeholder="https://idp.acme.com/app/.../sso/saml"
                  className="w-full border border-zinc-200 px-3 py-2 text-sm font-mono focus:border-blue-600 focus:outline-none"
                  data-testid="sso-idp-sso-input"
                />
              </Field>

              <Field label="IdP SLO URL (opcional)" hint="Endpoint para Single Logout (puede dejarse vacio)">
                <input
                  value={form.idp_slo_url}
                  onChange={(e) => setForm({ ...form, idp_slo_url: e.target.value })}
                  placeholder="https://idp.acme.com/app/.../slo/saml"
                  className="w-full border border-zinc-200 px-3 py-2 text-sm font-mono focus:border-blue-600 focus:outline-none"
                  data-testid="sso-idp-slo-input"
                />
              </Field>

              <Field label="IdP x509 Certificate (PEM)" hint="Pegalo completo incluyendo las lineas BEGIN/END CERTIFICATE">
                <textarea
                  value={form.x509_cert}
                  onChange={(e) => setForm({ ...form, x509_cert: e.target.value })}
                  rows={6}
                  placeholder="-----BEGIN CERTIFICATE-----&#10;MIIDnzCCAoe...&#10;-----END CERTIFICATE-----"
                  className="w-full border border-zinc-200 px-3 py-2 text-xs font-mono focus:border-blue-600 focus:outline-none"
                  data-testid="sso-cert-input"
                />
              </Field>

              <Field label="NameID Format">
                <select
                  value={form.name_id_format}
                  onChange={(e) => setForm({ ...form, name_id_format: e.target.value })}
                  className="w-full border border-zinc-200 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                  data-testid="sso-nameid-select"
                >
                  <option value="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">emailAddress (recomendado)</option>
                  <option value="urn:oasis:names:tc:SAML:2.0:nameid-format:persistent">persistent</option>
                  <option value="urn:oasis:names:tc:SAML:2.0:nameid-format:transient">transient</option>
                  <option value="urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified">unspecified</option>
                </select>
              </Field>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-zinc-200">
                <button
                  onClick={save}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  data-testid="sso-save-btn"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" strokeWidth={2.5} />}
                  <span className="text-[11px] font-bold tracking-[0.15em] uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    {saving ? t("common.saving") : editingDomain ? t("common.update") : t("admin.create_sso")}
                  </span>
                </button>
                {editingDomain && (
                  <button
                    onClick={del}
                    className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50"
                    data-testid="sso-delete-btn"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                    <span className="text-[11px] font-bold tracking-[0.15em] uppercase" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      Eliminar
                    </span>
                  </button>
                )}
                {editingDomain && (
                  <a
                    href={`${API}/auth/saml/login?domain=${encodeURIComponent(editingDomain)}`}
                    target="_blank" rel="noreferrer"
                    className="ml-auto flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-zinc-600 hover:text-blue-600"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    data-testid="sso-test-btn"
                  >
                    <LinkIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                    Probar login
                  </a>
                )}
              </div>

              {/* Quick-reference for admin */}
              {editingDomain && (
                <div className="bg-zinc-50 border border-zinc-200 p-3 mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <KeyRound className="w-3.5 h-3.5 text-zinc-500" strokeWidth={2.5} />
                    <span
                      className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-600"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      Datos para registrar en tu IdP
                    </span>
                  </div>
                  <ul className="text-[11px] space-y-1 text-zinc-600 font-mono">
                    <li><strong>ACS URL:</strong> {window.location.origin}/api/auth/saml/acs</li>
                    <li><strong>Entity ID:</strong> {window.location.origin}/api/auth/saml/metadata</li>
                    <li><strong>NameID:</strong> emailAddress</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
    <ConfirmDialog
      open={confirmDelete}
      onOpenChange={setConfirmDelete}
      title="Eliminar SSO"
      description={`¿Eliminar SSO para "${editingDomain}"?`}
      onConfirm={confirmDel}
    />
    </>
  );
};

export default AdminSsoPage;
