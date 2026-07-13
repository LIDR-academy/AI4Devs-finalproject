import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { useState } from 'react';

import { LessonGenerationPanel } from './lesson-generation-panel';

const meta = {
  title: 'Organisms/LessonGenerationPanel',
  component: LessonGenerationPanel,
  args: {
    composition: 'both',
    onCompositionChange: () => {},
    onGenerate: () => {},
  },
} satisfies Meta<typeof LessonGenerationPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

// Empty, Generate unavailable (@s1/@s16) — no extracted document yet.
export const EmptyGenerateDisabled: Story = {
  args: { state: 'empty', canGenerate: false },
};

// Empty, Generate available (@s16) — an extracted document is present.
export const EmptyGenerateEnabled: Story = {
  args: { state: 'empty', canGenerate: true },
};

// Loading (@s14) — the multi-step progress mid-flight; picker + Generate disabled.
export const Loading: Story = {
  args: { state: 'loading', canGenerate: true, currentStep: 'generating' },
};

// Content (@s17) — a ready summary + primary CTA to open the lesson in the player.
export const Content: Story = {
  args: { state: 'content', canGenerate: true, slideCount: 8, onOpenInPlayer: () => {} },
};

/** Interactive demo purely so the Playwright e2e can exercise choosing a composition, not just
 * assert each state's static markup like the stories above. */
const InteractivePickerDemo = () => {
  const [composition, setComposition] = useState<'instructional-only' | 'activity-only' | 'both'>(
    'both',
  );

  return (
    <LessonGenerationPanel
      state="empty"
      composition={composition}
      onCompositionChange={(value) => setComposition(value as typeof composition)}
      canGenerate={true}
      onGenerate={() => {}}
    />
  );
};

export const InteractivePicker: Story = {
  args: { state: 'empty', canGenerate: true },
  render: () => <InteractivePickerDemo />,
};
