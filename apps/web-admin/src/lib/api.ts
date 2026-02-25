import type {
  OrdersResponse,
  UsersResponse,
  ConversationMessagesResponse,
  SortByColumn,
  SortDir,
  OrdersFilters,
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

export const getOrders = (
  page = 1,
  limit = 50,
  sortBy?: SortByColumn,
  sortDir?: SortDir,
  filters?: OrdersFilters,
): Promise<OrdersResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (sortBy) params.set('sortBy', sortBy);
  if (sortDir) params.set('sortDir', sortDir);
  if (filters?.q) params.set('q', filters.q);
  if (filters?.status?.length) params.set('status', filters.status.join(','));
  if (filters?.mode?.length) params.set('mode', filters.mode.join(','));
  if (filters?.from) params.set('from', filters.from);
  if (filters?.to) params.set('to', filters.to);
  return apiFetch(`/api/admin/orders?${params.toString()}`);
};

export const getUsers = (page = 1, limit = 50): Promise<UsersResponse> =>
  apiFetch(`/api/admin/users?page=${page}&limit=${limit}`);

export const getConversationMessages = (
  id: string,
): Promise<ConversationMessagesResponse> =>
  apiFetch(`/api/admin/conversations/${id}/messages`);
