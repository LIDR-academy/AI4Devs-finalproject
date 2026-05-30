import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteTreePhoto, fetchTreePhotoGallery } from '@/services/media/treeGalleryService'
import { apiFetch } from '@/services/http/apiClient'

vi.mock('@/services/http/apiClient', () => ({
  apiFetch: vi.fn(),
}))

const apiFetchMock = vi.mocked(apiFetch)

describe('treeGalleryService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetchTreePhotoGallery llama GET de galería', async () => {
    apiFetchMock.mockResolvedValue([])

    await fetchTreePhotoGallery(42)

    expect(apiFetchMock).toHaveBeenCalledWith('/api/media/trees/42/photos', {
      signal: undefined,
    })
  })

  it('deleteTreePhoto envía DELETE', async () => {
    apiFetchMock.mockResolvedValue(undefined)

    await deleteTreePhoto(7)

    expect(apiFetchMock).toHaveBeenCalledWith('/api/media/photos/7', {
      method: 'DELETE',
      signal: undefined,
    })
  })
})
