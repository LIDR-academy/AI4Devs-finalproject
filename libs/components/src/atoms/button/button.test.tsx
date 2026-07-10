import { render, screen } from '@testing-library/react-native';

import { layout } from '../../theme/spacing';
import { Button } from './button';

describe('Button', () => {
  // Touch target (WCAG 2.5.5 AAA / platform HIG): the default `medium` size is a fixed 40dp
  // tall box — a `hitSlop` expands the tappable area to the project's own 48dp touch-target
  // token without changing the visual box, so the control still meets the touch-target bar.
  it('exposes a hitSlop that reaches the 48dp touch-target token', async () => {
    await render(<Button onPress={jest.fn()}>Log in</Button>);

    const { hitSlop } = screen.getByRole('button', { name: 'Log in' }).props;
    const BUTTON_MEDIUM_HEIGHT = 40;

    expect(hitSlop.top + hitSlop.bottom + BUTTON_MEDIUM_HEIGHT).toBeGreaterThanOrEqual(layout.touchTarget);
  });

  // Dynamic type (WCAG 1.4.4): under an enlarged OS font size the label's line-height can
  // exceed a fixed box, so the box uses a `minHeight` floor (not a fixed `height`) and can
  // grow with content instead of clipping the label. `overflow: hidden` stays — it also
  // clips StateLayer's hover/press wash to the button's rounded shape.
  it('lets the box grow with content instead of clipping the label', async () => {
    await render(<Button onPress={jest.fn()}>Log in</Button>);

    const style = screen.getByRole('button', { name: 'Log in' }).props.style;
    const flat = Object.assign({}, ...[style].flat(Infinity).filter(Boolean));

    expect(flat.height).toBeUndefined();
    expect(flat.minHeight).toBe(40);
  });
});
