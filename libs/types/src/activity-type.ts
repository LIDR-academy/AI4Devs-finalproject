/**
 * The full v1 set of activity slide types. Only `multiple-choice` is producible today;
 * the rest land with their own stories (fill-in-the-blank, matching, flashcard, open-ended).
 */
export type ActivityType = 'multiple-choice' | 'fill-in-the-blank' | 'flashcard' | 'open-ended' | 'matching';

/**
 * The single source of truth for "counts toward the end-of-lesson score" (R7). Flashcard
 * (self-marked) and open-ended (ungraded) are deliberately excluded. Adding a future
 * system-checked type is one edit here.
 */
export const SYSTEM_CHECKED_ACTIVITY_TYPES = ['multiple-choice', 'fill-in-the-blank', 'matching'] as const satisfies readonly ActivityType[];

/** Runtime guard: does this activity type count toward the score? Mirrors `isSupportedLocale`. */
export const isSystemCheckedActivity = (activityType: ActivityType): boolean =>
  (SYSTEM_CHECKED_ACTIVITY_TYPES as readonly ActivityType[]).includes(activityType);
