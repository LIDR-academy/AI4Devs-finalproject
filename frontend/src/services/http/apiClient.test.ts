import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch, apiFetchBlob, HttpError, publicApiFetch } from '@/services/http/apiClient'

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

    const promise = apiFetch('/api/catalog/ejemplares', { method: 'POST', body: JSON.stringify({}) })

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

describe('publicApiFetch', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('no llama a authService y no envía Authorization', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ email: 'user@example.com' }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const result = await publicApiFetch('/api/notifications/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ email: 'user@example.com' }),
    })

    expect(result).toEqual({ email: 'user@example.com' })
    expect(fetchSpy).toHaveBeenCalledOnce()
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit]
    const headers = new Headers(init.headers)
    expect(headers.get('Authorization')).toBeNull()
  })

  it('lanza HttpError con Problem en error 4xx/5xx', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          title: 'Conflicto',
          status: 409,
          detail: 'Este correo electrónico ya está suscrito a las notificaciones.',
        }),
        { status: 409, headers: { 'Content-Type': 'application/json' } },
      ),
    )

    const promise = publicApiFetch('/api/notifications/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ email: 'dup@example.com' }),
    })

    await expect(promise).rejects.toMatchObject({
      status: 409,
      problem: expect.objectContaining({
        detail: 'Este correo electrónico ya está suscrito a las notificaciones.',
      }),
    })
  })
})

describe('apiFetchBlob', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('devuelve null ante 404', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 404 }))

    await expect(apiFetchBlob('/api/media/public/ejemplares/1/primary-photo')).resolves.toBeNull()
  })

  it('devuelve Blob ante 200', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(new Uint8Array([1, 2, 3]), {
        status: 200,
        headers: { 'Content-Type': 'image/jpeg' },
      }),
    )

    const blob = await apiFetchBlob('/api/media/public/ejemplares/1/primary-photo')

    expect(blob).not.toBeNull()
    expect(blob!.size).toBe(3)
  })
})
