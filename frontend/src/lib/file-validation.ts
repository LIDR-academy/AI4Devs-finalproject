export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;
export const MAX_CONCURRENT_FILES = 3;

export const DROPZONE_ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
  "application/pdf": [".pdf"],
  "text/plain": [".txt"],
  "application/json": [".json"],
  "video/mp4": [".mp4"],
  "video/webm": [".webm"],
} as const;

export const ALLOWED_MIME_TYPES = new Set(Object.keys(DROPZONE_ACCEPT));

const DANGEROUS_FILENAME_PATTERNS = ["..", "/", "\\", "\u0000"];

export type ValidationReason = "size" | "type" | "name" | "count";

export type ValidationResult =
  | { valid: true }
  | { valid: false; reason: ValidationReason; message: string };

export type BatchValidationResult<T> = {
  validFiles: T[];
  errors: string[];
};

type ValidatableFile = Pick<File, "name" | "size" | "type">;

export function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  const units = ["KB", "MB", "GB"];
  let value = size / 1024;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

export function validateFile<T extends ValidatableFile>(file: T): ValidationResult {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      reason: "size",
      message: `${file.name} exceeds the 100 MB upload limit.`,
    };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      valid: false,
      reason: "type",
      message: `${file.name} has an unsupported file type (${file.type || "unknown"}).`,
    };
  }

  if (DANGEROUS_FILENAME_PATTERNS.some((pattern) => file.name.includes(pattern))) {
    return {
      valid: false,
      reason: "name",
      message: `${file.name} contains an unsafe filename pattern.`,
    };
  }

  return { valid: true };
}

export function validateBatch<T extends ValidatableFile>(files: T[]): BatchValidationResult<T> {
  if (files.length > MAX_CONCURRENT_FILES) {
    return {
      validFiles: [],
      errors: [`You can upload up to ${MAX_CONCURRENT_FILES} files at a time.`],
    };
  }

  const validFiles: T[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const result = validateFile(file);
    if (result.valid) {
      validFiles.push(file);
      continue;
    }

    errors.push(result.message);
  }

  return {
    validFiles,
    errors,
  };
}