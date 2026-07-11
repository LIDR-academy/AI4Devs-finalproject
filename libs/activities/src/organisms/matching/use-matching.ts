import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

import { ItemVisualState, MatchingItemView, MatchingPairSelection, PendingSelection, UseMatchingProps } from './matching.types';
import { findPairForItem } from './matching.helpers';

/**
 * Matching interaction + derived state for the matching organism.
 * Owns ephemeral tap-to-pair while unsubmitted; locks from `result` once graded.
 */
export const useMatching = ({
  leftItems,
  rightItems,
  unavailable = false,
  initialPairs = [],
  result,
  labels,
}: UseMatchingProps) => {
  const [pending, setPending] = useState<PendingSelection>(null);
  const [formedPairs, setFormedPairs] = useState<MatchingPairSelection[]>(initialPairs);

  const locked = !!result;
  // Empty columns return early below — once past that guard, length > 0 is implied.
  const allPaired = formedPairs.length === leftItems.length;
  // null (not '') while unsubmitted — empty string is never rendered and is mutation-blind.
  const resultLabel = result ? (result.isCorrect ? labels.correct : labels.incorrect) : null;
  // One-column empty is also unequal; both-empty is 0===0 so needs an explicit empty guard.
  const isEmpty = leftItems.length === 0;
  const isUnequal = leftItems.length !== rightItems.length;
  const isUnavailable = unavailable || isEmpty || isUnequal;

  useEffect(() => {
    if (!result || Platform.OS === 'android') return;
    // Announce from result directly — resultLabel is non-null whenever result is set.
    AccessibilityInfo.announceForAccessibility(
      result.isCorrect ? labels.correct : labels.incorrect,
    );
  }, [result, labels.correct, labels.incorrect]);

  const itemState = (column: 'left' | 'right', id: string): ItemVisualState => {
    if (result) {
      const graded = result.pairs.find((pair) =>
        column === 'left' ? pair.leftId === id : pair.rightId === id,
      );
      if (graded) return graded.isCorrect ? 'correct' : 'incorrect';
      return undefined;
    }
    if (pending?.column === column && pending.id === id) return 'pending';
    if (findPairForItem(formedPairs, id)) return 'paired';
    return undefined;
  };


  return {
    pending,
    locked,
    allPaired,
    formedPairs,
    resultLabel,
    isUnavailable,
    setPending,
    setFormedPairs,
    itemState,
  };
};
