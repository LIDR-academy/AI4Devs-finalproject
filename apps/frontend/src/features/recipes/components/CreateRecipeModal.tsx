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
    <Modal size="md">
      <ModalHeader
        icon={<Utensils className="text-primary-color" />}
        title="Nueva Receta"
        onClose={onClose}
      />

      <CreateRecipeForm onCreated={onCreated} />
    </Modal>
  );
};
