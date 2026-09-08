"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { PasswordInput } from "@/components/password-input";
import { Terms } from "@/components/terms";
import { numericField } from "@/lib/form-values";
import { Button } from "@/components/ui/button";
import { simultaneousSets } from "@/lib/status";
import type { PublicPlan } from "@/repositories/catalog.repository";

interface FieldIssue {
  field: string;
  issue: string;
}

const EUR = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

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
  const control = {
    id: name,
    name,
    autoComplete,
    // El error se asocia al campo por aria-describedby para que un lector de
    // pantalla lo anuncie al enfocarlo (objetivo WCAG 2.1 AA).
    "aria-invalid": issue ? true : undefined,
    "aria-describedby": issue ? `${name}-error` : undefined,
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      {type === "password" ? (
        // La contraseña la escribe quien se da de alta y no puede releerla: el ojo es
        // aquí más útil que en el login, porque un error tipográfico no se descubre
        // hasta el primer intento de entrar.
        <PasswordInput {...control} toggleLabel={`Mostrar ${label.toLowerCase()}`} />
      ) : (
        <input
          {...control}
          type={type}
          inputMode={inputMode}
          className="h-9 rounded-md border px-3 text-sm"
        />
      )}
      {issue ? (
        <p id={`${name}-error`} className="text-sm text-[var(--destructive)]">
          {issue}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Alta de suscriptor. Deliberadamente sobria: la capa visual llega con el diseño de
 * UX (PRD §9); aquí lo que importa es que los cuatro requisitos del alta —mayoría de
 * edad, condiciones, dirección de envío y plan— se piden y se validan.
 *
 * El plan llega preseleccionado desde `/planes` (`?plan=PREMIUM`) pero se puede
 * cambiar aquí mismo: obligar a volver atrás para corregirlo sería un callejón. Si no
 * viene ninguno **no se preselecciona**: elegir plan es una decisión del visitante, y
 * un valor por defecto silencioso le contrataría algo que no ha mirado.
 */
export function RegisterForm({
  plans,
  preselectedPlan,
}: {
  plans: readonly PublicPlan[];
  preselectedPlan?: string;
}) {
  const router = useRouter();
  const [issues, setIssues] = useState<FieldIssue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [planCode, setPlanCode] = useState(
    // Solo si el código de la URL corresponde a un plan real: un `?plan=` inventado no
    // debe dejar el formulario con una selección que el servidor rechazaría.
    plans.some((plan) => plan.code === preselectedPlan) ? preselectedPlan! : ""
  );

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
            expMonth: numericField(form.get("expMonth")),
            expYear: numericField(form.get("expYear")),
          },
          planCode,
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
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm font-semibold">Tu plan</legend>
        {plans.map((plan) => (
          <label
            key={plan.code}
            className="flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm has-checked:border-[var(--foreground)]"
          >
            <input
              type="radio"
              name="planCode"
              value={plan.code}
              className="mt-1"
              checked={planCode === plan.code}
              onChange={() => setPlanCode(plan.code)}
            />
            <span className="flex flex-col gap-0.5">
              <span className="font-medium">
                {plan.name} · {EUR.format(Number(plan.monthlyPrice))} / mes
              </span>
              <span className="text-[var(--muted-foreground)]">
                {simultaneousSets(plan.maxSimultaneousSets)}
                {plan.queueBonusDays > 0
                  ? ` · ${plan.queueBonusDays} días de ventaja en las colas`
                  : ""}
              </span>
            </span>
          </label>
        ))}
        {issueFor("planCode") ? (
          <p className="text-sm text-[var(--destructive)]">{issueFor("planCode")}</p>
        ) : null}
      </fieldset>

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
          <p className="text-sm text-[var(--destructive)]">{issueFor("isAdult")}</p>
        ) : null}

        <Terms />
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" name="acceptsTerms" className="mt-0.5" />
          <span>He leído y acepto las condiciones del servicio.</span>
        </label>
        {issueFor("acceptsTerms") ? (
          <p className="text-sm text-[var(--destructive)]">{issueFor("acceptsTerms")}</p>
        ) : null}
      </fieldset>

      {error ? (
        <p role="alert" className="text-sm text-[var(--destructive)]">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Creando cuenta…" : "Crear cuenta"}
      </Button>
    </form>
  );
}
