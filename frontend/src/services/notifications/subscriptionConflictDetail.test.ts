import { describe, expect, it } from 'vitest'
import { classifyPublicSubscriptionConflictDetail } from '@/services/notifications/subscriptionConflictDetail'

describe('classifyPublicSubscriptionConflictDetail', () => {
  it('clasifica mensaje de correo ya activo', () => {
    expect(
      classifyPublicSubscriptionConflictDetail('Este correo electrónico ya está suscrito a las notificaciones.'),
    ).toBe('already_active')
  })

  it('clasifica mensaje de suscripción cancelada', () => {
    expect(
      classifyPublicSubscriptionConflictDetail(
        'Esta suscripción está cancelada. Un administrador puede reactivarla desde la gestión de suscripciones.',
      ),
    ).toBe('cancelled')
  })

  it('devuelve unknown si no coincide', () => {
    expect(classifyPublicSubscriptionConflictDetail('Otro mensaje')).toBe('unknown')
    expect(classifyPublicSubscriptionConflictDetail(undefined)).toBe('unknown')
  })
})
