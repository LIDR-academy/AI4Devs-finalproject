/**
 * LocationResolver service — chains DeclaredLocationAdapter + GeocodingAdapter
 * to produce Coordinates. Implements the LocationResolverPort.
 *
 * This service is in the domain because it composes adapters without any
 * orchestration logic — it's pure delegation. The use case depends on the
 * LocationResolverPort interface, not on the individual adapters.
 */
import { Coordinates } from '../value-objects/Coordinates';
import type { LocationResolverPort, ParsedListing } from '../ports/LocationResolverPort';
import { GeocodingAdapter } from '../../adapters/location/GeocodingAdapter';

export class LocationResolver implements LocationResolverPort {
  constructor(private readonly geocoding: GeocodingAdapter = new GeocodingAdapter()) {}

  async resolveLocation(parsed: ParsedListing): Promise<Coordinates | null> {
    const declaredLoc = parsed.declaredAddress
      ? { address: parsed.declaredAddress }
      : null;
    if (!declaredLoc) return null;
    return this.geocoding.geocode(declaredLoc.address);
  }
}
