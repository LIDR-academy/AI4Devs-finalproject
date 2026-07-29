import { useState } from 'react';
import { THEME_PALETTE_LIST, type ThemePaletteId } from '../../theme/palettes';
import { useTheme } from '../../theme/ThemeProvider';
import { Card } from '../ui';
import './ThemeSettingsSection.css';

export function ThemeSettingsSection() {
  const { paletteId, setPaletteId, loading, error } = useTheme();
  const [savingId, setSavingId] = useState<ThemePaletteId | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSelect = async (nextId: ThemePaletteId) => {
    if (nextId === paletteId || savingId) return;
    setSaveError(null);
    setSavingId(nextId);
    try {
      await setPaletteId(nextId);
    } catch {
      setSaveError('No se pudo guardar el tema seleccionado.');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <Card title="Tema visual" className="theme-settings">
      <p className="theme-settings__intro">
        Elige una paleta de colores para toda la aplicación.
      </p>

      {loading ? <p className="theme-settings__status">Cargando tema…</p> : null}
      {error ? (
        <p className="theme-settings__error" role="alert">
          {error}
        </p>
      ) : null}
      {saveError ? (
        <p className="theme-settings__error" role="alert">
          {saveError}
        </p>
      ) : null}

      <div
        className="theme-settings__grid"
        role="radiogroup"
        aria-label="Paletas de color"
      >
        {THEME_PALETTE_LIST.map((palette) => {
          const selected = palette.id === paletteId;
          const saving = savingId === palette.id;

          return (
            <button
              key={palette.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={palette.label}
              disabled={loading || saving}
              className={`theme-settings__option ${selected ? 'theme-settings__option--selected' : ''}`}
              onClick={() => void handleSelect(palette.id)}
            >
              <span className="theme-settings__swatches" aria-hidden="true">
                {palette.preview.map((color) => (
                  <span
                    key={`${palette.id}-${color}`}
                    className="theme-settings__swatch"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </span>
              <span className="theme-settings__label">{palette.label}</span>
              {selected ? <span className="theme-settings__check">✓</span> : null}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
