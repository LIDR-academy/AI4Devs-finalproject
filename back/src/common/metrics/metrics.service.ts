import { Injectable } from "@nestjs/common";

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
 * No external metrics library is wired in the MVP, so this provides simple
 * counters and duration aggregates that are observable through GET /api/metrics
 * in local and dev environments. It can be replaced by a Prometheus-backed
 * implementation later without changing call sites.
 */
@Injectable()
export class MetricsService {
  private readonly counters = new Map<string, number>();
  private readonly durations = new Map<string, DurationAggregate>();

  increment(name: string, value = 1): void {
    this.counters.set(name, (this.counters.get(name) ?? 0) + value);
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
