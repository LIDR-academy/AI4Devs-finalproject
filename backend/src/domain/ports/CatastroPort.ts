/**
 * CatastroPort (T031).
 * Adapter: CatastroAdapter. Cross-references coordinates with cadastral data.
 */
import type { Coordinates } from '../value-objects/Coordinates';

export interface CatastroMatch {
  cadastralReference: string;
  officialSquareMeters: number;
  yearBuilt: number | null;
  address: string;
  matched: boolean;
}

export interface CatastroPort {
  lookup(coordinates: Coordinates, declaredAddress?: string): Promise<CatastroMatch | null>;
}
