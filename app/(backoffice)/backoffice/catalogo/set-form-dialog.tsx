"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ManagedSet, ThemeOption } from "@/repositories/set.repository";

interface FieldIssue {
  field: string;
  issue: string;
}

/**
 * Definido a nivel de módulo por la misma razón que en el alta de suscriptor: un
 * componente creado durante el render es un tipo nuevo en cada pintado, así que React
 * desmontaría el `input` y el campo perdería el foco a cada tecla.
 */
function Field({
  name,
  label,
  issue,
  defaultValue,
  required,
  type = "text",
  inputMode,
  hint,
}: {
  name: string;
  label: string;
  issue?: string;
  defaultValue?: string | number | null;
  required?: boolean;
  type?: string;
  inputMode?: "numeric" | "decimal";
  hint?: string;
}) {
  const hintId = hint ? `${name}-hint` : undefined;
  const errorId = issue ? `${name}-error` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>
        {label}
        {required ? (
          <abbr title="obligatorio" className="no-underline">
            *
          </abbr>
        ) : null}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        required={required}
        defaultValue={defaultValue ?? undefined}
        aria-invalid={issue ? true : undefined}
        aria-describedby={[errorId, hintId].filter(Boolean).join(" ") || undefined}
      />
      {hint ? (
        <p id={hintId} className="text-xs text-[var(--muted-foreground)]">
          {hint}
        </p>
      ) : null}
      {issue ? (
        <p id={errorId} className="text-sm text-[var(--destructive)]">
          {issue}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Alta y edición de un Set (`wireframes.md` §6.3). Un solo componente para las dos
 * porque los campos **son los mismos** —los del esquema Zod de `POST /api/sets`— y
 * mantener dos formularios garantizaría que un campo nuevo llegase solo a uno.
 *
 * Tres cosas salen del esquema y no de la imaginación: el tema es un `uuid`, así que
 * es un desplegable y nunca texto libre; el valor de referencia viaja como **cadena**
 * con dos decimales, porque el decimal exacto no cabe en un `number`; y solo el tema,
 * el nombre y las piezas son obligatorios.
 *
 * **Vaciar un campo no significa lo mismo al crear que al editar.** Al crear, un campo
 * vacío no se envía; al editar se manda `null` explícito, que es lo único que
 * distingue "bórralo" de "no lo toques" en un `PATCH`.
 */
export function SetFormDialog({
  themes,
  set,
  triggerLabel,
  triggerVariant = "default",
}: {
  themes: readonly ThemeOption[];
  /** Presente = edición. Ausente = alta. */
  set?: ManagedSet;
  triggerLabel: string;
  triggerVariant?: "default" | "outline";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [issues, setIssues] = useState<FieldIssue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const editing = set !== undefined;
  const issueFor = (field: string) => issues.find((i) => i.field === field)?.issue;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIssues([]);
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "").trim();
    /** Opcional vacío: al crear no se envía; al editar se limpia con `null`. */
    const optional = (name: string) => {
      const value = text(name);
      if (value !== "") return value;
      return editing ? null : undefined;
    };
    const optionalNumber = (name: string) => {
      const value = optional(name);
      return typeof value === "string" ? Number(value) : value;
    };

    try {
      const response = await fetch(editing ? `/api/sets/${set.id}` : "/api/sets", {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          themeId: text("themeId"),
          name: text("name"),
          pieceCount: Number(text("pieceCount")),
          setNum: optional("setNum"),
          year: optionalNumber("year"),
          recommendedAge: optional("recommendedAge"),
          difficulty: optional("difficulty"),
          referenceValue: optional("referenceValue"),
          boxPhotoUrl: optional("boxPhotoUrl"),
          restricted: form.get("restricted") === "on",
        }),
      });

      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        // El servidor devuelve `errors[]` por campo (RFC 9457): cada uno se pinta junto
        // al suyo en vez de amontonarlos en un mensaje global.
        setIssues(problem?.errors ?? []);
        setError(
          problem?.errors?.length ? null : (problem?.detail ?? "No se ha podido guardar el set.")
        );
        return;
      }

      setOpen(false);
      if (editing) {
        router.refresh();
        return;
      }
      // Tras el alta se va a su ficha: lo siguiente casi siempre es añadirle copias, y
      // un set recién creado no está publicado, así que no aparece en ninguna otra parte.
      const { set: created } = (await response.json()) as { set: ManagedSet };
      router.push(`/backoffice/catalogo/${created.id}`);
    } catch {
      setError("No se ha podido contactar con el servidor.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setIssues([]);
          setError(null);
        }
      }}
    >
      {/* El disparador se construye aquí, con una etiqueta, y no se recibe como
          elemento: `asChild` clona el hijo para colgarle el manejador y la
          referencia, y eso no funciona sobre algo ya renderizado en el servidor. */}
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size="sm">
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={onSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>{editing ? `Editar ${set.name}` : "Nuevo set"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Los cambios se aplican al guardar; la publicación no se toca desde aquí."
                : "Se crea sin publicar. Lo verá el público cuando un administrador lo publique."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="themeId">
              Tema
              <abbr title="obligatorio" className="no-underline">
                *
              </abbr>
            </Label>
            {/* Desplegable y no texto libre: el tema es un `uuid` de la tabla `themes`.
                Nativo y no un listbox de Radix: son veinte opciones planas, y el
                selector del sistema es mejor en móvil y no necesita JavaScript. */}
            <select
              id="themeId"
              name="themeId"
              required
              defaultValue={set?.themeId ?? ""}
              aria-invalid={issueFor("themeId") ? true : undefined}
              aria-describedby={issueFor("themeId") ? "themeId-error" : undefined}
              className="h-9 w-full rounded-md border border-[var(--input)] bg-transparent px-3 text-sm outline-none focus-visible:border-[var(--ring)] focus-visible:ring-[3px] focus-visible:ring-[var(--ring)]"
            >
              <option value="">Elige un tema…</option>
              {themes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>
            {issueFor("themeId") ? (
              <p id="themeId-error" className="text-sm text-[var(--destructive)]">
                {issueFor("themeId")}
              </p>
            ) : null}
          </div>

          <Field
            name="name"
            label="Nombre"
            required
            defaultValue={set?.name}
            issue={issueFor("name")}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              name="pieceCount"
              label="Nº de piezas"
              required
              inputMode="numeric"
              defaultValue={set?.pieceCount}
              issue={issueFor("pieceCount")}
            />
            <Field
              name="setNum"
              label="Referencia"
              defaultValue={set?.setNum}
              hint="La del fabricante, p. ej. 75192-1."
              issue={issueFor("setNum")}
            />
            <Field
              name="year"
              label="Año"
              inputMode="numeric"
              defaultValue={set?.year}
              issue={issueFor("year")}
            />
            <Field
              name="recommendedAge"
              label="Edad recomendada"
              defaultValue={set?.recommendedAge}
              issue={issueFor("recommendedAge")}
            />
            <Field
              name="difficulty"
              label="Dificultad"
              defaultValue={set?.difficulty}
              issue={issueFor("difficulty")}
            />
            <Field
              name="referenceValue"
              label="Valor de referencia (€)"
              inputMode="decimal"
              defaultValue={set?.referenceValue}
              hint="Hace falta para poder publicarlo."
              issue={issueFor("referenceValue")}
            />
          </div>

          <Field
            name="boxPhotoUrl"
            label="Foto de la caja (URL)"
            type="url"
            defaultValue={set?.boxPhotoUrl}
            issue={issueFor("boxPhotoUrl")}
          />

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="restricted"
              defaultChecked={set?.restricted}
              className="mt-0.5"
            />
            <span>
              Set restringido — solo para suscriptores con la antigüedad mínima que fije
              la configuración.
            </span>
          </label>

          {error ? (
            <p role="alert" className="text-sm text-[var(--destructive)]">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending}>
              {pending ? "Guardando…" : editing ? "Guardar cambios" : "Crear set"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
