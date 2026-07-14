import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import type { LessonListState } from './lesson-list.types';

type UseLessonListArgs = {
  state: LessonListState;
  loadingLabel: string;
  emptyLabel: string;
  errorLabel: string;
};

/**
 * Announces Loading / Empty / Error to assistive tech (WCAG 4.1.3 / @s16) and owns the
 * delete-confirmation Dialog open state (pending lesson id).
 * accessibilityLiveRegion covers Android/Web; iOS needs announceForAccessibility.
 */
export const useLessonList = ({
  state,
  loadingLabel,
  emptyLabel,
  errorLabel,
}: UseLessonListArgs) => {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (state === 'loading') {
      AccessibilityInfo.announceForAccessibility(loadingLabel);
    } else if (state === 'empty') {
      AccessibilityInfo.announceForAccessibility(emptyLabel);
    } else if (state === 'error') {
      AccessibilityInfo.announceForAccessibility(errorLabel);
    }
  }, [state, loadingLabel, emptyLabel, errorLabel]);

  return { pendingDeleteId, setPendingDeleteId };
};
