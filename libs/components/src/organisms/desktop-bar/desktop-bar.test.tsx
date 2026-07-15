import { fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { DesktopBar } from './desktop-bar';

describe('DesktopBar', () => {
  it('renders the desktop brand, primary destinations, visual alerts, and avatar slot', async () => {
    await render(
      <DesktopBar
        avatar={<Text>HL</Text>}
        home={{ label: 'Home', onPress: jest.fn() }}
        newLesson={{ label: 'New lesson', onPress: jest.fn() }}
      />,
    );

    expect(screen.getByText('AI Study Buddy')).toBeOnTheScreen();
    expect(screen.getByRole('link', { name: 'Home' })).toBeOnTheScreen();
    expect(screen.getByRole('link', { name: 'New lesson' })).toBeOnTheScreen();
    expect(screen.getByTestId('desktop-alerts')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Alerts' })).toBeNull();
    expect(screen.getByText('HL')).toBeOnTheScreen();
  });

  it('forwards primary destination presses to its injected handlers', async () => {
    const onHomePress = jest.fn();
    const onNewLessonPress = jest.fn();

    await render(
      <DesktopBar
        avatar={<Text>HL</Text>}
        home={{ label: 'Home', onPress: onHomePress }}
        newLesson={{ label: 'New lesson', onPress: onNewLessonPress }}
      />,
    );

    fireEvent.press(screen.getByRole('link', { name: 'Home' }));
    fireEvent.press(screen.getByRole('link', { name: 'New lesson' }));

    expect(onHomePress).toHaveBeenCalledTimes(1);
    expect(onNewLessonPress).toHaveBeenCalledTimes(1);
  });
});
