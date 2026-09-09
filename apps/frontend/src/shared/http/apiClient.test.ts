import { describe, it, expect, vi, afterEach } from 'vitest';
import { apiRequest, ApiError, setTokenProvider } from './apiClient.js';
import { AuthService } from '../../features/auth/services/auth.service.js';

describe('apiClient — cliente HTTP compartido', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
    setTokenProvider(null);
  });

  it('adjunta el header Authorization Bearer cuando hay una sesión guardada', async () => {
    AuthService.saveSession('token-real-123', { id: 'usr-1', name: 'Ana', role: 'ADMIN' });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: 'ok' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await apiRequest('/kitchen/remanentes');

    const [, requestInit] = fetchMock.mock.calls[0];
    expect(requestInit.headers.Authorization).toBe('Bearer token-real-123');
  });

  it('permite usar un tokenProvider inyectado desacoplado', async () => {
    setTokenProvider(() => 'custom-injected-token');
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    vi.stubGlobal('fetch', fetchMock);

    await apiRequest('/stock/insumos');

    const [, requestInit] = fetchMock.mock.calls[0];
    expect(requestInit.headers.Authorization).toBe('Bearer custom-injected-token');
  });

  it('reintenta automáticamente ante errores transitorios 503 usando backoff', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({ message: 'Service Unavailable' }) })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ success: true }) });

    vi.stubGlobal('fetch', fetchMock);

    const res = await apiRequest<{ success: boolean }>('/kitchen/remanentes', { retries: 2, retryDelayMs: 10 });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(res).toEqual({ success: true });
  });

  it('no reintenta si el error no es transitorio (ej: 400 Bad Request)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Bad Request' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiRequest('/stock/extraction', { retries: 3, retryDelayMs: 10 })).rejects.toThrow('Bad Request');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('soporta la cancelación via AbortSignal y la respeta inmediatamente', async () => {
    const controller = new AbortController();
    controller.abort();

    const fetchMock = vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(apiRequest('/reports/waste', { signal: controller.signal, retries: 2 })).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('no adjunta Authorization si no hay sesión guardada (ej. antes de hacer login)', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    vi.stubGlobal('fetch', fetchMock);

    await apiRequest('/auth/login-pin');

    const [, requestInit] = fetchMock.mock.calls[0];
    expect(requestInit.headers.Authorization).toBeUndefined();
  });

  it('lanza ApiError con el status y mensaje reales cuando la respuesta no es 2xx (nunca lo trata como éxito)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ message: 'El remanente ya fue descartado.' }),
    }));

    await expect(apiRequest('/kitchen/remanentes/rem-1/discard', { method: 'POST' }))
      .rejects.toMatchObject({ status: 409, message: 'El remanente ya fue descartado.' });
  });

  it('propaga un fallo de red tal cual (no lo convierte en éxito silencioso)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network request failed')));

    await expect(apiRequest('/stock/extraction', { method: 'POST', body: {} }))
      .rejects.toThrow('Network request failed');
  });

  it('serializa el body como JSON y usa el método HTTP indicado', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 201, json: async () => ({ id: '1' }) });
    vi.stubGlobal('fetch', fetchMock);

    await apiRequest('/stock/extraction', { method: 'POST', body: { insumoId: 'ins-1', quantity: '2.000' } });

    const [url, requestInit] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/stock/extraction');
    expect(requestInit.method).toBe('POST');
    expect(JSON.parse(requestInit.body)).toEqual({ insumoId: 'ins-1', quantity: '2.000' });
  });

  it('devuelve undefined en respuestas 204 sin intentar parsear JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 204, json: async () => { throw new Error('no debería llamarse'); } }));

    const result = await apiRequest('/kitchen/remanentes/rem-1/discard', { method: 'POST' });

    expect(result).toBeUndefined();
  });

  it('ApiError es instancia de Error y expone status/body para que el llamador decida cómo reaccionar', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: 'unauthorized' }),
    }));

    try {
      await apiRequest('/reports/waste');
      expect.unreachable('debía lanzar');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err).toBeInstanceOf(Error);
      expect((err as ApiError).status).toBe(401);
    }
  });
});
