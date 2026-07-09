import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { useState } from 'react';
import { View } from 'react-native';

import { Chip } from './chip';

const meta = {
  title: 'Atoms/Chip',
  component: Chip,
  args: {
    label: 'Biology',
  },
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Assist: Story = {
  args: { icon: 'menu_book' },
};

export const FilterSelected: Story = {
  args: { type: 'filter', selected: true },
};

const FilterDemo = () => {
  const [selected, setSelected] = useState<string[]>(['Biology']);
  const toggle = (subject: string) =>
    setSelected((prev) => (prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]));
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {['Biology', 'History', 'Physics', 'Spanish'].map((subject) => (
        <Chip
          key={subject}
          type="filter"
          label={subject}
          selected={selected.includes(subject)}
          onPress={() => toggle(subject)}
        />
      ))}
    </View>
  );
};

export const FilterGroup: Story = {
  render: () => <FilterDemo />,
};

export const Input: Story = {
  args: { type: 'input', label: 'chapter-3.pdf', icon: 'upload_file', onRemove: () => {} },
};

export const Disabled: Story = {
  args: { disabled: true },
};
