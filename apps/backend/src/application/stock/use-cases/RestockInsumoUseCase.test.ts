import { describe, it, expect, beforeEach } from 'vitest';
import { RestockInsumoUseCase } from './RestockInsumoUseCase.js';
import { CreateInsumoUseCase } from './CreateInsumoUseCase.js';
import { InMemoryStockRepository } from '../../../infrastructure/stock/repositories/InMemoryStockRepository.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';

describe('RestockInsumoUseCase', () => {
  let repository: InMemoryStockRepository;
  let createInsumoUseCase: CreateInsumoUseCase;
  let restockUseCase: RestockInsumoUseCase;

  beforeEach(() => {
    repository = new InMemoryStockRepository();
    createInsumoUseCase = new CreateInsumoUseCase(repository);
    restockUseCase = new RestockInsumoUseCase(repository, repository);
  });

  it('suma la cantidad recibida al stock de bodega existente (incremental, no absoluto)', async () => {
    const insumo = await createInsumoUseCase.execute({
      name: 'Harina 000',
      unitOfMeasure: 'KG',
      initialWarehouseStock: '5.000',
    });

    const result = await restockUseCase.execute({ insumoId: insumo.id, quantity: '10.500' });

    expect(result.quantityAdded).toBe('10.500');
    expect(result.newWarehouseStock).toBe('15.500');

    const savedInsumo = await repository.findById(insumo.id);
    expect(savedInsumo?.warehouseStock.toString()).toBe('15.500');
  });

  it('registra un movimiento de auditoria tipo RESTOCK', async () => {
    const insumo = await createInsumoUseCase.execute({ name: 'Queso Mozzarella', unitOfMeasure: 'KG' });

    await restockUseCase.execute({ insumoId: insumo.id, quantity: '3' });

    const movements = repository.movements.filter((m) => m.insumoId === insumo.id);
    expect(movements).toHaveLength(1);
    expect(movements[0]).toMatchObject({
      insumoId: insumo.id,
      type: 'RESTOCK',
      quantity: '3.000',
      fromLoc: 'SUPPLIER',
      // US-025: el reabastecimiento apunta a un sub-sector; sin sector explícito cae al "sin clasificar".
      toLoc: 'loc-seed-unclassified',
    });
  });

  it('lanza EntityNotFoundException si el insumo no existe', async () => {
    await expect(restockUseCase.execute({ insumoId: 'ins-inexistente', quantity: '1' })).rejects.toThrow(
      EntityNotFoundException
    );
  });

  it('US-025: reabastece a un segundo sub-sector sumando al total sin mezclar líneas', async () => {
    const insumo = await createInsumoUseCase.execute({
      name: 'Lomo Vacuno',
      unitOfMeasure: 'KG',
      initialWarehouseStock: '12.000',
      storageLocationId: 'sec-carnes',
    });

    const result = await restockUseCase.execute({
      insumoId: insumo.id,
      quantity: '8.000',
      storageLocationId: 'sec-congelados',
    });

    expect(result.storageLocationId).toBe('sec-congelados');
    expect(result.newSectorStock).toBe('8.000');
    expect(result.newWarehouseStock).toBe('20.000');

    const saved = await repository.findById(insumo.id);
    expect(saved?.stockAt('sec-carnes').toString()).toBe('12.000');
    expect(saved?.stockAt('sec-congelados').toString()).toBe('8.000');
  });
});
