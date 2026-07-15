import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { Text } from 'react-native';

import { layout, lightColors, spacing } from '../../theme';
import { MobileBar } from './mobile-bar';

describe('MobileBar', () => {
  it('renders a compact top app bar and safe-area-aware bottom navigation', async () => {
    await render(
      <MobileBar
        avatar={<Text>HL</Text>}
        home={{ label: 'Home', onPress: jest.fn() }}
        newLesson={{ label: 'New lesson', onPress: jest.fn() }}
        safeAreaInsetBottom={24}
        title={<Text>Home</Text>}
      />,
    );

    expect(screen.getByTestId('mobile-top-bar')).toBeOnTheScreen();
    expect(within(screen.getByTestId('mobile-top-bar')).getByText('Home')).toBeOnTheScreen();
    expect(screen.getByText('HL')).toBeOnTheScreen();
    expect(screen.getByTestId('mobile-bottom-bar').props.style).toMatchObject({
      backgroundColor: lightColors.surfaceContainer,
      flexDirection: 'row',
      paddingBottom: spacing.s2 + 24,
      justifyContent: 'space-around',
    });
    expect(screen.getByTestId('mobile-top-bar').props.style).toMatchObject({
      alignItems: 'center',
      backgroundColor: lightColors.surface,
      flexDirection: 'row',
      gap: spacing.s3,
      minHeight: layout.touchTarget,
    });
    expect(
      within(screen.getByTestId('mobile-top-bar')).getByText('Home').parent?.props.style,
    ).toMatchObject({
      flex: 1,
    });
    expect(screen.getAllByRole('link', { name: 'Home' })).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'New lesson' })).toBeOnTheScreen();
  });

  it('forwards primary destination presses to its injected handlers', async () => {
    const onHomePress = jest.fn();
    const onNewLessonPress = jest.fn();

    await render(
      <MobileBar
        avatar={<Text>HL</Text>}
        home={{ label: 'Home', onPress: onHomePress }}
        newLesson={{ label: 'New lesson', onPress: onNewLessonPress }}
        title={<Text>Home</Text>}
      />,
    );

    fireEvent.press(screen.getByRole('link', { name: 'Home' }));
    fireEvent.press(screen.getByRole('link', { name: 'New lesson' }));

    expect(onHomePress).toHaveBeenCalledTimes(1);
    expect(onNewLessonPress).toHaveBeenCalledTimes(1);
  });
});
