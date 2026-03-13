import { formatFileSize } from "@/lib/file-validation";

export type RetrievalMetadata = {
  cid: string;
  filename: string;
  mimeType: string;
  size: number | null;
  uploadedAt: string | null;
};

export type RetrievalHistoryEntry = {
  cid: string;
  filename: string;
  mimeType: string;
  size: number | null;
  retrievedAt: string;
};

export const RETRIEVAL_HISTORY_STORAGE_KEY = "ipfs_gateway_recent_retrievals";
export const RETRIEVAL_METADATA_STORAGE_KEY = "ipfs_gateway_cached_retrieval_metadata";

export function getFilenameFromContentDisposition(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const utf8Match = value.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]).replace(/^\"|\"$/g, "");
    } catch {
      return utf8Match[1].replace(/^\"|\"$/g, "");
    }
  }

  const standardMatch = value.match(/filename=\"?([^\";]+)\"?/i);
  return standardMatch?.[1] ?? null;
}

export function buildShareLink(origin: string, cid: string): string {
  return `${origin}/retrieve?cid=${encodeURIComponent(cid)}`;
}

export function isImageMime(mimeType: string): boolean {
  return /^image\//.test(mimeType);
}

export function isTextMime(mimeType: string): boolean {
  return /^text\//.test(mimeType) || mimeType === "application/json" || mimeType === "application/xml";
}

export function isPdfMime(mimeType: string): boolean {
  return mimeType === "application/pdf";
}

export function canPreviewMime(mimeType: string): boolean {
  return isImageMime(mimeType) || isTextMime(mimeType) || isPdfMime(mimeType);
}

export function formatUploadedAt(value: string | null): string {
  if (!value) {
    return "Unknown";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown";
  }

  return parsed.toLocaleString();
}

export function formatMetadataSize(value: number | null): string {
  if (value === null || Number.isNaN(value)) {
    return "Unknown";
  }

  return formatFileSize(value);
}

export function mergeHistoryEntry(entries: RetrievalHistoryEntry[], next: RetrievalHistoryEntry): RetrievalHistoryEntry[] {
  const deduped = entries.filter((entry) => entry.cid !== next.cid);
  return [next, ...deduped].slice(0, 8);
}

export function parseRetrievalMetadata(params: {
  cid: string;
  headers: Headers;
  fallbackFilename?: string;
}): RetrievalMetadata {
  const contentDisposition = params.headers.get("content-disposition");
  const filename = getFilenameFromContentDisposition(contentDisposition) ?? params.fallbackFilename ?? `${params.cid}.bin`;
  const mimeType = params.headers.get("content-type") ?? "application/octet-stream";
  const sizeHeader = params.headers.get("content-length");
  const size = sizeHeader ? Number(sizeHeader) : null;
  const uploadedAt = params.headers.get("last-modified");

  return {
    cid: params.cid,
    filename,
    mimeType,
    size: Number.isFinite(size) ? size : null,
    uploadedAt,
  };
}
