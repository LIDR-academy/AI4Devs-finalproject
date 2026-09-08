const MESSAGES: Record<string, string> = {
  WAITING_LIST_FULL: "The waiting list for this class is full.",
  ALREADY_ON_WAITING_LIST: "You are already on the waiting list for this class.",
  ALREADY_ENROLLED: "You are already enrolled in this class.",
  LEVEL_MISMATCH: "Level mismatch — this class requires a different level.",
  NOT_FOUND: "The class was not found.",
  FORBIDDEN: "You don't have permission to do that.",
  VALIDATION_ERROR: "This class currently has a free spot — join it instead.",
  SPOT_TAKEN: "This spot was just claimed by another Coachee.",
  NOT_ON_WAITING_LIST: "You are no longer on the waiting list for this class.",
};

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

export function waitingListErrorMessage(code: string | null | undefined): string {
  if (!code) {
    return FALLBACK_MESSAGE;
  }
  return MESSAGES[code] ?? FALLBACK_MESSAGE;
}
