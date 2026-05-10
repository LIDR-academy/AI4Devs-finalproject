import { createApp, nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpError, NetworkError } from '@/services/http/apiClient'
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

  it('400 con Problem.detail muestra el detalle del servidor', async () => {
    vi.mocked(registerPublicSubscriptionByEmail).mockRejectedValue(
      new HttpError(400, {
        title: 'Petición incorrecta',
        status: 400,
        detail: 'El correo no tiene un formato válido.',
      }),
    )
    const form = mountForm()
    form.email.value = 'mal@'
    await form.submit()
    await nextTick()
    expect(form.errorMessage.value).toBe('El correo no tiene un formato válido.')
  })

  it('400 sin detail usa copy i18n de solicitud incorrecta', async () => {
    vi.mocked(registerPublicSubscriptionByEmail).mockRejectedValue(
      new HttpError(400, { title: 'Bad Request', status: 400 }),
    )
    const form = mountForm()
    form.email.value = 'x@y.com'
    await form.submit()
    await nextTick()
    expect(form.errorMessage.value).toBe(es.subscriptionNew.errors.badRequest)
  })

  it('409 sin palabras clave muestra el detail del Problem', async () => {
    vi.mocked(registerPublicSubscriptionByEmail).mockRejectedValue(
      new HttpError(409, {
        title: 'Conflicto',
        status: 409,
        detail: 'Límite de suscripciones alcanzado para esta operación.',
      }),
    )
    const form = mountForm()
    form.email.value = 'edge@example.com'
    await form.submit()
    await nextTick()
    expect(form.errorMessage.value).toBe('Límite de suscripciones alcanzado para esta operación.')
  })

  it('409 con detail vacío o solo espacios usa mensaje genérico de conflicto', async () => {
    vi.mocked(registerPublicSubscriptionByEmail).mockRejectedValue(
      new HttpError(409, { title: 'Conflicto', status: 409, detail: '   ' }),
    )
    const form = mountForm()
    form.email.value = 'u@example.com'
    await form.submit()
    await nextTick()
    expect(form.errorMessage.value).toBe(es.subscriptionNew.errors.conflictGeneric)
  })

  it('5xx HttpError muestra mensaje de servicio con código', async () => {
    vi.mocked(registerPublicSubscriptionByEmail).mockRejectedValue(
      new HttpError(503, { title: 'Servicio no disponible', status: 503 }),
    )
    const form = mountForm()
    form.email.value = 'down@example.com'
    await form.submit()
    await nextTick()
    expect(form.errorMessage.value).toBe(
      es.subscriptionNew.errors.serviceError.replace('{status}', '503'),
    )
  })

  it('NetworkError muestra mensaje de red', async () => {
    vi.mocked(registerPublicSubscriptionByEmail).mockRejectedValue(new NetworkError())
    const form = mountForm()
    form.email.value = 'net@example.com'
    await form.submit()
    await nextTick()
    expect(form.errorMessage.value).toBe(es.subscriptionNew.errors.network)
  })

  it('error no HTTP muestra mensaje inesperado', async () => {
    vi.mocked(registerPublicSubscriptionByEmail).mockRejectedValue(new Error('boom'))
    const form = mountForm()
    form.email.value = 'err@example.com'
    await form.submit()
    await nextTick()
    expect(form.errorMessage.value).toBe(es.subscriptionNew.errors.unexpected)
  })

  it('resetForm limpia correo y estados', async () => {
    vi.mocked(registerPublicSubscriptionByEmail).mockResolvedValue({ email: 'z@z.com' })
    const form = mountForm()
    form.email.value = 'z@z.com'
    await form.submit()
    await nextTick()
    expect(form.successEmail.value).toBe('z@z.com')
    form.resetForm()
    expect(form.email.value).toBe('')
    expect(form.successEmail.value).toBeNull()
    expect(form.errorMessage.value).toBeNull()
  })
})
