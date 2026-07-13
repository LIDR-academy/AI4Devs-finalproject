import { isSystemCheckedActivity, SYSTEM_CHECKED_ACTIVITY_TYPES } from './activity-type';

// @s2 — only system-checked activity types count toward the score; flashcard and open-ended
// are self-marked/ungraded and must be excluded.
describe('isSystemCheckedActivity', () => {
  it.each(
    SYSTEM_CHECKED_ACTIVITY_TYPES,
  )('returns true for the system-checked type "%s"', (activityType) => {
    expect(isSystemCheckedActivity(activityType)).toBe(true);
  });

  it.each([
    'flashcard',
    'open-ended',
  ] as const)('returns false for the excluded type "%s"', (activityType) => {
    expect(isSystemCheckedActivity(activityType)).toBe(false);
  });
});
