import Link from "next/link";

import { Button } from "@/components/ui/button";
import { currentSession } from "@/http/auth-context";
import { prismaCatalogRepository } from "@/repositories/catalog.repository.prisma";
import { browsePublicCatalog } from "@/use-cases/catalog/browse-public-catalog";

export const metadata = {
  title: "Catálogo · Clickoteca",
};

/**
 * Catálogo público (D13). Accesible **sin sesión**: muestra los atributos de los Sets
 * publicados y ni una palabra sobre disponibilidad o cola. A quien no ha entrado se
 * le invita a hacerlo, que es donde vive esa información.
 */
export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const limit = 24;

  const [{ sets, total }, session] = await Promise.all([
    browsePublicCatalog(
      { repository: prismaCatalogRepository },
      { limit, offset: (page - 1) * limit }
    ),
    currentSession(),
  ]);

  const lastPage = Math.max(1, Math.ceil(total / limit));

  return (
    <section className="flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Catálogo</h1>
        <p className="text-[var(--muted-foreground)]">
          {total} sets disponibles para alquilar con tu suscripción.
        </p>
      </div>

      {!session ? (
        <div className="flex flex-wrap items-center gap-3 rounded-md border p-4 text-sm">
          <p className="text-[var(--muted-foreground)]">
            Inicia sesión para ver la disponibilidad de cada set y entrar en las colas
            de reserva.
          </p>
          <div className="flex gap-2">
            <Button asChild size="sm">
              <Link href="/registro">Crear cuenta</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/login">Entrar</Link>
            </Button>
          </div>
        </div>
      ) : null}

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sets.map((set) => (
          // `relative` + el pseudoelemento del enlace hacen clicable la tarjeta entera
          // sin anidar interactivos: hay **un solo** enlace por tarjeta, con el nombre
          // del set como texto accesible, en vez de tres destinos idénticos seguidos.
          <li
            key={set.id}
            className="relative flex flex-col gap-3 rounded-md border p-4 focus-within:border-[var(--ring)] hover:border-[var(--ring)]"
          >
            {set.boxPhotoUrl ? (
              // Las fotos vienen del CDN de Rebrickable. Se usa `<img>` a propósito:
              // `next/image` necesita declarar dominios remotos y una estrategia de
              // optimización que llega con el diseño de UX (PRD §9).
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={set.boxPhotoUrl}
                alt={`Caja del set ${set.name}`}
                loading="lazy"
                className="h-40 w-full rounded object-contain"
              />
            ) : (
              <div className="h-40 w-full rounded bg-[var(--muted)]" aria-hidden="true" />
            )}
            <div className="space-y-1">
              <h2 className="font-medium leading-tight">
                <Link href={`/catalogo/${set.id}`} className="after:absolute after:inset-0 hover:underline">
                  {set.name}
                </Link>
              </h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                {set.theme}
                {set.year ? ` · ${set.year}` : ""}
              </p>
              <p className="text-sm text-[var(--muted-foreground)]">
                {set.pieceCount.toLocaleString("es-ES")} piezas
                {set.recommendedAge ? ` · ${set.recommendedAge}` : ""}
                {set.difficulty ? ` · ${set.difficulty}` : ""}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {lastPage > 1 ? (
        <nav className="flex items-center gap-3" aria-label="Paginación del catálogo">
          {page > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/catalogo?page=${page - 1}`}>Anterior</Link>
            </Button>
          ) : null}
          <span className="text-sm text-[var(--muted-foreground)]">
            Página {page} de {lastPage}
          </span>
          {page < lastPage ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/catalogo?page=${page + 1}`}>Siguiente</Link>
            </Button>
          ) : null}
        </nav>
      ) : null}
    </section>
  );
}
