import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Lee `?resetToken=...` de la URL (magic link de recuperación de PIN, TK-077) y
 * expone limpiarlo. Reemplaza el manejo manual de `window.location.search` +
 * `window.history.replaceState` que vivía en `App.tsx`, ahora vía react-router.
 */
export function useResetPinToken() {
  const [searchParams, setSearchParams] = useSearchParams();
  const token = searchParams.get('resetToken');

  const clear = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('resetToken');
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  return { token, clear };
}
