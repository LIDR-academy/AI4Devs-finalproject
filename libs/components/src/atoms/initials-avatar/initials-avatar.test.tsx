import { fireEvent, render, screen } from '@testing-library/react-native';

import { layout } from '../../theme';
import { InitialsAvatar } from './initials-avatar';

describe('InitialsAvatar', () => {
  it('renders session initials as an accessible avatar trigger', async () => {
    const onPress = jest.fn();

    await render(
      <InitialsAvatar
        initials="AL"
        accessibilityLabel="Open Ada Lovelace account menu"
        onPress={onPress}
      />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Open Ada Lovelace account menu' }));

    expect(screen.getByText('AL')).toBeOnTheScreen();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('uses a theme-sized touch target', async () => {
    await render(<InitialsAvatar initials="AL" />);

    expect(screen.getByText('AL').parent?.props.style[0]).toMatchObject({
      height: layout.touchTarget,
      width: layout.touchTarget,
    });
  });
});
