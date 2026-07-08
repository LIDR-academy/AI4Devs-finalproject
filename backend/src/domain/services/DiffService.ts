/**
 * DiffService (T037d, FR-022).
 * Computes the diff between two listing analyses.
 */
import { SnapshotHash } from '../value-objects/SnapshotHash';
import type { RedFlagType, RedFlagSeverity } from '../value-objects/RedFlags';

export interface SnapshotInput {
  hash: string;
  price?: number;
  squareMeters?: number;
  yearBuilt?: number | null;
  redFlags: { flag: RedFlagType; severity: RedFlagSeverity; reasoning: string }[];
}

export interface DiffResult {
  unchanged: boolean;
  priceDelta?: number;
  squareMetersDelta?: number;
  yearBuiltChanged?: boolean;
  addedRedFlags: { flag: RedFlagType; severity: RedFlagSeverity; reasoning: string }[];
  removedRedFlags: { flag: RedFlagType; severity: RedFlagSeverity; reasoning: string }[];
}

export class DiffService {
  diff(previous: SnapshotInput, current: SnapshotInput): DiffResult {
    const sameHash = SnapshotHash.fromString(previous.hash).equals(
      SnapshotHash.fromString(current.hash),
    );
    if (sameHash) {
      return { unchanged: true, addedRedFlags: [], removedRedFlags: [] };
    }

    const prevFlags = new Map(previous.redFlags.map((f) => [f.flag + '|' + f.reasoning, f]));
    const currFlags = new Map(current.redFlags.map((f) => [f.flag + '|' + f.reasoning, f]));

    const added = current.redFlags.filter((f) => !prevFlags.has(f.flag + '|' + f.reasoning));
    const removed = previous.redFlags.filter((f) => !currFlags.has(f.flag + '|' + f.reasoning));

    return {
      unchanged: false,
      priceDelta:
        previous.price !== undefined && current.price !== undefined
          ? current.price - previous.price
          : undefined,
      squareMetersDelta:
        previous.squareMeters !== undefined && current.squareMeters !== undefined
          ? current.squareMeters - previous.squareMeters
          : undefined,
      yearBuiltChanged: previous.yearBuilt !== current.yearBuilt,
      addedRedFlags: added,
      removedRedFlags: removed,
    };
  }
}
