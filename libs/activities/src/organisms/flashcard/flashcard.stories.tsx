import type { FlashcardAnswer, FlashcardSlide } from '@helsoft/types';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { Flashcard } from './flashcard';

const slide: FlashcardSlide = {
  id: 'slide-1',
  lessonId: 'lesson-1',
  title: 'Photosynthesis',
  content: 'What pigment absorbs light for photosynthesis?',
  position: 0,
  kind: 'activity',
  activityType: 'flashcard',
  back: 'Chlorophyll',
  explanation: 'Chlorophyll reflects green light, which is why plants look green.',
};

const recalledAnswer: FlashcardAnswer = {
  slideId: slide.id,
  activityType: 'flashcard',
  recalled: true,
  isCorrect: true,
};

const notRecalledAnswer: FlashcardAnswer = {
  slideId: slide.id,
  activityType: 'flashcard',
  recalled: false,
  isCorrect: false,
};

const meta = {
  title: 'Organisms/Flashcard',
  component: Flashcard,
  args: { slide },
} satisfies Meta<typeof Flashcard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Hidden: Story = {};

export const RevealedUnmarked: Story = {
  args: { initialRevealed: true },
};

export const RevealedRecalled: Story = {
  args: { initialAnswer: recalledAnswer },
};

export const RevealedNotRecalled: Story = {
  args: { initialAnswer: notRecalledAnswer },
};

export const WithoutExplanation: Story = {
  args: {
    slide: { ...slide, explanation: undefined },
    initialRevealed: true,
  },
};

export const UnavailableMissingBack: Story = {
  args: {
    slide: { ...slide, back: '' },
  },
};

export const UnavailableMissingFront: Story = {
  args: {
    slide: { ...slide, content: '' },
  },
};

export const Interactive: Story = {};
