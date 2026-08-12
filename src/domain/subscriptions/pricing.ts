/**
 * Precio del alquiler puntual (D9 / spec `subscriptions`).
 *
 * `precio = max(valor_de_referencia × porcentaje, mínimo)`, ambos configurables por el
 * admin. El mínimo existe porque un porcentaje sobre un set barato daría importes que
 * no cubren ni el envío.
 *
 * Se calcula en **céntimos enteros** y se redondea al final: encadenar multiplicaciones
 * en coma flotante sobre euros acaba produciendo 14.989999999999998.
 */

export interface OneOffPriceInput {
  /** Valor de referencia del Set, en euros y como cadena decimal exacta. */
  referenceValue: string;
  /** Porcentaje aplicado (15 significa 15 %). */
  percent: number;
  /** Importe mínimo, en euros. */
  minimum: number;
}

export interface OneOffPrice {
  /** Importe final en euros, con dos decimales. */
  amount: string;
  /** Si se aplicó el mínimo en vez del porcentaje; útil para explicarlo en la interfaz. */
  minimumApplied: boolean;
}

export function computeOneOffPrice({
  referenceValue,
  percent,
  minimum,
}: OneOffPriceInput): OneOffPrice {
  const referenceCents = toCents(referenceValue);
  const minimumCents = toCents(String(minimum));

  const percentCents = Math.round((referenceCents * percent) / 100);
  const minimumApplied = percentCents < minimumCents;
  const amountCents = Math.max(percentCents, minimumCents);

  return { amount: fromCents(amountCents), minimumApplied };
}

function toCents(euros: string): number {
  const value = Number(euros);
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value * 100);
}

function fromCents(cents: number): string {
  return (cents / 100).toFixed(2);
}
