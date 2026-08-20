import type { CopyState } from "@/domain/copy/lifecycle";
import type { ConditionChecklist } from "@/domain/rentals/condition-checklist";

/** Puerto de alquileres y devoluciones (capability `rentals-returns`). */

export interface RentalSummary {
  id: string;
  copyId: string;
  setId: string;
  setName: string;
  userId: string;
  type: "SUBSCRIPTION" | "ONE_OFF";
  status: "ACTIVE" | "RETURN_INITIATED" | "IN_INSPECTION" | "COMPLETED";
  copyState: CopyState;
  price: string | null;
  startedAt: Date;
  returnInitiatedAt: Date | null;
  receivedAt: Date | null;
  completedAt: Date | null;
}

export type AssignCopyOutcome =
  | { outcome: "assigned"; rental: RentalSummary }
  /** No quedaban copias libres: al suscriptor se le ofrece la cola. */
  | { outcome: "no_copy_available" };

export interface ConditionReportInput {
  rentalId: string;
  copyId: string;
  operatorId: string;
  kind: "DELIVERY" | "INSPECTION";
  result: "OK" | "INCOMPLETE" | "DAMAGED";
  /** Catálogo cerrado (`domain/rentals/condition-checklist.ts`); `null` si no se registró. */
  checklist: ConditionChecklist | null;
  at: Date;
}

export interface ConditionReportSummary {
  id: string;
  rentalId: string | null;
  kind: "DELIVERY" | "INSPECTION";
  result: "OK" | "INCOMPLETE" | "DAMAGED";
  operatorId: string;
  createdAt: Date;
}

export interface RentalRepository {
  findById(rentalId: string): Promise<RentalSummary | null>;

  listForUser(userId: string, options?: { activeOnly?: boolean }): Promise<readonly RentalSummary[]>;

  /**
   * Alquiler más reciente de una copia, esté abierto o recién cerrado. Es lo que
   * permite saber **a quién avisar** tras una transición: cuando la copia vuelve a
   * `DISPONIBLE` el alquiler ya está completado, así que buscar solo los activos
   * dejaría sin aviso justo al evento que más le interesa al suscriptor.
   */
  findLatestByCopy(copyId: string): Promise<RentalSummary | null>;

  /**
   * Asigna **una** copia disponible del Set y abre el alquiler, todo en una
   * transacción y con compare-and-swap sobre el estado de la copia (D12).
   *
   * Si dos suscriptores compiten por la última copia, el perdedor no recibe un error:
   * se reintenta con otra copia libre, y solo cuando no queda ninguna se responde
   * `no_copy_available`. Fallar por una carrera que el sistema puede resolver solo
   * sería trasladar al usuario un problema nuestro.
   */
  assignAvailableCopy(input: {
    setId: string;
    userId: string;
    subscriptionId: string | null;
    type: "SUBSCRIPTION" | "ONE_OFF";
    price: string | null;
    shippingAddress: Record<string, unknown>;
    at: Date;
  }): Promise<AssignCopyOutcome>;

  /** Registro de condición (entrega o inspección) con su operador e instante. */
  recordConditionReport(input: ConditionReportInput): Promise<ConditionReportSummary>;

  findConditionReports(rentalId: string): Promise<readonly ConditionReportSummary[]>;

  /** Incidencia abierta desde el alquiler (discrepancia en la entrega, daño, pérdida). */
  openIncident(input: {
    copyId: string;
    rentalId: string;
    reportedById: string;
    type: "DELIVERY_DISCREPANCY" | "INCOMPLETE" | "DAMAGE" | "LOSS";
    notes: string | null;
    at: Date;
  }): Promise<{ id: string }>;

  hasOpenIncidentOfType(rentalId: string, type: "DELIVERY_DISCREPANCY"): Promise<boolean>;

  /** Movimiento logístico simulado (PRD §5): el operador lo marca a mano. */
  recordShipment(input: {
    rentalId: string;
    direction: "OUTBOUND" | "RETURN";
    status: string;
    markedByOperatorId: string | null;
    at: Date;
  }): Promise<{ id: string }>;

  /** Dirección de envío por defecto del usuario, para el snapshot del alquiler. */
  findDefaultAddress(userId: string): Promise<Record<string, unknown> | null>;
}
