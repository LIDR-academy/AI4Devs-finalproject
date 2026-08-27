import { IStorageLocationRepository } from '../../../domain/stock/repositories/IStorageLocationRepository.js';
import { StorageLocation } from '../../../domain/stock/entities/StorageLocation.js';

export class GetLocationsUseCase {
  constructor(private locationRepository: IStorageLocationRepository) {}

  async execute(): Promise<StorageLocation[]> {
    return this.locationRepository.findAllLocations();
  }
}
