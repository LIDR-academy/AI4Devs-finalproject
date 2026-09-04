import Decimal from 'decimal.js';
import { IRemanenteRepository } from '../../../domain/stock/repositories/IRemanenteRepository.js';
import { IRemanenteQueryRepository } from '../../../domain/kitchen/repositories/IRemanenteQueryRepository.js';
import { IShiftReconciliationRepository } from '../../../domain/kitchen/repositories/IShiftReconciliationRepository.js';
import { IConsumptionReasonRepository } from '../../../domain/kitchen/repositories/IConsumptionReasonRepository.js';
import { ShiftReconciliation, ShiftReconciliationItem } from '../../../domain/kitchen/entities/ShiftReconciliation.js';
import { Remanente } from '../../../domain/stock/entities/Remanente.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { ActiveRemanenteDTO } from '../../../domain/kitchen/repositories/IRemanenteQueryRepository.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';
import { InactiveConsumptionReasonException } from '../../../domain/kitchen/errors/InactiveConsumptionReasonException.js';
import { ConsumptionReasonRequiredException } from '../../../domain/kitchen/errors/ConsumptionReasonRequiredException.js';

export interface PhysicalCountItemInput {
  remanenteId: string;
  physicalQuantity: string;
  /** ADR-004 / US-008 / TK-109: obligatorio solo cuando la varianza resulta negativa. */
  reasonId?: string;
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

// Fase 1 (validación, sin efectos secundarios): remanente resuelto + varianza calculada,
// listo para la fase 2 (aplicación) — ver nota de atomicidad en el constructor.
interface PreparedReconciliationItem {
  remanente: Remanente;
  physicalQuantity: DecimalQuantity;
  theoreticalQuantity: DecimalQuantity;
  varianceDecimal: Decimal;
  reasonId?: string;
}

export class PerformShiftReconciliationUseCase {
  constructor(
    private readonly remanenteRepository: IRemanenteRepository,
    private readonly remanenteQueryRepository: IRemanenteQueryRepository,
    private readonly reconciliationRepository: IShiftReconciliationRepository,
    private readonly consumptionReasonRepository: IConsumptionReasonRepository
  ) {}

  public async execute(
    input: PerformShiftReconciliationInput
  ): Promise<PerformShiftReconciliationResult> {
    const now = new Date();
    const activeDTOs = await this.remanenteQueryRepository.findActiveRemanentes();

    const autoDiscardedCount = await this.autoDiscardExpiredRemanentes(activeDTOs, now);

    // ADR-004 / TK-109: este caso de uso escribe remanente-por-remanente sin
    // IStockUnitOfWork (deuda preexistente, fuera de alcance de ADR-004). Para que
    // un reasonId faltante en la línea N no deje aplicadas las líneas 1..N-1, TODAS
    // las líneas se resuelven y validan primero (fase de solo-lectura) y solo
    // después, si ninguna falló, se aplican las mutaciones (fase de escritura).
    const prepared = await this.prepareReconciliationItems(input.items);

    const reconciliationItems: ShiftReconciliationItem[] = [];
    const responseItems: ReconciledItemResponse[] = [];
    for (const item of prepared) {
      const applied = await this.applyReconciliation(item);
      reconciliationItems.push(applied.reconciliationItem);
      responseItems.push(applied.responseItem);
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
      const remanente = await this.remanenteRepository.findRemanenteById(dto.id);
      if (!remanente || remanente.status !== 'ACTIVE') {
        continue;
      }

      const quantityDiscarded = remanente.discard();
      await this.remanenteRepository.saveRemanente(remanente);
      await this.remanenteRepository.recordMovement({
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

  // Fase 1 — resuelve remanente + calcula varianza + valida el motivo de las líneas con
  // varianza negativa. No muta nada: si una línea falla, ninguna de las anteriores llegó
  // a aplicarse tampoco.
  private async prepareReconciliationItems(items: PhysicalCountItemInput[]): Promise<PreparedReconciliationItem[]> {
    const prepared: PreparedReconciliationItem[] = [];

    for (const itemInput of items) {
      const remanente = await this.remanenteRepository.findRemanenteById(itemInput.remanenteId);
      if (!remanente) {
        continue;
      }

      const theoreticalQuantity = remanente.currentQuantity;
      const physicalQuantity = new DecimalQuantity(itemInput.physicalQuantity);
      const varianceDecimal = physicalQuantity.toDecimal().minus(theoreticalQuantity.toDecimal());

      if (varianceDecimal.isNegative()) {
        await this.assertValidReason(remanente.id, itemInput.reasonId);
      }

      prepared.push({ remanente, physicalQuantity, theoreticalQuantity, varianceDecimal, reasonId: itemInput.reasonId });
    }

    return prepared;
  }

  private async assertValidReason(remanenteId: string, reasonId: string | undefined): Promise<void> {
    if (!reasonId) {
      throw new ConsumptionReasonRequiredException(remanenteId);
    }
    const reason = await this.consumptionReasonRepository.findById(reasonId);
    if (!reason) {
      throw new EntityNotFoundException('Motivo de consumo', reasonId);
    }
    if (!reason.isActive) {
      throw new InactiveConsumptionReasonException(reasonId);
    }
  }

  // Fase 2 — aplica el conteo físico ya validado: ajusta el stock y registra el movimiento.
  private async applyReconciliation(
    item: PreparedReconciliationItem
  ): Promise<{ reconciliationItem: ShiftReconciliationItem; responseItem: ReconciledItemResponse }> {
    const { remanente, physicalQuantity, theoreticalQuantity, varianceDecimal, reasonId } = item;

    // Actualizar el remanente activo a la cantidad física medida
    if (physicalQuantity.toNumber() === 0) {
      remanente.discard();
    } else if (varianceDecimal.isNegative()) {
      remanente.consumeQuantity(new DecimalQuantity(varianceDecimal.abs()));
    } else if (varianceDecimal.isPositive()) {
      // TK-109: bugfix — el superávit encontrado en el conteo físico ahora sincroniza
      // Remanente.currentQuantity (antes solo quedaba en el StockMovement de auditoría).
      remanente.increaseQuantity(new DecimalQuantity(varianceDecimal));
    }
    await this.remanenteRepository.saveRemanente(remanente);

    if (!varianceDecimal.isZero()) {
      await this.remanenteRepository.recordMovement({
        id: `mov-recon-${Date.now()}-${remanente.id}`,
        insumoId: remanente.insumoId,
        type: 'SHIFT_RECONCILIATION_VARIANCE',
        quantity: varianceDecimal.toFixed(3),
        fromLoc: remanente.location,
        toLoc: 'KITCHEN_ADJUSTMENT',
        // Solo la varianza negativa exige motivo (§ assertValidReason); una positiva
        // puede o no traer reasonId — se registra igual si vino, sin exigirlo.
        reasonId: varianceDecimal.isNegative() ? reasonId : undefined,
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
