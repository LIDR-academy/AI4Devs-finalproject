import { useEffect, useState } from 'react';
import type { ReadingRecordResource } from '../api/types';
import { ReadFormatSelect } from './ReadFormatSelect';
import { StarRating } from './StarRating';
import './CompletionModal.css';

interface CompletionModalProps {
  open: boolean;
  reading: ReadingRecordResource | null;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: {
    finished_on: string;
    format_id?: string | null;
    rating?: number;
  }) => void;
}

export function CompletionModal({
  open,
  reading,
  saving,
  onClose,
  onSave,
}: CompletionModalProps) {
  const [finishedOn, setFinishedOn] = useState('');
  const [formatId, setFormatId] = useState<string | null>(null);
  const [rating, setRating] = useState<number | null>(null);

  useEffect(() => {
    if (reading) {
      setFinishedOn(reading.finished_on ?? new Date().toISOString().slice(0, 10));
      setFormatId(reading.format_id ?? null);
      setRating(reading.rating);
    }
  }, [reading]);

  if (!open || !reading) {
    return null;
  }

  return (
    <div className="completion-overlay" role="presentation" onClick={onClose}>
      <div
        className="completion-modal"
        role="dialog"
        aria-labelledby="completion-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="completion-title">Finalizar lectura</h2>
        <label className="completion-field">
          Fecha de fin
          <input
            type="date"
            value={finishedOn}
            onChange={(e) => setFinishedOn(e.target.value)}
          />
        </label>
        <ReadFormatSelect
          id="completion-read-format"
          label="Formato"
          value={formatId}
          disabled={saving}
          onChange={(value) => setFormatId(value)}
        />
        <div className="completion-field">
          <span>Puntuación</span>
          <StarRating
            value={rating}
            onChange={(r) => setRating(r)}
            disabled={saving}
          />
        </div>
        <div className="completion-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={saving || !finishedOn}
            onClick={() =>
              onSave({
                finished_on: finishedOn,
                format_id: formatId ?? null,
                ...(rating ? { rating } : {}),
              })
            }
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
