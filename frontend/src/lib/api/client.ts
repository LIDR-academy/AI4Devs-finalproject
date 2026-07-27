/**
 * API client. Wraps fetch and ensures the X-Session-Id header is set.
 * See .opencode/harness/env-vars.md.
 */
import { session } from '../stores/session';
import { get } from 'svelte/store';
import type { NegotiationResponse } from './types';

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

export interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
}

export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const sid = get(session).sessionId;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (sid) {
    headers['X-Session-Id'] = sid;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
    credentials: 'include',
  });

  const newSid = res.headers.get('X-Session-Id');
  if (newSid) session.setSessionId(newSid);

  if (!res.ok) {
    let body: { error?: string; message?: string } = {};
    try {
      body = await res.json();
    } catch {
      // ignore
    }
    throw new ApiError(
      res.status,
      body.error ?? 'UNKNOWN',
      body.message ?? `HTTP ${res.status}`,
    );
  }

  return (await res.json()) as T;
}

export const apiClient = {
  get: <T>(path: string, opts?: ApiOptions) => api<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: ApiOptions) =>
    api<T>(path, { ...opts, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, opts?: ApiOptions) =>
    api<T>(path, { ...opts, method: 'PATCH', body }),
  delete: <T>(path: string, opts?: ApiOptions) => api<T>(path, { ...opts, method: 'DELETE' }),
};

export const negotiationApi = {
  getPoints(listingId: string): Promise<NegotiationResponse> {
    return api<NegotiationResponse>(`/api/listings/${listingId}/negotiation-points`);
  },
};
