import { describe, it, expect, beforeEach } from 'vitest';
import { GetRecipePreparationsUseCase } from './GetRecipePreparationsUseCase.js';
import { IRecipePreparationRepository } from '../../../domain/kitchen/repositories/IRecipePreparationRepository.js';
import { RecipePreparation, RecipePreparationStatus } from '../../../domain/kitchen/entities/RecipePreparation.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';
import { ActiveRemanenteDTO, IRemanenteQueryRepository } from '../../../domain/kitchen/repositories/IRemanenteQueryRepository.js';

const NOW = new Date('2026-02-01T12:00:00.000Z');

class FakePrepRepo implements IRecipePreparationRepository {
  public byId = new Map<string, RecipePreparation>();
  public byStatusCalls: RecipePreparationStatus[] = [];
  async save(): Promise<void> {}
  async findById(id: string): Promise<RecipePreparation | null> {
    return this.byId.get(id) ?? null;
  }
  async findByStatus(status: RecipePreparationStatus): Promise<RecipePreparation[]> {
    this.byStatusCalls.push(status);
    return Array.from(this.byId.values()).filter((p) => p.status === status);
  }
}

class FakeQueryRepo implements IRemanenteQueryRepository {
  constructor(private readonly items: Partial<ActiveRemanenteDTO>[] = []) {}
  async findActiveRemanentes(): Promise<ActiveRemanenteDTO[]> {
    return this.items.map((it) => ({
      id: it.id ?? 'r',
      insumoId: it.insumoId ?? 'ins',
      insumoName: it.insumoName ?? 'Insumo',
      unitOfMeasure: 'KG',
      currentQuantity: it.currentQuantity ?? '1.000',
      initialQuantity: it.initialQuantity ?? '1.000',
      location: it.location ?? 'KITCHEN_FRIDGE',
      storageLocationName: it.storageLocationName,
      recipePreparationId: it.recipePreparationId,
      expirationDate: NOW,
      status: it.status ?? 'ACTIVE',
      createdAt: NOW,
    }));
  }
}

function openPrep(id: string): RecipePreparation {
  return RecipePreparation.openNew(id, `rec-of-${id}`, 4, 'op-1', NOW);
}
function closedPrep(id: string): RecipePreparation {
  return new RecipePreparation({
    id,
    recipeId: `rec-of-${id}`,
    plannedPortions: 4,
    status: 'CLOSED',
    openedByOperatorId: undefined,
    openedAt: NOW,
    actualPortions: undefined,
    closedByOperatorId: undefined,
    closedAt: undefined,
    notes: undefined,
  });
}

describe('GetRecipePreparationsUseCase', () => {
  let prepRepo: FakePrepRepo;

  beforeEach(() => {
    prepRepo = new FakePrepRepo();
  });

  it('list() por defecto pide OPEN', async () => {
    prepRepo.byId.set('p1', openPrep('p1'));
    const uc = new GetRecipePreparationsUseCase(prepRepo, new FakeQueryRepo());
    const res = await uc.list();
    expect(prepRepo.byStatusCalls).toEqual(['OPEN']);
    expect(res).toHaveLength(1);
    expect(res[0].id).toBe('p1');
    expect(res[0].status).toBe('OPEN');
  });

  it('list() respeta cada status válido', async () => {
    const uc = new GetRecipePreparationsUseCase(prepRepo, new FakeQueryRepo());
    await uc.list('CLOSED');
    await uc.list('ABANDONED');
    expect(prepRepo.byStatusCalls).toEqual(['CLOSED', 'ABANDONED']);
  });

  it('list() con un status inválido cae a OPEN', async () => {
    const uc = new GetRecipePreparationsUseCase(prepRepo, new FakeQueryRepo());
    await uc.list('PENDIENTE');
    expect(prepRepo.byStatusCalls).toEqual(['OPEN']);
  });

  it('list() mapea los campos nulables a null', async () => {
    prepRepo.byId.set('c1', closedPrep('c1'));
    const uc = new GetRecipePreparationsUseCase(prepRepo, new FakeQueryRepo());
    const [dto] = await uc.list('CLOSED');
    expect(dto.actualPortions).toBeNull();
    expect(dto.closedByOperatorId).toBeNull();
    expect(dto.closedAt).toBeNull();
    expect(dto.notes).toBeNull();
    expect(dto.openedByOperatorId).toBeNull();
  });

  it('detail() 404 si no existe', async () => {
    const uc = new GetRecipePreparationsUseCase(prepRepo, new FakeQueryRepo());
    await expect(uc.detail('nope')).rejects.toBeInstanceOf(EntityNotFoundException);
  });

  it('detail() incluye SOLO los remanentes enlazados a esa preparación', async () => {
    prepRepo.byId.set('p1', openPrep('p1'));
    const query = new FakeQueryRepo([
      { id: 'rem-a', insumoId: 'ins-1', recipePreparationId: 'p1', storageLocationName: 'Mesa de Preparación' },
      { id: 'rem-b', insumoId: 'ins-2', recipePreparationId: 'otra-prep' },
      { id: 'rem-c', insumoId: 'ins-3', recipePreparationId: undefined },
    ]);
    const uc = new GetRecipePreparationsUseCase(prepRepo, query);
    const detail = await uc.detail('p1');
    expect(detail.remanentes.map((r) => r.id)).toEqual(['rem-a']);
    expect(detail.remanentes[0].storageLocationName).toBe('Mesa de Preparación');
  });

  it('detail(): storageLocationName cae a `location` si no viene resuelto', async () => {
    prepRepo.byId.set('p1', openPrep('p1'));
    const query = new FakeQueryRepo([
      { id: 'rem-a', recipePreparationId: 'p1', storageLocationName: undefined, location: 'KITCHEN_LINE' },
    ]);
    const uc = new GetRecipePreparationsUseCase(prepRepo, query);
    const detail = await uc.detail('p1');
    expect(detail.remanentes[0].storageLocationName).toBe('KITCHEN_LINE');
  });
});
