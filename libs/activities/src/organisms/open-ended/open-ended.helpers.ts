/** True when R9/resume seeded a submitted string (including empty). */
export const isRehydratedSubmission = (initial?: string | null): boolean =>
  typeof initial === 'string';

/** Show explanation block only after submit when explanation text exists. */
export const shouldShowExplanation = (
  submitted: boolean,
  explanation?: string,
): boolean => submitted && !!explanation;

/** Omit empty learner-body Text after an empty submit (@s5). */
export const shouldShowLearnerAnswerBody = (draft: string): boolean => draft.length > 0;
