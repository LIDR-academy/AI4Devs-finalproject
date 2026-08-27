import { StorageLocation } from '../entities/StorageLocation.js';

export interface IStorageLocationRepository {
  findAllLocations(): Promise<StorageLocation[]>;
  findLocationById(id: string): Promise<StorageLocation | null>;
  saveLocation(location: StorageLocation): Promise<void>;
  deleteLocation(id: string): Promise<void>;
}
