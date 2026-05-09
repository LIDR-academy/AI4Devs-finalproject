/**
 * Clasifica el texto `detail` de un Problem 409 del alta público de suscripción
 * (mensajes actuales de notification-service) para elegir copy i18n en el cliente.
 */
export type PublicSubscriptionConflictKind = 'already_active' | 'cancelled' | 'unknown'

export function classifyPublicSubscriptionConflictDetail(
  detail: string | undefined,
): PublicSubscriptionConflictKind {
  const normalized = (detail ?? '').toLowerCase()
  if (normalized.includes('ya está suscrito') || normalized.includes('ya esta suscrito')) {
    return 'already_active'
  }
  if (normalized.includes('cancelada')) {
    return 'cancelled'
  }
  return 'unknown'
}
