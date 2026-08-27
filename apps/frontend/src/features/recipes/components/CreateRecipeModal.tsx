import React from 'react';
import { Utensils } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import { CreateRecipeForm } from './CreateRecipeForm.js';

interface CreateRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (message: string) => void;
}

export const CreateRecipeModal: React.FC<CreateRecipeModalProps> = ({ isOpen, onClose, onCreated }) => {
  if (!isOpen) return null;

  return (
    <Modal maxWidth="560px" width="100%">
      <ModalHeader
        icon={<Utensils style={{ color: 'var(--color-primary)' }} />}
        title="Nueva Receta"
        fontSize="1.25rem"
        gap="8px"
        marginBottom="16px"
        onClose={onClose}
      />

      <CreateRecipeForm onCreated={onCreated} />
    </Modal>
  );
};
