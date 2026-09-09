import { describe, it, expect, beforeEach } from 'vitest';
import { CreateLocationUseCase } from './CreateLocationUseCase.js';
import { InMemoryLocationRepository } from '../../../infrastructure/stock/repositories/InMemoryLocationRepository.js';
import { IdGenerator } from '../../../domain/shared/IdGenerator.js';

// AUDIT-DEV-006 F-3 / TK-101: mismo fake que RecordExtractionUseCase.test.ts / RestockInsumoUseCase.test.ts.
class SequentialIdGenerator implements IdGenerator {
  private readonly counters = new Map<string, number>();
  next(prefix: string): string {
    const n = (this.counters.get(prefix) ?? 0) + 1;
    this.counters.set(prefix, n);
    return `${prefix}-${n}`;
  }
}

describe('CreateLocationUseCase (TK-101: IdGenerator sweep)', () => {
  let repository: InMemoryLocationRepository;
  let useCase: CreateLocationUseCase;

  beforeEach(() => {
    repository = new InMemoryLocationRepository();
    useCase = new CreateLocationUseCase(repository, new SequentialIdGenerator());
  });

  it('genera el id desde el IdGenerator inyectado cuando no se provee uno explícito', async () => {
    const location = await useCase.execute({ name: 'Congelador de Cocina', type: 'KITCHEN' });

    expect(location.id).toBe('loc-1');

    const saved = await repository.findLocationById('loc-1');
    expect(saved?.name).toBe('Congelador de Cocina');
  });

  it('respeta un id explícito si se provee (no lo pisa el generador)', async () => {
    const location = await useCase.execute({ id: 'loc-custom-id', name: 'Bodega Externa', type: 'WAREHOUSE' });

    expect(location.id).toBe('loc-custom-id');
  });

  it('cada alta sin id explícito consume el siguiente id del generador (sin colisión)', async () => {
    const a = await useCase.execute({ name: 'Área A', type: 'KITCHEN' });
    const b = await useCase.execute({ name: 'Área B', type: 'KITCHEN' });

    expect(a.id).toBe('loc-1');
    expect(b.id).toBe('loc-2');
    expect(a.id).not.toBe(b.id);
  });
});
