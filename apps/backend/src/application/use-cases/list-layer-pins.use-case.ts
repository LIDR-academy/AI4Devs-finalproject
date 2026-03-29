import { IPinRepository } from '@/domain/repositories/pin.repository';
import { Pin } from '@/domain/entities/pin.entity';

export interface ListLayerPinsOptions {
  status?: 'OPEN' | 'RESOLVED' | 'ALL';
  includeDeleted?: boolean;
}

export class ListLayerPinsUseCase {
  constructor(private pinRepository: IPinRepository) {}

  async execute(layerId: string, options: ListLayerPinsOptions = {}): Promise<Pin[]> {
    const { status = 'ALL', includeDeleted = false } = options;

    let pins: Pin[];

    if (status === 'ALL') {
      pins = await this.pinRepository.findByLayerId(layerId, includeDeleted);
    } else {
      pins = await this.pinRepository.findByLayerIdWithStatus(layerId, status);
    }

    if (!includeDeleted) {
      pins = pins.filter(p => !p.isDeleted());
    }

    return pins;
  }
}
