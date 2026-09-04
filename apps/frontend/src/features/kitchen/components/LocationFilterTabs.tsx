import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { fetchActiveKitchenAreas, StorageLocationDto } from '../../stock/services/locations.service.js';
import styles from './LocationFilterTabs.module.css';

// US-026 / TK-112-FE: id real de un área de cocina (StorageLocation.id) o 'ALL' — ya no
// una unión fija de 3 literales (KITCHEN_FRIDGE/PREP/LINE). Esos literales dejaron de
// coincidir con `Remanente.location` desde que TK-102-FE volvió dinámico el destino de
// la extracción (confirmado contra la base real: los remanentes activos guardan el
// nombre del área, no el literal — las pestañas fijas siempre mostraban 0).
export type LocationFilter = string;

interface LocationFilterTabsProps {
  activeLocation: LocationFilter;
  onLocationSelect: (loc: LocationFilter) => void;
  counts: Record<string, number>;
}

function useKitchenAreas(): StorageLocationDto[] {
  const [areas, setAreas] = useState<StorageLocationDto[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchActiveKitchenAreas()
      .then((items) => {
        if (!cancelled) setAreas(items);
      })
      .catch(() => {
        if (!cancelled) setAreas([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return areas;
}

export const LocationFilterTabs: React.FC<LocationFilterTabsProps> = ({ activeLocation, onLocationSelect, counts }) => {
  const areas = useKitchenAreas();
  const tabs: { id: LocationFilter; label: string }[] = [
    { id: 'ALL', label: 'Todos' },
    ...areas.map((area) => ({ id: area.id, label: area.name })),
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
            title={tab.label}
            className={`btn-touch flex-gap-xs ${styles['location-tab-btn']} ${isActive ? 'btn-primary fw-bold' : 'btn-secondary'}`}
            onClick={() => onLocationSelect(tab.id)}
          >
            <span className={styles['location-tab-label-text']}>{tab.label}</span>
            <span className={`${styles['badge-count']} ${isActive ? styles['badge-count--active'] : styles['badge-count--inactive']}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
