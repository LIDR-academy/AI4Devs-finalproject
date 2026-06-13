import { Module } from "@nestjs/common";
import { AwsS3ReceiptStorageService } from "../../integrations/aws-s3/aws-s3-receipt-storage.service";
import { AwsTextractReceiptOcrService } from "../../integrations/aws-textract/aws-textract-receipt-ocr.service";
import { ExpirationModule } from "../expiration/expiration.module";
import { UsersModule } from "../users/users.module";
import {
	RECEIPT_OCR_PORT,
	RECEIPT_STORAGE_PORT,
} from "./ports/receipt-ports";
import { ReceiptsController } from "./receipts.controller";
import { ReceiptsService } from "./receipts.service";

@Module({
	imports: [UsersModule, ExpirationModule],
	controllers: [ReceiptsController],
	providers: [
		ReceiptsService,
		{
			provide: RECEIPT_STORAGE_PORT,
			useClass: AwsS3ReceiptStorageService,
		},
		{
			provide: RECEIPT_OCR_PORT,
			useClass: AwsTextractReceiptOcrService,
		},
	],
})
export class ReceiptsModule {}
