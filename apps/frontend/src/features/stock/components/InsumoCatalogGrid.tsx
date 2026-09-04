import React, { useState } from 'react';
import { Truck, ChevronRight, ChevronDown } from 'lucide-react';
import { InsumoItem } from '../services/stock.service.js';
import styles from './InsumoCatalogGrid.module.css';

interface InsumoCardProps {
  item: InsumoItem;
  onRestock: (insumo: InsumoItem) => void;
  canManage: boolean;
}

const InsumoCard: React.FC<InsumoCardProps> = ({ item, onRestock, canManage }) => {
  const [expanded, setExpanded] = useState(false);
  const breakdown = item.stockByLocation ?? [];

  return (
    <div className={styles['insumo-card']}>
      <div className="flex-between gap-2">
        <span className="fw-semibold">{item.name}</span>
        <span className="neutral-badge">{item.unitOfMeasure}</span>
      </div>
      <div className="text-primary-color font-mono fs-xs mt-1">{item.id}</div>
      <div className="flex-between gap-2 mt-3">
        <span className="text-success-color fw-semibold">
          {breakdown.length > 0 && (
            <button
              type="button"
              className={styles['stock-disclosure']}
              aria-expanded={expanded}
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          {item.warehouseStock} {item.unitOfMeasure}
        </span>
        {canManage && (
          <button type="button" onClick={() => onRestock(item)} className="btn-touch btn-secondary flex-center flex-gap-xs">
            <Truck size={16} />
            Reabastecer
          </button>
        )}
      </div>
      {expanded && breakdown.length > 0 && (
        <dl className={styles['stock-breakdown']}>
          {breakdown.map((s) => (
            <div key={s.storageLocationId} className={styles['stock-breakdown-row']}>
              <dt>{s.storageLocationName}</dt>
              <dd>
                {s.quantity} {item.unitOfMeasure}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
};

interface InsumoCatalogGridProps {
  insumos: InsumoItem[];
  onRestock: (insumo: InsumoItem) => void;
  canManage: boolean;
}

/** Vista de grilla del catálogo de bodega (TK-116-FE, US-031) — alternativa a `InsumoTable`. */
export const InsumoCatalogGrid: React.FC<InsumoCatalogGridProps> = ({ insumos, onRestock, canManage }) => (
  <div className={styles['insumo-grid']}>
    {insumos.map((item) => (
      <InsumoCard key={item.id} item={item} onRestock={onRestock} canManage={canManage} />
    ))}
  </div>
);
