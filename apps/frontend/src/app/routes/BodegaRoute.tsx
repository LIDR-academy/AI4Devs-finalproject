import React, { useState } from 'react';
import { PackageMinus, MapPin } from 'lucide-react';
import { InsumoCatalogPanel } from '../../features/stock/components/InsumoCatalogPanel.js';
import { WarehouseExtractionModal } from '../../features/stock/components/WarehouseExtractionModal.js';
import { LocationsManagementModal } from '../../features/stock/components/LocationsManagementModal.js';
import { useAppShell } from '../session.js';

/**
 * Ruta Bodega (`/bodega`, US-023 · renombrada TK-095-FE WS-3): bodega + ubicaciones + reabastecimiento.
 * El panel de insumos (con su alta y reabastecimiento internos) se monta inline;
 * la extracción de bodega y la gestión de ubicaciones se lanzan como modales.
 */
export const BodegaRoute: React.FC = () => {
  const { currentUser } = useAppShell();
  const isAdmin = currentUser.role === 'ADMIN';
  const [isExtractionOpen, setIsExtractionOpen] = useState(false);
  const [isLocationsOpen, setIsLocationsOpen] = useState(false);
  const [panelKey, setPanelKey] = useState(0);

  const refreshPanel = () => setPanelKey((k) => k + 1);

  return (
    <>
      <header className="flex-between flex-wrap mb-4 gap-3">
        <h1 className="fs-2xl fw-bold">Bodega</h1>
        <div className="flex-gap-md flex-wrap">
          {/* Extracción de bodega: `POST /stock/extraction` sin requireRole → cualquier operario. */}
          <button type="button" className="btn-touch btn-primary" id="btn-open-extraction" onClick={() => setIsExtractionOpen(true)}>
            <PackageMinus size={20} />
            Extraer de Bodega
          </button>
          {/* Gestión de ubicaciones: administrativa (antes tras el menú ADMIN). */}
          {isAdmin && (
            <button type="button" className="btn-touch btn-secondary" id="btn-open-locations" onClick={() => setIsLocationsOpen(true)}>
              <MapPin size={20} />
              Ubicaciones
            </button>
          )}
        </div>
      </header>

      <InsumoCatalogPanel key={panelKey} canManage={isAdmin} />

      <WarehouseExtractionModal
        isOpen={isExtractionOpen}
        onClose={() => setIsExtractionOpen(false)}
        onSuccess={() => {
          setIsExtractionOpen(false);
          refreshPanel();
        }}
      />
      <LocationsManagementModal isOpen={isLocationsOpen} onClose={() => setIsLocationsOpen(false)} />
    </>
  );
};
