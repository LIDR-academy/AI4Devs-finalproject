import { IStockRepository } from '../../../domain/stock/repositories/IStockRepository.js';
import { IRemanenteQueryRepository } from '../../../domain/kitchen/repositories/IRemanenteQueryRepository.js';
import { IShiftReconciliationRepository } from '../../../domain/kitchen/repositories/IShiftReconciliationRepository.js';
import { ShiftReconciliation, ShiftReconciliationItem } from '../../../domain/kitchen/entities/ShiftReconciliation.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { ActiveRemanenteDTO } from '../../../domain/kitchen/repositories/IRemanenteQueryRepository.js';

export interface PhysicalCountItemInput {
  remanenteId: string;
  physicalQuantity: string;
}

export interface PerformShiftReconciliationInput {
  operatorId: string;
  notes?: string;
  items: PhysicalCountItemInput[];
}

export interface ReconciledItemResponse {
  remanenteId: string;
  insumoId: string;
  physicalQuantity: string;
  theoreticalQuantity: string;
  variance: string;
}

export interface PerformShiftReconciliationResult {
  reconciliationId: string;
  autoDiscardedCount: number;
  processedItemsCount: number;
  items: ReconciledItemResponse[];
}

export class PerformShiftReconciliationUseCase {
  constructor(
    private readonly stockRepository: IStockRepository,
    private readonly remanenteQueryRepository: IRemanenteQueryRepository,
    private readonly reconciliationRepository: IShiftReconciliationRepository
  ) {}

  public async execute(
    input: PerformShiftReconciliationInput
  ): Promise<PerformShiftReconciliationResult> {
    const now = new Date();
    const activeDTOs = await this.remanenteQueryRepository.findActiveRemanentes();

    const autoDiscardedCount = await this.autoDiscardExpiredRemanentes(activeDTOs, now);

    const reconciliationItems: ShiftReconciliationItem[] = [];
    const responseItems: ReconciledItemResponse[] = [];
    for (const itemInput of input.items) {
      const reconciled = await this.reconcilePhysicalCount(itemInput);
      if (!reconciled) {
        continue;
      }
      reconciliationItems.push(reconciled.reconciliationItem);
      responseItems.push(reconciled.responseItem);
    }

    const reconciliationId = `recon-${Date.now()}`;
    const reconciliation = new ShiftReconciliation({
      id: reconciliationId,
      shiftDate: now,
      operatorId: input.operatorId,
      notes: input.notes,
      items: reconciliationItems,
    });
    await this.reconciliationRepository.save(reconciliation);

    return {
      reconciliationId,
      autoDiscardedCount,
      processedItemsCount: responseItems.length,
      items: responseItems,
    };
  }

  // Auto-descarte masivo de remanentes vencidos, previo al conteo físico
  private async autoDiscardExpiredRemanentes(activeDTOs: ActiveRemanenteDTO[], now: Date): Promise<number> {
    let autoDiscardedCount = 0;

    for (const dto of activeDTOs) {
      if (dto.expirationDate >= now) {
        continue;
      }
      const remanente = await this.stockRepository.findRemanenteById(dto.id);
      if (!remanente || remanente.status !== 'ACTIVE') {
        continue;
      }

      const quantityDiscarded = remanente.discard();
      await this.stockRepository.saveRemanente(remanente);
      await this.stockRepository.recordMovement({
        id: `mov-autodiscard-${Date.now()}-${remanente.id}`,
        insumoId: remanente.insumoId,
        type: 'DISCARD',
        quantity: quantityDiscarded.toString(),
        fromLoc: remanente.location,
        toLoc: 'WASTE',
      });
      autoDiscardedCount++;
    }

    return autoDiscardedCount;
  }

  // Aplica el conteo físico de un remanente, calcula varianza y ajusta el stock
  private async reconcilePhysicalCount(
    itemInput: PhysicalCountItemInput
  ): Promise<{ reconciliationItem: ShiftReconciliationItem; responseItem: ReconciledItemResponse } | null> {
    const remanente = await this.stockRepository.findRemanenteById(itemInput.remanenteId);
    if (!remanente) {
      return null;
    }

    const theoreticalQuantity = remanente.currentQuantity;
    const physicalQuantity = new DecimalQuantity(itemInput.physicalQuantity);
    const varianceDecimal = physicalQuantity.toDecimal().minus(theoreticalQuantity.toDecimal());

    // Actualizar el remanente activo a la cantidad física medida
    if (physicalQuantity.toNumber() === 0) {
      remanente.discard();
    } else if (varianceDecimal.isNegative()) {
      remanente.consumeQuantity(new DecimalQuantity(varianceDecimal.abs()));
    }
    await this.stockRepository.saveRemanente(remanente);

    if (!varianceDecimal.isZero()) {
      await this.stockRepository.recordMovement({
        id: `mov-recon-${Date.now()}-${remanente.id}`,
        insumoId: remanente.insumoId,
        type: 'SHIFT_RECONCILIATION_VARIANCE',
        quantity: varianceDecimal.toFixed(3),
        fromLoc: remanente.location,
        toLoc: 'KITCHEN_ADJUSTMENT',
      });
    }

    return {
      reconciliationItem: {
        remanenteId: remanente.id,
        insumoId: remanente.insumoId,
        physicalQuantity,
        theoreticalQuantity,
        variance: varianceDecimal,
      },
      responseItem: {
        remanenteId: remanente.id,
        insumoId: remanente.insumoId,
        physicalQuantity: physicalQuantity.toString(),
        theoreticalQuantity: theoreticalQuantity.toString(),
        variance: varianceDecimal.toFixed(3),
      },
    };
  }
}
