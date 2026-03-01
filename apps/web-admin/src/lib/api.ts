import type {
  OrdersResponse,
  UsersResponse,
  ConversationMessagesResponse,
  SortByColumn,
  SortDir,
  OrdersFilters,
  UserSortByColumn,
  UsersFilters,
  StoresResponse,
  CreateMockOrderPayload,
  StartSimulationResult,
} from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    cache: 'no-store',
    ...init,
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

export const getUsers = (
  page = 1,
  limit = 50,
  sortBy?: UserSortByColumn,
  sortDir?: SortDir,
  filters?: UsersFilters,
): Promise<UsersResponse> => {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (sortBy) params.set('sortBy', sortBy);
  if (sortDir) params.set('sortDir', sortDir);
  if (filters?.q) params.set('q', filters.q);
  if (filters?.registered) params.set('registered', filters.registered);
  return apiFetch(`/api/admin/users?${params.toString()}`);
};

export const getConversationMessages = (
  id: string,
): Promise<ConversationMessagesResponse> =>
  apiFetch(`/api/admin/conversations/${id}/messages`);

export const getStores = (): Promise<StoresResponse> =>
  apiFetch<StoresResponse>('/api/admin/stores');

export const getUsersForSimulate = (): Promise<UsersResponse> =>
  apiFetch<UsersResponse>('/api/admin/users?limit=100&sortBy=name&sortDir=asc');

export async function startSimulation(
  payload: CreateMockOrderPayload,
): Promise<StartSimulationResult> {
  return apiFetch<StartSimulationResult>('/api/mock/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
