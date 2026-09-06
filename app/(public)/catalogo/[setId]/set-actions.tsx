"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

/**
 * Las tres acciones de la ficha de set (`wireframes.md` §3.7).
 *
 * Comparten el patrón que ya usa el portal —botón deshabilitado con texto de progreso,
 * y el `detail` del problema RFC 9457 a la vista y sin desaparecer solo— porque un
 * mensaje que se va no se puede releer.
 */
function useAction() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function run(
    url: string,
    options: { method?: "POST" | "DELETE"; onOk?: (body: unknown) => string | null } = {}
  ) {
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch(url, { method: options.method ?? "POST" });
      if (!response.ok) {
        const problem = await response.json().catch(() => null);
        setError(problem?.detail ?? "No se ha podido completar la acción.");
        return;
      }
      const body = response.status === 204 ? null : await response.json().catch(() => null);
      setNotice(options.onOk?.(body) ?? null);
      // Vuelve a pedir la página al servidor: la disponibilidad y la posición en la
      // cola las calcula él, así que reconstruirlas aquí sería una segunda fuente de
      // verdad que se puede desincronizar.
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return { run, pending, error, notice };
}

function Messages({ error, notice }: { error: string | null; notice: string | null }) {
  return (
    <>
      {error ? (
        <p role="alert" className="text-sm text-[var(--destructive)]">
          {error}
        </p>
      ) : null}
      {notice ? <p className="text-sm text-[var(--muted-foreground)]">{notice}</p> : null}
    </>
  );
}

/**
 * Pedir el set.
 *
 * Solo se muestra cuando hay copias libres. La API toleraría pulsarlo sin ellas
 * —devuelve `200 {no_copy_available}`, no un error— pero eso es para la carrera entre
 * pintar la página y pulsar, no una forma de ahorrarse la decisión: un botón que
 * promete un set y contesta con una cola es peor que enseñar la cola de entrada.
 */
export function RequestSetButton({ setId }: { setId: string }) {
  const { run, pending, error, notice } = useAction();
  const router = useRouter();

  return (
    <div className="flex flex-col gap-2">
      <Button
        disabled={pending}
        onClick={() =>
          run(`/api/sets/${setId}/rentals`, {
            onOk: (body) => {
              const outcome = (body as { outcome?: string } | null)?.outcome;
              if (outcome === "no_copy_available") {
                return "Se ha ocupado la última copia mientras decidías. Puedes entrar en la cola.";
              }
              router.push("/portal");
              return null;
            },
          })
        }
      >
        {pending ? "Pidiendo…" : "Pedir este set"}
      </Button>
      <Messages error={error} notice={notice} />
    </div>
  );
}

export function JoinQueueButton({ setId }: { setId: string }) {
  const { run, pending, error, notice } = useAction();
  return (
    <div className="flex flex-col gap-2">
      <Button disabled={pending} onClick={() => run(`/api/sets/${setId}/queue`)}>
        {pending ? "Apuntándote…" : "Apuntarme a la cola"}
      </Button>
      <Messages error={error} notice={notice} />
    </div>
  );
}

/**
 * Salir de una cola.
 *
 * El aviso no es una fórmula de cortesía: el orden va por `effectiveEntryAt`
 * **inmutable** (D11), así que volver a entrar es empezar por el final y no hay forma
 * de deshacerlo. Se dice antes de pulsar, no después.
 */
export function LeaveQueueButton({ entryId }: { entryId: string }) {
  const { run, pending, error, notice } = useAction();
  return (
    <div className="flex flex-col gap-2">
      <Button variant="outline" disabled={pending} onClick={() => run(`/api/queue/${entryId}`, { method: "DELETE" })}>
        {pending ? "Saliendo…" : "Salir de la cola"}
      </Button>
      <Messages error={error} notice={notice} />
    </div>
  );
}
