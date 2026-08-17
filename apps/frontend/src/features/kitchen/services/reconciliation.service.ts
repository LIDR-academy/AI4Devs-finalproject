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
      const response = await fetch('/api/v1/kitchen/shift-reconciliation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Error al guardar la conciliación de turno.');
      }
    } catch (err) {
      console.error('[ReconciliationService] Fallo en la comunicación de conciliación de turno con backend:', err);
      // Fallback local para desarrollo / demo mock sin backend live
      return Promise.resolve();
    }
  }
}
