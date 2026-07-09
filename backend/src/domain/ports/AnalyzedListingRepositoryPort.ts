/**
 * AnalyzedListingRepositoryPort — domain-side interface for persisting
 * analyzed listings and reading them back. Defined in domain so the
 * use case can depend on the abstraction, not on Prisma.
 */
import type { RedFlagItem } from '../value-objects/RedFlags';
import type { Coordinates } from '../value-objects/Coordinates';
import type { CatastroMatch } from './CatastroPort';

export type ListingDiffResult =
  | { changedAt: string }
  | {
      unchanged: boolean;
      priceDelta?: number;
      squareMetersDelta?: number;
      yearBuiltChanged?: boolean;
      addedRedFlags: { flag: string; severity: string; reasoning: string }[];
      removedRedFlags: { flag: string; severity: string; reasoning: string }[];
    };

export interface CreateAnalyzedListingInput {
  processId: string;
  url: string;
  sourceHash: string;
  previousHash: string | null;
  diff: ListingDiffResult | null;
  transparencyScore: number;
  scoreLabel: 'baja' | 'media' | 'alta' | 'excelente';
  omissions: string[];
  positiveSignals: string[];
  summary: string;
  declaredAddress: string | null;
  coordinates: Coordinates | null;
  catastroMatch: CatastroMatch | null;
  redFlags: RedFlagItem[];
}

export interface StoredAnalyzedListing {
  id: string;
  processId: string;
  url: string;
  sourceHash: string;
  previousHash: string | null;
  diff: ListingDiffResult | null;
  transparencyScore: number;
  scoreLabel: string;
  omissions: unknown;
  positiveSignals: unknown;
  summary: string | null;
  declaredAddress: string | null;
  coordinates: unknown;
  catastroMatch: unknown;
  createdAt: Date;
  redFlags: { id: string; flag: string; severity: string; reasoning: string }[];
}

export interface AnalyzedListingRepositoryPort {
  create(input: CreateAnalyzedListingInput): Promise<StoredAnalyzedListing>;
  findPreviousByUrl(processId: string, url: string): Promise<StoredAnalyzedListing | null>;
  findById(id: string, userId: string): Promise<StoredAnalyzedListing | null>;
}
