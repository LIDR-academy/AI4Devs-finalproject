import {
  ExpirationRulesService,
  LOW_CONFIDENCE_THRESHOLD,
} from "./expiration-rules.service";

describe("ExpirationRulesService", () => {
  const service = new ExpirationRulesService();

  it("returns high confidence for known dairy item", () => {
    const estimate = service.buildEstimate("Greek Yogurt");

    expect(estimate.category).toBe("dairy");
    expect(estimate.confidence).toBeGreaterThan(LOW_CONFIDENCE_THRESHOLD);
    expect(estimate.lowConfidence).toBe(false);
  });

  it("returns low confidence for unknown item", () => {
    const estimate = service.buildEstimate("Mystery Ingredient 42");

    expect(estimate.category).toBe("unknown");
    expect(estimate.confidence).toBeLessThan(LOW_CONFIDENCE_THRESHOLD);
    expect(estimate.lowConfidence).toBe(true);
  });
});
