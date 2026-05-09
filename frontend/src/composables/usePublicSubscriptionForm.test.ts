import { createApp, nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpError } from '@/services/http/apiClient'
import { es } from '@/i18n/locales/es'
import { usePublicSubscriptionForm } from '@/composables/usePublicSubscriptionForm'

const testApi = vi.hoisted(() => ({
  gatewayBaseUrl: 'http://localhost:8080',
}))

vi.mock('@/services/auth/oidc', () => ({
  authService: {
    getUser: vi.fn(async () => null),
    getAccessToken: vi.fn(() => null),
    signinSilent: vi.fn(async () => null),
    login: vi.fn(async () => {}),
  },
}))

vi.mock('@/services/config', () => ({
  appConfig: {
    api: testApi,
    oidc: {
      issuer: 'http://localhost:8180/realms/mtl',
      clientId: 'mtl-spa',
      scope: 'openid profile email',
    },
  },
}))

vi.mock('@/services/notifications/publicSubscription', () => ({
  registerPublicSubscriptionByEmail: vi.fn(),
}))

import { registerPublicSubscriptionByEmail } from '@/services/notifications/publicSubscription'

function mountForm() {
  let api!: ReturnType<typeof usePublicSubscriptionForm>
  const app = createApp({
    setup() {
      api = usePublicSubscriptionForm()
      return () => null
    },
  })
  app.use(
    createI18n({
      legacy: false,
      locale: 'es',
      messages: { es },
    }),
  )
  app.mount(document.createElement('div'))
  return api
}

describe('usePublicSubscriptionForm', () => {
  beforeEach(() => {
    testApi.gatewayBaseUrl = 'http://localhost:8080'
    vi.mocked(registerPublicSubscriptionByEmail).mockReset()
  })

  it('tras 201 guarda el correo confirmado en successEmail', async () => {
    vi.mocked(registerPublicSubscriptionByEmail).mockResolvedValue({ email: 'ok@example.com' })
    const form = mountForm()
    form.email.value = '  ok@example.com  '
    await form.submit()
    await nextTick()
    expect(form.successEmail.value).toBe('ok@example.com')
    expect(form.errorMessage.value).toBeNull()
  })

  it('409 con detalle de ya suscrito muestra mensaje específico', async () => {
    vi.mocked(registerPublicSubscriptionByEmail).mockRejectedValue(
      new HttpError(409, {
        title: 'Conflicto',
        status: 409,
        detail: 'Este correo electrónico ya está suscrito a las notificaciones.',
      }),
    )
    const form = mountForm()
    form.email.value = 'dup@example.com'
    await form.submit()
    await nextTick()
    expect(form.errorMessage.value).toBe(es.subscriptionNew.errors.conflictAlreadyActive)
  })

  it('409 con detalle de cancelada muestra mensaje específico', async () => {
    vi.mocked(registerPublicSubscriptionByEmail).mockRejectedValue(
      new HttpError(409, {
        title: 'Conflicto',
        status: 409,
        detail:
          'Esta suscripción está cancelada. Un administrador puede reactivarla desde la gestión de suscripciones.',
      }),
    )
    const form = mountForm()
    form.email.value = 'old@example.com'
    await form.submit()
    await nextTick()
    expect(form.errorMessage.value).toBe(es.subscriptionNew.errors.conflictCancelled)
  })

  it('con base del gateway vacía igual llama al servicio (ruta relativa /api y proxy en dev)', async () => {
    testApi.gatewayBaseUrl = ''
    vi.mocked(registerPublicSubscriptionByEmail).mockResolvedValue({ email: 'a@b.com' })
    const form = mountForm()
    form.email.value = 'a@b.com'
    await form.submit()
    await nextTick()
    expect(registerPublicSubscriptionByEmail).toHaveBeenCalledWith('a@b.com')
    expect(form.successEmail.value).toBe('a@b.com')
  })

  it('correo vacío muestra validación local', async () => {
    const form = mountForm()
    form.email.value = '   '
    await form.submit()
    expect(registerPublicSubscriptionByEmail).not.toHaveBeenCalled()
    expect(form.errorMessage.value).toBe(es.subscriptionNew.errors.emailRequired)
  })
})
