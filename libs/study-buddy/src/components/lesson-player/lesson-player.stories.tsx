import type { Lesson } from '@helsoft/types';
import type { Decorator, Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';
import { expect, userEvent } from 'storybook/test';

import { configureLessonAttemptMock } from '../../../.storybook/mocks/hooks';
import { LessonPlayer } from './lesson-player';

const withLessonAttemptMock =
  (config: Parameters<typeof configureLessonAttemptMock>[0]): Decorator =>
  (StoryFn) => {
    configureLessonAttemptMock(config);
    return <StoryFn />;
  };

const lesson: Lesson = {
  id: 'lesson-1',
  userId: 'user-1',
  title: 'Capitals',
  createdAt: '2026-07-12T12:00:00.000Z',
  slides: [
    {
      id: 's1',
      lessonId: 'lesson-1',
      title: 'Welcome',
      content: 'This lesson covers European capitals.',
      position: 0,
      kind: 'instructional',
    },
    {
      id: 's2',
      lessonId: 'lesson-1',
      title: 'France',
      content: 'What is the capital of France?',
      position: 1,
      kind: 'activity',
      activityType: 'multiple-choice',
      options: [
        { id: 'a', label: 'Paris' },
        { id: 'b', label: 'Lyon' },
        { id: 'c', label: 'Marseille' },
      ],
      correctOptionId: 'a',
    },
    {
      id: 's3',
      lessonId: 'lesson-1',
      title: 'Germany',
      content: 'What is the capital of Germany?',
      position: 2,
      kind: 'activity',
      activityType: 'multiple-choice',
      options: [
        { id: 'a', label: 'Berlin' },
        { id: 'b', label: 'Munich' },
      ],
      correctOptionId: 'a',
    },
    {
      id: 's4',
      lessonId: 'lesson-1',
      title: 'Summary',
      content: 'You have reached the end of the content slides.',
      position: 3,
      kind: 'instructional',
    },
  ],
};

const meta = {
  title: 'Features/LessonPlayer',
  component: LessonPlayer,
  decorators: [
    withLessonAttemptMock({ status: 'idle' }),
    (Story) => (
      <View style={{ width: 400, height: 640, padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  args: {
    lesson,
    onBackToLessons: () => {},
  },
} satisfies Meta<typeof LessonPlayer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FirstSlide: Story = {};

/** Mid-deck — advance twice to the Germany activity (@s2). */
export const MidDeck: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await expect(canvas.getByText('Germany')).toBeTruthy();
    await expect(canvas.getByText('Slide 3 of 5')).toBeTruthy();
  },
};

/** Results — advance through all content into the terminal results slide (@s13). */
export const ResultsSlide: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Next' }));
    await expect(canvas.getByText('Slide 5 of 5')).toBeTruthy();
  },
};

export const WithImageSlide: Story = {
  args: {
    lesson: {
      ...lesson,
      slides: [
        {
          ...lesson.slides[0],
          image: {
            imageId: 'img-1',
            storagePath: 'demo/diagram.png',
            width: 400,
            height: 300,
            alt: 'A diagram',
          },
        },
        ...lesson.slides.slice(1),
      ],
    },
  },
};
