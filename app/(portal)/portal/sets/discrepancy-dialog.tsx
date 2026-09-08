"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";

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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  CONDITION_CHECKLIST_IDS,
  checklistItemLabel,
} from "@/domain/rentals/condition-checklist";

/**
 * Reportar que lo recibido no coincide con el registro de entrega — W3
 * (`wireframes.md` §5.3).
 *
 * **Diálogo y no pantalla**: la acción es corta, tiene un solo campo y el contexto que
 * necesita —qué registramos— cabe dentro.
 *
 * El "no se te imputa nada" va aquí y no en la letra pequeña porque es lo que decide si
 * alguien lo reporta o se calla. Es la política real del dominio: el registro previo
 * existe para poder distinguir un daño anterior de uno causado durante el alquiler, y
 * ante la duda la carga de la prueba es nuestra.
 */
export function DiscrepancyDialog({
  rentalId,
  setName,
  registeredAs,
  registeredAt,
  checklist,
  notes,
}: {
  rentalId: string;
  setName: string;
  /** Etiqueta del resultado del informe, ya traducida ("Correcta", "Incompleta"…). */
  registeredAs: string;
  registeredAt: string;
  checklist: Record<string, boolean> | null;
  notes: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [texto, setTexto] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const campoId = useId();
  const errorId = useId();

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/rentals/${rentalId}/discrepancy`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ notes: texto }),
      });
      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        // El `detail` del dominio es claro y accionable —"la ventana ya ha pasado", "ya
        // has reportado una discrepancia"—, así que se muestra tal cual.
        setError(problem?.errors?.[0]?.issue ?? problem?.detail ?? "No se ha podido enviar el aviso.");
        return;
      }
      setOpen(false);
      setTexto("");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" aria-label={`Algo no coincide: ${setName}`}>
          Algo no coincide
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>¿Qué no coincide?</DialogTitle>
            <DialogDescription>
              Registramos la entrega de {setName} como <strong>{registeredAs}</strong> el{" "}
              {registeredAt}.
            </DialogDescription>
          </DialogHeader>

          {/* Sin decir contra qué se compara, "algo no coincide" no significa nada. */}
          {checklist ? (
            <ul className="flex flex-col gap-1 text-sm text-[var(--muted-foreground)]">
              {/* En el orden del catálogo, no en el del JSON guardado: el informe se lee
                  siempre igual. Al final, lo que trajera un informe antiguo con casillas
                  que ya no existen — son historia y no se reescriben. */}
              {[
                ...CONDITION_CHECKLIST_IDS,
                ...Object.keys(checklist).filter(
                  (id) => !(CONDITION_CHECKLIST_IDS as readonly string[]).includes(id)
                ),
              ]
                .filter((id) => id in checklist)
                .map((id) => (
                  <li key={id}>
                    {checklist[id] ? "· " : "· No: "}
                    {checklistItemLabel(id)}
                  </li>
                ))}
            </ul>
          ) : null}
          {notes ? <p className="text-sm text-[var(--muted-foreground)]">«{notes}»</p> : null}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor={campoId}>Cuéntanos qué has encontrado</Label>
            <Textarea
              id={campoId}
              value={texto}
              onChange={(event) => setTexto(event.target.value)}
              required
              minLength={5}
              maxLength={1000}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
            />
            <p className="text-xs text-[var(--muted-foreground)]">
              Mínimo 5 caracteres. No se te imputa nada: abrimos una incidencia y la
              revisamos nosotros.
            </p>
          </div>

          {error ? (
            <p id={errorId} role="alert" className="text-sm text-[var(--destructive)]">
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
              {pending ? "Enviando…" : "Enviar el aviso"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
