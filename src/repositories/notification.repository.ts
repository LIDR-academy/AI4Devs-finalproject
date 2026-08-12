/**
 * Puerto de notificaciones. El motor completo dirigido por eventos de dominio es el
 * bloque 7; aquí está solo lo que necesitan los flujos ya implementados.
 */
export interface NotificationRepository {
  create(input: {
    userId: string;
    /** Tipo del catálogo de notificaciones (se cierra como unión en el bloque 7). */
    type: string;
    payload?: Record<string, unknown> | null;
    relatedEntityType?: string | null;
    relatedEntityId?: string | null;
    at: Date;
  }): Promise<{ id: string }>;

  listForUser(
    userId: string,
    options?: { unreadOnly?: boolean; limit?: number }
  ): Promise<
    ReadonlyArray<{
      id: string;
      type: string;
      payload: Record<string, unknown> | null;
      sentAt: Date;
      readAt: Date | null;
    }>
  >;
}
