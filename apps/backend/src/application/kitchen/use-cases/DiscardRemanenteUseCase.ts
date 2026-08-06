import { IStockRepository } from '../../../domain/stock/repositories/IStockRepository.js';
import { EntityNotFoundException } from '../../../domain/errors/EntityNotFoundException.js';

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
  constructor(private readonly stockRepository: IStockRepository) {}

  public async execute(dto: DiscardRemanenteDTO): Promise<DiscardResponseDTO> {
    const remanente = await this.stockRepository.findRemanenteById(dto.remanenteId);
    if (!remanente) {
      throw new EntityNotFoundException('Remanente', dto.remanenteId);
    }

    // Ejecutar descarte en capa de Dominio
    const discardedQty = remanente.discard();

    // Persistir remanente actualizado
    await this.stockRepository.saveRemanente(remanente);

    // Registrar movimiento de auditoria por merma
    await this.stockRepository.recordMovement({
      id: `mov-discard-${Date.now()}`,
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
