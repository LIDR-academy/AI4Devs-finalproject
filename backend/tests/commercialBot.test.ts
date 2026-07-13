import { describe, expect, it } from 'vitest';
import { parseCommercialIntent } from '../src/domain/commercialBot.js';

describe('commercial bot intent parser', () => {
  it('detects catalog and inventory requests', () => {
    expect(parseCommercialIntent('Me muestras el catalogo?')).toEqual({ type: 'catalog' });
    expect(parseCommercialIntent('Hay stock disponible?')).toEqual({ type: 'inventory' });
    expect(parseCommercialIntent('AUD-BT-001')).toEqual({ type: 'inventory' });
  });

  it('detects purchase intent with quantity and discount', () => {
    expect(parseCommercialIntent('Quiero comprar 2 unidades con 12% de descuento')).toEqual({
      type: 'purchase',
      quantity: 2,
      requestedDiscountPercent: 12
    });
  });

  it('detects offer acceptance from WhatsApp button title', () => {
    expect(parseCommercialIntent('Aceptar oferta')).toEqual({ type: 'accept', quantity: 1 });
  });

  it('detects conversation close requests', () => {
    expect(parseCommercialIntent('No gracias, eso es todo')).toEqual({ type: 'close' });
  });

  it('detects payment and delivery follow-up', () => {
    expect(parseCommercialIntent('Ya pague')).toEqual({ type: 'payment_confirmed' });
    expect(parseCommercialIntent('Entrega en Calle 123 #45-67, Bogota')).toEqual({
      type: 'delivery',
      addressText: 'Calle 123 #45-67, Bogota'
    });
  });

  it('detects human handoff requests', () => {
    expect(parseCommercialIntent('Quiero hablar con un asesor')).toEqual({ type: 'handoff' });
  });
});
