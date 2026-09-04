import { describe, it, expect, beforeEach, vi } from 'vitest';
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
  public deductBehaviour: () => WarehouseBalancesAfterDeduction = () => SECTOR_BALANCE;

  async runExtraction<T>(work: (uow: ExtractionUnitOfWork) => Promise<T>): Promise<T> {
    this.runExtractionCalls += 1;
    const uow: ExtractionUnitOfWork = {
      deductStockAtAtomically: async (insumoId, insumoName, storageLocationId, quantity) => {
        this.deductArgs.push({ insumoId, insumoName, storageLocationId, quantity: quantity.toString() });
        return this.deductBehaviour();
      },
      saveRemanente: async (remanente) => {
        this.savedRemanentes.push(remanente);
      },
      recordMovement: async (movement) => {
        this.movements.push(movement);
      },
    };
    return work(uow);
  }
}

describe('RecordExtractionUseCase (unitario)', () => {
  let insumoRepo: FakeInsumoRepository;
  let uow: RecordingUnitOfWork;
  let useCase: RecordExtractionUseCase;

  beforeEach(() => {
    insumoRepo = new FakeInsumoRepository();
    uow = new RecordingUnitOfWork();
    useCase = new RecordExtractionUseCase(insumoRepo, uow);
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

  it('purpose RECIPE: movimiento tipo EXTRACTION_RECIPE con recipeId y toLocation elegido', async () => {
    await useCase.execute({
      insumoId: 'ins-1',
      fromStorageLocationId: 'loc-1',
      quantity: '1.000',
      toLocation: 'KITCHEN_PREP',
      purpose: 'RECIPE',
      recipeId: 'rec-9',
      reason: 'Mise en place',
    });

    expect(uow.movements[0].type).toBe('EXTRACTION_RECIPE');
    expect(uow.movements[0].toLoc).toBe('KITCHEN_PREP');
    expect(uow.movements[0].recipeId).toBe('rec-9');
    expect(uow.movements[0].reason).toBe('Mise en place');
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

      expect(result.remanenteId).toBe('');
      expect(result.location).toBe('WASTE_BIN');
      expect(result.status).toBe('DISCARDED');
      expect(result.remainingSectorStock).toBe('7.250');
      expect(result.remainingWarehouseStock).toBe('19.500');
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

  it('el remanenteId sigue el formato rem-<timestamp>-<sufijo> y su remanente lo comparte', async () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const result = await useCase.execute({ insumoId: 'ins-1', fromStorageLocationId: 'loc-1', quantity: '1.000' });
    spy.mockRestore();
    // sufijo = Math.floor(0.5 * 1000) = 500 — mata el mutante aritmético del multiplicador
    expect(result.remanenteId).toMatch(/^rem-\d+-500$/);
    expect(uow.savedRemanentes[0].id).toBe(result.remanenteId);
  });
});
