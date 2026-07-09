import { useState } from 'react';

export type InteractionState = {
  hover: boolean;
  press: boolean;
  handlers: {
    onHoverIn: () => void;
    onHoverOut: () => void;
    onPressIn: () => void;
    onPressOut: () => void;
  };
};

/** Shared hover/press bookkeeping for Pressable atoms; press clears on hover-out (drag-off cancel). */
export const useInteractionState = (): InteractionState => {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);

  return {
    hover,
    press,
    handlers: {
      onHoverIn: () => setHover(true),
      onHoverOut: () => {
        setHover(false);
        setPress(false);
      },
      onPressIn: () => setPress(true),
      onPressOut: () => setPress(false),
    },
  };
};
