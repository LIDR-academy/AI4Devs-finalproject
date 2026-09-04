import { IStorageLocationRepository } from '../../../domain/stock/repositories/IStorageLocationRepository.js';
import { StorageLocation, LocationType } from '../../../domain/stock/entities/StorageLocation.js';
import { IdGenerator } from '../../../domain/shared/IdGenerator.js';

export interface CreateLocationCommand {
  id?: string;
  name: string;
  type: LocationType;
  description?: string;
}

export class CreateLocationUseCase {
  constructor(
    private locationRepository: IStorageLocationRepository,
    // AUDIT-DEV-006 F-3 / TK-101: reemplaza `loc-${Date.now()}` (colisiona en el mismo
    // milisegundo ante reintento/doble submit).
    private readonly idGenerator: IdGenerator
  ) {}

  async execute(command: CreateLocationCommand): Promise<StorageLocation> {
    const location = new StorageLocation({
      id: command.id || this.idGenerator.next('loc'),
      name: command.name,
      type: command.type,
      description: command.description,
      isActive: true,
    });

    await this.locationRepository.saveLocation(location);
    return location;
  }
}
