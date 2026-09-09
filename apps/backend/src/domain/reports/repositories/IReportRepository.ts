import { WasteSummary } from '../entities/WasteSummary.js';
import { DecimalQuantity } from '../../stock/value-objects/DecimalQuantity.js';

// US-020: par crudo (creacion + instante terminal) de un remanente que alcanzo EXHAUSTED
// o DISCARDED dentro del rango consultado. El calculo del promedio (TRR real) vive en
// GetRotationMetricsUseCase (Application) — este repositorio solo transporta los datos.
export interface RemanenteRotationRecord {
  createdAt: Date;
  terminalAt: Date;
}

/**
 * US-029 / TK-105: una fila cruda de merma de preparación (`RecipePreparationItem` con
 * `wastedQty > 0`, de una preparación `CLOSED` cerrada en el rango). El agrupado por
 * receta → ingrediente → motivo y la valorización viven en el caso de uso (Application),
 * no aquí — este repositorio solo transporta los datos.
 */
export interface PreparationWasteRecord {
  recipeId: string;
  recipeName: string;
  insumoId: string;
  insumoName: string;
  unitOfMeasure: string;
  wasteReason: string;
  extractedQty: DecimalQuantity;
  wastedQty: DecimalQuantity;
  unitCost?: DecimalQuantity;
}

/**
 * US-029 / TK-105 Escenario 2: una fila cruda para el consumo real vs. teórico —
 * un `RecipePreparationItem` con la cantidad de receta por porción (`theoreticalUnitQty`)
 * y las porciones reales de esa preparación (para derivar el teórico de ESA tanda).
 */
export interface RecipeConsumptionRecord {
  recipeId: string;
  recipeName: string;
  insumoId: string;
  insumoName: string;
  unitOfMeasure: string;
  theoreticalUnitQty: DecimalQuantity;
  actualPortions: number;
  consumedQty: DecimalQuantity;
}

export interface IReportRepository {
  getWasteReport(startDate: Date, endDate: Date): Promise<WasteSummary[]>;
  getTerminalRemanentes(startDate: Date, endDate: Date): Promise<RemanenteRotationRecord[]>;
  getPreparationWasteRecords(startDate: Date, endDate: Date): Promise<PreparationWasteRecord[]>;
  getRecipeConsumptionRecords(startDate: Date, endDate: Date): Promise<RecipeConsumptionRecord[]>;
}
