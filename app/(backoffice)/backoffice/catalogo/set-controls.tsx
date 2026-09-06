"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

/**
 * Mensaje de un problema RFC 9457, prefiriendo el error de campo al texto general:
 * "El set necesita un valor de referencia mayor que cero para publicarse" dice qué
 * hacer; "No se puede publicar el set" solo dice que no.
 */
async function problemMessage(response: Response, fallback: string): Promise<string> {
  const problem = await response.json().catch(() => null);
  return problem?.errors?.[0]?.issue ?? problem?.detail ?? fallback;
}

/**
 * Publicar o retirar del catálogo (`PUT /api/sets/:id/publication`, solo admin).
 *
 * Al operador **se le enseña igual** aunque reciba un 403 al pulsarlo: es la decisión
 * ya tomada en el código y recogida en `ux-flows.md` — explicar por qué no se puede es
 * mejor que hacer desaparecer una acción sin decir nada.
 */
export function PublicationButton({ setId, published }: { setId: string; published: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/sets/${setId}/publication`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ published: !published }),
      });
      if (!response.ok) {
        setError(await problemMessage(response, "No se ha podido cambiar la publicación."));
        return;
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button size="sm" variant="outline" onClick={toggle} disabled={pending}>
        {pending ? "…" : published ? "Retirar del catálogo" : "Publicar"}
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
 * Alta de copia. **No es un formulario**: `addCopy` no recibe ningún campo —crea la
 * copia en `INTAKE` y ya—, así que pedir datos que la API no acepta sería inventarse
 * una pantalla (`wireframes.md` §6.3). La fila nueva aparece con su «Catalogar» al lado.
 */
export function AddCopyButton({ setId }: { setId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function add() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/sets/${setId}/copies`, { method: "POST" });
      if (!response.ok) {
        setError(await problemMessage(response, "No se ha podido añadir la copia."));
        return;
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button size="sm" onClick={add} disabled={pending}>
        {pending ? "Añadiendo…" : "+ Añadir copia"}
      </Button>
      {error ? (
        <p role="alert" className="text-sm text-[var(--destructive)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
