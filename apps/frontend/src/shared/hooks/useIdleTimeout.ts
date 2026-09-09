import { useEffect, useRef, useCallback } from 'react';

interface UseIdleTimeoutOptions {
  timeoutMinutes: number;
  onIdle: () => void;
  isLoggedIn: boolean;
}

export function useIdleTimeout({ timeoutMinutes, onIdle, isLoggedIn }: UseIdleTimeoutOptions): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (isLoggedIn && timeoutMinutes > 0) {
      const ms = timeoutMinutes * 60 * 1000;
      timerRef.current = setTimeout(() => {
        onIdle();
      }, ms);
    }
  }, [timeoutMinutes, onIdle, isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const events = ['touchstart', 'pointerdown', 'mousedown', 'keydown', 'scroll'];

    const handleUserActivity = () => {
      resetTimer();
    };

    resetTimer();

    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [isLoggedIn, resetTimer]);
}
