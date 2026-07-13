export type PricingRule = {
  id: number;
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
  externalId: string;
  url: string;
  status: string;
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
  totalAmount: number;
  paymentLink?: PaymentLink | null;
  delivery?: Delivery | null;
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
  lead: Lead;
  product: Product;
  messages: Message[];
  negotiations: Negotiation[];
};

