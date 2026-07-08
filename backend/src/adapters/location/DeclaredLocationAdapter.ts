/**
 * DeclaredLocationAdapter (T032a, FR-016).
 * Extracts address/neighbourhood/city from the listing HTML.
 * Pure function (no I/O) — receives parsed HTML from CheerioAdapter.
 */
import * as cheerio from 'cheerio';

export class DeclaredLocationAdapter {
  extract(html: string): { address?: string; neighbourhood?: string; city?: string } {
    const $ = cheerio.load(html);

    const address =
      $('[itemprop="streetAddress"]').first().text().trim() ||
      $('[class*="address" i]').first().text().trim() ||
      $('[class*="ubicacion" i]').first().text().trim() ||
      undefined;

    const neighbourhood =
      $('[itemprop="addressLocality"]').first().text().trim() ||
      $('[class*="neighbourhood" i], [class*="barrio" i]').first().text().trim() ||
      undefined;

    const city =
      $('[itemprop="addressRegion"]').first().text().trim() ||
      $('[class*="city" i], [class*="municipio" i]').first().text().trim() ||
      undefined;

    return {
      address: address || undefined,
      neighbourhood: neighbourhood || undefined,
      city: city || undefined,
    };
  }
}
