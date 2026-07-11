/** True when R9/resume seeded a submitted string (including empty). */
export const isRehydratedSubmission = (initial?: string | null): boolean =>
  typeof initial === 'string';

/** Show explanation block only after submit when explanation text exists. */
export const shouldShowExplanation = (
  submitted: boolean,
  explanation?: string,
): boolean => submitted && !!explanation;
