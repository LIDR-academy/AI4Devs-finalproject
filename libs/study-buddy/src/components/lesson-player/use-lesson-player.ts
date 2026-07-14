import type { ActivityAnswer, Lesson } from '@helsoft/types';
import { useMemo, useReducer, useRef } from 'react';

import { buildLessonGradedAnswers } from './lesson-player.helpers';
import { lessonPlayerInitialState, lessonPlayerReducer } from './use-lesson-player.reducer';

export const useLessonPlayer = (lesson: Lesson) => {
  const [state, dispatch] = useReducer(lessonPlayerReducer, lessonPlayerInitialState);

  const contentCount = lesson.slides.length;
  const totalSteps = contentCount + 1;
  const maxIndex = contentCount;
  const isResultsSlide = state.currentIndex === maxIndex;
  const currentSlide = isResultsSlide ? null : (lesson.slides[state.currentIndex] ?? null);

  const gradedAnswers = useMemo(
    () => buildLessonGradedAnswers(lesson, state.answers),
    [lesson, state.answers],
  );

  const maxIndexRef = useRef(maxIndex);
  maxIndexRef.current = maxIndex;

  // Stable handler identities without useCallback (avoids empty-deps ArrayDeclaration mutants).
  const handlers = useRef({
    goNext: () => {
      dispatch({ type: 'next', maxIndex: maxIndexRef.current });
    },
    goBack: () => {
      dispatch({ type: 'back' });
    },
    onAnswered: (answer: ActivityAnswer) => {
      dispatch({ type: 'answer', slideId: answer.slideId, answer });
    },
    reset: () => {
      dispatch({ type: 'reset' });
    },
  }).current;

  return {
    currentIndex: state.currentIndex,
    answers: state.answers,
    attemptSaved: state.attemptSaved,
    persistOnMount: state.persistOnMount,
    totalSteps,
    contentCount,
    isResultsSlide,
    currentSlide,
    gradedAnswers,
    canGoBack: state.currentIndex > 0,
    canGoNext: !isResultsSlide,
    goNext: handlers.goNext,
    goBack: handlers.goBack,
    onAnswered: handlers.onAnswered,
    reset: handlers.reset,
  };
};
