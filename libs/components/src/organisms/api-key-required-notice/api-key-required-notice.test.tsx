import { fireEvent, render, screen } from '@testing-library/react-native';

import { lightColors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { ApiKeyRequiredNotice } from './api-key-required-notice';

const labels = {
  message: 'An API key is required to generate lessons.',
  action: 'Add API key',
};

describe('ApiKeyRequiredNotice', () => {
  // @s10 — the guard message is rendered inline.
  it('renders the required-key message', async () => {
    await render(<ApiKeyRequiredNotice onNavigateToAccount={jest.fn()} labels={labels} />);

    expect(screen.getByText('An API key is required to generate lessons.')).toBeTruthy();
  });

  // @s10/@s14 — the action exposes a button role (via the Button atom) and fires
  // onNavigateToAccount when pressed.
  it('calls onNavigateToAccount when the action is pressed', async () => {
    const onNavigateToAccount = jest.fn();
    await render(
      <ApiKeyRequiredNotice onNavigateToAccount={onNavigateToAccount} labels={labels} />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Add API key' }));

    expect(onNavigateToAccount).toHaveBeenCalledTimes(1);
  });

  // task-14 (Slice 3) — re-verifying @s14's generation-entry-guard half as its own, explicit
  // a11y assertion (independent of the interaction test above): the notice's action must expose
  // a button role regardless of whether it is ever pressed.
  it('exposes a button role on the action', async () => {
    await render(<ApiKeyRequiredNotice onNavigateToAccount={jest.fn()} labels={labels} />);

    expect(screen.getByRole('button', { name: labels.action })).toBeTruthy();
  });

  // Mutation Round 2 — StyleSheet assertions, following language-selector.test.tsx's
  // toHaveStyle precedent with react-native-unistyles. Guards the flat `notice` layout style.
  it('stacks the notice contents with the standard vertical gap', async () => {
    await render(<ApiKeyRequiredNotice onNavigateToAccount={jest.fn()} labels={labels} />);

    const notice = screen.getByText(labels.message).parent;

    expect(notice).toHaveStyle({ gap: spacing.s4 });
  });

  // Guards the `message` typography+color style.
  it('renders the message with the standard body typography and neutral color', async () => {
    await render(<ApiKeyRequiredNotice onNavigateToAccount={jest.fn()} labels={labels} />);

    expect(screen.getByText(labels.message)).toHaveStyle({
      ...typography.bodyMedium,
      color: lightColors.onSurfaceVariant,
    });
  });
});
