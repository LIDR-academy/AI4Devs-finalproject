import type { CoverOption } from '../api/types';
import './CoverPicker.css';

interface CoverPickerProps {
  covers: CoverOption[];
  selectedId: string | null;
  onSelect: (cover: CoverOption | null) => void;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  editionTitle: string;
  emptyMessage?: string;
  showContinueWithoutCover?: boolean;
}

export function CoverPicker({
  covers,
  selectedId,
  onSelect,
  loading,
  error,
  onRetry,
  editionTitle,
  emptyMessage,
  showContinueWithoutCover = true,
}: CoverPickerProps) {
  if (loading) {
    return <p className="cover-picker-hint">Cargando portadas…</p>;
  }

  if (error) {
    return (
      <div className="cover-picker-error">
        <p>{error}</p>
        <button type="button" className="btn-secondary" onClick={onRetry}>
          Reintentar
        </button>
      </div>
    );
  }

  if (covers.length === 0) {
    return (
      <div className="cover-picker-empty">
        <div className="cover-picker-placeholder">Sin portada</div>
        <p className="cover-picker-hint">
          {emptyMessage ??
            `No hay portadas para «${editionTitle}». Puedes guardar el libro sin imagen.`}
        </p>
        {showContinueWithoutCover ? (
          <button
            type="button"
            className={`cover-none-btn ${selectedId === null ? 'selected' : ''}`}
            onClick={() => onSelect(null)}
          >
            Continuar sin portada
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="cover-picker">
      <p className="cover-picker-title">Elige portada — {editionTitle}</p>
      <div className="cover-grid" role="listbox" aria-label="Portadas disponibles">
        {covers.map((cover) => (
          <button
            key={cover.id}
            type="button"
            role="option"
            aria-selected={selectedId === cover.id}
            className={`cover-option ${selectedId === cover.id ? 'selected' : ''}`}
            onClick={() => onSelect(cover)}
          >
            <img src={cover.url} alt="" className="cover-option-img" />
            {cover.label && <span className="cover-option-label">{cover.label}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
