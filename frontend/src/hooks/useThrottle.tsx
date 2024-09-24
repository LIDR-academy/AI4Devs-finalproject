import { useRef } from 'react';

export function useThrottle(callback: () => void, delay: number) {
  const lastCall = useRef<number>(0);

  return () => {
    const now = Date.now();
    if (now - lastCall.current >= delay) {
      callback();
      lastCall.current = now;
    }
  };
}