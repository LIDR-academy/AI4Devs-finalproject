import type { GradedAnswer } from './graded-answer';
import type { OpenEndedAnswer } from './activity-answer';
import type { OpenEndedSlide } from './lesson';
import { isSystemCheckedActivity } from './activity-type';

// @s6 — answered-state is submitted-only (no grade) and excluded from R7.
describe('OpenEndedAnswer / OpenEndedSlide (@s6)', () => {
  it('expresses submitted-only answered state without isCorrect', () => {
    const answer: OpenEndedAnswer = {
      slideId: 'slide-1',
      activityType: 'open-ended',
      submittedAnswer: 'photosynthesis converts light to chemical energy',
    };

    expect(answer.slideId).toBe('slide-1');
    expect(answer.activityType).toBe('open-ended');
    expect(answer.submittedAnswer).toBe('photosynthesis converts light to chemical energy');
    expect(answer).not.toHaveProperty('isCorrect');
  });

  it('allows empty submittedAnswer for resume', () => {
    const answer: OpenEndedAnswer = {
      slideId: 'slide-1',
      activityType: 'open-ended',
      submittedAnswer: '',
    };

    expect(answer.submittedAnswer).toBe('');
  });

  it('does not structurally satisfy GradedAnswer (no isCorrect to assign)', () => {
    const answer: OpenEndedAnswer = {
      slideId: 'slide-1',
      activityType: 'open-ended',
      submittedAnswer: 'x',
    };

    // Runtime stand-in for the type-level exclusion: GradedAnswer requires isCorrect.
    const asRecord = answer as unknown as Record<string, unknown>;
    expect('isCorrect' in asRecord).toBe(false);

    const gradedCandidates: GradedAnswer[] = [];
    // Compiles only if we fabricate isCorrect — OpenEndedAnswer alone is not GradedAnswer.
    if ('isCorrect' in asRecord && typeof asRecord.isCorrect === 'boolean') {
      gradedCandidates.push({
        slideId: answer.slideId,
        activityType: answer.activityType,
        isCorrect: asRecord.isCorrect,
      });
    }
    expect(gradedCandidates).toHaveLength(0);
  });

  it('OpenEndedSlide carries modelAnswer and optional explanation', () => {
    const slide: OpenEndedSlide = {
      id: 'slide-1',
      lessonId: 'lesson-1',
      title: 'Explain',
      content: 'What is photosynthesis?',
      position: 0,
      kind: 'activity',
      activityType: 'open-ended',
      modelAnswer: 'Conversion of light energy into chemical energy.',
      explanation: 'Key process in plants.',
    };

    expect(slide.modelAnswer.length).toBeGreaterThan(0);
    expect(slide.explanation).toBe('Key process in plants.');
  });

  it('is excluded from system-checked scoring', () => {
    expect(isSystemCheckedActivity('open-ended')).toBe(false);
  });
});
