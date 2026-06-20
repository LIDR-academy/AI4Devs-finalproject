/**
 * Environment inputs that decide whether the receipt pipeline uses the local
 * filesystem/stub adapters or the real AWS S3 + Textract adapters.
 */
export interface ReceiptAdapterSelectionEnv {
  USE_LOCAL_RECEIPT_ADAPTERS?: string;
  AWS_S3_BUCKET?: string;
  NODE_ENV?: string;
}

/**
 * Decides whether to use the local receipt adapters.
 *
 * Rules (first match wins):
 * 1. `USE_LOCAL_RECEIPT_ADAPTERS=true` → always local (explicit opt-in).
 * 2. `USE_LOCAL_RECEIPT_ADAPTERS=false` → always AWS (explicit opt-out).
 * 3. Production → always AWS, so a misconfiguration fails loudly instead of
 *    silently writing receipts to the local filesystem.
 * 4. Otherwise (local/dev) → use local adapters only when AWS storage is not
 *    configured. This keeps the real Textract/S3 pipeline for developers who
 *    have credentials, while still letting the app run without them.
 */
export function shouldUseLocalReceiptAdapters(
  env: ReceiptAdapterSelectionEnv,
): boolean {
  if (env.USE_LOCAL_RECEIPT_ADAPTERS === "true") {
    return true;
  }
  if (env.USE_LOCAL_RECEIPT_ADAPTERS === "false") {
    return false;
  }
  if (env.NODE_ENV === "production") {
    return false;
  }
  return !env.AWS_S3_BUCKET || env.AWS_S3_BUCKET.trim() === "";
}
