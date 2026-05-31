import { createApp, nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { es } from '@/i18n/locales/es'
import { useTreeCreateFlashFromRoute } from '@/composables/useTreeCreateFlashFromRoute'

const routeRef = vi.hoisted(() => ({
  name: 'ejemplares-edit' as string | undefined,
  params: { id: '42' } as Record<string, string>,
  query: {} as Record<string, string | string[]>,
}))

const routerReplace = vi.hoisted(() => vi.fn())

vi.mock('vue-router', () => ({
  useRoute: () => routeRef,
  useRouter: () => ({ replace: routerReplace }),
}))

function mountFlash() {
  let api!: ReturnType<typeof useTreeCreateFlashFromRoute>
  const app = createApp({
    setup() {
      api = useTreeCreateFlashFromRoute()
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

describe('useTreeCreateFlashFromRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    routeRef.name = 'ejemplares-edit'
    routeRef.params = { id: '42' }
    routeRef.query = {}
  })

  it('fromCreate ok muestra éxito y limpia la query', async () => {
    routeRef.query = { fromCreate: 'ok' }
    const flash = mountFlash()

    flash.applyFromRoute()
    await nextTick()

    expect(flash.successMessage.value).toBe(es.treeEdit.messages.createdFromForm)
    expect(flash.warningMessage.value).toBe('')
    expect(routerReplace).toHaveBeenCalledWith({
      name: 'ejemplares-edit',
      params: { id: '42' },
      query: {},
    })
  })

  it('fromCreate okPhotos muestra mensaje con fotos', async () => {
    routeRef.query = { fromCreate: 'okPhotos' }
    const flash = mountFlash()

    flash.applyFromRoute()
    await nextTick()

    expect(flash.successMessage.value).toBe(es.treeEdit.messages.createdFromFormWithPhotos)
  })

  it('fromCreate photosWarning muestra aviso de fotos', async () => {
    routeRef.query = { fromCreate: 'photosWarning' }
    const flash = mountFlash()

    flash.applyFromRoute()
    await nextTick()

    expect(flash.successMessage.value).toBe(es.treeEdit.messages.createdFromForm)
    expect(flash.warningMessage.value).toBe(es.treeEdit.messages.createdFromFormPhotosWarning)
  })
})
