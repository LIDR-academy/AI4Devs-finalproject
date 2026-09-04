import { apiRequest } from '../../../shared/http/apiClient.js';

export interface WasteSummaryItem {
  insumoId: string;
  insumoName: string;
  unitOfMeasure: string;
  totalDiscardedQuantity: string;
  reason: string;
  totalDiscardedCost: string | null;
}

export interface RotationMetrics {
  averageTrrHours: number | null;
  targetTrrHours: number;
  sampleSize: number;
}

/** US-029: una línea de merma de preparación (receta → ingrediente → motivo). */
export interface PreparationWasteLine {
  recipeId: string;
  recipeName: string;
  insumoId: string;
  insumoName: string;
  unitOfMeasure: string;
  wasteReason: string;
  totalWastedQty: string;
  totalExtractedQty: string;
  wastePercent: string;
  wastedCost: string | null;
  overThreshold: boolean;
}

/** US-029 Escenario 2: consumo real vs. teórico para una receta → ingrediente. */
export interface RecipeConsumptionLine {
  recipeId: string;
  recipeName: string;
  insumoId: string;
  insumoName: string;
  unitOfMeasure: string;
  theoreticalQty: string;
  actualQty: string;
  differenceQty: string;
}

export interface PreparationWasteReport {
  wasteByReason: PreparationWasteLine[];
  consumptionVsTheoretical: RecipeConsumptionLine[];
  wasteAlertThresholdPercent: number;
}

export class ReportsService {
  public static async fetchRotationMetrics(startDate: string, endDate: string): Promise<RotationMetrics> {
    try {
      return await apiRequest<RotationMetrics>(
        `/reports/rotation-metrics?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
      );
    } catch (err) {
      console.error('[ReportsService] Error al obtener el indicador TRR, usando mock fallback:', err);
      return { averageTrrHours: 48.3, targetTrrHours: 72, sampleSize: 12 };
    }
  }

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

  // US-029 / TK-105-FE: sin fallback mock — un error real se propaga para que el panel
  // lo muestre con ErrorBanner (C-DEV-006-3), a diferencia de los dos métodos legacy de
  // arriba (deuda preexistente de TK-078-FE, fuera del alcance de este ticket).
  public static async fetchPreparationWasteReport(startDate: string, endDate: string): Promise<PreparationWasteReport> {
    return apiRequest<PreparationWasteReport>(
      `/reports/preparation-waste?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`
    );
  }
}
