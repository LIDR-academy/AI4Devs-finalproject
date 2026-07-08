/**
 * FinancialProfile value object (T051).
 * Captures the user's financial situation for the Mortgage Compass.
 */
export type Region =
  | 'Andalucía'
  | 'Aragón'
  | 'Asturias'
  | 'Baleares'
  | 'Canarias'
  | 'Cantabria'
  | 'Castilla-La Mancha'
  | 'Castilla y León'
  | 'Cataluña'
  | 'Comunidad Valenciana'
  | 'Extremadura'
  | 'Galicia'
  | 'La Rioja'
  | 'Madrid'
  | 'Murcia'
  | 'Navarra'
  | 'País Vasco';

export type Persona = 'conservador' | 'equilibrado' | 'arriesgado';

export class FinancialProfile {
  private constructor(
    public readonly savings: number,
    public readonly monthlyIncome: number,
    public readonly existingDebts: number,
    public readonly region: Region,
    public readonly persona: Persona | null,
  ) {}

  static create(input: {
    savings: number;
    monthlyIncome: number;
    existingDebts: number;
    region: string;
    persona?: Persona;
  }): FinancialProfile {
    if (input.savings < 0) throw new Error('Savings must be non-negative');
    if (input.monthlyIncome < 0) throw new Error('Income must be non-negative');
    if (input.existingDebts < 0) throw new Error('Debts must be non-negative');
    if (input.region.length < 2) throw new Error('Region required');
    return new FinancialProfile(
      input.savings,
      input.monthlyIncome,
      input.existingDebts,
      input.region as Region,
      input.persona ?? null,
    );
  }

  toJSON(): Record<string, unknown> {
    return {
      savings: this.savings,
      monthlyIncome: this.monthlyIncome,
      existingDebts: this.existingDebts,
      region: this.region,
      persona: this.persona,
    };
  }
}
