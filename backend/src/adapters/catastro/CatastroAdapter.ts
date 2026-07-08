/**
 * CatastroAdapter (T035).
 * Cross-references a property with the Sede Electrónica del Catastro.
 * Returns null on SEC failure (FR: don't block the analysis).
 */
import fetch from 'node-fetch';
import { parseStringPromise } from 'xml2js';
import { env } from '../../infrastructure/config/env';
import { REALISTA_USER_AGENT } from '../../infrastructure/utils/urlValidator';
import type { Coordinates } from '../../domain/value-objects/Coordinates';
import type { CatastroMatch, CatastroPort } from '../../domain/ports/CatastroPort';

export class CatastroAdapter implements CatastroPort {
  async lookup(coordinates: Coordinates, declaredAddress?: string): Promise<CatastroMatch | null> {
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
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) return null;
      // Catastro often returns XML even when JSON is requested; the SEC is finicky.
      // For MVP, we accept that any success response is enough; production should
      // parse the XML and extract year_built + superficie.
      const body = await res.text();
      const matched = body.toLowerCase().includes(declaredAddress.toLowerCase());
      if (!matched) return null;

      return {
        cadastralReference: 'PENDING-DECODE',
        officialSquareMeters: 0, // populated when XML is parsed
        yearBuilt: null,
        address: declaredAddress,
        matched: true,
      };
    } catch {
      return null;
    }
  }
}
