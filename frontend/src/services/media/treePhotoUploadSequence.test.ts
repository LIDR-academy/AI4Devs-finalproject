import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ObjectStorageUploadError,
  putFileToObjectStorageUrl,
  uploadPhotosForTree,
} from '@/services/media/treePhotoUploadSequence'

vi.mock('@/services/http/apiClient', () => ({
  apiFetch: vi.fn(),
  NetworkError: class NetworkError extends Error {
    constructor(message = 'NETWORK_ERROR') {
      super(message)
      this.name = 'NetworkError'
    }
  },
}))

import { apiFetch } from '@/services/http/apiClient'

describe('treePhotoUploadSequence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(globalThis, 'Image').mockImplementation(function MockImage(this: HTMLImageElement) {
      Object.defineProperty(this, 'naturalWidth', { value: 800, configurable: true })
      Object.defineProperty(this, 'naturalHeight', { value: 600, configurable: true })
      queueMicrotask(() => {
        this.onload?.(new Event('load'))
      })
      return this
    } as unknown as typeof Image)
  })

  it('uploadPhotosForTree ejecuta presign, PUT y confirm por fichero', async () => {
    vi.mocked(apiFetch)
      .mockResolvedValueOnce({
        uploadUrl: 'https://minio.test/upload',
        bucket: 'mtl-photos',
        objectKey: 'ejemplar/42/a.jpg',
      })
      .mockResolvedValueOnce({ photoId: 10 })

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }))

    const file = new File(['bytes'], 'a.jpg', { type: 'image/jpeg' })
    await uploadPhotosForTree(42, [file], { startOrden: 1 })

    expect(apiFetch).toHaveBeenNthCalledWith(
      1,
      '/api/media/uploads/presign',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"treeId":42'),
      }),
    )
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://minio.test/upload',
      expect.objectContaining({ method: 'PUT', body: file }),
    )
    expect(apiFetch).toHaveBeenNthCalledWith(
      2,
      '/api/media/photos/confirm',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"order":1'),
      }),
    )
  })

  it('putFileToObjectStorageUrl lanza ObjectStorageUploadError ante HTTP no ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('fail', { status: 503 }))

    await expect(
      putFileToObjectStorageUrl('https://minio.test/upload', new File(['x'], 'a.jpg')),
    ).rejects.toBeInstanceOf(ObjectStorageUploadError)
  })
})
