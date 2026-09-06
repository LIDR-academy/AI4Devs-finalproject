export function normalizeHttpRoute(params: {
  routePath?: string | string[];
  baseUrl?: string;
  url?: string;
}): string {
  const rawPath = Array.isArray(params.routePath)
    ? params.routePath[0]
    : params.routePath;

  if (rawPath === undefined || rawPath === null || rawPath === '') {
    return 'unmatched';
  }

  const base = (params.baseUrl ?? '').replace(/\/$/, '');
  const route = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  const combined = `${base}${route}`;

  if (!combined) {
    return 'unmatched';
  }

  return combined.startsWith('/') ? combined : `/${combined}`;
}

export function isMetricsScrapePath(urlPath: string): boolean {
  const pathOnly = urlPath.split('?')[0] ?? '';
  return pathOnly === '/api/metrics' || pathOnly.endsWith('/metrics');
}
