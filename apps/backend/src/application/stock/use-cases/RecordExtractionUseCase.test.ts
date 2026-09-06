import { describe, it, expect, beforeEach } from 'vitest';
import { RecordExtractionUseCase } from './RecordExtractionUseCase.js';
import { IInsumoRepository } from '../../../domain/stock/repositories/IInsumoRepository.js';
import {
  ExtractionUnitOfWork,
  IStockUnitOfWork,
  WarehouseBalancesAfterDeduction,
} from '../../../domain/stock/repositories/IStockUnitOfWork.js';
import { Insumo } from '../../../domain/stock/entities/Insumo.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { StockMovementRecord } from '../../../domain/stock/repositories/IRemanenteRepository.js';
import { Remanente } from '../../../domain/stock/entities/Remanente.js';
import { InsufficientStockException } from '../../../domain/stock/errors/InsufficientStockException.js';
import { DiscardReasonRequiredException } from '../../../domain/stock/errors/DiscardReasonRequiredException.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';
import { Clock } from '../../../domain/shared/Clock.js';
import { IdGenerator } from '../../../domain/shared/IdGenerator.js';
import { RecipePreparation } from '../../../domain/kitchen/entities/RecipePreparation.js';
import { IRecipePreparationRepository } from '../../../domain/kitchen/repositories/IRecipePreparationRepository.js';

const FIXED_NOW = new Date('2026-02-01T12:00:00.000Z');
const fixedClock: Clock = { now: () => FIXED_NOW };

class SequentialIdGenerator implements IdGenerator {
  private readonly counters = new Map<string, number>();
  next(prefix: string): string {
    const n = (this.counters.get(prefix) ?? 0) + 1;
    this.counters.set(prefix, n);
    return `${prefix}-${n}`;
  }
}

/**
 * TDD unitario del caso de uso (Guard 21: co-locado en src/application/). Ejercita la
 * orquestación con fakes puros — el UoW registra sus llamadas para verificar que TODAS
 * las escrituras pasan por `runExtraction` (AUDIT-DEV-006 F-1) y con los argumentos exactos.
 */

const SECTOR_BALANCE: WarehouseBalancesAfterDeduction = {
  remainingSectorStock: new DecimalQuantity('7.250'),
  remainingWarehouseStock: new DecimalQuantity('19.500'),
};

class FakeInsumoRepository implements IInsumoRepository {
  private readonly store = new Map<string, Insumo>();
  seed(insumo: Insumo): void {
    this.store.set(insumo.id, insumo);
  }
  async findById(id: string): Promise<Insumo | null> {
    return this.store.get(id) ?? null;
  }
  async findByName(): Promise<Insumo | null> {
    return null;
  }
  async findByBarcode(): Promise<Insumo | null> {
    return null;
  }
  async findAll(): Promise<Insumo[]> {
    return [...this.store.values()];
  }
  async save(): Promise<void> {}
  async existsStockAtLocation(): Promise<boolean> {
    return false;
  }
}

class RecordingUnitOfWork implements IStockUnitOfWork {
  public runExtractionCalls = 0;
  public deductArgs: { insumoId: string; insumoName: string; storageLocationId: string; quantity: string }[] = [];
  public savedRemanentes: Remanente[] = [];
  public movements: StockMovementRecord[] = [];
  public savedPreparations: { id: string }[] = [];
  /** orden en el que se llamaron las escrituras (para verificar prep antes de remanente). */
  public callOrder: string[] = [];
  public deductBehaviour: () => WarehouseBalancesAfterDeduction = () => SECTOR_BALANCE;

  async runExtraction<T>(work: (uow: ExtractionUnitOfWork) => Promise<T>): Promise<T> {
    this.runExtractionCalls += 1;
    const uow: ExtractionUnitOfWork = {
      deductStockAtAtomically: async (insumoId, insumoName, storageLocationId, quantity) => {
        this.deductArgs.push({ insumoId, insumoName, storageLocationId, quantity: quantity.toString() });
        return this.deductBehaviour();
      },
      saveRecipePreparation: async (prep) => {
        this.savedPreparations.push({ id: prep.id });
        this.callOrder.push('prep');
      },
      saveRemanente: async (remanente) => {
        this.savedRemanentes.push(remanente);
        this.callOrder.push('remanente');
      },
      recordMovement: async (movement) => {
        this.movements.push(movement);
        this.callOrder.push('movement');
      },
    };
    return work(uow);
  }

  // RecordExtractionUseCase no usa estas fronteras; stubs para satisfacer la interfaz.
  async runPreparationClose<T>(): Promise<T> {
    throw new Error('no usado por RecordExtractionUseCase');
  }

  async runAdhocConsumption<T>(): Promise<T> {
    throw new Error('no usado por RecordExtractionUseCase');
  }
}

class FakeRecipePreparationRepository implements IRecipePreparationRepository {
  public preset = new Map<string, RecipePreparation>();
  async save(): Promise<void> {}
  async findById(id: string): Promise<RecipePreparation | null> {
    return this.preset.get(id) ?? null;
  }
  async findByStatus(): Promise<RecipePreparation[]> {
    return [];
  }
}

describe('RecordExtractionUseCase (unitario)', () => {
  let insumoRepo: FakeInsumoRepository;
  let uow: RecordingUnitOfWork;
  let prepRepo: FakeRecipePreparationRepository;
  let useCase: RecordExtractionUseCase;

  beforeEach(() => {
    insumoRepo = new FakeInsumoRepository();
    uow = new RecordingUnitOfWork();
    prepRepo = new FakeRecipePreparationRepository();
    useCase = new RecordExtractionUseCase(
      insumoRepo,
      uow,
      fixedClock,
      new SequentialIdGenerator(),
      undefined,
      prepRepo
    );
    insumoRepo.seed(
      new Insumo({
        id: 'ins-1',
        name: 'Queso Mozzarella',
        unitOfMeasure: 'KG',
        stockLines: [{ storageLocationId: 'loc-1', quantity: new DecimalQuantity('10.000') }],
      })
    );
  });

  it('lanza EntityNotFoundException nombrando "Insumo" cuando el insumo no existe', async () => {
    await expect(
      useCase.execute({ insumoId: 'no-existe', fromStorageLocationId: 'loc-1', quantity: '1.000' })
    ).rejects.toMatchObject({ name: 'EntityNotFoundException', message: expect.stringContaining('Insumo con ID no-existe') });
    expect(uow.runExtractionCalls).toBe(0);
  });

  it('fail-fast: rechaza con InsufficientStockException sin abrir la transacción', async () => {
    await expect(
      useCase.execute({ insumoId: 'ins-1', fromStorageLocationId: 'loc-1', quantity: '25.000' })
    ).rejects.toBeInstanceOf(InsufficientStockException);
    expect(uow.runExtractionCalls).toBe(0);
    expect(uow.deductArgs).toHaveLength(0);
  });

  it('extracción KITCHEN_STOCK: débito + remanente + movimiento, todo dentro de runExtraction', async () => {
    const result = await useCase.execute({
      insumoId: 'ins-1',
      fromStorageLocationId: 'loc-1',
      quantity: '2.500',
    });

    expect(uow.runExtractionCalls).toBe(1);
    expect(uow.deductArgs).toEqual([
      { insumoId: 'ins-1', insumoName: 'Queso Mozzarella', storageLocationId: 'loc-1', quantity: '2.500' },
    ]);
    expect(uow.savedRemanentes).toHaveLength(1);
    expect(uow.savedRemanentes[0].insumoId).toBe('ins-1');
    expect(uow.savedRemanentes[0].currentQuantity.toString()).toBe('2.500');

    expect(uow.movements).toHaveLength(1);
    expect(uow.movements[0].id).toMatch(/^mov-\d+$/);
    expect(uow.movements[0].type).toBe('EXTRACTION');
    expect(uow.movements[0].toLoc).toBe('KITCHEN_FRIDGE');
    expect(uow.movements[0].purpose).toBe('KITCHEN_STOCK');

    // los saldos de la respuesta vienen del resultado del débito atómico, no de un re-read
    expect(result.remainingSectorStock).toBe('7.250');
    expect(result.remainingWarehouseStock).toBe('19.500');
    expect(result.status).toBe('ACTIVE');
    expect(result.location).toBe('KITCHEN_FRIDGE');
    expect(result.remanenteId).toBe(uow.savedRemanentes[0].id);
  });

  it('purpose RECIPE: movimiento tipo EXTRACTION_RECIPE con recipeId y toStorageLocationId elegido', async () => {
    await useCase.execute({
      insumoId: 'ins-1',
      fromStorageLocationId: 'loc-1',
      quantity: '1.000',
      toStorageLocationId: 'KITCHEN_PREP',
      purpose: 'RECIPE',
      recipeId: 'rec-9',
      reason: 'Mise en place',
    });

    expect(uow.movements[0].type).toBe('EXTRACTION_RECIPE');
    expect(uow.movements[0].toLoc).toBe('KITCHEN_PREP');
    expect(uow.movements[0].recipeId).toBe('rec-9');
    expect(uow.movements[0].reason).toBe('Mise en place');
  });

  describe('US-027: apertura de preparación de receta', () => {
    it('abre una RecipePreparation nueva, la guarda ANTES del remanente y lo enlaza', async () => {
      const result = await useCase.execute({
        insumoId: 'ins-1',
        fromStorageLocationId: 'loc-1',
        quantity: '2.000',
        purpose: 'RECIPE',
        recipeId: 'rec-pizza',
        plannedPortions: 8,
        operatorId: 'usr-op-1',
      });

      expect(uow.savedPreparations).toHaveLength(1);
      expect(result.recipePreparationId).toBe(uow.savedPreparations[0].id);
      expect(result.recipePreparationId).toMatch(/^prep-\d+$/);
      // la preparación se persiste antes que el remanente (FK)
      expect(uow.callOrder.indexOf('prep')).toBeLessThan(uow.callOrder.indexOf('remanente'));
      expect(uow.savedRemanentes[0].recipePreparationId).toBe(result.recipePreparationId);
    });

    it('reutiliza una preparación abierta de la misma receta cuando se pasa recipePreparationId', async () => {
      const existing = RecipePreparation.openNew('prep-existente', 'rec-pizza', 8, 'usr-op-1', FIXED_NOW);
      prepRepo.preset.set('prep-existente', existing);

      const result = await useCase.execute({
        insumoId: 'ins-1',
        fromStorageLocationId: 'loc-1',
        quantity: '1.000',
        purpose: 'RECIPE',
        recipeId: 'rec-pizza',
        recipePreparationId: 'prep-existente',
      });

      expect(result.recipePreparationId).toBe('prep-existente');
      expect(uow.savedRemanentes[0].recipePreparationId).toBe('prep-existente');
    });

    it('rechaza un recipePreparationId inexistente / de otra receta', async () => {
      await expect(
        useCase.execute({
          insumoId: 'ins-1',
          fromStorageLocationId: 'loc-1',
          quantity: '1.000',
          purpose: 'RECIPE',
          recipeId: 'rec-pizza',
          recipePreparationId: 'no-existe',
        })
      ).rejects.toBeInstanceOf(EntityNotFoundException);
      expect(uow.runExtractionCalls).toBe(0);
    });

    it('KITCHEN_STOCK no abre preparación', async () => {
      await useCase.execute({ insumoId: 'ins-1', fromStorageLocationId: 'loc-1', quantity: '1.000' });
      expect(uow.savedPreparations).toHaveLength(0);
    });
  });

  it('si deductStockAtAtomically lanza, no se guarda remanente ni movimiento y el error sube', async () => {
    uow.deductBehaviour = () => {
      throw new InsufficientStockException('Queso Mozzarella', '2.000', '1.000');
    };
    await expect(
      useCase.execute({ insumoId: 'ins-1', fromStorageLocationId: 'loc-1', quantity: '2.000' })
    ).rejects.toBeInstanceOf(InsufficientStockException);
    expect(uow.savedRemanentes).toHaveLength(0);
    expect(uow.movements).toHaveLength(0);
  });

  describe('descarte directo (DIRECT_DISCARD)', () => {
    it('exige motivo: sin reason lanza antes de abrir la transacción', async () => {
      await expect(
        useCase.execute({ insumoId: 'ins-1', fromStorageLocationId: 'loc-1', quantity: '1.000', purpose: 'DIRECT_DISCARD' })
      ).rejects.toThrow(/motivo es obligatorio/i);
      expect(uow.runExtractionCalls).toBe(0);
    });

    it('exige motivo: reason en blanco (solo espacios) también lanza', async () => {
      await expect(
        useCase.execute({
          insumoId: 'ins-1',
          fromStorageLocationId: 'loc-1',
          quantity: '1.000',
          purpose: 'DIRECT_DISCARD',
          reason: '   ',
        })
      ).rejects.toThrow(/motivo es obligatorio/i);
    });

    it('debita y registra DISCARD_DIRECT hacia WASTE_BIN sin crear remanente', async () => {
      const result = await useCase.execute({
        insumoId: 'ins-1',
        fromStorageLocationId: 'loc-1',
        quantity: '3.000',
        purpose: 'DIRECT_DISCARD',
        reason: 'Empaque roto',
      });

      expect(uow.runExtractionCalls).toBe(1);
      expect(uow.savedRemanentes).toHaveLength(0);
      expect(uow.movements).toHaveLength(1);
      expect(uow.movements[0].id).toMatch(/^mov-\d+$/);
      expect(uow.movements[0].type).toBe('DISCARD_DIRECT');
      expect(uow.movements[0].toLoc).toBe('WASTE_BIN');
      expect(uow.movements[0].purpose).toBe('DIRECT_DISCARD');
      expect(uow.movements[0].reason).toBe('Empaque roto');

      // AUDIT-DEV-006 F-9: null, no cadena vacía centinela
      expect(result.remanenteId).toBeNull();
      expect(result.location).toBe('WASTE_BIN');
      expect(result.status).toBe('DISCARDED');
      expect(result.remainingSectorStock).toBe('7.250');
      expect(result.remainingWarehouseStock).toBe('19.500');
      // AUDIT-DEV-006 F-3: expirationDate del descarte viene del Clock inyectado
      expect(result.expirationDate).toBe(FIXED_NOW.toISOString());
    });

    it('AUDIT-DEV-006 F-4: sin motivo lanza DiscardReasonRequiredException (400), no un Error crudo', async () => {
      await expect(
        useCase.execute({ insumoId: 'ins-1', fromStorageLocationId: 'loc-1', quantity: '1.000', purpose: 'DIRECT_DISCARD' })
      ).rejects.toBeInstanceOf(DiscardReasonRequiredException);
    });
  });

  it('usa UNCLASSIFIED_WAREHOUSE_LOCATION_ID cuando no se envía fromStorageLocationId', async () => {
    insumoRepo.seed(
      new Insumo({
        id: 'ins-legacy',
        name: 'Harina',
        unitOfMeasure: 'KG',
        stockLines: [{ storageLocationId: 'loc-seed-unclassified', quantity: new DecimalQuantity('5.000') }],
      })
    );
    await useCase.execute({ insumoId: 'ins-legacy', quantity: '1.000' });
    expect(uow.deductArgs[0].storageLocationId).toBe('loc-seed-unclassified');
  });

  it('AUDIT-DEV-006 F-3: ids de remanente y movimiento vienen del IdGenerator inyectado, únicos por llamada', async () => {
    const r1 = await useCase.execute({ insumoId: 'ins-1', fromStorageLocationId: 'loc-1', quantity: '1.000' });
    const r2 = await useCase.execute({ insumoId: 'ins-1', fromStorageLocationId: 'loc-1', quantity: '1.000' });

    expect(r1.remanenteId).toBe('rem-1');
    expect(r2.remanenteId).toBe('rem-2');
    expect(r1.remanenteId).not.toBe(r2.remanenteId);
    expect(uow.movements.map((m) => m.id)).toEqual(['mov-1', 'mov-2']);
    expect(uow.savedRemanentes[0].id).toBe(r1.remanenteId);
  });

  it('AUDIT-DEV-006 F-3: expirationDate del remanente = clock.now() + 24h', async () => {
    const result = await useCase.execute({ insumoId: 'ins-1', fromStorageLocationId: 'loc-1', quantity: '1.000' });
    const expected = new Date(FIXED_NOW.getTime() + 24 * 60 * 60 * 1000).toISOString();
    expect(result.expirationDate).toBe(expected);
    expect(uow.savedRemanentes[0].expirationDate.toISOString()).toBe(expected);
  });
});
