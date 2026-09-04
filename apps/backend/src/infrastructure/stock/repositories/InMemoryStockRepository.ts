import { Insumo } from '../../../domain/stock/entities/Insumo.js';
import { Remanente } from '../../../domain/stock/entities/Remanente.js';
import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';
import {
  IRemanenteRepository,
  StockMovementRecord,
} from '../../../domain/stock/repositories/IRemanenteRepository.js';
import {
  ExtractionUnitOfWork,
  IStockUnitOfWork,
  PreparationCloseUnitOfWork,
  WarehouseBalancesAfterDeduction,
} from '../../../domain/stock/repositories/IStockUnitOfWork.js';
import { RecipePreparation } from '../../../domain/kitchen/entities/RecipePreparation.js';
import { RecipePreparationItem } from '../../../domain/kitchen/entities/RecipePreparationItem.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { InsufficientStockException } from '../../../domain/stock/errors/InsufficientStockException.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';

export class InMemoryStockRepository
  implements IInsumoRepository, IRemanenteRepository, IStockUnitOfWork
{
  public insumos: Map<string, Insumo> = new Map();
  public remanentes: Map<string, Remanente> = new Map();
  public movements: StockMovementRecord[] = [];
  /** US-027: preparaciones de receta (compartido con `InMemoryRecipePreparationRepository`). */
  public recipePreparations: Map<string, RecipePreparation> = new Map();
  /** US-028: ítems de conciliación materializados al cerrar una preparación. */
  public recipePreparationItems: Map<string, RecipePreparationItem> = new Map();

  async findById(id: string): Promise<Insumo | null> {
    return this.insumos.get(id) || null;
  }

  async findInsumoById(id: string): Promise<Insumo | null> {
    return this.findById(id);
  }

  async findByName(name: string): Promise<Insumo | null> {
    const target = name.trim().toLowerCase();
    for (const insumo of this.insumos.values()) {
      if (insumo.name.trim().toLowerCase() === target) {
        return insumo;
      }
    }
    return null;
  }

  async findAll(): Promise<Insumo[]> {
    return Array.from(this.insumos.values());
  }

  async findRemanenteById(id: string): Promise<Remanente | null> {
    return this.remanentes.get(id) || null;
  }

  async findActiveRemanentesByInsumoId(insumoId: string): Promise<Remanente[]> {
    return Array.from(this.remanentes.values())
      .filter((r) => r.insumoId === insumoId && r.status === 'ACTIVE')
      .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime());
  }

  async save(insumo: Insumo): Promise<void> {
    this.insumos.set(insumo.id, insumo);
  }

  async existsStockAtLocation(storageLocationId: string): Promise<boolean> {
    for (const insumo of this.insumos.values()) {
      const line = insumo.stockLines.find((l) => l.storageLocationId === storageLocationId);
      if (line && !line.quantity.toDecimal().isZero()) {
        return true;
      }
    }
    return false;
  }

  async saveRemanente(remanente: Remanente): Promise<void> {
    this.remanentes.set(remanente.id, remanente);
  }

  async existsActiveRemanenteAtLocation(storageLocationId: string, locationName: string): Promise<boolean> {
    for (const rem of this.remanentes.values()) {
      if (rem.status !== 'ACTIVE') continue;
      if (rem.storageLocationId === storageLocationId || rem.location === locationName) {
        return true;
      }
    }
    return false;
  }

  public seedInsumo(insumo: Insumo): void {
    this.insumos.set(insumo.id, insumo);
  }

  public seedRemanente(remanente: Remanente): void {
    this.remanentes.set(remanente.id, remanente);
  }

  async recordMovement(movement: StockMovementRecord): Promise<void> {
    this.movements.push({ ...movement, createdAt: movement.createdAt ?? new Date() });
  }

  /**
   * AUDIT-DEV-006 F-1: replica el rollback de `$transaction` para los fakes de
   * `IStockUnitOfWork`. Toma un snapshot shallow de todos los `Map`/array de estado
   * (cada escritura reemplaza la entrada, nunca la muta in place) y lo restaura ante
   * cualquier excepción.
   */
  private async withSnapshot<T>(work: () => Promise<T>): Promise<T> {
    const snapshot = {
      insumos: new Map(this.insumos),
      remanentes: new Map(this.remanentes),
      movements: [...this.movements],
      recipePreparations: new Map(this.recipePreparations),
      recipePreparationItems: new Map(this.recipePreparationItems),
    };
    try {
      return await work();
    } catch (error) {
      this.insumos = snapshot.insumos;
      this.remanentes = snapshot.remanentes;
      this.movements = snapshot.movements;
      this.recipePreparations = snapshot.recipePreparations;
      this.recipePreparationItems = snapshot.recipePreparationItems;
      throw error;
    }
  }

  async runExtraction<T>(work: (uow: ExtractionUnitOfWork) => Promise<T>): Promise<T> {
    return this.withSnapshot(() => work(this));
  }

  async saveRecipePreparation(preparation: RecipePreparation): Promise<void> {
    this.recipePreparations.set(preparation.id, preparation);
  }

  /** US-028: frontera transaccional del cierre / abandono de una preparación. */
  async runPreparationClose<T>(work: (uow: PreparationCloseUnitOfWork) => Promise<T>): Promise<T> {
    return this.withSnapshot(() => work(this));
  }

  async findRemanentesByPreparation(preparationId: string): Promise<Remanente[]> {
    return Array.from(this.remanentes.values()).filter(
      (r) => r.recipePreparationId === preparationId && r.status === 'ACTIVE'
    );
  }

  async saveRecipePreparationItem(item: RecipePreparationItem): Promise<void> {
    this.recipePreparationItems.set(item.id, item);
  }

  async incrementWarehouseStock(
    insumoId: string,
    storageLocationId: string,
    quantity: DecimalQuantity
  ): Promise<void> {
    const insumo = this.insumos.get(insumoId);
    if (!insumo) {
      throw new EntityNotFoundException('Insumo', insumoId);
    }
    const hasLine = insumo.stockLines.some((l) => l.storageLocationId === storageLocationId);
    const nextLines = hasLine
      ? insumo.stockLines.map((l) =>
          l.storageLocationId === storageLocationId
            ? { storageLocationId: l.storageLocationId, quantity: l.quantity.add(quantity) }
            : l
        )
      : [...insumo.stockLines, { storageLocationId, quantity }];

    this.insumos.set(
      insumoId,
      new Insumo({
        id: insumo.id,
        name: insumo.name,
        unitOfMeasure: insumo.unitOfMeasure,
        unitCost: insumo.unitCost,
        stockLines: nextLines,
      })
    );
  }

  /**
   * AUDIT-DEV-006 F-2: débito por línea sin read-check-then-write. Rechaza si el
   * saldo del sector es insuficiente, reconstruye el agregado (no lo muta in place —
   * así el snapshot shallow de `runExtraction` alcanza para revertir).
   */
  async deductStockAtAtomically(
    insumoId: string,
    insumoName: string,
    storageLocationId: string,
    quantity: DecimalQuantity
  ): Promise<WarehouseBalancesAfterDeduction> {
    const insumo = this.insumos.get(insumoId);
    if (!insumo) {
      throw new EntityNotFoundException('Insumo', insumoId);
    }

    const sectorStock = insumo.stockAt(storageLocationId);
    if (!sectorStock.isGreaterThanOrEqualTo(quantity)) {
      // Cubre también la línea inexistente: `stockAt` devuelve 0 y 0 < quantity (>0).
      throw new InsufficientStockException(insumoName, quantity.toString(), sectorStock.toString());
    }

    const nextLines = insumo.stockLines.map((l) =>
      l.storageLocationId === storageLocationId
        ? { storageLocationId: l.storageLocationId, quantity: l.quantity.subtract(quantity) }
        : l
    );

    const updated = new Insumo({
      id: insumo.id,
      name: insumo.name,
      unitOfMeasure: insumo.unitOfMeasure,
      unitCost: insumo.unitCost,
      stockLines: nextLines,
    });
    this.insumos.set(insumoId, updated);

    return {
      remainingSectorStock: updated.stockAt(storageLocationId),
      remainingWarehouseStock: updated.warehouseStock,
    };
  }
}
