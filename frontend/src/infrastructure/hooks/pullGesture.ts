export const PULL_THRESHOLD_PX = 72;

export const PULL_MAX_DISTANCE_PX = 140;

export interface PullGestureState {
  active: boolean;
  distance: number;
  ready: boolean;
  triggered: boolean;
}

export type PullGestureAction =
  | { type: "START"; atTop: boolean }
  | { type: "MOVE"; deltaY: number }
  | { type: "END" };

export const INITIAL_PULL_STATE: PullGestureState = {
  active: false,
  distance: 0,
  ready: false,
  triggered: false,
};

function reset(triggered: boolean): PullGestureState {
  return { ...INITIAL_PULL_STATE, triggered };
}

export function pullGesture(state: PullGestureState, action: PullGestureAction): PullGestureState {
  switch (action.type) {
    case "START":
      return action.atTop
        ? { active: true, distance: 0, ready: false, triggered: false }
        : INITIAL_PULL_STATE;
    case "MOVE": {
      if (!state.active) {
        return state;
      }
      const distance = Math.min(state.distance + Math.max(action.deltaY, 0), PULL_MAX_DISTANCE_PX);
      return { ...state, distance, ready: distance >= PULL_THRESHOLD_PX, triggered: false };
    }
    case "END":
      return reset(state.ready);
  }
}
