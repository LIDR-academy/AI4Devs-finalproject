/**
 * Storage paths in `pdf-images` are `{userId}/…` (RLS: first folder = auth.uid()).
 * Reject blank, traversal, and malformed segment paths before signing.
 * Leading `/` yields an empty first segment and fails the segment rules.
 */
export const isValidLessonImageStoragePath = (storagePath: string): boolean => {
  const trimmed = storagePath.trim();
  if (trimmed.includes('..') || trimmed.includes('\\')) return false;
  const segments = trimmed.split('/');
  return segments.length >= 2 && segments.every((segment) => segment.length > 0);
};
