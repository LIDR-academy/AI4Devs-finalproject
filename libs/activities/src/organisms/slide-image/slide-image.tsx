import { useSlideImageUrl } from '@helsoft/hooks';
import { Image } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { SlideImageProps } from './slide-image.types';

/**
 * SlideImage — resolves a signed URL via useSlideImageUrl and renders it scaled to fit.
 * Renders nothing when there is no url (text-only degrade).
 */
export const SlideImage = ({ image }: SlideImageProps) => {
  const { url } = useSlideImageUrl(image);
  if (!url || !image) return null;

  const aspectRatio = image.width > 0 && image.height > 0 ? image.width / image.height : 1;

  return (
    <Image
      testID="slide-image"
      source={{ uri: url }}
      accessible={Boolean(image.alt)}
      accessibilityLabel={image.alt || undefined}
      resizeMode="contain"
      style={styles.image(aspectRatio)}
    />
  );
};

const styles = StyleSheet.create(() => ({
  image: (aspectRatio: number) => ({
    width: '100%' as const,
    aspectRatio,
  }),
}));
