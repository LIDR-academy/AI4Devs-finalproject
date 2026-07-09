import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { useState } from 'react';

import { RadioGroup } from './radio-group';

const meta = {
  title: 'Molecules/RadioGroup',
  component: RadioGroup,
  args: {
    options: [
      { value: 'short', label: 'Short lesson (5–8 slides)' },
      { value: 'standard', label: 'Standard lesson (10–14 slides)' },
      { value: 'deep', label: 'Deep dive (16+ slides)' },
    ],
    value: 'standard',
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

const InteractiveDemo = () => {
  const [value, setValue] = useState('standard');
  return (
    <RadioGroup
      options={[
        { value: 'short', label: 'Short lesson (5–8 slides)' },
        { value: 'standard', label: 'Standard lesson (10–14 slides)' },
        { value: 'deep', label: 'Deep dive (16+ slides)' },
      ]}
      value={value}
      onChange={setValue}
    />
  );
};

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
};

export const Row: Story = {
  args: {
    direction: 'row',
    options: ['Easy', 'Medium', 'Hard'],
    value: 'Medium',
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};
