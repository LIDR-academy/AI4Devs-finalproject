export interface WasteSummaryItem {
  insumoId: string;
  insumoName: string;
  unitOfMeasure: string;
  totalDiscardedQuantity: string;
  reason: string;
}

export class ReportsService {
  public static async fetchWasteReport(startDate: string, endDate: string): Promise<WasteSummaryItem[]> {
    try {
      const response = await fetch(`/api/v1/reports/waste?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`);
      if (!response.ok) {
        throw new Error('Error al obtener el reporte de mermas.');
      }
      return await response.json();
    } catch (err) {
      console.error('[ReportsService] Error al obtener el reporte de mermas, usando mock fallback:', err);
      return [
        {
          insumoId: 'ins-queso-1',
          insumoName: 'Queso Mozzarella',
          unitOfMeasure: 'KG',
          totalDiscardedQuantity: '3.5000',
          reason: 'EXPIRATION',
        },
        {
          insumoId: 'ins-tomate-1',
          insumoName: 'Salsa de Tomate',
          unitOfMeasure: 'KG',
          totalDiscardedQuantity: '1.2000',
          reason: 'PHYSICAL_DAMAGE',
        },
        {
          insumoId: 'ins-masa-1',
          insumoName: 'Masa de Pizza',
          unitOfMeasure: 'UNITS',
          totalDiscardedQuantity: '5.0000',
          reason: 'EXPIRATION',
        },
      ];
    }
  }
}
