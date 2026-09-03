import { describe, it, expect, beforeEach } from 'vitest';
import { ListInsumosUseCase } from './ListInsumosUseCase.js';
import { CreateInsumoUseCase } from './CreateInsumoUseCase.js';
import { RestockInsumoUseCase } from './RestockInsumoUseCase.js';
import { InMemoryStockRepository } from '../../../infrastructure/stock/repositories/InMemoryStockRepository.js';
import { InMemoryLocationRepository } from '../../../infrastructure/stock/repositories/InMemoryLocationRepository.js';

describe('ListInsumosUseCase', () => {
  let repository: InMemoryStockRepository;
  let listUseCase: ListInsumosUseCase;
  let createUseCase: CreateInsumoUseCase;

  beforeEach(() => {
    repository = new InMemoryStockRepository();
    listUseCase = new ListInsumosUseCase(repository);
    createUseCase = new CreateInsumoUseCase(repository);
  });

  it('debe incluir el unitCost registrado de cada insumo en la lista (US-019)', async () => {
    await createUseCase.execute({ name: 'Queso Mozzarella', unitOfMeasure: 'KG', unitCost: '1800.00' });

    const result = await listUseCase.execute();

    expect(result[0].unitCost).toBe('1800.00');
  });

  it('debe devolver unitCost como null cuando el insumo no tiene costo registrado (US-019)', async () => {
    await createUseCase.execute({ name: 'Salsa de Tomate', unitOfMeasure: 'L' });

    const result = await listUseCase.execute();

    expect(result[0].unitCost).toBeNull();
  });

  it('US-025: expone stockByLocation con nombre de sub-sector y warehouseStock como suma', async () => {
    const locationRepo = new InMemoryLocationRepository();
    const list = new ListInsumosUseCase(repository, locationRepo);
    const create = new CreateInsumoUseCase(repository, locationRepo);
    const restock = new RestockInsumoUseCase(repository, repository, locationRepo);

    const insumo = await create.execute({
      name: 'Lomo Vacuno',
      unitOfMeasure: 'KG',
      initialWarehouseStock: '12.000',
      storageLocationId: 'loc-seed-meat-fridge',
    });
    await restock.execute({ insumoId: insumo.id, quantity: '8.000', storageLocationId: 'loc-seed-freezer' });

    const [row] = await list.execute();
    expect(row.warehouseStock).toBe('20.000');
    expect(row.stockByLocation).toEqual(
      expect.arrayContaining([
        { storageLocationId: 'loc-seed-meat-fridge', storageLocationName: 'Heladera de Carnes', quantity: '12.000' },
        { storageLocationId: 'loc-seed-freezer', storageLocationName: 'Cámara de Congelados', quantity: '8.000' },
      ])
    );
  });
});
