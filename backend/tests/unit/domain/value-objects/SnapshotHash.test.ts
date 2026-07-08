import { describe, it, expect } from 'vitest';
import { SnapshotHash } from '../../../../src/domain/value-objects/SnapshotHash';

describe('SnapshotHash', () => {
  it('produces a 64-char hex string', () => {
    const hash = SnapshotHash.compute('Test listing content here');
    expect(hash.value).toMatch(/^[a-f0-9]{64}$/);
  });

  it('is deterministic for the same input', () => {
    const a = SnapshotHash.compute('same content');
    const b = SnapshotHash.compute('same content');
    expect(a.equals(b)).toBe(true);
  });

  it('normalises whitespace before hashing', () => {
    const a = SnapshotHash.compute('hello world');
    const b = SnapshotHash.compute('hello   world\n\n');
    expect(a.equals(b)).toBe(true);
  });

  it('differs for different content', () => {
    const a = SnapshotHash.compute('content A');
    const b = SnapshotHash.compute('content B');
    expect(a.equals(b)).toBe(false);
  });

  it('rejects too-short content', () => {
    expect(() => SnapshotHash.compute('abc')).toThrow();
  });

  it('rejects invalid hash on fromString', () => {
    expect(() => SnapshotHash.fromString('not-a-hash')).toThrow();
  });
});
