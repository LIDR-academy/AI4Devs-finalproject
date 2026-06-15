import { mapExtractedLineToCreateInput } from "./receipt-extraction.mapper";

describe("receipt extraction mapper", () => {
  it("maps explicit quantity and unit", () => {
    const output = mapExtractedLineToCreateInput({
      rawName: "Greek Yogurt",
      quantity: 2,
      unit: "unit",
    });

    expect(output.rawName).toBe("Greek Yogurt");
    expect(output.normalizedName).toBe("Greek Yogurt");
    expect(output.quantity).toBe(2);
    expect(output.unit).toBe("unit");
  });

  it("keeps original rawName but collapses whitespace into normalizedName", () => {
    const output = mapExtractedLineToCreateInput({ rawName: "  Whole   Milk  " });

    expect(output.rawName).toBe("  Whole   Milk  ");
    expect(output.normalizedName).toBe("Whole Milk");
  });

  it("falls back both names to a placeholder for empty OCR lines", () => {
    const output = mapExtractedLineToCreateInput({ rawName: "   " });

    expect(output.rawName).toBe("Unknown item");
    expect(output.normalizedName).toBe("Unknown item");
  });

  it("infers quantity and unit from text", () => {
    const output = mapExtractedLineToCreateInput({ rawName: "Milk 1L" });

    expect(output.rawName).toBe("Milk 1L");
    expect(output.quantity).toBe(1);
    expect(output.unit).toBe("l");
  });

  it("uses fallback name when OCR line is empty", () => {
    const output = mapExtractedLineToCreateInput({ rawName: "   " });

    expect(output.rawName).toBe("Unknown item");
    expect(output.quantity).toBeNull();
    expect(output.unit).toBeNull();
  });
});
