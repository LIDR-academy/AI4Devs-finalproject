import { IStockRepository } from '../../../domain/stock/repositories/IStockRepository.js';
import { IRemanenteQueryRepository } from '../../../domain/kitchen/repositories/IRemanenteQueryRepository.js';
import { IShiftReconciliationRepository } from '../../../domain/kitchen/repositories/IShiftReconciliationRepository.js';
import { ShiftReconciliation, ShiftReconciliationItem } from '../../../domain/kitchen/entities/ShiftReconciliation.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';

export interface PhysicalCountItemInput {
  remanenteId: string;
  physicalQuantity: string;
}

export interface PerformShiftReconciliationInput {
  operatorId: string;
  notes?: string;
  items: PhysicalCountItemInput[];
}

export interface PerformShiftReconciliationResult {
  reconciliationId: string;
  autoDiscardedCount: number;
  processedItemsCount: number;
  items: Array<{
    remanenteId: string;
    insumoId: string;
    physicalQuantity: string;
    theoreticalQuantity: string;
    variance: string;
  }>;
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

    let autoDiscardedCount = 0;

    // 1. Auto-descarte masivo de remanentes vencidos
    for (const dto of activeDTOs) {
      if (dto.expirationDate < now) {
        const remanente = await this.stockRepository.findRemanenteById(dto.id);
        if (remanente && remanente.status === 'ACTIVE') {
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
      }
    }

    // 2. Procesamiento de conteo físico e informe de varianzas
    const reconciliationItems: ShiftReconciliationItem[] = [];
    const responseItems: PerformShiftReconciliationResult['items'] = [];

    for (const itemInput of input.items) {
      const remanente = await this.stockRepository.findRemanenteById(itemInput.remanenteId);
      if (!remanente) {
        continue;
      }

      const theoreticalQuantity = remanente.currentQuantity;
      const physicalQuantity = new DecimalQuantity(itemInput.physicalQuantity);
      const varianceDecimal = physicalQuantity.toDecimal().minus(theoreticalQuantity.toDecimal());

      reconciliationItems.push({
        remanenteId: remanente.id,
        insumoId: remanente.insumoId,
        physicalQuantity,
        theoreticalQuantity,
        variance: varianceDecimal,
      });

      // Actualizar el remanente activo a la cantidad física medida
      if (physicalQuantity.toNumber() === 0) {
        remanente.discard();
      } else {
        const diff = physicalQuantity.toDecimal().minus(theoreticalQuantity.toDecimal());
        if (diff.isNegative()) {
          remanente.consumeQuantity(new DecimalQuantity(diff.abs()));
        }
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

      responseItems.push({
        remanenteId: remanente.id,
        insumoId: remanente.insumoId,
        physicalQuantity: physicalQuantity.toString(),
        theoreticalQuantity: theoreticalQuantity.toString(),
        variance: varianceDecimal.toFixed(3),
      });
    }

    // 3. Crear y guardar objeto de conciliación
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
}
