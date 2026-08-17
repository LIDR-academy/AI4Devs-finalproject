/**
 * Vocabulario de auditoría (PRD §7, spec `accounts-roles` → "Auditoría de acciones").
 *
 * El sistema audita por **dos** vías, deliberadamente separadas (D10):
 *
 *  - `CopyStateTransition` — el ciclo de vida de la copia, que es de primera clase
 *    (D2) y necesita `fromState`/`toState` con nombre propio.
 *  - `AuditLog` (esto) — **el resto** de acciones administrativas: configuración,
 *    planes, gestión de empleados, publicación de catálogo.
 *
 * No se solapan: una baja de copia se registra como transición, no como `AuditLog`.
 *
 * `action` y `entityType` son `String` en la base, pero aquí forman uniones
 * **cerradas**: quien consulte la auditoría dentro de un año necesita que estos
 * valores signifiquen lo mismo que hoy, y una columna de texto libre no lo garantiza.
 */

export const AUDIT_ACTIONS = [
  // Configuración del sistema y planes.
  "settings.updated",
  "plan.updated",
  /** Cambio de plan de un suscriptor sobre su propia suscripción (BASIC ⇄ PREMIUM). */
  "subscription.plan_changed",

  // Catálogo.
  "set.published",
  "set.unpublished",
  "retention_reminder.configured",

  // Cuentas gestionadas por el admin.
  "employee.created",
  "employee.role_changed",
  "user.suspended",
  "user.reactivated",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const AUDIT_ENTITY_TYPES = [
  "SystemSetting",
  "Plan",
  "Set",
  "RetentionReminderConfig",
  "User",
  "Subscription",
] as const;

export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number];

/**
 * Una entrada de auditoría. `actorId` y `at` son **obligatorios**: son literalmente
 * el "quién" y el "cuándo" que exige la spec, así que el tipo impide construir una
 * entrada sin ellos.
 */
export interface AuditEntry {
  actorId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  /**
   * Identificador de la entidad afectada; nulo en acciones sin entidad concreta.
   *
   * Debe ser un **UUID**: la columna lo es, y pasar una clave natural (p. ej. el
   * código de un plan) hace fallar la inserción. Esos identificadores legibles van en
   * `metadata`.
   */
  entityId?: string | null;
  /** Contexto adicional (valores antes/después, motivo…). Nunca datos sensibles. */
  metadata?: Record<string, unknown> | null;
  at: Date;
}
