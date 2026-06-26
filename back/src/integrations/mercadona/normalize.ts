import { normalizePriceComparisonName } from "../../modules/insights/price-comparison-normalizer";

export function normalizeMercadonaQuery(input: string): string | null {
  const base = normalizePriceComparisonName(input);

  const stripped = base
    .replace(/\b\d+\s*(g|kg|ml|l|cl|dl|oz|lb|ud|unid)\b/gi, " ")
    .replace(/\bx\d+\b/gi, " ")
    .replace(/\b\d+\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return stripped.length < 3 ? null : stripped;
}
