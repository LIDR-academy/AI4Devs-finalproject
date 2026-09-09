import React from 'react';
import { ConsumptionReasonDto } from '../../features/kitchen/services/consumptionReasons.service.js';

interface ConsumptionReasonSelectProps {
  id: string;
  value: string;
  reasons: ConsumptionReasonDto[];
  onChange: (value: string) => void;
  className?: string;
}

/**
 * ADR-004 / US-030: `<select>` de motivos activos, compartido por `ConsumeReasonModal`
 * (TK-108-FE) y `ShiftReconciliationWizard` (TK-109-FE) — jscpd los marcó como clon al
 * introducir el segundo. Sin `<label>` propio: cada consumidor pone el suyo (el texto
 * difiere — "Motivo del Consumo" vs. "Motivo de la Varianza Negativa"). Sin `required`
 * nativo (Guard 38) — la obligatoriedad se valida en el componente que lo usa.
 */
export const ConsumptionReasonSelect: React.FC<ConsumptionReasonSelectProps> = ({ id, value, reasons, onChange, className = 'input-touch' }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} className={className} id={id}>
    <option value="">-- Seleccionar Motivo --</option>
    {reasons.map((r) => (
      <option key={r.id} value={r.id}>
        {r.label}
      </option>
    ))}
  </select>
);
