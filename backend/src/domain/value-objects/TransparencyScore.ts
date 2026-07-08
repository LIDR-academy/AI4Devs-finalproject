/**
 * TransparencyScore value object (T028, FR-018, FR-025).
 * 0-100, with a label and optional breakdown by category.
 */
export type TransparencyLabel = 'baja' | 'media' | 'alta' | 'excelente';

export interface ScoreBreakdownItem {
  category: string;
  score: number;
  weight: number;
}

export class TransparencyScore {
  private constructor(
    public readonly value: number,
    public readonly label: TransparencyLabel,
    public readonly breakdown: ScoreBreakdownItem[] = [],
  ) {}

  static create(value: number, breakdown: ScoreBreakdownItem[] = []): TransparencyScore {
    if (!Number.isInteger(value) || value < 0 || value > 100) {
      throw new Error('TransparencyScore must be an integer between 0 and 100');
    }
    return new TransparencyScore(value, this.deriveLabel(value), breakdown);
  }

  static fromLabel(label: TransparencyLabel): TransparencyScore {
    const midpoints: Record<TransparencyLabel, number> = {
      baja: 25,
      media: 55,
      alta: 80,
      excelente: 95,
    };
    return new TransparencyScore(midpoints[label], label);
  }

  private static deriveLabel(value: number): TransparencyLabel {
    if (value >= 90) return 'excelente';
    if (value >= 70) return 'alta';
    if (value >= 50) return 'media';
    return 'baja';
  }

  toJSON(): { value: number; label: TransparencyLabel; breakdown: ScoreBreakdownItem[] } {
    return { value: this.value, label: this.label, breakdown: this.breakdown };
  }
}
