// Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { API } from "@/App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Share2, Copy, Trash2, Mail, Check } from "lucide-react";
import { toast } from "sonner";

/**
 * ShareResourceDialog
 *
 * Props:
 *  - open: bool
 *  - onOpenChange: (bool) => void
 *  - resource: { id, name, type: "project"|"diagram" }
 */
export const ShareResourceDialog = ({ open, onOpenChange, resource }) => {
  const shareSchema = z.object({ email: z.string().email("Introduce un email valido") });
  const shareForm = useForm({ resolver: zodResolver(shareSchema), defaultValues: { email: "" } });
  const [role, setRole] = useState("viewer");
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("session_token") : null;
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const load = useCallback(async () => {
    if (!resource?.id) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${API}/shares?resource_type=${resource.type}&resource_id=${resource.id}`,
        { headers: authHeaders, credentials: "include" },
      );
      if (res.ok) {
        const data = await res.json();
        setShares(data.shares || []);
      }
    } finally {
      setLoading(false);
    }
  }, [resource?.id, resource?.type]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const handleShare = async (data) => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/shares`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        credentials: "include",
        body: JSON.stringify({
          resource_type: resource.type,
          resource_id: resource.id,
          email: data.email.trim(),
          role,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || "Error al compartir");
        return;
      }
      toast.success(`Compartido con ${data.email}`);
      shareForm.reset();
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (shareId, newRole) => {
    const res = await fetch(`${API}/shares/${shareId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders },
      credentials: "include",
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      toast.success("Rol actualizado");
      await load();
    } else {
      toast.error("Error al actualizar");
    }
  };

  const handleRevoke = async (shareId) => {
    const res = await fetch(`${API}/shares/${shareId}`, {
      method: "DELETE",
      headers: authHeaders,
      credentials: "include",
    });
    if (res.ok) {
      toast.success("Acceso revocado");
      setShares((prev) => prev.filter((s) => s.id !== shareId));
    } else {
      toast.error("Error al revocar");
    }
  };

  const copyInviteLink = async (share) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const path = share.resource_type === "project"
      ? `/projects/${share.resource_id}`
      : `/editor/${share.resource_id}`;
    const url = `${origin}${path}?invite=${share.invite_token}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Enlace copiado");
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-lg border border-zinc-200" data-testid="share-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Share2 className="w-5 h-5" />
            Compartir "{resource?.name}"
          </DialogTitle>
          <DialogDescription>
            Invita a otros usuarios con permisos de <strong>viewer</strong> (solo lectura) o{" "}
            <strong>editor</strong> (lectura y escritura). Eliminar sigue siendo solo tuyo.
          </DialogDescription>
        </DialogHeader>

        <Form {...shareForm}>
        <form onSubmit={shareForm.handleSubmit(handleShare)} className="flex items-stretch gap-2 pt-2">
          <FormField
            control={shareForm.control}
            name="email"
            render={({ field }) => (
              <FormItem className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <FormControl>
                  <Input
                    type="email"
                    placeholder="email@ejemplo.com"
                    className="pl-9 rounded-lg border-zinc-300"
                    data-testid="share-email-input"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs absolute -bottom-4 left-0" />
              </FormItem>
            )}
          />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-28 rounded-lg border-zinc-300" data-testid="share-role-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
              <SelectItem value="viewer">Viewer</SelectItem>
              <SelectItem value="editor">Editor</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="submit"
            disabled={submitting || !shareForm.formState.isValid}
            className="rounded-lg bg-deep-navy hover:bg-deep-navy/90"
            data-testid="share-submit-btn"
          >
            {submitting ? "..." : "Invitar"}
          </Button>
        </form>
        </Form>

        <div className="pt-4">
          <div className="text-xs font-mono tracking-wide text-zinc-500 uppercase mb-2">
            Con acceso ({shares.length})
          </div>
          <div className="max-h-64 overflow-y-auto space-y-2" data-testid="share-list">
            {loading && <div className="text-sm text-zinc-400 italic px-2">Cargando…</div>}
            {!loading && shares.length === 0 && (
              <div className="text-sm text-zinc-500 italic border border-dashed border-zinc-300 p-3">
                Aún no has compartido este recurso.
              </div>
            )}
            {shares.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 border border-zinc-200 p-2"
                data-testid={`share-row-${s.id}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-zinc-900 truncate">{s.shared_with_email}</div>
                  <div className="text-xs text-zinc-500 font-mono flex items-center gap-1">
                    {s.accepted ? <Check className="w-3 h-3 text-emerald-600" /> : null}
                    {s.accepted ? "Aceptado" : "Pendiente"}
                  </div>
                </div>
                <Select value={s.role} onValueChange={(v) => handleRoleChange(s.id, v)}>
                  <SelectTrigger className="w-24 h-8 rounded-lg border-zinc-300 text-xs" data-testid={`share-role-${s.id}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => copyInviteLink(s)}
                  className="rounded-lg h-8 w-8"
                  title="Copiar enlace"
                  data-testid={`share-copy-${s.id}`}
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRevoke(s.id)}
                  className="rounded-lg h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Revocar"
                  data-testid={`share-revoke-${s.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-lg"
            data-testid="share-close-btn"
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareResourceDialog;
