import { shouldUseLocalReceiptAdapters } from "./receipts.adapter-selection";

describe("shouldUseLocalReceiptAdapters", () => {
  it("uses local adapters when explicitly opted in", () => {
    expect(
      shouldUseLocalReceiptAdapters({
        USE_LOCAL_RECEIPT_ADAPTERS: "true",
        AWS_S3_BUCKET: "real-bucket",
        NODE_ENV: "production",
      }),
    ).toBe(true);
  });

  it("uses AWS adapters when explicitly opted out, even without a bucket", () => {
    expect(
      shouldUseLocalReceiptAdapters({
        USE_LOCAL_RECEIPT_ADAPTERS: "false",
        NODE_ENV: "development",
      }),
    ).toBe(false);
  });

  it("keeps AWS adapters in development when an S3 bucket is configured", () => {
    // Regression: developers with real AWS credentials must keep real Textract,
    // otherwise scanning returns only the local stub items with no unit prices.
    expect(
      shouldUseLocalReceiptAdapters({
        AWS_S3_BUCKET: "real-bucket",
        NODE_ENV: "development",
      }),
    ).toBe(false);
  });

  it("falls back to local adapters in development when no S3 bucket is configured", () => {
    expect(
      shouldUseLocalReceiptAdapters({ NODE_ENV: "development" }),
    ).toBe(true);
    expect(
      shouldUseLocalReceiptAdapters({ AWS_S3_BUCKET: "  ", NODE_ENV: "test" }),
    ).toBe(true);
  });

  it("never silently uses local adapters in production", () => {
    expect(
      shouldUseLocalReceiptAdapters({ NODE_ENV: "production" }),
    ).toBe(false);
  });
});
