/**
 * CheerioAdapter — HTML parsing + server-side fetch (T032).
 * FR-001: parseo HTML ligero en servidor. FR-027: .m. fallback for blocked portals.
 */
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { URL } from 'url';
import { env } from '../../infrastructure/config/env';
import { BROWSER_HEADERS, isAllowedPortal } from '../../infrastructure/utils/urlValidator';
import { PortalBlockedError } from '../../domain/errors/DomainError';
import type { ListingFetchPort } from '../../domain/ports/ListingFetchPort';

export interface ParsedListingHtml {
  url: string;
  html: string;
  text: string;
  declaredAddress?: string;
  declaredNeighbourhood?: string;
  declaredCity?: string;
  price?: number;
  squareMeters?: number;
  rooms?: number;
  yearBuilt?: number;
  energyCertificate?: string;
}

interface PortalHealthRecord {
  domain: string;
  consecutiveFailures: number;
  status: 'OK' | 'THROTTLED' | 'BLOCKED' | 'CONFIRMED_BLOCKED';
}

export class CheerioAdapter implements ListingFetchPort {
  // Lightweight in-memory portal health (FR-027 subset; full impl in PortalHealthCheckAdapter)
  private static health = new Map<string, PortalHealthRecord>();

  async fetch(url: string): Promise<ParsedListingHtml> {
    const parsedUrl = new URL(url);
    if (!isAllowedPortal(parsedUrl.hostname)) {
      throw new PortalBlockedError(parsedUrl.hostname);
    }

    const health = CheerioAdapter.health.get(parsedUrl.hostname);
    let html = await this.tryFetch(url, parsedUrl.hostname);

    if (!html && health?.status !== 'CONFIRMED_BLOCKED') {
      const mobileUrl = url.replace(/^https?:\/\//, 'https://m.').replace(/:\/\/m\.m\./, '://m.');
      try {
        html = await this.tryFetch(mobileUrl, parsedUrl.hostname);
      } catch {
        // ignore — fall through to error
      }
    }

    if (!html) {
      throw new PortalBlockedError(parsedUrl.hostname);
    }

    return this.parse(html, url);
  }

  private async tryFetch(url: string, domain: string): Promise<string | null> {
    const maxAttempts = 4;
    const backoffMs = [0, 1000, 2000, 4000];

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (backoffMs[attempt] > 0) {
        await this.sleep(backoffMs[attempt]);
      }
      try {
        const res = await fetch(url, {
          headers: BROWSER_HEADERS,
          redirect: 'follow',
          signal: AbortSignal.timeout(env.NODE_ENV === 'test' ? 2000 : 10000),
        });
        if (!res.ok) {
          if (res.status >= 400 && res.status < 500) {
            this.recordFailure(domain);
            return null;
          }
          this.recordFailure(domain);
          continue;
        }
        this.recordSuccess(domain);
        return await res.text();
      } catch (err) {
        this.recordFailure(domain);
      }
    }
    return null;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private recordFailure(domain: string): void {
    const existing = CheerioAdapter.health.get(domain) ?? {
      domain,
      consecutiveFailures: 0,
      status: 'OK' as const,
    };
    existing.consecutiveFailures += 1;
    if (existing.consecutiveFailures >= 5) existing.status = 'CONFIRMED_BLOCKED';
    else if (existing.consecutiveFailures >= 3) existing.status = 'BLOCKED';
    CheerioAdapter.health.set(domain, existing);
  }

  private recordSuccess(domain: string): void {
    CheerioAdapter.health.set(domain, {
      domain,
      consecutiveFailures: 0,
      status: 'OK',
    });
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

    return {
      url,
      html,
      text,
      declaredAddress,
      price,
      squareMeters,
    };
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
