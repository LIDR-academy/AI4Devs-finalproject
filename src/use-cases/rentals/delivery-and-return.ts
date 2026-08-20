import { can } from "@/domain/auth/permissions";
import type { ConditionChecklist } from "@/domain/rentals/condition-checklist";
import type { Role } from "@/domain/auth/roles";
import {
  ForbiddenError,
  InvariantViolationError,
  NotFoundError,
} from "@/domain/errors";
import { canReportDiscrepancy, deliveryConfirmation } from "@/domain/rentals/delivery";
import type { CopyRepository } from "@/repositories/copy.repository";
import type {
  ConditionReportSummary,
  RentalRepository,
  RentalSummary,
} from "@/repositories/rental.repository";
import type { SettingsRepository } from "@/repositories/settings.repository";

import type { Emitter } from "../notifications/notify";

export interface RentalFlowDeps {
  rentals: RentalRepository;
  copies: CopyRepository;
  settings: SettingsRepository;
  emit?: Emitter;
  now?: () => Date;
}

export interface Actor {
  id: string;
  role: Role;
}

/** Carga el alquiler o falla; centraliza el 404 para no repetirlo en cada caso de uso. */
async function loadRental(rentals: RentalRepository, rentalId: string): Promise<RentalSummary> {
  const rental = await rentals.findById(rentalId);
  if (!rental) throw new NotFoundError("El alquiler no existe.");
  return rental;
}

/**
 * Registro de condición previo al envío, por el operador (D8).
 *
 * Se exige que la copia esté ya asignada (`ALQUILADA`): un registro de entrega sobre
 * una copia que nadie se lleva no documenta nada.
 */
export async function recordDeliveryCondition(
  { rentals, settings, now = () => new Date() }: RentalFlowDeps,
  input: {
    rentalId: string;
    actor: Actor;
    result: "OK" | "INCOMPLETE" | "DAMAGED";
    checklist?: ConditionChecklist | null;
  }
): Promise<{ report: ConditionReportSummary; confirmationWindowHours: number }> {
  if (!can(input.actor.role, "copy.advance_lifecycle")) {
    throw new ForbiddenError("Solo el back-office registra el estado de una copia.");
  }

  const rental = await loadRental(rentals, input.rentalId);
  if (rental.copyState !== "ALQUILADA") {
    throw new InvariantViolationError(
      "COPY_STATE_CONFLICT",
      "El registro de entrega se hace sobre una copia ya asignada."
    );
  }

  const at = now();
  const config = await settings.load();

  const report = await rentals.recordConditionReport({
    rentalId: rental.id,
    copyId: rental.copyId,
    operatorId: input.actor.id,
    kind: "DELIVERY",
    result: input.result,
    checklist: input.checklist ?? null,
    at,
  });

  // Envío de salida: logística simulada, el operador lo marca a mano (PRD §5).
  await rentals.recordShipment({
    rentalId: rental.id,
    direction: "OUTBOUND",
    status: "PREPARADO",
    markedByOperatorId: input.actor.id,
    at,
  });

  return { report, confirmationWindowHours: config.offerConfirmationWindowHours };
}

/** Situación de la confirmación de entrega de un alquiler. */
export async function getDeliveryStatus(
  { rentals, settings, now = () => new Date() }: RentalFlowDeps,
  input: { rentalId: string; actor: Actor }
) {
  const rental = await loadRental(rentals, input.rentalId);
  assertOwnRentalOrBackoffice(rental, input.actor);

  const [reports, config, hasDiscrepancy] = await Promise.all([
    rentals.findConditionReports(rental.id),
    settings.load(),
    rentals.hasOpenIncidentOfType(rental.id, "DELIVERY_DISCREPANCY"),
  ]);

  const delivery = reports.find((report) => report.kind === "DELIVERY");
  if (!delivery) return { confirmation: null, deliveryReport: null };

  return {
    deliveryReport: delivery,
    confirmation: deliveryConfirmation({
      reportedAt: delivery.createdAt,
      windowHours: config.offerConfirmationWindowHours,
      hasDiscrepancy,
      now: now(),
    }),
  };
}

/**
 * El suscriptor reporta que lo recibido no coincide con el registro de condición.
 *
 * Genera una incidencia para el back-office y **no se le imputa nada**: el registro de
 * entrega existe precisamente para poder distinguir un daño previo de uno causado
 * durante el alquiler, y ante la duda la carga de la prueba es nuestra.
 */
export async function reportDeliveryDiscrepancy(
  { rentals, settings, emit, now = () => new Date() }: RentalFlowDeps,
  input: { rentalId: string; actor: Actor; notes: string }
): Promise<{ incidentId: string }> {
  const rental = await loadRental(rentals, input.rentalId);
  if (rental.userId !== input.actor.id) {
    throw new ForbiddenError("Solo puedes reportar discrepancias de tus propios alquileres.");
  }

  const [reports, config] = await Promise.all([
    rentals.findConditionReports(rental.id),
    settings.load(),
  ]);
  const delivery = reports.find((report) => report.kind === "DELIVERY");
  if (!delivery) {
    throw new InvariantViolationError(
      "COPY_STATE_CONFLICT",
      "Todavía no hay un registro de entrega que comparar."
    );
  }

  const at = now();
  const alreadyReported = await rentals.hasOpenIncidentOfType(rental.id, "DELIVERY_DISCREPANCY");
  if (alreadyReported) {
    throw new InvariantViolationError(
      "COPY_STATE_CONFLICT",
      "Ya has reportado una discrepancia para esta entrega."
    );
  }

  if (
    !canReportDiscrepancy({
      reportedAt: delivery.createdAt,
      windowHours: config.offerConfirmationWindowHours,
      hasDiscrepancy: false,
      now: at,
    })
  ) {
    throw new InvariantViolationError(
      "OFFER_EXPIRED",
      "La ventana para reportar discrepancias en la entrega ya ha pasado."
    );
  }

  const incident = await rentals.openIncident({
    copyId: rental.copyId,
    rentalId: rental.id,
    reportedById: input.actor.id,
    type: "DELIVERY_DISCREPANCY",
    notes: input.notes,
    at,
  });

  // El back-office tiene que enterarse: la incidencia sin aviso se quedaría esperando
  // a que alguien mirase la lista por casualidad.
  await emit?.({
    type: "delivery.discrepancy",
    copyId: rental.copyId,
    rentalId: rental.id,
    setName: rental.setName,
    notes: input.notes,
  });

  return { incidentId: incident.id };
}

/**
 * El suscriptor inicia la devolución.
 *
 * `ALQUILADA → EN_DEVOLUCION` es una transición **de sistema**: no se ejecuta desde el
 * back-office, la provoca este flujo. El estado del alquiler se sincroniza dentro de
 * la misma transacción que el de la copia.
 */
export async function startReturn(
  { rentals, copies, now = () => new Date() }: RentalFlowDeps,
  input: { rentalId: string; actor: Actor }
): Promise<RentalSummary> {
  const rental = await loadRental(rentals, input.rentalId);
  if (rental.userId !== input.actor.id) {
    throw new ForbiddenError("Solo puedes devolver tus propios alquileres.");
  }

  const at = now();
  const result = await copies.transition({
    copyId: rental.copyId,
    toState: "EN_DEVOLUCION",
    actorId: input.actor.id,
    reason: "El suscriptor inicia la devolución",
    at,
  });

  if (result.outcome !== "transitioned") {
    throw new InvariantViolationError(
      "COPY_STATE_CONFLICT",
      result.outcome === "invalid_transition"
        ? `Este alquiler no está en curso (la copia está en ${result.fromState}).`
        : "El estado de la copia ha cambiado; vuelve a intentarlo."
    );
  }

  // Formulario de recogida: logística simulada (PRD §5).
  await rentals.recordShipment({
    rentalId: rental.id,
    direction: "RETURN",
    status: "RECOGIDA_SOLICITADA",
    markedByOperatorId: null,
    at,
  });

  return loadRental(rentals, rental.id);
}

/** Registro de condición de la inspección, por el operador. */
export async function recordInspection(
  { rentals, now = () => new Date() }: RentalFlowDeps,
  input: {
    rentalId: string;
    actor: Actor;
    result: "OK" | "INCOMPLETE" | "DAMAGED";
    checklist?: ConditionChecklist | null;
  }
): Promise<ConditionReportSummary> {
  if (!can(input.actor.role, "copy.advance_lifecycle")) {
    throw new ForbiddenError("Solo el back-office inspecciona copias.");
  }

  const rental = await loadRental(rentals, input.rentalId);
  if (rental.copyState !== "EN_INSPECCION") {
    throw new InvariantViolationError(
      "COPY_STATE_CONFLICT",
      "La copia no está en inspección."
    );
  }

  return rentals.recordConditionReport({
    rentalId: rental.id,
    copyId: rental.copyId,
    operatorId: input.actor.id,
    kind: "INSPECTION",
    result: input.result,
    checklist: input.checklist ?? null,
    at: now(),
  });
}

function assertOwnRentalOrBackoffice(rental: RentalSummary, actor: Actor): void {
  if (rental.userId === actor.id) return;
  if (can(actor.role, "backoffice.access")) return;
  throw new ForbiddenError("No puedes consultar alquileres de otros usuarios.");
}
