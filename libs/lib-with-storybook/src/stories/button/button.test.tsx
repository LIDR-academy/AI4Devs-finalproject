import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from './button';

describe('Button', () => {
  it('renders its label', async () => {
    await render(<Button label="Save" />);

    expect(screen.getByText('Save')).toBeTruthy();
  });

  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    await render(<Button label="Save" onPress={onPress} />);

    await fireEvent.press(screen.getByText('Save'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
