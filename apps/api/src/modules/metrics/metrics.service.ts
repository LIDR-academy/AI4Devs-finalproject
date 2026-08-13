import { Inject, Injectable, Optional } from '@nestjs/common';
import {
  Counter,
  Histogram,
  Registry,
  collectDefaultMetrics,
} from 'prom-client';

export const METRICS_REGISTRY = 'METRICS_REGISTRY';

export type ObserveHttpRequestInput = {
  method: string;
  route: string;
  statusCode: number;
  durationSeconds: number;
};

@Injectable()
export class MetricsService {
  private readonly register: Registry;
  private readonly httpRequestsTotal: Counter<
    'method' | 'route' | 'status_code'
  >;
  private readonly httpRequestDuration: Histogram<
    'method' | 'route' | 'status_code'
  >;

  constructor(
    @Optional() @Inject(METRICS_REGISTRY) register?: Registry,
  ) {
    this.register = register ?? new Registry();

    if (!register) {
      collectDefaultMetrics({
        register: this.register,
        prefix: 'mecatrack_',
      });
    }

    this.httpRequestsTotal = new Counter({
      name: 'mecatrack_http_requests_total',
      help: 'Total HTTP requests handled by the MecaTrack API',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register],
    });

    this.httpRequestDuration = new Histogram({
      name: 'mecatrack_http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.register],
    });
  }

  observeHttpRequest(input: ObserveHttpRequestInput): void {
    const labels = {
      method: input.method.toUpperCase(),
      route: input.route,
      status_code: String(input.statusCode),
    };

    this.httpRequestsTotal.inc(labels);
    this.httpRequestDuration.observe(labels, input.durationSeconds);
  }

  async getMetricsText(): Promise<string> {
    return this.register.metrics();
  }

  getContentType(): string {
    return this.register.contentType;
  }
}
