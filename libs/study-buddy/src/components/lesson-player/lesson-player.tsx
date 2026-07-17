import { LessonPlayer as LessonPlayerOrganism, type LessonPlayerProps } from '@helsoft/activities';

export {
  LESSON_PLAYER_EMPTY_TEST_ID,
  LESSON_PLAYER_ERROR_TEST_ID,
  LESSON_PLAYER_TEST_ID,
} from '@helsoft/activities';
export type { LessonPlayerProps };

/** Thin feature wiring — organism owns the deck. */
export const LessonPlayer = (props: LessonPlayerProps) => <LessonPlayerOrganism {...props} />;
