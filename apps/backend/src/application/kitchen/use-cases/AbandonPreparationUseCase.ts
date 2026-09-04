import { IRecipePreparationRepository } from '../../../domain/kitchen/repositories/IRecipePreparationRepository.js';
import { IStockUnitOfWork } from '../../../domain/stock/repositories/IStockUnitOfWork.js';
import { Clock } from '../../../domain/shared/Clock.js';
import { withOpenPreparation } from './loadOpenPreparation.js';

export interface AbandonPreparationCommand {
  preparationId: string;
  closedByOperatorId?: string;
}

export interface AbandonPreparationResultDTO {
  id: string;
  status: 'ABANDONED';
  unlinkedRemanentes: number;
  closedAt: string;
}

/**
 * US-028 Escenario 6: cierra una preparación **sin conciliar**. Los remanentes
 * vinculados quedan `ACTIVE`, pierden el `recipePreparationId` (vuelven al pool FEFO)
 * y no se asume merma. Misma frontera transaccional que el cierre (C-DEV-006-1).
 */
export class AbandonPreparationUseCase {
  constructor(
    private readonly preparationRepository: IRecipePreparationRepository,
    private readonly unitOfWork: IStockUnitOfWork,
    private readonly clock: Clock
  ) {}

  async execute(command: AbandonPreparationCommand): Promise<AbandonPreparationResultDTO> {
    const now = this.clock.now();
    return withOpenPreparation(
      {
        repository: this.preparationRepository,
        unitOfWork: this.unitOfWork,
        preparationId: command.preparationId,
      },
      async ({ preparation, remanentes, uow }) => {
        for (const remanente of remanentes) {
          remanente.unlinkFromPreparation();
          await uow.saveRemanente(remanente);
        }

        preparation.abandon(command.closedByOperatorId, now);
        await uow.saveRecipePreparation(preparation);

        return {
          id: preparation.id,
          status: 'ABANDONED' as const,
          unlinkedRemanentes: remanentes.length,
          closedAt: now.toISOString(),
        };
      }
    );
  }
}
