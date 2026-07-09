import { describe, it, expect, vi } from 'vitest';
import { analyzeListingStream } from '../../../src/lib/api/streamingClient';

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

    vi.doMock('../../../src/lib/stores/session', () => ({
      session: { subscribe: () => () => {}, setSessionId: () => {} },
    }));

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
});
