/**
 * GeocodingAdapter (T032b, FR-016).
 * Nominatim (OSM) — free, no API key. 1 req/sec rate limit.
 */
import fetch from 'node-fetch';
import { env } from '../../infrastructure/config/env';
import { REALISTA_USER_AGENT } from '../../infrastructure/utils/urlValidator';
import { Coordinates } from '../../domain/value-objects/Coordinates';

export class GeocodingAdapter {
  private lastCall = 0;
  private readonly minIntervalMs = 1100;

  async geocode(query: string): Promise<Coordinates | null> {
    if (!query) return null;

    const now = Date.now();
    const wait = this.minIntervalMs - (now - this.lastCall);
    if (wait > 0) {
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
    this.lastCall = Date.now();

    if (env.NODE_ENV === 'test' || process.env.MOCK_NOMINATIM === 'true') {
      return Coordinates.create(40.4168, -3.7038, 'geocoded', 0.9);
    }

    try {
      const url = new URL(`${env.NOMINATIM_BASE_URL}/search`);
      url.searchParams.set('q', query);
      url.searchParams.set('format', 'json');
      url.searchParams.set('limit', '1');
      url.searchParams.set('countrycodes', 'es');

      const res = await fetch(url.toString(), {
        headers: {
          'User-Agent': REALISTA_USER_AGENT,
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) return null;
      const results = (await res.json()) as Array<{ lat: string; lon: string }>;
      if (results.length === 0) return null;

      const [first] = results;
      return Coordinates.create(parseFloat(first.lat), parseFloat(first.lon), 'geocoded', 0.8);
    } catch {
      return null;
    }
  }
}
