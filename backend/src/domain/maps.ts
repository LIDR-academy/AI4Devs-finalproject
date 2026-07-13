export function buildMapsUrl(latitude: number, longitude: number): string {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error('Coordinates must be finite numbers');
  }

  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

