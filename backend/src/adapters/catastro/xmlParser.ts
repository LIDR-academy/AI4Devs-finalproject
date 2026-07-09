/**
 * parseCatastroXml — pure parser for the Sede Electrónica del Catastro XML
 * response. Extracts superficie and antiguedad. No IO, no side effects.
 * Returns null on any parse failure (graceful degradation per FR-003).
 */
import { XMLParser } from 'fast-xml-parser';

export interface CatastroParseResult {
  matched: boolean;
  officialSquareMeters: number;
  yearBuilt: number | null;
  address: string;
  cadastralReference: string;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  isArray: (name) => name === 'lcons' || name === 'cons',
});

export function parseCatastroXml(xml: string, declaredAddress: string): CatastroParseResult | null {
  try {
    type ConsUnit = { superficie?: string; antiguedad?: string };
    type LconsWrapper = { lcons?: LconsWrapper[]; cons?: ConsUnit[] };
    const parsed = parser.parse(xml) as {
      consulta_dnp?: {
        control?: { cucta?: string };
        lcons?: LconsWrapper[];
      };
    };

    const root = parsed.consulta_dnp;
    if (!root) return null;

    const ref = root.control?.cucta ?? 'UNKNOWN';
    const consUnits =
      root.lcons?.flatMap((b) => b.lcons?.flatMap((c) => c.cons ?? []) ?? []) ?? [];

    if (consUnits.length === 0) return null;

    const officialSquareMeters = consUnits.reduce((sum, u) => {
      const s = Number.parseInt(u.superficie ?? '0', 10);
      return sum + (Number.isFinite(s) ? s : 0);
    }, 0);

    const years = consUnits
      .map((u) => Number.parseInt(u.antiguedad ?? '0', 10))
      .filter((y) => Number.isFinite(y) && y > 0);
    const yearBuilt = years.length > 0 ? Math.min(...years) : null;

    return {
      matched: true,
      officialSquareMeters,
      yearBuilt,
      address: declaredAddress,
      cadastralReference: ref,
    };
  } catch {
    return null;
  }
}
