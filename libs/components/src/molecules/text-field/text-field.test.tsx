import { render, screen } from '@testing-library/react-native';

import { TextField } from './text-field';

describe('TextField', () => {
  // Full-review Round 2 — TextField already owns `error`; it should derive `accessibilityInvalid`
  // from it internally (mirroring how every sibling atom/molecule derives its own
  // `accessibilityState` from an owned prop) rather than requiring every consumer to pass a
  // second, duplicate a11y-only prop in lockstep with `error`.
  it('derives accessibilityInvalid from error when no explicit accessibilityInvalid is passed', async () => {
    await render(<TextField accessibilityLabel="Email" error />);

    expect(screen.getByLabelText('Email').props.accessibilityInvalid).toBe(true);
  });

  it('defaults accessibilityInvalid to false when error is false and none is passed explicitly', async () => {
    await render(<TextField accessibilityLabel="Email" />);

    expect(screen.getByLabelText('Email').props.accessibilityInvalid).toBe(false);
  });

  it('lets an explicit accessibilityInvalid override the value derived from error', async () => {
    await render(<TextField accessibilityLabel="Email" error accessibilityInvalid={false} />);

    expect(screen.getByLabelText('Email').props.accessibilityInvalid).toBe(false);
  });
});
