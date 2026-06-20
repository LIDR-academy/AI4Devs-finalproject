import { normalizePriceComparisonName } from "./price-comparison-normalizer";

describe("normalizePriceComparisonName", () => {
  it("normalizes spacing, casing and punctuation", () => {
    expect(normalizePriceComparisonName("  Tomato-Sauce 500G! ")).toBe(
      "tomato sauce 500g",
    );
  });

  it("removes accents consistently", () => {
    expect(normalizePriceComparisonName("LéchE Entéra")).toBe("leche entera");
  });
});
