import { describe, expect, it } from 'vitest';
import { calculateOffer } from '../src/domain/pricingEngine.js';

const rule = {
  maxDiscountPercent: 20,
  lowRotationDays: 14,
  lowStockThreshold: 3,
  approvalDiscountThreshold: 15,
  offerExpiresInMinutes: 30
};

describe('PricingEngine', () => {
  it('protects minimum margin even if the requested discount is high', () => {
    const offer = calculateOffer({
      basePrice: 100000,
      minPrice: 90000,
      stock: 10,
      recentSalesCount: 0,
      requestedDiscountPercent: 40,
      rule
    });

    expect(offer.proposedPrice).toBe(90000);
    expect(offer.discountPercent).toBe(10);
    expect(offer.rationale).toContain('margen minimo protegido');
  });

  it('restricts discount when stock is low', () => {
    const offer = calculateOffer({
      basePrice: 100000,
      minPrice: 70000,
      stock: 2,
      recentSalesCount: 0,
      requestedDiscountPercent: 20,
      rule
    });

    expect(offer.discountPercent).toBe(5);
    expect(offer.proposedPrice).toBe(95000);
    expect(offer.rationale).toContain('stock bajo');
  });

  it('marks offers for human approval over the configured threshold', () => {
    const offer = calculateOffer({
      basePrice: 100000,
      minPrice: 70000,
      stock: 20,
      recentSalesCount: 0,
      requestedDiscountPercent: 18,
      rule
    });

    expect(offer.requiresApproval).toBe(true);
    expect(offer.rationale).toContain('requiere aprobacion humana');
  });
});

