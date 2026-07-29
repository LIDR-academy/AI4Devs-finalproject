// Vitest setup.
// happy-dom (configured in vitest.config.ts) provides window and document,
// but not localStorage. This minimal shim fills the gap for tests that
// touch localStorage at module-import time (e.g. session store tests).

const storage = new Map<string, string>();

const localStoragePolyfill = {
  getItem(key: string): string | null {
    return storage.has(key) ? (storage.get(key) as string) : null;
  },
  setItem(key: string, value: string): void {
    storage.set(key, String(value));
  },
  removeItem(key: string): void {
    storage.delete(key);
  },
  clear(): void {
    storage.clear();
  },
  get length(): number {
    return storage.size;
  },
  key(index: number): string | null {
    return Array.from(storage.keys())[index] ?? null;
  },
};

(globalThis as unknown as { localStorage: typeof localStoragePolyfill }).localStorage =
  localStoragePolyfill;

if (typeof (globalThis as unknown as { window?: unknown }).window !== 'undefined') {
  (globalThis as unknown as { window: { localStorage: typeof localStoragePolyfill } }).window.localStorage =
    localStoragePolyfill;
}
