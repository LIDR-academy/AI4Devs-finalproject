import {
  AnalyzeExpenseCommand,
  type AnalyzeExpenseCommandOutput,
  TextractClient,
} from "@aws-sdk/client-textract";
import { Injectable } from "@nestjs/common";
import type {
  OcrExtractedLine,
  ReceiptOcrPort,
} from "../../modules/receipts/ports/receipt-ports";
import {
  OcrTimeoutError,
  OcrTransientError,
} from "../../modules/receipts/ports/receipt-ports";

@Injectable()
export class AwsTextractReceiptOcrService implements ReceiptOcrPort {
  private readonly textract: TextractClient;

  constructor() {
    this.textract = new TextractClient({
      region: process.env.AWS_REGION ?? "eu-west-1",
    });
  }

  async extractLines(params: {
    buffer: Buffer;
    contentType: string;
    originalName: string;
  }): Promise<OcrExtractedLine[]> {
    try {
      const response = await this.textract.send(
        new AnalyzeExpenseCommand({
          Document: {
            Bytes: params.buffer,
          },
        }),
      );

      const lineItems = this.extractLineItems(response);
      if (lineItems.length > 0) {
        return lineItems;
      }

      return this.extractPlainLines(response);
    } catch (error) {
      if (this.isTimeoutError(error)) {
        throw new OcrTimeoutError("OCR provider timed out");
      }

      if (this.isTransientError(error)) {
        throw new OcrTransientError("Temporary OCR provider failure");
      }

      throw error;
    }
  }

  private static readonly MAX_PLAIN_LINES = 40;

  private extractLineItems(response: AnalyzeExpenseCommandOutput): OcrExtractedLine[] {
    return (response.ExpenseDocuments ?? []).flatMap((doc) =>
      (doc.LineItemGroups ?? []).flatMap((group) =>
        (group.LineItems ?? [])
          .map((item): OcrExtractedLine | null => {
            let rawName: string | null = null;
            let quantity: number | undefined;
            let unit: string | undefined;
            let unitPriceEur: number | undefined;
            let lineTotalEur: number | undefined;

            item.LineItemExpenseFields?.forEach((field) => {
              const fieldType = field.Type?.Text?.toUpperCase() ?? "";
              const valueText = field.ValueDetection?.Text?.trim();

              if (!valueText) return;

              if (fieldType.includes("ITEM") || fieldType.includes("DESCRIPTION") || fieldType.includes("PRODUCT")) {
                rawName = valueText;
              }

              if (fieldType.includes("QUANTITY")) {
                const parsed = this.parseQuantityAndUnit(valueText);
                quantity = parsed.quantity;
                unit = parsed.unit;
              }

              if (fieldType.includes("TOTAL") || fieldType.includes("AMOUNT")) {
                lineTotalEur = this.parseMoneyValue(valueText);
              } else if (fieldType.includes("PRICE")) {
                unitPriceEur = this.parseMoneyValue(valueText);
              }
            });

            return rawName ? { rawName, quantity, unit, unitPriceEur, lineTotalEur } : null;
          })
          .filter((item): item is OcrExtractedLine => item !== null),
      ),
    );
  }

  private extractPlainLines(response: AnalyzeExpenseCommandOutput): OcrExtractedLine[] {
    return (response.ExpenseDocuments ?? [])
      .flatMap((doc) =>
        (doc.Blocks ?? [])
          .filter((block) => block.BlockType === "LINE")
          .map((block) => block.Text?.trim())
          .filter((text): text is string => !!text && text.length >= 2)
          .map((text) => ({ rawName: text })),
      )
      .slice(0, AwsTextractReceiptOcrService.MAX_PLAIN_LINES);
  }

  private parseQuantityAndUnit(value: string): { quantity?: number; unit?: string } {
    const match = value.match(/(\d+(?:[.,]\d+)?)\s*(kg|g|ml|l|pack|unit|x)?/i);
    if (!match) return {};

    const parsedQuantity = Number(match[1].replace(",", "."));
    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) return {};

    const rawUnit = (match[2] ?? "unit").toLowerCase();
    const normalizedUnit = rawUnit === "x" ? "unit" : rawUnit;

    return { quantity: parsedQuantity, unit: normalizedUnit };
  }

  private parseMoneyValue(value: string): number | undefined {
    const normalized = value
      .replace(/\s+/g, "")
      .replace(/€|eur/gi, "")
      .replace(/,/g, ".")
      .replace(/[^0-9.]/g, "");

    const parsed = Number.parseFloat(normalized);
    if (!Number.isFinite(parsed) || parsed < 0) {
      return undefined;
    }

    return Number(parsed.toFixed(2));
  }

  private isTimeoutError(error: unknown): boolean {
    const code = this.readErrorCode(error);
    return code === "TimeoutError" || code === "RequestTimeout";
  }

  private isTransientError(error: unknown): boolean {
    const code = this.readErrorCode(error);
    return (
      code === "ThrottlingException" ||
      code === "ProvisionedThroughputExceededException" ||
      code === "ServiceUnavailableException" ||
      code === "InternalServerError"
    );
  }

  private readErrorCode(error: unknown): string {
    if (typeof error !== "object" || error === null) {
      return "";
    }

    const maybeError = error as { name?: string; Code?: string };
    return maybeError.name ?? maybeError.Code ?? "";
  }
}
