import React, { useState } from 'react';
import { Users, CheckCircle2 } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import { AccessDeniedState } from '../../../shared/components/AccessDeniedState.js';
import { CreateUserForm } from './CreateUserForm.js';
import { UserStatusForm } from './UserStatusForm.js';

interface UserManagementPanelProps {
  isOpen: boolean;
  userRole: string;
  onClose: () => void;
}

type Section = 'create' | 'status';

const SectionTabs: React.FC<{ section: Section; onChange: (s: Section) => void }> = ({ section, onChange }) => (
  <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
    <button
      type="button"
      className={`btn-touch ${section === 'create' ? 'btn-primary' : 'btn-secondary'}`}
      onClick={() => onChange('create')}
      style={{ flex: 1 }}
      id="btn-tab-create-user"
    >
      Alta de Operario
    </button>
    <button
      type="button"
      className={`btn-touch ${section === 'status' ? 'btn-primary' : 'btn-secondary'}`}
      onClick={() => onChange('status')}
      style={{ flex: 1 }}
      id="btn-tab-user-status"
    >
      Bloquear / Reactivar
    </button>
  </div>
);

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
    <Modal maxWidth="480px" width="92%">
      <ModalHeader
        icon={<Users style={{ color: 'var(--color-primary)' }} />}
        title="Gestión de Personal"
        fontSize="1.4rem"
        gap="10px"
        marginBottom="20px"
        onClose={onClose}
      />

      <SectionTabs
        section={section}
        onChange={(s) => {
          setSection(s);
          setFeedback(null);
        }}
      />

      {feedback && (
        <div
          role="status"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            marginBottom: '16px',
            backgroundColor: 'rgba(0, 210, 190, 0.12)',
            border: '1px solid var(--color-primary)',
            borderRadius: '8px',
            color: 'var(--color-primary)',
            fontSize: '0.88rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{feedback}</span>
        </div>
      )}

      {section === 'create' ? <CreateUserForm onCreated={handleUpdated} /> : <UserStatusForm onUpdated={handleUpdated} />}
    </Modal>
  );
};
