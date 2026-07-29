/**
 * LocationResolver service — delegates to GeocodingAdapter to produce Coordinates.
 * Implements the LocationResolverPort.
 *
 * Known: imports concrete GeocodingAdapter instead of depending on a port interface.
 * This violates hexagonal architecture (domain depends on adapter). Acceptable for MVP.
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
