import { describe, it, expect, vi, afterEach } from 'vitest';
import { analyzeListingStream } from '../../../src/lib/api/streamingClient';
import { ApiError } from '../../../src/lib/api/client';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('cross-module ApiError identity', () => {
  it('streaming client throws the same ApiError class imported from client.ts', async () => {
    const sseBody =
      'event: done\ndata: {"event":"done","payload":{"error":{"code":"PORTAL_BLOCKED","message":"x"}}}\n\n';
    const encoder = new TextEncoder();
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(sseBody));
        controller.close();
      },
    });
    vi.stubGlobal('fetch', vi.fn(async () => new Response(body, { status: 200 })));

    try {
      await analyzeListingStream(
        { url: 'https://www.idealista.com/inmueble/1', sessionId: 's' },
        () => {},
      );
      throw new Error('should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).code).toBe('PORTAL_BLOCKED');
    }
  });
});
