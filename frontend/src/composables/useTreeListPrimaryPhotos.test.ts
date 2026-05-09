import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

const apiFetchBlobMock = vi.hoisted(() => vi.fn())

vi.mock('@/services/http/apiClient', () => ({
  apiFetchBlob: (...args: unknown[]) => apiFetchBlobMock(...args),
  HttpError: Error,
  NetworkError: class extends Error {},
}))

import { useTreeListPrimaryPhotos } from '@/composables/useTreeListPrimaryPhotos'

describe('useTreeListPrimaryPhotos', () => {
  beforeEach(() => {
    apiFetchBlobMock.mockReset()
  })

  it('construye URLs de objeto para ids con respuesta 200', async () => {
    apiFetchBlobMock.mockResolvedValue(new Blob([new Uint8Array([1])], { type: 'image/jpeg' }))

    const { thumbUrls, loadForTreeIds } = useTreeListPrimaryPhotos()
    await loadForTreeIds([10, 20])

    await nextTick()
    expect(apiFetchBlobMock).toHaveBeenCalledTimes(2)
    expect(thumbUrls.value[10]).toMatch(/^blob:/)
    expect(thumbUrls.value[20]).toMatch(/^blob:/)
  })

  it('omite ids sin blob (404)', async () => {
    apiFetchBlobMock.mockResolvedValue(null)

    const { thumbUrls, loadForTreeIds } = useTreeListPrimaryPhotos()
    await loadForTreeIds([7])

    await nextTick()
    expect(thumbUrls.value[7]).toBeUndefined()
  })
})
