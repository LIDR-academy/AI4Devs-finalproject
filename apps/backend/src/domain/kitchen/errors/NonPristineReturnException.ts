import { DomainError } from '../../errors/DomainError.js';

/**
 * US-028 / ADR-003 #6: un sobrante solo puede **devolverse a un sub-sector de bodega**
 * si el remanente está "intacto" — cero consumo registrado (`currentQuantity ==
 * initialQuantity`, `isPristine`) **Y** el operario marca "envase sin abrir"
 * (`markedUnopened`). HTTP 422 — el desplegable de destino no debió ofrecer bodega
 * para esa línea.
 */
export class NonPristineReturnException extends DomainError {
  constructor(insumoId: string) {
    super(
      `Solo un remanente intacto (sin consumo y con envase sin abrir) puede devolverse a ` +
        `bodega. El sobrante del insumo ${insumoId} debe quedar en un área de cocina o descartarse.`,
      422
    );
  }
}
