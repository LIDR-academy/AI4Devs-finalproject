import {
  ALLOWED_MIME_TYPES,
  MAX_CONCURRENT_FILES,
  MAX_FILE_SIZE_BYTES,
  validateBatch,
  validateFile,
} from "@/lib/file-validation";

describe("file validation", () => {
  it("accepts a whitelisted file", () => {
    const result = validateFile({
      name: "photo.png",
      size: 1024,
      type: "image/png",
    } as File);

    expect(result).toEqual({ valid: true });
  });

  it("rejects files above the max size", () => {
    const result = validateFile({
      name: "big.mp4",
      size: MAX_FILE_SIZE_BYTES + 1,
      type: "video/mp4",
    } as File);

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe("size");
    }
  });

  it("rejects non-whitelisted MIME types", () => {
    const result = validateFile({
      name: "archive.zip",
      size: 1024,
      type: "application/zip",
    } as File);

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe("type");
    }
  });

  it("rejects unsafe filenames", () => {
    const result = validateFile({
      name: "../secret.txt",
      size: 1024,
      type: "text/plain",
    } as File);

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe("name");
    }
  });

  it("rejects batches above the concurrent limit", () => {
    const files = Array.from({ length: MAX_CONCURRENT_FILES + 1 }, (_, index) => ({
      name: `file-${index}.txt`,
      size: 100,
      type: "text/plain",
    })) as File[];

    const result = validateBatch(files);
    expect(result.validFiles).toHaveLength(0);
    expect(result.errors[0]).toContain(`${MAX_CONCURRENT_FILES}`);
  });

  it("exports the exact frontend whitelist", () => {
    expect(ALLOWED_MIME_TYPES).toEqual(
      new Set([
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "application/pdf",
        "text/plain",
        "application/json",
        "video/mp4",
        "video/webm",
      ]),
    );
  });
});