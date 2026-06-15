import { beforeEach, describe, expect, it } from "vitest";
import { getAnalyticsBuffer, resetAnalyticsBuffer, trackEvent } from "./analytics";

describe("trackEvent", () => {
  beforeEach(() => {
    resetAnalyticsBuffer();
  });

  it("buffers emitted events with name and props", () => {
    trackEvent("pantry_add_item_submitted", { hasExpiration: true });
    const buffer = getAnalyticsBuffer();
    expect(buffer).toHaveLength(1);
    expect(buffer[0].name).toBe("pantry_add_item_submitted");
    expect(buffer[0].props).toEqual({ hasExpiration: true });
  });

  it("forwards to window.dataLayer when present", () => {
    (window as unknown as { dataLayer: unknown[] }).dataLayer = [];
    trackEvent("pantry_add_item_opened");
    expect((window as unknown as { dataLayer: Array<{ event: string }> }).dataLayer[0].event).toBe(
      "pantry_add_item_opened",
    );
    delete (window as unknown as { dataLayer?: unknown[] }).dataLayer;
  });

  it("never throws and records multiple events in order", () => {
    expect(() => {
      trackEvent("pantry_add_item_opened");
      trackEvent("pantry_add_item_failed", { reason: "server_error" });
    }).not.toThrow();
    const names = getAnalyticsBuffer().map((e) => e.name);
    expect(names).toEqual(["pantry_add_item_opened", "pantry_add_item_failed"]);
  });
});
