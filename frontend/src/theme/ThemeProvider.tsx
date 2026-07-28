import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getPreferences, updatePreferences } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { applyThemeById, clearAppliedTheme } from './applyTheme';
import {
  DEFAULT_THEME_PALETTE_ID,
  themeCacheKey,
  type ThemePaletteId,
  isThemePaletteId,
} from './palettes';

type ThemeContextValue = {
  paletteId: ThemePaletteId;
  setPaletteId: (paletteId: ThemePaletteId) => Promise<void>;
  loading: boolean;
  error: string | null;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function readCachedPalette(userId: string): ThemePaletteId | null {
  const cached = localStorage.getItem(themeCacheKey(userId));
  return cached && isThemePaletteId(cached) ? cached : null;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, userId } = useAuth();
  const [paletteId, setPaletteIdState] = useState<ThemePaletteId>(() => {
    if (userId) {
      return readCachedPalette(userId) ?? DEFAULT_THEME_PALETTE_ID;
    }
    return DEFAULT_THEME_PALETTE_ID;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      clearAppliedTheme();
      setPaletteIdState(DEFAULT_THEME_PALETTE_ID);
      return;
    }

    const cached = readCachedPalette(userId);
    if (cached) {
      setPaletteIdState(applyThemeById(cached));
    } else {
      applyThemeById(DEFAULT_THEME_PALETTE_ID);
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void getPreferences()
      .then((prefs) => {
        if (cancelled) return;
        const resolved = applyThemeById(prefs.theme_palette_id);
        setPaletteIdState(resolved);
        localStorage.setItem(themeCacheKey(userId), resolved);
      })
      .catch(() => {
        if (!cancelled) {
          setError('No se pudieron cargar las preferencias de tema.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, userId]);

  const setPaletteId = useCallback(
    async (nextPaletteId: ThemePaletteId) => {
      const previous = paletteId;
      setPaletteIdState(nextPaletteId);
      applyThemeById(nextPaletteId);
      if (userId) {
        localStorage.setItem(themeCacheKey(userId), nextPaletteId);
      }
      setError(null);

      try {
        const prefs = await updatePreferences({ theme_palette_id: nextPaletteId });
        const resolved = applyThemeById(prefs.theme_palette_id);
        setPaletteIdState(resolved);
        if (userId) {
          localStorage.setItem(themeCacheKey(userId), resolved);
        }
      } catch {
        setPaletteIdState(previous);
        applyThemeById(previous);
        if (userId) {
          localStorage.setItem(themeCacheKey(userId), previous);
        }
        setError('No se pudo guardar el tema. Inténtalo de nuevo.');
        throw new Error('theme save failed');
      }
    },
    [paletteId, userId],
  );

  const value = useMemo(
    () => ({
      paletteId,
      setPaletteId,
      loading,
      error,
    }),
    [paletteId, setPaletteId, loading, error],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
