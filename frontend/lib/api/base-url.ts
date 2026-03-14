export function getApiBaseUrl(): string {
  const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const normalizedBaseUrl = rawBaseUrl.replace(/\/+$/, '');
  return normalizedBaseUrl.endsWith('/api/v1')
    ? normalizedBaseUrl
    : `${normalizedBaseUrl}/api/v1`;
}
