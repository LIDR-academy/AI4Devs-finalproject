import { isMetricsScrapePath, normalizeHttpRoute } from './route-normalizer';

describe('normalizeHttpRoute', () => {
  it('builds /api/work-orders/:id from baseUrl and route path', () => {
    expect(
      normalizeHttpRoute({
        baseUrl: '/api/work-orders',
        routePath: '/:id',
      }),
    ).toBe('/api/work-orders/:id');
  });

  it('builds /api/clients/:id from baseUrl and route path', () => {
    expect(
      normalizeHttpRoute({
        baseUrl: '/api/clients',
        routePath: '/:id',
      }),
    ).toBe('/api/clients/:id');
  });

  it('builds /api/vehicles/:id/history', () => {
    expect(
      normalizeHttpRoute({
        baseUrl: '/api/vehicles',
        routePath: '/:id/history',
      }),
    ).toBe('/api/vehicles/:id/history');
  });

  it('builds /api/health/live', () => {
    expect(
      normalizeHttpRoute({
        baseUrl: '/api/health',
        routePath: '/live',
      }),
    ).toBe('/api/health/live');
  });

  it('returns unmatched when no Nest route is matched', () => {
    expect(
      normalizeHttpRoute({
        url: '/api/work-orders/550e8400-e29b-41d4-a716-446655440000',
      }),
    ).toBe('unmatched');
  });

  it('does not use raw URL UUIDs as labels when routePath is missing', () => {
    const label = normalizeHttpRoute({
      url: '/api/clients/550e8400-e29b-41d4-a716-446655440000',
    });
    expect(label).toBe('unmatched');
    expect(label).not.toContain('550e8400');
  });

  it('accepts routePath as an array', () => {
    expect(
      normalizeHttpRoute({
        baseUrl: '/api/health',
        routePath: ['/ready'],
      }),
    ).toBe('/api/health/ready');
  });
});

describe('isMetricsScrapePath', () => {
  it('detects /api/metrics with and without query string', () => {
    expect(isMetricsScrapePath('/api/metrics')).toBe(true);
    expect(isMetricsScrapePath('/api/metrics?foo=1')).toBe(true);
  });

  it('does not treat other paths as metrics scrape', () => {
    expect(isMetricsScrapePath('/api/health/live')).toBe(false);
  });
});
