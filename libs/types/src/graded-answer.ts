import type { ActivityType } from './activity-type';

/**
 * The minimal answered-state contract the end-of-lesson scorer consumes (R7). R4 (player) /
 * R9 (resume) will produce this live; ship against this injected shape until then.
 * `MultipleChoiceAnswer` already structurally satisfies it.
 */
export type GradedAnswer = {
  slideId: string;
  activityType: ActivityType;
  isCorrect: boolean;
};
