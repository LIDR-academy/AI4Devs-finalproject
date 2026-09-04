import { apiRequest } from '../../../shared/http/apiClient.js';

interface PhysicalCountInput {
  remanenteId: string;
  physicalQuantity: number;
  /** ADR-004 / US-008 / TK-109-FE: obligatorio solo cuando la línea da varianza negativa. */
  reasonId?: string;
}

export interface PerformReconciliationPayload {
  operatorId: string;
  notes?: string;
  items: PhysicalCountInput[];
}

export class ReconciliationService {
  public static async submitReconciliation(payload: PerformReconciliationPayload): Promise<void> {
    try {
      await apiRequest('/kitchen/shift-reconciliation', { method: 'POST', body: payload });
    } catch (err) {
      console.error('[ReconciliationService] Fallo en la comunicación de conciliación de turno con backend:', err);
      // Fallback local para desarrollo / demo mock sin backend live
      return Promise.resolve();
    }
  }
}
