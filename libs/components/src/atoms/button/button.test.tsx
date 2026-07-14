import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { layout } from '../../theme/spacing';
import { BUTTON_STATE_LAYER_TEST_ID, Button } from './button';

/** Unistyles' `StyleSheet.create` style functions return a plain (possibly nested/array) style
 * value under Jest — flattened the same way the existing "lets the box grow" test below already
 * does, so a single style property can be asserted directly regardless of that shape. */
const flattenStyle = (style: unknown): Record<string, unknown> =>
  Object.assign({}, ...[style].flat(Infinity).filter(Boolean));

const stateLayerOpacity = (): unknown =>
  flattenStyle(screen.getByTestId(BUTTON_STATE_LAYER_TEST_ID).props.style).opacity;

describe('Button', () => {
  // Touch target (WCAG 2.5.5 AAA / platform HIG): the default `medium` size is a fixed 40dp
  // tall box — a `hitSlop` expands the tappable area to the project's own 48dp touch-target
  // token without changing the visual box, so the control still meets the touch-target bar.
  it('exposes a hitSlop that reaches the 48dp touch-target token', async () => {
    await render(<Button onPress={jest.fn()}>Log in</Button>);

    const { hitSlop } = screen.getByRole('button', { name: 'Log in' }).props;
    const BUTTON_MEDIUM_HEIGHT = 40;

    expect(hitSlop.top + hitSlop.bottom + BUTTON_MEDIUM_HEIGHT).toBeGreaterThanOrEqual(
      layout.touchTarget,
    );
  });

  // Dynamic type (WCAG 1.4.4): under an enlarged OS font size the label's line-height can
  // exceed a fixed box, so the box uses a `minHeight` floor (not a fixed `height`) and can
  // grow with content instead of clipping the label. `overflow: hidden` stays — it also
  // clips StateLayer's hover/press wash to the button's rounded shape.
  it('lets the box grow with content instead of clipping the label', async () => {
    await render(<Button onPress={jest.fn()}>Log in</Button>);

    const flat = flattenStyle(screen.getByRole('button', { name: 'Log in' }).props.style);

    expect(flat.height).toBeUndefined();
    expect(flat.minHeight).toBe(40);
  });

  // N6 (accessibility review round-1 fix, WCAG 2.4.7) — a keyboard-focused button must show a
  // visible state-layer wash, the same way hover/press already do, instead of no indicator at all.
  it('shows a visible state-layer wash when the button gains keyboard focus', async () => {
    await render(<Button onPress={jest.fn()}>Log in</Button>);
    const buttonElement = screen.getByRole('button', { name: 'Log in' });

    expect(stateLayerOpacity()).toBe(0);

    await act(async () => {
      await fireEvent(buttonElement, 'focus');
    });

    expect(stateLayerOpacity()).toBeGreaterThan(0);
  });

  // Optional a11y name override (PdfDocumentListItem primary action).
  it('uses accessibilityLabel as the accessible name when provided', async () => {
    await render(
      <Button onPress={jest.fn()} accessibilityLabel="Generate notes.pdf">
        Generate
      </Button>,
    );

    expect(screen.getByRole('button', { name: 'Generate notes.pdf' })).toBeTruthy();
    expect(screen.getByText('Generate')).toBeTruthy();
  });

  // N6 — blurring clears the focus wash again.
  it('clears the state-layer wash when the button loses focus', async () => {
    await render(<Button onPress={jest.fn()}>Log in</Button>);
    const buttonElement = screen.getByRole('button', { name: 'Log in' });

    await act(async () => {
      await fireEvent(buttonElement, 'focus');
    });
    await act(async () => {
      await fireEvent(buttonElement, 'blur');
    });

    expect(stateLayerOpacity()).toBe(0);
  });
});
