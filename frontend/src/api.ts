import type { Conversation, Product } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json() as Promise<T>;
}

export const api = {
  products: () => request<Product[]>('/products'),
  conversations: () => request<Conversation[]>('/conversations'),
  sendWhatsappLead: (payload: {
    name: string;
    phone: string;
    productSku: string;
    message: string;
    requestedDiscountPercent?: number;
  }) =>
    request<Conversation>('/webhooks/whatsapp', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  suggestReply: (conversationId: number, payload: { requestedDiscountPercent?: number; quantity: number }) =>
    request<{ negotiation: { id: number }; reply: string }>(`/conversations/${conversationId}/suggest-reply`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),
  acceptNegotiation: (negotiationId: number) =>
    request(`/negotiations/${negotiationId}/accept`, {
      method: 'POST',
      body: JSON.stringify({})
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

