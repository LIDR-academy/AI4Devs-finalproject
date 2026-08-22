import { describe, it, expect, beforeEach } from 'vitest';
import { CreateInsumoUseCase } from './CreateInsumoUseCase.js';
import { InMemoryStockRepository } from '../../../infrastructure/stock/repositories/InMemoryStockRepository.js';
import { InsumoAlreadyExistsException } from '../../../domain/stock/errors/InsumoAlreadyExistsException.js';

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
});
