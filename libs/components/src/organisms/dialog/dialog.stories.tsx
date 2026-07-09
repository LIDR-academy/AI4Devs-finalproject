import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '../../atoms/button/button';
import { Dialog } from './dialog';

const meta = {
  title: 'Organisms/Dialog',
  component: Dialog,
  args: {
    open: true,
    headline: 'Delete this lesson?',
    children: 'This removes “Photosynthesis basics” and its progress. You can’t undo this.',
    confirmLabel: 'Delete lesson',
    cancelLabel: 'Keep it',
  },
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

const InteractiveDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Button onPress={() => setOpen(true)}>Open dialog</Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
        headline="Delete this lesson?"
        confirmLabel="Delete lesson"
        cancelLabel="Keep it"
      >
        This removes “Photosynthesis basics” and its progress. You can’t undo this.
      </Dialog>
    </View>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
};

export const WithIcon: Story = {
  args: {
    icon: 'auto_awesome',
    headline: 'Lesson ready!',
    children: 'We found 4 key concepts and built 12 slides from your PDF.',
    confirmLabel: 'Start learning',
    cancelLabel: 'Review outline',
  },
};
