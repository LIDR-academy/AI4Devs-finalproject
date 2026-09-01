import React, { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
import { ModalFooterActions } from '../../../shared/components/ModalFooterActions.js';
import { SuccessFeedbackBanner } from '../../../shared/components/SuccessFeedbackBanner.js';
import { SettingsService, SystemSettingsDto } from '../services/settings.service.js';
import { Building2, Save } from 'lucide-react';

interface RestaurantSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdated?: (settings: SystemSettingsDto) => void;
}

export const RestaurantSettingsModal: React.FC<RestaurantSettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsUpdated,
}) => {
  const [settings, setSettings] = useState<SystemSettingsDto>({
    id: 'default',
    restaurantName: 'RestoStock Kitchen',
    taxId: 'RUT-12345678-9',
    currencySymbol: '$',
    criticalAlertHours: 24,
    defaultRemanenteHours: 24,
    varianceTolerancePercent: 5,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      SettingsService.fetchSettings()
        .then((res) => setSettings(res))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const updated = await SettingsService.updateSettings(settings);
      setSettings(updated);
      setMessage('Configuración guardada correctamente');
      if (onSettingsUpdated) {
        onSettingsUpdated(updated);
      }
    } catch {
      setMessage('Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal size="lg">
      <ModalHeader
        icon={<Building2 style={{ color: 'var(--color-primary)' }} />}
        title="Configuración General del Restaurante"
        onClose={onClose}
      />
      <form onSubmit={handleSubmit} className="flex-column flex-gap-md" style={{ marginTop: '16px' }}>
        <div>
          <label htmlFor="setting-restaurant-name" className="form-label">
            Nombre del Restaurante
          </label>
          <input
            id="setting-restaurant-name"
            type="text"
            required
            value={settings.restaurantName}
            onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
            className="input-touch w-full"
          />
        </div>

        <div className="metrics-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label htmlFor="setting-tax-id" className="form-label">
              Identificación Fiscal (RUT/NIF)
            </label>
            <input
              id="setting-tax-id"
              type="text"
              value={settings.taxId || ''}
              onChange={(e) => setSettings({ ...settings, taxId: e.target.value })}
              className="input-touch w-full"
            />
          </div>
          <div>
            <label htmlFor="setting-currency" className="form-label">
              Símbolo de Moneda
            </label>
            <input
              id="setting-currency"
              type="text"
              required
              value={settings.currencySymbol}
              onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
              className="input-touch w-full"
            />
          </div>
        </div>

        <div className="metrics-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label htmlFor="setting-critical-hours" className="form-label">
              Alerta Crítica FEFO (Horas)
            </label>
            <input
              id="setting-critical-hours"
              type="number"
              required
              min={1}
              value={settings.criticalAlertHours}
              onChange={(e) => setSettings({ ...settings, criticalAlertHours: Number(e.target.value) })}
              className="input-touch w-full"
            />
          </div>
          <div>
            <label htmlFor="setting-remanente-hours" className="form-label">
              Vida Útil Estándar Remanente (Horas)
            </label>
            <input
              id="setting-remanente-hours"
              type="number"
              required
              min={1}
              value={settings.defaultRemanenteHours}
              onChange={(e) => setSettings({ ...settings, defaultRemanenteHours: Number(e.target.value) })}
              className="input-touch w-full"
            />
          </div>
        </div>

        <div>
          <label htmlFor="setting-idle-timeout" className="form-label">
            Cierre de Sesión por Inactividad Táctil (Minutos)
          </label>
          <input
            id="setting-idle-timeout"
            type="number"
            required
            min={1}
            max={1440}
            value={settings.idleTimeoutMinutes ?? 15}
            onChange={(e) => setSettings({ ...settings, idleTimeoutMinutes: Number(e.target.value) })}
            className="input-touch w-full"
          />
        </div>


        {message && <SuccessFeedbackBanner message={message} />}

        <ModalFooterActions
          onCancel={onClose}
          cancelLabel="Cerrar"
          confirmLabel="Guardar Cambios"
          submittingLabel="Guardando..."
          confirmIcon={<Save size={20} />}
          isSubmitting={isSaving}
        />
      </form>
    </Modal>
  );
};
