import { describe, it, expect, beforeEach } from 'vitest';
import { FindInsumoByBarcodeUseCase } from './FindInsumoByBarcodeUseCase.js';
import { CreateInsumoUseCase } from './CreateInsumoUseCase.js';
import { RestockInsumoUseCase } from './RestockInsumoUseCase.js';
import { InMemoryStockRepository } from '../../../infrastructure/stock/repositories/InMemoryStockRepository.js';
import { InMemoryLocationRepository } from '../../../infrastructure/stock/repositories/InMemoryLocationRepository.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';
import { InsumoAlreadyExistsException } from '../../../domain/stock/errors/InsumoAlreadyExistsException.js';
import { cryptoIdGenerator } from '../../../infrastructure/shared/cryptoIdGenerator.js';

describe('FindInsumoByBarcodeUseCase (TK-119 / US-032)', () => {
  let repository: InMemoryStockRepository;
  let createInsumoUseCase: CreateInsumoUseCase;
  let findByBarcodeUseCase: FindInsumoByBarcodeUseCase;

  beforeEach(() => {
    repository = new InMemoryStockRepository();
    createInsumoUseCase = new CreateInsumoUseCase(repository);
    findByBarcodeUseCase = new FindInsumoByBarcodeUseCase(repository);
  });

  it('encuentra el insumo cuyo barcode coincide exactamente', async () => {
    const insumo = await createInsumoUseCase.execute({
      name: 'Leche Entera 1L',
      unitOfMeasure: 'L',
      barcode: '7791234567890',
    });

    const result = await findByBarcodeUseCase.execute({ barcode: '7791234567890' });

    expect(result.id).toBe(insumo.id);
    expect(result.barcode).toBe('7791234567890');
  });

  it('lanza EntityNotFoundException si ningun insumo tiene ese barcode', async () => {
    await expect(findByBarcodeUseCase.execute({ barcode: '0000000000000' })).rejects.toThrow(
      EntityNotFoundException
    );
  });

  it('CreateInsumoUseCase rechaza un barcode duplicado con InsumoAlreadyExistsException', async () => {
    await createInsumoUseCase.execute({
      name: 'Aceite de Oliva',
      unitOfMeasure: 'L',
      barcode: '7799999999999',
    });

    await expect(
      createInsumoUseCase.execute({
        name: 'Aceite de Oliva Premium',
        unitOfMeasure: 'L',
        barcode: '7799999999999',
      })
    ).rejects.toThrow(InsumoAlreadyExistsException);
  });

  it('permite crear insumos sin barcode (campo opcional, retrocompatible)', async () => {
    const insumo = await createInsumoUseCase.execute({ name: 'Sal Fina', unitOfMeasure: 'KG' });
    expect(insumo.barcode).toBeNull();
  });

  it('recorta espacios del barcode al crear, para que un escaneo real (sin espacios) siga encontrando el match (FASE 4.B)', async () => {
    await createInsumoUseCase.execute({
      name: 'Yogur Natural',
      unitOfMeasure: 'UNITS',
      barcode: '  7790005556667  ',
    });

    const result = await findByBarcodeUseCase.execute({ barcode: '7790005556667' });
    expect(result.name).toBe('Yogur Natural');
  });

  it('resuelve el nombre real del sub-sector en stockByLocation, no el id crudo (FASE 4.B)', async () => {
    const locationRepository = new InMemoryLocationRepository();
    const useCaseWithLocations = new FindInsumoByBarcodeUseCase(repository, locationRepository);
    await createInsumoUseCase.execute({
      name: 'Tomate Perita',
      unitOfMeasure: 'KG',
      barcode: '7790001112223',
      initialWarehouseStock: '5.000',
      storageLocationId: 'loc-1',
    });

    const result = await useCaseWithLocations.execute({ barcode: '7790001112223' });

    expect(result.stockByLocation).toEqual([
      { storageLocationId: 'loc-1', storageLocationName: 'MAIN_WAREHOUSE', quantity: '5.000' },
    ]);
  });

  it('conserva el barcode tras un reabastecimiento (FASE 4.B — InMemoryStockRepository reconstruía el agregado sin él)', async () => {
    const restockUseCase = new RestockInsumoUseCase(repository, repository, cryptoIdGenerator);
    const insumo = await createInsumoUseCase.execute({
      name: 'Manteca',
      unitOfMeasure: 'KG',
      barcode: '7790009998887',
      initialWarehouseStock: '2.000',
    });

    await restockUseCase.execute({ insumoId: insumo.id, quantity: '3.000' });

    const result = await findByBarcodeUseCase.execute({ barcode: '7790009998887' });
    expect(result.warehouseStock).toBe('5.000');
  });
});
