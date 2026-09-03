import React, { useState } from 'react';
import { Settings, Users, ShieldCheck, History, BookOpen } from 'lucide-react';
import { RestaurantSettingsModal } from '../../features/settings/components/RestaurantSettingsModal.js';
import { UserManagementPanel } from '../../features/auth/components/UserManagementPanel.js';
import { RolesManagementModal } from '../../features/security/components/RolesManagementModal.js';
import { MovementHistoryPanel } from '../../features/stock/components/MovementHistoryPanel.js';
import { CatalogManagementPanel } from '../../features/catalog/components/CatalogManagementPanel.js';
import { useAppShell } from '../session.js';

type AjustesSection = 'settings' | 'users' | 'roles' | 'movements' | 'catalog' | null;

const CARDS: { key: Exclude<AjustesSection, null>; label: string; icon: React.ReactNode; id: string }[] = [
  { key: 'settings', label: 'Configuración del Restaurante', icon: <Settings size={22} />, id: 'btn-settings' },
  { key: 'users', label: 'Gestión de Personal', icon: <Users size={22} />, id: 'btn-users' },
  { key: 'roles', label: 'Roles y Permisos', icon: <ShieldCheck size={22} />, id: 'btn-roles' },
  { key: 'movements', label: 'Historial de Movimientos', icon: <History size={22} />, id: 'btn-movements' },
  { key: 'catalog', label: 'Catálogo Maestro', icon: <BookOpen size={22} />, id: 'btn-catalog' },
];

/** Ruta Ajustes (`/ajustes`, US-023) — protegida a `ADMIN`. Landing con accesos a los paneles administrativos. */
export const AjustesRoute: React.FC = () => {
  const { currentUser } = useAppShell();
  const [section, setSection] = useState<AjustesSection>(null);
  const close = () => setSection(null);

  return (
    <>
      <h1 className="fs-2xl fw-bold mb-6">Ajustes y Administración</h1>
      <section className="metrics-grid">
        {CARDS.map((card) => (
          <div key={card.key} className="card-dashboard flex-column flex-center">
            <button type="button" className="btn-touch btn-secondary w-full flex-center flex-gap-xs" id={card.id} onClick={() => setSection(card.key)}>
              {card.icon}
              {card.label}
            </button>
          </div>
        ))}
      </section>

      <RestaurantSettingsModal isOpen={section === 'settings'} onClose={close} />
      <UserManagementPanel isOpen={section === 'users'} userRole={currentUser.role} onClose={close} />
      <RolesManagementModal isOpen={section === 'roles'} onClose={close} />
      <MovementHistoryPanel isOpen={section === 'movements'} userRole={currentUser.role} onClose={close} />
      <CatalogManagementPanel isOpen={section === 'catalog'} userRole={currentUser.role} onClose={close} />
    </>
  );
};
