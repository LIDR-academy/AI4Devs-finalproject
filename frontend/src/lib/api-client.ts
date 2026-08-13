import { ProductFilters, ProductsResponse } from '../types';
import { OrderListResponse } from '../types/order';

// En Server Components (SSR) no hay `window`/origen de navegador contra el
// que resolver una ruta relativa como "/api" - fetch() la rechaza. Ahi se usa
// el hostname interno de la red de Docker Compose (mismo host que nginx,
// pero sin pasar por el), distinto del NEXT_PUBLIC_API_URL relativo que
// horneamos para el cliente.
const BASE_URL =
  typeof window === 'undefined'
    ? process.env.INTERNAL_API_URL ?? 'http://localhost:4000/api'
    : process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new ApiError(res.status, body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    cache: 'no-store',
    credentials: 'include',
  });
  return handleResponse<T>(res);
}

export async function fetchProducts(filters?: ProductFilters): Promise<ProductsResponse> {
  const params = new URLSearchParams();
  if (filters?.distance)  filters.distance.forEach(v  => params.append('distance',  v));
  if (filters?.surface)   filters.surface.forEach(v   => params.append('surface',   v));
  if (filters?.level)     filters.level.forEach(v     => params.append('level',     v));
  if (filters?.objective) filters.objective.forEach(v => params.append('objective', v));
  if (filters?.category)               params.append('category', filters.category);
  if (filters?.priceMax !== undefined) params.append('priceMax', String(filters.priceMax));
  const qs = params.toString();
  return apiGet<ProductsResponse>(`/products${qs ? `?${qs}` : ''}`);
}

export async function fetchProduct(id: string): Promise<import('../types').Product> {
  return apiGet(`/products/${encodeURIComponent(id)}`);
}

export async function fetchOrders(): Promise<OrderListResponse[]> {
  return apiGet<OrderListResponse[]>('/orders');
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  return handleResponse<T>(res);
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'include',
  });
  return handleResponse<T>(res);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleResponse<T>(res);
}
