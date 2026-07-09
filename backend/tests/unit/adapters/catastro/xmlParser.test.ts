import { describe, it, expect } from 'vitest';
import { parseCatastroXml } from '../../../../src/adapters/catastro/xmlParser';
import { REAL_XML_SINGLE_UNIT, REAL_XML_MULTI_UNIT, MALFORMED_XML } from '../../../../src/adapters/catastro/securexamples';

describe('parseCatastroXml', () => {
  it('extracts superficie and antiguedad from a single-unit SEC response', () => {
    const result = parseCatastroXml(REAL_XML_SINGLE_UNIT, 'CL EJEMPLO 123');
    expect(result).not.toBeNull();
    expect(result!.matched).toBe(true);
    expect(result!.officialSquareMeters).toBe(78);
    expect(result!.yearBuilt).toBe(1995);
  });

  it('sums superficies and takes minimum antiguedad for multi-unit response', () => {
    const result = parseCatastroXml(REAL_XML_MULTI_UNIT, 'CL EJEMPLO 123');
    expect(result).not.toBeNull();
    expect(result!.officialSquareMeters).toBe(140); // 78 + 62
    expect(result!.yearBuilt).toBe(1980); // min(1995, 1980)
  });

  it('returns null on malformed XML without throwing', () => {
    const result = parseCatastroXml(MALFORMED_XML, 'CL EJEMPLO 123');
    expect(result).toBeNull();
  });
});
