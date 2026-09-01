import { apiRequest } from '../../../shared/http/apiClient.js';

export interface WasteSummaryItem {
  insumoId: string;
  insumoName: string;
  unitOfMeasure: string;
  totalDiscardedQuantity: string;
  reason: string;
  totalDiscardedCost: string | null;
}

export class ReportsService {
  public static async fetchWasteReport(startDate: string, endDate: string): Promise<WasteSummaryItem[]> {
    try {
      return await apiRequest<WasteSummaryItem[]>(
        `/reports/waste?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
      );
    } catch (err) {
      console.error('[ReportsService] Error al obtener el reporte de mermas, usando mock fallback:', err);
      return [
        {
          insumoId: 'ins-queso-1',
          insumoName: 'Queso Mozzarella',
          unitOfMeasure: 'KG',
          totalDiscardedQuantity: '3.5000',
          reason: 'EXPIRATION',
          totalDiscardedCost: '6300.00',
        },
        {
          insumoId: 'ins-tomate-1',
          insumoName: 'Salsa de Tomate',
          unitOfMeasure: 'KG',
          totalDiscardedQuantity: '1.2000',
          reason: 'PHYSICAL_DAMAGE',
          totalDiscardedCost: null,
        },
        {
          insumoId: 'ins-masa-1',
          insumoName: 'Masa de Pizza',
          unitOfMeasure: 'UNITS',
          totalDiscardedQuantity: '5.0000',
          reason: 'EXPIRATION',
          totalDiscardedCost: '1250.00',
        },
      ];
    }
  }
}
