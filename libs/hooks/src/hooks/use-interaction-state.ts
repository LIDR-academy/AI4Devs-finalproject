import { useState } from 'react';

export type InteractionState = {
  hover: boolean;
  press: boolean;
  /** Keyboard/programmatic focus (WCAG 2.4.7, review round-1 fix N6) — tracked the same way as
   * `hover`/`press`, via the Pressable's own `onFocus`/`onBlur`. */
  focus: boolean;
  handlers: {
    onHoverIn: () => void;
    onHoverOut: () => void;
    onPressIn: () => void;
    onPressOut: () => void;
    onFocus: () => void;
    onBlur: () => void;
  };
};

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
