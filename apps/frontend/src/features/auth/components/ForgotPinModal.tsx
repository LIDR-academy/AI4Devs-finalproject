import React, { useState } from 'react';
import { Modal } from '../../../shared/components/Modal.js';
import { ErrorBanner } from '../../../shared/components/ErrorBanner.js';
import { AuthService } from '../services/auth.service.js';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, Send } from 'lucide-react';

interface ForgotPinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function useForgotPinForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await AuthService.requestForgotPin(email);
      setSuccessMessage(response.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar la solicitud.');
    } finally {
      setIsLoading(false);
    }
  };

  return { email, setEmail, isLoading, error, successMessage, handleSubmit };
}

const ForgotPinSuccessView: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => (
  <div className="banner-success">
    <div className="flex-gap-sm" style={{ fontWeight: 600, marginBottom: '6px' }}>
      <CheckCircle2 size={20} />
      <span>Solicitud Procesada</span>
    </div>
    <p style={{ fontSize: '0.86rem', margin: 0, color: 'var(--text-primary)' }}>{message}</p>
    <p style={{ fontSize: '0.80rem', margin: '8px 0 0 0', color: 'var(--text-secondary)' }}>
      (Revisa la consola del servidor o tu bandeja de entrada para obtener el enlace de 15 minutos).
    </p>
    <button type="button" className="btn-touch btn-secondary" onClick={onClose} style={{ width: '100%', marginTop: '16px' }}>
      <ArrowLeft size={18} /> Volver al Inicio de Sesión
    </button>
  </div>
);

const ForgotPinFormView: React.FC<{
  email: string;
  isLoading: boolean;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}> = ({ email, isLoading, onChange, onSubmit, onClose }) => (
  <form onSubmit={onSubmit} className="form-group-touch">
    <div style={{ marginBottom: '20px' }}>
      <label htmlFor="input-forgot-pin-email" className="form-label">
        Correo del Administrador:
      </label>
      <input
        type="email"
        id="input-forgot-pin-email"
        className="input-touch"
        value={email}
        onChange={(e) => onChange(e.target.value)}
        disabled={isLoading}
        placeholder="admin@restostock.com"
        autoComplete="email"
        required
      />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <button type="submit" disabled={isLoading || !email.trim()} className="btn-touch btn-primary" style={{ width: '100%' }}>
        <Send size={18} /> {isLoading ? 'Enviando enlace...' : 'Enviar Enlace de Recuperación'}
      </button>
      <button type="button" disabled={isLoading} className="btn-touch btn-secondary" onClick={onClose} style={{ width: '100%' }}>
        <ArrowLeft size={18} /> Cancelar
      </button>
    </div>
  </form>
);

export const ForgotPinModal: React.FC<ForgotPinModalProps> = ({ isOpen, onClose }) => {
  const form = useForgotPinForm();
  if (!isOpen) return null;

  return (
    <Modal size="sm" centered>
      <div className="modal-header-center">
        <div className="card-badge-icon" style={{ width: '56px', height: '56px' }}>
          <Mail size={28} />
        </div>
      </div>
      <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '6px' }}>Recuperar PIN de Administrador</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px', lineHeight: 1.4 }}>
        Ingresa el correo corporativo del Administrador para recibir un enlace temporal de recuperación.
      </p>
      {form.error && <ErrorBanner message={form.error} icon={<AlertCircle size={18} />} compact />}
      {form.successMessage ? (
        <ForgotPinSuccessView message={form.successMessage} onClose={onClose} />
      ) : (
        <ForgotPinFormView
          email={form.email}
          isLoading={form.isLoading}
          onChange={form.setEmail}
          onSubmit={form.handleSubmit}
          onClose={onClose}
        />
      )}
    </Modal>
  );
};
