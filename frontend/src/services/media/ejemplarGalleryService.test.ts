import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteEjemplarPhoto, fetchEjemplarPhotoGallery } from '@/services/media/ejemplarGalleryService'
import { apiFetch } from '@/services/http/apiClient'

vi.mock('@/services/http/apiClient', () => ({
  apiFetch: vi.fn(),
}))

const apiFetchMock = vi.mocked(apiFetch)

describe('ejemplarGalleryService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetchEjemplarPhotoGallery llama GET de galería', async () => {
    apiFetchMock.mockResolvedValue([])

    await fetchEjemplarPhotoGallery(42)

    expect(apiFetchMock).toHaveBeenCalledWith('/api/media/ejemplares/42/photos', {
      signal: undefined,
    })
  })

  it('deleteEjemplarPhoto envía DELETE', async () => {
    apiFetchMock.mockResolvedValue(undefined)

    await deleteEjemplarPhoto(7)

    expect(apiFetchMock).toHaveBeenCalledWith('/api/media/photos/7', {
      method: 'DELETE',
      signal: undefined,
    })
  })
})
