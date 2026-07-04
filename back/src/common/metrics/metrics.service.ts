import { Injectable } from "@nestjs/common";
import { CloudWatchMetricsService } from "../../integrations/aws-cloudwatch/cloudwatch-metrics.service";

interface DurationAggregate {
  count: number;
  sumMs: number;
  lastMs: number;
}

export interface MetricsSnapshot {
  counters: Record<string, number>;
  durations: Record<string, DurationAggregate>;
}

/**
 * Minimal in-process metrics registry.
 *
 * Counters and duration aggregates are observable through GET /api/metrics in local
 * and dev environments. In production, `increment()` also forwards business-event
 * counters to CloudWatch via the injected {@link CloudWatchMetricsService}.
 */
@Injectable()
export class MetricsService {
  private readonly counters = new Map<string, number>();
  private readonly durations = new Map<string, DurationAggregate>();

  constructor(private readonly cloudWatchMetrics: CloudWatchMetricsService) {}

  increment(name: string, value = 1): void {
    this.counters.set(name, (this.counters.get(name) ?? 0) + value);

    if (process.env.NODE_ENV === "production") {
      try {
        this.cloudWatchMetrics.emit(name, value);
      } catch {
        // CloudWatch forwarding must never affect the in-process counter above (FR-009).
      }
    }
  }

  observeDuration(name: string, milliseconds: number): void {
    const current = this.durations.get(name) ?? { count: 0, sumMs: 0, lastMs: 0 };
    this.durations.set(name, {
      count: current.count + 1,
      sumMs: current.sumMs + milliseconds,
      lastMs: milliseconds,
    });
  }

  getCounter(name: string): number {
    return this.counters.get(name) ?? 0;
  }

  snapshot(): MetricsSnapshot {
    return {
      counters: Object.fromEntries(this.counters),
      durations: Object.fromEntries(this.durations),
    };
  }
}
