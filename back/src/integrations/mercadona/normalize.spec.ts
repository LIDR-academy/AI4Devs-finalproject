import { normalizeMercadonaQuery } from "./normalize";

describe("normalizeMercadonaQuery", () => {
  it("lowercases and removes accents", () => {
    expect(normalizeMercadonaQuery("Léche")).toBe("leche");
    expect(normalizeMercadonaQuery("Toñito")).toBe("tonito");
    expect(normalizeMercadonaQuery("Jamón Ibérico")).toBe("jamon iberico");
  });

  it("strips quantity + unit suffixes", () => {
    expect(normalizeMercadonaQuery("Leche Entera 1L")).toBe("leche entera");
    expect(normalizeMercadonaQuery("Yogur Natural 500g")).toBe("yogur natural");
    expect(normalizeMercadonaQuery("Aceite de Oliva 750ml")).toBe("aceite de oliva");
    expect(normalizeMercadonaQuery("Mantequilla 250g")).toBe("mantequilla");
    expect(normalizeMercadonaQuery("Agua 1.5l")).toBe("agua");
  });

  it("strips x-pack multipliers", () => {
    expect(normalizeMercadonaQuery("Huevos x12")).toBe("huevos");
    expect(normalizeMercadonaQuery("Cerveza x6")).toBe("cerveza");
  });

  it("collapses extra whitespace after stripping", () => {
    expect(normalizeMercadonaQuery("  Leche   1L  ")).toBe("leche");
  });

  it("returns null when result is fewer than 3 characters", () => {
    expect(normalizeMercadonaQuery("1L")).toBeNull();
    expect(normalizeMercadonaQuery("ab")).toBeNull();
    expect(normalizeMercadonaQuery("")).toBeNull();
    expect(normalizeMercadonaQuery("   ")).toBeNull();
  });

  it("returns the normalized result for names without units", () => {
    expect(normalizeMercadonaQuery("Pollo")).toBe("pollo");
    expect(normalizeMercadonaQuery("Tomate")).toBe("tomate");
  });

  it("handles ud and unid unit suffixes", () => {
    expect(normalizeMercadonaQuery("Huevo 1ud")).toBe("huevo");
    expect(normalizeMercadonaQuery("Yogur 4unid")).toBe("yogur");
  });
});
