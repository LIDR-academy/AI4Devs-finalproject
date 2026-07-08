/**
 * LocationResolverPort (T030a, FR-016).
 * Chain: DeclaredLocationAdapter → GeocodingAdapter.
 * Returns Coordinates or null if no address can be resolved.
 */
import type { Coordinates } from '../value-objects/Coordinates';

export interface ParsedListing {
  url: string;
  rawHtml?: string; // only in adapter; domain should not receive this
  declaredAddress?: string;
  declaredNeighbourhood?: string;
  declaredCity?: string;
}

export interface LocationResolverPort {
  resolveLocation(parsed: ParsedListing): Promise<Coordinates | null>;
}
