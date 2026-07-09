import { act, renderHook } from '@testing-library/react';

import { useInteractionState } from './use-interaction-state';

describe('useInteractionState', () => {
  it('starts with hover and press both false', () => {
    const { result } = renderHook(() => useInteractionState());

    expect(result.current.hover).toBe(false);
    expect(result.current.press).toBe(false);
  });

  it('tracks hover independently', () => {
    const { result } = renderHook(() => useInteractionState());

    act(() => result.current.handlers.onHoverIn());
    expect(result.current.hover).toBe(true);
    expect(result.current.press).toBe(false);

    act(() => result.current.handlers.onPressIn());
    expect(result.current.hover).toBe(true);
    expect(result.current.press).toBe(true);
  });


  it('tracks hover and press independently', () => {
    const { result } = renderHook(() => useInteractionState());

    
    act(() => result.current.handlers.onPressIn());
    expect(result.current.press).toBe(true);
    expect(result.current.hover).toBe(false);

    act(() => result.current.handlers.onHoverIn());
    expect(result.current.press).toBe(true);
    expect(result.current.hover).toBe(true);
  });


  it('clears press when hover ends (drag-off cancel)', () => {
    const { result } = renderHook(() => useInteractionState());

    act(() => {
      result.current.handlers.onHoverIn();
      result.current.handlers.onPressIn();
    });
    act(() => result.current.handlers.onHoverOut());

    expect(result.current.hover).toBe(false);
    expect(result.current.press).toBe(false);
  });
});
