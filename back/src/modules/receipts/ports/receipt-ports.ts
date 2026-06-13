export interface StoredReceiptFile {
  bucket: string;
  key: string;
}

export interface OcrExtractedLine {
  rawName: string;
  quantity?: number;
  unit?: string;
  unitPriceEur?: number;
  lineTotalEur?: number;
}

export interface ReceiptStoragePort {
  savePrivate(params: {
    buffer: Buffer;
    contentType: string;
    originalName: string;
  }): Promise<StoredReceiptFile>;
}

export interface ReceiptOcrPort {
  extractLines(params: {
    buffer: Buffer;
    contentType: string;
    originalName: string;
  }): Promise<OcrExtractedLine[]>;
}

export class OcrTimeoutError extends Error {}

export class OcrTransientError extends Error {}

export const RECEIPT_STORAGE_PORT = "RECEIPT_STORAGE_PORT";
export const RECEIPT_OCR_PORT = "RECEIPT_OCR_PORT";
