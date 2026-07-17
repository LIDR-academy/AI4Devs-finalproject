import type { Decorator, Meta, StoryObj } from '@storybook/react-native-web-vite';

import { configureLessonGenerationMock } from '../../../.storybook/mocks/hooks';
import { LessonGeneration } from './lesson-generation';

const withLessonGenerationMock =
  (config: Parameters<typeof configureLessonGenerationMock>[0]): Decorator =>
  (StoryFn) => {
    configureLessonGenerationMock(config);
    return <StoryFn />;
  };

const meta = {
  title: 'Features/LessonGeneration',
  component: LessonGeneration,
  args: {
    documentId: 'doc-story-1',
  },
} satisfies Meta<typeof LessonGeneration>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Idle with document — composition picker + Generate enabled. */
export const Ready: Story = {
  decorators: [withLessonGenerationMock({ stage: 'idle' })],
};

/** No documentId yet — Generate stays disabled. */
export const AwaitDocument: Story = {
  args: { documentId: undefined },
  decorators: [withLessonGenerationMock({ stage: 'idle' })],
};

/** Generating — multi-step progress mid-flight. */
export const Generating: Story = {
  decorators: [withLessonGenerationMock({ stage: 'generating', currentStep: 'generating' })],
};

/** Content — ready summary + open-in-player CTA. */
export const ReadyLesson: Story = {
  decorators: [
    withLessonGenerationMock({
      stage: 'content',
      result: {
        lessonId: 'lesson-story-1',
        title: 'Photosynthesis basics',
        composition: 'both',
        slides: [],
      },
    }),
  ],
};

/** Error, retryable — timeout with Try again affordance. */
export const ErrorRetryable: Story = {
  decorators: [withLessonGenerationMock({ stage: 'error', error: 'timeout' })],
};

/** Error, settings recovery — missing_key routes to settings. */
export const ErrorMissingKey: Story = {
  decorators: [withLessonGenerationMock({ stage: 'error', error: 'missing_key' })],
};
