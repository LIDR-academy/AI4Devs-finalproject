import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { apiFetchMock } = vi.hoisted(() => ({
  apiFetchMock: vi.fn(),
}))

vi.mock('@/services/http/apiClient', () => ({
  apiFetch: (...args: unknown[]) => apiFetchMock(...args),
  NetworkError: class NetworkError extends Error {
    constructor(message = 'NETWORK_ERROR') {
      super(message)
      this.name = 'NetworkError'
    }
  },
}))

import { NetworkError } from '@/services/http/apiClient'
import {
  ObjectStorageUploadError,
  putFileToObjectStorageUrl,
  uploadPhotosForTreeAfterCreate,
} from '@/services/media/treePhotoUploadSequence'

describe('putFileToObjectStorageUrl', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('envía PUT con el fichero y Content-Type del archivo', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }))
    const file = new File(['ab'], 'x.png', { type: 'image/png' })

    await putFileToObjectStorageUrl('https://bucket/object', file)

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://bucket/object',
      expect.objectContaining({
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': 'image/png' },
      }),
    )
  })

  it('usa application/octet-stream si el fichero no declara tipo MIME', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }))
    const file = new File(['x'], 'bin.dat')

    await putFileToObjectStorageUrl('https://bucket/object', file)

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://bucket/object',
      expect.objectContaining({
        headers: { 'Content-Type': 'application/octet-stream' },
      }),
    )
  })

  it('lanza ObjectStorageUploadError si la respuesta no es ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 503 }))
    const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' })

    await expect(putFileToObjectStorageUrl('https://u', file)).rejects.toSatisfy(
      (err: unknown) => err instanceof ObjectStorageUploadError && err.status === 503,
    )
  })

  it('propaga NetworkError si fetch falla en red', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))
    const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' })

    await expect(putFileToObjectStorageUrl('https://u', file)).rejects.toBeInstanceOf(NetworkError)
  })
})

describe('uploadPhotosForTreeAfterCreate', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    apiFetchMock.mockReset()
    class FakeImage {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      naturalWidth = 0
      naturalHeight = 0
      set src(_value: string) {
        queueMicrotask(() => this.onload?.())
      }
    }
    vi.stubGlobal('Image', FakeImage as unknown as typeof Image)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('no llama a la API si no hay ficheros', async () => {
    await uploadPhotosForTreeAfterCreate(42, [])
    expect(apiFetchMock).not.toHaveBeenCalled()
  })

  it('ejecuta presign → PUT → confirm por cada fichero en orden', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 200 }))

    const file1 = new File(['a'], 'one.jpg', { type: 'image/jpeg' })
    const file2 = new File(['bb'], 'two.png', { type: 'image/png' })

    apiFetchMock
      .mockResolvedValueOnce({
        uploadUrl: 'https://minio/one',
        bucket: 'b1',
        objectKey: 'k1',
        expiresAt: '2026-01-01T00:00:00Z',
      })
      .mockResolvedValueOnce({ id: 10 })
      .mockResolvedValueOnce({
        uploadUrl: 'https://minio/two',
        bucket: 'b2',
        objectKey: 'k2',
        expiresAt: '2026-01-01T00:00:00Z',
      })
      .mockResolvedValueOnce({ id: 11 })

    await uploadPhotosForTreeAfterCreate(7, [file1, file2])

    expect(apiFetchMock).toHaveBeenCalledTimes(4)

    const presign1 = JSON.parse(String(apiFetchMock.mock.calls[0][1]?.body))
    expect(presign1).toMatchObject({
      arbolId: 7,
      nombreFicheroOriginal: 'one.jpg',
      tipoMime: 'image/jpeg',
      tamanoBytes: 1,
    })
    expect(apiFetchMock.mock.calls[0][0]).toBe('/api/media/uploads/presign')

    expect(globalThis.fetch).toHaveBeenNthCalledWith(
      1,
      'https://minio/one',
      expect.objectContaining({ method: 'PUT', body: file1 }),
    )

    const confirm1 = JSON.parse(String(apiFetchMock.mock.calls[1][1]?.body))
    expect(confirm1).toMatchObject({
      arbolId: 7,
      bucket: 'b1',
      objectKey: 'k1',
      orden: 0,
      esPrincipal: false,
      checksumSha256: null,
    })
    expect(apiFetchMock.mock.calls[1][0]).toBe('/api/media/photos/confirm')

    const presign2 = JSON.parse(String(apiFetchMock.mock.calls[2][1]?.body))
    expect(presign2).toMatchObject({ nombreFicheroOriginal: 'two.png', tamanoBytes: 2 })

    const confirm2 = JSON.parse(String(apiFetchMock.mock.calls[3][1]?.body))
    expect(confirm2).toMatchObject({ orden: 1, bucket: 'b2', objectKey: 'k2' })
  })
})
