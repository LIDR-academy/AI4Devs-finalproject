import React, { useState, useEffect } from 'react';
import { Modal } from '../../../shared/components/Modal.js';
import { ModalHeader } from '../../../shared/components/ModalHeader.js';
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
      setMessage('✅ Configuración guardada correctamente');
      if (onSettingsUpdated) {
        onSettingsUpdated(updated);
      }
    } catch {
      setMessage('❌ Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal maxWidth="600px" width="90%">
      <ModalHeader
        icon={<Building2 style={{ color: 'var(--color-primary)' }} />}
        title="Configuración General del Restaurante"
        onClose={onClose}
      />
      <form onSubmit={handleSubmit} className="space-y-4 text-slate-100 mt-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Nombre del Restaurante</label>
          <input
            type="text"
            required
            value={settings.restaurantName}
            onChange={(e) => setSettings({ ...settings, restaurantName: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white min-h-[48px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Identificación Fiscal (RUT/NIF)</label>
            <input
              type="text"
              value={settings.taxId || ''}
              onChange={(e) => setSettings({ ...settings, taxId: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white min-h-[48px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Símbolo de Moneda</label>
            <input
              type="text"
              required
              value={settings.currencySymbol}
              onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white min-h-[48px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Alerta Crítica FEFO (Horas)</label>
            <input
              type="number"
              required
              min={1}
              value={settings.criticalAlertHours}
              onChange={(e) => setSettings({ ...settings, criticalAlertHours: Number(e.target.value) })}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white min-h-[48px]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Vida Útil Estándar Remanente (Horas)</label>
            <input
              type="number"
              required
              min={1}
              value={settings.defaultRemanenteHours}
              onChange={(e) => setSettings({ ...settings, defaultRemanenteHours: Number(e.target.value) })}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white min-h-[48px]"
            />
          </div>
        </div>

        {message && <div className="p-3 bg-slate-800 border border-slate-700 rounded text-sm font-medium">{message}</div>}

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded min-h-[48px]"
          >
            Cerrar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 font-bold text-slate-950 rounded flex items-center gap-2 min-h-[48px]"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
