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

    const avatar = screen.getByText('AL').parent;
    expect(avatar?.type).toBe('View');
    expect(screen.queryByRole('button')).toBeNull();
    expect(avatar?.props.style[0]).toMatchObject({
      alignItems: 'center',
      backgroundColor: expect.any(String),
      height: layout.touchTarget,
      justifyContent: 'center',
      width: layout.touchTarget,
    });
    expect(screen.getByText('AL').props.style).toMatchObject({
      color: expect.any(String),
      fontSize: expect.any(Number),
    });
  });

  it('preserves custom styling on the interactive avatar', async () => {
    await render(
      <InitialsAvatar
        accessibilityLabel="Open account menu"
        initials="AL"
        onPress={jest.fn()}
        style={{ opacity: 0.5 }}
      />,
    );

    expect(screen.getByRole('button', { name: 'Open account menu' }).props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ opacity: 0.5 })]),
    );
  });
});
