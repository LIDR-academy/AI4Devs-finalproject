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
  <Modal maxWidth="500px" width="100%" textAlign="center" padding="32px">
    <ShieldAlert size={48} style={{ color: 'var(--color-danger)', margin: '0 auto 16px auto' }} />
    <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Acceso Restringido</h2>
    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
      El módulo de {moduleLabel} requiere rol de Administrador.
    </p>
    <button className="btn-touch btn-primary" onClick={onClose} style={{ width: '100%' }}>
      Entendido - Volver al Tablero
    </button>
  </Modal>
);
