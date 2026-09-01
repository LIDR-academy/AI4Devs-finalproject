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
    <ShieldAlert size={48} className="text-danger-color" style={{ margin: '0 auto 16px auto' }} />
    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Acceso Restringido</h2>
    <p className="text-secondary-color" style={{ fontSize: '0.9rem', marginBottom: '24px' }}>
      El módulo de {moduleLabel} requiere rol de Administrador.
    </p>
    <button type="button" className="btn-touch btn-primary w-full" onClick={onClose}>
      Entendido - Volver al Tablero
    </button>
  </Modal>
);
