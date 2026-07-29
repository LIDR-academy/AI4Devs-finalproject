import type { GoodreadsImportResponse } from '../../api/types';
import {
  buildImportSummaryLines,
  buildImportSummaryStats,
} from '../../lib/goodreadsImportSummary';
import './ImportSummary.css';

export interface ImportSummaryProps {
  result: GoodreadsImportResponse;
}

export function ImportSummary({ result }: ImportSummaryProps) {
  const stats = buildImportSummaryStats(result);
  const lines = buildImportSummaryLines(stats);

  return (
    <section
      className="import-summary"
      aria-labelledby="import-summary-heading"
      role="status"
    >
      <h4 id="import-summary-heading" className="import-summary__heading">
        Resumen de la importación
      </h4>
      <dl className="import-summary__list">
        {lines.map((line) => (
          <div key={line.key} className="import-summary__item">
            <dt className="import-summary__count">{line.count}</dt>
            <dd className="import-summary__label">{line.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
