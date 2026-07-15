import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
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
});
