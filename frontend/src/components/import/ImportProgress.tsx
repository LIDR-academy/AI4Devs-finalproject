import type { ImportJobStatus } from '../../api/types';
import {
  formatImportJobProgressLabel,
  importJobProgressPercent,
} from '../../lib/goodreadsImportJob';
import './ImportProgress.css';

export interface ImportProgressProps {
  phase: ImportJobStatus;
  processedCount: number;
  totalCount: number;
}

export function ImportProgress({
  phase,
  processedCount,
  totalCount,
}: ImportProgressProps) {
  const label = formatImportJobProgressLabel(phase, processedCount, totalCount);
  const percent = importJobProgressPercent(processedCount, totalCount);
  const showNumericProgress =
    totalCount > 0 && phase !== 'queued' && phase !== 'parsing';

  return (
    <div
      className="import-progress"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <p className="import-progress__label">{label}</p>
      <div
        className="import-progress__track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={showNumericProgress ? totalCount : 100}
        aria-valuenow={showNumericProgress ? processedCount : percent}
        aria-label={label}
      >
        <div
          className="import-progress__bar"
          style={{ width: `${showNumericProgress ? percent : 0}%` }}
        />
      </div>
      {showNumericProgress ? (
        <p className="import-progress__counts" aria-hidden="true">
          {processedCount} / {totalCount}
        </p>
      ) : null}
    </div>
  );
}
