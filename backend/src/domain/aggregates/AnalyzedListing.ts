/**
 * AnalyzedListing aggregate. FR-011: no HTML/text stored.
 */
import { TransparencyScore } from '../value-objects/TransparencyScore';
import { RedFlags, type RedFlagItem } from '../value-objects/RedFlags';

export class AnalyzedListing {
  private constructor(
    public readonly id: string,
    public readonly processId: string,
    public readonly url: string,
    public readonly sourceHash: string,
    public readonly previousHash: string | null,
    public readonly transparencyScore: TransparencyScore,
    public readonly redFlags: RedFlags,
    public readonly summary: string | null,
    public readonly declaredAddress: string | null,
    public readonly createdAt: Date,
  ) {}

  static fromPrisma(row: {
    id: string;
    processId: string;
    url: string;
    sourceHash: string;
    previousHash: string | null;
    transparencyScore: number;
    scoreLabel: string;
    summary: string | null;
    declaredAddress: string | null;
    createdAt: Date;
    redFlags: { flag: string; severity: string; reasoning: string }[];
  }): AnalyzedListing {
    return new AnalyzedListing(
      row.id,
      row.processId,
      row.url,
      row.sourceHash,
      row.previousHash,
      TransparencyScore.create(row.transparencyScore),
      RedFlags.create(
        row.redFlags.map((f) => ({
          flag: f.flag as RedFlagItem['flag'],
          severity: f.severity as RedFlagItem['severity'],
          reasoning: f.reasoning,
        })),
      ),
      row.summary,
      row.declaredAddress,
      row.createdAt,
    );
  }
}
