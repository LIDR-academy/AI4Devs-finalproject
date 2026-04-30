import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch, apiFetchBlob, HttpError } from '@/services/http/apiClient'

vi.mock('@/services/auth/oidc', () => ({
  authService: {
    getUser: vi.fn(async () => null),
    getAccessToken: vi.fn(() => null),
    signinSilent: vi.fn(async () => null),
    login: vi.fn(async () => {}),
  },
}))

describe('apiFetch', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('throws HttpError with parsed Problem Details for non-2xx JSON response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          type: 'https://mtl/errors/validation',
          title: 'Validation failed',
          status: 400,
          detail: 'provinceId is required',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    const promise = apiFetch('/api/catalog/trees', { method: 'POST', body: JSON.stringify({}) })

    await expect(promise).rejects.toBeInstanceOf(HttpError)
    await expect(promise).rejects.toMatchObject({
      status: 400,
      problem: expect.objectContaining({
        detail: 'provinceId is required',
        title: 'Validation failed',
      }),
    })
  })

  it('propagates AbortError when fetch is aborted', async () => {
    const abortError = new DOMException('The operation was aborted.', 'AbortError')
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(abortError)

    const promise = apiFetch('/api/catalog/species', {
      signal: new AbortController().signal,
    })

    await expect(promise).rejects.toBe(abortError)
  })
})

describe('apiFetchBlob', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('devuelve null ante 404', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 404 }))

    await expect(apiFetchBlob('/api/media/public/trees/1/primary-photo')).resolves.toBeNull()
  })

  it('devuelve Blob ante 200', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { 'Content-Type': 'image/jpeg' },
      }),
    )

    const blob = await apiFetchBlob('/api/media/public/trees/1/primary-photo')

    expect(blob).not.toBeNull()
    expect(blob!.size).toBe(3)
  })
})
