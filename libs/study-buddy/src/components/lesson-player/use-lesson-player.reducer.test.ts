import type { ActivityAnswer } from '@helsoft/types';

import { lessonPlayerInitialState, lessonPlayerReducer } from './use-lesson-player.reducer';

describe('lessonPlayerReducer', () => {
  // Review finding #1 — persistOnMount lives in reducer state, not parallel useState.
  it('entering results sets persistOnMount and attemptSaved atomically on next', () => {
    const afterContent = lessonPlayerReducer(lessonPlayerInitialState, {
      type: 'next',
      maxIndex: 2,
    });
    expect(afterContent.currentIndex).toBe(1);
    expect(afterContent.persistOnMount).toBe(true);
    expect(afterContent.attemptSaved).toBe(false);

    const enteringResults = lessonPlayerReducer(afterContent, { type: 'next', maxIndex: 2 });
    expect(enteringResults.currentIndex).toBe(2);
    expect(enteringResults.persistOnMount).toBe(true);
    expect(enteringResults.attemptSaved).toBe(true);
  });

  it('re-entering results sets persistOnMount false without clearing attemptSaved', () => {
    let state = lessonPlayerInitialState;
    state = lessonPlayerReducer(state, { type: 'next', maxIndex: 2 });
    state = lessonPlayerReducer(state, { type: 'next', maxIndex: 2 }); // results, first save
    state = lessonPlayerReducer(state, { type: 'back' });
    state = lessonPlayerReducer(state, { type: 'next', maxIndex: 2 }); // re-enter

    expect(state.currentIndex).toBe(2);
    expect(state.persistOnMount).toBe(false);
    expect(state.attemptSaved).toBe(true);
  });

  it('reset clears answers, attemptSaved, and restores persistOnMount', () => {
    const answered: ActivityAnswer = {
      slideId: 's2',
      activityType: 'multiple-choice',
      selectedOptionId: 'a',
      correctOptionId: 'a',
      isCorrect: true,
    };
    let state = lessonPlayerReducer(lessonPlayerInitialState, {
      type: 'answer',
      slideId: 's2',
      answer: answered,
    });
    state = lessonPlayerReducer(state, { type: 'next', maxIndex: 2 });
    state = lessonPlayerReducer(state, { type: 'next', maxIndex: 2 });
    state = lessonPlayerReducer(state, { type: 'reset' });

    expect(state).toEqual(lessonPlayerInitialState);
    expect(state.persistOnMount).toBe(true);
    expect(state.attemptSaved).toBe(false);
    expect(state.answers).toEqual({});
  });
});
