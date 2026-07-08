/**
 * Coordinates value object (T030b, FR-016).
 * Simplified: only 'declared' or 'geocoded' sources (no LLM vision per FR-016).
 */
export type CoordinateSource = 'declared' | 'geocoded';

export class Coordinates {
  private constructor(
    public readonly lat: number,
    public readonly lng: number,
    public readonly source: CoordinateSource,
    public readonly confidence: number,
  ) {}

  static create(lat: number, lng: number, source: CoordinateSource, confidence = 1.0): Coordinates {
    if (lat < -90 || lat > 90) throw new Error('Invalid latitude');
    if (lng < -180 || lng > 180) throw new Error('Invalid longitude');
    if (confidence < 0 || confidence > 1) throw new Error('Confidence must be 0-1');
    return new Coordinates(lat, lng, source, confidence);
  }

  toJSON(): { lat: number; lng: number; source: CoordinateSource; confidence: number } {
    return { lat: this.lat, lng: this.lng, source: this.source, confidence: this.confidence };
  }
}
