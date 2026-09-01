import { describe, it, expect, beforeEach } from 'vitest';
import { ListInsumosUseCase } from './ListInsumosUseCase.js';
import { CreateInsumoUseCase } from './CreateInsumoUseCase.js';
import { InMemoryStockRepository } from '../../../infrastructure/stock/repositories/InMemoryStockRepository.js';

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
});
