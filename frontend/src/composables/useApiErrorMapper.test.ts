import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import { describe, expect, it } from 'vitest'
import { HttpError, NetworkError } from '@/services/http/apiClient'
import { es } from '@/i18n/locales/es'
import { useApiErrorMapper } from '@/composables/useApiErrorMapper'

function mountMapper() {
  let mapper!: ReturnType<typeof useApiErrorMapper>
  const app = createApp({
    setup() {
      mapper = useApiErrorMapper()
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
  return mapper
}

describe('useApiErrorMapper', () => {
  it('NetworkError usa mensaje i18n de red', () => {
    const { toMessage } = mountMapper()
    expect(toMessage(new NetworkError())).toBe(es.treeForm.messages.networkError)
  })

  it('HttpError 401 usa mensaje i18n de no autorizado', () => {
    const { toMessage } = mountMapper()
    expect(toMessage(new HttpError(401, { title: 'Unauthorized', status: 401 }))).toBe(
      es.treeForm.messages.unauthorized,
    )
  })

  it('HttpError 400 expone detail del Problem si existe', () => {
    const { toMessage } = mountMapper()
    expect(
      toMessage(
        new HttpError(400, {
          title: 'Bad Request',
          status: 400,
          detail: 'speciesId es obligatorio',
        }),
      ),
    ).toBe('speciesId es obligatorio')
  })

  it('HttpError 403 usa detail o mensaje i18n de permisos', () => {
    const { toMessage } = mountMapper()
    expect(toMessage(new HttpError(403, { title: 'Forbidden', status: 403 }))).toBe(
      es.treeForm.messages.forbidden,
    )
  })

  it('HttpError 5xx usa detail o mensaje genérico con código', () => {
    const { toMessage } = mountMapper()
    expect(toMessage(new HttpError(503, { title: 'Unavailable', status: 503 }))).toBe(
      es.treeForm.messages.serviceError.replace('{status}', '503'),
    )
  })

  it('error desconocido usa mensaje i18n inesperado', () => {
    const { toMessage } = mountMapper()
    expect(toMessage(new Error('boom'))).toBe(es.treeForm.messages.unexpectedError)
  })
})
