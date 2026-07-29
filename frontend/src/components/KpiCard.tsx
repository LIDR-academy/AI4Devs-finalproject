import './KpiCard.css';

interface KpiCardProps {
  label: string;
  value: string;
}

export function KpiCard({ label, value }: KpiCardProps) {
  return (
    <article className="kpi-card" aria-label={label}>
      <span className="kpi-card__value">{value}</span>
      <span className="kpi-card__label">{label}</span>
    </article>
  );
}
