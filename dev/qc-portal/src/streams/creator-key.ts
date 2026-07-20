/** In-memory-only store for the stream `creatorKey` (design D-P5, decision D5).
 *  The key is a credential: it lives in the JS heap for the session and is NEVER
 *  written to localStorage, sessionStorage, or cookies. A page reload clears it,
 *  so the creator correctly falls back to an anonymous viewer. */

const keysByStreamId = new Map<string, string>();

/** Remember the creatorKey for a stream (called on the start flow's `201`). */
export function setCreatorKey(streamId: string, creatorKey: string): void {
  keysByStreamId.set(streamId, creatorKey);
}

/** The creatorKey held for a stream, or undefined if none (e.g. after reload). */
export function getCreatorKey(streamId: string): string | undefined {
  return keysByStreamId.get(streamId);
}

/** Forget the creatorKey for a stream (e.g. after ending it). */
export function clearCreatorKey(streamId: string): void {
  keysByStreamId.delete(streamId);
}
