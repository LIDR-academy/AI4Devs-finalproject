import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import { describe, expect, it } from 'vitest'
import { HttpError } from '@/services/http/apiClient'
import { es } from '@/i18n/locales/es'
import { useCollaboratorCatalogErrorMapper } from '@/composables/useCollaboratorCatalogErrorMapper'

function mountMapper() {
  let mapper!: ReturnType<typeof useCollaboratorCatalogErrorMapper>
  const app = createApp({
    setup() {
      mapper = useCollaboratorCatalogErrorMapper()
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

describe('useCollaboratorCatalogErrorMapper', () => {
  it('expone mensajes i18n para errores HttpError', () => {
    const { toMessage } = mountMapper()

    const message = toMessage(
      new HttpError(400, { title: 'Bad Request', status: 400, detail: 'Rango de fechas inválido' }),
    )

    expect(message).toBe('Rango de fechas inválido')
  })
})
