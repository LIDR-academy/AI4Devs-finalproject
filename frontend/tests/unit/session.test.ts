import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';

const STORAGE_KEY = 'realista.sessionId';

function resetStorage(): void {
  localStorage.clear();
  vi.resetModules();
}

describe('session store', () => {
  beforeEach(() => {
    resetStorage();
  });

  it('generates a UUID v4 on first import when localStorage is empty', async () => {
    const { session } = await import('../../src/lib/stores/session');
    const state = get(session);
    expect(state.sessionId).toMatch(/^[0-9a-f-]{36}$/i);
    expect(state.sessionId.length).toBe(36);
  });

  it('persists sessionId to localStorage via setSessionId', async () => {
    const { session } = await import('../../src/lib/stores/session');
    session.setSessionId('aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee');
    expect(localStorage.getItem(STORAGE_KEY)).toBe(
      'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',
    );
  });

  it('reset() clears storage and generates a new UUID', async () => {
    const { session } = await import('../../src/lib/stores/session');
    session.setSessionId('11111111-2222-4333-8444-555555555555');
    expect(get(session).sessionId).toBe('11111111-2222-4333-8444-555555555555');
    session.reset();
    expect(localStorage.getItem(STORAGE_KEY)).not.toBe(
      '11111111-2222-4333-8444-555555555555',
    );
    expect(get(session).sessionId).toMatch(/^[0-9a-f-]{36}$/i);
  });
});
