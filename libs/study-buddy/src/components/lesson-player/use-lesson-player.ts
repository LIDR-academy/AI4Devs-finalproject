import type { ActivityAnswer, Lesson } from '@helsoft/types';
import { useCallback, useMemo, useReducer, useRef } from 'react';

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

  const goNext = useCallback(() => {
    dispatch({ type: 'next', maxIndex: maxIndexRef.current });
  }, []);

  const goBack = useCallback(() => {
    dispatch({ type: 'back' });
  }, []);

  const onAnswered = useCallback((answer: ActivityAnswer) => {
    dispatch({ type: 'answer', slideId: answer.slideId, answer });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'reset' });
  }, []);

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
    goNext,
    goBack,
    onAnswered,
    reset,
  };
};
