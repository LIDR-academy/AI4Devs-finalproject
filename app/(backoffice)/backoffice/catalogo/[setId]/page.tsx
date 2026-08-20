import Link from "next/link";
import { notFound } from "next/navigation";

import { CopyActions } from "@/components/backoffice/copy-actions";
import { StatusBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { NotFoundError } from "@/domain/errors";
import { requireSurfacePage } from "@/http/auth-context";
import { copyStatus } from "@/lib/status";
import { prismaAuditRepository } from "@/repositories/audit.repository.prisma";
import { prismaCopyRepository } from "@/repositories/copy.repository.prisma";
import { prismaSetRepository } from "@/repositories/set.repository.prisma";
import { listThemeOptions } from "@/use-cases/catalog/manage-sets";
import { loadSetInventory } from "@/use-cases/copies/manage-copies";

import { SetFormDialog } from "../set-form-dialog";
import { AddCopyButton, PublicationButton } from "../set-controls";

/**
 * El título lleva el nombre del set: con varias fichas abiertas, "Ficha de set" en
 * todas las pestañas no distingue ninguna. El sufijo "· Clickoteca" lo pone el
 * `template` del layout raíz; repetirlo aquí lo duplicaría.
 */
export async function generateMetadata({ params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params;
  const set = await prismaSetRepository.findById(setId);
  return { title: set ? `${set.name} · Catálogo` : "Set no encontrado · Catálogo" };
}

const DATE = new Intl.DateTimeFormat("es-ES", { dateStyle: "short" });
const EUR = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

/**
 * Las copias no tienen código impreso: el `uuid` es lo único que las distingue, y
 * entero no lo lee nadie. Cuatro caracteres bastan para nombrar una fila dentro de un
 * set —son unas pocas— y es lo que hace distinguibles los botones al tabular (§6.5).
 */
function copyCode(copyId: string): string {
  return copyId.slice(0, 4).toUpperCase();
}

/**
 * Catálogo e inventario del back-office — la ficha (W4, `wireframes.md` §6.2).
 *
 * **Un solo sitio para el inventario.** Las acciones de copia son las mismas que en la
 * cola de trabajo y salen del mismo componente: la cola responde a "¿qué hago ahora?"
 * y esta ficha a "¿qué pasa con este set?".
 */
export default async function BackofficeSetPage({
  params,
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = await params;
  const { user } = await requireSurfacePage("backoffice");
  const actor = { id: user.id, role: user.role };

  const inventory = await loadSetInventory(
    { copies: prismaCopyRepository, sets: prismaSetRepository },
    { setId, actor }
  ).catch((error: unknown) => {
    // Un set inexistente es un 404 de página, no una excepción sin gestionar; el resto
    // de errores siguen subiendo.
    if (error instanceof NotFoundError) notFound();
    throw error;
  });

  const themes = await listThemeOptions(
    { repository: prismaSetRepository, audit: prismaAuditRepository },
    actor
  );

  const { set, copies } = inventory;
  const theme = themes.find((option) => option.id === set.themeId);
  const ficha = [
    set.setNum,
    theme?.name,
    set.year?.toString(),
    `${set.pieceCount} piezas`,
    set.recommendedAge,
    set.difficulty,
  ].filter(Boolean);

  return (
    <div className="flex flex-col gap-8">
      <Link href="/backoffice/catalogo" className="text-sm hover:underline">
        ‹ Catálogo
      </Link>

      <section aria-labelledby="datos" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 id="datos" className="text-2xl font-bold tracking-tight">
            {set.name}
          </h1>
          <Badge tone={set.published ? "success" : "neutral"}>
            {set.published ? "Publicado" : "Sin publicar"}
          </Badge>
        </div>

        <p className="text-sm text-[var(--muted-foreground)]">{ficha.join(" · ")}</p>
        <p className="text-sm text-[var(--muted-foreground)]">
          {set.referenceValue
            ? `Valor de referencia ${EUR.format(Number(set.referenceValue))}`
            : "Sin tasar — hace falta un valor de referencia para publicarlo"}
          {set.restricted ? " · Restringido por antigüedad" : ""}
        </p>

        <div className="flex flex-wrap items-start gap-2">
          <SetFormDialog
            themes={themes}
            set={set}
            triggerLabel="Editar"
            triggerVariant="outline"
          />
          <PublicationButton setId={set.id} published={set.published} />
        </div>
      </section>

      <section aria-labelledby="copias" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="copias" className="text-lg font-semibold">
            Copias ({copies.length})
          </h2>
          <AddCopyButton setId={set.id} />
        </div>

        {copies.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Este set no tiene ninguna copia todavía.
            {set.published ? " Publicado sin copias, nadie podrá alquilarlo." : ""}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <caption className="sr-only">
                Copias de {set.name}, con su estado, su fecha de alta y quién la tiene.
              </caption>
              <thead className="text-left text-[var(--muted-foreground)]">
                <tr>
                  <th scope="col" className="py-2 font-medium">
                    Copia
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    Estado
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    Alta
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    Quién la tiene
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {copies.map((copy) => (
                  <tr key={copy.id} className="border-t">
                    <th scope="row" className="py-2 pr-4 text-left font-mono font-normal">
                      {copyCode(copy.id)}
                    </th>
                    <td className="py-2 pr-4">
                      <StatusBadge status={copyStatus(copy.state, "backoffice")} />
                    </td>
                    <td className="py-2 pr-4 text-[var(--muted-foreground)]">
                      {DATE.format(copy.acquiredAt)}
                    </td>
                    <td className="py-2 pr-4 text-[var(--muted-foreground)]">
                      {copy.holderName ?? "—"}
                    </td>
                    <td className="py-2">
                      <CopyActions
                        copyId={copy.id}
                        state={copy.state}
                        subject={`copia ${copyCode(copy.id)}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
