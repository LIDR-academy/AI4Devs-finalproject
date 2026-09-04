import { DecimalQuantity } from '../value-objects/DecimalQuantity.js';
import { Remanente } from '../entities/Remanente.js';
import { StockMovementRecord } from './IRemanenteRepository.js';

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
}

/**
 * Puerto de frontera transaccional para la extracción de bodega (C-DEV-006-1,
 * AUDIT-DEV-006 F-1/F-2). El caso de uso encadena el débito de stock, la creación
 * del remanente y el registro del movimiento dentro de `runExtraction` — ante
 * cualquier excepción la transacción revierte **por completo**, sin compensación manual.
 */
export interface IStockUnitOfWork {
  runExtraction<T>(work: (uow: ExtractionUnitOfWork) => Promise<T>): Promise<T>;
}
