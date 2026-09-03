import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { PanelHeader } from '../../../shared/components/PanelHeader.js';
import { SectionTabs } from '../../../shared/components/SectionTabs.js';
import { RecipeCatalogPanel } from '../../recipes/components/RecipeCatalogPanel.js';
import { InsumoCatalogPanel } from '../../stock/components/InsumoCatalogPanel.js';

type Section = 'inventory' | 'recipe';

const CATALOG_TABS = [
  { value: 'inventory' as const, label: 'Inventario de Bodega', id: 'btn-tab-inventory-stock' },
  { value: 'recipe' as const, label: 'Recetario', id: 'btn-tab-create-recipe' },
];

/**
 * Sección Catálogo de `/ajustes/catalogo` (US-024) — inline. Monta los paneles de
 * insumos/recetas con `canManage` (esta ruta es ADMIN-only vía `<ProtectedRoute>`).
 */
export const CatalogManagementPanel: React.FC = () => {
  const [section, setSection] = useState<Section>('inventory');

  return (
    <>
      <PanelHeader icon={<BookOpen className="text-primary-color" />} title="Catálogo Maestro e Inventario" />
      <SectionTabs section={section} options={CATALOG_TABS} onChange={setSection} />
      {section === 'inventory' ? <InsumoCatalogPanel canManage /> : <RecipeCatalogPanel canManage />}
    </>
  );
};
