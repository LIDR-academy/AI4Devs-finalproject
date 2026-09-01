import React from 'react';
import { MapPin } from 'lucide-react';

export type LocationFilter = 'ALL' | 'KITCHEN_FRIDGE' | 'KITCHEN_PREP' | 'KITCHEN_LINE';

interface LocationFilterTabsProps {
  activeLocation: LocationFilter;
  onLocationSelect: (loc: LocationFilter) => void;
  counts: Record<LocationFilter, number>;
}

export const LocationFilterTabs: React.FC<LocationFilterTabsProps> = ({ activeLocation, onLocationSelect, counts }) => {
  const tabs: { id: LocationFilter; label: string }[] = [
    { id: 'ALL', label: 'Todos' },
    { id: 'KITCHEN_FRIDGE', label: 'Refrigerador Principal' },
    { id: 'KITCHEN_PREP', label: 'Mesa de Preparación' },
    { id: 'KITCHEN_LINE', label: 'Línea de Servicio' },
  ];

  return (
    <div className="flex-gap-sm flex-wrap location-tabs-bar">
      <div className="flex-gap-xs location-tabs-label">
        <MapPin size={16} /> Estaciones:
      </div>
      {tabs.map((tab) => {
        const isActive = activeLocation === tab.id;
        const count = counts[tab.id] || 0;

        return (
          <button
            key={tab.id}
            type="button"
            className={`btn-touch flex-gap-xs location-tab-btn ${isActive ? 'btn-primary fw-bold' : 'btn-secondary'}`}
            onClick={() => onLocationSelect(tab.id)}
          >
            {tab.label}
            <span className={`badge-count ${isActive ? 'badge-count--active' : 'badge-count--inactive'}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
