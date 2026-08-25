import { useEffect } from "react";
import { usePullToRefreshContext } from "@/infrastructure/context/PullToRefreshContext";
import type { PullGestureState } from "@/infrastructure/hooks/pullGesture";
import { INITIAL_PULL_STATE, pullGesture } from "@/infrastructure/hooks/pullGesture";

export function usePullToRefresh({ refetch }: { refetch: () => void }) {
  const { scrollContainerRef, setGesture, registerRefetch, runRefetch } = usePullToRefreshContext();

  useEffect(() => {
    registerRefetch(refetch);
  }, [registerRefetch, refetch]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    let startY = 0;
    let mirror: PullGestureState = INITIAL_PULL_STATE;

    const commit = (next: PullGestureState) => {
      mirror = next;
      setGesture(next);
    };

    const onTouchStart = (event: TouchEvent) => {
      startY = event.touches[0]?.clientY ?? 0;
      commit(pullGesture(mirror, { type: "START", atTop: container.scrollTop === 0 }));
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!mirror.active) {
        return;
      }
      const deltaY = (event.touches[0]?.clientY ?? startY) - startY;
      commit(pullGesture(mirror, { type: "MOVE", deltaY }));
      if (mirror.active) {
        event.preventDefault();
      }
    };

    const onTouchEnd = () => {
      const shouldTrigger = mirror.ready;
      commit(pullGesture(mirror, { type: "END" }));
      if (shouldTrigger) {
        runRefetch();
      }
    };

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    container.addEventListener("touchmove", onTouchMove, { passive: false });
    container.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchmove", onTouchMove);
      container.removeEventListener("touchend", onTouchEnd);
    };
  }, [runRefetch, scrollContainerRef, setGesture]);
}
