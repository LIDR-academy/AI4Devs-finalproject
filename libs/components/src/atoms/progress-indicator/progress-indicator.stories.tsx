import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';

import { ProgressIndicator } from './progress-indicator';

const meta = {
  title: 'Atoms/ProgressIndicator',
  component: ProgressIndicator,
} satisfies Meta<typeof ProgressIndicator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LinearDeterminate: Story = {
  args: { value: 60 },
  render: (args) => (
    <View style={{ width: 320 }}>
      <ProgressIndicator {...args} />
    </View>
  ),
};

export const LinearIndeterminate: Story = {
  render: () => (
    <View style={{ width: 320 }}>
      <ProgressIndicator />
    </View>
  ),
};

export const CircularDeterminate: Story = {
  args: { variant: 'circular', value: 70 },
};

export const CircularIndeterminate: Story = {
  args: { variant: 'circular' },
};

export const CircularSteps: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      {[10, 25, 50, 75, 100].map((v) => (
        <ProgressIndicator key={v} variant="circular" value={v} />
      ))}
    </View>
  ),
};
