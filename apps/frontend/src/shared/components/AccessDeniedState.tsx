import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Modal } from './Modal.js';

interface AccessDeniedStateProps {
  moduleLabel: string;
  onClose: () => void;
}

/**
 * Estado compartido de "requiere rol ADMIN", antes duplicado casi idéntico
 * entre ReportsDashboard, UserManagementPanel y MovementHistoryPanel.
 */
export const AccessDeniedState: React.FC<AccessDeniedStateProps> = ({ moduleLabel, onClose }) => (
  <Modal size="md" centered>
    <ShieldAlert size={48} className="text-danger-color access-denied-icon" />
    <h2 className="fs-xl fw-bold mb-2">Acceso Restringido</h2>
    <p className="text-secondary-color fs-md mb-6">
      El módulo de {moduleLabel} requiere rol de Administrador.
    </p>
    <button type="button" className="btn-touch btn-primary w-full" onClick={onClose}>
      Entendido - Volver al Tablero
    </button>
  </Modal>
);
