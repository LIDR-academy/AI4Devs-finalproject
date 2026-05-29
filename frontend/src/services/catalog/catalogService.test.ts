import { describe, expect, it, vi } from 'vitest'
import { fetchPublicEjemplarDetail } from '@/services/catalog/catalogService'

const apiFetchMock = vi.hoisted(() => vi.fn())

vi.mock('@/services/http/apiClient', () => ({
  apiFetch: apiFetchMock,
}))

describe('catalogService', () => {
  it('fetches public ejemplar detail by id', async () => {
    apiFetchMock.mockResolvedValueOnce({ ejemplarId: 42 })

    await fetchPublicEjemplarDetail(42)

    expect(apiFetchMock).toHaveBeenCalledWith('/api/catalog/public/ejemplares/42', {
      signal: undefined,
    })
  })
})
