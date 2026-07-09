import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { useState } from 'react';

import { Switch } from './switch';

const meta = {
  title: 'Atoms/Switch',
  component: Switch,
  args: {
    label: 'Shuffle activities',
  },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

const InteractiveDemo = () => {
  const [checked, setChecked] = useState(true);
  return <Switch label="Shuffle activities" checked={checked} onChange={setChecked} />;
};

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
};

export const On: Story = {
  args: { checked: true },
};

export const Off: Story = {
  args: { checked: false },
};

export const Disabled: Story = {
  args: { disabled: true, checked: true },
};
