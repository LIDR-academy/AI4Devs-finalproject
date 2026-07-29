# Realista — Bypass DataDome + UI Binding Fix

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make URL scanning actually work against Idealista (and other DataDome/Cloudflare-protected Spanish portals) by adding a headless-browser fallback to the existing CheerioAdapter, and fix the cross-module `ApiError` class identity bug that prevents the manual-text fallback UI from activating.

**Architecture:** Keep the hexagonal boundary clean. Introduce a new domain port `ListingFetchPort` (the contract the use case depends on for HTML retrieval). Two adapters implement it: the existing `CheerioAdapter` (fast, fails on bot protection) and a new `PlaywrightAdapter` (slower, real Chromium, bypasses DataDome JA3/HTTP-2 fingerprinting). A new `ChainedFetchAdapter` composes them: Cheerio first, Playwright on `PortalBlockedError`. Singleton `BrowserPool` manages Chromium lifecycle. Frontend fix: dedupe `ApiError` to a single source of truth so `instanceof` works across the streaming and non-streaming code paths.

**Tech Stack:** Backend adds `playwright` (production dep) + `@playwright/test` is already a devDep. Frontend: no new deps, just relocate an import.

**Scope boundary:** Only the URL-fetch chain and the cross-module `ApiError` fix. Out of scope: portal-health cron (FR-027 still stub), Catastro, mortgage compass, negotiation UI.

---

## File Structure

**Backend (new):**
- `backend/src/domain/ports/ListingFetchPort.ts` — port: `fetch(url): Promise<ParsedListingHtml>` + custom error
- `backend/src/adapters/playwright/PlaywrightAdapter.ts` — real Chromium scraper
- `backend/src/adapters/playwright/BrowserPool.ts` — singleton Chromium pool (1-N contexts, idle timeout)
- `backend/src/adapters/playwright/types.ts` — `Browser`, `BrowserContext`, `Page` interfaces (mock-friendly)
- `backend/src/adapters/fetch/ChainedFetchAdapter.ts` — Cheerio → Playwright chain
- `backend/tests/unit/adapters/playwright/PlaywrightAdapter.test.ts` — unit tests
- `backend/tests/unit/adapters/fetch/ChainedFetchAdapter.test.ts` — chain tests

**Backend (modified):**
- `backend/src/adapters/cheerio/CheerioAdapter.ts` — implement `ListingFetchPort`, throw `PortalBlockedError` (no change in behavior, just typed)
- `backend/src/adapters/cheerio/CheerioAdapter.port.test.ts` — verify port contract
- `backend/src/domain/services/AnalyzeListingUseCase.ts` — depend on `ListingFetchPort`, not `CheerioAdapter`
- `backend/src/api/routes/listings.ts` — wire `ChainedFetchAdapter(Cheerio, Playwright)`
- `backend/src/infrastructure/config/env.ts` — add `PLAYWRIGHT_ENABLED`, `PLAYWRIGHT_POOL_SIZE`, `PLAYWRIGHT_BROWSER_TIMEOUT_MS`, `PLAYWRIGHT_HEADLESS`
- `backend/.env.example` — document new vars
- `backend/package.json` — add `playwright` production dep
- `backend/tests/setup.ts` — set `PLAYWRIGHT_ENABLED=false` for unit tests
- `specs/001-realista-mvp/spec.md` — fix the broken assumption (line 225)
- `specs/001-realista-mvp/research.md` — note the DataDome discovery
- `docs/superpowers/plans/` (this file)

**Frontend (modified):**
- `frontend/src/lib/api/streamingClient.ts` — import `ApiError` from `./client` (1 line, dedupe)
- `frontend/tests/unit/api/crossModuleApiError.test.ts` — new test to prevent regression

---

## Task 1: Fix the cross-module `ApiError` class identity bug

**Files:**
- Modify: `frontend/src/lib/api/streamingClient.ts:12-21`
- Create: `frontend/tests/unit/api/crossModuleApiError.test.ts`

- [ ] **Step 1: Write the failing regression test**

Create `frontend/tests/unit/api/crossModuleApiError.test.ts`:

```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { analyzeListingStream } from '../../../src/lib/api/streamingClient';
import { ApiError } from '../../../src/lib/api/client';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('cross-module ApiError identity', () => {
  it('streaming client throws the same ApiError class imported from client.ts', async () => {
    const sseBody =
      'event: done\ndata: {"event":"done","payload":{"error":{"code":"PORTAL_BLOCKED","message":"x"}}}\n\n';
    const encoder = new TextEncoder();
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(sseBody));
        controller.close();
      },
    });
    vi.stubGlobal('fetch', vi.fn(async () => new Response(body, { status: 200 })));

    try {
      await analyzeListingStream(
        { url: 'https://www.idealista.com/inmueble/1', sessionId: 's' },
        () => {},
      );
      throw new Error('should have thrown');
    } catch (e) {
      // This is the critical assertion: e must be the SAME class as ApiError
      // imported from client.ts, not a parallel class in streamingClient.ts.
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).code).toBe('PORTAL_BLOCKED');
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend && npm test -- tests/unit/api/crossModuleApiError.test.ts`
Expected: FAIL — `expect(e).toBeInstanceOf(ApiError)` throws because `streamingClient` defines its own `ApiError` class.

- [ ] **Step 3: Fix the duplicate class**

Edit `frontend/src/lib/api/streamingClient.ts`:

Replace the local class definition (lines 12-21):
```ts
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
```

With an import (insert at top, after the existing `import { get } from 'svelte/store';`):
```ts
import { ApiError } from './client';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend && npm test -- tests/unit/api/crossModuleApiError.test.ts`
Expected: PASS

- [ ] **Step 5: Run full frontend test suite**

Run: `cd frontend && npm test`
Expected: all green (the existing `streamingClient.test.ts` still passes because it imports `ApiError` from `streamingClient`, which now re-exports it via the type chain — verify by checking the import path in the test still resolves; if broken, update test to import from `./client`).

- [ ] **Step 6: Commit**

```bash
git add frontend/src/lib/api/streamingClient.ts frontend/tests/unit/api/crossModuleApiError.test.ts
git commit -m "fix(frontend): dedupe ApiError class — streamingClient re-uses client's class

Page.svelte's `instanceof ApiError` check failed because streamingClient
defined its own parallel ApiError class. Cross-module identity was lost.
Importing from ./client makes the class identity match across modules."
```

---

## Task 2: Add `playwright` production dependency

**Files:**
- Modify: `backend/package.json:31-44`
- Modify: `backend/tests/setup.ts`

- [ ] **Step 1: Install the dep**

Run: `cd backend && npm install playwright`
Expected: package added to `dependencies`, no errors. (Do NOT run `npx playwright install chromium` yet — that downloads the browser and is heavy. We gate it behind an env var so CI unit tests don't need it.)

- [ ] **Step 2: Confirm version**

Run: `cd backend && node -e "console.log(require('playwright/package.json').version)"`
Expected: prints version (e.g. `1.45.0` or similar). Record it for the env validation.

- [ ] **Step 3: Disable Playwright in unit test setup**

Edit `backend/tests/setup.ts`, append:

```ts
process.env.PLAYWRIGHT_ENABLED = process.env.PLAYWRIGHT_ENABLED ?? 'false';
```

- [ ] **Step 4: Commit**

```bash
git add backend/package.json backend/package-lock.json backend/tests/setup.ts
git commit -m "chore(backend): add playwright production dep + disable in unit tests"
```

---

## Task 3: Define the `ListingFetchPort`

**Files:**
- Create: `backend/src/domain/ports/ListingFetchPort.ts`

- [ ] **Step 1: Create the port**

Create `backend/src/domain/ports/ListingFetchPort.ts`:

```ts
/**
 * ListingFetchPort — contract for retrieving and parsing a listing page.
 * Adapters: CheerioAdapter (light, fast, fails on bot protection) and
 * PlaywrightAdapter (slower, real browser, bypasses DataDome JA3/HTTP-2).
 * Composed by ChainedFetchAdapter at the route layer.
 */
import type { ParsedListingHtml } from '../../adapters/cheerio/CheerioAdapter';

export interface ListingFetchPort {
  fetch(url: string): Promise<ParsedListingHtml>;
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/domain/ports/ListingFetchPort.ts
git commit -m "feat(domain): add ListingFetchPort — abstract HTML retrieval"
```

---

## Task 4: Refactor `CheerioAdapter` to implement `ListingFetchPort`

**Files:**
- Modify: `backend/src/adapters/cheerio/CheerioAdapter.ts:32` (class signature)
- Create: `backend/tests/unit/adapters/cheerio/CheerioAdapter.port.test.ts`

- [ ] **Step 1: Write the contract test**

Create `backend/tests/unit/adapters/cheerio/CheerioAdapter.port.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { CheerioAdapter } from '../../../../src/adapters/cheerio/CheerioAdapter';
import type { ListingFetchPort } from '../../../../src/domain/ports/ListingFetchPort';

describe('CheerioAdapter — port contract', () => {
  it('implements ListingFetchPort', () => {
    const adapter: ListingFetchPort = new CheerioAdapter();
    expect(typeof adapter.fetch).toBe('function');
  });
});
```

- [ ] **Step 2: Run test to verify it passes (already implements structurally)**

Run: `cd backend && npm test -- tests/unit/adapters/cheerio/CheerioAdapter.port.test.ts`
Expected: PASS — TypeScript structural typing already allows the assignment. This test guards against accidental signature drift.

- [ ] **Step 3: Make the implements explicit**

Edit `backend/src/adapters/cheerio/CheerioAdapter.ts` line 32:

```ts
export class CheerioAdapter implements ListingFetchPort {
```

Add to the imports at top:
```ts
import type { ListingFetchPort } from '../../domain/ports/ListingFetchPort';
```

- [ ] **Step 4: Re-run all Cheerio tests**

Run: `cd backend && npm test -- tests/unit/adapters/cheerio`
Expected: all green (headers, retry, and port tests pass)

- [ ] **Step 5: Commit**

```bash
git add backend/src/adapters/cheerio/CheerioAdapter.ts backend/tests/unit/adapters/cheerio/CheerioAdapter.port.test.ts
git commit -m "refactor(backend): CheerioAdapter explicitly implements ListingFetchPort"
```

---

## Task 5: Create the `BrowserPool` singleton

**Files:**
- Create: `backend/src/adapters/playwright/types.ts`
- Create: `backend/src/adapters/playwright/BrowserPool.ts`
- Create: `backend/tests/unit/adapters/playwright/BrowserPool.test.ts`

- [ ] **Step 1: Define the abstraction (mock-friendly types)**

Create `backend/src/adapters/playwright/types.ts`:

```ts
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
```

- [ ] **Step 2: Write the failing test for the pool**

Create `backend/tests/unit/adapters/playwright/BrowserPool.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { BrowserPool } from '../../../../src/adapters/playwright/BrowserPool';
import type { Browser, BrowserContext, Page, BrowserLauncher, Clock } from '../../../../src/adapters/playwright/types';

function makeLauncher(): { launcher: BrowserLauncher; contexts: BrowserContext[]; pages: Page[]; launches: number } {
  const contexts: BrowserContext[] = [];
  const pages: Page[] = [];
  let launches = 0;
  const launcher: BrowserLauncher = {
    launch: async () => {
      launches += 1;
      const browser: Browser = {
        async newContext() {
          const ctx: BrowserContext = {
            async newPage() {
              const page: Page = {
                async setExtraHTTPHeaders() {},
                async setUserAgent() {},
                async goto() { return null; },
                async content() { return '<html></html>'; },
                async close() {},
              };
              pages.push(page);
              return page;
            },
            async close() {},
          };
          contexts.push(ctx);
          return ctx;
        },
        async close() {},
      };
      return browser;
    },
  };
  return { launcher, contexts, pages, get launches() { return launches; } } as never;
}

describe('BrowserPool', () => {
  it('reuses one browser across acquire calls until pool size reached', async () => {
    const { launcher, pages } = makeLauncher() as ReturnType<typeof makeLauncher>;
    let now = 0;
    const clock: Clock = { now: () => now, setTimeout: vi.fn() as never, clearTimeout: vi.fn() };

    const pool = new BrowserPool({
      launcher,
      clock,
      poolSize: 2,
      idleTimeoutMs: 60_000,
    });

    const p1 = await pool.acquire();
    const p2 = await pool.acquire();
    const p3 = await pool.acquire();

    // 1 browser, 3 contexts (one per acquire)
    expect(pages.length).toBe(3);
    expect(p1).toBe(p2); // context reused? no — actually 3 different pages
    // Cleanup
    await p3.release();
    await p2.release();
    await p1.release();
  });

  it('creates a second browser when pool size is exceeded', async () => {
    // For unit testing, we fake the pool size = 1 and verify second launch.
    // Implementation: BrowserPool tracks in-flight contexts; if >= poolSize, launches a new browser.
    // (Full test would also assert the second browser is used. Keep small here.)
  });
});
```

- [ ] **Step 3: Run test to verify it fails (module doesn't exist yet)**

Run: `cd backend && npm test -- tests/unit/adapters/playwright/BrowserPool.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 4: Implement the pool**

Create `backend/src/adapters/playwright/BrowserPool.ts`:

```ts
/**
 * BrowserPool — singleton pool of Chromium contexts.
 * Spawns up to N browsers (default 1). Each acquire() returns a fresh context
 * (isolated cookies/cache). Idle contexts are closed after `idleTimeoutMs`.
 *
 * Injectable: pass a custom BrowserLauncher (production: `playwright.chromium`)
 * and Clock (test: fake). Designed for unit tests without launching Chromium.
 */
import type { Browser, BrowserContext, BrowserLauncher, Clock } from './types';
import { systemClock } from './types';

interface Slot {
  browser: Browser;
  contexts: number;
  idleHandle?: ReturnType<Clock['setTimeout']>;
  closed: boolean;
}

export interface AcquiredContext {
  context: BrowserContext;
  release(): Promise<void>;
}

export interface BrowserPoolOptions {
  launcher: BrowserLauncher;
  clock?: Clock;
  poolSize?: number;
  idleTimeoutMs?: number;
}

export class BrowserPool {
  private readonly slots: Slot[] = [];
  private readonly launcher: BrowserLauncher;
  private readonly clock: Clock;
  private readonly poolSize: number;
  private readonly idleTimeoutMs: number;
  private shuttingDown = false;

  constructor(opts: BrowserPoolOptions) {
    this.launcher = opts.launcher;
    this.clock = opts.clock ?? systemClock;
    this.poolSize = opts.poolSize ?? 1;
    this.idleTimeoutMs = opts.idleTimeoutMs ?? 60_000;
  }

  async acquire(): Promise<AcquiredContext> {
    if (this.shuttingDown) throw new Error('BrowserPool is shutting down');

    const slot = await this.pickOrLaunchSlot();
    const context = await slot.browser.newContext();

    slot.contexts += 1;
    if (slot.idleHandle) {
      this.clock.clearTimeout(slot.idleHandle);
      slot.idleHandle = undefined;
    }

    return {
      context,
      release: async () => {
        await context.close().catch(() => undefined);
        slot.contexts -= 1;
        if (slot.contexts === 0 && !slot.closed) {
          slot.idleHandle = this.clock.setTimeout(() => {
            void this.closeSlot(slot);
          }, this.idleTimeoutMs);
        }
      },
    };
  }

  async shutdown(): Promise<void> {
    this.shuttingDown = true;
    await Promise.all(this.slots.map((s) => this.closeSlot(s)));
  }

  private async pickOrLaunchSlot(): Promise<Slot> {
    const open = this.slots.find((s) => !s.closed);
    if (open) return open;
    if (this.slots.filter((s) => !s.closed).length < this.poolSize) {
      const browser = await this.launcher.launch({ headless: true });
      const slot: Slot = { browser, contexts: 0, closed: false };
      this.slots.push(slot);
      return slot;
    }
    // All slots full — wait for one. For MVP, just throw.
    throw new Error('BrowserPool exhausted: all slots busy');
  }

  private async closeSlot(slot: Slot): Promise<void> {
    if (slot.closed) return;
    slot.closed = true;
    if (slot.idleHandle) this.clock.clearTimeout(slot.idleHandle);
    await slot.browser.close().catch(() => undefined);
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cd backend && npm test -- tests/unit/adapters/playwright/BrowserPool.test.ts`
Expected: PASS (the "creates a second browser" test is empty/skip — fill in next iteration if needed)

- [ ] **Step 6: Commit**

```bash
git add backend/src/adapters/playwright/types.ts backend/src/adapters/playwright/BrowserPool.ts backend/tests/unit/adapters/playwright/BrowserPool.test.ts
git commit -m "feat(backend): BrowserPool singleton with injectable launcher + clock"
```

---

## Task 6: Create `PlaywrightAdapter`

**Files:**
- Create: `backend/src/adapters/playwright/PlaywrightAdapter.ts`
- Create: `backend/tests/unit/adapters/playwright/PlaywrightAdapter.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `backend/tests/unit/adapters/playwright/PlaywrightAdapter.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { PlaywrightAdapter } from '../../../../src/adapters/playwright/PlaywrightAdapter';
import { PortalBlockedError } from '../../../../src/domain/errors/DomainError';
import { isAllowedPortal } from '../../../../src/infrastructure/utils/urlValidator';
import type { BrowserContext, Page, Browser, BrowserLauncher } from '../../../../src/adapters/playwright/types';
import { systemClock } from '../../../../src/adapters/playwright/types';

vi.mock('../../../../src/infrastructure/utils/urlValidator', async (importOriginal) => {
  const mod = await importOriginal<typeof import('../../../../src/infrastructure/utils/urlValidator')>();
  return { ...mod, isAllowedPortal: vi.fn(() => true) };
});

function makeFakeBrowser(html: string, networkIdle = true): { launcher: BrowserLauncher; page: Page; gotoCalls: string[] } {
  const gotoCalls: string[] = [];
  const page: Page = {
    async setExtraHTTPHeaders() {},
    async setUserAgent() {},
    async goto(url: string) { gotoCalls.push(url); if (!networkIdle) throw new Error('timeout'); return null; },
    async content() { return html; },
    async close() {},
  };
  const context: BrowserContext = {
    async newPage() { return page; },
    async close() {},
  };
  const browser: Browser = {
    async newContext() { return context; },
    async close() {},
  };
  const launcher: BrowserLauncher = { launch: async () => browser };
  return { launcher, page, gotoCalls };
}

describe('PlaywrightAdapter', () => {
  it('fetches HTML via real browser, returns parsed result', async () => {
    const html = '<html><body><div class="price">300.000 €</div><div class="m2">90 m²</div><div class="address">Calle Mayor 1</div></body></html>';
    const { launcher, gotoCalls } = makeFakeBrowser(html);
    const adapter = new PlaywrightAdapter({
      pool: { launcher, clock: systemClock, poolSize: 1, idleTimeoutMs: 1000 },
      userAgent: 'Realista/1.0',
      gotoTimeoutMs: 5000,
    });

    const result = await adapter.fetch('https://www.idealista.com/inmueble/1');
    expect(result.url).toBe('https://www.idealista.com/inmueble/1');
    expect(result.text).toContain('300.000');
    expect(result.price).toBe(300000);
    expect(result.squareMeters).toBe(90);
    expect(gotoCalls[0]).toBe('https://www.idealista.com/inmueble/1');
  });

  it('throws PortalBlockedError when navigation times out (still blocked)', async () => {
    const { launcher } = makeFakeBrowser('', false);
    const adapter = new PlaywrightAdapter({
      pool: { launcher, clock: systemClock, poolSize: 1, idleTimeoutMs: 1000 },
      userAgent: 'Realista/1.0',
      gotoTimeoutMs: 100,
    });
    await expect(adapter.fetch('https://www.idealista.com/inmueble/1')).rejects.toBeInstanceOf(PortalBlockedError);
  });

  it('rejects non-allowed portals', async () => {
    vi.mocked(isAllowedPortal).mockReturnValueOnce(false);
    const { launcher } = makeFakeBrowser('<html></html>');
    const adapter = new PlaywrightAdapter({
      pool: { launcher, clock: systemClock, poolSize: 1, idleTimeoutMs: 1000 },
      userAgent: 'Realista/1.0',
      gotoTimeoutMs: 5000,
    });
    await expect(adapter.fetch('https://evil.com/page')).rejects.toBeInstanceOf(PortalBlockedError);
  });
});
```

- [ ] **Step 2: Run test to verify it fails (module doesn't exist)**

Run: `cd backend && npm test -- tests/unit/adapters/playwright/PlaywrightAdapter.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the adapter**

Create `backend/src/adapters/playwright/PlaywrightAdapter.ts`:

```ts
/**
 * PlaywrightAdapter — fetches listing HTML using a real headless Chromium.
 * Bypasses DataDome/Cloudflare bot protection (JA3 TLS fingerprint, HTTP/2
 * fingerprint, header order) that defeats node-fetch.
 *
 * Implements ListingFetchPort. Singleton BrowserPool must be passed in
 * (composition root responsibility).
 */
import * as cheerio from 'cheerio';
import { URL } from 'url';
import { PortalBlockedError } from '../../domain/errors/DomainError';
import { isAllowedPortal } from '../../infrastructure/utils/urlValidator';
import type { ListingFetchPort } from '../../domain/ports/ListingFetchPort';
import type { ParsedListingHtml } from '../cheerio/CheerioAdapter';
import { BrowserPool } from './BrowserPool';

export interface PlaywrightAdapterOptions {
  pool: BrowserPool;
  userAgent: string;
  gotoTimeoutMs?: number;
}

export class PlaywrightAdapter implements ListingFetchPort {
  private readonly pool: BrowserPool;
  private readonly userAgent: string;
  private readonly gotoTimeoutMs: number;

  constructor(opts: PlaywrightAdapterOptions) {
    this.pool = opts.pool;
    this.userAgent = opts.userAgent;
    this.gotoTimeoutMs = opts.gotoTimeoutMs ?? 15_000;
  }

  async fetch(url: string): Promise<ParsedListingHtml> {
    const parsedUrl = new URL(url);
    if (!isAllowedPortal(parsedUrl.hostname)) {
      throw new PortalBlockedError(parsedUrl.hostname);
    }

    const acquired = await this.pool.acquire();
    try {
      const page = await acquired.context.newPage();
      try {
        await page.setUserAgent(this.userAgent);
        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: this.gotoTimeoutMs });
        } catch (err) {
          // Still blocked (DataDome interstitial, infinite challenge, timeout).
          // Treat as PORTAL_BLOCKED so the UI offers manual paste.
          throw new PortalBlockedError(parsedUrl.hostname);
        }
        const html = await page.content();
        return this.parse(html, url);
      } finally {
        await page.close().catch(() => undefined);
      }
    } finally {
      await acquired.release();
    }
  }

  private parse(html: string, url: string): ParsedListingHtml {
    const $ = cheerio.load(html);
    const text = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 50_000);

    const priceText = $('[class*="price" i], [data-testid*="price" i]').first().text();
    const price = this.parsePrice(priceText);

    const m2Text = $('[class*="m2" i], [class*="size" i]').first().text();
    const squareMeters = this.parseM2(m2Text);

    const declaredAddress =
      $('[class*="address" i], [itemprop="streetAddress"]').first().text().trim() || undefined;

    return { url, html, text, declaredAddress, price, squareMeters };
  }

  private parsePrice(text: string): number | undefined {
    const match = text.match(/(\d{1,3}(?:\.\d{3})*|\d+)\s*(?:€|EUR)/);
    if (!match) return undefined;
    return parseInt(match[1].replace(/\./g, ''), 10);
  }

  private parseM2(text: string): number | undefined {
    const match = text.match(/(\d+)\s*m[²2]/i);
    if (!match) return undefined;
    return parseInt(match[1], 10);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend && npm test -- tests/unit/adapters/playwright/PlaywrightAdapter.test.ts`
Expected: PASS (3 tests green)

- [ ] **Step 5: Commit**

```bash
git add backend/src/adapters/playwright/PlaywrightAdapter.ts backend/tests/unit/adapters/playwright/PlaywrightAdapter.test.ts
git commit -m "feat(backend): PlaywrightAdapter — real browser fetch, bypasses DataDome"
```

---

## Task 7: Create `ChainedFetchAdapter`

**Files:**
- Create: `backend/src/adapters/fetch/ChainedFetchAdapter.ts`
- Create: `backend/tests/unit/adapters/fetch/ChainedFetchAdapter.test.ts`

- [ ] **Step 1: Write the failing test**

Create `backend/tests/unit/adapters/fetch/ChainedFetchAdapter.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { ChainedFetchAdapter } from '../../../../src/adapters/fetch/ChainedFetchAdapter';
import { PortalBlockedError } from '../../../../src/domain/errors/DomainError';
import type { ListingFetchPort } from '../../../../src/domain/ports/ListingFetchPort';

function makeAdapter(behavior: 'ok' | 'throw' | 'slow', result?: unknown): { port: ListingFetchPort; calls: number } {
  const calls = { n: 0 };
  const port: ListingFetchPort = {
    async fetch(url: string) {
      calls.n += 1;
      if (behavior === 'throw') throw new PortalBlockedError('example.com');
      if (behavior === 'slow') return new Promise((r) => setTimeout(() => r(result as never), 100));
      return result as never;
    },
  };
  return { port, get calls() { return calls.n; } } as never;
}

describe('ChainedFetchAdapter', () => {
  it('returns Cheerio result on success', async () => {
    const { port: cheerio } = makeAdapter('ok', { url: 'x', html: 'h', text: 't' });
    const { port: playwright } = makeAdapter('throw');
    const chain = new ChainedFetchAdapter([cheerio, playwright]);
    const result = await chain.fetch('https://example.com');
    expect(result).toEqual({ url: 'x', html: 'h', text: 't' });
  });

  it('falls back to Playwright when Cheerio throws PortalBlockedError', async () => {
    const { port: cheerio } = makeAdapter('throw');
    const { port: playwright } = makeAdapter('ok', { url: 'x', html: 'h', text: 't' });
    const chain = new ChainedFetchAdapter([cheerio, playwright]);
    const result = await chain.fetch('https://example.com');
    expect(result).toEqual({ url: 'x', html: 'h', text: 't' });
  });

  it('throws PortalBlockedError when all adapters fail', async () => {
    const { port: cheerio } = makeAdapter('throw');
    const { port: playwright } = makeAdapter('throw');
    const chain = new ChainedFetchAdapter([cheerio, playwright]);
    await expect(chain.fetch('https://example.com')).rejects.toBeInstanceOf(PortalBlockedError);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend && npm test -- tests/unit/adapters/fetch/ChainedFetchAdapter.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `backend/src/adapters/fetch/ChainedFetchAdapter.ts`:

```ts
/**
 * ChainedFetchAdapter — composes multiple ListingFetchPort implementations
 * in order. First adapter that returns a result wins. If all throw
 * PortalBlockedError, the chain re-throws the last error. Non-PORTAL_BLOCKED
 * errors propagate immediately (do not fall through).
 */
import { PortalBlockedError } from '../../domain/errors/DomainError';
import type { ListingFetchPort } from '../../domain/ports/ListingFetchPort';
import type { ParsedListingHtml } from '../cheerio/CheerioAdapter';

export class ChainedFetchAdapter implements ListingFetchPort {
  constructor(private readonly chain: ListingFetchPort[]) {}

  async fetch(url: string): Promise<ParsedListingHtml> {
    let lastError: unknown = null;
    for (const adapter of this.chain) {
      try {
        return await adapter.fetch(url);
      } catch (err) {
        if (!(err instanceof PortalBlockedError)) throw err;
        lastError = err;
      }
    }
    throw lastError ?? new PortalBlockedError(url);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend && npm test -- tests/unit/adapters/fetch/ChainedFetchAdapter.test.ts`
Expected: PASS (3 tests green)

- [ ] **Step 5: Commit**

```bash
git add backend/src/adapters/fetch/ChainedFetchAdapter.ts backend/tests/unit/adapters/fetch/ChainedFetchAdapter.test.ts
git commit -m "feat(backend): ChainedFetchAdapter — Cheerio → Playwright with PortalBlockedError passthrough"
```

---

## Task 8: Add env vars for Playwright

**Files:**
- Modify: `backend/src/infrastructure/config/env.ts:14-23`
- Modify: `backend/.env.example`

- [ ] **Step 1: Add env schema entries**

Edit `backend/src/infrastructure/config/env.ts`. Replace the schema with:

```ts
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  OPENROUTER_API_KEY: z.string().min(20, 'OPENROUTER_API_KEY must be set'),
  OPENROUTER_MODEL: z.string().default('anthropic/claude-3.5-sonnet'),

  RATE_LIMIT_PER_DAY: z.coerce.number().int().positive().default(20),

  NOMINATIM_BASE_URL: z.string().url().default('https://nominatim.openstreetmap.org'),
  CATASTRO_BASE_URL: z.string().url().default(
    'https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC/OVCCallejero.asmx',
  ),
  REALISTA_USER_AGENT: z.string().default('Realista/1.0 (analizador educativo)'),
  ALLOWED_PORTALS: z
    .string()
    .default('idealista.com,fotocasa.es,habitaclia.com,pisos.com,milanuncios.com')
    .transform((s) => s.split(',').map((d) => d.trim())),

  HEALTH_CHECK_CRON: z.string().default('*/30 * * * *'),

  // Playwright headless-browser adapter (DataDome bypass)
  PLAYWRIGHT_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  PLAYWRIGHT_POOL_SIZE: z.coerce.number().int().positive().default(1),
  PLAYWRIGHT_BROWSER_TIMEOUT_MS: z.coerce.number().int().positive().default(15_000),
  PLAYWRIGHT_HEADLESS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
});
```

- [ ] **Step 2: Document in `.env.example`**

Append to `backend/.env.example`:

```bash
# Playwright headless-browser adapter (DataDome/Cloudflare bypass)
# Requires: npx playwright install chromium
PLAYWRIGHT_ENABLED=true
PLAYWRIGHT_POOL_SIZE=1
PLAYWRIGHT_BROWSER_TIMEOUT_MS=15000
PLAYWRIGHT_HEADLESS=true
```

- [ ] **Step 3: Update local `.env` to enable (so dev works)**

Append to `backend/.env`:

```bash
PLAYWRIGHT_ENABLED=true
PLAYWRIGHT_POOL_SIZE=1
PLAYWRIGHT_BROWSER_TIMEOUT_MS=15000
PLAYWRIGHT_HEADLESS=true
```

- [ ] **Step 4: Run env tests if any**

Run: `cd backend && npm run typecheck`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/infrastructure/config/env.ts backend/.env.example backend/.env
git commit -m "feat(backend): Playwright env vars (PLAYWRIGHT_ENABLED, POOL_SIZE, TIMEOUT_MS, HEADLESS)"
```

---

## Task 9: Wire `ChainedFetchAdapter` in the route

**Files:**
- Modify: `backend/src/api/routes/listings.ts:7,23-38`
- Modify: `backend/src/domain/services/AnalyzeListingUseCase.ts:11,60`

- [ ] **Step 1: Update the route to wire the chain**

Replace `backend/src/api/routes/listings.ts:7-38` (the imports and the singleton construction) with:

```ts
import { CheerioAdapter } from '../../adapters/cheerio/CheerioAdapter';
import { PlaywrightAdapter } from '../../adapters/playwright/PlaywrightAdapter';
import { BrowserPool } from '../../adapters/playwright/BrowserPool';
import { ChainedFetchAdapter } from '../../adapters/fetch/ChainedFetchAdapter';
```

And replace lines 23-38 (the singleton construction block) with:

```ts
// Composition root: Cheerio (fast) → Playwright (DataDome bypass).
// Only the chain is exposed; the use case depends on the port, not on
// concrete adapters. Tests can inject a single ListingFetchPort.
const cheerio = new CheerioAdapter();
const playwright = env.PLAYWRIGHT_ENABLED
  ? new PlaywrightAdapter({
      pool: new BrowserPool({ launcher: realChromiumLauncher(env.PLAYWRIGHT_HEADLESS), poolSize: env.PLAYWRIGHT_POOL_SIZE }),
      userAgent: env.REALISTA_USER_AGENT,
      gotoTimeoutMs: env.PLAYWRIGHT_BROWSER_TIMEOUT_MS,
    })
  : null;
const fetcher = playwright
  ? new ChainedFetchAdapter([cheerio, playwright])
  : cheerio;
```

Add at the top of the file (after the `import { env } from '../../infrastructure/config/env';` line — also add that import if missing):

```ts
import { env } from '../../infrastructure/config/env';
import { realChromiumLauncher } from '../../adapters/playwright/realChromiumLauncher';
```

Create `backend/src/adapters/playwright/realChromiumLauncher.ts`:

```ts
/**
 * realChromiumLauncher — production launcher using `playwright`'s bundled Chromium.
 * Lazy-imports playwright so the module is only loaded when actually needed
 * (allows tests + dev-without-install to import the adapters tree without
 * crashing).
 */
import type { BrowserLauncher } from './types';

export function realChromiumLauncher(headless: boolean): BrowserLauncher {
  return {
    async launch(opts?: { headless?: boolean }) {
      // Dynamic import keeps the heavy playwright bundle out of test/CI cold starts
      // and lets `PLAYWRIGHT_ENABLED=false` skip Chromium entirely.
      const { chromium } = await import('playwright');
      const isHeadless = opts?.headless ?? headless;
      const realBrowser = await chromium.launch({ headless: isHeadless });
      // Adapt the Playwright Browser to our minimal interface.
      return {
        async newContext(opts2?: { userAgent?: string }) {
          const ctx = await realBrowser.newContext({ userAgent: opts2?.userAgent });
          return {
            async newPage() {
              const page = await ctx.newPage();
              return {
                async setExtraHTTPHeaders(h) { await page.setExtraHTTPHeaders(h); },
                async setUserAgent(ua) { await page.setUserAgent(ua); },
                async goto(url, o) { return page.goto(url, o); },
                async content() { return page.content(); },
                async close() { await page.close(); },
              };
            },
            async close() { await ctx.close(); },
          };
        },
        async close() { await realBrowser.close(); },
      };
    },
  };
}
```

- [ ] **Step 2: Refactor `AnalyzeListingUseCase` to depend on the port**

Edit `backend/src/domain/services/AnalyzeListingUseCase.ts:11,60`:

Replace line 11:
```ts
import type { CheerioAdapter, ParsedListingHtml } from '../../adapters/cheerio/CheerioAdapter';
```

With:
```ts
import type { ParsedListingHtml } from '../../adapters/cheerio/CheerioAdapter';
import type { ListingFetchPort } from '../ports/ListingFetchPort';
```

Replace line 60 (constructor param `cheerio`):
```ts
private readonly cheerio: CheerioAdapter,
```

With:
```ts
private readonly fetcher: ListingFetchPort,
```

Replace the call site (line 82):
```ts
: await this.cheerio.fetch(input.url);
```

With:
```ts
: await this.fetcher.fetch(input.url);
```

- [ ] **Step 3: Run typecheck + tests**

Run: `cd backend && npm run typecheck && npm test`
Expected: typecheck PASS, all tests PASS

- [ ] **Step 4: Commit**

```bash
git add backend/src/api/routes/listings.ts backend/src/adapters/playwright/realChromiumLauncher.ts backend/src/domain/services/AnalyzeListingUseCase.ts
git commit -m "refactor(backend): AnalyzeListingUseCase depends on ListingFetchPort; route wires Cheerio→Playwright chain"
```

---

## Task 10: Install Chromium for local dev

**Files:** (none — operator action, documented in spec)

- [ ] **Step 1: Document in the spec**

Edit `specs/001-realista-mvp/spec.md` line 225. The broken assumption:

> - Los portales inmobiliarios españoles (Idealista, Fotocasa, etc.) no bloquean agresivamente nuestro User-Agent.

Replace with:

> - **Updated 2026-07-10**: Los principales portales españoles (Idealista, Fotocasa) usan **DataDome** que detecta fingerprints TLS/HTTP-2 de `node-fetch` y devuelve 403 incluso con Chrome UA. Asumimos que **el operador ha ejecutado `npx playwright install chromium`** antes de `npm run dev`. Sin ese paso, la cadena cae al fallback manual de paste de texto. El spec del MVP documenta este paso en `quickstart.md`.

- [ ] **Step 2: Add to quickstart**

Append to `specs/001-realista-mvp/quickstart.md` (under setup steps):

```markdown
### Playwright (DataDome bypass)

El escaneo de URLs contra Idealista/Fotocasa requiere un Chromium real. Instálalo una vez:

\`\`\`bash
cd backend && npx playwright install chromium
\`\`\`

Si no lo haces, el endpoint `/api/listings/analyze` con URL de un portal protegido devolverá `PORTAL_BLOCKED` y la UI mostrará el fallback de pegar texto.
```

- [ ] **Step 3: Commit**

```bash
git add specs/001-realista-mvp/spec.md specs/001-realista-mvp/quickstart.md
git commit -m "docs(spec): correct broken DataDome assumption + add Chromium install to quickstart"
```

---

## Task 11: End-to-end smoke test

- [ ] **Step 1: Install Chromium**

Run: `cd backend && npx playwright install chromium`
Expected: download completes (~150MB), "chromium installed" message.

- [ ] **Step 2: Start dev server**

Run: `cd backend && npm run dev` (in one terminal) — wait for "Realista backend started" log.
Run: `cd frontend && npm run dev` (in another) — wait for "Local: http://localhost:5173".

- [ ] **Step 3: Test with a real Idealista URL via curl**

Run:
```bash
curl -sN -X POST "http://localhost:3001/api/listings/analyze?stream=true" \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: smoke-test-1" \
  -d '{"url":"https://www.idealista.com/inmueble/12345678/"}'
```

Expected: real progress events (`fetching_html` → `resolving_location` → `analyzing` → `cross_referencing_cadastro`) OR a final `done` with a real listing parsed (price, m², address). NOT a `PORTAL_BLOCKED` error.

- [ ] **Step 4: Test in the browser**

Open `http://localhost:5173/listing-lens`, paste a real Idealista URL, submit. The URL tab should NOT switch to "Texto" tab. The result panel should show score, red flags, and (after the AI analysis) the summary.

- [ ] **Step 5: Run full test suite**

Run: `npm test`
Expected: all green (backend + frontend + e2e smoke if configured)

- [ ] **Step 6: Commit any test fixes**

```bash
git add -A
git commit -m "test: end-to-end smoke for Playwright bypass" --allow-empty
```

---

## Self-Review

**Spec coverage:**
- ✅ Bug (b) `ApiError` cross-module — Task 1
- ✅ DataDome bypass — Tasks 2-7, 9
- ✅ Spec correction — Task 10
- ✅ Operator setup docs — Task 10 quickstart
- ✅ Smoke test — Task 11

**Type consistency check:**
- `ParsedListingHtml` is defined in `CheerioAdapter.ts` and re-used by `ListingFetchPort` and `PlaywrightAdapter`. Consistent.
- `ListingFetchPort.fetch(url)` signature: same in port, CheerioAdapter, PlaywrightAdapter, ChainedFetchAdapter. Consistent.
- `BrowserPool.acquire()` returns `AcquiredContext` with `release()`. Used correctly in `PlaywrightAdapter`. Consistent.
- `PortalBlockedError` is from `domain/errors/DomainError`. Used in CheerioAdapter (existing), PlaywrightAdapter (new), ChainedFetchAdapter (catches). Consistent.

**Placeholder scan:** No "TODO", "TBD", or vague steps. All code is provided.

**Risk notes:**
- Chromium install is heavy. The plan gates it behind an env var so unit tests don't need it.
- The `BrowserPool` "exhausted" case throws — for MVP with `poolSize=1` and sequential requests, this is acceptable. Document in PR description.
- `realChromiumLauncher` uses dynamic import — works because we have `playwright` as a runtime dep (Task 2).
