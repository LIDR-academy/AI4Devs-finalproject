import { useLayoutEffect, useState } from 'react';

export type FefoTheme = 'light' | 'dark';

const FEFO_THEME_STORAGE_KEY = 'fefo-theme';

/**
 * Sistema FEFO (turno dia/noche, US-022/TK-081-FE): aplica `data-theme` en <html>
 * (no un wrapper scoped) para que el interruptor alcance a toda la aplicacion,
 * incluidos los modales. Persiste en localStorage y cae a la preferencia del
 * sistema operativo si no hay eleccion guardada.
 *
 * `useLayoutEffect` (no `useEffect`): aplica el atributo antes del paint del
 * navegador, cerrando el flash de tema incorrecto (ver frontend_rules.md).
 */
export function useFefoTheme() {
  const [theme, setThemeState] = useState<FefoTheme>(() => {
    try {
      const stored = localStorage.getItem(FEFO_THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch (err) {
      console.error('[AppShell] localStorage no disponible para el tema Sistema FEFO:', err);
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const setTheme = (next: FefoTheme) => {
    setThemeState(next);
    try {
      localStorage.setItem(FEFO_THEME_STORAGE_KEY, next);
    } catch (err) {
      console.error('[AppShell] No se pudo persistir el tema Sistema FEFO:', err);
    }
  };

  return { theme, setTheme };
}
