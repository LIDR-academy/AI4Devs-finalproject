import { Injectable, Logger } from "@nestjs/common";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { randomUUID } from "node:crypto";
import type {
  ReceiptStoragePort,
  StoredReceiptFile,
} from "../../modules/receipts/ports/receipt-ports";

/**
 * Local filesystem stand-in for {@link AwsS3ReceiptStorageService}. Persists the
 * uploaded receipt under `tmp/receipts/` so the upload flow works in local
 * development without AWS credentials. Selected by the receipts module based on
 * the environment (see receipts.module.ts).
 */
@Injectable()
export class LocalReceiptStorageService implements ReceiptStoragePort {
  private readonly logger = new Logger(LocalReceiptStorageService.name);
  private readonly bucket = "local-receipts";
  private readonly baseDir = join(process.cwd(), "tmp", "receipts");

  async savePrivate(params: {
    buffer: Buffer;
    contentType: string;
    originalName: string;
  }): Promise<StoredReceiptFile> {
    const extension =
      extname(params.originalName || "") ||
      this.extensionFromMime(params.contentType);
    const datePrefix = new Date().toISOString().slice(0, 10);
    const dir = join(this.baseDir, datePrefix);
    const filename = `${randomUUID()}${extension}`;
    const key = `receipts/${datePrefix}/${filename}`;

    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), params.buffer);

    this.logger.debug(`Saved receipt locally at ${key}`);

    return { bucket: this.bucket, key };
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
