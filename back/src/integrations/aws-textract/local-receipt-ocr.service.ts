import { Injectable, Logger } from "@nestjs/common";
import type {
  OcrExtractedLine,
  ReceiptOcrPort,
} from "../../modules/receipts/ports/receipt-ports";

/**
 * Local stand-in for {@link AwsTextractReceiptOcrService}. Returns a deterministic
 * set of extracted lines so the receipt review flow can be exercised in local
 * development without AWS credentials. Selected by the receipts module based on
 * the environment (see receipts.module.ts).
 */
@Injectable()
export class LocalReceiptOcrService implements ReceiptOcrPort {
  private readonly logger = new Logger(LocalReceiptOcrService.name);

  async extractLines(): Promise<OcrExtractedLine[]> {
    this.logger.debug("Returning local stub OCR lines");

    return [
      { rawName: "Local Milk 1L", quantity: 1, unit: "l", unitPriceEur: 1.2, lineTotalEur: 1.2 },
      { rawName: "Local Eggs x6", quantity: 6, unit: "unit", unitPriceEur: 0.35, lineTotalEur: 2.1 },
      { rawName: "Local Bread", quantity: 1, unit: "unit", unitPriceEur: 0.95, lineTotalEur: 0.95 },
    ];
  }
}
