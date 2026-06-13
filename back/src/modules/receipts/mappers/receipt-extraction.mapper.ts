import type { Prisma } from "@prisma/client";
import type { OcrExtractedLine } from "../ports/receipt-ports";

const SUPPORTED_UNITS = ["unit", "g", "kg", "ml", "l", "pack"] as const;

function normalizeName(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function inferQuantityAndUnit(rawName: string): { quantity?: number; unit?: string } {
  const parsed = rawName.match(/(\d+)\s*(kg|g|ml|l|pack|unit|x)\b/i);
  if (!parsed) {
    return {};
  }

  const parsedQuantity = Number(parsed[1]);
  if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
    return {};
  }

  const unitFromText = parsed[2].toLowerCase();
  const normalizedUnit = unitFromText === "x" ? "unit" : unitFromText;
  if (!SUPPORTED_UNITS.includes(normalizedUnit as (typeof SUPPORTED_UNITS)[number])) {
    return {};
  }

  return {
    quantity: parsedQuantity,
    unit: normalizedUnit,
  };
}

export function mapExtractedLineToCreateInput(
  line: OcrExtractedLine,
): Prisma.ReceiptItemCreateWithoutReceiptInput {
  const normalizedRawName = normalizeName(line.rawName || "");
  const rawName = normalizedRawName || "Unknown item";
  const inferred = inferQuantityAndUnit(rawName);

  return {
    rawName,
    quantity: line.quantity ?? inferred.quantity ?? null,
    unit: line.unit ?? inferred.unit ?? null,
    unitPriceEur: line.unitPriceEur ?? null,
    lineTotalEur: line.lineTotalEur ?? null,
  };
}
