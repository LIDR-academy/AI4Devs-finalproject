import { isValidLessonImageStoragePath } from './lesson-image-path';

describe('isValidLessonImageStoragePath', () => {
  it('accepts userId/relative object paths', () => {
    expect(isValidLessonImageStoragePath('user/doc/img.png')).toBe(true);
    expect(isValidLessonImageStoragePath('u/d/p2-0.png')).toBe(true);
  });

  // Review r2 — OWASP A03 path-shape guard before signed URL.
  it('rejects blank, traversal, absolute, and single-segment paths', () => {
    expect(isValidLessonImageStoragePath('')).toBe(false);
    expect(isValidLessonImageStoragePath('   ')).toBe(false);
    expect(isValidLessonImageStoragePath('../etc/passwd')).toBe(false);
    expect(isValidLessonImageStoragePath('user/../secret')).toBe(false);
    expect(isValidLessonImageStoragePath('/user/doc/img.png')).toBe(false);
    expect(isValidLessonImageStoragePath('lonely.png')).toBe(false);
    expect(isValidLessonImageStoragePath('user//img.png')).toBe(false);
  });
});
