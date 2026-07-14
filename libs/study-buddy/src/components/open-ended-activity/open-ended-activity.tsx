import { OpenEnded } from '@helsoft/activities';

import type { OpenEndedActivityProps } from './open-ended-activity.types';
import { useOpenEndedActivity } from './use-open-ended-activity';

export { OPEN_ENDED_MAX_LENGTH } from './open-ended-activity.helpers';

/**
 * Thin feature wiring — validity + labels + answered-state emission.
 * Organism owns ephemeral draft/lock; no grader.
 */
export const OpenEndedActivity = ({ slide, onAnswered, initialAnswer }: OpenEndedActivityProps) => {
  const { valid, maxLength, submit } = useOpenEndedActivity({
    slide,
    onAnswered,
    initialAnswer,
  });

  return (
    <OpenEnded
      prompt={slide.content}
      modelAnswer={slide.modelAnswer}
      explanation={slide.explanation}
      unavailable={!valid}
      maxLength={maxLength}
      initialSubmittedAnswer={initialAnswer?.submittedAnswer}
      onSubmit={submit}
    />
  );
};
