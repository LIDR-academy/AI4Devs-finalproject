const MESSAGES: Record<string, string> = {
  CLASS_FULL: "Class is full.",
  LEVEL_MISMATCH: "Level mismatch — this class requires a different level.",
  OVERLAP_DETECTED: "You already have a class at this time.",
  ALREADY_ENROLLED: "You are already enrolled in this class.",
  NOT_FOUND: "The class or enrollment was not found.",
  FORBIDDEN: "You don't have permission to do that.",
  VALIDATION_ERROR: "The action could not be completed. Please check the details and try again.",
};

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

export function enrollmentErrorMessage(code: string | null | undefined): string {
  if (!code) {
    return FALLBACK_MESSAGE;
  }
  return MESSAGES[code] ?? FALLBACK_MESSAGE;
}
