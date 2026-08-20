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
