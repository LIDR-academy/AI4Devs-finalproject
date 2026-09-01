import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import { AccessDeniedState } from '../../../shared/components/AccessDeniedState.js';
import { SectionTabs } from '../../../shared/components/SectionTabs.js';
import { SuccessFeedbackBanner } from '../../../shared/components/SuccessFeedbackBanner.js';
import { CreateUserForm } from './CreateUserForm.js';
import { UserStatusForm } from './UserStatusForm.js';

interface UserManagementPanelProps {
  isOpen: boolean;
  userRole: string;
  onClose: () => void;
}

type Section = 'create' | 'status';

const USER_MANAGEMENT_TABS = [
  { value: 'create' as const, label: 'Alta de Operario', id: 'btn-tab-create-user' },
  { value: 'status' as const, label: 'Bloquear / Reactivar', id: 'btn-tab-user-status' },
];

export const UserManagementPanel: React.FC<UserManagementPanelProps> = ({ isOpen, userRole, onClose }) => {
  const [section, setSection] = useState<Section>('create');
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isOpen) return null;
  if (userRole !== 'ADMIN') {
    return <AccessDeniedState moduleLabel="Gestión de Personal" onClose={onClose} />;
  }

  const handleUpdated = (message: string) => {
    setFeedback(message);
  };

  return (
    <Modal size="md">
      <ModalHeader
        icon={<Users className="text-primary-color" />}
        title="Gestión de Personal"
        size="lg"
        onClose={onClose}
      />

      <SectionTabs
        section={section}
        options={USER_MANAGEMENT_TABS}
        onChange={(s) => {
          setSection(s);
          setFeedback(null);
        }}
      />

      {feedback && <SuccessFeedbackBanner message={feedback} />}

      {section === 'create' ? <CreateUserForm onCreated={handleUpdated} /> : <UserStatusForm onUpdated={handleUpdated} />}
    </Modal>
  );
};
