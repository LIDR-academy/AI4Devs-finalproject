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
