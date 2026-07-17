import type { GradedAnswer, ScorableSlide } from '@helsoft/types';

import { scoreLesson } from './score-lesson';

// @s1 — a lesson with 3 system-checked slides, all answered correctly, scores 3 out of 3.
describe('scoreLesson', () => {
  it('scores correct === total when every system-checked slide is answered correctly', () => {
    const slides: ScorableSlide[] = [
      { id: 'slide-1', activityType: 'multiple-choice' },
      { id: 'slide-2', activityType: 'multiple-choice' },
      { id: 'slide-3', activityType: 'multiple-choice' },
    ];
    const answers: GradedAnswer[] = [
      { slideId: 'slide-1', activityType: 'multiple-choice', isCorrect: true },
      { slideId: 'slide-2', activityType: 'multiple-choice', isCorrect: true },
      { slideId: 'slide-3', activityType: 'multiple-choice', isCorrect: true },
    ];

    expect(scoreLesson(slides, answers)).toEqual({ correct: 3, total: 3, isScorable: true });
  });

  // @s2 — only system-checked slides (multiple-choice, fill-in-the-blank, matching) count
  // toward the total; flashcard and open-ended are excluded even if "answered correctly".
  it('excludes flashcard and open-ended slides from the total and correct count', () => {
    const slides: ScorableSlide[] = [
      { id: 'slide-1', activityType: 'multiple-choice' },
      { id: 'slide-2', activityType: 'multiple-choice' },
      { id: 'slide-3', activityType: 'fill-in-the-blank' },
      { id: 'slide-4', activityType: 'flashcard' },
      { id: 'slide-5', activityType: 'open-ended' },
    ];
    const answers: GradedAnswer[] = [
      { slideId: 'slide-1', activityType: 'multiple-choice', isCorrect: true },
      { slideId: 'slide-2', activityType: 'multiple-choice', isCorrect: true },
      { slideId: 'slide-3', activityType: 'fill-in-the-blank', isCorrect: true },
      { slideId: 'slide-4', activityType: 'flashcard', isCorrect: true },
      { slideId: 'slide-5', activityType: 'open-ended', isCorrect: true },
    ];

    expect(scoreLesson(slides, answers)).toEqual({ correct: 3, total: 3, isScorable: true });
  });

  // @s3 — a matching slide contributes exactly one whole-slide point, driven purely off
  // GradedAnswer.isCorrect (the matching grader owns pair aggregation, not the scorer).
  it.each([
    ['every pair correct', true, 1],
    ['at least one pair wrong', false, 0],
    ['an item left unpaired', false, 0],
  ] as const)('scores a matching slide as %s → isCorrect=%s → %i out of 1', (_pairing, isCorrect, expectedCorrect) => {
    const slides: ScorableSlide[] = [{ id: 'slide-1', activityType: 'matching' }];
    const answers: GradedAnswer[] = [{ slideId: 'slide-1', activityType: 'matching', isCorrect }];

    expect(scoreLesson(slides, answers)).toEqual({
      correct: expectedCorrect,
      total: 1,
      isScorable: true,
    });
  });

  // @s4 — a system-checked slide with no matching answer counts toward total but not correct.
  it('counts unanswered system-checked slides toward the total but not the correct count', () => {
    const slides: ScorableSlide[] = [
      { id: 'slide-1', activityType: 'multiple-choice' },
      { id: 'slide-2', activityType: 'multiple-choice' },
      { id: 'slide-3', activityType: 'multiple-choice' },
      { id: 'slide-4', activityType: 'multiple-choice' },
    ];
    const answers: GradedAnswer[] = [
      { slideId: 'slide-1', activityType: 'multiple-choice', isCorrect: true },
      { slideId: 'slide-2', activityType: 'multiple-choice', isCorrect: true },
    ];

    expect(scoreLesson(slides, answers)).toEqual({ correct: 2, total: 4, isScorable: true });
  });

  // task-2 Done criteria — total === 0 (nothing system-checked) returns isScorable: false and
  // never a 0/0 score, defensively ignoring any stray answers that reference no slide here.
  it('returns isScorable: false and correct/total of 0 when there are no system-checked slides', () => {
    const slides: ScorableSlide[] = [{ id: 'slide-1', activityType: 'flashcard' }];
    const answers: GradedAnswer[] = [
      { slideId: 'slide-1', activityType: 'flashcard', isCorrect: true },
    ];

    expect(scoreLesson(slides, answers)).toEqual({ correct: 0, total: 0, isScorable: false });
  });

  // task-2 Done criteria — an answer whose slideId is not a system-checked slide in `slides`
  // is ignored defensively (stray/foreign answer never inflates the correct count).
  it('ignores an answer whose slideId does not match a system-checked slide', () => {
    const slides: ScorableSlide[] = [{ id: 'slide-1', activityType: 'multiple-choice' }];
    const answers: GradedAnswer[] = [
      { slideId: 'slide-1', activityType: 'multiple-choice', isCorrect: true },
      { slideId: 'slide-does-not-exist', activityType: 'multiple-choice', isCorrect: true },
    ];

    expect(scoreLesson(slides, answers)).toEqual({ correct: 1, total: 1, isScorable: true });
  });
});
