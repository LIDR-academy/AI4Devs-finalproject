import { render, screen } from '@testing-library/react-native';
import { Animated } from 'react-native';

import { ProgressIndicator } from './progress-indicator';
import * as helpers from './progress-indicator.helpers';

describe('ProgressIndicator', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders a named linear determinate bar with clamped fill width', async () => {
    await render(
      <ProgressIndicator
        variant="linear"
        value={40}
        accessibilityLabel="Loading 40%"
        thickness={4}
      />,
    );

    const bar = screen.getByLabelText('Loading 40%');
    expect(bar.props.accessibilityRole).toBe('progressbar');
    expect(bar.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 40 });
    expect(bar.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ alignSelf: 'stretch', height: 4, overflow: 'hidden' }),
      ]),
    );

    const fill = screen.getByTestId('progress-linear-fill');
    expect(fill.props.style).toEqual(expect.objectContaining({ width: '40%', height: '100%' }));
  });

  // Mutation — color/trackColor use ?? (theme fallback), not &&.
  it('applies explicit color and trackColor overrides', async () => {
    await render(
      <ProgressIndicator
        variant="linear"
        value={40}
        color="#112233"
        trackColor="#aabbcc"
        accessibilityLabel="Custom colors"
        thickness={4}
      />,
    );
    expect(screen.getByTestId('progress-linear-fill').props.style).toEqual(
      expect.objectContaining({ backgroundColor: '#112233' }),
    );
    expect(screen.getByLabelText('Custom colors').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ backgroundColor: '#aabbcc' })]),
    );
  });

  it('falls back to theme colors when color and trackColor are omitted', async () => {
    await render(
      <ProgressIndicator
        variant="linear"
        value={40}
        accessibilityLabel="Theme colors"
        thickness={4}
      />,
    );
    const fill = screen.getByTestId('progress-linear-fill').props.style as {
      backgroundColor: string;
    };
    const track = (
      screen.getByLabelText('Theme colors').props.style as Array<{ backgroundColor?: string }>
    ).find((entry) => entry && typeof entry === 'object' && 'backgroundColor' in entry);
    expect(fill.backgroundColor).toBeTruthy();
    expect(track?.backgroundColor).toBeTruthy();
    expect(fill.backgroundColor).not.toBe(track?.backgroundColor);
  });

  it('clamps linear fill width for out-of-range values', async () => {
    await render(<ProgressIndicator variant="linear" value={150} accessibilityLabel="over" />);
    expect(screen.getByTestId('progress-linear-fill').props.style).toEqual(
      expect.objectContaining({ width: '100%' }),
    );

    await render(<ProgressIndicator variant="linear" value={-5} accessibilityLabel="under" />);
    expect(screen.getByTestId('progress-linear-fill').props.style).toEqual(
      expect.objectContaining({ width: '0%' }),
    );
  });

  it('renders circular determinate with track, size box, and right arc when value > 0', async () => {
    await render(
      <ProgressIndicator
        variant="circular"
        value={50}
        size={48}
        thickness={4}
        accessibilityLabel="Half"
      />,
    );

    const bar = screen.getByLabelText('Half');
    expect(bar.props.accessibilityRole).toBe('progressbar');
    // Mutation — circular a11y value must keep min/max/now (not {}).
    expect(bar.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 50 });
    expect(bar.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ width: 48, height: 48 })]),
    );
    expect(screen.getByTestId('progress-circular-track').props.style).toEqual(
      expect.objectContaining({
        position: 'absolute',
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 4,
      }),
    );
    expect(screen.getByTestId('progress-arc-right')).toBeTruthy();
    expect(screen.queryByTestId('progress-arc-left')).toBeNull();
  });

  // Mutation — rightArcRotate / leftArcRotate applied to arc transform.
  it('rotates arcs using rightArcRotate and leftArcRotate', async () => {
    await render(
      <ProgressIndicator
        variant="circular"
        value={25}
        size={48}
        color="#00ff00"
        accessibilityLabel="Quarter"
      />,
    );
    const rightWindow = screen.getByTestId('progress-arc-right');
    const rightArc = Array.isArray(rightWindow.children)
      ? rightWindow.children[0]
      : rightWindow.children;
    expect(
      (rightArc as unknown as { props: { style: Record<string, unknown> } }).props.style,
    ).toEqual(
      expect.objectContaining({
        transform: [{ rotate: `${helpers.rightArcRotate(90)}deg` }],
        borderRightColor: '#00ff00',
      }),
    );

    await render(
      <ProgressIndicator
        variant="circular"
        value={75}
        size={48}
        color="#00ff00"
        accessibilityLabel="Most"
      />,
    );
    const leftWindow = screen.getByTestId('progress-arc-left');
    const leftArc = Array.isArray(leftWindow.children)
      ? leftWindow.children[0]
      : leftWindow.children;
    expect(
      (leftArc as unknown as { props: { style: Record<string, unknown> } }).props.style,
    ).toEqual(
      expect.objectContaining({
        transform: [{ rotate: `${helpers.leftArcRotate(270)}deg` }],
      }),
    );
  });

  it('renders both arcs when circular value is above 50%', async () => {
    await render(
      <ProgressIndicator variant="circular" value={75} size={40} accessibilityLabel="Most" />,
    );
    expect(screen.getByTestId('progress-arc-right')).toBeTruthy();
    expect(screen.getByTestId('progress-arc-left')).toBeTruthy();
  });

  it('does not render arcs when circular value is 0', async () => {
    await render(
      <ProgressIndicator variant="circular" value={0} size={48} accessibilityLabel="Empty" />,
    );
    expect(screen.queryByTestId('progress-arc-right')).toBeNull();
    expect(screen.queryByTestId('progress-arc-left')).toBeNull();
    expect(screen.getByTestId('progress-circular-track')).toBeTruthy();
  });

  it('does not start an indeterminate loop when value is determinate', async () => {
    const runSpy = jest.spyOn(helpers, 'runIndeterminateLoop');
    await render(
      <ProgressIndicator variant="circular" value={50} size={48} accessibilityLabel="Half" />,
    );
    expect(runSpy).not.toHaveBeenCalled();
  });

  it('renders circular indeterminate spinner chrome', async () => {
    await render(<ProgressIndicator variant="circular" size={48} accessibilityLabel="Wait" />);
    const spinner = screen.getByTestId('progress-circular-spinner');
    expect(spinner.props.style).toEqual(
      expect.objectContaining({
        position: 'absolute',
        width: 48,
        height: 48,
        transform: expect.arrayContaining([expect.objectContaining({ rotate: expect.anything() })]),
      }),
    );
    expect((spinner.props.style as { transform: unknown[] }).transform.length).toBeGreaterThan(0);
  });

  it('renders linear indeterminate chrome', async () => {
    await render(
      <ProgressIndicator variant="linear" thickness={4} accessibilityLabel="Wait linear" />,
    );
    const bar = screen.getByTestId('progress-linear-indeterminate');
    expect(bar.props.style).toEqual(
      expect.objectContaining({
        position: 'absolute',
        width: '40%',
        height: '100%',
        // Mutation — interpolate left must remain on the style object (not {}).
        left: expect.anything(),
      }),
    );
  });

  // Mutation — effect deps include determinate + variant so the loop restarts / stops.
  it('restarts indeterminate loop when variant changes and stops when determinate', async () => {
    const runSpy = jest.spyOn(helpers, 'runIndeterminateLoop').mockImplementation(() => jest.fn());

    const { rerender } = await render(
      <ProgressIndicator variant="circular" size={48} accessibilityLabel="Wait" />,
    );
    expect(runSpy).toHaveBeenCalledTimes(1);
    const firstDispose = runSpy.mock.results[0]?.value as jest.Mock;

    await rerender(<ProgressIndicator variant="linear" thickness={4} accessibilityLabel="Wait" />);
    expect(firstDispose).toHaveBeenCalled();
    expect(runSpy).toHaveBeenCalledTimes(2);

    const secondDispose = runSpy.mock.results[1]?.value as jest.Mock;
    await rerender(
      <ProgressIndicator variant="linear" value={40} thickness={4} accessibilityLabel="Wait" />,
    );
    expect(secondDispose).toHaveBeenCalled();
    expect(runSpy).toHaveBeenCalledTimes(2);
  });

  it('builds anim keyed by variant so circular and linear do not share a driver', async () => {
    const values: Animated.Value[] = [];
    const original = Animated.Value;
    const ValueSpy = jest.spyOn(Animated, 'Value').mockImplementation((...args: unknown[]) => {
      const value = new original(...(args as [number]));
      values.push(value);
      return value;
    });

    const { rerender } = await render(
      <ProgressIndicator variant="circular" size={48} accessibilityLabel="Wait" />,
    );
    const afterCircular = values.length;
    await rerender(<ProgressIndicator variant="linear" thickness={4} accessibilityLabel="Wait" />);
    expect(values.length).toBeGreaterThan(afterCircular);
    ValueSpy.mockRestore();
  });
});
