import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ReceiptProcessingStatus } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { ExpirationRulesService } from "../expiration/expiration-rules.service";
import { UsersService } from "../users/users.service";
import { ConfirmReceiptItemsDto } from "./dto/confirm-receipt-items.dto";
import { mapExtractedLineToCreateInput } from "./mappers/receipt-extraction.mapper";
import {
  OcrTimeoutError,
  OcrTransientError,
  RECEIPT_OCR_PORT,
  RECEIPT_STORAGE_PORT,
  type OcrExtractedLine,
  type ReceiptOcrPort,
  type ReceiptStoragePort,
} from "./ports/receipt-ports";

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;
const SUPPORTED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "application/pdf",
] as const;
const PANTRY_UNITS = ["unit", "g", "kg", "ml", "l", "pack"] as const;

interface UploadedReceiptFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

@Injectable()
export class ReceiptsService {
  private readonly logger = new Logger(ReceiptsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly expirationRulesService: ExpirationRulesService,
    @Inject(RECEIPT_STORAGE_PORT)
    private readonly storage: ReceiptStoragePort,
    @Inject(RECEIPT_OCR_PORT)
    private readonly ocr: ReceiptOcrPort,
  ) {}

  async uploadAndProcess(userId: string, file: UploadedReceiptFile | undefined) {
    await this.assertUserCanAccessReceipts(userId);
    const uploadedFile = this.requireValidFile(file);

    this.logger.log(`Starting receipt upload for user=${userId}`);

    const storageResult = await this.storage.savePrivate({
      buffer: uploadedFile.buffer,
      contentType: uploadedFile.mimetype,
      originalName: uploadedFile.originalname,
    });

    const createdReceipt = await this.prisma.receipt.create({
      data: {
        userId,
        originalFilename: uploadedFile.originalname,
        mimeType: uploadedFile.mimetype,
        sizeBytes: uploadedFile.size,
        storageBucket: storageResult.bucket,
        storageKey: storageResult.key,
        ocrStatus: ReceiptProcessingStatus.PROCESSING,
      },
    });

    try {
      const extractedLines = await this.extractLinesWithRetry({
        buffer: uploadedFile.buffer,
        contentType: uploadedFile.mimetype,
        originalName: uploadedFile.originalname,
      });

      await this.prisma.receipt.update({
        where: { id: createdReceipt.id },
        data: {
          ocrStatus: ReceiptProcessingStatus.COMPLETED,
          processedAt: new Date(),
          items: {
            create: extractedLines.map((line) =>
              mapExtractedLineToCreateInput(line),
            ),
          },
        },
      });

      this.logger.log(`Receipt OCR completed for receipt=${createdReceipt.id}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown OCR error";

      await this.prisma.receipt.update({
        where: { id: createdReceipt.id },
        data: {
          ocrStatus: ReceiptProcessingStatus.FAILED,
          ocrError: errorMessage,
          processedAt: new Date(),
        },
      });

      this.logger.error(
        `Receipt OCR failed for receipt=${createdReceipt.id}: ${errorMessage}`,
      );

      if (error instanceof OcrTimeoutError) {
        throw new ServiceUnavailableException(
          "OCR timed out after retry attempts",
        );
      }

      throw new BadGatewayException("OCR provider failed");
    }

    return this.getById(userId, createdReceipt.id);
  }

  async getById(userId: string, id: string) {
    await this.assertUserCanAccessReceipts(userId);

    const receipt = await this.prisma.receipt.findFirst({
      where: { id, userId },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!receipt) {
      throw new NotFoundException("Receipt not found");
    }

    return this.withDefaultExpirations(receipt);
  }

  async getStatus(userId: string, id: string) {
    const receipt = await this.getById(userId, id);

    return {
      id: receipt.id,
      ocrStatus: receipt.ocrStatus,
      ocrError: receipt.ocrError,
      processedAt: receipt.processedAt,
      updatedAt: receipt.updatedAt,
    };
  }

  async confirmItems(
    userId: string,
    receiptId: string,
    dto: ConfirmReceiptItemsDto,
  ) {
    const receipt = await this.getById(userId, receiptId);

    if (receipt.ocrStatus !== ReceiptProcessingStatus.COMPLETED) {
      throw new BadRequestException(
        "Receipt cannot be confirmed before OCR is completed",
      );
    }

    const allowedItemIds = new Set(receipt.items.map((item) => item.id));
    const invalidId = dto.itemIds.find((itemId) => !allowedItemIds.has(itemId));
    if (invalidId) {
      throw new BadRequestException("One or more items do not belong to receipt");
    }

    const addToPantry = dto.addToPantry ?? false;
    const defaultUnit = this.normalizeUnit(dto.pantryDefaultUnit);
    const overridesByItemId = new Map(
      (dto.itemOverrides ?? []).map((override) => [override.itemId, override]),
    );

    const invalidOverrideId = [...overridesByItemId.keys()].find(
      (itemId) => !allowedItemIds.has(itemId),
    );
    if (invalidOverrideId) {
      throw new BadRequestException("One or more item overrides do not belong to receipt");
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.receiptItem.updateMany({
        where: {
          receiptId,
          id: { in: dto.itemIds },
        },
        data: {
          userConfirmed: true,
        },
      });

      if (!addToPantry) {
        return;
      }

      for (const itemId of dto.itemIds) {
        const matchedItem = receipt.items.find((item) => item.id === itemId);
        if (!matchedItem) {
          continue;
        }

        const itemOverride = overridesByItemId.get(itemId);
        const expirationDate = this.resolveExpirationDate(
          matchedItem.rawName,
          itemOverride?.expirationDate,
        );
        const pricePaid = this.resolvePricePaid(
          itemOverride?.pricePaid,
          matchedItem.quantity,
          matchedItem.unitPriceEur,
          matchedItem.lineTotalEur,
        );

        const pantryItem = await tx.pantryItem.create({
          data: {
            userId,
            name: matchedItem.rawName.trim(),
            quantity: matchedItem.quantity ?? 1,
            unit: this.normalizeUnit(matchedItem.unit) ?? defaultUnit,
            expirationDate,
            ...(pricePaid !== undefined && { pricePaid }),
          },
        });

        await tx.receiptItem.update({
          where: { id: matchedItem.id },
          data: {
            pantryItemId: pantryItem.id,
          },
        });
      }
    });

    this.logger.log(`Receipt items confirmed for receipt=${receiptId}`);
    return this.getById(userId, receiptId);
  }

  private async extractLinesWithRetry(params: {
    buffer: Buffer;
    contentType: string;
    originalName: string;
  }): Promise<OcrExtractedLine[]> {
    const maxAttempts = 3;
    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        return await this.ocr.extractLines(params);
      } catch (error) {
        lastError = error;
        const isRetryable =
          error instanceof OcrTransientError || error instanceof OcrTimeoutError;

        this.logger.warn(
          `OCR attempt ${attempt}/${maxAttempts} failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
        );

        if (!isRetryable || attempt === maxAttempts) {
          throw error;
        }
      }
    }

    throw lastError;
  }

  private requireValidFile(file: UploadedReceiptFile | undefined): UploadedReceiptFile {
    if (!file) {
      throw new BadRequestException("Receipt file is required");
    }

    if (
      !SUPPORTED_MIME_TYPES.includes(
        file.mimetype as (typeof SUPPORTED_MIME_TYPES)[number],
      )
    ) {
      throw new BadRequestException("Unsupported file type");
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException("File is too large");
    }

    return file;
  }

  private normalizeUnit(value: string | null | undefined): (typeof PANTRY_UNITS)[number] {
    if (!value) {
      return "unit";
    }

    const normalized = value.trim().toLowerCase();
    if (PANTRY_UNITS.includes(normalized as (typeof PANTRY_UNITS)[number])) {
      return normalized as (typeof PANTRY_UNITS)[number];
    }

    return "unit";
  }

  private resolveExpirationDate(
    rawName: string,
    overrideExpirationDate: string | undefined,
  ): Date {
    if (overrideExpirationDate) {
      return new Date(overrideExpirationDate);
    }

    return this.expirationRulesService.buildEstimate(rawName).suggestedExpirationDate;
  }

  private resolvePricePaid(
    overridePricePaid: number | undefined,
    quantity: number | null,
    unitPriceEur: unknown,
    lineTotalEur: unknown,
  ): string | undefined {
    if (overridePricePaid !== undefined) {
      return overridePricePaid.toFixed(2);
    }

    const lineTotal = this.asPositiveNumber(lineTotalEur);
    if (lineTotal !== undefined) {
      return lineTotal.toFixed(2);
    }

    const unitPrice = this.asPositiveNumber(unitPriceEur);
    if (unitPrice !== undefined && quantity && quantity > 0) {
      return (unitPrice * quantity).toFixed(2);
    }

    return undefined;
  }

  private asPositiveNumber(value: unknown): number | undefined {
    if (typeof value === "number") {
      return Number.isFinite(value) && value >= 0 ? value : undefined;
    }

    if (typeof value === "string") {
      const parsed = Number.parseFloat(value);
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
    }

    return undefined;
  }

  private withDefaultExpirations<T extends { items: Array<{ rawName: string }> }>(receipt: T): T & {
    items: Array<T["items"][number] & { defaultExpirationDate: string }>;
  } {
    return {
      ...receipt,
      items: receipt.items.map((item) => ({
        ...item,
        defaultExpirationDate: this.expirationRulesService
          .buildEstimate(item.rawName)
          .suggestedExpirationDate
          .toISOString(),
      })),
    };
  }

  private async assertUserCanAccessReceipts(userId: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new ForbiddenException("No access to receipts");
    }
  }
}
