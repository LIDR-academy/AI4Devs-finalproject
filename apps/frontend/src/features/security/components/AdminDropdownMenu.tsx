import React, { useState, useRef, useEffect } from 'react';
import { Settings, Users, Shield, MapPin, BarChart3, History, BookOpen, ChevronDown } from 'lucide-react';

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
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        className="btn-touch btn-secondary"
        onClick={() => setIsOpen((prev) => !prev)}
        id="btn-open-admin-menu"
        title="Menú de Administración"
        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        <Settings size={20} />
        <span>Administración</span>
        <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-card)',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            zIndex: 100,
            minWidth: '220px',
            padding: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <button type="button" className="btn-touch btn-secondary" style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => handleAction(onReports)}>
            <BarChart3 size={18} /> Reportes de Mermas
          </button>
          <button type="button" className="btn-touch btn-secondary" style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => handleAction(onUserManagement)}>
            <Users size={18} /> Personal
          </button>
          <button type="button" className="btn-touch btn-secondary" style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => handleAction(onRolesManagement)}>
            <Shield size={18} /> Roles y Permisos
          </button>
          <button type="button" className="btn-touch btn-secondary" style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => handleAction(onLocationsManagement)}>
            <MapPin size={18} /> Sectores Físicos
          </button>
          <button type="button" className="btn-touch btn-secondary" style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => handleAction(onSettingsManagement)}>
            <Settings size={18} /> Ajustes Restaurante
          </button>
          <button type="button" className="btn-touch btn-secondary" style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => handleAction(onMovementHistory)}>
            <History size={18} /> Historial Movimientos
          </button>
          <button type="button" className="btn-touch btn-secondary" style={{ justifyContent: 'flex-start', width: '100%' }} onClick={() => handleAction(onCatalogManagement)}>
            <BookOpen size={18} /> Catálogo Maestro
          </button>
        </div>
      )}
    </div>
  );
};
