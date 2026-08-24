import { IRemanenteRepository } from '../../../domain/stock/repositories/IRemanenteRepository.js';
import { DecimalQuantity } from '../../../domain/stock/value-objects/DecimalQuantity.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';

export interface ConsumeRemanenteDTO {
  remanenteId: string;
  quantityToConsume: number | string;
}

export interface ConsumptionResponseDTO {
  remanenteId: string;
  consumedQuantity: string;
  remainingQuantity: string;
  status: string;
  isExhausted: boolean;
}

export class ConsumeRemanenteUseCase {
  constructor(private readonly remanenteRepository: IRemanenteRepository) {}

  public async execute(dto: ConsumeRemanenteDTO): Promise<ConsumptionResponseDTO> {
    const remanente = await this.remanenteRepository.findRemanenteById(dto.remanenteId);
    if (!remanente) {
      throw new EntityNotFoundException('Remanente', dto.remanenteId);
    }

    const qtyToConsume = new DecimalQuantity(dto.quantityToConsume);

    // Ejecutar consumo en dominio (valida exceso y cambia a EXHAUSTED si queda 0)
    remanente.consumeQuantity(qtyToConsume);

    // Persistir remanente actualizado
    await this.remanenteRepository.saveRemanente(remanente);

    // Registrar auditoria de consumo
    await this.remanenteRepository.recordMovement({
      id: `mov-${Date.now()}`,
      insumoId: remanente.insumoId,
      type: 'CONSUMPTION',
      quantity: qtyToConsume.toString(),
      fromLoc: remanente.location,
      toLoc: 'KITCHEN_SERVICE',
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
