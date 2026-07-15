import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import { useAccountMenu } from './use-account-menu';

const AccountMenuHookHarness = () => {
  const { open, setOpen } = useAccountMenu();

  return (
    <>
      <Text>{open ? 'Open' : 'Closed'}</Text>
      <Pressable accessibilityLabel="Open menu" onPress={() => setOpen(true)}>
        <Text>Open menu</Text>
      </Pressable>
      <Pressable accessibilityLabel="Close menu" onPress={() => setOpen(false)}>
        <Text>Close menu</Text>
      </Pressable>
    </>
  );
};

describe('useAccountMenu', () => {
  it('opens and closes the account menu', async () => {
    await render(<AccountMenuHookHarness />);

    expect(screen.getByText('Closed')).toBeOnTheScreen();

    fireEvent.press(screen.getByText('Open menu'));
    await waitFor(() => expect(screen.getByText('Open')).toBeOnTheScreen());

    fireEvent.press(screen.getByText('Close menu'));
    await waitFor(() => expect(screen.getByText('Closed')).toBeOnTheScreen());
  });

  it('listens for Escape only while open and removes the listener on close', async () => {
    let keydownListener: ((event: { key?: string }) => void) | undefined;
    const addEventListener = jest.fn(
      (_type: string, listener: (event: { key?: string }) => void) => {
        keydownListener = listener;
      },
    );
    const removeEventListener = jest.fn();
    const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
    Object.defineProperty(globalThis, 'document', {
      configurable: true,
      value: { addEventListener, removeEventListener },
    });

    try {
      await render(<AccountMenuHookHarness />);

      expect(addEventListener).not.toHaveBeenCalled();
      fireEvent.press(screen.getByText('Open menu'));
      await waitFor(() =>
        expect(addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function)),
      );

      await act(async () => {
        keydownListener?.({ key: 'Enter' });
      });
      expect(screen.getByText('Open')).toBeOnTheScreen();

      await act(async () => {
        keydownListener?.({ key: 'Escape' });
      });
      await waitFor(() => expect(screen.getByText('Closed')).toBeOnTheScreen());
      expect(removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function));
    } finally {
      if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument);
      else Reflect.deleteProperty(globalThis, 'document');
    }
  });
});
