import { IStorageLocationRepository } from '../../../domain/stock/repositories/IStorageLocationRepository.js';
import { StorageLocation, LocationType } from '../../../domain/stock/entities/StorageLocation.js';

export interface CreateLocationCommand {
  id?: string;
  name: string;
  type: LocationType;
  description?: string;
}

export class CreateLocationUseCase {
  constructor(private locationRepository: IStorageLocationRepository) {}

  async execute(command: CreateLocationCommand): Promise<StorageLocation> {
    const location = new StorageLocation({
      id: command.id || `loc-${Date.now()}`,
      name: command.name,
      type: command.type,
      description: command.description,
      isActive: true,
    });

    await this.locationRepository.saveLocation(location);
    return location;
  }
}
