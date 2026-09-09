import { describe, it, expect, beforeEach } from 'vitest';
import { CreateInsumoUseCase } from './CreateInsumoUseCase.js';
import { InMemoryStockRepository } from '../../../infrastructure/stock/repositories/InMemoryStockRepository.js';
import { InMemoryLocationRepository } from '../../../infrastructure/stock/repositories/InMemoryLocationRepository.js';
import { InsumoAlreadyExistsException } from '../../../domain/stock/errors/InsumoAlreadyExistsException.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';

describe('CreateInsumoUseCase', () => {
  let repository: InMemoryStockRepository;
  let useCase: CreateInsumoUseCase;

  beforeEach(() => {
    repository = new InMemoryStockRepository();
    useCase = new CreateInsumoUseCase(repository);
  });

  it('debe registrar un nuevo insumo en bodega correctamente', async () => {
    const result = await useCase.execute({
      name: 'Queso Parmesano',
      unitOfMeasure: 'KG',
      initialWarehouseStock: '10.5000',
    });

    expect(result.id).toBeDefined();
    expect(result.name).toBe('Queso Parmesano');
    expect(result.unitOfMeasure).toBe('KG');
    expect(result.warehouseStock).toBe('10.500');

    const savedInsumo = await repository.findByName('Queso Parmesano');
    expect(savedInsumo).not.toBeNull();
    expect(savedInsumo?.name).toBe('Queso Parmesano');
  });

  it('debe lanzar InsumoAlreadyExistsException al intentar duplicar el nombre (case-insensitive)', async () => {
    await useCase.execute({
      name: 'Salsa Pomodoro',
      unitOfMeasure: 'L',
    });

    await expect(
      useCase.execute({
        name: 'salsa pomodoro',
        unitOfMeasure: 'L',
      })
    ).rejects.toThrow(InsumoAlreadyExistsException);
  });

  it('debe registrar el costo por unidad de compra cuando se provee unitCost (US-019)', async () => {
    const result = await useCase.execute({
      name: 'Queso Mozzarella',
      unitOfMeasure: 'KG',
      unitCost: '1800.00',
    });

    expect(result.unitCost).toBe('1800.00');
  });

  it('debe dejar unitCost como null cuando no se provee costo (US-019)', async () => {
    const result = await useCase.execute({
      name: 'Salsa de Tomate',
      unitOfMeasure: 'L',
    });

    expect(result.unitCost).toBeNull();
  });
});

describe('CreateInsumoUseCase — depósito en sub-sector de bodega (US-025)', () => {
  let repository: InMemoryStockRepository;
  let locationRepo: InMemoryLocationRepository;
  let useCase: CreateInsumoUseCase;

  beforeEach(() => {
    repository = new InMemoryStockRepository();
    locationRepo = new InMemoryLocationRepository();
    useCase = new CreateInsumoUseCase(repository, locationRepo);
  });

  it('deposita el stock inicial en el sub-sector indicado y lo refleja en stockByLocation', async () => {
    const result = await useCase.execute({
      name: 'Lomo Vacuno',
      unitOfMeasure: 'KG',
      initialWarehouseStock: '12.0000',
      storageLocationId: 'loc-seed-meat-fridge',
    });

    expect(result.warehouseStock).toBe('12.000');
    expect(result.stockByLocation).toEqual([
      { storageLocationId: 'loc-seed-meat-fridge', storageLocationName: 'Heladera de Carnes', quantity: '12.000' },
    ]);

    const saved = await repository.findById(result.id);
    expect(saved?.stockAt('loc-seed-meat-fridge').toString()).toBe('12.000');
  });

  it('rechaza con EntityNotFoundException si el sub-sector no existe', async () => {
    await expect(
      useCase.execute({ name: 'Harina', unitOfMeasure: 'KG', storageLocationId: 'sec-fantasma' })
    ).rejects.toThrow(EntityNotFoundException);
  });

  it('rechaza con EntityNotFoundException si el sector es de tipo KITCHEN, no WAREHOUSE', async () => {
    await expect(
      useCase.execute({ name: 'Harina', unitOfMeasure: 'KG', storageLocationId: 'loc-2' })
    ).rejects.toThrow(EntityNotFoundException);
  });
});
