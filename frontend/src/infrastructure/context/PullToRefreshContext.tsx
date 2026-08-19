import type { Dispatch, ReactNode, RefObject, SetStateAction } from "react";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { PullGestureState } from "@/infrastructure/hooks/pullGesture";
import { INITIAL_PULL_STATE } from "@/infrastructure/hooks/pullGesture";

interface PullToRefreshContextValue {
  scrollContainerRef: RefObject<HTMLElement>;
  gesture: PullGestureState;
  setGesture: Dispatch<SetStateAction<PullGestureState>>;
  registerRefetch: (refetch: (() => void) | null) => void;
  runRefetch: () => void;
}

const PullToRefreshContext = createContext<PullToRefreshContextValue | null>(null);

export function PullToRefreshProvider({ children }: { children: ReactNode }) {
  const scrollContainerRef = useRef<HTMLElement>(null);
  const refetchRef = useRef<(() => void) | null>(null);
  const [gesture, setGesture] = useState<PullGestureState>(INITIAL_PULL_STATE);

  const registerRefetch = useCallback((refetch: (() => void) | null) => {
    refetchRef.current = refetch;
  }, []);

  const runRefetch = useCallback(() => {
    refetchRef.current?.();
  }, []);

  return (
    <PullToRefreshContext.Provider
      value={{ scrollContainerRef, gesture, setGesture, registerRefetch, runRefetch }}
    >
      {children}
    </PullToRefreshContext.Provider>
  );
}

export function usePullToRefreshContext() {
  const context = useContext(PullToRefreshContext);
  if (!context) {
    throw new Error("usePullToRefreshContext must be used within PullToRefreshProvider");
  }
  return context;
}
