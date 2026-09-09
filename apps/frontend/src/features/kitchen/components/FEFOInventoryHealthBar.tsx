import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';
import { RemanenteFEFOItem } from '../services/kitchen.service.js';
import { bucketRemanentes, bucketPercentages } from '../../../shared/components/urgency.js';
import styles from './FEFOInventoryHealthBar.module.css';

interface FEFOInventoryHealthBarProps {
  remanentes: RemanenteFEFOItem[];
  /** Modo panel: sin tarjeta ni cabecera larga (se monta dentro del panel Estado, TK-087-FE). */
  embedded?: boolean;
}

const SEGMENTS = [
  { key: 'safe', cls: 'safe', word: 'vigente' },
  { key: 'warning', cls: 'warning', word: 'próximo' },
  { key: 'critical', cls: 'critical', word: 'crítico' },
] as const;

export const FEFOInventoryHealthBar: React.FC<FEFOInventoryHealthBarProps> = ({ remanentes, embedded = false }) => {
  const buckets = bucketRemanentes(remanentes);
  if (buckets.total === 0) return null;

  const pct = bucketPercentages(buckets);
  const counts = { safe: buckets.safe, warning: buckets.warning, critical: buckets.critical };
  const pcts = { safe: pct.safePct, warning: pct.warningPct, critical: pct.criticalPct };
  const ariaLabel = `Salud FEFO: ${pct.safePct}% vigente (${buckets.safe}), ${pct.warningPct}% próximo (${buckets.warning}), ${pct.criticalPct}% crítico (${buckets.critical}).`;

  const bar = (
    <>
      <div className={styles['health-bar-track']} role="img" aria-label={ariaLabel}>
        {SEGMENTS.map((seg) =>
          pcts[seg.key] > 0 ? (
            <div
              key={seg.key}
              className={`${styles['health-bar-segment']} ${styles[`health-bar-segment--${seg.cls}`]}`}
              style={{ '--bar-pct': `${pcts[seg.key]}%` } as React.CSSProperties}
            />
          ) : null,
        )}
      </div>
      <div className={styles['health-legend']}>
        {SEGMENTS.map((seg) => (
          <span key={seg.key} className={styles['health-legend-item']}>
            <span aria-hidden="true" className={`${styles['health-legend-dot']} ${styles[`health-bar-segment--${seg.cls}`]}`} />
            {pcts[seg.key]}% {seg.word} ({counts[seg.key]})
          </span>
        ))}
      </div>
    </>
  );

  if (embedded) return <div className={styles['health-bar-embedded']}>{bar}</div>;

  return (
    <div className={styles['health-bar-card']}>
      <div className="flex-between flex-wrap gap-3 mb-3">
        <div className="flex-gap-sm fw-bold fs-md">
          <ShieldCheck size={18} className="text-primary-color" />
          <span>Estado de Salud del Inventario FEFO (Visión 1-Segundo)</span>
        </div>
        <div className="flex-gap-md fs-sm fw-semibold">
          <span className="flex-gap-xs text-success-color">
            <ShieldCheck size={14} /> Seguro ({buckets.safe})
          </span>
          <span className={`flex-gap-xs ${styles['text-warning-color']}`}>
            <AlertTriangle size={14} /> Atención ({buckets.warning})
          </span>
          <span className={`flex-gap-xs ${styles['text-danger-text-color']}`}>
            <AlertOctagon size={14} /> Crítico ({buckets.critical})
          </span>
        </div>
      </div>
      {bar}
    </div>
  );
};
