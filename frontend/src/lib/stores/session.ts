import { writable } from 'svelte/store';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'realista.sessionId';

function getOrCreateSessionId(): string {
  if (typeof localStorage === 'undefined') return '';
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing && /^[0-9a-f-]{36}$/i.test(existing)) return existing;
  const fresh = uuidv4();
  localStorage.setItem(STORAGE_KEY, fresh);
  return fresh;
}

export interface SessionState {
  sessionId: string;
}

function createSessionStore() {
  const initial: SessionState = { sessionId: getOrCreateSessionId() };
  const { subscribe, set, update } = writable<SessionState>(initial);

  return {
    subscribe,
    setSessionId(id: string): void {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, id);
      }
      set({ sessionId: id });
    },
    reset(): void {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      set({ sessionId: getOrCreateSessionId() });
    },
    update,
  };
}

export const session = createSessionStore();
