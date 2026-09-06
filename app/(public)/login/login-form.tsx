"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

/**
 * Formulario de acceso. Deliberadamente mínimo: la capa visual llega con el diseño
 * de UX (PRD §9); aquí solo se cablea el flujo de autenticación.
 */
export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          password: form.get("password"),
        }),
      });

      if (!response.ok) {
        // El servidor responde RFC 9457; se muestra el `detail` como respaldo. El
        // día que haya i18n, el texto saldrá del `code`, que sí es estable.
        const problem = await response.json().catch(() => null);
        setError(problem?.detail ?? "No se ha podido iniciar sesión.");
        return;
      }

      const { redirectTo } = await response.json();
      // Solo se acepta el destino pedido si es una ruta interna: un `next` con host
      // externo convertiría el login en un open redirect.
      const target = next?.startsWith("/") && !next.startsWith("//") ? next : redirectTo;
      router.replace(target);
      router.refresh();
    } catch {
      setError("No se ha podido contactar con el servidor.");
    } finally {
      setPending(false);
    }
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
          className="h-9 rounded-md border px-3 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-9 rounded-md border px-3 text-sm"
        />
      </div>

      {error ? (
        // `role="alert"` para que un lector de pantalla anuncie el fallo sin que el
        // foco se mueva (objetivo WCAG 2.1 AA del PRD).
        <p role="alert" className="text-sm text-[var(--destructive)]">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
