/**
 * Minimal Playwright surface we use. Lets us mock in unit tests without
 * launching a real Chromium.
 */
export interface Browser {
  newContext(opts?: { userAgent?: string }): Promise<BrowserContext>;
  close(): Promise<void>;
}

export interface BrowserContext {
  newPage(): Promise<Page>;
  close(): Promise<void>;
}

export interface Page {
  setExtraHTTPHeaders(headers: Record<string, string>): Promise<void>;
  setUserAgent(userAgent: string): Promise<void>;
  goto(url: string, opts?: { waitUntil?: 'load' | 'domcontentloaded' | 'networkidle'; timeout?: number }): Promise<unknown>;
  content(): Promise<string>;
  close(): Promise<void>;
}

export interface BrowserLauncher {
  launch(opts?: { headless?: boolean }): Promise<Browser>;
}

export interface Clock {
  now(): number;
  setTimeout(fn: () => void, ms: number): NodeJS.Timeout;
  clearTimeout(handle: NodeJS.Timeout): void;
}

export const systemClock: Clock = {
  now: () => Date.now(),
  setTimeout: (fn, ms) => setTimeout(fn, ms),
  clearTimeout: (h) => clearTimeout(h),
};
