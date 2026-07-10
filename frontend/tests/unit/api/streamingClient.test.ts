import { describe, it, expect, vi, afterEach } from 'vitest';
import { analyzeListingStream, ApiError } from '../../../src/lib/api/streamingClient';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.doUnmock('../../../src/lib/stores/session');
});

describe('analyzeListingStream', () => {
  it('parses SSE events and resolves with the done payload', async () => {
    const sseBody = [
      'event: fetching_html\ndata: {"event":"fetching_html","payload":{}}\n\n',
      'event: resolving_location\ndata: {"event":"resolving_location","payload":{}}\n\n',
      'event: analyzing\ndata: {"event":"analyzing","payload":{}}\n\n',
      'event: cross_referencing_cadastro\ndata: {"event":"cross_referencing_cadastro","payload":{}}\n\n',
      'event: done\ndata: {"event":"done","payload":{"listing":{"id":"L1"},"processSummary":{}}}\n\n',
    ].join('');

    const encoder = new TextEncoder();
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(sseBody));
        controller.close();
      },
    });

    const fakeResponse = new Response(body, { status: 200 });
    const fetchSpy = vi.fn(async () => fakeResponse);
    vi.stubGlobal('fetch', fetchSpy);

    const events: string[] = [];
    const result = await analyzeListingStream(
      { url: 'https://example.com', sessionId: 'sess-1' },
      (event) => events.push(event),
    );

    expect(events).toEqual([
      'fetching_html',
      'resolving_location',
      'analyzing',
      'cross_referencing_cadastro',
    ]);
    expect(result).toEqual({ listing: { id: 'L1' }, processSummary: {} });
  });

  it('throws an ApiError with code PORTAL_BLOCKED on HTTP 503', async () => {
    const errorBody = JSON.stringify({
      error: 'PORTAL_BLOCKED',
      message: 'Portal idealista.com está bloqueando peticiones.',
    });
    const errorFetchSpy = vi.fn(async () =>
      new Response(errorBody, {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', errorFetchSpy);

    await expect(
      analyzeListingStream(
        { url: 'https://www.idealista.com/inmueble/123', sessionId: 'sess-1' },
        () => {},
      ),
    ).rejects.toThrowError(
      expect.objectContaining({
        name: 'ApiError',
        status: 503,
        code: 'PORTAL_BLOCKED',
      }),
    );
  });

  it('throws an ApiError with code from structured done-event error', async () => {
    const sseBody = [
      'event: done\ndata: {"event":"done","payload":{"error":{"code":"PORTAL_BLOCKED","message":"Portal idealista.com está bloqueando peticiones."}}}\n\n',
    ].join('');

    const encoder = new TextEncoder();
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(sseBody));
        controller.close();
      },
    });

    const fakeResponse = new Response(body, { status: 200 });
    const fetchSpy = vi.fn(async () => fakeResponse);
    vi.stubGlobal('fetch', fetchSpy);

    await expect(
      analyzeListingStream(
        { url: 'https://www.idealista.com/inmueble/123', sessionId: 'sess-1' },
        () => {},
      ),
    ).rejects.toThrowError(
      expect.objectContaining({
        name: 'ApiError',
        status: 200,
        code: 'PORTAL_BLOCKED',
        message: expect.stringContaining('idealista'),
      }),
    );
  });
});
