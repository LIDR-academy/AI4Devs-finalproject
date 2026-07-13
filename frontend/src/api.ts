import type {
  AdvisorManualOfferPayload,
  AdvisorReplyPayload,
  AdvisorTakeoverPayload,
  Conversation,
  InventoryMovementPayload,
  NegotiationAcceptPayload,
  Order,
  PaymentCheckout,
  PricingRule,
  PricingRulePayload,
  Product,
  ProductCreatePayload,
  ProductUpdatePayload
} from './types';

const DEFAULT_PRODUCTION_API_URL = 'https://proyectofinal-production-6c08.up.railway.app';

export const API_URL = String(
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? DEFAULT_PRODUCTION_API_URL : 'http://localhost:3000')
).replace(/\/$/, '');

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
  } catch {
    throw new Error(`No se pudo conectar con el backend: ${API_URL}`);
  }

  if (!response.ok) {
    const body = await response.text();
    const error = parseError(body, response.statusText);
    throw new Error(`${response.status} ${error}`);
  }

  return response.json() as Promise<T>;
}

function parseError(body: string, fallback: string) {
  if (!body) return fallback || 'Request failed';

  try {
    const parsed = JSON.parse(body) as { message?: string; error?: { message?: string } };
    return parsed.message || parsed.error?.message || fallback || 'Request failed';
  } catch {
    return body;
  }
}

export const api = {
  health: () => request<{ ok: boolean; service: string; database?: string }>('/health'),
  products: () => request<Product[]>('/products'),
  createProduct: (payload: ProductCreatePayload) =>
    request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  updateProduct: (productId: number, payload: ProductUpdatePayload) =>
    request<Product>(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  updatePricingRule: (productId: number, payload: PricingRulePayload) =>
    request<PricingRule>(`/products/${productId}/pricing-rule`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),
  createInventoryMovement: (productId: number, payload: InventoryMovementPayload) =>
    request<Product>(`/products/${productId}/inventory-movements`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  conversations: () => request<Conversation[]>('/conversations'),
  reviewQueue: () => request<Conversation[]>('/dashboard/review-queue'),
  takeConversation: (conversationId: number, payload: AdvisorTakeoverPayload) =>
    request<Conversation>(`/dashboard/conversations/${conversationId}/take`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  sendAdvisorReply: (conversationId: number, payload: AdvisorReplyPayload) =>
    request<Conversation>(`/dashboard/conversations/${conversationId}/reply`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  sendAdvisorManualOffer: (conversationId: number, payload: AdvisorManualOfferPayload) =>
    request<{ conversation: Conversation; negotiation: { id: number }; reply: string }>(
      `/dashboard/conversations/${conversationId}/manual-offer`,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    ),
  suggestReply: (conversationId: number, payload: { requestedDiscountPercent?: number; quantity: number }) =>
    request<{ negotiation: { id: number }; reply: string }>(`/conversations/${conversationId}/suggest-reply`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  acceptNegotiation: (negotiationId: number, payload: NegotiationAcceptPayload = {}) =>
    request<Order>(`/negotiations/${negotiationId}/accept`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  createPaymentLink: (orderId: number) =>
    request<{ externalId: string; url: string }>(`/orders/${orderId}/payment-link`, {
      method: 'POST',
      body: JSON.stringify({})
    }),
  confirmPayment: (orderId: number, externalId: string) =>
    request('/webhooks/payments', {
      method: 'POST',
      body: JSON.stringify({
        orderId,
        externalId,
        status: 'paid'
      })
    }),
  paymentCheckout: (externalId: string) => request<PaymentCheckout>(`/payments/${externalId}`),
  confirmMockPayment: (externalId: string, payload: { payerName?: string }) =>
    request<{ checkout: PaymentCheckout; alreadyPaid: boolean; whatsappSent: boolean }>(
      `/payments/${externalId}/confirm`,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    ),
  scheduleDelivery: (orderId: number, payload: {
    deliveryType: 'meetup' | 'home';
    addressText: string;
    latitude: number;
    longitude: number;
    scheduledAt: string;
  }) =>
    request<{ mapsUrl: string }>(`/orders/${orderId}/delivery`, {
      method: 'POST',
      body: JSON.stringify(payload)
    })
};
