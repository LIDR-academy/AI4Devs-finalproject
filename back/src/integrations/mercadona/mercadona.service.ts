import { Injectable, Logger } from "@nestjs/common";
import { normalizeMercadonaQuery } from "./normalize";

// Algolia credentials are public (embedded in Mercadona's JS bundle served to all users)
const ALGOLIA_APP_ID = "REDACTED_ALGOLIA_APP_ID";
const ALGOLIA_API_KEY = "REDACTED_ALGOLIA_API_KEY";
const ALGOLIA_INDEX = "products_prod_vlc1_es";
const ALGOLIA_URL = `https://${ALGOLIA_APP_ID.toLowerCase()}-dsn.algolia.net/1/indexes/${ALGOLIA_INDEX}/query`;
const TTL_MS = 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 3000;

export interface MercadonaProduct {
  productName: string;
  priceEur: string;
  unit: string;
  fetchedAt: Date;
  source: "MERCADONA_LIVE" | "MERCADONA_CACHED";
}

interface CacheEntry {
  productName: string;
  priceEur: string;
  unit: string;
  fetchedAt: Date;
  expiresAt: number;
}

interface AlgoliaHit {
  display_name: string;
  price_instructions: {
    reference_price: string;
    reference_format: string;
  };
}

interface AlgoliaResponse {
  hits?: AlgoliaHit[];
}

@Injectable()
export class MercadonaService {
  private readonly logger = new Logger(MercadonaService.name);
  private readonly cache = new Map<string, CacheEntry>();

  async searchProduct(rawName: string): Promise<MercadonaProduct | null> {
    const normalizedName = normalizeMercadonaQuery(rawName);
    if (!normalizedName) {
      return null;
    }

    const cacheKey = `mercadona:${normalizedName}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return {
        productName: cached.productName,
        priceEur: cached.priceEur,
        unit: cached.unit,
        fetchedAt: cached.fetchedAt,
        source: "MERCADONA_CACHED",
      };
    }

    const product = await this.fetchFromMercadona(normalizedName);
    if (product) {
      this.cache.set(cacheKey, {
        productName: product.productName,
        priceEur: product.priceEur,
        unit: product.unit,
        fetchedAt: product.fetchedAt,
        expiresAt: Date.now() + TTL_MS,
      });
    }
    return product;
  }

  private async fetchFromMercadona(query: string): Promise<MercadonaProduct | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(ALGOLIA_URL, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "X-Algolia-Application-Id": ALGOLIA_APP_ID,
          "X-Algolia-API-Key": ALGOLIA_API_KEY,
        },
        body: JSON.stringify({ query, hitsPerPage: 5 }),
      });

      if (!response.ok) {
        this.logger.warn(`Mercadona Algolia responded with ${response.status} for query "${query}"`);
        return null;
      }

      const data = (await response.json()) as AlgoliaResponse;
      const hits = data.hits ?? [];

      if (hits.length === 0) {
        return null;
      }

      const first = hits[0];
      const priceNum = parseFloat(first.price_instructions.reference_price);

      if (isNaN(priceNum) || priceNum <= 0) {
        return null;
      }

      return {
        productName: first.display_name,
        priceEur: priceNum.toFixed(2),
        unit: first.price_instructions.reference_format,
        fetchedAt: new Date(),
        source: "MERCADONA_LIVE",
      };
    } catch (err) {
      this.logger.warn(`Mercadona fetch failed for "${query}": ${(err as Error).message}`);
      return null;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
