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
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '4px' }}>
        <MapPin size={16} /> Estaciones:
      </div>
      {tabs.map((tab) => {
        const isActive = activeLocation === tab.id;
        const count = counts[tab.id] || 0;

        return (
          <button
            key={tab.id}
            type="button"
            className={`btn-touch ${isActive ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => onLocationSelect(tab.id)}
            style={{
              height: '40px',
              padding: '0 14px',
              fontSize: '0.85rem',
              fontWeight: isActive ? 700 : 500,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {tab.label}
            <span
              style={{
                backgroundColor: isActive ? 'var(--neutral)' : 'var(--bg-card)',
                color: isActive ? 'var(--color-primary)' : 'var(--text-secondary)',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
