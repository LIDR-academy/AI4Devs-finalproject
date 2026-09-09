import { IRemanenteRepository } from '../../../domain/stock/repositories/IRemanenteRepository.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';
import { IdGenerator } from '../../../domain/shared/IdGenerator.js';

export interface DiscardRemanenteDTO {
  remanenteId: string;
  reason: string;
}

export interface DiscardResponseDTO {
  remanenteId: string;
  discardedQuantity: string;
  reason: string;
  status: string;
}

export class DiscardRemanenteUseCase {
  constructor(
    private readonly remanenteRepository: IRemanenteRepository,
    private readonly idGenerator: IdGenerator
  ) {}

  public async execute(dto: DiscardRemanenteDTO): Promise<DiscardResponseDTO> {
    const remanente = await this.remanenteRepository.findRemanenteById(dto.remanenteId);
    if (!remanente) {
      throw new EntityNotFoundException('Remanente', dto.remanenteId);
    }

    // Ejecutar descarte en capa de Dominio
    const discardedQty = remanente.discard();

    // Persistir remanente actualizado
    await this.remanenteRepository.saveRemanente(remanente);

    // Registrar movimiento de auditoria por merma. Antes `` `mov-discard-${Date.now()}` `` —
    // mismo riesgo de colisión de PK que AUDIT-DEV-006 F-3 ya corrigió en otros use cases
    // (TK-099/TK-101), que no cubrieron este caso.
    await this.remanenteRepository.recordMovement({
      id: this.idGenerator.next('mov-discard'),
      insumoId: remanente.insumoId,
      type: `DISCARD_${dto.reason}`,
      quantity: discardedQty.toString(),
      fromLoc: remanente.location,
      toLoc: 'WASTE_BIN',
    });

    return {
      remanenteId: remanente.id,
      discardedQuantity: discardedQty.toString(),
      reason: dto.reason,
      status: remanente.status,
    };
  }
}
