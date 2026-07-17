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

const buttonStyle = (name: string) =>
  flattenStyle(screen.getByRole('button', { name }).props.style);

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

    const flat = buttonStyle('Log in');

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

  // --- Mutation kills: defaults, padding, variants, layout tokens ---

  it('defaults to row layout, flex-start, and medium label padding', async () => {
    await render(<Button onPress={jest.fn()}>Save</Button>);
    const flat = buttonStyle('Save');

    expect(flat.flexDirection).toBe('row');
    expect(flat.alignItems).toBe('center');
    expect(flat.justifyContent).toBe('center');
    expect(flat.overflow).toBe('hidden');
    expect(flat.alignSelf).toBe('flex-start');
    expect(flat.minHeight).toBe(40);
    expect(flat.paddingLeft).toBe(40);
    expect(flat.paddingRight).toBe(40);
  });

  it('defaults fullWidth to false and stretches when fullWidth is set', async () => {
    await render(<Button onPress={jest.fn()}>Narrow</Button>);
    expect(buttonStyle('Narrow').alignSelf).toBe('flex-start');

    await render(
      <Button onPress={jest.fn()} fullWidth>
        Wide
      </Button>,
    );
    expect(buttonStyle('Wide').alignSelf).toBe('stretch');
  });

  it('uses text-variant horizontal padding', async () => {
    await render(
      <Button onPress={jest.fn()} variant="text">
        Linky
      </Button>,
    );
    const flat = buttonStyle('Linky');
    expect(flat.paddingLeft).toBe(12);
    expect(flat.paddingRight).toBe(12);
  });

  it('uses square icon-only padding when there is no label', async () => {
    await render(<Button onPress={jest.fn()} icon="add" accessibilityLabel="Add only" />);
    const flat = buttonStyle('Add only');
    expect(flat.paddingLeft).toBe(20);
    expect(flat.paddingRight).toBe(20);
  });

  it('uses icon padding when a leading icon is paired with a label', async () => {
    await render(
      <Button onPress={jest.fn()} icon="add" accessibilityLabel="Add with label">
        Add
      </Button>,
    );
    const flat = buttonStyle('Add with label');
    expect(flat.paddingLeft).toBe(24);
    expect(flat.paddingRight).toBe(40);
  });

  it('uses text icon padding when a leading icon is paired with a text-variant label', async () => {
    await render(
      <Button onPress={jest.fn()} icon="add" variant="text" accessibilityLabel="Text add">
        Add
      </Button>,
    );
    const flat = buttonStyle('Text add');
    expect(flat.paddingLeft).toBe(16);
    expect(flat.paddingRight).toBe(12);
  });

  it('uses trailing-icon padding on the right when paired with a label', async () => {
    await render(
      <Button onPress={jest.fn()} trailingIcon="arrow_forward" accessibilityLabel="Next filled">
        Next
      </Button>,
    );
    const flat = buttonStyle('Next filled');
    expect(flat.paddingLeft).toBe(40);
    expect(flat.paddingRight).toBe(24);
  });

  it('uses text trailing-icon padding for text variant', async () => {
    await render(
      <Button
        onPress={jest.fn()}
        trailingIcon="arrow_forward"
        variant="text"
        accessibilityLabel="Next text"
      >
        Next
      </Button>,
    );
    expect(buttonStyle('Next text').paddingRight).toBe(16);
  });

  it('does not treat trailingIcon alone as requiring icon padding without a label', async () => {
    await render(
      <Button onPress={jest.fn()} trailingIcon="close" accessibilityLabel="Close only" />,
    );
    const flat = buttonStyle('Close only');
    expect(flat.paddingLeft).toBe(20);
    expect(flat.paddingRight).toBe(20);
  });

  it('attaches elevation shadow only for enabled elevated buttons', async () => {
    await render(
      <Button onPress={jest.fn()} variant="filled" accessibilityLabel="Filled shadow check">
        Filled
      </Button>,
    );
    const filledLen = [screen.getByRole('button', { name: 'Filled shadow check' }).props.style]
      .flat(Infinity)
      .filter(Boolean).length;

    await render(
      <Button onPress={jest.fn()} variant="elevated" accessibilityLabel="Elevated shadow check">
        Elevated
      </Button>,
    );
    const elevatedLen = [screen.getByRole('button', { name: 'Elevated shadow check' }).props.style]
      .flat(Infinity)
      .filter(Boolean).length;
    expect(elevatedLen).toBeGreaterThan(filledLen);

    await render(
      <Button
        onPress={jest.fn()}
        variant="elevated"
        disabled
        accessibilityLabel="Disabled elevated check"
      >
        Disabled
      </Button>,
    );
    const disabledLen = [
      screen.getByRole('button', { name: 'Disabled elevated check' }).props.style,
    ]
      .flat(Infinity)
      .filter(Boolean).length;
    expect(disabledLen).toBe(filledLen);
    expect(buttonStyle('Disabled elevated check').opacity).toBeLessThan(1);
  });

  it('exposes a non-empty state-layer test id', async () => {
    await render(<Button onPress={jest.fn()}>Save</Button>);
    expect(BUTTON_STATE_LAYER_TEST_ID.length).toBeGreaterThan(0);
    expect(screen.getByTestId(BUTTON_STATE_LAYER_TEST_ID)).toBeTruthy();
  });

  it('sizes PAD_X from the size token map for small and large labels', async () => {
    await render(
      <Button onPress={jest.fn()} size="small" accessibilityLabel="Small btn">
        Small
      </Button>,
    );
    expect(buttonStyle('Small btn').paddingLeft).toBe(32);

    await render(
      <Button onPress={jest.fn()} size="large" accessibilityLabel="Large btn">
        Large
      </Button>,
    );
    expect(buttonStyle('Large btn').paddingLeft).toBe(48);
  });

  it('colors the label from the variant foreground map', async () => {
    await render(
      <Button onPress={jest.fn()} variant="filled">
        Label color
      </Button>,
    );
    expect(flattenStyle(screen.getByText('Label color').props.style).color).toBeTruthy();
  });

  // Mutation: `variant = 'filled'` → `variant = ""` — default must resolve a real fg color.
  it('defaults variant to filled so the label foreground is defined', async () => {
    await render(<Button onPress={jest.fn()}>Default filled</Button>);
    const color = flattenStyle(screen.getByText('Default filled').props.style).color;
    expect(color).toBeTruthy();
    expect(color).not.toBe('');
  });

  it('resolves a defined label foreground for every named variant', async () => {
    for (const variant of ['filled', 'tonal', 'elevated', 'outlined', 'text'] as const) {
      await render(
        <Button onPress={jest.fn()} variant={variant} accessibilityLabel={`v-${variant}`}>
          {`Label ${variant}`}
        </Button>,
      );
      const color = flattenStyle(screen.getByText(`Label ${variant}`).props.style).color;
      expect(color).toBeTruthy();
    }
  });

  it('renders children text for tonal and outlined variants', async () => {
    await render(
      <Button onPress={jest.fn()} variant="tonal">
        Tonal
      </Button>,
    );
    expect(screen.getByText('Tonal')).toBeTruthy();
    expect(buttonStyle('Tonal').flexDirection).toBe('row');

    await render(
      <Button onPress={jest.fn()} variant="outlined">
        Outlined
      </Button>,
    );
    expect(screen.getByText('Outlined')).toBeTruthy();
    expect(buttonStyle('Outlined').flexDirection).toBe('row');
  });
});
