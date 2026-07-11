import type { MatchingAnswer, MatchingPair, MatchingSlide } from '@helsoft/types';

/**
 * True iff the slide is renderable/gradable: both columns non-empty, equal length, and
 * correctPairs is a perfect matching whose leftId/rightId all reference distinct items.
 */
export const isMatchingSlideValid = (slide: MatchingSlide): boolean => {
  const { leftItems, rightItems, correctPairs } = slide;
  if (leftItems.length === 0 || rightItems.length === 0) return false;
  if (leftItems.length !== rightItems.length || leftItems.length !== correctPairs.length) return false;

  const leftIds = new Set(leftItems.map((item) => item.id));
  const rightIds = new Set(rightItems.map((item) => item.id));
  if (leftIds.size !== leftItems.length || rightIds.size !== rightItems.length) return false;

  const usedLeft = new Set<string>();
  const usedRight = new Set<string>();
  for (const pair of correctPairs) {
    if (!leftIds.has(pair.leftId) || !rightIds.has(pair.rightId)) return false;
    if (usedLeft.has(pair.leftId) || usedRight.has(pair.rightId)) return false;
    usedLeft.add(pair.leftId);
    usedRight.add(pair.rightId);
  }
  return usedLeft.size === leftItems.length && usedRight.size === rightItems.length;
};

/**
 * Pure grader for a matching slide — no I/O, the correct pairing arrives on the slide.
 * A learner pair is correct iff an identical {leftId,rightId} exists in slide.correctPairs.
 * Throws if the slide is invalid or a pair references an unknown left/right id.
 */
export const gradeMatching = (slide: MatchingSlide, pairs: MatchingPair[]): MatchingAnswer => {
  if (!isMatchingSlideValid(slide)) {
    throw new Error('gradeMatching: slide is not a valid matching slide');
  }

  const leftIds = new Set(slide.leftItems.map((item) => item.id));
  const rightIds = new Set(slide.rightItems.map((item) => item.id));
  for (const pair of pairs) {
    if (!leftIds.has(pair.leftId) || !rightIds.has(pair.rightId)) {
      throw new Error(
        `gradeMatching: pair {leftId:"${pair.leftId}",rightId:"${pair.rightId}"} references an unknown item`,
      );
    }
  }

  const correctSet = new Set(slide.correctPairs.map((pair) => `${pair.leftId}:${pair.rightId}`));
  const gradedPairs = pairs.map((pair) => ({
    leftId: pair.leftId,
    rightId: pair.rightId,
    isCorrect: correctSet.has(`${pair.leftId}:${pair.rightId}`),
  }));
  const correctPairCount = gradedPairs.filter((pair) => pair.isCorrect).length;
  const totalPairCount = slide.correctPairs.length;

  return {
    slideId: slide.id,
    activityType: 'matching',
    pairs: gradedPairs,
    correctPairCount,
    totalPairCount,
    isCorrect: correctPairCount === totalPairCount,
  };
};
