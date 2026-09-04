import { useEffect, useState } from 'react';
import { ConsumptionReasonsService, ConsumptionReasonDto } from '../../features/kitchen/services/consumptionReasons.service.js';

/**
 * ADR-004 / US-030: catálogo activo de motivos de consumo, cargado solo mientras
 * `isOpen` es `true` (compartido por `ConsumeReasonModal` y `ShiftReconciliationWizard`,
 * TK-108-FE/TK-109-FE — cualquier autenticado puede listar los activos, sin `includeInactive`).
 */
export function useActiveConsumptionReasons(isOpen: boolean): ConsumptionReasonDto[] {
  const [reasons, setReasons] = useState<ConsumptionReasonDto[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    ConsumptionReasonsService.list().then(setReasons).catch(() => setReasons([]));
  }, [isOpen]);

  return reasons;
}
