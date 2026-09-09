import { IRemanenteRepository } from '../../../domain/stock/repositories/IRemanenteRepository.js';
import { IConsumptionReasonRepository } from '../../../domain/kitchen/repositories/IConsumptionReasonRepository.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';
import { InactiveConsumptionReasonException } from '../../../domain/kitchen/errors/InactiveConsumptionReasonException.js';

export interface ConsumeRemanenteDTO {
  remanenteId: string;
  quantityToConsume: number | string;
  /** ADR-004 / US-004 / TK-108: motivo estructurado obligatorio (catálogo `US-030`). */
  reasonId: string;
  /** Texto libre, siempre opcional — complementa, nunca reemplaza, el motivo estructurado. */
  notes?: string;
}

export interface ConsumptionResponseDTO {
  remanenteId: string;
  consumedQuantity: string;
  remainingQuantity: string;
  status: string;
  isExhausted: boolean;
}

export class ConsumeRemanenteUseCase {
  constructor(
    private readonly remanenteRepository: IRemanenteRepository,
    private readonly consumptionReasonRepository: IConsumptionReasonRepository
  ) {}

  public async execute(dto: ConsumeRemanenteDTO): Promise<ConsumptionResponseDTO> {
    const remanente = await this.remanenteRepository.findRemanenteById(dto.remanenteId);
    if (!remanente) {
      throw new EntityNotFoundException('Remanente', dto.remanenteId);
    }

    // ADR-004: el motivo se resuelve y valida ANTES de tocar el remanente — un
    // reasonId inexistente o desactivado no debe dejar el consumo a medio aplicar.
    const reason = await this.consumptionReasonRepository.findById(dto.reasonId);
    if (!reason) {
      throw new EntityNotFoundException('Motivo de consumo', dto.reasonId);
    }
    if (!reason.isActive) {
      throw new InactiveConsumptionReasonException(dto.reasonId);
    }

    const qtyToConsume = new DecimalQuantity(dto.quantityToConsume);

    // Ejecutar consumo en dominio (valida exceso y cambia a EXHAUSTED si queda 0)
    remanente.consumeQuantity(qtyToConsume);

    // Persistir remanente actualizado
    await this.remanenteRepository.saveRemanente(remanente);

    // Registrar auditoria de consumo — reasonId (motivo estructurado) + reason (texto libre)
    await this.remanenteRepository.recordMovement({
      id: `mov-${Date.now()}`,
      insumoId: remanente.insumoId,
      type: 'CONSUMPTION',
      quantity: qtyToConsume.toString(),
      fromLoc: remanente.location,
      toLoc: 'KITCHEN_SERVICE',
      reasonId: reason.id,
      reason: dto.notes,
    });

    return {
      remanenteId: remanente.id,
      consumedQuantity: qtyToConsume.toString(),
      remainingQuantity: remanente.currentQuantity.toString(),
      status: remanente.status,
      isExhausted: remanente.status === 'EXHAUSTED',
    };
  }
}
