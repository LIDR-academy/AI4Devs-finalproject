"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

/**
 * Marca un aviso como leído.
 *
 * `subject` va al nombre accesible porque en una lista de diez avisos hay diez botones
 * idénticos, y "Marcar como leído" a secas no dice cuál se está pulsando.
 */
export function MarkReadButton({
  notificationId,
  subject,
}: {
  notificationId: string;
  subject: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function markRead() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
      });
      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        setError(problem?.detail ?? "No se ha podido marcar como leído.");
        return;
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        aria-label={`Marcar como leído: ${subject}`}
        onClick={markRead}
      >
        {pending ? "…" : "Marcar como leído"}
      </Button>
      {error ? (
        <p role="alert" className="text-sm text-[var(--destructive)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Marca de una vez todos los avisos sin leer.
 *
 * Solo aparece cuando hay algo que marcar: un botón que no puede cambiar nada es ruido
 * en una pantalla que ya tiene un botón por fila.
 *
 * Dice **cuántos** hay en la etiqueta, y no solo "marcar todos", porque la lista está
 * paginada a 50 y el servidor marca **todos** los que haya: sin el número, alguien con
 * sesenta avisos no sabría si pulsar afecta a lo que ve o a lo que no.
 */
export function MarkAllReadButton({ unread }: { unread: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (unread === 0) return null;

  async function markAllRead() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/notifications/read", { method: "POST" });
      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        setError(problem?.detail ?? "No se han podido marcar como leídos.");
        return;
      }
      router.refresh();
    } catch {
      setError("No se ha podido contactar con el servidor.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button size="sm" variant="outline" disabled={pending} onClick={markAllRead}>
        {pending ? "Marcando…" : `Marcar los ${unread} como leídos`}
      </Button>
      {error ? (
        <p role="alert" className="text-sm text-[var(--destructive)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
