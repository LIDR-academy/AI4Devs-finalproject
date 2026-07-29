/**
 * HiddenCosts value object (T052).
 * ITP (used housing) or IVA (new housing) + notaría + registro + gestoría + tasación.
 * Tax rates by autonomous community with bonus reductions (FR-004).
 */
import type { Region } from './FinancialProfile';

interface ItpRule {
  general: number;
  joven: { rate: number; maxAge: number; maxPrice?: number } | null;
  vpo: number | null;
  familiaNumerosa: number | null;
}

const ITP_RULES: Record<Region, ItpRule> = {
  Andalucía:       { general: 0.07, joven: { rate: 0.035, maxAge: 35 }, vpo: 0.035, familiaNumerosa: 0.035 },
  Aragón:          { general: 0.08, joven: { rate: 0.05,  maxAge: 36 }, vpo: 0.05,  familiaNumerosa: 0.05 },
  Asturias:        { general: 0.08, joven: null,                      vpo: 0.07,  familiaNumerosa: null },
  Baleares:        { general: 0.08, joven: { rate: 0.07,  maxAge: 36, maxPrice: 200000 }, vpo: 0.07, familiaNumerosa: null },
  Canarias:        { general: 0.065, joven: { rate: 0.05,  maxAge: 35, maxPrice: 150000 }, vpo: 0.05, familiaNumerosa: null },
  Cantabria:       { general: 0.08, joven: { rate: 0.04,  maxAge: 40, maxPrice: 300000 }, vpo: 0.05, familiaNumerosa: null },
  'Castilla-La Mancha': { general: 0.09, joven: { rate: 0.03, maxAge: 36 }, vpo: 0.06, familiaNumerosa: 0.06 },
  'Castilla y León':    { general: 0.08, joven: { rate: 0.04, maxAge: 36, maxPrice: 130000 }, vpo: 0.04, familiaNumerosa: null },
  Cataluña:        { general: 0.10, joven: { rate: 0.07,  maxAge: 32, maxPrice: 250000 }, vpo: 0.07,  familiaNumerosa: null },
  'Comunidad Valenciana': { general: 0.10, joven: { rate: 0.08, maxAge: 35 }, vpo: 0.08, familiaNumerosa: null },
  Extremadura:     { general: 0.08, joven: { rate: 0.06,  maxAge: 36 }, vpo: 0.06,  familiaNumerosa: null },
  Galicia:         { general: 0.08, joven: { rate: 0.03,  maxAge: 36 }, vpo: 0.07,  familiaNumerosa: null },
  'La Rioja':      { general: 0.07, joven: { rate: 0.05,  maxAge: 36 }, vpo: 0.05,  familiaNumerosa: null },
  Madrid:          { general: 0.06, joven: { rate: 0.04,  maxAge: 35, maxPrice: 180000 }, vpo: 0.04, familiaNumerosa: null },
  Murcia:          { general: 0.08, joven: { rate: 0.07,  maxAge: 35 }, vpo: 0.07,  familiaNumerosa: null },
  Navarra:         { general: 0.06, joven: { rate: 0.04,  maxAge: 36, maxPrice: 150000 }, vpo: 0.04, familiaNumerosa: null },
  'País Vasco':    { general: 0.07, joven: { rate: 0.025, maxAge: 36 }, vpo: 0.04,  familiaNumerosa: null },
};

export function resolveItpRate(region: Region, opts: { isFirstHome?: boolean; buyerAge?: number; isProtectedHousing?: boolean; propertyPrice?: number }): { rate: number; label: string } {
  const rule = ITP_RULES[region];
  if (!opts.isFirstHome) return { rate: rule.general, label: `${region} (máximo)` };

  if (opts.isProtectedHousing && rule.vpo != null) {
    return { rate: rule.vpo, label: `${region} (VPO)` };
  }

  if (opts.buyerAge != null && rule.joven != null && opts.buyerAge < rule.joven.maxAge) {
    const joven = rule.joven;
    if (joven.maxPrice != null && opts.propertyPrice != null && opts.propertyPrice > joven.maxPrice) {
      return { rate: rule.general, label: `${region} (máximo, precio excede límite joven)` };
    }
    return { rate: joven.rate, label: `${region} (joven <${joven.maxAge})` };
  }

  return { rate: rule.general, label: `${region} (máximo)` };
}

const IVA_NEW_HOUSING = 0.1;
const NOTARIA_FACTOR = 0.0045;
const REGISTRO_FACTOR = 0.0025;
const GESTORIA_FLAT = 350;
const TASACION_FLAT = 350;

export class HiddenCosts {
  private constructor(
    public readonly itpOrIva: number,
    public readonly notaria: number,
    public readonly registro: number,
    public readonly gestoria: number,
    public readonly tasacion: number,
    public readonly total: number,
    public readonly breakdown: { concept: string; amount: number }[],
  ) {}

  static calculate(
    price: number,
    region: Region,
    isNewHousing: boolean,
    opts?: { isFirstHome?: boolean; buyerAge?: number; isProtectedHousing?: boolean },
  ): HiddenCosts {
    if (price <= 0) throw new Error('Price must be positive');
    const itp = isNewHousing
      ? { rate: IVA_NEW_HOUSING, label: 'IVA (vivienda nueva)' }
      : resolveItpRate(region, { ...opts, propertyPrice: price });
    const itpAmount = price * itp.rate;
    const notaria = Math.min(price * NOTARIA_FACTOR, 1500);
    const registro = Math.min(price * REGISTRO_FACTOR, 1000);
    const gestoria = GESTORIA_FLAT;
    const tasacion = TASACION_FLAT;
    const total = itpAmount + notaria + registro + gestoria + tasacion;
    return new HiddenCosts(itpAmount, notaria, registro, gestoria, tasacion, total, [
      { concept: `ITP ${itp.label}`, amount: itpAmount },
      { concept: 'Notaría', amount: notaria },
      { concept: 'Registro', amount: registro },
      { concept: 'Gestoría', amount: gestoria },
      { concept: 'Tasación', amount: tasacion },
    ]);
  }

  toJSON(): Record<string, unknown> {
    return {
      itpOrIva: this.itpOrIva,
      notaria: this.notaria,
      registro: this.registro,
      gestoria: this.gestoria,
      tasacion: this.tasacion,
      total: this.total,
      breakdown: this.breakdown,
    };
  }
}
