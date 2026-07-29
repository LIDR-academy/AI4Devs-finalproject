/**
 * Sample XML responses from the Sede Electrónica del Catastro.
 * Used for unit tests — the real SEC returns these shapes when you POST
 * with Formato=JSON (yes, the SEC returns XML even when asked for JSON).
 *
 * These are not real records; they are synthetic and structurally valid.
 */

export const REAL_XML_SINGLE_UNIT = `<?xml version="1.0" encoding="UTF-8"?>
<consulta_dnp xmlns="http://www.catastro.meh.es/">
  <control>
    <cucta>1234567</cucta>
  </control>
  <lerrcs>
    <lrerrcs>
      <lrc>
        <rcdt>
          <bi>
            <de>
              <dt>CL EJEMPLO 123</dt>
            </de>
          </bi>
          <dft>
            <dt>28001</dt>
          </dft>
        </rcdt>
      </lrc>
    </lrerrcs>
  </lerrcs>
  <lcons>
    <lcons>
      <cons>
        <lcd>VIV</lcd>
        <superficie>78</superficie>
        <antiguedad>1995</antiguedad>
      </cons>
    </lcons>
  </lcons>
</consulta_dnp>`;

export const REAL_XML_MULTI_UNIT = `<?xml version="1.0" encoding="UTF-8"?>
<consulta_dnp xmlns="http://www.catastro.meh.es/">
  <control>
    <cucta>7654321</cucta>
  </control>
  <lerrcs>
    <lrerrcs>
      <lrc>
        <rcdt>
          <bi>
            <de>
              <dt>CL EJEMPLO 123</dt>
            </de>
          </bi>
        </rcdt>
      </lrc>
    </lrerrcs>
  </lerrcs>
  <lcons>
    <lcons>
      <cons>
        <lcd>VIV</lcd>
        <superficie>78</superficie>
        <antiguedad>1995</antiguedad>
      </cons>
    </lcons>
    <lcons>
      <cons>
        <lcd>LOC</lcd>
        <superficie>62</superficie>
        <antiguedad>1980</antiguedad>
      </cons>
    </lcons>
  </lcons>
</consulta_dnp>`;

export const MALFORMED_XML = `<?xml version="1.0"?>
<consulta_dnp><lerrcs><lrc><rcdt><bi><de><dt>CL EJEMPLO`;
