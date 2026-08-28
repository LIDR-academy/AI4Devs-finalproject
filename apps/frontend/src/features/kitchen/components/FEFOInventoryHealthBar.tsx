import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';
import { RemanenteFEFOItem } from '../services/kitchen.service.js';

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
    <div className="health-bar-card">
      <div className="flex-between" style={{ marginBottom: '10px' }}>
        <div className="flex-gap-sm" style={{ fontWeight: 700, fontSize: '0.95rem' }}>
          <ShieldCheck size={18} style={{ color: 'var(--color-primary)' }} />
          <span>Estado de Salud del Inventario FEFO (Visión 1-Segundo)</span>
        </div>
        <div className="flex-gap-md" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
          <span className="flex-gap-xs" style={{ color: 'var(--color-success)' }}>
            <ShieldCheck size={14} /> Seguro ({safe})
          </span>
          <span className="flex-gap-xs" style={{ color: 'var(--color-warning)' }}>
            <AlertTriangle size={14} /> Atención ({warning})
          </span>
          <span className="flex-gap-xs" style={{ color: 'var(--color-danger-text)' }}>
            <AlertOctagon size={14} /> Crítico ({critical})
          </span>
        </div>
      </div>

      <div className="health-bar-track">
        {safePct > 0 && <div style={{ width: `${safePct}%`, backgroundColor: 'var(--color-success)', transition: 'width 0.3s' }} title={`Seguro: ${safePct}%`} />}
        {warningPct > 0 && <div style={{ width: `${warningPct}%`, backgroundColor: 'var(--color-warning)', transition: 'width 0.3s' }} title={`Atención: ${warningPct}%`} />}
        {criticalPct > 0 && <div style={{ width: `${criticalPct}%`, backgroundColor: 'var(--color-danger)', transition: 'width 0.3s' }} title={`Crítico: ${criticalPct}%`} />}
      </div>
    </div>
  );
};
