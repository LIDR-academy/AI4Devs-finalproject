import type { Role } from "@/domain/auth/roles";
import type { CopyState } from "@/domain/copy/lifecycle";
import { checkEligibility } from "@/domain/subscriptions/eligibility";
import type { CopyRepository } from "@/repositories/copy.repository";
import type { CreatedOffer, QueueRepository } from "@/repositories/queue.repository";
import type { RentalRepository } from "@/repositories/rental.repository";
import type { SettingsRepository } from "@/repositories/settings.repository";

import { transitionCopy, type TransitionCopyResult } from "../copies/transition-copy";
import type { Emitter } from "../notifications/notify";

export interface AdvanceLifecycleDeps {
  repository: CopyRepository;
  queue: QueueRepository;
  settings: SettingsRepository;
  /** Para resolver a quién avisar tras la transición. */
  rentals?: RentalRepository;
  /** Emisor de eventos de dominio; opcional para no acoplar los tests que no lo usan. */
  emit?: Emitter;
  now?: () => Date;
}

export interface AdvanceLifecycleResult extends TransitionCopyResult {
  /** Oferta generada si la copia quedó libre y había alguien esperando. */
  offer: CreatedOffer | null;
}

const HOUR_MS = 60 * 60 * 1000;

/**
 * Avanza una copia por su ciclo de vida y, **si con ello queda libre**, la ofrece al
 * cabeza de cola.
 *
 * Es la opción A1 de D3: se avisa a la cola **después** de que la copia haya superado
 * la inspección y esté lista, no durante. Ofrecer antes obligaría a des-prometer el
 * set si la inspección revelara que está incompleto, y eso se paga en confianza.
 */
export async function advanceCopyLifecycle(
  deps: AdvanceLifecycleDeps,
  input: {
    copyId: string;
    toState: CopyState;
    actor: { id: string; role: Role };
    reason?: string | null;
  }
): Promise<AdvanceLifecycleResult> {
  const result = await transitionCopy(
    { repository: deps.repository, now: deps.now },
    input
  );

  await announceTransition(deps, { copyId: input.copyId, toState: result.toState, reason: input.reason });

  if (result.toState !== "DISPONIBLE") return { ...result, offer: null };

  const copy = await deps.repository.findById(input.copyId);
  const offer = copy ? await offerToHeadOfQueue(deps, { copyId: copy.id, setId: copy.setId }) : null;

  return { ...result, offer };
}

/**
 * Publica el evento de dominio que corresponde al nuevo estado.
 *
 * Se hace **después** de que la transición esté confirmada: un aviso de "devolución
 * recibida" que se enviara antes de recibirla de verdad sería peor que no enviarlo.
 */
async function announceTransition(
  deps: AdvanceLifecycleDeps,
  input: { copyId: string; toState: CopyState; reason?: string | null }
): Promise<void> {
  if (!deps.emit || !deps.rentals) return;

  const rental = await deps.rentals.findLatestByCopy(input.copyId);
  const setName = rental?.setName ?? "el set";

  switch (input.toState) {
    case "EN_INSPECCION":
      if (rental) {
        await deps.emit({
          type: "return.received",
          userId: rental.userId,
          rentalId: rental.id,
          setName,
        });
      }
      return;

    case "DISPONIBLE":
      // Solo si venía de una devolución: una copia recién catalogada no tiene a quién
      // avisar, y el alquiler más reciente ya estará cerrado.
      if (rental?.status === "COMPLETED") {
        await deps.emit({
          type: "return.completed",
          userId: rental.userId,
          rentalId: rental.id,
          setName,
        });
      }
      return;

    case "INCOMPLETA":
      await deps.emit({
        type: "copy.incomplete",
        copyId: input.copyId,
        setName,
        rentalId: rental?.id ?? null,
      });
      return;

    case "BAJA":
      await deps.emit({
        type: "copy.retired",
        copyId: input.copyId,
        setName,
        reason: input.reason ?? null,
      });
      return;

    default:
      return;
  }
}

/**
 * Ofrece la copia al primer elegible de la cola.
 *
 * El recorrido **salta** a quien no puede recibir el set ahora mismo —tope de plan
 * alcanzado, devolución sin terminar, suscripción pausada— sin sacarlo de la cola:
 * conserva su turno para la próxima vez (D5).
 */
export async function offerToHeadOfQueue(
  { queue, settings, emit, now = () => new Date() }: AdvanceLifecycleDeps,
  input: {
    copyId: string;
    setId: string;
    /**
     * Entrada a la que **no** volver a ofrecer en esta ronda. Se usa al caducar una
     * oferta: quien acaba de dejarla pasar vuelve a la cola, y si resultara ser el
     * único que espera se le ofrecería otra vez en el acto, en bucle y vaciando de
     * sentido la penalización. "Pasa al siguiente" significa al siguiente.
     */
    excludeEntryId?: string;
  }
): Promise<CreatedOffer | null> {
  const [entries, config] = await Promise.all([
    queue.findWaitingEntries(input.setId),
    settings.load(),
  ]);
  if (entries.length === 0) return null;

  const at = now();
  const windowExpiresAt = new Date(at.getTime() + config.offerConfirmationWindowHours * HOUR_MS);

  for (const entry of entries) {
    if (entry.entryId === input.excludeEntryId) continue;

    const eligibility = checkEligibility({
      subscription: entry.subscription,
      currentCopyStates: entry.currentCopyStates,
      // La restricción por antigüedad ya se comprobó al encolar; aquí lo que puede
      // haber cambiado es su situación de alquiler.
      set: { restricted: false },
      restrictedSetMinMonths: config.restrictedSetMinMonths,
      now: at,
    });
    if (!eligibility.eligible) continue;

    const offer = await queue.offerCopyTo({
      entryId: entry.entryId,
      copyId: input.copyId,
      userId: entry.userId,
      windowExpiresAt,
      at,
    });
    // `null` significa que otro proceso se llevó la copia mientras recorríamos la
    // cola: no hay nada que ofrecer y tampoco un error que reportar.
    if (!offer) return null;

    await emit?.({
      type: "offer.created",
      userId: offer.userId,
      offerId: offer.offerId,
      setId: input.setId,
      // El nombre viene de la propia entrada de cola: buscarlo a través del alquiler
      // de la copia sería un rodeo que además falla en una copia sin historial.
      setName: entry.setName,
      windowExpiresAt: offer.windowExpiresAt,
    });

    return offer;
  }

  return null;
}
