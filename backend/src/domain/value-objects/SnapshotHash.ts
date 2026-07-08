/**
 * SnapshotHash value object (T037c, FR-022).
 * SHA-256 of the canonical listing content, used for diff detection on re-analysis.
 */
import { createHash } from 'crypto';

export class SnapshotHash {
  private constructor(public readonly value: string) {}

  static compute(canonicalContent: string): SnapshotHash {
    if (!canonicalContent || canonicalContent.length < 10) {
      throw new Error('Snapshot content must be at least 10 characters');
    }
    const normalised = canonicalContent
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    const hash = createHash('sha256').update(normalised).digest('hex');
    return new SnapshotHash(hash);
  }

  static fromString(hash: string): SnapshotHash {
    if (!/^[a-f0-9]{64}$/.test(hash)) {
      throw new Error('Invalid SHA-256 hash');
    }
    return new SnapshotHash(hash);
  }

  equals(other: SnapshotHash): boolean {
    return this.value === other.value;
  }
}
