/**
 * lastAnalysis store — remembers the most recent analysis text/URL
 * so that navigating back to listing-lens restores the form state.
 */
import { writable } from 'svelte/store';

export interface LastAnalysis {
  url: string;
  manualText: string;
}

const STORAGE_KEY = 'realista.lastAnalysis';

function load(): LastAnalysis | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LastAnalysis) : null;
  } catch {
    return null;
  }
}

function persist(value: LastAnalysis): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function createStore() {
  const { subscribe, set } = writable<LastAnalysis | null>(load());

  return {
    subscribe,
    set(value: LastAnalysis): void {
      persist(value);
      set(value);
    },
    clear(): void {
      localStorage.removeItem(STORAGE_KEY);
      set(null);
    },
  };
}

export const lastAnalysis = createStore();
