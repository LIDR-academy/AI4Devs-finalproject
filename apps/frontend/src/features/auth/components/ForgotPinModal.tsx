import React, { useState } from 'react';
import { Modal } from '../../../shared/components/Modal.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { AuthService } from '../services/auth.service.js';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, Send } from 'lucide-react';

interface ForgotPinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPinModal: React.FC<ForgotPinModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await AuthService.requestForgotPin(email);
      setSuccessMessage(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la solicitud.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal maxWidth="420px" width="100%" textAlign="center">
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <div className="card-badge-icon" style={{ width: '56px', height: '56px' }}>
          <Mail size={28} />
        </div>
      </div>

      <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '6px' }}>
        Recuperar PIN de Administrador
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px', lineHeight: 1.4 }}>
        Ingresa el correo corporativo del Administrador para recibir un enlace temporal de recuperación.
      </p>

      {error && (
        <ErrorBanner message={error} icon={<AlertCircle size={18} />} padding="10px 14px" fontSize="0.88rem" />
      )}

      {successMessage ? (
        <div
          style={{
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '20px',
            color: 'var(--color-success, #16a34a)',
            textAlign: 'left',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontWeight: 600 }}>
            <CheckCircle2 size={20} />
            <span>Solicitud Procesada</span>
          </div>
          <p style={{ fontSize: '0.86rem', margin: 0, color: 'var(--text-primary)' }}>
            {successMessage}
          </p>
          <p style={{ fontSize: '0.80rem', margin: '8px 0 0 0', color: 'var(--text-secondary)' }}>
            (Revisa la consola del servidor o tu bandeja de entrada para obtener el enlace de 15 minutos).
          </p>
          <button
            type="button"
            className="btn-touch btn-secondary"
            onClick={onClose}
            style={{ width: '100%', marginTop: '16px' }}
          >
            <ArrowLeft size={18} />
            Volver al Inicio de Sesión
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="input-forgot-pin-email"
              style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}
            >
              Correo del Administrador:
            </label>
            <input
              type="email"
              id="input-forgot-pin-email"
              className="input-touch"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              placeholder="admin@restostock.com"
              autoComplete="email"
              required
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="btn-touch btn-primary"
              style={{ width: '100%' }}
            >
              <Send size={18} />
              {isLoading ? 'Enviando enlace...' : 'Enviar Enlace de Recuperación'}
            </button>
            <button
              type="button"
              disabled={isLoading}
              className="btn-touch btn-secondary"
              onClick={onClose}
              style={{ width: '100%' }}
            >
              <ArrowLeft size={18} />
              Cancelar
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
