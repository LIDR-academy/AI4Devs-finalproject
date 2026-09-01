import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';
import { RemanenteFEFOItem } from '../services/kitchen.service.js';
import styles from './FEFOInventoryHealthBar.module.css';

interface FEFOInventoryHealthBarProps {
  remanentes: RemanenteFEFOItem[];
}

export const FEFOInventoryHealthBar: React.FC<FEFOInventoryHealthBarProps> = ({ remanentes }) => {
  const total = remanentes.length;
  if (total === 0) return null;

  const critical = remanentes.filter((r) => r.hoursRemaining <= 6).length;
  const warning = remanentes.filter((r) => r.hoursRemaining > 6 && r.hoursRemaining <= 24).length;
  const safe = total - critical - warning;

  const safePct = Math.round((safe / total) * 100);
  const warningPct = Math.round((warning / total) * 100);
  const criticalPct = 100 - safePct - warningPct;

  return (
    <div className={styles['health-bar-card']}>
      <div className="flex-between mb-3">
        <div className="flex-gap-sm fw-bold fs-md">
          <ShieldCheck size={18} className="text-primary-color" />
          <span>Estado de Salud del Inventario FEFO (Visión 1-Segundo)</span>
        </div>
        <div className="flex-gap-md fs-sm fw-semibold">
          <span className="flex-gap-xs text-success-color">
            <ShieldCheck size={14} /> Seguro ({safe})
          </span>
          <span className={`flex-gap-xs ${styles['text-warning-color']}`}>
            <AlertTriangle size={14} /> Atención ({warning})
          </span>
          <span className={`flex-gap-xs ${styles['text-danger-text-color']}`}>
            <AlertOctagon size={14} /> Crítico ({critical})
          </span>
        </div>
      </div>

      <div className={styles['health-bar-track']}>
        {safePct > 0 && (
          <div
            className={`${styles['health-bar-segment']} ${styles['health-bar-segment--safe']}`}
            style={{ '--bar-pct': `${safePct}%` } as React.CSSProperties}
            title={`Seguro: ${safePct}%`}
          />
        )}
        {warningPct > 0 && (
          <div
            className={`${styles['health-bar-segment']} ${styles['health-bar-segment--warning']}`}
            style={{ '--bar-pct': `${warningPct}%` } as React.CSSProperties}
            title={`Atención: ${warningPct}%`}
          />
        )}
        {criticalPct > 0 && (
          <div
            className={`${styles['health-bar-segment']} ${styles['health-bar-segment--critical']}`}
            style={{ '--bar-pct': `${criticalPct}%` } as React.CSSProperties}
            title={`Crítico: ${criticalPct}%`}
          />
        )}
      </div>
    </div>
  );
};
