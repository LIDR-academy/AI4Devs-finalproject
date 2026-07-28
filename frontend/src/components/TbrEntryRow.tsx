import type { TbrEntry } from '../api/types';
import './TbrShared.css';

interface TbrEntryRowProps {
  entry: TbrEntry;
  onRemove?: (entryId: string) => void;
  removing?: boolean;
  readOnly?: boolean;
}

export function TbrEntryRow({
  entry,
  onRemove,
  removing,
  readOnly = false,
}: TbrEntryRowProps) {
  const rowClass = entry.completed
    ? 'tbr-entry tbr-entry--completed'
    : 'tbr-entry';

  return (
    <li className={rowClass} aria-checked={entry.completed}>
      <span className="tbr-entry__check" aria-hidden="true">
        {entry.completed ? '✓' : '○'}
      </span>
      {entry.book.cover_image_url ? (
        <img
          src={entry.book.cover_image_url}
          alt=""
          className="tbr-entry__cover"
        />
      ) : (
        <div className="tbr-entry__cover tbr-entry__cover--placeholder" />
      )}
      <div className="tbr-entry__info">
        <span className="tbr-entry__title">{entry.book.title}</span>
        <span className="tbr-entry__authors">{entry.book.authors}</span>
      </div>
      {!readOnly && onRemove ? (
        <button
          type="button"
          className="tbr-entry__remove"
          onClick={() => onRemove(entry.id)}
          disabled={removing}
          aria-label={`Quitar ${entry.book.title} de la TBR`}
        >
          Quitar
        </button>
      ) : null}
    </li>
  );
}
