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
