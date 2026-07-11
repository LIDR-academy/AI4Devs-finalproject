import type { MatchingAnswer, MatchingPair, MatchingSlide } from '@helsoft/types';

/**
 * True iff the slide is renderable/gradable: both columns non-empty, equal length, and
 * correctPairs is a perfect matching whose leftId/rightId all reference distinct items.
 *
 * Guards are ordered so each is independently observable (no overlapping early-returns that
 * make ConditionalExpression→false mutants equivalent). Item-id Set-size checks are omitted —
 * with equal lengths, duplicate column ids are always caught by the pair-loop uniqueness /
 * membership guards (pigeonhole).
 */
export const isMatchingSlideValid = (slide: MatchingSlide): boolean => {
  const { leftItems, rightItems, correctPairs } = slide;
  // Empty left alone rejects both-empty (0===0 would otherwise pass later length checks).
  if (leftItems.length === 0) return false;
  // Extra items in one column with pairs sized to the other would otherwise look valid.
  if (leftItems.length !== rightItems.length) return false;
  if (leftItems.length !== correctPairs.length) return false;

  const leftIds = new Set(leftItems.map((item) => item.id));
  const rightIds = new Set(rightItems.map((item) => item.id));

  const usedLeft = new Set<string>();
  const usedRight = new Set<string>();
  for (const pair of correctPairs) {
    if (!leftIds.has(pair.leftId)) return false;
    if (!rightIds.has(pair.rightId)) return false;
    if (usedLeft.has(pair.leftId)) return false;
    if (usedRight.has(pair.rightId)) return false;
    usedLeft.add(pair.leftId);
    usedRight.add(pair.rightId);
  }
  return true;
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
