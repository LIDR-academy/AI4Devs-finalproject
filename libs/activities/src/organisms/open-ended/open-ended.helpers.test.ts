import {
  isRehydratedSubmission,
  shouldShowExplanation,
  shouldShowLearnerAnswerBody,
} from './open-ended.helpers';

describe('open-ended.helpers', () => {
  describe('isRehydratedSubmission', () => {
    it('is true for a string seed including empty', () => {
      expect(isRehydratedSubmission('typed')).toBe(true);
      expect(isRehydratedSubmission('')).toBe(true);
    });

    it('is false for null or undefined', () => {
      expect(isRehydratedSubmission(null)).toBe(false);
      expect(isRehydratedSubmission(undefined)).toBe(false);
    });
  });

  describe('shouldShowExplanation', () => {
    it('is true only when submitted and explanation is non-empty', () => {
      expect(shouldShowExplanation(true, 'Why')).toBe(true);
      expect(shouldShowExplanation(true, '')).toBe(false);
      expect(shouldShowExplanation(true, undefined)).toBe(false);
      expect(shouldShowExplanation(false, 'Why')).toBe(false);
    });
  });

  describe('shouldShowLearnerAnswerBody', () => {
    it('is true only for non-empty draft text', () => {
      expect(shouldShowLearnerAnswerBody('answer')).toBe(true);
      expect(shouldShowLearnerAnswerBody('')).toBe(false);
    });
  });
});
