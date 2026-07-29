/**
 * RedFlags value object (T029).
 * Closed set of flag types; each flag has a severity and a reasoning string
 * (FR-025: must include the exact phrase from the listing).
 */

export const RED_FLAG_TYPES = [
  'euphemistic_language',
  'vague_location',
  'missing_energy_certificate',
  'inflated_square_meters',
  'no_floor_plan',
  'suspicious_price',
  'stale_listing',
  'missing_community_costs',
  'hidden_fees_mentioned',
  'photos_mismatch',
  'missing_year_built',
  'missing_orientation',
] as const;

export type RedFlagType = (typeof RED_FLAG_TYPES)[number];
export type RedFlagSeverity = 'low' | 'medium' | 'high';

export interface RedFlagItem {
  flag: RedFlagType;
  severity: RedFlagSeverity;
  reasoning: string;
}

export const RED_FLAG_LABELS_ES: Record<RedFlagType, string> = {
  euphemistic_language: 'Lenguaje eufemístico',
  vague_location: 'Ubicación vaga',
  missing_energy_certificate: 'Sin certificado energético',
  inflated_square_meters: 'Metros cuadrados inflados',
  no_floor_plan: 'Sin plano',
  suspicious_price: 'Precio sospechoso',
  stale_listing: 'Anuncio antiguo',
  missing_community_costs: 'Gastos de comunidad no especificados',
  hidden_fees_mentioned: 'Cargos ocultos mencionados',
  photos_mismatch: 'Fotos inconsistentes',
  missing_year_built: 'Año de construcción no indicado',
  missing_orientation: 'Orientación no indicada',
};

export class RedFlags {
  private constructor(public readonly items: RedFlagItem[]) {}

  static create(items: RedFlagItem[]): RedFlags {
    for (const item of items) {
      if (!RED_FLAG_TYPES.includes(item.flag)) {
        throw new Error(`Unknown red flag type: ${item.flag}`);
      }
      if (item.reasoning.length < 10) {
        throw new Error('Red flag reasoning must be at least 10 characters');
      }
    }
    return new RedFlags(items);
  }

  static empty(): RedFlags {
    return new RedFlags([]);
  }

  get count(): number {
    return this.items.length;
  }

  byFlag(flag: RedFlagType): RedFlagItem[] {
    return this.items.filter((i) => i.flag === flag);
  }

  toJSON(): RedFlagItem[] {
    return this.items;
  }
}
