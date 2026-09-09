import React from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';
import { CatalogView } from '../catalogViewPreference.js';
import styles from './CatalogToolbar.module.css';

interface CatalogToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  view: CatalogView;
  onViewChange: (view: CatalogView) => void;
}

/**
 * Barra de herramientas acoplada del catálogo de bodega (TK-116-FE, US-031):
 * búsqueda + alternador de vista grid/lista, anclada directamente sobre la
 * tabla/grilla — fusión selectiva del mockup `05_bodega_catalog.html` (Stitch).
 */
export const CatalogToolbar: React.FC<CatalogToolbarProps> = ({ search, onSearchChange, view, onViewChange }) => (
  <div className={styles['catalog-toolbar']}>
    <div className="search-input-wrapper">
      <Search size={18} className="search-icon-left" />
      <input
        type="text"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Buscar insumo por nombre..."
        className="input-touch input-with-icon w-full fs-md"
      />
    </div>

    <div className={styles['view-toggle']} role="group" aria-label="Vista del catálogo">
      <button
        type="button"
        className={styles['view-toggle-btn']}
        aria-pressed={view === 'table'}
        onClick={() => onViewChange('table')}
        title="Vista de lista"
      >
        <List size={18} />
      </button>
      <button
        type="button"
        className={styles['view-toggle-btn']}
        aria-pressed={view === 'grid'}
        onClick={() => onViewChange('grid')}
        title="Vista de grilla"
      >
        <LayoutGrid size={18} />
      </button>
    </div>
  </div>
);
