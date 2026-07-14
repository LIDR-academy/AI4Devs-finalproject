/**
 * Storage paths in `pdf-images` are `{userId}/…` (RLS: first folder = auth.uid()).
 * Reject blank, traversal, absolute, and single-segment paths before signing.
 */
export const isValidLessonImageStoragePath = (storagePath: string): boolean => {
  const trimmed = storagePath.trim();
  if (!trimmed) return false;
  if (trimmed.includes('..') || trimmed.includes('\\') || trimmed.startsWith('/')) return false;
  const segments = trimmed.split('/');
  return segments.length >= 2 && segments.every((segment) => segment.length > 0);
};
