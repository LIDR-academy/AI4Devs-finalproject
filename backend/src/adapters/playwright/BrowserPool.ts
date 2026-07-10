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

  async acquire(opts?: { userAgent?: string }): Promise<AcquiredContext> {
    if (this.shuttingDown) throw new Error('BrowserPool is shutting down');

    const slot = await this.pickOrLaunchSlot();
    const context = await slot.browser.newContext({ userAgent: opts?.userAgent });

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
    // Remove from slots array so the array does not grow unbounded across
    // idle close cycles in a long-lived server. `slots` is a `readonly`
    // field reference, so splice (in-place) is required.
    const idx = this.slots.indexOf(slot);
    if (idx >= 0) this.slots.splice(idx, 1);
  }
}
