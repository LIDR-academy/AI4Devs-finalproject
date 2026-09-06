/** Puerto de los recordatorios de retención (D7). */

export interface RetentionConfig {
  setId: string;
  enabled: boolean;
  cadenceDays: number;
  activatedByAdminId: string | null;
}

/** Un alquiler en curso de un Set con recordatorios activados. */
export interface RetentionCandidate {
  rentalId: string;
  userId: string;
  setId: string;
  setName: string;
  cadenceDays: number;
  /** Cuánta gente espera ese Set. Sin cola no se recuerda nada. */
  queueLength: number;
  /** Último recordatorio enviado, o `null` si aún no se envió ninguno. */
  lastReminderAt: Date | null;
  rentalStartedAt: Date;
}

export interface RetentionRepository {
  findConfig(setId: string): Promise<RetentionConfig | null>;

  upsertConfig(input: {
    setId: string;
    enabled: boolean;
    cadenceDays: number;
    adminId: string;
  }): Promise<RetentionConfig>;

  /**
   * Alquileres en curso de Sets con recordatorios **activados**. El filtro grueso va
   * en la consulta; la decisión de si toca recordar hoy es del dominio.
   */
  findRetentionCandidates(): Promise<readonly RetentionCandidate[]>;

  recordReminderSent(input: {
    userId: string;
    rentalId: string;
    setId: string;
    setName: string;
    at: Date;
  }): Promise<void>;
}
