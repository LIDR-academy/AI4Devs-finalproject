import React from 'react';
import { MapPin } from 'lucide-react';
import styles from './LocationFilterTabs.module.css';

export type LocationFilter = 'ALL' | 'KITCHEN_FRIDGE' | 'KITCHEN_PREP' | 'KITCHEN_LINE';

interface LocationFilterTabsProps {
  activeLocation: LocationFilter;
  onLocationSelect: (loc: LocationFilter) => void;
  counts: Record<LocationFilter, number>;
}

export const LocationFilterTabs: React.FC<LocationFilterTabsProps> = ({ activeLocation, onLocationSelect, counts }) => {
  // TK-095-FE WS-4 #12: etiquetas cortas (como el artefacto "Sistema FEFO"); el
  // nombre completo va en `title` para no perder contexto.
  const tabs: { id: LocationFilter; label: string; full?: string }[] = [
    { id: 'ALL', label: 'Todos' },
    { id: 'KITCHEN_FRIDGE', label: 'Refrigerador', full: 'Refrigerador Principal' },
    { id: 'KITCHEN_PREP', label: 'Mesa Prep', full: 'Mesa de Preparación' },
    { id: 'KITCHEN_LINE', label: 'Línea', full: 'Línea de Servicio' },
  ];

  return (
    <div className={`flex-gap-sm flex-wrap ${styles['location-tabs-bar']}`}>
      <div className={`flex-gap-xs ${styles['location-tabs-label']}`}>
        <MapPin size={16} /> Estaciones:
      </div>
      {tabs.map((tab) => {
        const isActive = activeLocation === tab.id;
        const count = counts[tab.id] || 0;

        return (
          <button
            key={tab.id}
            type="button"
            title={tab.full ?? tab.label}
            className={`btn-touch flex-gap-xs ${styles['location-tab-btn']} ${isActive ? 'btn-primary fw-bold' : 'btn-secondary'}`}
            onClick={() => onLocationSelect(tab.id)}
          >
            {tab.label}
            <span className={`${styles['badge-count']} ${isActive ? styles['badge-count--active'] : styles['badge-count--inactive']}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
