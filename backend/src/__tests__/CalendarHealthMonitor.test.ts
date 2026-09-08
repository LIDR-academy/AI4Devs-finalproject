import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CalendarHealthMonitor } from "../infrastructure/adapters/calendar/CalendarHealthMonitor.js";

describe("CalendarHealthMonitor", () => {
  let monitor: CalendarHealthMonitor;

  beforeEach(() => {
    vi.useFakeTimers();
    monitor = new CalendarHealthMonitor(5, 0.05);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should report healthy when no calls have been made", () => {
    const health = monitor.getHealth();
    expect(health.status).toBe("healthy");
    expect(health.failureRate).toBe(0);
    expect(health.totalCalls).toBe(0);
  });

  it("should report healthy when failure rate is below threshold", () => {
    for (let i = 0; i < 19; i++) {
      monitor.recordCall(true);
    }
    monitor.recordCall(false);

    const health = monitor.getHealth();
    expect(health.status).toBe("healthy");
    expect(health.failureRate).toBe(5);
    expect(health.totalCalls).toBe(20);
  });

  it("should report degraded when failure rate exceeds threshold", () => {
    for (let i = 0; i < 18; i++) {
      monitor.recordCall(true);
    }
    for (let i = 0; i < 2; i++) {
      monitor.recordCall(false);
    }

    const health = monitor.getHealth();
    expect(health.status).toBe("degraded");
    expect(health.failureRate).toBe(10);
    expect(health.totalCalls).toBe(20);
  });

  it("should purge calls older than the window", () => {
    vi.setSystemTime(new Date("2026-07-29T10:00:00Z"));
    monitor.recordCall(false);
    monitor.recordCall(true);

    vi.setSystemTime(new Date("2026-07-29T10:06:00Z"));
    monitor.recordCall(true);

    const health = monitor.getHealth();
    expect(health.totalCalls).toBe(1);
    expect(health.failureRate).toBe(0);
    expect(health.status).toBe("healthy");
  });

  it("should report exactly 0% failure rate with all successes", () => {
    for (let i = 0; i < 100; i++) {
      monitor.recordCall(true);
    }

    const health = monitor.getHealth();
    expect(health.status).toBe("healthy");
    expect(health.failureRate).toBe(0);
    expect(health.totalCalls).toBe(100);
  });

  it("should report 100% failure rate with all failures", () => {
    for (let i = 0; i < 10; i++) {
      monitor.recordCall(false);
    }

    const health = monitor.getHealth();
    expect(health.status).toBe("degraded");
    expect(health.failureRate).toBe(100);
    expect(health.totalCalls).toBe(10);
  });
});
