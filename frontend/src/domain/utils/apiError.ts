export function extractErrorCode(error: unknown): string | undefined {
  if (error && typeof error === "object" && "response" in error) {
    const apiError = (
      error as {
        response?: { data?: { error?: { code?: string } } };
      }
    ).response?.data?.error;
    return apiError?.code;
  }
  return undefined;
}
