import { DecimalQuantity } from '../value-objects/DecimalQuantity.js';
import { Remanente } from '../entities/Remanente.js';
import { StockMovementRecord } from './IRemanenteRepository.js';
import { RecipePreparation } from '../../kitchen/entities/RecipePreparation.js';
import { RecipePreparationItem } from '../../kitchen/entities/RecipePreparationItem.js';

/**
 * Saldos de bodega tras un débito de línea (US-025): el del sub-sector de origen
 * y el total del insumo en toda la bodega.
 */
export interface WarehouseBalancesAfterDeduction {
  remainingSectorStock: DecimalQuantity;
  remainingWarehouseStock: DecimalQuantity;
}

/**
 * Conjunto de escrituras de una extracción de bodega. Todos sus métodos se
 * ejecutan dentro de la **misma** transacción abierta por `IStockUnitOfWork`.
 */
export interface ExtractionUnitOfWork {
  /**
   * Debita `quantity` de la línea `(insumoId, storageLocationId)` con un `UPDATE`
   * condicional atómico (`WHERE quantity >= :quantity`) — nunca read-check-then-write
   * (C-DEV-006-2). Si la operación afecta 0 filas (saldo del sector insuficiente o
   * línea inexistente) lanza `InsufficientStockException`. Devuelve el saldo del
   * sector y de la bodega tras el débito.
   */
  deductStockAtAtomically(
    insumoId: string,
    insumoName: string,
    storageLocationId: string,
    quantity: DecimalQuantity
  ): Promise<WarehouseBalancesAfterDeduction>;

  saveRemanente(remanente: Remanente): Promise<void>;

  recordMovement(movement: StockMovementRecord): Promise<void>;

  /**
   * US-027: persiste la `RecipePreparation` abierta al extraer con `purpose = RECIPE`,
   * dentro de la misma transacción que el remanente que la referencia (la FK
   * `Remanente.recipePreparationId` exige que la preparación exista antes).
   * Cross-cut stock↔kitchen deliberado — misma frontera que ya cruza la extracción
   * al crear un `Remanente` de cocina (ver TK-058).
   */
  saveRecipePreparation(preparation: RecipePreparation): Promise<void>;
}

/**
 * Conjunto de escrituras del cierre / abandono de una preparación de receta (US-028).
 * Muta varios `Remanente` + la `RecipePreparation` + `RecipePreparationItem[]` +
 * `StockMovement[]` + potencial `WarehouseStock` — todo dentro de la **misma**
 * transacción abierta por `runPreparationClose` (C-DEV-006-1 / ADR-003 §3.5).
 */
export interface PreparationCloseUnitOfWork {
  /** Los remanentes `ACTIVE` vinculados a la preparación (`recipePreparationId`). */
  findRemanentesByPreparation(preparationId: string): Promise<Remanente[]>;

  saveRemanente(remanente: Remanente): Promise<void>;

  recordMovement(movement: StockMovementRecord): Promise<void>;

  /**
   * US-028 Escenario 3: re-incrementa `WarehouseStock (insumoId, storageLocationId)`
   * al devolver un sobrante intacto a bodega. `UPDATE … quantity += :q` (upsert si la
   * línea del sub-sector no existía).
   */
  incrementWarehouseStock(
    insumoId: string,
    storageLocationId: string,
    quantity: DecimalQuantity
  ): Promise<void>;

  saveRecipePreparation(preparation: RecipePreparation): Promise<void>;

  saveRecipePreparationItem(item: RecipePreparationItem): Promise<void>;
}

/**
 * Puerto de frontera transaccional para la extracción de bodega (C-DEV-006-1,
 * AUDIT-DEV-006 F-1/F-2). El caso de uso encadena el débito de stock, la creación
 * del remanente y el registro del movimiento dentro de `runExtraction` — ante
 * cualquier excepción la transacción revierte **por completo**, sin compensación manual.
 */
export interface IStockUnitOfWork {
  runExtraction<T>(work: (uow: ExtractionUnitOfWork) => Promise<T>): Promise<T>;

  /** US-028: misma garantía para el cierre / abandono de una preparación de receta. */
  runPreparationClose<T>(work: (uow: PreparationCloseUnitOfWork) => Promise<T>): Promise<T>;
}
