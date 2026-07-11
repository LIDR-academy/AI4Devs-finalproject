/** A persisted, insert-only record of one completed/scored lesson attempt (R7). */
export type LessonAttempt = {
  id: string;
  lessonId: string;
  score: number;
  total: number;
  createdAt: string;
};

/**
 * The payload the client sends to create an attempt. No `id`/`createdAt` (server-generated)
 * and no `userId` — set server-side by the `user_id default auth.uid()` column + RLS, so the
 * client can never spoof another user's attempt.
 */
export type NewLessonAttempt = {
  lessonId: string;
  score: number;
  total: number;
};
