import React, { useState, useRef, useEffect } from 'react';
import { Settings, Users, Shield, MapPin, BarChart3, History, BookOpen, ChevronDown } from 'lucide-react';
import styles from './AdminDropdownMenu.module.css';

interface AdminDropdownMenuProps {
  onReports: () => void;
  onUserManagement: () => void;
  onMovementHistory: () => void;
  onCatalogManagement: () => void;
  onSettingsManagement: () => void;
  onLocationsManagement: () => void;
  onRolesManagement: () => void;
}

export const AdminDropdownMenu: React.FC<AdminDropdownMenuProps> = ({
  onReports,
  onUserManagement,
  onMovementHistory,
  onCatalogManagement,
  onSettingsManagement,
  onLocationsManagement,
  onRolesManagement,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={styles['admin-menu-wrapper']}>
      <button
        type="button"
        className="btn-touch btn-secondary flex-gap-xs"
        onClick={() => setIsOpen((prev) => !prev)}
        id="btn-open-admin-menu"
        title="Menú de Administración"
      >
        <Settings size={20} />
        <span>Administración</span>
        <ChevronDown size={16} className={`${styles['dropdown-chevron']}${isOpen ? ` ${styles['dropdown-chevron--open']}` : ''}`} />
      </button>

      {isOpen && (
        <div className={styles['dropdown-menu']}>
          <button type="button" className={`btn-touch btn-secondary ${styles['btn-dropdown-item']} flex-gap-xs`} onClick={() => handleAction(onReports)}>
            <BarChart3 size={18} /> Reportes de Mermas
          </button>
          <button type="button" className={`btn-touch btn-secondary ${styles['btn-dropdown-item']} flex-gap-xs`} onClick={() => handleAction(onUserManagement)}>
            <Users size={18} /> Personal
          </button>
          <button type="button" className={`btn-touch btn-secondary ${styles['btn-dropdown-item']} flex-gap-xs`} onClick={() => handleAction(onRolesManagement)}>
            <Shield size={18} /> Roles y Permisos
          </button>
          <button type="button" className={`btn-touch btn-secondary ${styles['btn-dropdown-item']} flex-gap-xs`} onClick={() => handleAction(onLocationsManagement)}>
            <MapPin size={18} /> Sectores Físicos
          </button>
          <button type="button" className={`btn-touch btn-secondary ${styles['btn-dropdown-item']} flex-gap-xs`} onClick={() => handleAction(onSettingsManagement)}>
            <Settings size={18} /> Ajustes Restaurante
          </button>
          <button type="button" className={`btn-touch btn-secondary ${styles['btn-dropdown-item']} flex-gap-xs`} onClick={() => handleAction(onMovementHistory)}>
            <History size={18} /> Historial Movimientos
          </button>
          <button type="button" className={`btn-touch btn-secondary ${styles['btn-dropdown-item']} flex-gap-xs`} onClick={() => handleAction(onCatalogManagement)}>
            <BookOpen size={18} /> Catálogo Maestro
          </button>
        </div>
      )}
    </div>
  );
};
