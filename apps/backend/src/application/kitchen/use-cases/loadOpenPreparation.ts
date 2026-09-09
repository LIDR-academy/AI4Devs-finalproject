import { IRecipePreparationRepository } from '../../../domain/kitchen/repositories/IRecipePreparationRepository.js';
import { RecipePreparation } from '../../../domain/kitchen/entities/RecipePreparation.js';
import {
  IStockUnitOfWork,
  PreparationCloseUnitOfWork,
} from '../../../domain/stock/repositories/IStockUnitOfWork.js';
import { Remanente } from '../../../domain/stock/entities/Remanente.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';
import { PreparationNotOpenException } from '../../../domain/kitchen/errors/PreparationNotOpenException.js';

/**
 * US-028: carga una preparación que debe existir y estar `OPEN`. Compartido por
 * `ClosePreparationUseCase` y `AbandonPreparationUseCase` (misma precondición).
 */
async function loadOpenPreparation(
  repository: IRecipePreparationRepository,
  preparationId: string
): Promise<RecipePreparation> {
  const preparation = await repository.findById(preparationId);
  if (!preparation) {
    throw new EntityNotFoundException('RecipePreparation', preparationId);
  }
  if (!preparation.isOpen) {
    throw new PreparationNotOpenException(preparation.id, preparation.status);
  }
  return preparation;
}

/**
 * US-028: esqueleto común del cierre y el abandono — valida la precondición `OPEN`,
 * abre la frontera transaccional y carga los remanentes vinculados. El `work`
 * específico (conciliar por ingrediente / desvincular) recibe ese contexto.
 */
export async function withOpenPreparation<T>(
  deps: { repository: IRecipePreparationRepository; unitOfWork: IStockUnitOfWork; preparationId: string },
  work: (ctx: {
    preparation: RecipePreparation;
    remanentes: Remanente[];
    uow: PreparationCloseUnitOfWork;
  }) => Promise<T>
): Promise<T> {
  const preparation = await loadOpenPreparation(deps.repository, deps.preparationId);
  return deps.unitOfWork.runPreparationClose(async (uow) => {
    const remanentes = await uow.findRemanentesByPreparation(preparation.id);
    return work({ preparation, remanentes, uow });
  });
}
