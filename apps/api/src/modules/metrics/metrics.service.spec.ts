import { Registry } from 'prom-client';
import { METRICS_REGISTRY, MetricsService } from './metrics.service';

describe('MetricsService', () => {
  let register: Registry;
  let metricsService: MetricsService;

  beforeEach(() => {
    register = new Registry();
    metricsService = new MetricsService(register);
  });

  it('exposes counter and histogram after observeHttpRequest', async () => {
    metricsService.observeHttpRequest({
      method: 'GET',
      route: '/api/health/live',
      statusCode: 200,
      durationSeconds: 0.012,
    });

    const text = await metricsService.getMetricsText();

    expect(text).toContain('mecatrack_http_requests_total');
    expect(text).toContain('mecatrack_http_request_duration_seconds');
    expect(text).toContain('route="/api/health/live"');
    expect(text).toContain('status_code="200"');
    expect(text).toContain('method="GET"');
  });

  it('increments the counter on repeated observes', async () => {
    const input = {
      method: 'GET',
      route: '/api/health/live',
      statusCode: 200,
      durationSeconds: 0.01,
    };

    metricsService.observeHttpRequest(input);
    metricsService.observeHttpRequest(input);

    const metric = await register.getSingleMetricAsString(
      'mecatrack_http_requests_total',
    );

    expect(metric).toMatch(
      /mecatrack_http_requests_total\{method="GET",route="\/api\/health\/live",status_code="200"\} 2/,
    );
  });

  it('returns a Prometheus content type', () => {
    expect(metricsService.getContentType()).toContain('text/plain');
  });

  it('exports METRICS_REGISTRY token for optional injection', () => {
    expect(METRICS_REGISTRY).toBe('METRICS_REGISTRY');
  });
});
