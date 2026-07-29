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
import type { ParsedListingHtml } from '../../domain/value-objects/ParsedListingHtml';
import { BrowserPool } from './BrowserPool';

// Markers DataDome injects in its captcha challenge page. Any of these in the
// returned HTML means we got a challenge, not the listing — treat as blocked.
const CAPTCHA_HTML_MARKERS: readonly string[] = [
  'captcha-delivery.com',
  'DataDome CAPTCHA',
  'x-datadome',
];

// A real listing has description, features, location… easily >500 chars.
// Below this threshold, the page is either a captcha, 404, or stripped page
// — none of which the LLM can analyze usefully.
const MIN_LISTING_TEXT_LENGTH = 200;

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

    const acquired = await this.pool.acquire({ userAgent: this.userAgent });
    try {
      const page = await acquired.context.newPage();
      try {
        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: this.gotoTimeoutMs });
        } catch (err) {
          // Still blocked (DataDome interstitial, infinite challenge, timeout).
          // Treat as PORTAL_BLOCKED so the UI offers manual paste.
          throw new PortalBlockedError(parsedUrl.hostname);
        }
        const html = await page.content();
        if (this.looksLikeCaptchaChallenge(html)) {
          throw new PortalBlockedError(parsedUrl.hostname);
        }
        const parsed = this.parse(html, url);
        if (parsed.text.trim().length < MIN_LISTING_TEXT_LENGTH) {
          throw new PortalBlockedError(parsedUrl.hostname);
        }
        return parsed;
      } finally {
        await page.close().catch(() => undefined);
      }
    } finally {
      await acquired.release();
    }
  }

  private looksLikeCaptchaChallenge(html: string): boolean {
    return CAPTCHA_HTML_MARKERS.some((marker) => html.includes(marker));
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
