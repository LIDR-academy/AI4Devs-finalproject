import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { can } from "@/domain/auth/permissions";
import type { AuthenticatedSet, PublicSet } from "@/domain/catalog/public-projection";
import { NotFoundError } from "@/domain/errors";
import type { Eligibility } from "@/domain/subscriptions/eligibility";
import { currentSession } from "@/http/auth-context";
import { copyStatus, queueStatus, simultaneousSets } from "@/lib/status";
import { prismaCatalogRepository } from "@/repositories/catalog.repository.prisma";
import { prismaQueueRepository } from "@/repositories/queue.repository.prisma";
import { prismaSetRepository } from "@/repositories/set.repository.prisma";
import { prismaSettingsRepository } from "@/repositories/settings.repository.prisma";
import { prismaSubscriptionRepository } from "@/repositories/subscription.repository.prisma";
import { viewPublicSet, viewSetAsSubscriber } from "@/use-cases/catalog/browse-public-catalog";
import { checkSetEligibility } from "@/use-cases/subscriptions/check-eligibility";

import { JoinQueueButton, LeaveQueueButton, RequestSetButton } from "./set-actions";

/**
 * Ficha de un set — `wireframes.md` §3 (W1).
 *
 * Es donde **D13 se hace visible**: el mismo recurso con dos proyecciones según quién
 * mira. Lo de arriba —foto, nombre, tema, piezas— es idéntico para todos porque es la
 * proyección pública; todo lo que cambia vive en **una sola caja de decisión**, para
 * que la página mantenga una única pregunta viva: ¿puedo llevármelo, y si no, por qué?
 *
 * Se resuelve en el servidor y no con `fetch` desde el navegador: la página es pública
 * y tiene que servirse renderizada para ser indexable, que es la razón de ser de la
 * proyección pública.
 */

/** Lo que la página necesita saber, ya resuelto: evita repetir el `if (session)`. */
type SetView =
  | { projection: "public"; set: PublicSet }
  | {
      projection: "authenticated";
      set: AuthenticatedSet;
      /** `null` cuando quien mira es back-office: no alquila, así que no hay veredicto. */
      eligibility: Eligibility | null;
      /** Entrada viva de quien mira en la cola de este set, si la tiene. */
      queueEntryId: string | null;
      /** Ventana para confirmar una oferta. Sale de los ajustes, nunca escrita a mano. */
      confirmationWindowHours: number;
      /** Plazas del plan de quien mira; `null` si no tiene suscripción o es back-office. */
      maxSimultaneousSets: number | null;
    };

async function loadView(setId: string): Promise<SetView> {
  const session = await currentSession();
  const catalog = { repository: prismaCatalogRepository };

  if (!session) {
    return { projection: "public", set: await viewPublicSet(catalog, setId) };
  }

  const set = await viewSetAsSubscriber(catalog, { setId, userId: session.user.id });

  // Un operador o un admin pueden mirar el catálogo, pero no alquilan: pedirles un
  // veredicto de elegibilidad devolvería "necesitas una suscripción activa", que es
  // cierto y no es lo que necesitan leer.
  if (!can(session.user.role, "rental.request")) {
    const { offerConfirmationWindowHours } = await prismaSettingsRepository.load();
    return {
      projection: "authenticated",
      set,
      eligibility: null,
      queueEntryId: null,
      confirmationWindowHours: offerConfirmationWindowHours,
      maxSimultaneousSets: null,
    };
  }

  const [{ eligibility }, entry, config, subscription] = await Promise.all([
    checkSetEligibility(
      {
        subscriptions: prismaSubscriptionRepository,
        sets: prismaSetRepository,
        settings: prismaSettingsRepository,
      },
      { userId: session.user.id, setId }
    ),
    prismaQueueRepository.findEntryForUserAndSet(session.user.id, setId),
    prismaSettingsRepository.load(),
    prismaSubscriptionRepository.findCurrentSubscription(session.user.id),
  ]);

  return {
    projection: "authenticated",
    set,
    eligibility,
    queueEntryId: entry?.id ?? null,
    confirmationWindowHours: config.offerConfirmationWindowHours,
    maxSimultaneousSets: subscription?.maxSimultaneousSets ?? null,
  };
}

export async function generateMetadata({ params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params;
  try {
    const set = await viewPublicSet({ repository: prismaCatalogRepository }, setId);
    return { title: `${set.name} · Catálogo` };
  } catch {
    return { title: "Set no encontrado · Catálogo" };
  }
}

export default async function SetDetailPage({
  params,
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = await params;

  let view: SetView;
  try {
    view = await loadView(setId);
  } catch (error) {
    // Un set inexistente y uno sin publicar responden **igual** a propósito:
    // distinguirlos permitiría sondear qué hay en el catálogo antes de publicarlo.
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const { set } = view;

  return (
    <article className="flex flex-col gap-8">
      <nav aria-label="Migas de pan">
        <Link href="/catalogo" className="text-sm hover:underline">
          ‹ Catálogo
        </Link>
      </nav>

      <div className="grid gap-6 sm:grid-cols-[minmax(0,20rem)_1fr]">
        {set.boxPhotoUrl ? (
          // Las fotos vienen del CDN de Rebrickable. `<img>` a propósito: `next/image`
          // exige declarar dominios remotos y una estrategia de optimización que no
          // toca decidir aquí (misma razón que en el listado del catálogo).
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={set.boxPhotoUrl}
            alt={`Caja del set ${set.name}`}
            className="w-full rounded-md border object-contain p-2"
          />
        ) : (
          <div className="aspect-square w-full rounded-md bg-[var(--muted)]" aria-hidden="true" />
        )}

        <div className="flex flex-col gap-6">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{set.name}</h1>
            <p className="text-[var(--muted-foreground)]">
              {set.theme}
              {set.year ? ` · ${set.year}` : ""}
              {set.setNum ? ` · ref. ${set.setNum}` : ""}
            </p>
            <p className="text-[var(--muted-foreground)]">
              {set.pieceCount.toLocaleString("es-ES")} piezas
              {set.recommendedAge ? ` · ${set.recommendedAge}` : ""}
              {set.difficulty ? ` · ${set.difficulty}` : ""}
            </p>
          </header>

          <DecisionBox view={view} />
        </div>
      </div>

      <section className="space-y-2" aria-labelledby="que-incluye">
        <h2 id="que-incluye" className="text-lg font-semibold">
          Qué incluye el alquiler
        </h2>
        <p className="text-[var(--muted-foreground)]">
          Envío y recogida a domicilio, limpieza e inventario de piezas antes de cada
          entrega. Con cualquiera de los planes, sin coste por set.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/planes">Ver los planes</Link>
        </Button>
      </section>
    </article>
  );
}

/**
 * La caja de decisión: lo único que cambia entre visitante, suscriptor y back-office.
 *
 * Lleva `aria-live` porque su contenido se sustituye tras una acción —pedir el set
 * convierte la caja en una cola— y un cambio silencioso deja fuera a quien no lo ve.
 */
function DecisionBox({ view }: { view: SetView }) {
  return (
    <Card asChild>
      <section aria-labelledby="disponibilidad" aria-live="polite">
        <CardHeader>
          <CardTitle asChild>
            <h2 id="disponibilidad" className="text-lg">
              Disponibilidad
            </h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {view.projection === "public" ? <VisitorBox /> : <SubscriberBox view={view} />}
        </CardContent>
      </section>
    </Card>
  );
}

/**
 * Visitante. No dice "disponible" ni "no disponible": **no lo sabe**, porque la
 * proyección pública no trae disponibilidad. Prometer un botón "Alquilar" a quien
 * después descubre que necesita plan le hace perder el tiempo dos veces.
 */
function VisitorBox() {
  return (
    <>
      <p className="font-medium">Entra para ver si está libre</p>
      <p className="text-sm text-[var(--muted-foreground)]">
        La disponibilidad y las colas de reserva solo se ven con una cuenta.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/registro">Crear cuenta</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/login">Entrar</Link>
        </Button>
      </div>
    </>
  );
}

function SubscriberBox({
  view,
}: {
  view: Extract<SetView, { projection: "authenticated" }>;
}) {
  const { set, eligibility, queueEntryId, confirmationWindowHours, maxSimultaneousSets } = view;
  const available = set.availableCopies > 0;

  return (
    <>
      <p className="flex flex-wrap items-center gap-2">
        <StatusBadge
          status={available ? copyStatus("DISPONIBLE", "subscriber") : queueStatus("WAITING", "subscriber")}
        />
        <span className="text-sm">
          {available
            ? `${set.availableCopies} de ${set.totalCopies} ${
                set.totalCopies === 1 ? "copia libre" : "copias libres"
              }`
            : "Ahora mismo no queda ninguna libre."}
        </span>
      </p>

      {!available && set.queueLength > 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">
          {set.queuePosition
            ? `Eres el nº ${set.queuePosition} de ${set.queueLength} en la cola.`
            : `Hay ${set.queueLength} ${set.queueLength === 1 ? "persona" : "personas"} esperando.`}
        </p>
      ) : null}

      {eligibility === null ? (
        <p className="text-sm text-[var(--muted-foreground)]">
          Tu cuenta es de back-office: el alquiler es para cuentas de suscriptor.
        </p>
      ) : (
        <Decision
          setId={set.id}
          eligibility={eligibility}
          available={available}
          queueEntryId={queueEntryId}
          confirmationWindowHours={confirmationWindowHours}
          maxSimultaneousSets={maxSimultaneousSets}
        />
      )}
    </>
  );
}

/**
 * Qué se le ofrece a un suscriptor, y por qué.
 *
 * **No elegible no es lo mismo que no encolable**: `joinQueue` solo exige suscripción
 * activa y antigüedad, no plaza libre. Así que con el plan lleno se ofrecen las dos
 * cosas —el aviso y la cola—, y quien no tiene plan activo no ve la cola porque ahí
 * `joinQueue` también rechazaría.
 */
function Decision({
  setId,
  eligibility,
  available,
  queueEntryId,
  confirmationWindowHours,
  maxSimultaneousSets,
}: {
  setId: string;
  eligibility: Eligibility;
  available: boolean;
  queueEntryId: string | null;
  confirmationWindowHours: number;
  maxSimultaneousSets: number | null;
}) {
  // Ya está en la cola: la única acción posible es salirse, y conviene avisar de que
  // no se puede deshacer antes de pulsar, no después.
  if (queueEntryId) {
    return (
      <>
        <p className="text-sm text-[var(--muted-foreground)]">
          Te avisaremos cuando te toque. Si sales, pierdes el turno: al volver entrarías
          por el final de la cola.
        </p>
        <LeaveQueueButton entryId={queueEntryId} />
      </>
    );
  }

  if (!eligibility.eligible) {
    // La cola sigue abierta cuando lo único que falla es la plaza del plan.
    const canStillQueue = eligibility.reason === "PLAN_LIMIT_REACHED";
    return (
      <>
        {/* Tono `warning` y no `danger`: no poder llevarse un set ahora mismo no es un
            fallo, es la situación de quien pregunta. El rojo hace falta para lo que se
            rompe de verdad. El aviso no necesita `role="status"` propio: la caja
            entera ya es una región `aria-live`. */}
        <div className="rounded-md border border-[var(--tone-warning-border)] bg-[var(--tone-warning)] p-3 text-sm text-[var(--tone-warning-foreground)]">
          {eligibility.detail}
        </div>
        <div className="flex flex-wrap gap-2">
          {eligibility.reason === "NO_ACTIVE_SUBSCRIPTION" ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/portal">Ver mi suscripción</Link>
            </Button>
          ) : null}
          {eligibility.reason === "PLAN_LIMIT_REACHED" ? (
            <Button asChild variant="outline" size="sm">
              <Link href="/portal">Mis sets</Link>
            </Button>
          ) : null}
        </div>
        {canStillQueue ? <JoinQueueButton setId={setId} /> : null}
      </>
    );
  }

  return available ? (
    <>
      <RequestSetButton setId={setId} />
      {maxSimultaneousSets ? (
        // La frase de las plazas sale del vocabulario común y no se escribe a mano:
        // estaba redactada de dos formas distintas en planes, alta y portal.
        <p className="text-sm text-[var(--muted-foreground)]">
          Tu plan permite {simultaneousSets(maxSimultaneousSets)}.
        </p>
      ) : null}
    </>
  ) : (
    <>
      <p className="text-sm text-[var(--muted-foreground)]">
        Te avisamos cuando te toque y tendrás {confirmationWindowHours} h para confirmar.
      </p>
      <JoinQueueButton setId={setId} />
    </>
  );
}
