"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Terms } from "@/components/terms";
import { Button } from "@/components/ui/button";

interface FieldIssue {
  field: string;
  issue: string;
}

/**
 * Definido a nivel de módulo, no dentro del formulario: un componente creado durante
 * el render es un tipo nuevo en cada pintado, así que React desmontaría el `input` y
 * el campo perdería el foco a cada tecla.
 */
function Field({
  name,
  label,
  issue,
  type = "text",
  autoComplete,
  inputMode,
}: {
  name: string;
  label: string;
  issue?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "numeric";
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        // El error se asocia al campo por aria-describedby para que un lector de
        // pantalla lo anuncie al enfocarlo (objetivo WCAG 2.1 AA).
        aria-invalid={issue ? true : undefined}
        aria-describedby={issue ? `${name}-error` : undefined}
        className="h-9 rounded-md border px-3 text-sm"
      />
      {issue ? (
        <p id={`${name}-error`} className="text-sm text-red-600">
          {issue}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Alta de suscriptor. Deliberadamente sobria: la capa visual llega con el diseño de
 * UX (PRD §9); aquí lo que importa es que los tres requisitos del alta —mayoría de
 * edad, condiciones y dirección de envío— se piden y se validan.
 */
export function RegisterForm() {
  const router = useRouter();
  const [issues, setIssues] = useState<FieldIssue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const issueFor = (field: string) => issues.find((i) => i.field === field)?.issue;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIssues([]);
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: text("email"),
          password: text("password"),
          fullName: text("fullName"),
          isAdult: form.get("isAdult") === "on",
          acceptsTerms: form.get("acceptsTerms") === "on",
          address: {
            line1: text("line1"),
            city: text("city"),
            postalCode: text("postalCode"),
          },
          card: {
            brand: text("brand"),
            last4: text("last4"),
            expMonth: Number(text("expMonth")),
            expYear: Number(text("expYear")),
          },
        }),
      });

      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        // El servidor devuelve `errors[]` por campo (RFC 9457): se pintan junto a su
        // campo en vez de amontonarlos en un mensaje global.
        setIssues(problem?.errors ?? []);
        setError(problem?.errors?.length ? null : (problem?.detail ?? "No se ha podido completar el alta."));
        return;
      }

      const { redirectTo } = await response.json();
      router.replace(redirectTo);
    } catch {
      setError("No se ha podido contactar con el servidor.");
    } finally {
      setPending(false);
    }
  }

  /** El servidor nombra los campos anidados como `address.line1` / `card.last4`. */
  const anyIssueFor = (name: string) =>
    issueFor(name) ?? issueFor(`address.${name}`) ?? issueFor(`card.${name}`);

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-6">
      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-sm font-semibold">Tus datos</legend>
        <Field name="fullName" label="Nombre y apellidos" autoComplete="name" issue={anyIssueFor("fullName")} />
        <Field name="email" label="Email" type="email" autoComplete="email" issue={anyIssueFor("email")} />
        <Field name="password" label="Contraseña" type="password" autoComplete="new-password" issue={anyIssueFor("password")} />
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-sm font-semibold">Dirección de envío</legend>
        <Field name="line1" label="Dirección" autoComplete="address-line1" issue={anyIssueFor("line1")} />
        <Field name="city" label="Localidad" autoComplete="address-level2" issue={anyIssueFor("city")} />
        <Field name="postalCode" label="Código postal" autoComplete="postal-code" issue={anyIssueFor("postalCode")} />
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-2 text-sm font-semibold">
          Tarjeta <span className="font-normal text-[var(--muted-foreground)]">(simulada)</span>
        </legend>
        <p className="text-sm text-[var(--muted-foreground)]">
          No se cobra nada ni se pide el número completo: en este MVP el pago está
          simulado.
        </p>
        <Field name="brand" label="Marca (p. ej. VISA)" issue={anyIssueFor("brand")} />
        <Field name="last4" label="Últimos 4 dígitos" inputMode="numeric" issue={anyIssueFor("last4")} />
        <div className="flex gap-3">
          <Field name="expMonth" label="Mes de caducidad" inputMode="numeric" issue={anyIssueFor("expMonth")} />
          <Field name="expYear" label="Año de caducidad" inputMode="numeric" issue={anyIssueFor("expYear")} />
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm font-semibold">Confirmaciones</legend>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="isAdult" className="mt-0.5" />
          <span>Declaro que soy mayor de edad.</span>
        </label>
        {issueFor("isAdult") ? (
          <p className="text-sm text-red-600">{issueFor("isAdult")}</p>
        ) : null}

        <Terms />
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="acceptsTerms" className="mt-0.5" />
          <span>He leído y acepto las condiciones del servicio.</span>
        </label>
        {issueFor("acceptsTerms") ? (
          <p className="text-sm text-red-600">{issueFor("acceptsTerms")}</p>
        ) : null}
      </fieldset>

      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Creando cuenta…" : "Crear cuenta"}
      </Button>
    </form>
  );
}
