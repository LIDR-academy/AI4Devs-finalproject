import { ItemVisualState, MatchingItemView, MatchingLabels, MatchingPairSelection, MatchingResult, PendingSelection } from "./matching.types";


export const findPairForItem = (
    pairs: MatchingPairSelection[],
    itemId: string,
): MatchingPairSelection | undefined =>
    pairs.find((pair) => pair.leftId === itemId || pair.rightId === itemId);


export const itemAccessibilityLabel = (item: MatchingItemView, state: ItemVisualState, labels: MatchingLabels): string => {
    if (state === 'correct') return `${item.label}, ${labels.correctPair}`;
    if (state === 'incorrect') return `${item.label}, ${labels.incorrectPair}`;
    return item.label;
};