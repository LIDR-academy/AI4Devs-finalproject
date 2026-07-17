import { fireEvent, render, screen } from '@testing-library/react-native';

import { layout } from '../../theme/spacing';
import { LessonListItem } from './lesson-list-item';

/** Unistyles style fns may return nested/array styles under Jest — flatten for assertions. */
const flattenStyle = (style: unknown): Record<string, unknown> =>
  Object.assign({}, ...[style].flat(Infinity).filter(Boolean));

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

  // Mutation: `onDelete && deleteAccessibilityLabel` → true / || — both required to show delete.
  it('does not render a delete control when deleteAccessibilityLabel is missing', async () => {
    await render(
      <LessonListItem
        title="Photosynthesis"
        createdDateLabel="Jul 13, 2026"
        openAccessibilityLabel="Open Photosynthesis"
        onOpen={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: /Delete/i })).toBeNull();
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('does not render a delete control when onDelete is missing', async () => {
    await render(
      <LessonListItem
        title="Photosynthesis"
        createdDateLabel="Jul 13, 2026"
        openAccessibilityLabel="Open Photosynthesis"
        onOpen={jest.fn()}
        deleteAccessibilityLabel="Delete Photosynthesis"
      />,
    );

    expect(screen.queryByRole('button', { name: 'Delete Photosynthesis' })).toBeNull();
  });

  it('renders a delete control when both onDelete and deleteAccessibilityLabel are set', async () => {
    const onDelete = jest.fn();
    await render(
      <LessonListItem
        title="Photosynthesis"
        createdDateLabel="Jul 13, 2026"
        openAccessibilityLabel="Open Photosynthesis"
        onOpen={jest.fn()}
        onDelete={onDelete}
        deleteAccessibilityLabel="Delete Photosynthesis"
      />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Delete Photosynthesis' }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  // Full-review blocker [a11y] WCAG 2.5.5 — delete must meet layout.touchTarget (48), not IconButton default 40.
  it('sizes the delete control to the 48dp touch-target token', async () => {
    await render(
      <LessonListItem
        title="Photosynthesis"
        createdDateLabel="Jul 13, 2026"
        openAccessibilityLabel="Open Photosynthesis"
        onOpen={jest.fn()}
        onDelete={jest.fn()}
        deleteAccessibilityLabel="Delete Photosynthesis"
      />,
    );

    const flat = flattenStyle(
      screen.getByRole('button', { name: 'Delete Photosynthesis' }).props.style,
    );
    expect(flat.width).toBe(layout.touchTarget);
    expect(flat.height).toBe(layout.touchTarget);
  });
});
