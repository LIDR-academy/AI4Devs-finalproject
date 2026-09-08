import React, { useCallback, useEffect, useState } from 'react';
import { Building2, Save } from 'lucide-react';
import { PanelHeader } from '../../../shared/components/PanelHeader.js';
import { SuccessFeedbackBanner } from '../../../shared/components/SuccessFeedbackBanner.js';
import { SettingsService, SystemSettingsDto } from '../services/settings.service.js';
import styles from './RestaurantSettingsPanel.module.css';

const DEFAULT_SETTINGS: SystemSettingsDto = {
  id: 'default',
  restaurantName: 'RestoStock Kitchen',
  taxId: 'RUT-12345678-9',
  currencySymbol: '$',
  criticalAlertHours: 24,
  defaultRemanenteHours: 24,
  varianceTolerancePercent: 5,
  preparationWasteAlertPercent: 5,
};

type FieldKey = keyof SystemSettingsDto;

interface FieldProps {
  id: string;
  label: string;
  type: 'text' | 'number';
  value: string | number;
  required?: boolean;
  min?: number;
  max?: number;
  onChange: (value: string) => void;
}

const Field: React.FC<FieldProps> = ({ id, label, type, value, required, min, max, onChange }) => (
  <div>
    <label htmlFor={id} className="form-label">
      {label}
    </label>
    <input
      id={id}
      type={type}
      required={required}
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input-touch w-full"
    />
  </div>
);

function useSettingsForm() {
  const [settings, setSettings] = useState<SystemSettingsDto>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    SettingsService.fetchSettings()
      .then(setSettings)
      .catch((err) => console.error('[RestaurantSettingsPanel] No se pudo cargar la configuración:', err));
  }, []);

  const setField = useCallback(
    (key: FieldKey, raw: string) => {
      setSettings((s) => ({ ...s, [key]: typeof s[key] === 'number' ? Number(raw) : raw }));
    },
    [],
  );

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      setMessage(null);
      try {
        setSettings(await SettingsService.updateSettings(settings));
        setMessage('Configuración guardada correctamente');
      } catch (err) {
        console.error('[RestaurantSettingsPanel] Error al guardar la configuración:', err);
        setMessage('Error al guardar la configuración');
      } finally {
        setIsSaving(false);
      }
    },
    [settings],
  );

  return { settings, isSaving, message, setField, submit };
}

/**
 * Sección Configuración de `/ajustes/configuracion` (US-024) — inline. ADMIN-only
 * vía `<ProtectedRoute>` sobre el layout de Ajustes.
 */
export const RestaurantSettingsPanel: React.FC = () => {
  const { settings, isSaving, message, setField, submit } = useSettingsForm();

  return (
    <>
      <PanelHeader icon={<Building2 className="text-primary-color" />} title="Configuración General del Restaurante" />
      <form onSubmit={submit} className="flex-column flex-gap-md mt-4 settings-form">
        <Field id="setting-restaurant-name" label="Nombre del Restaurante" type="text" required value={settings.restaurantName} onChange={(v) => setField('restaurantName', v)} />

        <div className={`metrics-grid ${styles['two-col-grid']}`}>
          <Field id="setting-tax-id" label="Identificación Fiscal (RUT/NIF)" type="text" value={settings.taxId || ''} onChange={(v) => setField('taxId', v)} />
          <Field id="setting-currency" label="Símbolo de Moneda" type="text" required value={settings.currencySymbol} onChange={(v) => setField('currencySymbol', v)} />
        </div>

        <div className={`metrics-grid ${styles['two-col-grid']}`}>
          <Field id="setting-critical-hours" label="Alerta Crítica FEFO (Horas)" type="number" required min={1} value={settings.criticalAlertHours} onChange={(v) => setField('criticalAlertHours', v)} />
          <Field id="setting-remanente-hours" label="Vida Útil Estándar Remanente (Horas)" type="number" required min={1} value={settings.defaultRemanenteHours} onChange={(v) => setField('defaultRemanenteHours', v)} />
        </div>

        <div className={`metrics-grid ${styles['two-col-grid']}`}>
          <Field id="setting-idle-timeout" label="Cierre de Sesión por Inactividad Táctil (Minutos)" type="number" required min={1} max={1440} value={settings.idleTimeoutMinutes ?? 15} onChange={(v) => setField('idleTimeoutMinutes', v)} />
          <Field id="setting-prep-waste-alert" label="Umbral de Alerta de Merma de Preparación (%)" type="number" required min={0} max={100} value={settings.preparationWasteAlertPercent ?? 5} onChange={(v) => setField('preparationWasteAlertPercent', v)} />
        </div>

        {message && <SuccessFeedbackBanner message={message} />}

        <button type="submit" className="btn-touch btn-primary flex-center flex-gap-xs" disabled={isSaving} aria-busy={isSaving} id="btn-save-settings">
          <Save size={20} />
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </>
  );
};
