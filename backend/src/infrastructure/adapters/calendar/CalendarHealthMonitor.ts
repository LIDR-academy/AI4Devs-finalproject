import { logger } from "../../logger.js";

export interface CalendarHealthStatus {
  status: "healthy" | "degraded";
  failureRate: number;
  totalCalls: number;
  windowMinutes: number;
}

interface CallRecord {
  timestamp: number;
  success: boolean;
}

export class CalendarHealthMonitor {
  private calls: CallRecord[] = [];
  private readonly windowMinutes: number;
  private readonly alertThreshold: number;

  constructor(windowMinutes = 5, alertThreshold = 0.05) {
    this.windowMinutes = windowMinutes;
    this.alertThreshold = alertThreshold;
  }

  recordCall(success: boolean): void {
    this.calls.push({ timestamp: Date.now(), success });
    this.purgeOld();
  }

  getHealth(): CalendarHealthStatus {
    this.purgeOld();
    const totalCalls = this.calls.length;
    if (totalCalls === 0) {
      return {
        status: "healthy",
        failureRate: 0,
        totalCalls: 0,
        windowMinutes: this.windowMinutes,
      };
    }
    const failures = this.calls.filter((c) => !c.success).length;
    const failureRate = failures / totalCalls;
    const status: "healthy" | "degraded" =
      failureRate > this.alertThreshold ? "degraded" : "healthy";
    if (status === "degraded") {
      logger.warn(
        { failureRate, totalCalls, windowMinutes: this.windowMinutes },
        `Calendar health degraded: ${(failureRate * 100).toFixed(1)}% failure rate exceeds ${(this.alertThreshold * 100).toFixed(0)}% threshold`,
      );
    }
    return {
      status,
      failureRate: Math.round(failureRate * 10000) / 100,
      totalCalls,
      windowMinutes: this.windowMinutes,
    };
  }

  private purgeOld(): void {
    const cutoff = Date.now() - this.windowMinutes * 60 * 1000;
    const remaining: CallRecord[] = [];
    for (const call of this.calls) {
      if (call.timestamp >= cutoff) {
        remaining.push(call);
      }
    }
    this.calls = remaining;
  }
}
