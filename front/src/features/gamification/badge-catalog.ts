/**
 * Client mirror of the backend badge catalog. Used to render the full badge grid on the
 * achievements page, including locked badges (those the user has not yet earned) with their
 * unlock condition.
 */
export interface BadgeDefinition {
  code: string;
  label: string;
  description: string;
  unlockCondition: string;
}

export const BADGE_CATALOG: readonly BadgeDefinition[] = [
  {
    code: "FIRST_SAVE",
    label: "First Save",
    description: "You consumed your first item before it expired.",
    unlockCondition: "Consume your first item before it expires",
  },
  {
    code: "SAVER_10",
    label: "Saver 10",
    description: "You consumed 10 items before they expired.",
    unlockCondition: "Consume 10 items before expiry",
  },
  {
    code: "SAVER_50",
    label: "Saver 50",
    description: "You consumed 50 items before they expired.",
    unlockCondition: "Consume 50 items before expiry",
  },
  {
    code: "SAVER_100",
    label: "Saver 100",
    description: "You consumed 100 items before they expired.",
    unlockCondition: "Consume 100 items before expiry",
  },
  {
    code: "MONEY_SAVER_10",
    label: "Money Saver",
    description: "You saved €10 worth of food from going to waste.",
    unlockCondition: "Save €10 worth of food from waste",
  },
  {
    code: "ZERO_WASTE_WEEK",
    label: "Zero Waste Week",
    description: "You completed a full week with no wasted items.",
    unlockCondition: "Complete a full week (Mon–Sun) with no wasted items",
  },
] as const;
