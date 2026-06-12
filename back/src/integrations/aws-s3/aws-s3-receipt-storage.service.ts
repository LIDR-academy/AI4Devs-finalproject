import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import type {
  ReceiptStoragePort,
  StoredReceiptFile,
} from "../../modules/receipts/ports/receipt-ports";

@Injectable()
export class AwsS3ReceiptStorageService implements ReceiptStoragePort {
  private readonly bucket = process.env.AWS_S3_BUCKET ?? "";
  private readonly s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION ?? "eu-west-1",
    });
  }

  async savePrivate(params: {
    buffer: Buffer;
    contentType: string;
    originalName: string;
  }): Promise<StoredReceiptFile> {
    if (!this.bucket) {
      throw new Error("AWS_S3_BUCKET must be set");
    }

    const extension =
      extname(params.originalName || "") || this.extensionFromMime(params.contentType);
    const key = `receipts/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${extension}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: params.buffer,
        ContentType: params.contentType,
        ServerSideEncryption: "AES256",
      }),
    );

    return {
      bucket: this.bucket,
      key,
    };
  }

  private extensionFromMime(contentType: string): string {
    if (contentType.includes("png")) {
      return ".png";
    }
    if (contentType.includes("jpeg") || contentType.includes("jpg")) {
      return ".jpg";
    }
    if (contentType.includes("pdf")) {
      return ".pdf";
    }
    return ".bin";
  }
}
