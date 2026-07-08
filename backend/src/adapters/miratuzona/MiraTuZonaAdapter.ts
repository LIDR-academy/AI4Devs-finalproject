/**
 * MiraTuZonaAdapter — generates a deep link to a Spanish neighbourhood info site.
 * No real integration; just URL composition.
 */
import type { Coordinates } from '../../domain/value-objects/Coordinates';

export class MiraTuZonaAdapter {
  buildLink(coords: Coordinates | null, address?: string): string {
    const base = 'https://www.miratuzona.es';
    if (coords) {
      return `${base}/buscar?q=${encodeURIComponent(`${coords.lat},${coords.lng}`)}`;
    }
    if (address) {
      return `${base}/buscar?q=${encodeURIComponent(address)}`;
    }
    return base;
  }
}
