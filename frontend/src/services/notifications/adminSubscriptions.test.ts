import { describe, expect, it, vi } from 'vitest'
import {
  fetchAdminSubscriptions,
  patchAdminSubscriptionEstado,
  type SubscriptionAdminPage,
} from '@/services/notifications/adminSubscriptions'

const apiFetchMock = vi.hoisted(() => vi.fn())

vi.mock('@/services/http/apiClient', () => ({
  apiFetch: apiFetchMock,
}))

describe('adminSubscriptions', () => {
  it('fetchAdminSubscriptions usa page y size por defecto y omite filtro si no se pasa', async () => {
    const page: SubscriptionAdminPage = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: 20,
      unpaged: false,
      first: true,
      last: true,
    }
    apiFetchMock.mockResolvedValueOnce(page)

    const result = await fetchAdminSubscriptions()

    expect(result).toEqual(page)
    expect(apiFetchMock).toHaveBeenCalledWith('/api/notifications/subscriptions', {
      query: {
        page: 0,
        size: 20,
        estadoSuscripcion: undefined,
        email: undefined,
      },
      signal: undefined,
    })
  })

  it('fetchAdminSubscriptions reenvía estadoSuscripcion cuando viene informado', async () => {
    apiFetchMock.mockResolvedValueOnce({
      content: [],
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: 10,
      unpaged: false,
      first: true,
      last: true,
    })

    await fetchAdminSubscriptions({ page: 1, size: 10, estadoSuscripcion: 'CANCELADA' }, new AbortController().signal)

    expect(apiFetchMock).toHaveBeenCalledWith('/api/notifications/subscriptions', {
      query: {
        page: 1,
        size: 10,
        estadoSuscripcion: 'CANCELADA',
        email: undefined,
      },
      signal: expect.any(AbortSignal),
    })
  })

  it('fetchAdminSubscriptions reenvía email recortado cuando viene informado', async () => {
    apiFetchMock.mockResolvedValueOnce({
      content: [],
      totalElements: 0,
      totalPages: 0,
      page: 0,
      size: 20,
      unpaged: false,
      first: true,
      last: true,
    })

    await fetchAdminSubscriptions({ email: '  user@  ' })

    expect(apiFetchMock).toHaveBeenCalledWith('/api/notifications/subscriptions', {
      query: {
        page: 0,
        size: 20,
        estadoSuscripcion: undefined,
        email: 'user@',
      },
      signal: undefined,
    })
  })

  it('patchAdminSubscriptionEstado envía PATCH con cuerpo esperado', async () => {
    const item = {
      subscriptionId: 3,
      email: 'a@b.com',
      estadoSuscripcion: 'ACTIVA' as const,
      altaEn: '2024-01-01T00:00:00Z',
      confirmadoEn: null,
      bajaEn: null,
    }
    apiFetchMock.mockResolvedValueOnce(item)

    const out = await patchAdminSubscriptionEstado(3, 'ACTIVA')

    expect(out).toEqual(item)
    expect(apiFetchMock).toHaveBeenCalledWith('/api/notifications/subscriptions/3', {
      method: 'PATCH',
      body: JSON.stringify({ estadoSuscripcion: 'ACTIVA' }),
      signal: undefined,
    })
  })
})
