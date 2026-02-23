import type {
  OrdersResponse,
  UsersResponse,
  ConversationMessagesResponse,
} from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate: 30 },
    // Evita errores en build time cuando el API no está disponible
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export const getOrders = (page = 1, limit = 50): Promise<OrdersResponse> =>
  apiFetch(`/api/admin/orders?page=${page}&limit=${limit}`);

export const getUsers = (page = 1, limit = 50): Promise<UsersResponse> =>
  apiFetch(`/api/admin/users?page=${page}&limit=${limit}`);

export const getConversationMessages = (
  id: string,
): Promise<ConversationMessagesResponse> =>
  apiFetch(`/api/admin/conversations/${id}/messages`);
