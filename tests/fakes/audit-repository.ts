import type { AuditEntry } from "@/domain/audit/actions";
import type { AuditRepository } from "@/repositories/audit.repository";

/** Doble en memoria del puerto de auditoría. */
export class FakeAuditRepository implements AuditRepository {
  readonly entries: Array<AuditEntry & { id: string }> = [];
  private sequence = 0;

  async record(entry: AuditEntry) {
    this.entries.push({ id: `audit-${++this.sequence}`, ...entry });
  }

  async findByEntity({
    entityType,
    entityId,
    limit = 50,
  }: {
    entityType: AuditEntry["entityType"];
    entityId: string;
    limit?: number;
  }) {
    return this.entries
      .filter((e) => e.entityType === entityType && e.entityId === entityId)
      .sort((a, b) => b.at.getTime() - a.at.getTime())
      .slice(0, limit);
  }
}
