/**
 * Minimal, dependency-free client analytics.
 *
 * The MVP has no real analytics sink, so {@link trackEvent} is a safe no-op by
 * default: it forwards events to `window.dataLayer` when a sink is present and
 * keeps a small in-memory buffer on `window.__RSF_ANALYTICS__` so end-to-end
 * tests can assert what was emitted. It never throws and is a no-op on the
 * server.
 *
 * Privacy: callers must pass only non-sensitive, coarse properties. Never pass
 * auth tokens, full field values, or other PII.
 */

export type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

export interface AnalyticsEvent {
  name: string;
  props?: AnalyticsProps;
  at: number;
}

const BUFFER_KEY = "__RSF_ANALYTICS__";
const MAX_BUFFER = 50;

type AnalyticsWindow = Window & {
  dataLayer?: Array<Record<string, unknown>>;
  [BUFFER_KEY]?: AnalyticsEvent[];
};

export function trackEvent(name: string, props?: AnalyticsProps): void {
  if (typeof window === "undefined") {
    return;
  }

  const event: AnalyticsEvent = { name, props, at: Date.now() };

  try {
    const win = window as AnalyticsWindow;

    // Standard GTM-style sink (no-op when absent — we create the array lazily
    // only for our own buffer, never assume a real analytics provider).
    if (Array.isArray(win.dataLayer)) {
      win.dataLayer.push({ event: name, ...props });
    }

    // Test/debug buffer.
    const buffer = win[BUFFER_KEY] ?? [];
    buffer.push(event);
    win[BUFFER_KEY] = buffer.slice(-MAX_BUFFER);
  } catch {
    // Analytics must never break the app.
  }
}

/** Test helper: clears the in-memory analytics buffer. */
export function resetAnalyticsBuffer(): void {
  if (typeof window === "undefined") {
    return;
  }
  (window as AnalyticsWindow)[BUFFER_KEY] = [];
}

/** Test helper: reads the in-memory analytics buffer. */
export function getAnalyticsBuffer(): AnalyticsEvent[] {
  if (typeof window === "undefined") {
    return [];
  }
  return (window as AnalyticsWindow)[BUFFER_KEY] ?? [];
}
