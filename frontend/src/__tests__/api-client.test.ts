import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe('US-000-TASK-08: api-client', () => {
  describe('apiGet', () => {
    it('returns typed data on success', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' }),
      });

      const { apiGet } = await import('../lib/api-client');
      const result = await apiGet<{ status: string }>('/health');
      expect(result.status).toBe('ok');
    });

    it('throws Error on non-2xx response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' }),
      });

      const { apiGet } = await import('../lib/api-client');
      await expect(apiGet('/missing')).rejects.toThrow('Not found');
    });

    it('throws Error with fallback message when body is not JSON', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => { throw new Error('not json'); },
      });

      const { apiGet } = await import('../lib/api-client');
      await expect(apiGet('/broken')).rejects.toThrow();
    });
  });

  describe('apiPost', () => {
    it('sends POST with JSON body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: '123' }),
      });

      const { apiPost } = await import('../lib/api-client');
      const result = await apiPost<{ id: string }>('/orders', { items: [] });
      expect(result.id).toBe('123');
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/orders'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        })
      );
    });
  });
});
