import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import { AccessDeniedState } from '../../../shared/components/AccessDeniedState.js';
import { SectionTabs } from '../../../shared/components/SectionTabs.js';
import { SuccessFeedbackBanner } from '../../../shared/components/SuccessFeedbackBanner.js';
import { CreateRecipeForm } from './CreateRecipeForm.js';
import { InsumoCatalogPanel } from '../../stock/components/InsumoCatalogPanel.js';

interface CatalogManagementPanelProps {
  isOpen: boolean;
  userRole: string;
  onClose: () => void;
}

type Section = 'inventory' | 'recipe';

const CATALOG_TABS = [
  { value: 'inventory' as const, label: 'Inventario de Bodega', id: 'btn-tab-inventory-stock' },
  { value: 'recipe' as const, label: 'Alta de Receta', id: 'btn-tab-create-recipe' },
];

export const CatalogManagementPanel: React.FC<CatalogManagementPanelProps> = ({ isOpen, userRole, onClose }) => {
  const [section, setSection] = useState<Section>('inventory');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;
  if (userRole !== 'ADMIN') {
    return <AccessDeniedState moduleLabel="Gestión de Catálogo" onClose={onClose} />;
  }

  const handleUpdated = (message: string) => {
    setFeedback(message);
  };

  return (
    <Modal maxWidth="720px" width="92%">
      <ModalHeader
        icon={<BookOpen style={{ color: 'var(--color-primary)' }} />}
        title="Gestión de Catálogo e Inventario"
        fontSize="1.4rem"
        gap="10px"
        marginBottom="20px"
        onClose={onClose}
      />

      <SectionTabs
        section={section}
        options={CATALOG_TABS}
        onChange={(s) => {
          setSection(s);
          setFeedback(null);
        }}
      />

      {feedback && <SuccessFeedbackBanner message={feedback} />}

      {section === 'inventory' ? <InsumoCatalogPanel /> : <CreateRecipeForm onCreated={handleUpdated} />}
    </Modal>
  );
};
