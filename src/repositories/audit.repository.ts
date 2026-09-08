import type { AuditEntry } from "@/domain/audit/actions";

/**
 * Puerto de la auditoría genérica (`AuditLog`).
 *
 * Los casos de uso que ejecutan acciones administrativas reciben este puerto como
 * dependencia y registran su entrada; las transiciones de copia no pasan por aquí
 * (tienen su propia tabla, D10).
 */
export interface AuditRepository {
  record(entry: AuditEntry): Promise<void>;

  /**
   * Entradas más recientes de una entidad, de la más nueva a la más vieja. Sostiene
   * la lectura de historial del back-office (tareas 8.2/8.3).
   */
  findByEntity(input: {
    entityType: AuditEntry["entityType"];
    entityId: string;
    limit?: number;
  }): Promise<ReadonlyArray<AuditEntry & { id: string }>>;
}
