"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";

interface FieldIssue {
  field: string;
  issue: string;
}

/**
 * Contraseña nueva a partir del token del enlace.
 *
 * Distingue dos fallos que no se arreglan igual: lo que se puede corregir sin salir
 * de aquí (contraseña corta, confirmación que no coincide) se pinta junto al campo, y
 * el enlace que ya no sirve —410— sustituye el formulario por la única salida que
 * queda, pedir otro. Dejar el formulario en pie con un token muerto solo invita a
 * reintentar lo imposible.
 */
export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [issues, setIssues] = useState<FieldIssue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [pending, setPending] = useState(false);

  const issueFor = (field: string) => issues.find((i) => i.field === field)?.issue;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIssues([]);
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          token,
          password: form.get("password"),
          passwordConfirmation: form.get("passwordConfirmation"),
        }),
      });

      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        // Se decide por `code`, que es el enum estable de ADR-0002, no por el estado
        // ni por el texto.
        if (problem?.code === "RESET_TOKEN_INVALID") {
          setExpired(true);
          return;
        }
        setIssues(problem?.errors ?? []);
        setError(
          problem?.errors?.length
            ? null
            : (problem?.detail ?? "No se ha podido cambiar la contraseña.")
        );
        return;
      }

      const { redirectTo } = await response.json();
      router.replace(`${redirectTo}?restablecida=1`);
    } catch {
      setError("No se ha podido contactar con el servidor.");
    } finally {
      setPending(false);
    }
  }

  if (expired) {
    return (
      <p role="alert" className="max-w-prose rounded-md border p-3 text-sm">
        Este enlace ya no sirve: puede que haya caducado o que ya lo hayas usado. Tu
        contraseña no ha cambiado. Puedes{" "}
        <Link href="/recuperar-contrasena" className="underline underline-offset-4">
          pedir uno nuevo
        </Link>
        .
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Contraseña nueva
        </label>
        {/* Los dos ojos de esta pantalla se llaman distinto: dos botones con el mismo
            nombre son ambiguos para quien navega por nombre, y aquí la comparación
            entre los dos campos es justo lo que se quiere poder mirar. */}
        <PasswordInput
          id="password"
          name="password"
          autoComplete="new-password"
          required
          minLength={8}
          aria-invalid={issueFor("password") ? true : undefined}
          aria-describedby={issueFor("password") ? "password-error" : "password-hint"}
          toggleLabel="Mostrar la contraseña nueva"
        />
        {issueFor("password") ? (
          <p id="password-error" className="text-sm text-[var(--destructive)]">
            {issueFor("password")}
          </p>
        ) : (
          <p id="password-hint" className="text-sm text-[var(--muted-foreground)]">
            Al menos 8 caracteres.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="passwordConfirmation" className="text-sm font-medium">
          Repite la contraseña
        </label>
        <PasswordInput
          id="passwordConfirmation"
          name="passwordConfirmation"
          autoComplete="new-password"
          required
          aria-invalid={issueFor("passwordConfirmation") ? true : undefined}
          aria-describedby={
            issueFor("passwordConfirmation") ? "passwordConfirmation-error" : undefined
          }
          toggleLabel="Mostrar la contraseña repetida"
        />
        {issueFor("passwordConfirmation") ? (
          <p id="passwordConfirmation-error" className="text-sm text-[var(--destructive)]">
            {issueFor("passwordConfirmation")}
          </p>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-sm text-[var(--destructive)]">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Guardando…" : "Guardar contraseña"}
      </Button>
    </form>
  );
}
