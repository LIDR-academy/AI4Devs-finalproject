import React, { useState } from 'react';
import { Users } from 'lucide-react';
import { PanelHeader } from '../../../shared/components/PanelHeader.js';
import { SectionTabs } from '../../../shared/components/SectionTabs.js';
import { SuccessFeedbackBanner } from '../../../shared/components/SuccessFeedbackBanner.js';
import { CreateUserForm } from './CreateUserForm.js';
import { UserStatusForm } from './UserStatusForm.js';

type Section = 'create' | 'status';

const USER_MANAGEMENT_TABS = [
  { value: 'create' as const, label: 'Alta de Operario', id: 'btn-tab-create-user' },
  { value: 'status' as const, label: 'Bloquear / Reactivar', id: 'btn-tab-user-status' },
];

/**
 * Sección Personal de `/ajustes/personal` (US-024) — inline en el `<main>` del shell.
 * El gating `ADMIN` lo garantiza `<ProtectedRoute>` sobre el layout de Ajustes.
 */
export const UserManagementPanel: React.FC = () => {
  const [section, setSection] = useState<Section>('create');
  const [feedback, setFeedback] = useState<string | null>(null);

  return (
    <>
      <PanelHeader icon={<Users className="text-primary-color" />} title="Gestión de Personal" />

      <SectionTabs
        section={section}
        options={USER_MANAGEMENT_TABS}
        onChange={(s) => {
          setSection(s);
          setFeedback(null);
        }}
      />

      {feedback && <SuccessFeedbackBanner message={feedback} />}

      {section === 'create' ? (
        <CreateUserForm onCreated={setFeedback} />
      ) : (
        <UserStatusForm onUpdated={setFeedback} />
      )}
    </>
  );
};
