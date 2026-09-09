import { IRecipePreparationRepository } from '../../../domain/kitchen/repositories/IRecipePreparationRepository.js';
import { IRemanenteQueryRepository } from '../../../domain/kitchen/repositories/IRemanenteQueryRepository.js';
import { RecipePreparation, RecipePreparationStatus } from '../../../domain/kitchen/entities/RecipePreparation.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';

export interface RecipePreparationSummaryDTO {
  id: string;
  recipeId: string;
  plannedPortions: number;
  actualPortions: number | null;
  status: RecipePreparationStatus;
  openedByOperatorId: string | null;
  openedAt: string;
  closedByOperatorId: string | null;
  closedAt: string | null;
  notes: string | null;
}

interface RecipePreparationLinkedRemanenteDTO {
  id: string;
  insumoId: string;
  insumoName: string;
  currentQuantity: string;
  initialQuantity: string;
  storageLocationId: string | null;
  storageLocationName: string;
  /** US-028: `true` mientras no se haya consumido nada — habilita "devolver a bodega" en el cierre. */
  isPristine: boolean;
  status: string;
}

export interface RecipePreparationDetailDTO extends RecipePreparationSummaryDTO {
  remanentes: RecipePreparationLinkedRemanenteDTO[];
}

function toSummary(p: RecipePreparation): RecipePreparationSummaryDTO {
  return {
    id: p.id,
    recipeId: p.recipeId,
    plannedPortions: p.plannedPortions,
    actualPortions: p.actualPortions ?? null,
    status: p.status,
    openedByOperatorId: p.openedByOperatorId ?? null,
    openedAt: p.openedAt.toISOString(),
    closedByOperatorId: p.closedByOperatorId ?? null,
    closedAt: p.closedAt ? p.closedAt.toISOString() : null,
    notes: p.notes ?? null,
  };
}

export class GetRecipePreparationsUseCase {
  constructor(
    private readonly preparationRepository: IRecipePreparationRepository,
    private readonly remanenteQueryRepository: IRemanenteQueryRepository
  ) {}

  public async list(status?: string): Promise<RecipePreparationSummaryDTO[]> {
    const allowed: RecipePreparationStatus[] = ['OPEN', 'CLOSED', 'ABANDONED'];
    const filter = allowed.includes(status as RecipePreparationStatus)
      ? (status as RecipePreparationStatus)
      : 'OPEN';
    const preparations = await this.preparationRepository.findByStatus(filter);
    return preparations.map(toSummary);
  }

  public async detail(id: string): Promise<RecipePreparationDetailDTO> {
    const preparation = await this.preparationRepository.findById(id);
    if (!preparation) {
      throw new EntityNotFoundException('Preparación de receta', id);
    }
    // Los remanentes vinculados se obtienen de la vista de remanentes activos filtrada.
    const active = await this.remanenteQueryRepository.findActiveRemanentes();
    const linked = active
      .filter((r) => r.recipePreparationId === id)
      .map((r) => ({
        id: r.id,
        insumoId: r.insumoId,
        insumoName: r.insumoName,
        currentQuantity: r.currentQuantity,
        initialQuantity: r.initialQuantity,
        storageLocationId: r.storageLocationId ?? null,
        storageLocationName: r.storageLocationName ?? r.location,
        isPristine: r.isPristine ?? false,
        status: r.status,
      }));

    return { ...toSummary(preparation), remanentes: linked };
  }
}
