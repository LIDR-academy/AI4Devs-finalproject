/**
 * streamingClient — SSE parser using fetch + ReadableStream.
 * Used for the analyze endpoint with ?stream=true to get real-time progress
 * (FR-018). EventSource doesn't support POST so we use fetch.
 */
import { session } from '../stores/session';
import { get } from 'svelte/store';
import type { ProgressEventName, AnalyzeListingResponse } from './types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface StreamOptions {
  url: string;
  sessionId?: string;
  manualText?: string;
}

export async function analyzeListingStream(
  options: StreamOptions,
  onProgress: (event: ProgressEventName) => void,
): Promise<AnalyzeListingResponse> {
  const sid = options.sessionId ?? get(session).sessionId;
  const res = await fetch(`${BASE_URL}/api/listings/analyze?stream=true`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sid ? { 'X-Session-Id': sid } : {}),
    },
    body: JSON.stringify({ url: options.url, manualText: options.manualText }),
    credentials: 'include',
  });

  if (!res.ok) {
    let body: { error?: string; message?: string } = {};
    try {
      body = (await res.json()) as { error?: string; message?: string };
    } catch {
      // ignore — body may not be JSON
    }
    throw new ApiError(
      res.status,
      body.error ?? 'UNKNOWN',
      body.message ?? `HTTP ${res.status}`,
    );
  }

  if (!res.body) {
    throw new ApiError(res.status, 'NO_BODY', 'Empty response body');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let final: AnalyzeListingResponse | null = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      const rawEvent = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);

      const eventMatch = rawEvent.match(/^event: (.+)$/m);
      const dataMatch = rawEvent.match(/^data: (.+)$/m);
      if (!eventMatch || !dataMatch) continue;

      const eventName = eventMatch[1] as ProgressEventName;
      const data = JSON.parse(dataMatch[1]) as { event: string; payload: unknown };

      if (eventName === 'done') {
        const payload = data.payload as AnalyzeListingResponse | { error: string };
        if ('error' in payload && typeof payload.error === 'string') {
          throw new Error(payload.error);
        }
        final = payload as AnalyzeListingResponse;
      } else {
        onProgress(eventName);
      }
    }
  }

  if (!final) throw new Error('Stream closed without done event');
  return final;
}
