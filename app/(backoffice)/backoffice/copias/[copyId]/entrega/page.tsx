import Link from "next/link";
import { notFound } from "next/navigation";

import { can } from "@/domain/auth/permissions";
import { requireSurfacePage } from "@/http/auth-context";
import { prismaBackofficeRepository } from "@/repositories/backoffice.repository.prisma";
import { prismaRentalRepository } from "@/repositories/rental.repository.prisma";
import { prismaSettingsRepository } from "@/repositories/settings.repository.prisma";

import { DeliveryForm } from "./delivery-form";

export const metadata = { title: "Registro de entrega" };

/** Mismo criterio que el inventario: cuatro caracteres bastan para nombrar una copia. */
function copyCode(copyId: string): string {
  return copyId.slice(0, 4).toUpperCase();
}

/**
 * Registro de condición previo al envío — W2 (`wireframes.md` §4.2).
 *
 * Es la base documental de cualquier reclamación posterior: sin un registro "antes", una
 * pieza que falta al volver no se puede atribuir a nadie.
 *
 * **Pantalla propia y no un diálogo**: hay una lista de comprobación que se rellena con
 * el set delante, y un diálogo obligaría a mantener el contexto de la página de detrás
 * para nada.
 *
 * La URL va por **copia** —es lo que el operador tiene en la mano y lo que enseña la cola
 * de trabajo—; el alquiler se resuelve aquí, porque la API es por alquiler.
 */
export default async function RegistroDeEntregaPage({
  params,
}: {
  params: Promise<{ copyId: string }>;
}) {
  const { copyId } = await params;
  const { user } = await requireSurfacePage("backoffice");

  // El permiso es el mismo que exige el endpoint. Sin él la pantalla es un 404 y no un
  // formulario que se rellena entero para que el servidor lo rechace al guardar.
  if (!can(user.role, "copy.advance_lifecycle")) notFound();

  const [rental, settings] = await Promise.all([
    prismaRentalRepository.findLatestByCopy(copyId),
    prismaSettingsRepository.load(),
  ]);

  // Sin alquiler vivo no hay entrega que registrar: la pantalla no existe (§4.5).
  if (!rental || rental.status === "COMPLETED" || rental.copyState !== "ALQUILADA") {
    notFound();
  }

  const [reports, subscriber] = await Promise.all([
    prismaRentalRepository.findConditionReports(rental.id),
    // Para quién es: sale de la ficha de cliente del back-office, que es donde vive el
    // nombre. `RentalSummary` trae el `userId`, no la persona.
    prismaBackofficeRepository.findCustomer(rental.userId),
  ]);
  const yaRegistrada = reports.some((report) => report.kind === "DELIVERY");

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Link href="/backoffice" className="text-sm hover:underline">
        ‹ Cola de trabajo
      </Link>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Registro de entrega</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          {rental.setName} · copia #{copyCode(rental.copyId)}
          {subscriber ? ` · para ${subscriber.fullName}` : ""}
        </p>
      </div>

      {yaRegistrada ? (
        // La cola de trabajo ya excluye lo preparado, así que aquí solo se llega por un
        // enlace viejo o por dos operadores a la vez. Se dice y se ofrece la salida.
        <p className="text-sm text-[var(--muted-foreground)]">
          Esta entrega ya está registrada y su envío está preparado.{" "}
          <Link href="/backoffice" className="underline">
            Volver a la cola de trabajo
          </Link>
        </p>
      ) : (
        <DeliveryForm
          rentalId={rental.id}
          subscriberName={subscriber?.fullName ?? "el suscriptor"}
          windowHours={settings.offerConfirmationWindowHours}
        />
      )}
    </div>
  );
}
