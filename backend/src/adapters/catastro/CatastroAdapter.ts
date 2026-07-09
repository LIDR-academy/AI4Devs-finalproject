/**
 * CatastroAdapter (T035, FR-003).
 * Cross-references a property with the Sede Electrónica del Catastro.
 * Returns null on SEC failure (FR: don't block the analysis).
 * Now parses XML responses via xmlParser (was previously stubbed with PENDING-DECODE).
 */
import fetch from 'node-fetch';
import { env } from '../../infrastructure/config/env';
import { REALISTA_USER_AGENT } from '../../infrastructure/utils/urlValidator';
import type { Coordinates } from '../../domain/value-objects/Coordinates';
import type { CatastroMatch, CatastroPort } from '../../domain/ports/CatastroPort';
import { parseCatastroXml } from './xmlParser';

export class CatastroAdapter implements CatastroPort {
  async lookup(_coordinates: Coordinates, declaredAddress?: string): Promise<CatastroMatch | null> {
    if (env.NODE_ENV === 'test' || process.env.MOCK_CATASTRO === 'true') {
      return {
        cadastralReference: 'MOCK-12345',
        officialSquareMeters: 78,
        yearBuilt: 1995,
        address: declaredAddress ?? 'Dirección mock',
        matched: true,
      };
    }

    if (!declaredAddress) return null;

    try {
      const url = new URL(env.CATASTRO_BASE_URL);
      url.searchParams.set('Provincia', '');
      url.searchParams.set('Municipio', '');
      url.searchParams.set('TipoVia', 'CL');
      url.searchParams.set('NombreVia', declaredAddress);
      url.searchParams.set('Numero', '');
      url.searchParams.set('Sigla', '');
      url.searchParams.set('Formato', 'JSON');

      const res = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'User-Agent': REALISTA_USER_AGENT,
          Accept: 'application/json, application/xml, text/xml',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) return null;

      const body = await res.text();
      const contentType = res.headers.get('content-type') ?? '';
      const isXml = contentType.includes('xml') || body.trim().startsWith('<?xml') || body.trim().startsWith('<');

      if (isXml) {
        const parsed = parseCatastroXml(body, declaredAddress);
        if (!parsed) return null;
        return {
          cadastralReference: parsed.cadastralReference,
          officialSquareMeters: parsed.officialSquareMeters,
          yearBuilt: parsed.yearBuilt,
          address: parsed.address,
          matched: true,
        };
      }

      // JSON branch (not yet implemented by SEC but future-proof)
      const json = JSON.parse(body) as { results?: { match?: boolean } };
      if (!json.results?.match) return null;
      return {
        cadastralReference: 'JSON-PATH',
        officialSquareMeters: 0,
        yearBuilt: null,
        address: declaredAddress,
        matched: true,
      };
    } catch {
      return null;
    }
  }
}
