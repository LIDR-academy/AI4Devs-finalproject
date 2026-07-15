import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import { layout, lightColors, spacing } from '../../theme';
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
    expect(scrim.props.style).toMatchObject({
      alignItems: 'flex-end',
      flex: 1,
      justifyContent: 'flex-start',
    });
    fireEvent.press(scrim);

    await waitFor(() => expect(screen.queryByText('ada@example.com')).toBeNull());
  });

  it('closes from native modal dismissal and isolates menu presses from the scrim', async () => {
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
    const stopPropagation = jest.fn();

    expect(menu.props.style).toMatchObject({
      backgroundColor: expect.any(String),
      borderRadius: expect.any(Number),
      gap: spacing.s2,
      padding: spacing.s3,
    });
    fireEvent(menu, 'press', { stopPropagation });
    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(screen.getByText('ada@example.com')).toBeOnTheScreen();
    expect(screen.getByText('Ada Lovelace').parent?.parent?.props.style).toMatchObject({
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.s2,
    });
    expect(screen.getByText('ada@example.com').props.style).toMatchObject({
      color: expect.any(String),
      fontSize: expect.any(Number),
    });
    expect(screen.getByText('Ada Lovelace').props.style).toMatchObject({
      color: expect.any(String),
      fontSize: expect.any(Number),
    });
    expect(screen.getByRole('menuitem', { name: 'Settings' }).props.style).toMatchObject({
      justifyContent: 'center',
    });
    expect(screen.getByText('Settings').props.style).toMatchObject({
      color: expect.any(String),
      fontSize: expect.any(Number),
    });

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

  it('closes from the native modal dismissal request', async () => {
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
    await screen.findByTestId('account-menu-scrim');
    await act(async () => {
      fireEvent(screen.getByTestId('account-menu-scrim').parent, 'requestClose');
    });

    await waitFor(() => expect(screen.queryByText('ada@example.com')).toBeNull());
  });
});
