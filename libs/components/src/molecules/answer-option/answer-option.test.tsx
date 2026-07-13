import { render, screen } from '@testing-library/react-native';

import { AnswerOption } from './answer-option';

describe('AnswerOption', () => {
  // Default accessible name (no override passed): marker + label, matching every existing
  // consumer's expectation (`multiple-choice.test.tsx`'s unanswered-state assertions).
  it('defaults its accessible name to the marker and label when no override is passed', async () => {
    await render(<AnswerOption marker="A" label="Paris" />);

    expect(screen.getByRole('button')).toHaveAccessibleName('A Paris');
  });

  // Full-review Round 2 (mutation survivor, `answer-option.tsx:50`) — `toHaveAccessibleName` alone
  // does not kill a mutant that replaces the `${marker} ${label}` fallback with `""`: RTL's
  // `computeAccessibleName` treats an empty-string `accessibilityLabel` as unset and falls back to
  // concatenating the tile's own child `Text` nodes (marker + label), which happens to reconstruct
  // the exact same string for this component's fixed render shape (regressed by RTL's own fallback
  // algorithm, not this component). Assert the actual `accessibilityLabel` prop passed to the
  // `Pressable` directly to make the fallback expression itself observable.
  it('passes the computed marker-and-label string as the actual accessibilityLabel prop, not via child-text fallback', async () => {
    await render(<AnswerOption marker="A" label="Paris" />);

    expect(screen.getByRole('button').props.accessibilityLabel).toBe('A Paris');
  });

  // Full-review Round 1 (blocker) — a feedback icon (`check_circle`/`cancel`) renders as a plain
  // sibling `Text`, so RN's default accessible-name computation concatenates its literal ligature
  // name into the option's name (e.g. "A Paris check_circle"). An explicit `accessibilityLabel`
  // override lets composers (the `MultipleChoice` organism) convey correctness through real words
  // instead, without that internal icon-font identifier ever reaching assistive tech.
  it('lets an explicit accessibilityLabel override the default computed name', async () => {
    await render(
      <AnswerOption
        marker="A"
        label="Paris"
        state="correct"
        accessibilityLabel="A Paris, Correct!"
      />,
    );

    const button = screen.getByRole('button');
    expect(button).toHaveAccessibleName('A Paris, Correct!');
    expect(button).not.toHaveAccessibleName(/check_circle/);
  });
});
