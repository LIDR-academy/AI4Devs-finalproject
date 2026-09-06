import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireSurfacePage } from "@/http/auth-context";
import { prismaAuditRepository } from "@/repositories/audit.repository.prisma";
import { prismaSetRepository } from "@/repositories/set.repository.prisma";
import { browseManagedCatalog, listThemeOptions } from "@/use-cases/catalog/manage-sets";

import { SetFormDialog } from "./set-form-dialog";

export const metadata = { title: "Catálogo" };

/**
 * Filtro de publicación. El defecto es **todos, incluidos los no publicados**: es la
 * razón de que esta pantalla exista, porque un set recién creado nace sin publicar y
 * el catálogo público lo devuelve como 404 (`wireframes.md` §6.1).
 */
const FILTERS = [
  { value: "todos", label: "Todos", published: null },
  { value: "publicados", label: "Publicados", published: true },
  { value: "borradores", label: "Sin publicar", published: false },
] as const;

function filterFor(value: string | undefined) {
  return FILTERS.find((filter) => filter.value === value) ?? FILTERS[0];
}

/** Conserva el filtro al paginar: cambiar de página no puede reiniciar la búsqueda. */
function hrefFor(params: { search: string; estado: string; page: number }) {
  const query = new URLSearchParams();
  if (params.search) query.set("q", params.search);
  if (params.estado !== "todos") query.set("estado", params.estado);
  if (params.page > 1) query.set("p", String(params.page));
  const suffix = query.toString();
  return suffix ? `/backoffice/catalogo?${suffix}` : "/backoffice/catalogo";
}

/**
 * Catálogo e inventario del back-office — la lista (W4, `wireframes.md` §6.1).
 *
 * Server Component leyendo el repositorio: **no hay `GET /api/sets`** y no hace falta
 * escribirlo. La API pública se amplía cuando la pida un consumidor externo, no para
 * alimentar una pantalla nuestra (§2.1).
 */
export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string; p?: string }>;
}) {
  const { user } = await requireSurfacePage("backoffice");
  const actor = { id: user.id, role: user.role };
  const params = await searchParams;

  const search = params.q?.trim() ?? "";
  const filter = filterFor(params.estado);
  const deps = { repository: prismaSetRepository, audit: prismaAuditRepository };

  // En secuencia y no en paralelo: cada consulta simultánea ocupa una conexión del
  // pool, y con un pooler gestionado delante el pico de un render se multiplica por
  // las instancias vivas. Encadenadas, el render entero cabe en una conexión; el
  // precio es un viaje de ida y vuelta más, que en una pantalla de back-office no se
  // nota. Los recuentos de la lista ya van en un solo lote (`listManaged`).
  const catalog = await browseManagedCatalog(deps, {
    actor,
    search,
    published: filter.published,
    page: Number(params.p ?? 1),
  });
  const themes = await listThemeOptions(deps, actor);

  const filtered = search !== "" || filter.published !== null;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catálogo</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {catalog.totalSets} set(s) · {catalog.totalCopies} copia(s)
            {filtered ? " con este filtro" : ""}
          </p>
        </div>
        <SetFormDialog themes={themes} triggerLabel="+ Nuevo set" />
      </div>

      {/* Formulario `GET`: el filtro vive en la URL, así que es enlazable, recargable y
          funciona sin JavaScript. */}
      <form action="/backoffice/catalogo" className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-60 flex-1 flex-col gap-1.5">
          <label htmlFor="q" className="text-sm font-medium">
            Buscar
          </label>
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={search}
            placeholder="Nombre o referencia"
            className="h-9 rounded-md border border-[var(--input)] bg-transparent px-3 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="estado" className="text-sm font-medium">
            Publicación
          </label>
          <select
            id="estado"
            name="estado"
            defaultValue={filter.value}
            className="h-9 rounded-md border border-[var(--input)] bg-transparent px-3 text-sm"
          >
            {FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      {catalog.items.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">
          {filtered ? (
            <>
              Ningún set coincide con este filtro.{" "}
              <Link href="/backoffice/catalogo" className="underline">
                Quitar el filtro
              </Link>
            </>
          ) : (
            "Todavía no hay ningún set. Crea el primero con «+ Nuevo set»."
          )}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] text-sm">
            <caption className="sr-only">
              Sets del catálogo con su tema, sus copias y si están publicados.
            </caption>
            <thead className="text-left text-[var(--muted-foreground)]">
              <tr>
                <th scope="col" className="py-2 font-medium">
                  Set
                </th>
                <th scope="col" className="py-2 font-medium">
                  Ref.
                </th>
                <th scope="col" className="py-2 font-medium">
                  Tema
                </th>
                <th scope="col" className="py-2 font-medium">
                  Copias
                </th>
                <th scope="col" className="py-2 font-medium">
                  Publicación
                </th>
              </tr>
            </thead>
            <tbody>
              {catalog.items.map((set) => (
                <tr key={set.id} className="border-t">
                  <td className="py-2 pr-4">
                    <Link href={`/backoffice/catalogo/${set.id}`} className="hover:underline">
                      {set.name}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 text-[var(--muted-foreground)]">
                    {set.setNum ?? "—"}
                  </td>
                  <td className="py-2 pr-4 text-[var(--muted-foreground)]">{set.themeName}</td>
                  <td className="py-2 pr-4">
                    <span className="flex flex-wrap items-center gap-2">
                      {set.availableCopies} de {set.totalCopies} libre(s)
                      {/* El caso que de verdad se cuela: publicado y sin ninguna copia
                          sale en el catálogo público y no se puede alquilar nunca. */}
                      {set.published && set.totalCopies === 0 ? (
                        <Badge tone="warning">Sin copias</Badge>
                      ) : null}
                    </span>
                  </td>
                  <td className="py-2">
                    <Badge tone={set.published ? "success" : "neutral"}>
                      {set.published ? "Publicado" : "Sin publicar"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {catalog.pageCount > 1 ? (
        <nav aria-label="Paginación del catálogo" className="flex items-center gap-4 text-sm">
          {catalog.page > 1 ? (
            <Link
              href={hrefFor({ search, estado: filter.value, page: catalog.page - 1 })}
              className="hover:underline"
            >
              ‹ Anterior
            </Link>
          ) : null}
          <span className="text-[var(--muted-foreground)]">
            Página {catalog.page} de {catalog.pageCount}
          </span>
          {catalog.page < catalog.pageCount ? (
            <Link
              href={hrefFor({ search, estado: filter.value, page: catalog.page + 1 })}
              className="hover:underline"
            >
              Siguiente ›
            </Link>
          ) : null}
        </nav>
      ) : null}
    </section>
  );
}
