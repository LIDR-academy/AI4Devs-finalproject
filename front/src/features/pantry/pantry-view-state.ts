/**
 * Cross-route signals for the pantry view, persisted in sessionStorage.
 *
 * This mirrors the existing localStorage emoji-passing pattern and avoids
 * introducing TanStack Router search-param schemas (unused elsewhere in the app)
 * for what is transient UI state:
 *  - `highlight`: id of an item just created, so the pantry list can briefly
 *    highlight it on return.
 *  - `filter` / `search`: preserved so navigating to add-item and back lands the
 *    user on the same filtered/searched view.
 */
const HIGHLIGHT_KEY = "rsf_pantry_highlight";
const FILTER_KEY = "rsf_pantry_filter";
const SEARCH_KEY = "rsf_pantry_search";

function safeGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // sessionStorage unavailable — non-critical.
  }
}

function safeRemove(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // sessionStorage unavailable — non-critical.
  }
}

export function setHighlightedItem(itemId: string): void {
  safeSet(HIGHLIGHT_KEY, itemId);
}

/** Reads and clears the highlighted item id (consume-once). */
export function consumeHighlightedItem(): string | null {
  const value = safeGet(HIGHLIGHT_KEY);
  if (value) {
    safeRemove(HIGHLIGHT_KEY);
  }
  return value;
}

export function savePantryFilter(filter: string): void {
  safeSet(FILTER_KEY, filter);
}

export function readPantryFilter(): string | null {
  return safeGet(FILTER_KEY);
}

export function savePantrySearch(search: string): void {
  safeSet(SEARCH_KEY, search);
}

export function readPantrySearch(): string | null {
  return safeGet(SEARCH_KEY);
}
