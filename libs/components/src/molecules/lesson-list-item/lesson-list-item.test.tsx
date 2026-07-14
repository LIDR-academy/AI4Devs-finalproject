import { fireEvent, render, screen } from '@testing-library/react-native';

import { LessonListItem } from './lesson-list-item';

describe('LessonListItem', () => {
  it('renders title and created-date label and calls onOpen', async () => {
    const onOpen = jest.fn();
    await render(
      <LessonListItem
        title="Photosynthesis"
        createdDateLabel="Jul 13, 2026"
        openAccessibilityLabel="Open Photosynthesis"
        onOpen={onOpen}
      />,
    );

    expect(screen.getByText('Photosynthesis')).toBeTruthy();
    expect(screen.getByText('Jul 13, 2026')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Open Photosynthesis' }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
