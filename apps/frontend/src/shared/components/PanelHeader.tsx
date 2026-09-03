import React from 'react';

interface PanelHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  /** Contenido a la derecha (filtros, acciones de la sección). */
  actions?: React.ReactNode;
}

/**
 * Cabecera de una sección inline montada bajo una ruta (US-024). Reemplaza a
 * `<ModalHeader>` en las secciones que dejaron de ser modales — sin botón "X"
 * (una ruta no se cierra, se navega).
 */
export const PanelHeader: React.FC<PanelHeaderProps> = ({ icon, title, subtitle, actions }) => (
  <header className="flex-between flex-wrap mb-6 gap-3">
    <div className="flex-gap-sm">
      {icon}
      <div>
        <h1 className="m-0 fs-xl fw-bold">{title}</h1>
        {subtitle && <p className="text-secondary-color mt-1 fs-sm">{subtitle}</p>}
      </div>
    </div>
    {actions}
  </header>
);
