import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <section className="flex flex-col items-start gap-6">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight text-balance">
          Alquila sets de LEGO. Construye. Devuelve. Repite.
        </h1>
        <p className="max-w-prose text-lg text-[var(--muted-foreground)]">
          Una biblioteca por suscripción: elige tu plan, reserva sets y disfruta
          sin acumular cajas. Cuando terminas, los devuelves y eliges otros.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild size="lg">
          <Link href="/registro">Empezar ahora</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/catalogo">Ver catálogo</Link>
        </Button>
      </div>
    </section>
  );
}
