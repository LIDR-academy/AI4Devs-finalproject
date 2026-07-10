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
