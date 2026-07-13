import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export type StateLayerProps = {
  /** Content color washed over the container; defaults to onSurface. */
  color?: string;
  /** Use theme.stateLayerOpacity values; 0 hides the layer. */
  opacity: number;
  /** Optional, for consumers that need to assert the wash's opacity directly in tests. */
  testID?: string;
};

/**
 * StateLayer — MD3 interaction state layer: an absolute-fill translucent wash
 * of the content color shown on hover/focus/press/drag.
 * The parent container must set overflow: 'hidden' to clip it to its shape.
 */
export const StateLayer = ({ color, opacity, testID }: StateLayerProps) => (
  <View testID={testID} pointerEvents="none" style={styles.layer(color, opacity)} />
);

const styles = StyleSheet.create((theme) => ({
  layer: (color: string | undefined, opacity: number) => ({
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: color ?? theme.colors.onSurface,
    opacity,
  }),
}));
