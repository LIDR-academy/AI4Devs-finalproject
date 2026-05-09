import { describe, expect, it, vi } from 'vitest'
import { fetchPublicTreeDetail } from '@/services/catalog/catalogService'

const apiFetchMock = vi.hoisted(() => vi.fn())

vi.mock('@/services/http/apiClient', () => ({
  apiFetch: apiFetchMock,
}))

describe('catalogService', () => {
  it('fetches public tree detail by id', async () => {
    apiFetchMock.mockResolvedValueOnce({ treeId: 42 })

    await fetchPublicTreeDetail(42)

    expect(apiFetchMock).toHaveBeenCalledWith('/api/catalog/public/trees/42', {
      signal: undefined,
    })
  })
})
