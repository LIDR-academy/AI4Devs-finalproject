export type PricingRuleInput = {
  maxDiscountPercent: number;
  lowRotationDays: number;
  lowStockThreshold: number;
  approvalDiscountThreshold: number;
  offerExpiresInMinutes: number;
};

export type ProductPricingInput = {
  basePrice: number;
  minPrice: number;
  stock: number;
  recentSalesCount: number;
  rule: PricingRuleInput;
  requestedDiscountPercent?: number;
};

export type PricingResult = {
  initialPrice: number;
  proposedPrice: number;
  minAllowedPrice: number;
  discountPercent: number;
  requiresApproval: boolean;
  expiresAt: Date;
  rationale: string;
};

export function calculateOffer(input: ProductPricingInput, now = new Date()): PricingResult {
  if (input.basePrice <= 0) {
    throw new Error('basePrice must be greater than zero');
  }

  if (input.minPrice <= 0 || input.minPrice > input.basePrice) {
    throw new Error('minPrice must be greater than zero and lower than basePrice');
  }

  if (input.stock <= 0) {
    throw new Error('Product has no available stock');
  }

  const rule = input.rule;
  let allowedDiscount = rule.maxDiscountPercent;
  const reasons: string[] = [];

  if (input.stock <= rule.lowStockThreshold) {
    allowedDiscount = Math.min(allowedDiscount, 5);
    reasons.push('stock bajo: descuento restringido');
  } else if (input.recentSalesCount === 0) {
    reasons.push('baja rotacion: descuento maximo permitido');
  } else {
    allowedDiscount = Math.min(allowedDiscount, Math.max(5, rule.maxDiscountPercent / 2));
    reasons.push('rotacion activa: descuento moderado');
  }

  const requested = input.requestedDiscountPercent ?? allowedDiscount;
  const discountPercent = Math.max(0, Math.min(requested, allowedDiscount));
  const discountedPrice = roundMoney(input.basePrice * (1 - discountPercent / 100));
  const proposedPrice = Math.max(discountedPrice, input.minPrice);
  const effectiveDiscount = roundPercent(((input.basePrice - proposedPrice) / input.basePrice) * 100);
  const requiresApproval = effectiveDiscount >= rule.approvalDiscountThreshold;
  const expiresAt = new Date(now.getTime() + rule.offerExpiresInMinutes * 60 * 1000);

  if (proposedPrice === input.minPrice && discountedPrice < input.minPrice) {
    reasons.push('margen minimo protegido');
  }

  if (requiresApproval) {
    reasons.push('requiere aprobacion humana');
  }

  return {
    initialPrice: input.basePrice,
    proposedPrice,
    minAllowedPrice: input.minPrice,
    discountPercent: effectiveDiscount,
    requiresApproval,
    expiresAt,
    rationale: reasons.join('; ')
  };
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundPercent(value: number): number {
  return Math.round(value * 100) / 100;
}

