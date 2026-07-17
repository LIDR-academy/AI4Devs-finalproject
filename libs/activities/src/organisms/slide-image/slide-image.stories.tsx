import type { Decorator, Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';

import { configureSlideImageUrlMock } from '../../../.storybook/mocks/hooks';
import { SlideImage } from './slide-image';

const withSlideImageUrlMock =
  (config: Parameters<typeof configureSlideImageUrlMock>[0]): Decorator =>
  (StoryFn) => {
    configureSlideImageUrlMock(config);
    return <StoryFn />;
  };

const meta = {
  title: 'Organisms/SlideImage',
  component: SlideImage,
  decorators: [
    (Story) => (
      <View style={{ width: 320, padding: 16 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof SlideImage>;

export default meta;

type Story = StoryObj<typeof meta>;

// @s7 — Content: signed URL provided via Storybook hooks mock.
export const WithImage: Story = {
  decorators: [
    withSlideImageUrlMock({
      url: 'https://picsum.photos/seed/lesson-player/400/300',
      isLoading: false,
    }),
  ],
  args: {
    image: {
      imageId: 'img-1',
      storagePath: 'demo/diagram.png',
      width: 400,
      height: 300,
      alt: 'A sample diagram',
    },
  },
};

// @s8 — no image → renders nothing.
export const NoImage: Story = {
  args: {
    image: undefined,
  },
};

// @s9 — ref present but resolution failed → renders nothing (text-only degrade).
export const UnresolvableImage: Story = {
  decorators: [withSlideImageUrlMock({ url: null, isLoading: false })],
  args: {
    image: {
      imageId: 'img-missing',
      storagePath: 'demo/missing.png',
      width: 400,
      height: 300,
      alt: 'Missing diagram',
    },
  },
};
