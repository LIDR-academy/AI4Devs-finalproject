export interface BarChartBar {
  key: string;
  label: string;
  value: number;
  emphasized?: boolean;
}

function buildAriaSummary(bars: BarChartBar[], valueLabel: string): string {
  const parts = bars
    .filter((bar) => bar.value > 0)
    .map((bar) => `${bar.label}: ${bar.value}`);
  if (parts.length === 0) {
    return `No hay registros de ${valueLabel} en este periodo.`;
  }
  return `${valueLabel} por periodo. ${parts.join('; ')}.`;
}

export interface BarChartProps {
  bars: BarChartBar[];
  valueLabel: string;
  className?: string;
}

export function BarChart({ bars, valueLabel, className = '' }: BarChartProps) {
  const max = Math.max(...bars.map((bar) => bar.value), 1);

  return (
    <div
      className={`bar-chart ${className}`.trim()}
      role="img"
      aria-label={buildAriaSummary(bars, valueLabel)}
    >
      <div className="bar-chart__plot" aria-hidden="true">
        {bars.map((bar) => (
          <div key={bar.key} className="bar-chart__column">
            <span className="bar-chart__value">
              {bar.value > 0 ? bar.value : ''}
            </span>
            <div className="bar-chart__bar-track">
              <div
                className={
                  bar.emphasized
                    ? 'bar-chart__bar bar-chart__bar--emphasized'
                    : 'bar-chart__bar'
                }
                style={{ height: `${(bar.value / max) * 100}%` }}
              />
            </div>
            <span className="bar-chart__axis-label">{bar.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
