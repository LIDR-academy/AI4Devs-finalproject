/**
 * BureaucraticMilestone value object (US5 Timeline).
 * One stage in the home-buying process with duration and required documents.
 */
export type BureaucraticStage =
  | 'PRE_ARRAS'
  | 'ARRAS'
  | 'DUE_DILIGENCE'
  | 'PRE_ESCRITURA'
  | 'ESCRITURA'
  | 'POST_ESCRITURA';

export class BureaucraticMilestone {
  private constructor(
    public readonly stage: BureaucraticStage,
    public readonly title: string,
    public readonly description: string,
    public readonly estimatedDays: number,
    public readonly documentsNeeded: string[],
  ) {}

  static create(input: {
    stage: BureaucraticStage;
    title: string;
    description: string;
    estimatedDays: number;
    documentsNeeded: string[];
  }): BureaucraticMilestone {
    if (input.estimatedDays < 0) throw new Error('Days must be non-negative');
    return new BureaucraticMilestone(
      input.stage,
      input.title,
      input.description,
      input.estimatedDays,
      input.documentsNeeded,
    );
  }
}
