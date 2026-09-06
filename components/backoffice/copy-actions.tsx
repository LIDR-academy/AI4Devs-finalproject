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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Qué se puede hacer con una copia según el estado en que esté (PRD §15.5). */
const ACTIONS: Record<string, Array<{ to: string; label: string }>> = {
  INTAKE: [{ to: "DISPONIBLE", label: "Catalogar" }],
  EN_DEVOLUCION: [{ to: "EN_INSPECCION", label: "Recepcionar" }],
  EN_INSPECCION: [
    { to: "EN_HIGIENIZACION", label: "Inspección OK" },
    { to: "INCOMPLETA", label: "Faltan piezas" },
    { to: "BAJA", label: "Dar de baja" },
  ],
  EN_HIGIENIZACION: [{ to: "DISPONIBLE", label: "Higienizada" }],
  INCOMPLETA: [
    { to: "EN_HIGIENIZACION", label: "Piezas repuestas" },
    { to: "BAJA", label: "Dar de baja" },
  ],
  ALQUILADA: [{ to: "BAJA", label: "Dar de baja" }],
};

/**
 * Acciones de ciclo de vida de una copia, compartidas por la **cola de trabajo** y la
 * **ficha de catálogo** (`wireframes.md` §6.2). Son la misma decisión vista desde dos
 * preguntas —"¿qué hago ahora?" y "¿qué pasa con este set?"—, y duplicar el
 * componente duplicaría el sitio donde olvidar una transición.
 *
 * `subject` nombra a qué copia se refiere cada botón. No es adorno: cuatro botones
 * "Catalogar" seguidos son indistinguibles al tabular, y el nombre accesible es lo
 * único que los separa (§6.5).
 *
 * El servidor decide qué puede hacer cada rol; aquí solo se muestra. Un operador ve
 * el botón de baja y recibe un 403 si lo pulsa, que es preferible a esconder acciones
 * y dejarle sin saber por qué no están (`ux-flows.md`).
 */
export function CopyActions({
  copyId,
  state,
  subject,
}: {
  copyId: string;
  state: string;
  subject: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retireOpen, setRetireOpen] = useState(false);
  const [reason, setReason] = useState("");
  const reasonId = useId();
  const errorId = useId();

  /** Lee el `detail` del problema RFC 9457; si no hay cuerpo, un texto de respaldo. */
  async function problemDetail(response: Response): Promise<string> {
    const problem = await response.json().catch(() => null);
    return problem?.detail ?? "No se ha podido completar la acción.";
  }

  async function move(to: string) {
    setPending(to);
    setError(null);
    try {
      const response = await fetch(`/api/copies/${copyId}/transitions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ to, reason: "Acción desde el back-office" }),
      });
      if (!response.ok) {
        setError(await problemDetail(response));
        return;
      }
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  /**
   * La baja va por `/retire` y no por el endpoint genérico de transiciones **porque
   * ese exige el motivo** y el genérico no. Antes este botón mandaba un motivo
   * enlatado, así que una decisión con impacto económico entraba en la auditoría sin
   * causa: el rastro decía quién y cuándo, nunca por qué.
   */
  async function retire(event: React.FormEvent) {
    event.preventDefault();
    setPending("BAJA");
    setError(null);
    try {
      const response = await fetch(`/api/copies/${copyId}/retire`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) {
        setError(await problemDetail(response));
        return;
      }
      setRetireOpen(false);
      setReason("");
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  const actions = ACTIONS[state] ?? [];
  const moves = actions.filter((action) => action.to !== "BAJA");
  const retirable = actions.some((action) => action.to === "BAJA");

  if (actions.length === 0) return <span className="text-[var(--muted-foreground)]">—</span>;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap gap-2">
        {moves.map((action) => (
          <Button
            key={action.to}
            size="sm"
            aria-label={`${action.label}: ${subject}`}
            disabled={pending !== null}
            onClick={() => move(action.to)}
          >
            {pending === action.to ? "…" : action.label}
          </Button>
        ))}

        {retirable ? (
          <Dialog
            open={retireOpen}
            onOpenChange={(open) => {
              setRetireOpen(open);
              // El error de un intento anterior no debe recibir al siguiente.
              if (!open) setError(null);
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" aria-label={`Dar de baja: ${subject}`}>
                Dar de baja
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={retire} className="grid gap-4">
                <DialogHeader>
                  <DialogTitle>Dar de baja: {subject}</DialogTitle>
                  <DialogDescription>
                    La baja es definitiva: la copia sale de circulación y no vuelve. El
                    motivo queda en el registro de auditoría.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-2">
                  <Label htmlFor={reasonId}>Motivo de la baja *</Label>
                  <Input
                    id={reasonId}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    required
                    minLength={3}
                    placeholder="Daño irreparable, pérdida…"
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                  />
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
                  <Button type="submit" variant="destructive" disabled={pending === "BAJA"}>
                    {pending === "BAJA" ? "Dando de baja…" : "Confirmar la baja"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        ) : null}
      </div>

      {/* El error de una transición se queda junto a su fila: es donde se pulsó. */}
      {error && !retireOpen ? (
        <p role="alert" className="text-sm text-[var(--destructive)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
