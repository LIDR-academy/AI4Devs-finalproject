/**
 * HiddenCosts value object (T052).
 * ITP (used housing) or IVA (new housing) + notaría + registro + gestoría + tasación.
 * Tax rates by autonomous community (FR-004).
 */
import type { Region } from './FinancialProfile';

const ITP_RATES: Record<Region, number> = {
  Andalucía: 0.07,
  Aragón: 0.08,
  Asturias: 0.08,
  Baleares: 0.08,
  Canarias: 0.065,
  Cantabria: 0.08,
  'Castilla-La Mancha': 0.09,
  'Castilla y León': 0.08,
  Cataluña: 0.1,
  'Comunidad Valenciana': 0.1,
  Extremadura: 0.08,
  Galicia: 0.09,
  'La Rioja': 0.07,
  Madrid: 0.06,
  Murcia: 0.08,
  Navarra: 0.06,
  'País Vasco': 0.07,
};

const IVA_NEW_HOUSING = 0.1; // 10% for new housing
const NOTARIA_FACTOR = 0.0045; // ~0.45% of price, capped
const REGISTRO_FACTOR = 0.0025; // ~0.25% of price
const GESTORIA_FLAT = 350; // EUR
const TASACION_FLAT = 350; // EUR

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

  static calculate(price: number, region: Region, isNewHousing: boolean): HiddenCosts {
    if (price <= 0) throw new Error('Price must be positive');
    const itpOrIva = isNewHousing ? price * IVA_NEW_HOUSING : price * ITP_RATES[region];
    const notaria = Math.min(price * NOTARIA_FACTOR, 1500);
    const registro = Math.min(price * REGISTRO_FACTOR, 1000);
    const gestoria = GESTORIA_FLAT;
    const tasacion = TASACION_FLAT;
    const total = itpOrIva + notaria + registro + gestoria + tasacion;
    return new HiddenCosts(itpOrIva, notaria, registro, gestoria, tasacion, total, [
      { concept: isNewHousing ? 'IVA (vivienda nueva)' : `ITP (${region})`, amount: itpOrIva },
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
