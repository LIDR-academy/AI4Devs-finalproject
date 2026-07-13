export type PricingRule = {
  id: number;
  productId?: number;
  maxDiscountPercent: number;
  lowRotationDays: number;
  lowStockThreshold: number;
  approvalDiscountThreshold: number;
  offerExpiresInMinutes: number;
  active: boolean;
};

export type Product = {
  id: number;
  sku: string;
  name: string;
  description?: string;
  category: string;
  basePrice: number;
  minPrice: number;
  stock: number;
  status: string;
  pricingRule?: PricingRule | null;
};

export type ProductCreatePayload = {
  sku: string;
  name: string;
  description?: string;
  category: string;
  basePrice: number;
  minPrice: number;
  stock: number;
};

export type ProductUpdatePayload = {
  name: string;
  description?: string;
  category: string;
  basePrice: number;
  minPrice: number;
  status: 'active' | 'inactive';
};

export type PricingRulePayload = {
  maxDiscountPercent: number;
  lowRotationDays: number;
  lowStockThreshold: number;
  approvalDiscountThreshold: number;
  offerExpiresInMinutes: number;
  active: boolean;
};

export type InventoryMovementPayload = {
  type: 'restock' | 'reservation' | 'sale' | 'adjustment';
  quantity: number;
  reason: string;
};

export type AdvisorTakeoverPayload = {
  advisorName?: string;
};

export type AdvisorReplyPayload = {
  message: string;
  advisorName?: string;
};

export type AdvisorManualOfferPayload = {
  discountPercent: number;
  quantity: number;
  advisorName?: string;
};

export type NegotiationAcceptPayload = {
  actor?: 'gpt' | 'advisor';
  advisorName?: string;
};

export type Lead = {
  id: number;
  name: string;
  phone: string;
  status: string;
};

export type Message = {
  id: number;
  direction: 'inbound' | 'outbound' | 'system';
  body: string;
  createdAt: string;
};

export type PaymentLink = {
  id: number;
  orderId?: number;
  externalId: string;
  url: string;
  status: string;
  expiresAt?: string;
};

export type Delivery = {
  id: number;
  addressText: string;
  mapsUrl: string;
  status: string;
};

export type Order = {
  id: number;
  status: string;
  quantity?: number;
  unitPrice?: number;
  totalAmount: number;
  product?: Product;
  paymentLink?: PaymentLink | null;
  delivery?: Delivery | null;
};

export type PaymentCheckout = {
  payment: {
    id: number;
    externalId: string;
    status: string;
    url: string;
    expiresAt: string;
  };
  order: {
    id: number;
    status: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    product: Pick<Product, 'id' | 'sku' | 'name' | 'description' | 'category'>;
    lead: {
      name: string;
      phone: string;
    };
  };
  canPay: boolean;
};

export type Negotiation = {
  id: number;
  proposedPrice: number;
  discountPercent: number;
  rationale: string;
  status: string;
  expiresAt: string;
  order?: Order | null;
};

export type Conversation = {
  id: number;
  status: string;
  channel?: string;
  automationPaused?: boolean;
  lead: Lead;
  product: Product;
  messages: Message[];
  negotiations: Negotiation[];
};
