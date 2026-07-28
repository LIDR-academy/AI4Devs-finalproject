export interface PieSlice {
  key: string;
  label: string;
  count: number;
  color?: string;
  emphasized?: boolean;
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDegrees: number,
): { x: number; y: number } {
  const radians = ((angleDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function describeSlice(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

function buildAriaSummary(slices: PieSlice[], total: number): string {
  const parts = slices.map((s) => `${s.label}: ${s.count}`);
  return `Distribución de ${total} en total. ${parts.join('; ')}.`;
}

export interface PieChartProps {
  slices: PieSlice[];
  className?: string;
}

export function PieChart({ slices, className = '' }: PieChartProps) {
  const total = slices.reduce((sum, slice) => sum + slice.count, 0);
  if (total === 0) {
    return null;
  }

  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 4;

  let angle = 0;
  const paths = slices.map((slice, index) => {
    const sweep = (slice.count / total) * 360;
    const start = angle;
    const end = angle + sweep;
    angle = end;
    return {
      ...slice,
      d: describeSlice(cx, cy, radius, start, end),
      index,
    };
  });

  return (
    <div className={`pie-chart ${className}`.trim()}>
      <svg
        className="pie-chart__svg"
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={buildAriaSummary(slices, total)}
      >
        {paths.map((path) => (
          <path
            key={path.key}
            d={path.d}
            fill={path.color ?? `var(--pie-slice-${path.index % 6})`}
            className="pie-chart__slice"
          />
        ))}
      </svg>
      <ul className="pie-chart__legend" aria-hidden="false">
        {slices.map((slice, index) => (
          <li
            key={slice.key}
            className={
              slice.emphasized
                ? 'pie-chart__legend-item pie-chart__legend-item--emphasized'
                : 'pie-chart__legend-item'
            }
          >
            <span
              className="pie-chart__swatch"
              style={{
                background:
                  slice.color ?? `var(--pie-slice-${index % 6})`,
              }}
              aria-hidden="true"
            />
            <span className="pie-chart__legend-label">{slice.label}</span>
            <span className="pie-chart__legend-count">{slice.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
