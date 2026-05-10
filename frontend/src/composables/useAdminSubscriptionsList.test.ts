import { createApp, nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HttpError, NetworkError } from '@/services/http/apiClient'
import { es } from '@/i18n/locales/es'
import { useAdminSubscriptionsList } from '@/composables/useAdminSubscriptionsList'

const fetchMock = vi.hoisted(() => vi.fn())
const patchMock = vi.hoisted(() => vi.fn())

vi.mock('@/services/notifications/adminSubscriptions', () => ({
  fetchAdminSubscriptions: fetchMock,
  patchAdminSubscriptionEstado: patchMock,
}))

function mountList() {
  let api!: ReturnType<typeof useAdminSubscriptionsList>
  const app = createApp({
    setup() {
      api = useAdminSubscriptionsList()
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

describe('useAdminSubscriptionsList', () => {
  beforeEach(() => {
    fetchMock.mockReset()
    patchMock.mockReset()
  })

  it('load rellena items y totales', async () => {
    fetchMock.mockResolvedValueOnce({
      content: [
        {
          subscriptionId: 1,
          email: 'a@b.com',
          estadoSuscripcion: 'ACTIVA',
          altaEn: '2024-01-01T00:00:00Z',
          confirmadoEn: null,
          bajaEn: null,
        },
      ],
      totalElements: 1,
      totalPages: 1,
      page: 0,
      size: 20,
      unpaged: false,
      first: true,
      last: true,
    })
    const list = mountList()
    await list.load()
    await nextTick()
    expect(list.items.value).toHaveLength(1)
    expect(list.totalElements.value).toBe(1)
    expect(list.errorMessage.value).toBe('')
  })

  it('load con NetworkError muestra mensaje de red', async () => {
    fetchMock.mockRejectedValueOnce(new NetworkError())
    const list = mountList()
    await list.load()
    await nextTick()
    expect(list.items.value).toEqual([])
    expect(list.errorMessage.value).toContain('conectar')
  })

  it('load con 403 muestra mensaje de prohibido', async () => {
    fetchMock.mockRejectedValueOnce(new HttpError(403, { title: 'Prohibido', status: 403 }))
    const list = mountList()
    await list.load()
    await nextTick()
    expect(list.errorMessage.value).toContain('permisos')
  })

  it('load reenvía filtro de correo al API', async () => {
    fetchMock.mockResolvedValueOnce({
      content: [],
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: 20,
      unpaged: false,
      first: true,
      last: true,
    })
    const list = mountList()
    list.filterEmail.value = '  test@x.com  '
    await list.load()
    await nextTick()
    expect(fetchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@x.com',
      }),
      undefined,
    )
  })

  it('setEstado tras PATCH correcto recarga listado', async () => {
    fetchMock.mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: 20,
      unpaged: false,
      first: true,
      last: true,
    })
    patchMock.mockResolvedValueOnce({
      subscriptionId: 2,
      email: 'x@y.com',
      estadoSuscripcion: 'CANCELADA',
      altaEn: '2024-01-01T00:00:00Z',
      confirmadoEn: null,
      bajaEn: '2025-01-01T00:00:00Z',
    })
    const list = mountList()
    await list.setEstado(2, 'CANCELADA')
    await nextTick()
    expect(patchMock).toHaveBeenCalledWith(2, 'CANCELADA')
    expect(fetchMock).toHaveBeenCalled()
    expect(list.statusMessage.value.length).toBeGreaterThan(0)
  })

  it('setEstado con 404 muestra mensaje específico', async () => {
    patchMock.mockRejectedValueOnce(new HttpError(404, { title: 'No encontrado', status: 404 }))
    const list = mountList()
    await list.setEstado(99, 'ACTIVA')
    await nextTick()
    expect(list.errorMessage.value.toLowerCase()).toContain('no existe')
  })
})
