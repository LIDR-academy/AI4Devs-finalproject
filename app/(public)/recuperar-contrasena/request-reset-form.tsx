"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

/**
 * Solicitud del enlace de restablecimiento.
 *
 * La confirmación **no dice si esa dirección tiene cuenta**, y por eso se muestra
 * igual en los tres casos que el servidor trata idénticos: cuenta activa, cuenta
 * suspendida y dirección desconocida. Decir "no encontramos esa cuenta" sería la forma
 * más cómoda de averiguar quién está dado de alta.
 */
export function RequestResetForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issue, setIssue] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIssue(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: form.get("email") }),
      });

      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        const fieldIssue = problem?.errors?.[0]?.issue;
        if (fieldIssue) setIssue(fieldIssue);
        else setError(problem?.detail ?? "No se ha podido enviar el enlace.");
        return;
      }

      setSent(true);
    } catch {
      setError("No se ha podido contactar con el servidor.");
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      // `role="status"` y no `alert`: es una confirmación, no un fallo, y el lector de
      // pantalla debe anunciarla sin interrumpir lo que esté leyendo.
      <p role="status" className="max-w-prose rounded-md border p-3 text-sm">
        Si esa dirección tiene una cuenta, te hemos enviado un enlace para restablecer
        la contraseña. Revisa tu correo; el enlace caduca en una hora.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={issue ? true : undefined}
          aria-describedby={issue ? "email-error" : undefined}
          className="h-9 rounded-md border px-3 text-sm"
        />
        {issue ? (
          <p id="email-error" className="text-sm text-[var(--destructive)]">
            {issue}
          </p>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-sm text-[var(--destructive)]">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Enviando…" : "Enviarme el enlace"}
      </Button>
    </form>
  );
}
