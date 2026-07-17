import { useState } from 'react';

import type { InteractionState } from './use-interaction-state.types';

/** Shared hover/press/focus bookkeeping for Pressable atoms; press clears on hover-out (drag-off
 * cancel). */
export const useInteractionState = (): InteractionState => {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const [focus, setFocus] = useState(false);

  return {
    hover,
    press,
    focus,
    handlers: {
      onHoverIn: () => setHover(true),
      onHoverOut: () => {
        setHover(false);
        setPress(false);
      },
      onPressIn: () => setPress(true),
      onPressOut: () => setPress(false),
      onFocus: () => setFocus(true),
      onBlur: () => setFocus(false),
    },
  };
};
