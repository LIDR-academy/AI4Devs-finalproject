import { ProductFilters, ProductsResponse } from '../types';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

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
  const res = await fetch(`${BASE_URL}${path}`, { cache: 'no-store' });
  return handleResponse<T>(res);
}

export async function fetchProducts(filters?: ProductFilters): Promise<ProductsResponse> {
  const params = new URLSearchParams();
  if (filters?.distance)  filters.distance.forEach(v  => params.append('distance',  v));
  if (filters?.surface)   filters.surface.forEach(v   => params.append('surface',   v));
  if (filters?.level)     filters.level.forEach(v     => params.append('level',     v));
  if (filters?.objective) filters.objective.forEach(v => params.append('objective', v));
  const qs = params.toString();
  return apiGet<ProductsResponse>(`/products${qs ? `?${qs}` : ''}`);
}

export async function fetchProduct(id: string): Promise<import('../types').Product> {
  return apiGet(`/products/${encodeURIComponent(id)}`);
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
