export function maskUserId(userId?: string | null): string | undefined {
  if (userId === undefined || userId === null) {
    return undefined;
  }

  return `${userId.slice(0, 3)}***`;
}
