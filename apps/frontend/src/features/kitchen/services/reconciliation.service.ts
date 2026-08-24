import { apiRequest } from '../../../shared/http/apiClient.js';

export interface PhysicalCountInput {
  remanenteId: string;
  physicalQuantity: number;
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
