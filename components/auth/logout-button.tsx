"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

/** Cierra la sesión en el servidor y devuelve al inicio. */
export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/");
      // Sin refresh, las páginas ya renderizadas seguirían en la caché del router
      // mostrando al usuario como si siguiera dentro.
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={pending}>
      {pending ? "Saliendo…" : "Salir"}
    </Button>
  );
}
