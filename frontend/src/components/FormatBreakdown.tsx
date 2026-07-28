import type { FormatCount } from '../api/types';
import { ChartCard } from './ui';

interface FormatBreakdownProps {
  distribution: FormatCount[];
  predominantFormat: string | null;
  periodUnit?: 'mes' | 'año';
}

const FORMAT_LABELS: Record<string, string> = {
  fisico: 'Físico',
  ebook: 'Ebook',
  audio: 'Audio',
  unknown: 'Sin formato',
};

function formatLabel(format: string): string {
  return FORMAT_LABELS[format] ?? format;
}

export function FormatBreakdown({
  distribution,
  predominantFormat,
  periodUnit = 'mes',
}: FormatBreakdownProps) {
  if (distribution.length === 0) {
    return null;
  }

  return (
    <ChartCard
      className="format-breakdown"
      title="Formato de lectura"
      subtitle={`Resumen de formatos leídos en el ${periodUnit}.`}
    >
      {predominantFormat && (
        <p className="format-breakdown__predominant">
          Formato predominante:{' '}
          <strong>{formatLabel(predominantFormat)}</strong>
        </p>
      )}
      <ul className="format-breakdown__list">
        {distribution.map((entry) => (
          <li
            key={entry.format}
            className={
              entry.format === predominantFormat
                ? 'format-breakdown__item format-breakdown__item--predominant'
                : 'format-breakdown__item'
            }
          >
            <span className="format-breakdown__label">
              {formatLabel(entry.format)}
            </span>
            <span className="format-breakdown__count">{entry.count}</span>
          </li>
        ))}
      </ul>
    </ChartCard>
  );
}
