import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import { AccessDeniedState } from '../../../shared/components/AccessDeniedState.js';
import { SectionTabs } from '../../../shared/components/SectionTabs.js';
import { RecipeCatalogPanel } from '../../recipes/components/RecipeCatalogPanel.js';
import { InsumoCatalogPanel } from '../../stock/components/InsumoCatalogPanel.js';

interface CatalogManagementPanelProps {
  isOpen: boolean;
  userRole: string;
  onClose: () => void;
}

type Section = 'inventory' | 'recipe';

const CATALOG_TABS = [
  { value: 'inventory' as const, label: 'Inventario de Bodega', id: 'btn-tab-inventory-stock' },
  { value: 'recipe' as const, label: 'Recetario', id: 'btn-tab-create-recipe' },
];

export const CatalogManagementPanel: React.FC<CatalogManagementPanelProps> = ({ isOpen, userRole, onClose }) => {
  const [section, setSection] = useState<Section>('inventory');

  if (!isOpen) return null;
  if (userRole !== 'ADMIN') {
    return <AccessDeniedState moduleLabel="Gestión de Catálogo" onClose={onClose} />;
  }

  return (
    <Modal size="xl">
      <ModalHeader
        icon={<BookOpen style={{ color: 'var(--color-primary)' }} />}
        title="Gestión de Catálogo e Inventario"
        size="lg"
        onClose={onClose}
      />

      <SectionTabs section={section} options={CATALOG_TABS} onChange={setSection} />

      {section === 'inventory' ? <InsumoCatalogPanel /> : <RecipeCatalogPanel />}
    </Modal>
  );
};
