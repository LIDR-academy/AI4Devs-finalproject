import { Asset, AssetType, Business, BusinessProfile, User } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('accessToken');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const body: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof body === 'object' && body !== null && 'message' in body
      ? String(body.message)
      : 'Request failed';
    throw new Error(message);
  }
  return body as T;
}

function json<T>(path: string, method: string, data: unknown): Promise<T> {
  return request<T>(path, { method, body: JSON.stringify(data) });
}

export const api = {
  register: (data: { email: string; name: string; password: string }) => json<{ accessToken: string; user: User }>('/auth/register', 'POST', data),
  login: (data: { email: string; password: string }) => json<{ accessToken: string; user: User }>('/auth/login', 'POST', data),
  businesses: () => request<Business[]>('/business'),
  createBusiness: (name: string) => json<Business>('/business', 'POST', { name }),
  submitDiscovery: (businessId: string, data: Omit<DiscoveryFormPayload, 'businessId'>) => json<BusinessProfile>('/discovery/submit', 'POST', { businessId, ...data }),
  profile: (businessId: string) => request<BusinessProfile>(`/business-profile?businessId=${encodeURIComponent(businessId)}`),
  approveProfile: (businessId: string) => json<BusinessProfile>('/business-profile/review', 'POST', { businessId }),
  generate: (businessId: string) => json<Array<{ assetType: AssetType; title: string; content: string; tokensUsed: number }>>('/assets/generate-digital-presence', 'POST', { businessId }),
  assets: (businessId: string) => request<Asset[]>(`/assets?businessId=${encodeURIComponent(businessId)}`),
  editAsset: (id: string, title: string, content: string) => json<Asset>(`/assets/${id}`, 'PATCH', { title, content }),
  regenerate: (id: string, businessId: string, assetType: AssetType) => json<Asset>(`/assets/${id}/regenerate`, 'POST', { businessId, assetType }),
};

export interface DiscoveryFormPayload {
  businessId: string;
  businessName: string;
  category: string;
  services: string[];
  products?: string[];
  targetAudience: string;
  tone: string;
  style?: string;
  location: string;
  phone?: string;
  website?: string;
  gdprConsent: true;
}
