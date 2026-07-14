import {
  arcStyle,
  arcWindowStyle,
  circularBoxStyle,
  circularProgressAngle,
  circularSpinnerFrameStyle,
  circularTrackStyle,
  clampProgressPercent,
  indeterminateTiming,
  leftArcRotate,
  linearFillStyle,
  linearIndeterminateStyle,
  linearTrackStyle,
  rightArcRotate,
  runIndeterminateLoop,
  spinnerArcStyle,
} from './progress-indicator.helpers';

describe('progress-indicator.helpers', () => {
  it('clampProgressPercent clamps to 0–100', () => {
    expect(clampProgressPercent(-10)).toBe(0);
    expect(clampProgressPercent(0)).toBe(0);
    expect(clampProgressPercent(40)).toBe(40);
    expect(clampProgressPercent(100)).toBe(100);
    expect(clampProgressPercent(150)).toBe(100);
  });

  it('circularProgressAngle maps percent to degrees', () => {
    expect(circularProgressAngle(0)).toBe(0);
    expect(circularProgressAngle(50)).toBe(180);
    expect(circularProgressAngle(100)).toBe(360);
    expect(circularProgressAngle(200)).toBe(360);
  });

  it('rightArcRotate uses min(angle,180) minus 225', () => {
    expect(rightArcRotate(90)).toBe(-135);
    expect(rightArcRotate(180)).toBe(-45);
    expect(rightArcRotate(270)).toBe(-45);
  });

  it('leftArcRotate subtracts 225 from angle', () => {
    expect(leftArcRotate(270)).toBe(45);
    expect(leftArcRotate(360)).toBe(135);
  });

  it('indeterminateTiming uses circular vs linear duration and native driver rules', () => {
    expect(indeterminateTiming('circular', 'ios')).toEqual({
      duration: 1400,
      useNativeDriver: true,
    });
    expect(indeterminateTiming('linear', 'ios')).toEqual({
      duration: 1600,
      useNativeDriver: false,
    });
    expect(indeterminateTiming('circular', 'web')).toEqual({
      duration: 1400,
      useNativeDriver: false,
    });
    expect(indeterminateTiming('linear', 'web')).toEqual({
      duration: 1600,
      useNativeDriver: false,
    });
  });

  it('runIndeterminateLoop starts then disposer stops', () => {
    const stop = jest.fn();
    const start = jest.fn();
    const timing = jest.fn(() => ({ id: 'timing' }));
    const loop = jest.fn(() => ({ start, stop }));
    const dispose = runIndeterminateLoop(
      { id: 'anim' },
      { duration: 1400, useNativeDriver: true },
      { loop, timing },
    );
    expect(timing).toHaveBeenCalledWith(
      { id: 'anim' },
      expect.objectContaining({ toValue: 1, duration: 1400, useNativeDriver: true }),
    );
    expect(loop).toHaveBeenCalled();
    expect(start).toHaveBeenCalled();
    dispose();
    expect(stop).toHaveBeenCalled();
  });

  it('style helpers pin layout tokens for tracks, fills, arcs, and spinner', () => {
    expect(circularBoxStyle(48)).toEqual({ width: 48, height: 48 });
    expect(circularSpinnerFrameStyle(48)).toEqual({
      position: 'absolute',
      width: 48,
      height: 48,
    });
    expect(circularTrackStyle(48, 4, '#ccc')).toEqual(
      expect.objectContaining({
        position: 'absolute',
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 4,
        borderColor: '#ccc',
      }),
    );
    expect(spinnerArcStyle(48, 4, '#f00')).toEqual(
      expect.objectContaining({
        borderRadius: 24,
        borderTopColor: '#f00',
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent',
      }),
    );
    expect(linearTrackStyle(4, '#eee', 999)).toEqual(
      expect.objectContaining({
        alignSelf: 'stretch',
        height: 4,
        overflow: 'hidden',
        backgroundColor: '#eee',
      }),
    );
    expect(linearFillStyle(40, '#0f0', 999)).toEqual(
      expect.objectContaining({
        width: '40%',
        height: '100%',
        backgroundColor: '#0f0',
      }),
    );
    expect(linearIndeterminateStyle('#0f0', 999)).toEqual(
      expect.objectContaining({
        position: 'absolute',
        width: '40%',
        height: '100%',
      }),
    );
    expect(arcWindowStyle(48, 'right')).toEqual(
      expect.objectContaining({ left: 24, width: 24, overflow: 'hidden' }),
    );
    expect(arcWindowStyle(48, 'left')).toEqual(expect.objectContaining({ left: 0, width: 24 }));
    // Mutation — arcStyle left is -size/2 for right window, 0 for left.
    expect(arcStyle(48, 4, '#0f0', 'right', -45)).toEqual(
      expect.objectContaining({
        left: -24,
        borderRadius: 24,
        borderRightColor: '#0f0',
        borderBottomColor: '#0f0',
        transform: [{ rotate: '-45deg' }],
      }),
    );
    expect(arcStyle(48, 4, '#0f0', 'left', 45)).toEqual(
      expect.objectContaining({
        left: 0,
        transform: [{ rotate: '45deg' }],
      }),
    );
  });
});
