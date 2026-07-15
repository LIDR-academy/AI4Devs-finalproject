import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import { layout, lightColors } from '../../theme';
import { AccountMenu } from './account-menu';

describe('AccountMenu', () => {
  it('shows identity, Settings, and error-styled Sign out without Help', async () => {
    await render(
      <AccountMenu
        email="ada@example.com"
        identityLabel="Ada Lovelace"
        initials="AL"
        onSettings={jest.fn()}
        onSignOut={jest.fn()}
        renderTrigger={({ onPress }) => (
          <Pressable accessibilityLabel="Open account menu" onPress={onPress}>
            <Text>AL</Text>
          </Pressable>
        )}
        settingsLabel="Settings"
        signOutLabel="Sign out"
      />,
    );

    fireEvent.press(screen.getByText('AL'));

    expect(await screen.findByText('Ada Lovelace')).toBeOnTheScreen();
    expect(screen.getByText('ada@example.com')).toBeOnTheScreen();
    expect(screen.getByText('Settings')).toBeOnTheScreen();
    expect(screen.getByText('Sign out').props.style).toMatchObject({
      color: lightColors.error,
    });
    expect(screen.queryByText('Help and feedback')).toBeNull();
  });

  it('forwards Settings and closes the menu after selection', async () => {
    const onSettings = jest.fn();

    await render(
      <AccountMenu
        email="ada@example.com"
        identityLabel="Ada Lovelace"
        initials="AL"
        onSettings={onSettings}
        onSignOut={jest.fn()}
        renderTrigger={({ onPress }) => (
          <Pressable accessibilityLabel="Open account menu" onPress={onPress}>
            <Text>AL</Text>
          </Pressable>
        )}
        settingsLabel="Settings"
        signOutLabel="Sign out"
      />,
    );

    fireEvent.press(screen.getByText('AL'));
    await screen.findByText('Settings');
    fireEvent.press(screen.getByRole('menuitem', { name: 'Settings' }));

    expect(onSettings).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByText('ada@example.com')).toBeNull());
  });

  it('forwards Sign out and closes the menu after selection', async () => {
    const onSignOut = jest.fn();

    await render(
      <AccountMenu
        email="ada@example.com"
        identityLabel="Ada Lovelace"
        initials="AL"
        onSettings={jest.fn()}
        onSignOut={onSignOut}
        renderTrigger={({ onPress }) => (
          <Pressable accessibilityLabel="Open account menu" onPress={onPress}>
            <Text>AL</Text>
          </Pressable>
        )}
        settingsLabel="Settings"
        signOutLabel="Sign out"
      />,
    );

    fireEvent.press(screen.getByText('AL'));
    await screen.findByText('Sign out');
    fireEvent.press(screen.getByRole('menuitem', { name: 'Sign out' }));

    expect(onSignOut).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByText('ada@example.com')).toBeNull());
  });

  it('uses theme-sized touch targets for menu rows', async () => {
    await render(
      <AccountMenu
        email="ada@example.com"
        identityLabel="Ada Lovelace"
        initials="AL"
        onSettings={jest.fn()}
        onSignOut={jest.fn()}
        renderTrigger={({ onPress }) => (
          <Pressable accessibilityLabel="Open account menu" onPress={onPress}>
            <Text>AL</Text>
          </Pressable>
        )}
        settingsLabel="Settings"
        signOutLabel="Sign out"
      />,
    );

    fireEvent.press(screen.getByText('AL'));

    expect((await screen.findByRole('menuitem', { name: 'Settings' })).props.style).toMatchObject({
      minHeight: layout.touchTarget,
    });
    expect(screen.getByRole('menuitem', { name: 'Sign out' }).props.style).toMatchObject({
      minHeight: layout.touchTarget,
    });
  });

  it('dismisses from a full-bleed outside press area', async () => {
    await render(
      <AccountMenu
        email="ada@example.com"
        identityLabel="Ada Lovelace"
        initials="AL"
        onSettings={jest.fn()}
        onSignOut={jest.fn()}
        renderTrigger={({ expanded, onPress }) => (
          <Pressable
            accessibilityLabel="Open account menu"
            accessibilityState={{ expanded }}
            onPress={onPress}
          >
            <Text>AL</Text>
          </Pressable>
        )}
        settingsLabel="Settings"
        signOutLabel="Sign out"
      />,
    );

    fireEvent.press(screen.getByText('AL'));

    expect((await screen.findByLabelText('Open account menu')).props.accessibilityState).toEqual({
      expanded: true,
    });
    const scrim = screen.getByTestId('account-menu-scrim');
    expect(scrim.props.style).toMatchObject({ flex: 1 });
    fireEvent.press(scrim);

    await waitFor(() => expect(screen.queryByText('ada@example.com')).toBeNull());
  });

  it('dismisses with Escape on web', async () => {
    await render(
      <AccountMenu
        email="ada@example.com"
        identityLabel="Ada Lovelace"
        initials="AL"
        onSettings={jest.fn()}
        onSignOut={jest.fn()}
        renderTrigger={({ onPress }) => (
          <Pressable accessibilityLabel="Open account menu" onPress={onPress}>
            <Text>AL</Text>
          </Pressable>
        )}
        settingsLabel="Settings"
        signOutLabel="Sign out"
      />,
    );

    fireEvent.press(screen.getByText('AL'));
    const menu = await screen.findByTestId('account-menu');
    fireEvent(menu, 'accessibilityEscape');

    await waitFor(() => expect(screen.queryByText('ada@example.com')).toBeNull());
  });
});
