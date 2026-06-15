import { Module, type Provider } from "@nestjs/common";
import { AwsS3ReceiptStorageService } from "../../integrations/aws-s3/aws-s3-receipt-storage.service";
import { LocalReceiptStorageService } from "../../integrations/aws-s3/local-receipt-storage.service";
import { AwsTextractReceiptOcrService } from "../../integrations/aws-textract/aws-textract-receipt-ocr.service";
import { LocalReceiptOcrService } from "../../integrations/aws-textract/local-receipt-ocr.service";
import { ExpirationModule } from "../expiration/expiration.module";
import { HouseholdsModule } from "../households/households.module";
import { UsersModule } from "../users/users.module";
import {
  RECEIPT_OCR_PORT,
  RECEIPT_STORAGE_PORT,
} from "./ports/receipt-ports";
import { shouldUseLocalReceiptAdapters } from "./receipts.adapter-selection";
import { ReceiptsController } from "./receipts.controller";
import { ReceiptsService } from "./receipts.service";

const useLocalAdapters = shouldUseLocalReceiptAdapters(process.env);

const storageProvider: Provider = {
  provide: RECEIPT_STORAGE_PORT,
  useClass: useLocalAdapters
    ? LocalReceiptStorageService
    : AwsS3ReceiptStorageService,
};

const ocrProvider: Provider = {
  provide: RECEIPT_OCR_PORT,
  useClass: useLocalAdapters
    ? LocalReceiptOcrService
    : AwsTextractReceiptOcrService,
};

@Module({
  imports: [UsersModule, HouseholdsModule, ExpirationModule],
  controllers: [ReceiptsController],
  providers: [ReceiptsService, storageProvider, ocrProvider],
})
export class ReceiptsModule {}
