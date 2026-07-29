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
    public readonly interestRate: number | null,
    public readonly isFirstHome: boolean,
    public readonly buyerAge: number | null,
    public readonly isProtectedHousing: boolean,
  ) {}

  static create(input: {
    savings: number;
    monthlyIncome: number;
    existingDebts: number;
    region: string;
    persona?: Persona;
    interestRate?: number;
    isFirstHome?: boolean;
    buyerAge?: number;
    isProtectedHousing?: boolean;
  }): FinancialProfile {
    if (input.savings < 0) throw new Error('Savings must be non-negative');
    if (input.monthlyIncome < 0) throw new Error('Income must be non-negative');
    if (input.existingDebts < 0) throw new Error('Debts must be non-negative');
    if (input.region.length < 2) throw new Error('Region required');
    if (input.interestRate !== undefined && input.interestRate < 0) {
      throw new Error('Interest rate must be non-negative');
    }
    if (input.buyerAge !== undefined && (input.buyerAge < 18 || input.buyerAge > 120)) {
      throw new Error('Age must be between 18 and 120');
    }
    return new FinancialProfile(
      input.savings,
      input.monthlyIncome,
      input.existingDebts,
      input.region as Region,
      input.persona ?? null,
      input.interestRate ?? null,
      input.isFirstHome ?? false,
      input.buyerAge ?? null,
      input.isProtectedHousing ?? false,
    );
  }

  toJSON(): Record<string, unknown> {
    return {
      savings: this.savings,
      monthlyIncome: this.monthlyIncome,
      existingDebts: this.existingDebts,
      region: this.region,
      persona: this.persona,
      interestRate: this.interestRate,
      isFirstHome: this.isFirstHome,
      buyerAge: this.buyerAge,
      isProtectedHousing: this.isProtectedHousing,
    };
  }

  /**
   * Reconstruct a FinancialProfile from a Prisma JSON column.
   * Centralizes the type cast so call sites don't need `as never`.
   */
  static fromPrisma(json: unknown): FinancialProfile {
    return FinancialProfile.create(json as Parameters<typeof FinancialProfile.create>[0]);
  }
}
