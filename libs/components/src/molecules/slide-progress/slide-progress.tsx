import { Pressable, type StyleProp, View, type ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export type SlideType = 'lesson' | 'activity';

export type SlideProgressSlide = { type: SlideType };

export type SlideProgressProps = {
  slides?: SlideProgressSlide[];
  /** Index of the active slide. */
  current?: number;
  onSeek?: (index: number) => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * SlideProgress — segmented lesson tracker; the signature blue/rust motif.
 * One segment per slide: blue = instructional, rust = activity; filled up to `current`.
 */
export const SlideProgress = ({ slides = [], current = 0, onSeek, style }: SlideProgressProps) => (
  <View style={[styles.track, style]}>
    {slides.map((slide, i) => {
      const done = i < current;
      const active = i === current;
      const isActivity = slide.type === 'activity';
      return (
        <Pressable
          // biome-ignore lint/suspicious/noArrayIndexKey: segments are purely positional — the index IS the identity
          key={i}
          accessibilityRole="button"
          accessibilityLabel={`${isActivity ? 'Activity' : 'Lesson'} ${i + 1}`}
          disabled={!onSeek}
          onPress={() => onSeek?.(i)}
          style={styles.segment}
        >
          {active ? <View pointerEvents="none" style={styles.activeRing(isActivity)} /> : null}
          <View style={styles.fill(isActivity, done, active)} />
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create((theme) => ({
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'stretch',
  },
  segment: {
    flex: 1,
    minWidth: 8,
    height: 6,
  },
  activeRing: (isActivity: boolean) => ({
    position: 'absolute',
    top: -4,
    bottom: -4,
    left: -4,
    right: -4,
    borderWidth: 2,
    borderColor: theme.utils.hexWithOpacity(
      isActivity ? theme.colors.tertiary : theme.colors.primary,
      0.4,
    ),
    borderRadius: theme.shape.full,
  }),
  fill: (isActivity: boolean, done: boolean, active: boolean) => ({
    flex: 1,
    borderRadius: theme.shape.full,
    backgroundColor:
      done || active
        ? isActivity
          ? theme.colors.tertiary
          : theme.colors.primary
        : theme.colors.surfaceContainerHighest,
    opacity: done && !active ? 0.85 : 1,
  }),
}));
