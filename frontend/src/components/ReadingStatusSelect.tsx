import type { ReadingStatus } from '../api/types';
import { READING_STATUS_OPTIONS } from './readingStatus';

interface ReadingStatusSelectProps {
  value: ReadingStatus;
  onChange: (status: ReadingStatus) => void;
  disabled?: boolean;
}

export function ReadingStatusSelect({
  value,
  onChange,
  disabled,
}: ReadingStatusSelectProps) {
  return (
    <select
      className="tracker-select"
      value={value}
      disabled={disabled}
      aria-label="Estado de lectura"
      onChange={(e) => onChange(e.target.value as ReadingStatus)}
    >
      {READING_STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
