import type { CopyState } from "@/domain/copy/lifecycle";
import type {
  AssignCopyOutcome,
  ConditionReportInput,
  ConditionReportSummary,
  RentalRepository,
  RentalSummary,
} from "@/repositories/rental.repository";

import type { FakeCopyRepository } from "./copy-repository";

/**
 * Doble en memoria del puerto `RentalRepository`, acoplado a `FakeCopyRepository` para
 * que el estado de la copia y el del alquiler evolucionen juntos, igual que hace la
 * transacción real.
 */
export class FakeRentalRepository implements RentalRepository {
  readonly rentals: RentalSummary[] = [];
  readonly reports: ConditionReportSummary[] = [];
  readonly incidents: Array<{ id: string; rentalId: string; type: string; reportedById: string }> = [];
  readonly shipments: Array<{ rentalId: string; direction: string; status: string }> = [];
  address: Record<string, unknown> | null = { line1: "Calle Falsa 123", city: "Sevilla" };
  private sequence = 0;

  constructor(private readonly copies: FakeCopyRepository) {
    // Igual que la transacción real: el alquiler se sincroniza dentro del propio
    // cambio de estado de la copia, no como un paso aparte que se pueda olvidar.
    copies.onTransition = (copyId, state, at) => this.syncWithCopyState(copyId, state, at);
  }

  async findById(rentalId: string) {
    const rental = this.rentals.find((r) => r.id === rentalId);
    if (!rental) return null;
    // El estado de la copia manda: es de donde se deriva el del alquiler.
    const copy = await this.copies.findById(rental.copyId);
    return copy ? { ...rental, copyState: copy.state } : rental;
  }

  async findLatestByCopy(copyId: string) {
    const rental = [...this.rentals].reverse().find((r) => r.copyId === copyId);
    if (!rental) return null;
    const copy = await this.copies.findById(copyId);
    return copy ? { ...rental, copyState: copy.state } : rental;
  }

  async listForUser(userId: string, options: { activeOnly?: boolean } = {}) {
    return this.rentals.filter(
      (r) => r.userId === userId && (!options.activeOnly || r.status !== "COMPLETED")
    );
  }

  async assignAvailableCopy(input: {
    setId: string;
    userId: string;
    subscriptionId: string | null;
    type: "SUBSCRIPTION" | "ONE_OFF";
    price: string | null;
    at: Date;
  }): Promise<AssignCopyOutcome> {
    const available = (await this.copies.listBySet(input.setId)).find(
      (copy) => copy.state === "DISPONIBLE"
    );
    if (!available) return { outcome: "no_copy_available" };

    await this.copies.transition({
      copyId: available.id,
      toState: "ALQUILADA",
      actorId: input.userId,
      reason: "Asignación",
      at: input.at,
    });

    const rental: RentalSummary = {
      id: `rental-${++this.sequence}`,
      copyId: available.id,
      setId: input.setId,
      setName: "Set de prueba",
      userId: input.userId,
      type: input.type,
      status: "ACTIVE",
      copyState: "ALQUILADA",
      price: input.price,
      startedAt: input.at,
      returnInitiatedAt: null,
      receivedAt: null,
      completedAt: null,
    };
    this.rentals.push(rental);
    return { outcome: "assigned", rental };
  }

  async recordConditionReport(input: ConditionReportInput) {
    const report: ConditionReportSummary = {
      id: `report-${this.reports.length + 1}`,
      rentalId: input.rentalId,
      kind: input.kind,
      result: input.result,
      operatorId: input.operatorId,
      createdAt: input.at,
      checklist: input.checklist,
      notes: input.notes,
    };
    this.reports.push(report);
    return report;
  }

  async findConditionReports(rentalId: string) {
    return this.reports.filter((report) => report.rentalId === rentalId);
  }

  async openIncident(input: {
    rentalId: string;
    reportedById: string;
    type: string;
  }) {
    const incident = {
      id: `incident-${this.incidents.length + 1}`,
      rentalId: input.rentalId,
      type: input.type,
      reportedById: input.reportedById,
    };
    this.incidents.push(incident);
    return { id: incident.id };
  }

  async hasOpenIncidentOfType(rentalId: string, type: "DELIVERY_DISCREPANCY") {
    return this.incidents.some((i) => i.rentalId === rentalId && i.type === type);
  }

  async recordShipment(input: { rentalId: string; direction: "OUTBOUND" | "RETURN"; status: string }) {
    this.shipments.push(input);
    return { id: `shipment-${this.shipments.length}` };
  }

  async findDefaultAddress() {
    return this.address;
  }

  /** Aplica al alquiler el mismo cambio que haría la transacción real. */
  syncWithCopyState(copyId: string, state: CopyState, at: Date) {
    const rental = this.rentals.find((r) => r.copyId === copyId && r.status !== "COMPLETED");
    if (!rental) return;
    if (state === "EN_DEVOLUCION") Object.assign(rental, { status: "RETURN_INITIATED", returnInitiatedAt: at });
    if (state === "EN_INSPECCION") Object.assign(rental, { status: "IN_INSPECTION", receivedAt: at });
    if (state === "DISPONIBLE" || state === "BAJA") {
      Object.assign(rental, { status: "COMPLETED", completedAt: at });
    }
  }
}
