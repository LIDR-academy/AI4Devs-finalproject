import { describe, it, expect, beforeEach } from 'vitest';
import { ListConsumptionReasonsUseCase } from './ListConsumptionReasonsUseCase.js';
import { CreateConsumptionReasonUseCase } from './CreateConsumptionReasonUseCase.js';
import { UpdateConsumptionReasonUseCase } from './UpdateConsumptionReasonUseCase.js';
import { InMemoryConsumptionReasonRepository } from '../../../infrastructure/kitchen/repositories/InMemoryConsumptionReasonRepository.js';
import { IdGenerator } from '../../../domain/shared/IdGenerator.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';

class SeqIds implements IdGenerator {
  private n = 0;
  next(prefix: string): string {
    this.n += 1;
    return `${prefix}-${this.n}`;
  }
}

describe('Catálogo de motivos de consumo — casos de uso (ADR-004 / US-030)', () => {
  let repo: InMemoryConsumptionReasonRepository;

  beforeEach(() => {
    repo = new InMemoryConsumptionReasonRepository(false); // sin semilla, control total del fixture
  });

  describe('ListConsumptionReasonsUseCase', () => {
    it('sin includeInactive, devuelve solo los motivos activos', async () => {
      const create = new CreateConsumptionReasonUseCase(repo, new SeqIds());
      const active = await create.execute({ label: 'Preparación de plato' });
      const toDeactivate = await create.execute({ label: 'Motivo viejo' });
      await new UpdateConsumptionReasonUseCase(repo).execute({ id: toDeactivate.id, isActive: false });

      const list = new ListConsumptionReasonsUseCase(repo);
      const result = await list.execute();

      expect(result.map((r) => r.id)).toEqual([active.id]);
    });

    it('con includeInactive=true, devuelve también los desactivados', async () => {
      const create = new CreateConsumptionReasonUseCase(repo, new SeqIds());
      const r1 = await create.execute({ label: 'A' });
      const r2 = await create.execute({ label: 'B' });
      await new UpdateConsumptionReasonUseCase(repo).execute({ id: r2.id, isActive: false });

      const result = await new ListConsumptionReasonsUseCase(repo).execute(true);
      expect(result.map((r) => r.id).sort()).toEqual([r1.id, r2.id].sort());
    });
  });

  describe('CreateConsumptionReasonUseCase', () => {
    it('crea un motivo activo con id generado', async () => {
      const useCase = new CreateConsumptionReasonUseCase(repo, new SeqIds());
      const reason = await useCase.execute({ label: 'Degustación / prueba' });
      expect(reason.id).toBe('reason-1');
      expect(reason.label).toBe('Degustación / prueba');
      expect(reason.isActive).toBe(true);
      expect((await repo.findById(reason.id))?.label).toBe('Degustación / prueba');
    });

    it('rechaza una etiqueta vacía (invariante de dominio)', async () => {
      const useCase = new CreateConsumptionReasonUseCase(repo, new SeqIds());
      await expect(useCase.execute({ label: '   ' })).rejects.toThrow(/etiqueta/i);
    });
  });

  describe('UpdateConsumptionReasonUseCase', () => {
    it('edita la etiqueta sin tocar isActive', async () => {
      const created = await new CreateConsumptionReasonUseCase(repo, new SeqIds()).execute({ label: 'Otro' });
      const updated = await new UpdateConsumptionReasonUseCase(repo).execute({ id: created.id, label: 'Otro motivo' });
      expect(updated.label).toBe('Otro motivo');
      expect(updated.isActive).toBe(true);
    });

    it('desactiva sin borrar — sigue resoluble por id (US-030 Escenario 3)', async () => {
      const created = await new CreateConsumptionReasonUseCase(repo, new SeqIds()).execute({ label: 'Cortesía a cliente' });
      const updated = await new UpdateConsumptionReasonUseCase(repo).execute({ id: created.id, isActive: false });
      expect(updated.isActive).toBe(false);
      expect(updated.id).toBe(created.id);
      expect(await repo.findById(created.id)).not.toBeNull();
    });

    it('motivo inexistente → 404', async () => {
      await expect(new UpdateConsumptionReasonUseCase(repo).execute({ id: 'nope', label: 'x' })).rejects.toBeInstanceOf(
        EntityNotFoundException
      );
    });
  });
});
