import { IRemanenteQueryRepository } from '../../../domain/kitchen/repositories/IRemanenteQueryRepository.js';

export interface RemanenteFEFOResponseDTO {
  id: string;
  insumoId: string;
  insumoName: string;
  unitOfMeasure: string;
  currentQuantity: string;
  initialQuantity: string;
  location: string;
  storageLocationId?: string;
  storageLocationName: string;
  expirationDate: string;
  hoursRemaining: number;
  isCriticalAlert: boolean;
  status: string;
}

export class GetActiveRemanentesUseCase {
  constructor(private readonly remanenteQueryRepository: IRemanenteQueryRepository) {}

  public async execute(storageLocationId?: string, insumoId?: string): Promise<RemanenteFEFOResponseDTO[]> {
    const rawRemanentes = await this.remanenteQueryRepository.findActiveRemanentes(storageLocationId, insumoId);
    const now = new Date();

    return rawRemanentes.map((item) => {
      const diffMs = item.expirationDate.getTime() - now.getTime();
      const hoursRemaining = Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10);
      const isCriticalAlert = hoursRemaining < 24;

      return {
        id: item.id,
        insumoId: item.insumoId,
        insumoName: item.insumoName,
        unitOfMeasure: item.unitOfMeasure,
        currentQuantity: item.currentQuantity,
        initialQuantity: item.initialQuantity,
        location: item.location,
        storageLocationId: item.storageLocationId,
        storageLocationName: item.storageLocationName ?? item.location,
        expirationDate: item.expirationDate.toISOString(),
        hoursRemaining,
        isCriticalAlert,
        status: item.status,
      };
    });
  }
}
